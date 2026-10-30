// Independent checks over the shipped recording format. This does not import the recorder.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const t = require('@babel/types');
const { root, walkthroughs } = require('./load.cjs');

function decoder(heap) {
  const cache=new Map();
  function decode(value) {
    if(!value||typeof value!=='object')return value;
    if('$scalar' in value) {
      const s=value.$scalar;
      if(s==='undefined')return undefined;
      if(s==='Infinity')return Infinity;
      if(s==='-Infinity')return -Infinity;
      if(s==='NaN')return NaN;
      if(s==='-0')return -0;
      if(/^-?\d+n$/.test(s))return BigInt(s.slice(0,-1));
      return s;
    }
    assert(value.$ref&&heap[value.$ref],`Dangling reference ${JSON.stringify(value)}`);
    if(cache.has(value.$ref))return cache.get(value.$ref);
    const object=heap[value.$ref];
    const out=object.kind==='array'?[]:object.kind==='set'?new Set():object.kind==='map'?new Map():{};
    cache.set(value.$ref,out);
    if(Array.isArray(out))object.items.forEach(v=>out.push(decode(v)));
    else if(out instanceof Set)object.items.forEach(v=>out.add(decode(v)));
    else if(out instanceof Map)object.entries.forEach(([k,v])=>out.set(decode(k),decode(v)));
    else for(const [key,v] of Object.entries(object.fields||{}))out[key]=decode(v);
    return out;
  }
  return decode;
}
const pureMethods=new Set(['has','get','includes','indexOf','lastIndexOf','charAt','charCodeAt','slice','substring','startsWith','endsWith','join','at']);
const scalarFunctions=new Set(['parseInt','parseFloat','Number','String','Boolean','BigInt','isNaN','isFinite']);
function safe(node) {
  if(t.isIdentifier(node)||t.isLiteral(node)||t.isThisExpression(node))return !t.isRegExpLiteral(node);
  if(t.isArrayExpression(node))return node.elements.every(n=>n===null||safe(n));
  if(t.isUnaryExpression(node))return node.operator!=='delete'&&safe(node.argument);
  if(t.isBinaryExpression(node)||t.isLogicalExpression(node))return safe(node.left)&&safe(node.right);
  if(t.isConditionalExpression(node))return safe(node.test)&&safe(node.consequent)&&safe(node.alternate);
  if(t.isMemberExpression(node))return safe(node.object)&&(!node.computed||safe(node.property));
  if(t.isCallExpression(node)) {
    if(!node.arguments.every(safe))return false;
    if(t.isIdentifier(node.callee))return scalarFunctions.has(node.callee.name);
    if(!t.isMemberExpression(node.callee)||node.callee.computed)return false;
    if(t.isIdentifier(node.callee.object,{name:'Math'}))return node.callee.property.name!=='random';
    return pureMethods.has(node.callee.property.name)&&safe(node.callee.object);
  }
  return false;
}
const astCache=new Map(),fnCache=new Map();
function expression(text) {
  if(!astCache.has(text)) {try{astCache.set(text,parser.parseExpression(text));}catch{astCache.set(text,null);}}
  return astCache.get(text);
}
function evaluate(text,state,heap) {
  const decode=decoder(heap), names=Object.keys(state).filter(name=>name!=='this');
  const key=names.join(',')+'\0'+text;
  if(!fnCache.has(key))fnCache.set(key,new Function(...names,`return (${text});`));
  return fnCache.get(key).apply(decode(state.this),names.map(name=>decode(state[name])));
}
function audit() {
  const stats={problems:new Set(walkthroughs.map(entry=>entry.id)).size,solutions:0,examples:0,steps:0,sourceSpans:0,conditions:0,initializers:0,mutations:0,errors:[]};
  for(const problem of walkthroughs) {
    const trace=JSON.parse(fs.readFileSync(path.join(root,'src/data/walkthroughs/generated',`${problem.key}.json`),'utf8'));
    const nodes=new Map(),parents=new Map();
    traverse(parser.parse(trace.code),{enter({node,parent}){nodes.set(`${node.start}:${node.end}`,node);parents.set(node,parent);}});
    stats.solutions++;
    for(const [exampleIndex,example] of trace.examples.entries()) {
      stats.examples++;let heap={},previousHeap={},previous;
      for(const [index,step] of example.steps.entries()) {
        previousHeap=heap;heap={...heap,...step.heap};stats.steps++;
        const context=`${problem.key}/${exampleIndex}/${index} line ${step.line}: ${step.label}`;
        try {
          const sourceNode=nodes.get(`${step.start}:${step.end}`);
          assert(sourceNode,'Recorded action does not match an original source node');
          assert.equal(step.line,sourceNode.loc.start.line);
          const last=['iterate','loop-end'].includes(step.kind)?step.line:step.kind==='call'?sourceNode.body.loc.start.line:sourceNode.loc.end.line;
          const expectedLines=Array.from({length:last-step.line+1},(_,i)=>step.line+i).filter(line=>trace.code.split('\n')[line-1].trim()&&!trace.code.split('\n')[line-1].trim().startsWith('//'));
          assert.deepEqual(step.lines,expectedLines,'Highlighted range does not match the original action');
          if(!['call','iterate','loop-end'].includes(step.kind))assert.equal(step.label,trace.code.slice(step.start,step.end).replace(/\s+/g,' ').trim(),'Label does not match highlighted source');
          stats.sourceSpans++;
          // A standalone mutating call is already the whole statement. Ensure
          // none of the shipped examples advances to an artificial second step.
          if(step.kind==='operation' && t.isExpressionStatement(parents.get(sourceNode))) {
            const parent=parents.get(sourceNode),next=example.steps[index+1];
            assert(!(next?.kind==='statement'&&next.start===parent.start&&next.end===parent.end), 'Mutation is followed by a duplicate enclosing statement');
          }
          const decode=decoder(heap);
          // Check all references and reconstructed values, not only what the UI chooses to show.
          Object.values(step.state).forEach(decode);Object.values(step.input).forEach(decode);decode(step.value);
          if(step.kind==='check') {
            const ast=expression(step.label);
            if(ast&&safe(ast)) {
              let actual,available=true;
              try{actual=evaluate(step.label,step.state,heap);}catch(error){if(error instanceof ReferenceError||error instanceof TypeError)available=false;else throw error;}
              if(available){assert.deepEqual(actual,decode(step.value),'Condition value does not match its recorded variables');stats.conditions++;}
            }
          }
          if(step.kind==='statement'&&/^(const|let|var)\s/.test(step.label)) {
            const declaration=parser.parse(step.label).program.body[0];
            for(const variable of declaration.declarations||[])if(t.isIdentifier(variable.id)&&variable.init&&safe(variable.init)) {
              const text=step.label.slice(variable.init.start,variable.init.end);
              let actual,available=true;
              try{actual=evaluate(text,step.state,heap);}catch(error){if(error instanceof ReferenceError||error instanceof TypeError)available=false;else throw error;}
              if(available){assert.deepEqual(actual,decode(step.state[variable.id.name]),'Initialized variable differs from its source expression');stats.initializers++;}
            }
          }
          if(step.kind==='operation'&&previous&&JSON.stringify(previous.stack)===JSON.stringify(step.stack)) {
            const ast=expression(step.label);
            if(t.isCallExpression(ast)&&t.isMemberExpression(ast.callee)&&!ast.callee.computed&&safe(ast.callee.object)&&ast.arguments.every(safe)) {
              const receiverText=step.label.slice(ast.callee.object.start,ast.callee.object.end);
              const method=ast.callee.property.name;
              let before,after,args,available=true;
              try {
                // Evaluate target and arguments together so aliases and Map key identity are shared.
                [before,args]=evaluate(`[${receiverText},[${ast.arguments.map(a=>step.label.slice(a.start,a.end)).join(',')}]]`,previous.state,previousHeap);
                after=evaluate(receiverText,step.state,heap);
              } catch(error){if(error instanceof ReferenceError||error instanceof TypeError)available=false;else throw error;}
              const native=available&&(Array.isArray(before)&&['pop','push','shift','unshift','splice','reverse','fill'].includes(method)||before instanceof Map&&['set','delete','clear'].includes(method)||before instanceof Set&&['add','delete','clear'].includes(method));
              if(native){const result=before[method](...args);assert.deepEqual(before,after,'Mutation state differs from native operation');assert.deepEqual(result,decode(step.value),'Mutation return value differs');stats.mutations++;}
            }
          }
        } catch(error) {stats.errors.push(`${context}\n${error.message}`);}
        previous=step;
      }
    }
  }
  return stats;
}
if(require.main===module){const report=audit();fs.writeFileSync('/tmp/leetcode-independent-audit.json',JSON.stringify(report,null,2));console.log(JSON.stringify({...report,errors:report.errors.slice(0,30)},null,2));if(report.errors.length)process.exitCode=1;}
module.exports={decoder,audit,evaluate};
