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
module.exports = { root, solutionMap, problems: neetcodeTopics.flatMap(topic => topic.problems.map(problem => ({ ...problem, topic: topic.name }))) };
