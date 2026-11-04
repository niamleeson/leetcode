const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const {root,solutionMap,problems} = require('../walkthroughs/load.cjs');
const audit = require('../../audits/neetcode250-pattern-coverage.json');
const fixtures = require('../walkthroughs/fixtures.json');
const {patternGuides,chapterStories} = require('../../src/data/master-solution/guide.ts');
const {graphMinHeapJavascript,sharedGraphHeapProblemIds} = require('../../src/data/shared-graph-heap.ts');
const {minHeapJavascript} = require('../../src/data/solutions/heap-code.ts');
const day = require('./daily-example.cjs');
const reviewedSources = require('./reviewed-sources.json');
const directory = path.join(root,'src/data/master-solution/generated');
const hash = value=>crypto.createHash('sha256').update(value).digest('hex');

function generate(write=false) {
  assert.deepEqual(Object.keys(patternGuides).sort(),audit.patterns.map(p=>p.id).sort());
  const selected=problems.filter(p=>!audit.scope.excludedTopics.includes(p.topic));
  assert.deepEqual(selected.map(p=>p.id),audit.problems.map(p=>p.id),'Master audit inventory has changed; review the mapping first.');
  const factories=[],versions=[];
  const catalogProblems=audit.problems.map(record=>{
    const problem=problems.find(p=>p.id===record.id);
    const primary=solutionMap[record.id];
    const solutions=[primary,...(primary.followUp?[primary.followUp]:[])];
    assert.equal(solutions.length,record.versions.length);
    const variants=solutions.map((solution,index)=>{
      const reviewed=record.versions[index];
      const correction = reviewedSources[`${record.id}:${index}`];
      if (correction) assert.equal(correction.auditedHash, reviewed.javascriptSha256);
      assert.equal(hash(solution.jsCode),correction?.reviewedHash || reviewed.javascriptSha256,`${record.id}: JavaScript changed since the pattern audit; review its coverage before generating.`);
      const variant=index?solution.walkthroughVariant:undefined;
      assert(!index||variant,`${record.id}: alternative needs its own walkthrough key`);
      const key=variant?`${record.id}-${variant}`:String(record.id);
      const entryPoints=[...new Set(fixtures[record.id].flatMap(f=>[f.entry,...(f.roundtrip?[f.roundtrip]:[])]))];
      for(const entry of entryPoints)assert(/^[A-Za-z_$][\w$]*$/.test(entry));
      let code=solution.jsCode;
      let helpers='';
      if(code.startsWith(minHeapJavascript)){code=code.slice(minHeapJavascript.length);helpers+='    const MinHeap = BinaryHeap;\n';}
      else if(sharedGraphHeapProblemIds.includes(record.id))helpers+='    const MinHeap = GraphMinHeap;\n';
      helpers+=`    const Node = ${record.id===427?'QuadNode':record.id===133?'GraphNode':'RandomNode'};\n    const _Node = GraphNode;\n`;
      if(record.id===374)helpers+='    const guess = dependencies.guess || (() => { throw new Error("Provide dependencies.guess for Guess Number."); });\n';
      factories.push(`  // #${record.id} ${record.title} · ${reviewed.name}\n  // ${reviewed.requiredVariation}\n  ${JSON.stringify(key)}: function(dependencies = {}) {\n${helpers}${code.split('\n').map(line=>line ? '    '+line : '').join('\n')}\n    return { ${entryPoints.join(', ')} };\n  }`);
      const metadata={key,problemId:record.id,title:record.title,name:reviewed.name,...(variant?{variant}:{}),units:reviewed.patterns,rule:reviewed.requiredVariation,entryPoints,exampleCount:fixtures[record.id].length,sourceHash:hash(solution.jsCode)};
      versions.push(metadata);
      return metadata;
    });
    return {id:record.id,title:record.title,topic:record.topic,url:problem.url,overlap:record.scopeOverlaps,sourceNotes:record.sourceNotes,variants};
  });
  const units=audit.patterns.map(p=>({id:p.id,chapter:p.chapter,name:p.name,task:p.masterOperation,...patternGuides[p.id],problemIds:p.problemIds,variantKeys:versions.filter(v=>v.units.includes(p.id)).map(v=>v.key)}));
  const chapters=audit.scope.includedTopics.map(name=>({name,story:chapterStories[name],unitIds:units.filter(u=>u.chapter===name).map(u=>u.id)}));
  const totals={problems:catalogProblems.length,variants:versions.length,units:units.length,examples:versions.reduce((n,v)=>n+v.exampleCount,0)};
  const catalog={units,problems:catalogProblems,chapters,totals,dailyExample:{input:day.input,result:day.expected,stages:day.stages}};
  const library=`/**
 * Delivery Control — the complete master solution.
 * ${totals.units} study units, ${totals.problems} problems, ${totals.variants} implementations.
 * Run: node delivery-control.mjs
 * Import: import { operation, createOperation, makeList, makeTree } from './delivery-control.mjs';
 * Example: operation('B02', 1011).shipWithinDays([1,2,3,4,5], 3) // 6
 * Alternate: operation('S04', 225, 'one-queue').MyStack
 * Original function names make the connection to the NeetCode page explicit.
 * Inputs follow the corresponding operation's problem constraints. Some operations
 * mutate their input; the daily example copies its input before calling them.
 * Generated from the displayed implementations. Edit their sources and regenerate.
 */

export class ListNode {
  constructor(val = 0, next = null) { this.val = val; this.next = next; }
}
export class TreeNode {
  constructor(val = 0, left = null, right = null) { this.val = val; this.left = left; this.right = right; }
}
export class RandomNode {
  constructor(val = 0, next = null, random = null) { this.val = val; this.next = next; this.random = random; }
}
export class GraphNode {
  constructor(val = 0, neighbors = []) { this.val = val; this.neighbors = neighbors; }
}
export class QuadNode {
  constructor(val, isLeaf, topLeft = null, topRight = null, bottomLeft = null, bottomRight = null) {
    Object.assign(this, {val, isLeaf, topLeft, topRight, bottomLeft, bottomRight});
  }
}
export function makeList(values) {
  return values.reduceRight((next, value) => new ListNode(value, next), null);
}
export function listValues(head) {
  const result = [];
  const seen = new Set();
  for (let node = head; node && !seen.has(node); node = node.next) {
    seen.add(node);
    result.push(node.val);
  }
  return result;
}
export function makeTree(values) {
  if (!values.length || values[0] === null) return null;
  const root = new TreeNode(values[0]);
  const queue = [root];
  let index = 1;
  while (queue.length && index < values.length) {
    const node = queue.shift();
    for (const side of ['left', 'right']) {
      const value = values[index++];
      if (value != null) {
        node[side] = new TreeNode(value);
        queue.push(node[side]);
      }
    }
  }
  return root;
}

// Shared libraries. Implementations with their own specialized heap keep it local.
${minHeapJavascript.replace('class MinHeap','export class BinaryHeap')}
${graphMinHeapJavascript.replace('class MinHeap','export class GraphMinHeap')}

export const studyUnits = ${JSON.stringify(units,null,2)};
export const implementations = ${JSON.stringify(versions,null,2)};

const factories = {
${factories.join(',\n\n')}
};

export function createOperation(key, dependencies = {}) {
  const factory = factories[String(key)];
  if (!Object.hasOwn(factories, String(key))) throw new Error('Unknown implementation: ' + key);
  return factory(dependencies);
}
export function operation(unitId, problemId, variant = 'primary', dependencies = {}) {
  const unit = studyUnits.find(item => item.id === unitId);
  if (!unit) throw new Error('Unknown study unit: ' + unitId);
  const key = problemId == null && variant === 'primary' ? unit.variantKeys[0]
    : variant === 'primary' ? String(problemId) : String(problemId ?? unit.problemIds[0]) + '-' + variant;
  if (!unit.variantKeys.includes(key)) throw new Error('Implementation ' + key + ' does not belong to ' + unitId);
  return createOperation(key, dependencies);
}
export const deliveryDayInput = ${JSON.stringify(day.input,null,2)};
${day.source}

// Importing this module never runs the example. Executing it directly does.
if (typeof process !== 'undefined' && process.versions?.node && process.argv[1]) {
  const { realpathSync } = await import('node:fs');
  const { pathToFileURL } = await import('node:url');
  let entryUrl;
  try { entryUrl = pathToFileURL(realpathSync(process.argv[1])).href; } catch {}
  if (entryUrl === import.meta.url) console.log(JSON.stringify(runDeliveryDay(), null, 2));
}
`;
  const outputs={
    'catalog.ts':`// Generated by tools/master-solution/generate.cjs.\nimport type { MasterCatalog } from '../types';\nexport const masterCatalog: MasterCatalog = ${JSON.stringify(catalog,null,2)};\n`,
    'delivery-control.mjs':library,
    'daily-example.txt':day.source.trim()+'\n',
  };
  for(const [filename,content] of Object.entries(outputs)){
    const file=path.join(directory,filename);
    if(write){fs.mkdirSync(directory,{recursive:true});fs.writeFileSync(file,content);}
    else assert.equal(fs.readFileSync(file,'utf8'),content,`${filename} is stale; run npm run master:generate`);
  }
  return {catalog,totals};
}
if(require.main===module){const result=generate(process.argv.includes('--write'));console.log(JSON.stringify(result.totals));}
module.exports={generate};
