const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const root = path.resolve(__dirname, '../..');
require.extensions['.ts'] = (module, filename) => {
  const source = fs.readFileSync(filename, 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } });
  module._compile(compiled.outputText, filename);
};
const { neetcodeTopics } = require(path.join(root, 'src/data/neetcode250.ts'));
const { solutionMap } = require(path.join(root, 'src/data/solutions/index.ts'));
const problems = neetcodeTopics.flatMap(topic => topic.problems.map(problem => ({ ...problem, topic: topic.name })));
// Alternatives keep their problem ID for fixtures and visualizations, but use
// separate artifact keys so the displayed code can never load another version.
const walkthroughs = problems.flatMap(problem => {
  const solution = solutionMap[problem.id];
  const entries = [{ ...problem, key: String(problem.id), solution }];
  if (solution?.followUp?.walkthroughVariant) {
    const alternative = solution.followUp;
    entries.push({ ...problem, key: `${problem.id}-${alternative.walkthroughVariant}`, variant: alternative.walkthroughVariant, title: `${problem.title} · ${alternative.title}`, solution: alternative });
  }
  return entries;
});
module.exports = { root, solutionMap, problems, walkthroughs };
