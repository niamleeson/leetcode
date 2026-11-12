import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { existsSync, mkdtempSync, mkdirSync, readFileSync, realpathSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { build } from 'vite';
import { GENERATIONS_TO_KEEP, generationFor, retainDeployedAssets } from './retained-assets.mjs';
import { DATA_MANIFEST_NAME, readDataHistory, readImmutableData, retainDeployedData, retainPreviousData } from './retained-data.mjs';

const directories = [];
function temporary() {
  const directory = realpathSync(mkdtempSync(path.join(os.tmpdir(), 'leetcode-data-retention-')));
  directories.push(directory);
  return directory;
}
afterEach(() => { for (const directory of directories.splice(0)) rmSync(directory, { recursive: true, force: true }); });
function write(root, name, content) {
  const destination = path.join(root, name);
  mkdirSync(path.dirname(destination), { recursive: true });
  writeFileSync(destination, content);
}
const revision = index => index.toString(16).padStart(16, '0');
const lesson = (index, language = 'javascript') => `logic/lessons/${revision(index)}/69-${language}.json`;
const solution = index => `solutions/69-${revision(index)}.json`;

test('real Vite builds preserve old lesson and solution JSON but refresh and remove unversioned public files', async () => {
  const root = temporary(), output = path.join(root, 'docs');
  write(root, 'index.html', '<html><body><script type="module" src="/entry.js"></script></body></html>');
  write(root, 'entry.js', 'window.loaded = true;');
  write(root, `public/${lesson(1)}`, '{"lesson":1}');
  write(root, `public/${lesson(1, 'python')}`, '{"python":1}');
  write(root, `public/${solution(1)}`, '{"solution":1}');
  write(root, 'public/logic/lessons/current/69.json', '{"current":1}');
  write(root, 'public/solutions/index.json', '{"current":1}');
  write(root, 'public/solutions/69.json', '{"unversioned":1}');
  write(root, 'public/unrelated.txt', 'remove me');
  const compile = () => build({ root, configFile: false, logLevel: 'silent', plugins: [retainDeployedAssets(), retainDeployedData()], build: { outDir: 'docs' } });
  await compile();
  const first = readDataHistory(output);
  assert.equal(first.assets.size, 3);
  // Simulate the initial migration from a deployment without a data manifest.
  rmSync(path.join(output, DATA_MANIFEST_NAME));
  rmSync(path.join(root, 'public'), { recursive: true });
  write(root, `public/${lesson(2)}`, '{"lesson":2}');
  write(root, `public/${lesson(2, 'python')}`, '{"python":2}');
  write(root, `public/${solution(2)}`, '{"solution":2}');
  write(root, 'public/solutions/index.json', '{"current":2}');
  await compile();
  const second = readDataHistory(output);
  assert.equal(second.generations.length, 2);
  assert.equal(second.assets.size, 6);
  for (const [name, content] of first.assets) assert.deepEqual(second.assets.get(name), content, name);
  assert.equal(readFileSync(path.join(output, 'solutions/index.json'), 'utf8'), '{"current":2}');
  for (const name of ['logic/lessons/current/69.json', 'solutions/69.json', 'unrelated.txt']) assert.equal(existsSync(path.join(output, name)), false, name);
  const before = readFileSync(path.join(output, DATA_MANIFEST_NAME), 'utf8');
  write(root, 'entry.js', 'window.loaded = "UI changed, data did not";');
  await compile();
  assert.equal(readFileSync(path.join(output, DATA_MANIFEST_NAME), 'utf8'), before);
  await compile();
  assert.equal(readFileSync(path.join(output, DATA_MANIFEST_NAME), 'utf8'), before);
});

test('six distinct data generations expire together and shared immutable JSON survives', () => {
  const output = temporary();
  let history = { assets: new Map(), generations: [] };
  for (let index = 1; index <= GENERATIONS_TO_KEEP + 2; index++) {
    rmSync(path.join(output, 'logic'), { recursive: true, force: true });
    rmSync(path.join(output, 'solutions'), { recursive: true, force: true });
    write(output, lesson(index), `{"lesson":${index}}`);
    write(output, solution(index), `{"solution":${index}}`);
    write(output, `solutions/1-${revision(0)}.json`, '{"shared":true}');
    retainPreviousData(output, history);
    history = readDataHistory(output);
  }
  assert.equal(history.generations.length, GENERATIONS_TO_KEEP);
  assert.equal(history.assets.size, GENERATIONS_TO_KEEP * 2 + 1);
  for (const index of [1, 2]) {
    assert.equal(history.assets.has(lesson(index)), false);
    assert.equal(history.assets.has(solution(index)), false);
    assert.equal(existsSync(path.join(output, lesson(index))), false);
  }
  assert.ok(history.assets.has(lesson(3)));
  assert.ok(history.assets.has(solution(3)));
  assert.ok(history.assets.has(`solutions/1-${revision(0)}.json`));
});

test('changed immutable JSON, missing files, unsafe paths, and unversioned manifest entries fail', () => {
  const output = temporary();
  write(output, lesson(1), '{"original":true}');
  retainPreviousData(output, { assets: new Map(), generations: [] });
  const history = readDataHistory(output);
  write(output, lesson(1), '{"changed":true}');
  assert.throws(() => readDataHistory(output), /content changed/);
  assert.throws(() => retainPreviousData(output, history), /filename collision/);
  rmSync(path.join(output, lesson(1)));
  assert.throws(() => readDataHistory(output), /missing/);
  for (const name of ['../outside.json', 'solutions/index.json', `logic/lessons/${revision(1)}/nested/file.json`, 'solutions/69-not-a-hash.json']) {
    write(output, DATA_MANIFEST_NAME, JSON.stringify({version:1, generations:[{id:'bad', files:[name]}]}));
    assert.throws(() => readDataHistory(output), /Unsafe|Not an immutable/);
    const assets = new Map([[name, Buffer.from('{}')]]);
    const id = name.startsWith('../') ? 'bad' : generationFor(assets).id;
    assert.throws(() => retainPreviousData(output, { assets, generations:[{id, files:[name]}] }), /Unsafe|Not an immutable/);
    assert.equal(existsSync(path.join(output, 'solutions/index.json')), false);
  }
});

test('symlinked JSON files, directories, and manifests cannot redirect retained data', () => {
  const outside = temporary();
  write(outside, 'original.json', '{}');
  for (const entry of ['logic', 'logic/lessons', `logic/lessons/${revision(1)}`, 'solutions']) {
    const output = temporary();
    mkdirSync(path.dirname(path.join(output, entry)), { recursive: true });
    symlinkSync(outside, path.join(output, entry));
    assert.throws(() => readImmutableData(output), /not a regular directory/);
  }
  const output = temporary();
  mkdirSync(path.dirname(path.join(output, lesson(1))), { recursive: true });
  symlinkSync(path.join(outside, 'original.json'), path.join(output, lesson(1)));
  assert.throws(() => readImmutableData(output), /not a regular file/);
  rmSync(path.join(output, lesson(1)));
  // Even a dangling manifest link must not create an external target on write.
  symlinkSync(path.join(outside, 'must-not-be-created.json'), path.join(output, DATA_MANIFEST_NAME));
  assert.throws(() => readDataHistory(output), /manifest is not a regular file/);
  assert.throws(() => retainPreviousData(output, { assets: new Map(), generations: [] }), /manifest is not a regular file/);
  assert.equal(existsSync(path.join(outside, 'must-not-be-created.json')), false);
});
