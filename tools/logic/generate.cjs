const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { root, problems, solutionMap } = require('../walkthroughs/load.cjs');
const fixtures = require('../walkthroughs/fixtures.json');

// Canonical code exists only in this authoring-process input. The Python
// generator extracts interface AST nodes and never publishes executable bodies.
const payload = problems.map(problem => ({
  id: problem.id, title: problem.title, topic: problem.topic, difficulty: problem.difficulty,
  description: solutionMap[problem.id].description,
  source: solutionMap[problem.id].code,
  fixtures: fixtures[problem.id],
}));
const result = spawnSync('python3', [path.join(__dirname, 'generate.py'), ...process.argv.slice(2)], {
  input: JSON.stringify(payload), encoding: 'utf8', maxBuffer: 16 * 1024 * 1024,
  cwd: root,
});
if (result.stdout) process.stdout.write(result.stdout);
if (result.stderr) process.stderr.write(result.stderr);
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
