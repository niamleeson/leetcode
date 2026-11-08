// Independent audit of published lessons. This deliberately does not import
// either question generator or trust its required/covered/decision line sets.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const { root, problems, solutionMap } = require('../walkthroughs/load.cjs');
const fixtures = require('../walkthroughs/fixtures.json');
const digest = value => crypto.createHash('sha256').update(value).digest('hex');
const unique = values => [...new Set(values)].sort((a,b)=>a-b);
const range = (start,end) => Array.from({length:Math.max(0,end-start+1)},(_,i)=>start+i);
const clean = code => code.replace(/\r/g,'').trimEnd();

function shape(node) {
  if(Array.isArray(node)) return node.map(shape);
  if(!node || typeof node!=='object') return node;
  const result={};
  for(const [key,value] of Object.entries(node)) {
    if(['start','end','loc','extra','comments','leadingComments','trailingComments','innerComments','tokens','errors'].includes(key)) continue;
    result[key]=shape(value);
  }
  return result;
}

function javascriptInventory(document) {
  const source=document.source, lines=source.split('\n');
  const ast=parser.parse(source,{tokens:true});
  const excluded=[],functions=[],returns=[],publicRanges=[],expressionOwners=new WeakMap(),directGuards=[];
  const entry=document.entry || fixtures[document.id]?.[0]?.entry;
  traverse(ast,{
    Function(p){
      const node=p.node; functions.push(node);
      if(node.body.type!=='BlockStatement') expressionOwners.set(node,p.getStatementParent()?.node);
      let headerStart=node.start;
      if(p.parentPath.isVariableDeclarator()) headerStart=p.parentPath.parentPath.node.start;
      if(p.parentPath.isAssignmentExpression() && p.parentPath.parentPath.isExpressionStatement()) headerStart=p.parentPath.parentPath.node.start;
      if(node.body.type==='BlockStatement') excluded.push([headerStart,node.body.start+1]);
      else excluded.push([headerStart,node.body.start]);
      const functionName=node.id?.name || node.key?.name || (p.parentPath.isVariableDeclarator()?p.parentPath.node.id?.name:null);
      if(functionName===entry) publicRanges.push([node.loc.start.line,node.loc.end.line]);
      if(p.parentPath.isAssignmentExpression()) {
        const left=source.slice(p.parentPath.node.left.start,p.parentPath.node.left.end);
        if(left.startsWith(entry+'.prototype.')) publicRanges.push([node.loc.start.line,node.loc.end.line]);
      }
    },
    Class(p){excluded.push([p.node.start,p.node.body.start+1]);if(p.node.id?.name===entry) publicRanges.push([p.node.loc.start.line,p.node.loc.end.line]);},
    ImportDeclaration(p){excluded.push([p.node.start,p.node.end]);},
    ReturnStatement(p){
      returns.push(p.node);
      const parent=p.parentPath.isBlockStatement()?p.parentPath.parentPath:p.parentPath;
      if(!p.node.argument && parent?.isIfStatement()) directGuards.push({line:p.node.loc.start.line,guardLine:parent.node.loc.start.line,test:parent.node.test});
    },
  });
  const required=new Set();
  for(const token of ast.tokens) {
    if(typeof token.type==='string' || token.type.label==='eof') continue;
    if(excluded.some(([start,end])=>start<=token.start&&token.start<end)) continue;
    const text=source.slice(token.start,token.end);
    if(/^[\s()[\]{},.;:]+$/.test(text)) continue;
    if(['else','try','finally'].includes(text) && /^\s*\}?\s*(?:else|try|finally)\s*\{?\s*(?:\/\/.*)?$/.test(lines[token.loc.start.line-1])) continue;
    for(const line of range(token.loc.start.line,token.loc.end.line)) required.add(line);
  }
  const terminalNodes=[...returns];
  for(const fn of functions) {
    // An expression callback is part of its enclosing operation (for example
    // allocation.map(() => new Set())), not a standalone return statement.
    const statements=fn.body.type==='BlockStatement'?fn.body.body:[expressionOwners.get(fn) || fn.body];
    const last=[...statements].reverse().find(node=>!['FunctionDeclaration','ClassDeclaration','EmptyStatement'].includes(node.type));
    if(last) {
      const candidates=[...required].filter(line=>last.loc.start.line<=line&&line<=last.loc.end.line);
      if(candidates.length) terminalNodes.push(last);
    }
  }
  const terminalOperations=[...new Map(terminalNodes.map(node=>[`${node.loc.start.line}:${node.loc.end.line}`,{
    line:node.loc.start.line,endLine:node.loc.end.line,kind:node.type,
    lines:[...required].filter(line=>node.loc.start.line<=line&&line<=node.loc.end.line),
  }])).values()].filter(operation=>operation.lines.length);
  const choices={};
  for(const question of document.questions.filter(question=>question.stage==='implementation')) {
    choices[question.id]=question.choices.map(choice=>{
      const changed=[...lines.slice(0,question.line-1),choice.code,...lines.slice(question.endLine)].join('\n');
      try {
        const altered=parser.parse(changed),fingerprint=digest(JSON.stringify(shape(altered))),guardChanges=[];
        traverse(altered,{IfStatement(p){
          for(const relation of directGuards.filter(relation=>relation.guardLine===p.node.loc.start.line)) {
            if(JSON.stringify(shape(p.node.test))===JSON.stringify(shape(relation.test))) continue;
            const previous=p.node.test;p.node.test=relation.test;
            const onlyGuard=JSON.stringify(shape(altered))===JSON.stringify(shape(ast));
            p.node.test=previous;
            if(onlyGuard) guardChanges.push({line:relation.line,guardLine:relation.guardLine});
          }
        }});
        return {id:choice.id,ast:fingerprint,guardChanges};
      }
      catch(error){return {id:choice.id,error:error.message};}
    });
  }
  const publicLines=[...required].filter(line=>publicRanges.some(([start,end])=>start<=line&&line<=end));
  return {requiredLines:unique([...required]),publicLines:unique(publicLines),terminalLines:unique(terminalOperations.map(operation=>operation.lines.at(-1))),terminalOperations,choices};
}

function auditDocument(document, inventory, expectedSource) {
  const issues=[],warnings=[],exemptions=[];
  const issue=(kind,detail)=>issues.push({kind,...detail});
  const lines=document.source.split('\n');
  const questions=document.questions.filter(question=>question.stage==='implementation');
  if(new Set(document.questions.map(question=>question.id)).size!==document.questions.length) issue('duplicate-question-id',{});
  if(document.source!==expectedSource || document.sourceHash!==digest(expectedSource)) issue('source-mismatch',{});
  let implementationStart=1;
  while(document.questions[implementationStart]?.stage==='structure') implementationStart++;
  if(document.questions[0]?.stage!=='pattern'||implementationStart===1||implementationStart===document.questions.length||document.questions.slice(implementationStart).some(q=>q.stage!=='implementation')) issue('stage-order',{});
  const covered=new Set(),decisions=new Set(),guardedReturns=new Set(),claimed=new Set(document.coverage?.requiredLines || []);
  for(const key of ['requiredLines','coveredLines','terminalLines']) for(const line of document.coverage?.[key] || []) {
    if(!Number.isInteger(line)||line<1||line>lines.length) issue('invalid-coverage-line',{key,line});
  }
  let previousEnd=0;
  for(const question of questions) {
    if(!Number.isInteger(question.line)||!Number.isInteger(question.endLine)||question.line<1||question.endLine<question.line||question.endLine>lines.length) {issue('invalid-range',{question:question.id});continue;}
    if(question.line<=previousEnd) issue('overlap-or-order',{question:question.id,line:question.line,previousEnd});
    previousEnd=question.endLine;
    const correct=question.choices.filter(choice=>choice.correct);
    if(new Set(question.choices.map(choice=>choice.id)).size!==question.choices.length) issue('duplicate-choice-id',{question:question.id});
    if(correct.length!==1 || question.choices.length<2) {issue('ambiguous-choices',{question:question.id});continue;}
    const actualSource=lines.slice(question.line-1,question.endLine).join('\n');
    if(clean(correct[0].code || '')!==clean(actualSource)) issue('correct-code-replay',{question:question.id,line:question.line,endLine:question.endLine});
    for(const line of range(question.line,question.endLine)) covered.add(line);
    const normalized=new Set();
    for(const parsed of inventory.choices[question.id] || []) {
      if(parsed.error) issue('invalid-choice-syntax',{question:question.id,choice:parsed.id,error:parsed.error});
      else if(normalized.has(parsed.ast)) issue('duplicate-choice-ast',{question:question.id,choice:parsed.id});
      else normalized.add(parsed.ast);
    }
    const changed=new Set();
    for(const choice of question.choices.filter(choice=>!choice.correct)) {
      const wrong=(choice.code || '').split('\n');
      const original=actualSource.split('\n');
      for(let index=0;index<original.length;index++) if((wrong[index] || '')!==original[index]) changed.add(question.line+index);
    }
    for(const line of changed) decisions.add(line);
    for(const line of question.decisionLines || []) if(!changed.has(line)) issue('false-decision-line',{question:question.id,line});
    for(const line of question.coveredLines || []) if(line<question.line || line>question.endLine) issue('false-covered-line',{question:question.id,line});
    for(const relation of question.guardedReturns || []) {
      const choice=question.choices.find(choice=>choice.id===relation.choiceId);
      const parsed=(inventory.choices[question.id] || []).find(choice=>choice.id===relation.choiceId);
      const matches=parsed?.guardChanges?.some(change=>change.line===relation.line&&change.guardLine===relation.guardLine);
      if(!choice || choice.correct || !choice.witness || !matches || relation.line<question.line || relation.line>question.endLine || relation.guardLine<question.line || relation.guardLine>question.endLine) issue('invalid-guarded-return-decision',{question:question.id,relation});
      else guardedReturns.add(relation.line);
    }
  }
  for(const line of document.coverage?.coveredLines || []) if(!covered.has(line)) issue('false-global-covered-line',{line});
  const exempted=new Set();
  for(const exemption of document.coverage?.contextOnly || []) {
    if(!Number.isInteger(exemption.line)||!Number.isInteger(exemption.endLine)||exemption.line<1||exemption.endLine<exemption.line||exemption.endLine>lines.length||!exemption.reason?.trim()) {issue('invalid-exemption',{exemption});continue;}
    const required=inventory.requiredLines.filter(line=>exemption.line<=line&&line<=exemption.endLine);
    const suppliedDefinitions=(inventory.suppliedDefinitions || []).filter(definition=>exemption.line<=definition.line&&definition.endLine<=exemption.endLine);
    const definitionLines=new Set(suppliedDefinitions.flatMap(definition=>range(definition.line,definition.endLine)));
    const primaryMissing=required.filter(line=>inventory.publicLines?.includes(line)&&!covered.has(line)&&!definitionLines.has(line));
    if(primaryMissing.length) issue('undisplayed-primary-exemption',{lines:primaryMissing,reason:exemption.reason});
    for(const line of required) exempted.add(line);
    exemptions.push({...exemption,...(suppliedDefinitions.length?{suppliedDefinitions}:{}),executableLines:required,physicallyIncluded:required.every(line=>covered.has(line)),activelyContrasted:required.filter(line=>decisions.has(line)),source:lines.slice(exemption.line-1,exemption.endLine).join('\n')});
  }
  const missing=inventory.requiredLines.filter(line=>!covered.has(line)&&!exempted.has(line));
  if(missing.length) issue('uncovered-executable-lines',{lines:missing,source:missing.map(line=>({line,code:lines[line-1]}))});
  const unclaimed=inventory.requiredLines.filter(line=>!claimed.has(line)&&!exempted.has(line));
  if(unclaimed.length) warnings.push({kind:'inventory-disagreement',lines:unclaimed});
  for(const line of document.coverage?.terminalLines || []) {
    if(!inventory.requiredLines.includes(line)) issue('nonexecutable-terminal-line',{line,source:lines[line-1]});
    else if(!exempted.has(line)&&(!covered.has(line)||!decisions.has(line)&&!guardedReturns.has(line))) issue('uncontrasted-declared-terminal',{line,source:lines[line-1]});
  }
  const terminalMissing=inventory.terminalOperations.filter(operation=>{
    const relevant=operation.lines.filter(line=>!exempted.has(line));
    const testedGuard=guardedReturns.has(operation.line)&&['Return','ReturnStatement'].includes(operation.kind);
    return relevant.length && (relevant.some(line=>!covered.has(line)) || !relevant.some(line=>decisions.has(line))&&!testedGuard);
  });
  if(terminalMissing.length) issue('unasked-terminal-operations',{operations:terminalMissing.map(operation=>({...operation,source:lines.slice(operation.line-1,operation.endLine).join('\n')}))});
  if(!document.coverage) issue('missing-coverage-metadata',{});
  if(document.id===739) {
    const roles=document.language==='python' ? [
      ['remove pending day',/\bj = stack\.pop\(\)/], ['write distance',/result\[j\] = i - j/], ['remember current day',/stack\.append\(i\)/], ['return waits',/^\s*return result/],
    ] : [
      ['remove pending day',/prevDayIndex = stack\.pop\(\)/], ['compute distance',/daysWaited = i - prevDayIndex/], ['write distance',/result\[prevDayIndex\] = daysWaited/], ['remember current day',/stack\.push\(i\)/], ['return waits',/^\s*return result/],
    ];
    for(const [role,pattern] of roles) {
      const index=lines.findIndex(line=>pattern.test(line));
      if(index<0 || !covered.has(index+1) || !decisions.has(index+1) || exempted.has(index+1)) issue('daily-temperatures-missing-decision',{role,line:index+1});
    }
  }
  if(document.id===706&&document.language==='javascript') {
    const index=lines.findIndex(line=>/bucket\.splice\(i,\s*1\)/.test(line));
    if(index<0||!covered.has(index+1)||!decisions.has(index+1)||exempted.has(index+1)) issue('hash-map-removal-missing-decision',{line:index+1});
  }
  return {id:document.id,language:document.language,questionCount:questions.length,sourceExecutableLines:inventory.requiredLines.length,
    outsidePublicEntryLines:inventory.requiredLines.filter(line=>!inventory.publicLines?.includes(line)),
    physicallyIncludedLines:inventory.requiredLines.filter(line=>covered.has(line)).length,
    activelyContrastedLines:inventory.requiredLines.filter(line=>decisions.has(line)&&!exempted.has(line)).length,
    guardedReturnLines:unique([...guardedReturns]),suppliedOrDefensiveLines:exempted.size,terminalLines:inventory.terminalLines,exemptions,warnings,issues};
}

function main() {
  const manifest=fs.readFileSync(path.join(root,'src/data/logic/guided-manifest.ts'),'utf8');
  const revision=manifest.match(/guidedRevision = "([a-f0-9]+)"/)[1];
  const directory=path.join(root,'public/logic/lessons',revision);
  const expected=problems.flatMap(problem=>['python','javascript'].map(language=>`${problem.id}-${language}.json`)).sort();
  const actual=fs.readdirSync(directory).filter(name=>name.endsWith('.json')).sort();
  if(JSON.stringify(actual)!==JSON.stringify(expected)) throw Error('Published lessons must contain exactly all 250 problems in both languages');
  const documents=expected.map(name=>{
    const document=JSON.parse(fs.readFileSync(path.join(directory,name),'utf8'));
    if(name!==`${document.id}-${document.language}.json` || document.revision!==revision) throw Error('Lesson identity/revision mismatch: '+name);
    return document;
  });
  const python=spawnSync('python3',[path.join(__dirname,'guided-coverage-python.py')],{
    input:JSON.stringify(documents.filter(document=>document.language==='python').map(document=>({...document,entry:fixtures[document.id][0].entry}))),encoding:'utf8',maxBuffer:32*1024*1024,
  });
  if(python.status!==0) throw Error(python.stderr || 'Python source inventory failed');
  const pythonInventories=JSON.parse(python.stdout);
  const lessons=documents.map(document=>auditDocument(document,document.language==='python'?pythonInventories[document.id]:javascriptInventory(document),solutionMap[document.id][document.language==='python'?'code':'jsCode']));
  const report={revision,lessons:lessons.length,issues:lessons.reduce((sum,lesson)=>sum+lesson.issues.length,0),lessonsWithIssues:lessons.filter(lesson=>lesson.issues.length).map(lesson=>`${lesson.id}-${lesson.language}`),
    sourceExecutableLines:lessons.reduce((sum,lesson)=>sum+lesson.sourceExecutableLines,0),
    physicallyIncludedLines:lessons.reduce((sum,lesson)=>sum+lesson.physicallyIncludedLines,0),
    activelyContrastedLines:lessons.reduce((sum,lesson)=>sum+lesson.activelyContrastedLines,0),
    guardedReturnDecisions:lessons.reduce((sum,lesson)=>sum+lesson.guardedReturnLines.length,0),
    suppliedOrDefensiveLines:lessons.reduce((sum,lesson)=>sum+lesson.suppliedOrDefensiveLines,0),
    exemptions:lessons.flatMap(lesson=>lesson.exemptions.map(exemption=>({id:lesson.id,language:lesson.language,...exemption}))),results:lessons};
  const flag=process.argv.indexOf('--report'),target=flag>=0?path.resolve(process.argv[flag+1]):path.join('/tmp','leetcode-guided-coverage-audit.json');
  fs.writeFileSync(target,JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({...report,results:undefined,lessonsWithIssues:report.lessonsWithIssues.length,examplesWithIssues:report.lessonsWithIssues.slice(0,10),exemptions:report.exemptions.length,report:target}));
  if(report.issues) process.exitCode=1;
  return report;
}

module.exports={auditDocument,javascriptInventory};
if(require.main===module) main();
