import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { mkdtempSync, mkdirSync, readFileSync, realpathSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { build } from 'vite';
import { GENERATIONS_TO_KEEP, MANIFEST_NAME, generationFor, mergeAssets, readAssets, readHistory, retainDeployedAssets, retainPreviousAssets, writeHistory } from './retained-assets.mjs';

const directories = [];
const temporary = () => {
  const directory = realpathSync(mkdtempSync(path.join(os.tmpdir(), 'leetcode-asset-retention-')));
  directories.push(directory);
  return directory;
};
afterEach(() => { for (const directory of directories.splice(0)) rmSync(directory, { recursive: true, force: true }); });
function write(directory, name, content) {
  const destination = path.join(directory, name);
  mkdirSync(path.dirname(destination), { recursive: true });
  writeFileSync(destination, content);
}
const bytes = entries => new Map(Object.entries(entries).map(([name, content]) => [name, Buffer.from(content)]));

test('real Vite builds retain lazy dependency assets while refreshing the HTML and public files', async () => {
  const root = temporary(), output = path.join(root, 'docs');
  write(root, 'index.html', '<html><body><script type="module" src="/entry.js"></script></body></html>');
  write(root, 'entry.js', 'window.loadFeature = () => import("./feature.js");');
  write(root, 'feature.js', 'import "./feature.css"; import image from "./image.svg"; export const feature = () => "old " + image;');
  write(root, 'feature.css', 'body { background: blue; }');
  write(root, 'image.svg', '<svg xmlns="http://www.w3.org/2000/svg"><circle r="10" /></svg>');
  write(root, 'public/data.json', '{"version":1}');
  write(root, 'public/removed.txt', 'remove on next build');
  const compile = () => build({ root, configFile: false, logLevel: 'silent', plugins: [retainDeployedAssets()], build: { outDir: 'docs', assetsInlineLimit: 0, minify: false } });
  await compile();
  const first = readHistory(output);
  const firstHTML = readFileSync(path.join(output, 'index.html'), 'utf8');
  assert.ok([...first.assets.keys()].some(name => name.endsWith('.css')));
  assert.ok([...first.assets.keys()].some(name => name.endsWith('.svg')));
  assert.ok([...first.assets.keys()].some(name => /^feature-.*\.js$/.test(name)));
  write(root, 'feature.js', 'import "./feature.css"; import image from "./image.svg"; export const feature = () => "new " + image;');
  write(root, 'feature.css', 'body { background: red; }');
  write(root, 'public/data.json', '{"version":2}');
  rmSync(path.join(root, 'public/removed.txt'));
  await compile();
  const second = readHistory(output);
  assert.equal(second.generations.length, 2);
  for (const [name, content] of first.assets) assert.deepEqual(second.assets.get(name), content, name);
  assert.notEqual(readFileSync(path.join(output, 'index.html'), 'utf8'), firstHTML);
  assert.equal(readFileSync(path.join(output, 'data.json'), 'utf8'), '{"version":2}');
  assert.throws(() => readFileSync(path.join(output, 'removed.txt')), /ENOENT/);
  const manifestBefore = readFileSync(path.join(output, MANIFEST_NAME), 'utf8');
  await compile();
  assert.equal(readFileSync(path.join(output, MANIFEST_NAME), 'utf8'), manifestBefore);
  assert.equal(readHistory(output).generations.length, 2);
});

test('retention expires a complete generation, keeping shared dependencies and only six distinct builds', () => {
  const output = temporary();
  let history = { assets: new Map(), generations: [] };
  for (let revision = 0; revision < GENERATIONS_TO_KEEP + 2; revision++) {
    rmSync(path.join(output, 'assets'), { recursive: true, force: true });
    const current = bytes({ [`entry-${revision}.js`]: `import './lazy-${revision}.js'`, [`lazy-${revision}.js`]: 'import "./shared.js"', 'shared.js': 'shared' });
    for (const [name, value] of current) write(output, `assets/${name}`, value);
    retainPreviousAssets(output, history);
    history = readHistory(output);
  }
  assert.equal(history.generations.length, GENERATIONS_TO_KEEP);
  assert.equal(history.assets.size, GENERATIONS_TO_KEEP * 2 + 1);
  assert.equal(history.assets.has('entry-0.js'), false);
  assert.equal(history.assets.has('lazy-1.js'), false);
  assert.equal(history.assets.has('entry-2.js'), true);
  assert.equal(history.assets.has('lazy-2.js'), true);
  assert.equal(history.assets.has('shared.js'), true);
});

test('migration preserves current and old generations including shared assets', () => {
  const output = temporary();
  const current = bytes({ 'current.js': 'current', 'shared.css': 'body{}' });
  const older = bytes({ 'old.js': 'old', 'shared.css': 'body{}', 'nested/old-font.woff': 'font' });
  for (const [name, value] of current) write(output, `assets/${name}`, value);
  const initial = readHistory(output);
  assert.deepEqual(initial.generations, [generationFor(current)]);
  writeHistory(output, mergeAssets(initial.assets, older), [...initial.generations, generationFor(older)]);
  const migrated = readHistory(output);
  assert.equal(migrated.generations.length, 2);
  assert.equal(migrated.assets.size, 4);
  assert.deepEqual(migrated.assets.get('nested/old-font.woff'), Buffer.from('font'));
});

test('different bytes under one asset name fail without overwriting the new build', () => {
  const output = temporary();
  write(output, 'assets/reused.js', 'new');
  const old = bytes({ 'reused.js': 'old' });
  assert.throws(() => retainPreviousAssets(output, { assets: old, generations: [generationFor(old)] }), /filename collision/);
  assert.equal(readFileSync(path.join(output, 'assets/reused.js'), 'utf8'), 'new');
});

test('unsafe manifest paths, changed content, missing dependencies, and symlinks fail before publication', () => {
  const output = temporary();
  const assets = bytes({ 'entry.js': 'original', 'lazy.js': 'lazy' });
  writeHistory(output, assets, [generationFor(assets)]);
  write(output, 'assets/entry.js', 'tampered');
  assert.throws(() => readHistory(output), /content changed/);
  write(output, 'assets/entry.js', 'original');
  rmSync(path.join(output, 'assets/lazy.js'));
  assert.throws(() => readHistory(output), /missing/);
  write(output, MANIFEST_NAME, JSON.stringify({ version: 1, generations: [{ id: 'unsafe', files: ['../outside'] }] }));
  assert.throws(() => readHistory(output), /Unsafe/);
  assert.throws(() => generationFor(bytes({ 'nested/../../outside': 'no' })), /Unsafe/);
  assert.throws(() => generationFor(bytes({ '/absolute': 'no' })), /Unsafe/);
  assert.throws(() => generationFor(bytes({ '..\\outside': 'no' })), /Unsafe/);
  symlinkSync(path.join(output, 'assets/entry.js'), path.join(output, 'assets/link.js'));
  assert.throws(() => readAssets(output), /not a regular file/);
});
