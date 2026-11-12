import { lstatSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { generationFor, mergeAssets, readHistory, requireName, writeHistory } from './retained-assets.mjs';

export const DATA_MANIFEST_NAME = 'data-generations.json';
const revisionName = /^[a-f0-9]{16}$/;
const solutionName = /^\d+-[a-f0-9]{16}\.json$/;
const immutablePath = /^(?:logic\/lessons\/[a-f0-9]{16}\/[^/]+\.json|solutions\/\d+-[a-f0-9]{16}\.json)$/;

function requireDataName(name) {
  requireName(name);
  if (!immutablePath.test(name)) throw new Error(`Not an immutable data path: ${name}`);
}

function entries(directory) {
  const stat = lstatSync(directory, { throwIfNoEntry: false });
  if (!stat) return [];
  if (!stat.isDirectory()) throw new Error(`Data directory is not a regular directory: ${directory}`);
  return readdirSync(directory, { withFileTypes: true });
}

export function readImmutableData(outputDirectory) {
  const assets = new Map();
  function add(name) {
    requireDataName(name);
    const source = path.join(outputDirectory, name);
    if (!lstatSync(source).isFile()) throw new Error(`Data is not a regular file: ${name}`);
    assets.set(name, readFileSync(source));
  }
  // Validate each ancestor before descending so a symlink cannot redirect reads
  // or later restoration writes outside the generated output directory.
  const logic = path.join(outputDirectory, 'logic');
  const logicStat = lstatSync(logic, { throwIfNoEntry: false });
  if (logicStat && !logicStat.isDirectory()) throw new Error('Logic data directory is not a regular directory');
  const lessons = path.join(logic, 'lessons');
  for (const revision of entries(lessons)) {
    if (!revisionName.test(revision.name)) continue;
    for (const file of entries(path.join(lessons, revision.name))) {
      if (file.name.endsWith('.json')) add(`logic/lessons/${revision.name}/${file.name}`);
    }
  }
  for (const file of entries(path.join(outputDirectory, 'solutions'))) {
    if (solutionName.test(file.name)) add(`solutions/${file.name}`);
  }
  return assets;
}

const dataProfile = {
  readFiles: readImmutableData,
  manifestName: DATA_MANIFEST_NAME,
  validateName: requireDataName,
  directoryPrefix: '',
};

export const readDataHistory = outputDirectory => readHistory(outputDirectory, dataProfile);

export function retainPreviousData(outputDirectory, history) {
  const current = readImmutableData(outputDirectory);
  const generations = current.size ? [generationFor(current), ...history.generations] : history.generations;
  return writeHistory(outputDirectory, mergeAssets(current, history.assets), generations, dataProfile);
}

// Old JavaScript modules contain immutable JSON URLs. Keep their data available
// without retaining stale indexes, other public files, or the entire public dir.
export function retainDeployedData() {
  let outputDirectory;
  let history;
  return {
    name: 'retain-deployed-data',
    apply: 'build',
    configResolved(config) {
      outputDirectory = path.resolve(config.root, config.build.outDir);
    },
    buildStart() {
      history = readDataHistory(outputDirectory);
    },
    writeBundle: {
      order: 'post',
      sequential: true,
      handler() {
        const result = retainPreviousData(outputDirectory, history);
        this.info(`Kept ${result.generations} immutable data generations; restored ${result.restored} files for open tabs.`);
      },
    },
  };
}
