const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const Module = require('node:module');
require('../walkthroughs/load.cjs'); // TypeScript source loader, authoring only.
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const { execute } = require('../walkthroughs/runtime.cjs');
const { instrument } = require('../walkthroughs/instrument.cjs');
const { validateJavaScriptResult } = require('../../src/components/logic/runtime/javascriptValidation.ts');
const runtimePath = path.resolve(__dirname, '../walkthroughs/runtime.cjs');
const bounded = new Module(runtimePath, module);
bounded.filename = runtimePath; bounded.paths = Module._nodeModulePaths(path.dirname(runtimePath));
bounded._compile(fs.readFileSync(runtimePath, 'utf8').replace('timeout: 15000', 'timeout: 120').replace('JSON.stringify(__args[0].slice(0,__returned)) !== JSON.stringify(__case.prefix)', 'JSON.stringify(__problemId === 27 ? __args[0].slice(0,__returned).sort((a,b)=>a-b) : __args[0].slice(0,__returned)) !== JSON.stringify(__problemId === 27 ? [...__case.prefix].sort((a,b)=>a-b) : __case.prefix)'), runtimePath);
const fastExecute = bounded.exports.execute;
const digest = text => crypto.createHash('sha256').update(text).digest('hex');
function shuffled(items, salt) {
  const result = [...items]; let seed = parseInt(digest(salt).slice(0,8),16);
  for (let i = result.length - 1; i > 0; i--) { seed = (Math.imul(seed,1664525)+1013904223)>>>0; const j=seed%(i+1); [result[i],result[j]]=[result[j],result[i]]; }
  return result;
}
function optionsByLine(source, entry, roundtrip, design) {
  const lines=source.split('\n'), groups=new Map();
  const ast=parser.parse(source);const ranges=[];const entries=new Set([entry,roundtrip].filter(Boolean));
  traverse(ast,{FunctionDeclaration(p){if(entries.has(p.node.id?.name))ranges.push([p.node.start,p.node.end]);},VariableDeclarator(p){if(entries.has(p.node.id.name)&&p.node.init)ranges.push([p.node.init.start,p.node.init.end]);},ClassDeclaration(p){if(entries.has(p.node.id?.name))ranges.push([p.node.start,p.node.end]);},AssignmentExpression(p){if(design&&source.slice(p.node.left.start,p.node.left.end).startsWith(entry+'.prototype.'))ranges.push([p.node.start,p.node.end]);}});
  function candidate(node, replacements, category, reason) {
    if (!node.loc || node.loc.start.line!==node.loc.end.line || (ranges.length&&!ranges.some(([start,end])=>node.start>=start&&node.end<=end))) return;
    const line=node.loc.start.line, original=lines[line-1];
    if (!original?.trim() || original.length>700) return;
    let group=groups.get(line);
    if(!group){group={line,original,category,reason,variants:new Map()};groups.set(line,group);}
    const ranks={condition:5,loop:6,return:4,state:3,update:2};
    if((ranks[category]||0)>(ranks[group.category]||0)){group.category=category;group.reason=reason;}
    for(const replacement of replacements){
      const text=source.slice(node.start,node.end); if(replacement===text)continue;
      const mutated=source.slice(0,node.start)+replacement+source.slice(node.end);
      const edited=mutated.split('\n')[line-1];if(edited===original||group.variants.has(edited))continue;
      group.variants.set(edited,{source:mutated,text:edited});
    }
  }
  function categoryFor(p) {
    if(p.findParent(q=>q.isForStatement()||q.isWhileStatement()||q.isDoWhileStatement())) {
      const loop=p.findParent(q=>q.isForStatement()||q.isWhileStatement()||q.isDoWhileStatement());
      if(loop.node.loc.start.line===p.node.loc.start.line)return 'loop';
    }
    if(p.findParent(q=>q.isIfStatement()||q.isConditionalExpression()))return 'condition';
    if(p.findParent(q=>q.isReturnStatement()))return 'return';
    if(p.findParent(q=>q.isVariableDeclarator()))return 'state';
    return 'update';
  }
  traverse(ast,{
    BinaryExpression(p){ const n=p.node; const operators=['===','!==','<','<=','>','>='].includes(n.operator)?['===','!==','<','<=','>','>=']:['+','-','*','/','%','&','|','^','<<','>>','>>>'].includes(n.operator)?['+','-','*','%','&','|','^']:[];
      candidate(n,operators.filter(op=>op!==n.operator).map(op=>`${source.slice(n.left.start,n.left.end)} ${op} ${source.slice(n.right.start,n.right.end)}`),categoryFor(p),'operator'); },
    LogicalExpression(p){const n=p.node;candidate(n,[`${source.slice(n.left.start,n.left.end)} ${n.operator==='&&'?'||':'&&'} ${source.slice(n.right.start,n.right.end)}`],categoryFor(p),'condition');},
    NumericLiteral(p){candidate(p.node,['0','1','2','-1'],categoryFor(p),'boundary');},
    NullLiteral(p){const names=Object.keys(p.scope.getAllBindings()).filter(name=>/^(head|root|prev|current|node|slow|fast|left|right)$/.test(name));candidate(p.node,names,categoryFor(p),'state');},
    Identifier(p){if(!p.isReferencedIdentifier()||! /^(?:head|root|prev|curr|current|node|nextNode|first|second|slow|fast|left|right|lo|hi|i|j|l|r|row|col|value|result|res|count|target|k|n)$/.test(p.node.name))return;const bindings=p.scope.getAllBindings();const names=Object.keys(bindings).filter(name=>name!==p.node.name && /^(?:head|root|prev|curr|current|node|nextNode|first|second|slow|fast|left|right|lo|hi|i|j|l|r|row|col|value|result|res|count|target|k|n)$/.test(name) && bindings[name].identifier.start<p.node.start);candidate(p.node,names.slice(0,8),categoryFor(p),'binding');},
    BooleanLiteral(p){candidate(p.node,[String(!p.node.value),'null','0'],categoryFor(p),'boolean');},
    UpdateExpression(p){const n=p.node;candidate(n,[n.prefix?`${n.operator==='++'?'--':'++'}${source.slice(n.argument.start,n.argument.end)}`:`${source.slice(n.argument.start,n.argument.end)}${n.operator==='++'?'--':'++'}`],categoryFor(p),'progress');},
    AssignmentExpression(p){const n=p.node;const op={'+=':'-=','-=':'+=','*=':'+='}[n.operator];if(op)candidate(n,[`${source.slice(n.left.start,n.left.end)} ${op} ${source.slice(n.right.start,n.right.end)}`], 'update','update');},
    MemberExpression(p){const n=p.node;if(!n.computed&&n.property.type==='Identifier'){
      if(n.property.name==='next')candidate(n,[source.slice(n.object.start,n.object.end),source.slice(n.start,n.end)+'.next','null'],categoryFor(p),'pointer');
      const alternatives={min:['max'],max:['min'],floor:['ceil','round'],ceil:['floor','round'],push:['unshift'],unshift:['push'],pop:['shift'],shift:['pop'],add:['delete'],delete:['add'],get:['has'],left:['right'],right:['left']};
      candidate(n.property,alternatives[n.property.name]||[],categoryFor(p),'operation');
    }},
    ReturnStatement(p){const n=p.node;if(n.argument&&n.loc.start.line===n.loc.end.line)candidate(n.argument,['null','0','1','false','true','[]'], 'return','result');},
    VariableDeclarator(p){const n=p.node;if(n.init?.type==='ArrayExpression')candidate(n.init,['{}','[0]','[1]'], 'state','state');if(n.init?.type==='NewExpression'&&n.init.callee.type==='Identifier'&&['Map','Set'].includes(n.init.callee.name))candidate(n.init,[n.init.callee.name==='Map'?'new Set()':'new Map()','[]'], 'state','state');},
  });
  return [...groups.values()].map(group=>({...group,category:/^\s*(?:else\s+)?if\b/.test(group.original)?'condition':/^\s*(for|while|do)\b/.test(group.original)?'loop':/^\s*return\b/.test(group.original)?'return':/^\s*(const|let|var)\b/.test(group.original)?'state':group.category}));
}
const prompts={state:'Which value or structure should we initialize here?',loop:'Which loop bounds and progress rule should we use?',condition:'Which condition should control this decision?',update:'How should we update the stored state here?',return:'What should we return at this point?'};
function failureFor(id, source, fixtures) {
  try {parser.parse(source);} catch{return null;}
  const ordered=fixtures.map((f,index)=>({f,index})).sort((a,b)=>JSON.stringify(a.f.args).length-JSON.stringify(b.f.args).length);
  for(const {f,index} of ordered){
    try {
      const actual=fastExecute(source,f,id,false).result;
      if(!validateJavaScriptResult(actual,f,id))return {fixtureIndex:index,name:f.name,input:f.args,...(f.operations?{operations:f.operations}:{}),expected:f.expected,actual};
    } catch(error){
      if(/SyntaxError|ReferenceError|is not defined|Script execution timed out|Maximum call stack size exceeded|heap out of memory/.test(`${error.name} ${error.message}`))return null;
      return {fixtureIndex:index,name:f.name,input:f.args,...(f.operations?{operations:f.operations}:{}),expected:f.expected,error:{type:error.name||'Error',message:String(error.message).slice(0,220)}};
    }
  }
  return null;
}
function contextFor(lines,line) {
  const start=Math.max(0,line-5);
  return [...lines.slice(start,line-1).map((text,i)=>`${start+i+1}  ${text}`),`${line}  ${lines[line-1].match(/^\s*/)[0]}// Choose the missing statement.`].join('\n');
}
function generateJavaScriptQuestions({id,source,fixtures}) {
  const lines=source.split('\n');
  for(const f of fixtures){const actual=execute(source,f,id,false).result;if(!validateJavaScriptResult(actual,f,id))throw Error(`${id}: reference fails ${f.name}`);}
  const groups=optionsByLine(source,fixtures[0].entry,fixtures[0].roundtrip,!!fixtures[0].operations), pool=[];
  // Try varied parts of the implementation before filling additional line slots.
  const ranked=groups.sort((a,b)=>a.line-b.line);
  const preferred=[];for(const category of ['state','loop','condition','update','return']){const match=ranked.find(g=>g.category===category);if(match)preferred.push(match);}
  for(const group of [...preferred,...ranked.filter(g=>!preferred.includes(g))]){
    if(pool.length>=5)break;
    const wrong=[], failKinds=new Set();
    const variants=[...group.variants.values()];
    for(const variant of variants){
      const witness=failureFor(id,variant.source,fixtures);if(!witness)continue;
      const key=witness.error?`error:${witness.error.type}:${variant.text}`:`result:${JSON.stringify(witness.actual)}:${variant.text}`;
      if(failKinds.has(key))continue;failKinds.add(key);
      wrong.push({id:`line-${group.line}-alternative-${wrong.length+1}`,label:witness.error?'Choose this statement':'Choose this statement',code:variant.text,correct:false,feedback:witness.error?`This statement breaks the implementation on “${witness.name}”: ${witness.error.message}`:`This changes the result on “${witness.name}”. Compare the actual output with the expected output below.`,witness});
      if(wrong.filter(choice=>!choice.witness.error).length>=3)break;
      if(wrong.length>=7)break;
    }
    wrong.sort((a,b)=>Number(!!a.witness.error)-Number(!!b.witness.error));
    if(wrong.length<2 || !wrong.some(choice=>!choice.witness.error || /Incorrect in-place output prefix|Clone shares input nodes/.test(choice.witness.error.message)))continue;
    const correct={id:`line-${group.line}-reference`,label:'Choose this statement',code:group.original,correct:true,feedback:'Correct. This statement keeps the worked implementation consistent with the problem’s requirements.'};
    const choices=shuffled([correct,...wrong.slice(0,3)],`${id}:javascript:${group.line}`);
    pool.push({id:`implementation-${group.line}`,stage:'implementation',prompt:prompts[group.category],context:contextFor(lines,group.line),line:group.line,endLine:group.line,choices});
  }
  pool.sort((a,b)=>a.line-b.line);
  // Avoid redundant decisions for tiny implementations and overly long lessons.
  const meaningful=lines.filter(line=>line.trim()&&!/^(?:\/\/|[{};]+$)/.test(line.trim())).length;
  const count=meaningful<=4?1:meaningful<=9?2:Math.min(4,pool.length);
  const questions=pool.slice(0,count);
  if(!questions.length)throw Error(`${id}: no implementation question has two verified wrong alternatives`);
  return questions;
}
function generateAll(input){
  const cachePath='/tmp/leetcode-guided-js.json';
  const metadataPath=cachePath+'.metadata.json';
  const output=fs.existsSync(cachePath)?JSON.parse(fs.readFileSync(cachePath,'utf8')):{};
  const metadata=fs.existsSync(metadataPath)?JSON.parse(fs.readFileSync(metadataPath,'utf8')):{};
  const generatorHash=digest([__filename,runtimePath,path.resolve(__dirname,'../walkthroughs/instrument.cjs'),path.resolve(__dirname,'../../src/components/logic/runtime/javascriptValidation.ts')].map(file=>fs.readFileSync(file,'utf8')).join('\n'));
  let count=0;const failures=[];
  for(const item of input){
    const fingerprint=digest(generatorHash+item.javascript+JSON.stringify(item.fixtures));
    if(output[item.id]?.sourceHash===digest(item.javascript)&&metadata[item.id]===fingerprint){count++;continue;}
    try {
    const source=item.javascript,questions=generateJavaScriptQuestions({id:item.id,source,fixtures:item.fixtures});
    const execution=instrument(source);
    output[item.id]={id:item.id,language:'javascript',source,sourceHash:digest(source),questions,execution:{code:execution.code,sites:execution.sites},validation:{correctCases:item.fixtures.length,wrongChoices:questions.reduce((n,q)=>n+q.choices.filter(c=>!c.correct).length,0),testedWitnesses:questions.reduce((n,q)=>n+q.choices.filter(c=>c.witness).length,0)}};
    fs.writeFileSync(cachePath,JSON.stringify(output));
    metadata[item.id]=fingerprint;fs.writeFileSync(metadataPath,JSON.stringify(metadata));
    } catch(error) {failures.push({id:item.id,error:error.message});console.log('Missing JS question:',item.id,error.message);}
    if(++count%25===0)console.log(`JavaScript guided decisions: ${count}/${input.length}`);
  }
  fs.writeFileSync('/tmp/leetcode-guided-js-failures.json',JSON.stringify(failures,null,2));if(failures.length)process.exitCode=1;
  return output;
}
if(require.main===module){
 const input=JSON.parse(fs.readFileSync(process.argv[2]||'/tmp/leetcode-guided-input.json','utf8'));
 const result=generateAll(input);fs.writeFileSync(process.argv[3]||'/tmp/leetcode-guided-js.json',JSON.stringify(result));console.log(`Generated JavaScript lessons for ${Object.keys(result).length} problems.`);
}
module.exports={generateJavaScriptQuestions,generateAll,optionsByLine};
