const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const ts = require('typescript');

const root = path.resolve(__dirname, '../..');
const previousTsLoader = require.extensions['.ts'];
require.extensions['.ts'] = (module, filename) => {
  const source = fs.readFileSync(filename, 'utf8');
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  module._compile(compiled.outputText, filename);
};

const { catalogProblems } = require(path.join(root, 'src/data/catalog/metadata.ts'));
const { catalogManifest } = require(path.join(root, 'src/data/catalog/manifest.ts'));
const { uniqueProblems } = require(path.join(root, 'src/data/problems.ts'));
if (previousTsLoader) require.extensions['.ts'] = previousTsLoader;
else delete require.extensions['.ts'];

const snapshot = require('./official-snapshot.json');
const ids = snapshot.questions.map(question => Number(question.questionFrontendId)).sort((a, b) => a - b);
assert.equal(ids.length, snapshot.total, 'Official total does not match the fetched questions');
assert.equal(new Set(ids).size, snapshot.total, 'Duplicate official IDs');
assert.equal(catalogManifest.total, snapshot.total);
assert.deepEqual(catalogProblems.map(problem => problem.id).sort((a, b) => a - b), ids, 'Catalog metadata skips an official problem');
assert.equal(new Set(uniqueProblems.map(problem => problem.id)).size, uniqueProblems.length, 'Merged app catalog has duplicate IDs');
const appIds = new Set(uniqueProblems.map(problem => problem.id));
for (const id of ids) assert(appIds.has(id), `App catalog omitted ${id}`);
const officialById = new Map(catalogProblems.map(problem => [problem.id, problem]));
for (const problem of uniqueProblems) {
  const official = officialById.get(problem.id);
  if (official) {
    assert.equal(problem.isPremium, official.isPremium, `${problem.id}: stale availability label`);
    assert.deepEqual(problem.sourceTopics, official.sourceTopics, `${problem.id}: original official tags were lost`);
  }
}
for (let id = 9001; id <= 9030; id++) assert(appIds.has(id), `Existing system-design item ${id} was lost`);

const contentPath = path.join(root, 'public', catalogManifest.contentBase);
assert.deepEqual(fs.readdirSync(contentPath).filter(name => name.endsWith('.json')).sort(), ids.map(id => `${id}.json`).sort(), 'Obsolete or missing catalog documents');
const digest = crypto.createHash('sha256');
let implementations = 0;
const counts = {};
for (const id of ids) {
  const document = JSON.parse(fs.readFileSync(path.join(contentPath, `${id}.json`), 'utf8'));
  digest.update(JSON.stringify(document));
  const metadata = catalogProblems.find(problem => problem.id === id);
  assert.equal(document.id, id, `${id}: mismatched document ID`);
  assert.equal(document.title, metadata.title, `${id}: mismatched title`);
  assert.equal(document.originalUrl, metadata.url, `${id}: mismatched original link`);
  assert(document.descriptionHtml.replace(/<[^>]*>/g, '').trim().length > 40, `${id}: missing local problem statement`);
  assert(document.explanationMarkdown.replace(/[^A-Za-z]/g, '').length >= 40, `${id}: missing local explanation`);
  assert(!/<(?:script|iframe|object|template|style)\b|<[^>]*\son\w+\s*=|<[^>]*(?:javascript:|display\s*:\s*none)/i.test(document.descriptionHtml), `${id}: unsafe or hidden statement content`);
  assert(!/(?:language|code|solution) tabs[^\n]*empty/i.test(document.explanationMarkdown), `${id}: stale empty-tab text`);
  assert(['matching', 'alternative'].includes(document.implementationRelationship));
  assert(Array.isArray(document.solutions) && document.solutions.length > 0, `${id}: no local implementation`);
  const sourceIds = new Set(document.sources.map(source => source.id));
  for (const source of document.sources) {
    assert(source.name && /^https:\/\//.test(source.url), `${id}: incomplete source attribution`);
    assert(['MIT', 'CC-BY-SA-4.0'].includes(source.license), `${id}: missing license`);
    assert(/^https:\/\//.test(source.licenseUrl), `${id}: missing license link`);
  }
  for (const solution of document.solutions) {
    assert(sourceIds.has(solution.sourceId), `${id}: implementation source not attributed`);
    assert(solution.language && solution.label && solution.code.trim().length > 15, `${id}: empty implementation`);
    assert(!/\b(?:TODO|YOUR CODE HERE|NotImplementedError)\b/.test(solution.code), `${id}: implementation placeholder`);
    assert(!(solution.language === 'python' && /\bxrange\(|\.iteritems\(|\.itervalues\(/.test(solution.code)), `${id}: Python 2 code labeled Python 3`);
    if (['javascript', 'typescript'].includes(solution.language)) {
      const parsed = ts.createSourceFile(`solution.${solution.language === 'typescript' ? 'ts' : 'js'}`, solution.code,
        ts.ScriptTarget.Latest, true, solution.language === 'typescript' ? ts.ScriptKind.TS : ts.ScriptKind.JS);
      assert.equal(parsed.parseDiagnostics.length, 0, `${id}: ${solution.label} syntax error`);
    }
    counts[solution.language] = (counts[solution.language] || 0) + 1;
    implementations++;
  }
}
digest.update(JSON.stringify(catalogProblems));
assert.equal(digest.digest('hex').slice(0, 16), catalogManifest.revision, 'Content changed without updating the catalog revision');
for (const name of ['doocs.txt', 'walkccc.txt', 'kamyu.txt', 'ATTRIBUTION.txt']) {
  assert(fs.readFileSync(path.join(root, 'public', catalogManifest.licenseBase, name), 'utf8').length > 100, `Missing ${name}`);
}
console.log(`Catalog coverage: ${ids.length}/${snapshot.total} official problems, ${ids.length} local statements and explanations, ${implementations} implementations; ${uniqueProblems.length} total app entries including system design.`);
console.log('Implementation languages:', JSON.stringify(counts));
