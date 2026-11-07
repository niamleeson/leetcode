const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { root, problems, solutionMap } = require('../walkthroughs/load.cjs');

const manifest = fs.readFileSync(path.join(root, 'src/data/logic/manifest.ts'), 'utf8');
const revision = manifest.match(/logicRevision = "([a-f0-9]+)"/)[1];
const rows = problems.map(problem => {
  const practice = JSON.parse(fs.readFileSync(path.join(root, 'public/logic/problems', revision, problem.id + '.json'), 'utf8'));
  const solution = solutionMap[problem.id];
  return {
    ...problem, source: solution.code, javascript: solution.jsCode,
    approach: solution.approach, explanation: solution.explanation,
    starter: practice.starter, interfaces: practice.interfaces, fixtures: practice.fixtures,
  };
});
fs.writeFileSync('/tmp/leetcode-guided-input.json', JSON.stringify(rows));
if (!process.argv.includes('--input-only')) {
  const result = spawnSync('python3', [path.join(__dirname, 'generate-guided.py'), ...process.argv.slice(2)], {
    input: JSON.stringify(rows), encoding: 'utf8', maxBuffer: 16 * 1024 * 1024, cwd: root,
  });
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  if (result.error) throw result.error;
  process.exitCode = result.status ?? 1;
}
