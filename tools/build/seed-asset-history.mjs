import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generationFor, mergeAssets, readHistory, writeHistory } from './retained-assets.mjs';

// One-time migration for deployments made before retention was introduced.
// Commit objects are read as bytes; no archived paths or shell commands run.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const revision = process.argv[2];
if (!revision || process.argv.length !== 3) throw new Error('Usage: node tools/build/seed-asset-history.mjs <git-revision>');
const git = args => execFileSync('git', args, { cwd: root, maxBuffer: 128 * 1024 * 1024 });
const sha = git(['rev-parse', '--verify', '--end-of-options', `${revision}^{commit}`]).toString().trim();
if (!/^[a-f0-9]{40,64}$/.test(sha)) throw new Error('Expected a commit object ID');
const oldAssets = new Map();
const entries = git(['ls-tree', '-rz', sha, '--', 'docs/assets']).toString().split('\0').filter(Boolean);
for (const entry of entries) {
  const match = /^(100644|100755) blob ([a-f0-9]+)\tdocs\/assets\/(.+)$/.exec(entry);
  if (!match) throw new Error(`Unexpected asset tree entry: ${entry}`);
  oldAssets.set(match[3], git(['cat-file', 'blob', match[2]]));
}
if (!oldAssets.size) throw new Error('No deployment assets found in that revision');
const outputDirectory = path.join(root, 'docs');
const history = readHistory(outputDirectory);
const result = writeHistory(outputDirectory, mergeAssets(history.assets, oldAssets), [...history.generations, generationFor(oldAssets)]);
console.log(`Seeded ${sha.slice(0, 7)}: ${result.restored} restored files, ${result.generations} retained generations.`);
