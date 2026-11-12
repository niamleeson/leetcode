import { createHash } from 'node:crypto';
import { lstatSync, mkdirSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import path from 'node:path';

export const GENERATIONS_TO_KEEP = 6;
export const MANIFEST_NAME = 'asset-generations.json';

function validName(name) {
  return typeof name === 'string' && name.length > 0 && !name.includes('\\') && !name.includes('\0') &&
    !path.posix.isAbsolute(name) && name.split('/').every(part => part && part !== '.' && part !== '..');
}

export function requireName(name) {
  if (!validName(name)) throw new Error(`Unsafe retained asset path: ${JSON.stringify(name)}`);
}

export function readAssets(outputDirectory) {
  const assets = new Map();
  const root = path.join(outputDirectory, 'assets');
  if (!lstatSync(root, { throwIfNoEntry: false })) return assets;
  const visit = (directory, prefix = '') => {
    if (!lstatSync(directory).isDirectory()) throw new Error(`Asset directory is not a regular directory: ${directory}`);
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const name = prefix + entry.name;
      requireName(name);
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) visit(fullPath, `${name}/`);
      else if (entry.isFile()) assets.set(name, readFileSync(fullPath));
      else throw new Error(`Asset is not a regular file: ${fullPath}`);
    }
  };
  visit(root);
  return assets;
}

export function generationFor(assets) {
  const files = [...assets.keys()].sort();
  const hash = createHash('sha256');
  for (const name of files) {
    requireName(name);
    hash.update(name).update('\0').update(createHash('sha256').update(assets.get(name)).digest()).update('\0');
  }
  return { id: hash.digest('hex'), files };
}

export function readHistory(outputDirectory, { readFiles = readAssets, manifestName = MANIFEST_NAME, validateName = requireName } = {}) {
  const assets = readFiles(outputDirectory);
  const manifestPath = path.join(outputDirectory, manifestName);
  const manifestStat = lstatSync(manifestPath, { throwIfNoEntry: false });
  if (!manifestStat) {
    return { assets, generations: assets.size ? [generationFor(assets)] : [] };
  }
  if (!manifestStat.isFile()) throw new Error(`Retention manifest is not a regular file: ${manifestPath}`);
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  if (manifest.version !== 1 || !Array.isArray(manifest.generations) || manifest.generations.length > GENERATIONS_TO_KEEP) {
    throw new Error('Invalid asset generation manifest');
  }
  const seen = new Set();
  const knownFiles = new Set();
  for (const generation of manifest.generations) {
    if (!generation || !Array.isArray(generation.files) || !generation.files.length || seen.has(generation.id)) {
      throw new Error('Invalid or duplicate asset generation');
    }
    const files = new Map();
    for (const name of generation.files) {
      validateName(name);
      if (!assets.has(name)) throw new Error(`Retained asset is missing: ${name}`);
      if (files.has(name)) throw new Error(`Duplicate retained asset: ${name}`);
      files.set(name, assets.get(name));
      knownFiles.add(name);
    }
    if (generationFor(files).id !== generation.id) throw new Error(`Retained asset content changed: ${generation.id}`);
    seen.add(generation.id);
  }
  if (knownFiles.size !== assets.size) throw new Error('Assets are present outside the generation manifest');
  return { assets, generations: manifest.generations };
}

export function mergeAssets(first, second) {
  const merged = new Map(first);
  for (const [name, content] of second) {
    requireName(name);
    if (merged.has(name) && !merged.get(name).equals(content)) {
      throw new Error(`Asset filename collision with different content: ${name}`);
    }
    merged.set(name, content);
  }
  return merged;
}

function uniqueGenerations(generations) {
  const seen = new Set();
  return generations.filter(generation => {
    if (seen.has(generation.id)) return false;
    seen.add(generation.id);
    return true;
  }).slice(0, GENERATIONS_TO_KEEP);
}

export function writeHistory(outputDirectory, assets, generations, { readFiles = readAssets, manifestName = MANIFEST_NAME, validateName = requireName, directoryPrefix = 'assets' } = {}) {
  const manifestPath = path.join(outputDirectory, manifestName);
  const manifestStat = lstatSync(manifestPath, { throwIfNoEntry: false });
  if (manifestStat && !manifestStat.isFile()) throw new Error(`Retention manifest is not a regular file: ${manifestPath}`);
  generations = uniqueGenerations(generations);
  const selected = new Map();
  for (const generation of generations) {
    for (const name of generation.files) {
      validateName(name);
      if (!assets.has(name)) throw new Error(`Cannot publish missing retained asset: ${name}`);
      selected.set(name, assets.get(name));
    }
  }
  // Validate before writing: hashed names must remain immutable across releases.
  const existing = readFiles(outputDirectory);
  mergeAssets(existing, selected);
  for (const [name, content] of selected) {
    if (existing.has(name)) continue;
    const destination = path.join(outputDirectory, directoryPrefix, name);
    mkdirSync(path.dirname(destination), { recursive: true });
    writeFileSync(destination, content);
  }
  for (const name of existing.keys()) {
    if (!selected.has(name)) unlinkSync(path.join(outputDirectory, directoryPrefix, name));
  }
  mkdirSync(outputDirectory, { recursive: true });
  writeFileSync(manifestPath, `${JSON.stringify({ version: 1, generations }, null, 2)}\n`);
  return { generations: generations.length, restored: [...selected.keys()].filter(name => !existing.has(name)).length };
}

export function retainPreviousAssets(outputDirectory, history) {
  const current = readAssets(outputDirectory);
  if (!current.size) throw new Error('The build did not produce any assets');
  return writeHistory(outputDirectory, mergeAssets(current, history.assets), [generationFor(current), ...history.generations]);
}

// Only the hashed asset directory is retained. Vite still clears the rest of docs,
// so index.html, public data, and removed public files follow the current source.
export function retainDeployedAssets() {
  let outputDirectory;
  let history;
  return {
    name: 'retain-deployed-assets',
    apply: 'build',
    configResolved(config) {
      if (config.build.assetsDir !== 'assets') throw new Error('Asset retention expects build.assetsDir to be assets');
      outputDirectory = path.resolve(config.root, config.build.outDir);
    },
    buildStart() {
      history = readHistory(outputDirectory);
    },
    writeBundle: {
      order: 'post',
      sequential: true,
      handler() {
        const result = retainPreviousAssets(outputDirectory, history);
        this.info(`Kept ${result.generations} asset generations; restored ${result.restored} files for open tabs.`);
      },
    },
  };
}
