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
const { runJavaScript } = require('../../src/components/logic/runtime/javascriptExecution.ts');
const vm = require('node:vm');
const runtimePath = path.resolve(__dirname, '../walkthroughs/runtime.cjs');
const bounded = new Module(runtimePath, module);
bounded.filename = runtimePath; bounded.paths = Module._nodeModulePaths(path.dirname(runtimePath));
bounded._compile(fs.readFileSync(runtimePath, 'utf8').replace('timeout: 15000', 'timeout: 120').replace('JSON.stringify(__args[0].slice(0,__returned)) !== JSON.stringify(__case.prefix)', 'JSON.stringify(__problemId === 27 ? __args[0].slice(0,__returned).sort((a,b)=>a-b) : __args[0].slice(0,__returned)) !== JSON.stringify(__problemId === 27 ? [...__case.prefix].sort((a,b)=>a-b) : __case.prefix)'), runtimePath);
const fastExecute = bounded.exports.execute;
const digest = text => crypto.createHash('sha256').update(text).digest('hex');
let witnessCache = new Map();
function shuffled(items, salt) {
  const result = [...items]; let seed = parseInt(digest(salt).slice(0,8),16);
  for (let i = result.length - 1; i > 0; i--) { seed = (Math.imul(seed,1664525)+1013904223)>>>0; const j=seed%(i+1); [result[i],result[j]]=[result[j],result[i]]; }
  return result;
}
function statementInventory(source, entry, roundtrip, design) {
  const ast=parser.parse(source), lines=source.split('\n'), ranges=[], entries=new Set([entry,roundtrip,'isAlphanumeric'].filter(Boolean));
  traverse(ast,{FunctionDeclaration(p){if(entries.has(p.node.id?.name)||p.parentPath.isProgram()&&!['heapPush','heapPop'].includes(p.node.id?.name))ranges.push([p.node.start,p.node.end]);},VariableDeclarator(p){if(p.node.init&&(entries.has(p.node.id.name)||p.parentPath.parentPath.isProgram()&&['FunctionExpression','ArrowFunctionExpression'].includes(p.node.init.type)))ranges.push([p.node.init.type==='ArrowFunctionExpression'&&p.node.init.body.type!=='BlockStatement'?p.parentPath.node.start:p.node.init.start,p.node.init.end]);},ClassDeclaration(p){if(entries.has(p.node.id?.name))ranges.push([p.node.start,p.node.end]);},AssignmentExpression(p){if(design&&source.slice(p.node.left.start,p.node.left.end).startsWith(entry+'.prototype.'))ranges.push([p.node.start,p.node.end]);}});
  const inside=node=>ranges.some(([start,end])=>node.start>=start&&node.end<=end), raw=[], supplied=[];
  for(const node of ast.program.body)if(['ClassDeclaration','FunctionDeclaration'].includes(node.type)&&!entries.has(node.id?.name)&&['MinHeap','DLLNode','heapPush','heapPop'].includes(node.id?.name))supplied.push({line:node.loc.start.line,endLine:node.loc.end.line,reason:`Supplied ${node.id.name} infrastructure. The lesson quizzes the algorithm's use of this heap or node container; the reusable implementation is shown in the completed source.`});
  traverse(ast,{enter(p){
    const n=p.node;if(!inside(n))return;
    let category,end=n.loc?.end.line;
    if(p.isVariableDeclaration()) { if(p.parentPath.isForStatement()||p.parentPath.isForOfStatement()||p.parentPath.isForInStatement()||n.declarations.every(d=>d.init&&['FunctionExpression','ArrowFunctionExpression'].includes(d.init.type)&&d.init.body.type==='BlockStatement'))return;category='state'; }
    else if(p.isExpressionStatement()) { if(n.expression.type==='AssignmentExpression'&&['FunctionExpression','ArrowFunctionExpression'].includes(n.expression.right.type))return;category='update'; }
    else if(p.isReturnStatement())category='return';
    else if(p.isIfStatement()) {category='condition';end=n.test.loc.end.line;if(n.consequent.type==='BlockStatement'&&n.consequent.body.some(child=>child.type==='ReturnStatement'&&!child.argument))end=n.consequent.loc.end.line;else if(n.consequent.type==='ReturnStatement'&&!n.consequent.argument)end=n.consequent.loc.end.line;}
    else if(p.isForStatement()||p.isForOfStatement()||p.isForInStatement()||p.isWhileStatement()||p.isDoWhileStatement()){category='loop';end=n.body.loc.start.line;}
    else if(p.isBreakStatement()||p.isContinueStatement()||p.isThrowStatement())category='update';
    else return;
    // A multiline callback has its own decisions; do not swallow its body in
    // the outer declaration/return expression's physical source range.
    if(end>n.loc.start.line&&['state','return','update'].includes(category)){
      let callbackStart; p.traverse({Function(inner){if(inner.node.body.type==='BlockStatement'&&inner.node.loc.start.line<end){callbackStart=Math.min(callbackStart??Infinity,inner.node.body.loc.start.line);inner.skip();}}});
      if(callbackStart!==undefined)end=callbackStart;
    }
    const fn=p.getFunctionParent();if(!fn)return;
    const line=n.loc.start.line;
    raw.push({line,endLine:Math.max(line,end),category,functionStart:fn.node.start,returnLine:p.isReturnStatement()?line:undefined});
  }});
  raw.sort((a,b)=>a.line-b.line||a.endLine-b.endLine);
  const units=[];
  for(const item of raw){const previous=units[units.length-1];if(previous&&item.line<=previous.endLine){previous.endLine=Math.max(previous.endLine,item.endLine);if(item.returnLine)previous.returnLines.push(item.returnLine);}else units.push({...item,returnLines:item.returnLine?[item.returnLine]:[]});}
  const offsets=[];let position=0;for(const line of lines){offsets.push(position);position+=line.length+1;}
  for(const unit of units){unit.start=offsets[unit.line-1];unit.end=offsets[unit.endLine-1]+lines[unit.endLine-1].length;unit.original=source.slice(unit.start,unit.end);unit.requiredLines=Array.from({length:unit.endLine-unit.line+1},(_,i)=>unit.line+i).filter(line=>lines[line-1].trim()&&!/^\s*\/\//.test(lines[line-1])&&!/^[\s{}()[\],.;]+$/.test(lines[line-1]));}
  const lastByFunction=new Map();for(const unit of units)lastByFunction.set(unit.functionStart,unit);
  const conciseLines=[];traverse(ast,{Function(p){if(inside(p.node)&&p.node.body.type!=='BlockStatement')conciseLines.push(p.node.body.loc.start.line);}});
  const terminalLines=[...new Set([...conciseLines,...units.flatMap(unit=>unit.returnLines),...[...lastByFunction.values()].map(unit=>unit.requiredLines.at(-1)).filter(Number.isInteger)])].sort((a,b)=>a-b);
  return {ast,lines,units,terminalLines,supplied};
}
function optionsByLine(source, entry, roundtrip, design, fixtures=[]) {
  const inventory=statementInventory(source,entry,roundtrip,design),{ast,lines,units}=inventory;
  const groups=new Map(units.map(unit=>[unit.line,{...unit,variants:new Map()}]));
  let parameterNames=fixtures[0]?.params||[];if(!parameterNames.length)traverse(ast,{VariableDeclarator(p){if(p.node.id.name===entry&&p.node.init?.params)parameterNames=p.node.init.params.map(node=>node.name);},ClassMethod(p){if(p.node.kind==='constructor'&&p.parentPath.parentPath.node.id?.name===entry)parameterNames=p.node.params.map(node=>node.name);}});
  const primaryArgs=new Map(parameterNames.map((name,index)=>[name,fixtures[0].args[index]]));
  const strings=[];traverse(ast,{StringLiteral(p){if(!strings.includes(p.node.value))strings.push(p.node.value);}});
  const numbers=[],primitives=[];function collectNumbers(value){if(['number','string'].includes(typeof value)&&!primitives.includes(value))primitives.push(value);if(typeof value==='number'&&!numbers.includes(value))numbers.push(value);else if(Array.isArray(value))value.forEach(collectNumbers);else if(value&&typeof value==='object')Object.values(value).forEach(collectNumbers);}fixtures.forEach(fixture=>{collectNumbers(fixture.args);for(const operation of fixture.operations||[])collectNumbers(operation[1]);});
  const setterKinds=new Map(),pairArrays=new Set();traverse(ast,{CallExpression(p){const n=p.node;if(n.callee.type!=='MemberExpression'||n.callee.computed)return;const target=source.slice(n.callee.object.start,n.callee.object.end);if(n.callee.property.name==='set'&&n.arguments.length===2){const value=n.arguments[1];if(value.type==='NewExpression'&&['Map','Set'].includes(value.callee.name))setterKinds.set(target,value.callee.name);else if(value.type==='ArrayExpression')setterKinds.set(target,'Array');}if(n.callee.property.name==='push'&&n.arguments[0]?.type==='ArrayExpression')pairArrays.add(target);}});
  function targetOf(p){const parent=p.parentPath;return parent.isVariableDeclarator()&&parent.node.init===p.node?source.slice(parent.node.id.start,parent.node.id.end):parent.isAssignmentExpression()&&parent.node.right===p.node?source.slice(parent.node.left.start,parent.node.left.end):'';}
  function expectedKind(p){
    if(!design){if(['tree','list','randomList','graph','node','quad'].includes(fixtures[0]?.output))return 'node';const value=fixtures[0]?.expected;return Array.isArray(value)?'array':typeof value;}
    const fn=p.getFunctionParent(),parent=fn?.parentPath;
    const method=parent?.isAssignmentExpression()?source.slice(parent.node.left.start,parent.node.left.end).split('.').pop():fn?.node.key?.name;
    for(const fixture of fixtures)for(const [index,operation] of (fixture.operations||[]).entries())if(operation[0]===method){const value=fixture.expected[index+1];if(value!==null&&value!==undefined)return Array.isArray(value)?'array':typeof value;}
    return 'unknown';
  }
  function shape(node,p,seen=new Set()) {
    if(!node)return 'unknown';
    if(node.type==='ArrayExpression'||node.type==='NewExpression'&&node.callee.name==='Array')return 'array';
    if(node.type==='NewExpression'&&['Map','Set'].includes(node.callee.name))return node.callee.name.toLowerCase();
    if(node.type==='BooleanLiteral'||node.type==='LogicalExpression'||node.type==='UnaryExpression'&&node.operator==='!'||node.type==='BinaryExpression'&&['===','!==','<','<=','>','>=','in','instanceof'].includes(node.operator))return 'boolean';
    if(node.type==='NumericLiteral'||node.type==='BinaryExpression'||node.type==='UnaryExpression'&&['+','-','~'].includes(node.operator))return 'number';
    if(node.type==='StringLiteral'||node.type==='TemplateLiteral')return 'string';
    if(node.type==='NullLiteral'||node.type==='NewExpression'&&/Node$/.test(node.callee.name))return 'node';
    if(node.type==='MemberExpression'&&!node.computed){if(['length','size'].includes(node.property.name))return 'number';if(['next','left','right','prev'].includes(node.property.name))return 'node';}
    if(node.type==='CallExpression'&&node.callee.type==='MemberExpression'){const name=node.callee.property.name;if(['map','filter','slice','concat','split','from','flat','flatMap','fill','reverse'].includes(name))return 'array';if(['has','includes','every','some','isArray'].includes(name))return 'boolean';if(['join','substring','substr','toString','repeat'].includes(name))return 'string';if(['min','max','floor','ceil','round','abs','pow','size'].includes(name))return 'number';}
    if(node.type==='Identifier'&&!seen.has(node.name)){
      const visited=new Set(seen).add(node.name),binding=p.scope.getBinding(node.name);
      if(binding?.path.isVariableDeclarator())return shape(binding.path.node.init,binding.path,visited);
      const value=primaryArgs.get(node.name);if(Array.isArray(value))return 'array';if(typeof value==='string')return 'string';if(typeof value==='number')return 'number';if(typeof value==='boolean')return 'boolean';if(value&&typeof value==='object')return 'node';
    }
    return 'unknown';
  }
  function candidate(node, replacements, category, reason) {
    if (!node.loc) return;
    const group=[...groups.values()].find(unit=>node.start>=unit.start&&node.end<=unit.end);if(!group)return;
    for(const replacement of replacements){
      const text=source.slice(node.start,node.end); if(replacement===text)continue;
      const mutated=source.slice(0,node.start)+replacement+source.slice(node.end);
      const edited=source.slice(group.start,node.start)+replacement+source.slice(node.end,group.end);if(edited===group.original||group.variants.has(edited))continue;
      group.variants.set(edited,{source:mutated,text:edited,reason,change:{start:node.start,end:node.end}});
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
    StringLiteral(p){candidate(p.node,strings.filter(value=>value!==p.node.value).slice(0,10).map(JSON.stringify),categoryFor(p),'mapping');},
    NullLiteral(p){const names=Object.keys(p.scope.getAllBindings()).filter(name=>/^(head|root|prev|current|node|slow|fast|left|right)$/.test(name));candidate(p.node,names,categoryFor(p),'state');},
    Identifier(p){if(!p.isReferencedIdentifier())return;const bindings=p.scope.getAllBindings(),kind=shape(p.node,p);const names=Object.keys(bindings).filter(name=>name!==p.node.name&&bindings[name].identifier.start<p.node.start&&bindings[name].kind!=='hoisted'&&!['FunctionExpression','ArrowFunctionExpression'].includes(bindings[name].path.node.init?.type)&&shape({type:'Identifier',name},p)===kind);candidate(p.node,names.slice(0,12),categoryFor(p),'binding');},
    BooleanLiteral(p){candidate(p.node,[String(!p.node.value)],categoryFor(p),'boolean');},
    ArrayExpression(p){if(!p.node.elements.length){const target=targetOf(p);candidate(p.node,pairArrays.has(target)?numbers.slice(0,8).flatMap(value=>[`[[${value},1]]`,`[[${value},2]]`]):[...new Set([0,1,-1,...numbers.slice(0,16)])].map(number=>`[${number}]`),categoryFor(p),'initial-content');}else if(p.node.elements.length===2){const [first,second]=p.node.elements;if(first&&second)candidate(p.node,[`[${source.slice(second.start,second.end)}, ${source.slice(first.start,first.end)}]`],categoryFor(p),'order');}},
    ObjectExpression(p){if(p.node.properties.length)return;const variants=[];if(source.includes("['#'] = true")){const words=[...new Set(fixtures.flatMap(fixture=>(fixture.operations||[]).filter(([method,args],index)=>typeof args[0]==='string'&&fixture.expected[index+1]===false).map(([,args])=>args[0].replace(/\./g,'a'))))];for(const word of words){let node={'#':true};for(const char of [...word].reverse())node={[char]:node};variants.push(JSON.stringify(node));}}for(const fixture of fixtures)for(const [method,args] of fixture.operations||[])if(method==='set'&&typeof args[0]==='string'&&typeof args[1]==='string'&&typeof args[2]==='number')variants.push(JSON.stringify({[args[0]]:[[args[2]+1,args[1]]]}));candidate(p.node,variants,categoryFor(p),'empty-state');},
    UpdateExpression(p){const n=p.node;candidate(n,[n.prefix?`${n.operator==='++'?'--':'++'}${source.slice(n.argument.start,n.argument.end)}`:`${source.slice(n.argument.start,n.argument.end)}${n.operator==='++'?'--':'++'}`],categoryFor(p),'progress');},
    AssignmentExpression(p){const n=p.node;const op={'+=':'-=','-=':'+=','*=':'+='}[n.operator];if(op)candidate(n,[`${source.slice(n.left.start,n.left.end)} ${op} ${source.slice(n.right.start,n.right.end)}`], 'update','update');if(n.operator==='='&&shape(n.right,p)==='number'){const expression=source.slice(n.right.start,n.right.end);candidate(n.right,[`(${expression}) + 1`,`(${expression}) - 1`],'update','progress');}},
    MemberExpression(p){const n=p.node;if(n.computed){const property=source.slice(n.property.start,n.property.end);candidate(n.property,[`(${property}) + 1`,`(${property}) - 1`],categoryFor(p),'index');}else if(n.property.type==='Identifier'){
      if(n.property.name==='next')candidate(n,[source.slice(n.object.start,n.object.end),source.slice(n.start,n.end)+'.next','null'],categoryFor(p),'pointer');
      const alternatives={min:['max'],max:['min'],floor:['ceil','round'],ceil:['floor','round'],push:['unshift'],unshift:['push'],pop:['shift'],shift:['pop'],add:['delete'],delete:['add'],get:['has'],left:['right'],right:['left']};
      candidate(n.property,alternatives[n.property.name]||[],categoryFor(p),'operation');
    }},
    CallExpression(p){const n=p.node;if(n.callee.type!=='MemberExpression'||n.callee.computed)return;const method=n.callee.property.name,object=source.slice(n.callee.object.start,n.callee.object.end),args=n.arguments.map(arg=>source.slice(arg.start,arg.end));
      if(method==='pop'||method==='shift')candidate(n,[`${object}[0]`,`${object}[${object}.length - 1]`,`${object}.${method==='pop'?'shift':'pop'}()`],categoryFor(p),'remove-versus-read');
      if(['push','unshift'].includes(method)&&args.length){candidate(n,[`${object}.${method==='push'?'unshift':'push'}(${args.join(', ')})`,`${object}.${method}(${args.concat(args).join(', ')})`],categoryFor(p),'ordered-update');for(const arg of n.arguments){const text=source.slice(arg.start,arg.end);if(shape(arg,p)==='number'||arg.type==='Identifier'&&/^(i|j|index|value|val)$/.test(arg.name))candidate(arg,[`(${text}) + 1`,`(${text}) - 1`],categoryFor(p),'index');}}
      if(method==='set'&&n.arguments.length===2)candidate(n,[`${object}.set(${args[1]}, ${args[0]})`,`${object}.set(${args[0]}, ${args[0]})`,`${object}.set(${args[1]}, ${args[1]})`],categoryFor(p),'key-value');
      if(method==='sort')candidate(n,[`${object}.reverse()`,`${object}.slice()`],categoryFor(p),'ordering');
      if(method==='join')candidate(n,[`${object}.map(value => value === 'null' ? value : String(Number(value) + 1)).join(${args.join(', ')})`,`${object}.slice().reverse().join(${args.join(', ')})`],categoryFor(p),'serialized-output');
      if(method==='reverse')candidate(n,[`${object}.slice()`,`${object}.sort((a,b)=>a-b)`],categoryFor(p),'ordering');
      if(method==='fill'&&n.arguments.length)candidate(n.arguments[0],['-1','1'],categoryFor(p),'default-value');
      if(method==='map'){candidate(n,[source.slice(n.start,n.end)+'.slice(1)',source.slice(n.start,n.end)+'.slice(0, -1)'],categoryFor(p),'allocation-size');if(n.arguments[0]?.type==='ArrowFunctionExpression'&&n.arguments[0].body.type==='ArrayExpression'&&!n.arguments[0].body.elements.length&&source.includes('.push(['))candidate(n.arguments[0].body,numbers.slice(0,10).map(value=>`[[${value}, 0]]`),categoryFor(p),'empty-buckets');}
      if(method==='map'&&n.arguments[0]?.type==='ArrowFunctionExpression'&&n.arguments[0].body.type==='NewExpression')candidate(n,[`${object}.fill(${source.slice(n.arguments[0].body.start,n.arguments[0].body.end)})`],categoryFor(p),'independent-containers');
    },
    NewExpression(p){const n=p.node;for(const arg of n.arguments)if(shape(arg,p)==='boolean')candidate(arg,[`!(${source.slice(arg.start,arg.end)})`],categoryFor(p),'node-value');if(['Map','Set'].includes(n.callee.name)&&!n.arguments.length){const variants=[];const valueKind=setterKinds.get(targetOf(p));if(n.callee.name==='Map'&&valueKind)for(const key of primitives.slice(0,6))for(const value of primitives.slice(0,6)){const item=valueKind==='Set'?`new Set([${JSON.stringify(value)}])`:valueKind==='Map'?`new Map([[${JSON.stringify(value)},1]])`:`[${JSON.stringify(value)}]`;variants.push(`new Map([[${JSON.stringify(key)},${item}]])`);}else variants.push(...primitives.slice(0,12).map(value=>n.callee.name==='Set'?`new Set([${JSON.stringify(value)}])`:`new Map([[${JSON.stringify(value)}, ${JSON.stringify(value)}]])`));candidate(n,variants,categoryFor(p),'premature-state');}},
    UnaryExpression(p){if(['-','+','!','~'].includes(p.node.operator))candidate(p.node,[source.slice(p.node.argument.start,p.node.argument.end)],categoryFor(p),'sign-or-negation');},
    ReturnStatement(p){const n=p.node;if(!n.argument){candidate(n,[';','continue;','break;'],'return','exit-control');return;}const expression=source.slice(n.argument.start,n.argument.end);let kind=shape(n.argument,p);const variants=[];
      if(kind==='unknown')kind=expectedKind(p);
      if(kind==='array'){variants.push(`(${expression}).slice(1)`,`(${expression}).slice(0, -1)`,`(${expression}).concat(${expression})`,`(${expression}).slice().reverse()`);if(n.argument.type==='ArrayExpression'&&!n.argument.elements.length)variants.push('[0]','[[]]','[1]');}
      else if(kind==='boolean'&&n.argument.type!=='BooleanLiteral')variants.push(`!(${expression})`);
      else if(kind==='number')variants.push(`(${expression}) + 1`,`(${expression}) - 1`,`(${expression}) * 2`);
      else if(kind==='string'){variants.push(`(${expression}).slice(1)`,`(${expression}).slice(0, -1)`,`(${expression}).repeat(2)`);if(n.argument.type==='StringLiteral'&&!n.argument.value)variants.push(...[...primaryArgs].filter(([,value])=>typeof value==='string').map(([name])=>name),JSON.stringify('a'));}
      else if(kind==='node'&&n.argument.type!=='NullLiteral'){variants.push(`(${expression})?.next ?? null`,`(${expression})?.left ?? null`,`(${expression})?.right ?? null`);if(fixtures[0]?.output==='quad')variants.push(`Object.assign(${expression}, {isLeaf:true,val:false})`,`Object.assign(${expression}, {isLeaf:true,val:true})`);}
      else if(kind==='node'&&n.argument.type==='NullLiteral'){const constructor=fixtures[0]?.output==='tree'?'TreeNode':fixtures[0]?.output==='list'?'ListNode':['graph','randomList'].includes(fixtures[0]?.output)?'Node':null;if(constructor)variants.push(`new ${constructor}(0)`,`new ${constructor}(1)`);}
      candidate(n.argument,variants,'return','output-shape');},
    VariableDeclarator(p){const n=p.node;
      if(n.init?.type==='ArrayExpression')candidate(n.init,['[0]','[1]','[-1]',...[...primaryArgs].filter(([,value])=>Array.isArray(value)).flatMap(([name])=>[`[${name}.length - 1]`,`Array.from({length:${name}.length}, (_,index)=>index)`])], 'state','initial-content');
      if(n.init?.type==='NewExpression'&&n.init.callee.type==='Identifier'&&['Map','Set'].includes(n.init.callee.name)){
        const arrays=[...primaryArgs].filter(([,value])=>Array.isArray(value)||typeof value==='string').map(([name])=>name);
        candidate(n.init,arrays.flatMap(name=>n.init.callee.name==='Map'?[`new Map(Array.from(${name}, (value,index)=>[value,index]))`,`new Map([[${name}[0],0]])`]:[`new Set(${name})`,`new Set([${name}[0]])`]), 'state','premature-state');
      }
      if(n.init&&shape(n.init,p)==='number'){const expression=source.slice(n.init.start,n.init.end);candidate(n.init,[`(${expression}) + 1`,`(${expression}) - 1`],'state','initial-boundary');}
    },
    IfStatement(p){const n=p.node;candidate(n.test,[`!(${source.slice(n.test.start,n.test.end)})`],'condition','branch');},
    ForStatement(p){const test=p.node.test;if(test?.type==='BinaryExpression'){const bound=source.slice(test.right.start,test.right.end);candidate(test.right,[`(${bound}) - 1`,`(${bound}) + 1`],'loop','last-boundary');}},
    ForOfStatement(p){const n=p.node,expression=source.slice(n.right.start,n.right.end);candidate(n.right,[`Array.from(${expression}).slice(1)`,`Array.from(${expression}).slice(0,-1)`],'loop','iteration');},
  });
  const result=[...groups.values()];result.inventory=inventory;return result;
}
function semanticCode(source){
  try {const ast=parser.parse(source);traverse(ast,{BinaryExpression:{exit(p){const {left,right,operator}=p.node;if(left.type!=='NumericLiteral'||right.type!=='NumericLiteral')return;const values={'+':()=>left.value+right.value,'-':()=>left.value-right.value,'*':()=>left.value*right.value,'/':()=>left.value/right.value,'%':()=>left.value%right.value};const value=values[operator]?.();if(Number.isFinite(value)&&value>=0)p.replaceWith({type:'NumericLiteral',value});}}});return JSON.stringify(ast,(key,value)=>['start','end','loc','extra','leadingComments','innerComments','trailingComments','comments','tokens'].includes(key)?undefined:value);}catch{return source;}
}
const prompts={state:'Which value or structure should we initialize here?',loop:'Which loop bounds and progress rule should we use?',condition:'Which condition should control this decision?',update:'How should we update the stored state here?',return:'What should we return at this point?'};
function failureFor(id, source, fixtures) {
  const key=digest(source+JSON.stringify(fixtures));if(witnessCache.has(key)){const proof=witnessCache.get(key);return proof?.error&&/is not a function|Maximum call stack size exceeded|timed out|loops finish/.test(proof.error.message)?null:proof;}
  const result=findFailure(id,source,fixtures);witnessCache.set(key,result);return result;
}
function findFailure(id, source, fixtures) {
  try {parser.parse(source);} catch{return null;}
  const ordered=fixtures.map((f,index)=>({f,index})).sort((a,b)=>JSON.stringify(a.f.args).length-JSON.stringify(b.f.args).length);
  for(const {f,index} of ordered){
    try {
      const actual=fastExecute(source,f,id,false).result;
      if(!validateJavaScriptResult(actual,f,id))return confirmFailure(id,source,f,index);
    } catch(error){
      if(/SyntaxError|ReferenceError|is not defined|Script execution timed out|Maximum call stack size exceeded|heap out of memory/.test(`${error.name} ${error.message}`))return null;
      return confirmFailure(id,source,f,index);
    }
  }
  return null;
}
function confirmFailure(id,source,fixture,index){
  try{
    const request={problemId:id,code:source,execution:instrument(source),fixtures:[fixture]};
    const test=vm.runInNewContext('run(request,{frames:2,events:50000,milliseconds:200})',{run:runJavaScript,request},{timeout:750}).tests[0];
    if(test.passed||test.error&&/SyntaxError|ReferenceError|is not defined|is not a function|timed out|loops finish|Maximum call stack size exceeded/.test(`${test.error.type} ${test.error.message}`))return null;
    return {fixtureIndex:index,name:fixture.name,input:fixture.args,...(fixture.operations?{operations:fixture.operations}:{}),expected:fixture.expected,...(test.error?{error:{type:test.error.type,message:test.error.message}}:{actual:test.actual})};
  }catch{return null;}
}
function contextFor(lines,line) {
  const start=Math.max(0,line-5);
  return [...lines.slice(start,line-1).map((text,i)=>({text,line:start+i+1})).filter(({text})=>text.trim()&&!/^\s*\/\//.test(text)).map(({text,line})=>`${line}  ${text}`),`${line}  ${lines[line-1].match(/^\s*/)[0]}// Choose the missing statement.`].join('\n');
}
function generateJavaScriptQuestions({id,source,fixtures}) {
  const lines=source.split('\n'),visited=new Set();
  for(const f of fixtures){const actual=execute(source,f,id,true);if(!validateJavaScriptResult(actual.result,f,id))throw Error(`${id}: reference fails ${f.name}`);for(const step of actual.steps)for(const line of step.lines||[step.line])visited.add(line);}
  const groups=optionsByLine(source,fixtures[0].entry,fixtures[0].roundtrip,!!fixtures[0].operations,fixtures), pool=[];
  const contextLines=lines.map(line=>line.split(''));for(const comment of groups.inventory.ast.comments||[])for(let line=comment.loc.start.line;line<=comment.loc.end.line;line++){const start=line===comment.loc.start.line?comment.loc.start.column:0,end=line===comment.loc.end.line?comment.loc.end.column:contextLines[line-1].length;for(let column=start;column<end;column++)contextLines[line-1][column]=' ';}for(let index=0;index<contextLines.length;index++)contextLines[index]=contextLines[index].join('').trimEnd();
  for(const group of groups){
    const wrong=[], failKinds=new Set(),semanticChoices=new Set([semanticCode(source)]);
    const variants=[...group.variants.values()],targetLines=[...new Set([...groups.inventory.terminalLines.filter(line=>line>=group.line&&line<=group.endLine),...group.returnLines.flatMap(line=>{const previous=group.requiredLines.filter(candidate=>candidate<line).at(-1);return previous?[previous]:[];})])];
    const covers=(choice,line)=>choice.code.split('\n')[line-group.line]!==lines[line-1];
    for(const variant of variants){
      const semantic=semanticCode(variant.source);if(semanticChoices.has(semantic))continue;const witness=failureFor(id,variant.source,fixtures);if(!witness)continue;semanticChoices.add(semantic);
      const key=witness.error?`error:${witness.error.type}:${variant.text}`:`result:${JSON.stringify(witness.actual)}:${variant.text}`;
      if(failKinds.has(key))continue;failKinds.add(key);
      wrong.push({id:`line-${group.line}-alternative-${wrong.length+1}`,label:witness.error?'Choose this statement':'Choose this statement',code:variant.text,correct:false,_change:variant.change,_reason:variant.reason,feedback:witness.error?`This statement breaks the implementation on “${witness.name}”: ${witness.error.message}`:`This changes the result on “${witness.name}”. Compare the actual output with the expected output below.`,witness});
      if(wrong.filter(choice=>!choice.witness.error).length>=3&&targetLines.every(line=>wrong.some(choice=>covers(choice,line))))break;
      if(wrong.length>=12&&targetLines.every(line=>wrong.some(choice=>covers(choice,line))))break;
    }
    wrong.sort((a,b)=>Number(!!a.witness.error)-Number(!!b.witness.error));
    if(!wrong.length)continue;
    const correct={id:`line-${group.line}-reference`,label:'Choose this statement',code:group.original,correct:true,feedback:'Correct. This statement keeps the worked implementation consistent with the problem’s requirements.'};
    const selected=[];for(const line of targetLines){if(selected.some(choice=>covers(choice,line)))continue;const choice=wrong.find(choice=>covers(choice,line));if(choice)selected.push(choice);}for(const choice of wrong)if(!selected.some(previous=>previous._reason===choice._reason))selected.push(choice);for(const choice of wrong)if(!selected.includes(choice))selected.push(choice);
    const choices=shuffled([correct,...selected.slice(0,Math.max(3,targetLines.length))],`${id}:javascript:${group.line}`);
    pool.push({id:`implementation-${group.line}`,stage:'implementation',prompt:prompts[group.category],context:contextFor(contextLines,group.line),line:group.line,endLine:group.endLine,choices,_unit:group});
  }
  pool.sort((a,b)=>a.line-b.line);
  if(!pool.length)throw Error(`${id}: no implementation question has a verified meaningful wrong alternative`);
  // Each unquizzable neighboring statement is visible inside the next tested
  // block. The tail is included with the last decision, never silently omitted.
  const units=groups.inventory.units;
  for(let index=0;index<pool.length;index++){
    const question=pool[index],previous=pool[index-1];
    const first=units.find(unit=>unit.line>(previous?previous.endLine:0));
    const start=first?.line??question.line,end=index===pool.length-1?units[units.length-1].endLine:question.endLine;
    const prefix=lines.slice(start-1,question.line-1).join('\n'),suffix=lines.slice(question.endLine,end).join('\n');
    for(const choice of question.choices)choice.code=[prefix,choice.code,suffix].filter(Boolean).join('\n');
    question.line=start;question.endLine=end;
    question.coveredLines=units.filter(unit=>unit.line>=start&&unit.endLine<=end).flatMap(unit=>unit.requiredLines);
    question.decisionLines=question._unit.requiredLines.filter(line=>question.choices.some(choice=>!choice.correct&&choice.code.split('\n')[line-start]!==lines[line-1]));
    question.context=contextFor(contextLines,start);
    if(start!==question._unit.line||end!==question._unit.endLine)question.prompt='Which code block completes this part of the algorithm?';
    const guardedReturns=[];traverse(groups.inventory.ast,{ReturnStatement(p){if(p.node.argument)return;const parent=p.parentPath;const guard=parent.isIfStatement()&&parent.node.consequent===p.node?parent:parent.isBlockStatement()&&parent.parentPath.isIfStatement()&&parent.parentPath.node.consequent===parent.node?parent.parentPath:null;if(!guard)return;const line=p.node.loc.start.line,guardLine=guard.node.loc.start.line;if(guardLine<start||line>end)return;const choice=question.choices.find(choice=>!choice.correct&&choice._change&&choice._change.start>=guard.node.test.start&&choice._change.end<=guard.node.test.end);if(choice)guardedReturns.push({line,guardLine,choiceId:choice.id});}});
    if(guardedReturns.length)question.guardedReturns=guardedReturns;for(const choice of question.choices){delete choice._change;delete choice._reason;}
    delete question._unit;
  }
  const requiredLines=units.flatMap(unit=>unit.requiredLines);
  const terminalLines=groups.inventory.terminalLines;
  const contextOnly=[...groups.inventory.supplied];
  // The Two Sum contract guarantees a pair. Its defensive fallback cannot be
  // reached by a valid input and is shown with the final remembering step.
  if(id===1){for(const line of terminalLines.filter(line=>/^\s*return\s*\[\]\s*;/.test(lines[line-1])&&!visited.has(line)))contextOnly.push({line,endLine:line,reason:'The problem guarantees a pair, so this defensive fallback is unreachable for valid inputs. It remains visible in the finishing code block.'});}
  const defensive={4:{match:/^return 0\.0;/,reason:'Sorted input arrays with a nonempty combined length always admit the median partition; the search returns from that partition before this defensive fallback.'},167:{match:/^return \[\];/,reason:'The sorted-input contract guarantees exactly one pair, so the two-pointer scan returns before this defensive fallback.'},230:{match:/^return -1;/,reason:'The contract guarantees 1 <= k <= the number of BST nodes; inorder traversal returns the kth value before this defensive fallback.'},235:{match:/^return null;/,reason:'Both requested nodes exist in the valid BST, so their paths have a split or matching ancestor before traversal could fall off the tree.'},374:{match:/^return lo;/,reason:'The hidden pick is guaranteed to be in 1..n; binary search returns on equality before this defensive fallback.'},347:{match:/^return result;/,reason:'The requested k is between 1 and the number of distinct values; visiting the frequency buckets collects k values and returns before this defensive fallback.'},76:{match:/^return "";/,line:3,reason:'The problem requires a nonempty target string, so this empty-target defensive guard is unreachable for valid inputs.'}}[id];
  if(defensive)for(const line of terminalLines.filter(line=>(!defensive.line||line===defensive.line)&&defensive.match.test(lines[line-1].trim())&&!visited.has(line)))contextOnly.push({line,endLine:line,reason:defensive.reason+' It remains visible in the adjacent code block.'});
  if(id===146){const line=lines.findIndex(line=>/^\s*this\.tail\.prev = this\.head;/.test(line))+1;if(line)contextOnly.push({line,endLine:line,reason:'Capacity is at least one. Before any valid eviction reads tail.prev, the first insertion assigns that link in _addToFront; missing-key get does not read it. This redundant sentinel initialization remains visible in the constructor block.'});}
  if(id===460){const line=lines.findIndex(line=>/^\s*this\.minFreq = 0;/.test(line))+1;if(line)contextOnly.push({line,endLine:line,reason:'The first insertion sets minFreq to 1 before a frequency bucket can be read. Missing-key get returns immediately, and zero-capacity put returns without using minFreq. This redundant initial value is shown in the constructor block.'});}
  traverse(groups.inventory.ast,{ReturnStatement(p){const fn=p.getFunctionParent();if(!p.node.argument||!fn||fn.node.body.type!=='BlockStatement'||fn.node.body.body[fn.node.body.body.length-1]!==p.node)return;const declaration=fn.parentPath;if(!declaration.isVariableDeclarator()||declaration.node.id.type!=='Identifier'||[fixtures[0].entry,fixtures[0].roundtrip,...fixtures.flatMap(fixture=>(fixture.operations||[]).map(operation=>operation[0]))].includes(declaration.node.id.name))return;const binding=declaration.scope.getBinding(declaration.node.id.name);if(!binding?.referencePaths.length||!binding.referencePaths.every(reference=>reference.parentPath.isCallExpression()&&reference.parentPath.node.callee===reference.node&&reference.parentPath.parentPath.isExpressionStatement()))return;contextOnly.push({line:p.node.loc.start.line,endLine:p.node.loc.end.line,reason:`Every call to the private ${declaration.node.id.name} helper discards its return value. Its state-changing operations are quizzed; this final returned value is shown as context because changing it alone cannot alter the problem result.`});}});
  const optional={22:'At length 2n the balanced-prefix invariants force open and close to equal n, so both later recursion conditions are false.',39:'When remaining is zero, strictly positive candidates make the following loop break immediately or remain empty; no further state changes occur.',40:'When remaining is zero, strictly positive candidates make the following loop break immediately or remain empty; no further state changes occur.',46:'A complete permutation uses every index, so the following loop skips every candidate.',47:'A complete permutation uses every index, so the following loop skips every candidate.',51:'At row n every column is occupied, so each loop iteration continues before accessing the board.',131:'At start equal to the string length, the following end loop starts beyond the string and does not run.',143:'Valid lists are nonempty. On a singleton, falling through only reassigns the already-null next link and skips both reversal and merging.',706:'The map stores at most one pair per key. After removing that pair, no later entry can match the same key.',2709:'Falling through after recording a first prime-factor owner only adds a self-edge; breadth-first traversal skips the already visited current vertex.'}[id];
  if(optional)traverse(groups.inventory.ast,{ReturnStatement(p){if(!p.node.argument&&(id!==706||p.node.loc.start.line===51))contextOnly.push({line:p.node.loc.start.line,endLine:p.node.loc.end.line,reason:optional+' This optional shortcut remains visible in its code block.'});}});
  const fallback={26:[3,'The input array has at least one element, so this empty-input guard is unreachable.'],42:[3,'The height array has at least one element, so this empty-input guard is unreachable.'],684:[33,'The input is a tree plus one extra edge, so an edge closing the guaranteed cycle is returned before this fallback.'],1631:[38,'Every cell is traversable and the nonempty rectangular grid has a path from the top-left to bottom-right, so the search returns on that destination.'],778:[40,'The nonempty square grid has no blocked cells, so the priority search reaches the destination and returns before this fallback.']}[id];if(fallback)contextOnly.push({line:fallback[0],endLine:fallback[0],reason:fallback[1]+' The fallback remains visible in the completing block.'});
  if([473,698].includes(id)){const line=lines.findIndex(line=>/\.sort\(\(a, b\) => b - a\)/.test(line))+1;if(line)contextOnly.push({line,endLine:line,reason:'Descending sorting tries larger items earlier to reduce search. The backtracking still explores every distinct legal bucket state in any order, so this ordering step is supplied unchanged; it does not decide feasibility.'});}
  if(id===767){const line=lines.findIndex(line=>line.trim()==='heap.sort((a, b) => a[0] - b[0]);')+1;if(line)contextOnly.push({line,endLine:line,reason:'The loop sorts the heap again before its first extraction, and no earlier operation observes this order. This initial sort is redundant and remains visible as context; the sort inside the loop is quizzed.'});}
  if(id===212){const line=lines.findIndex(line=>line.includes('delete trieNode[currentChar]'))+1;if(line)contextOnly.push({line,endLine:line,reason:'This removes a trie branch only after it has no word marker or child keys. Keeping that empty branch cannot produce a word; deletion only avoids later useless traversal. The earlier word-marker deletion remains an active decision.'});}
  const exempt=new Set(contextOnly.flatMap(item=>Array.from({length:item.endLine-item.line+1},(_,i)=>item.line+i)));
  for(const question of pool)question.coveredLines=question.coveredLines.filter(line=>!exempt.has(line));
  const completionByFunction=new Map();for(const unit of units)for(const line of unit.requiredLines)if(!exempt.has(line))completionByFunction.set(unit.functionStart,line);
  pool.coverage={requiredLines:requiredLines.filter(line=>!exempt.has(line)),coveredLines:pool.flatMap(question=>question.coveredLines),terminalLines:[...new Set([...terminalLines.filter(line=>!exempt.has(line)),...completionByFunction.values()])].sort((a,b)=>a-b),...(contextOnly.length?{contextOnly}:{})};
  return pool;
}
function generateAll(input){
  const cachePath='/tmp/leetcode-guided-js.json';
  const metadataPath=cachePath+'.metadata.json';
  const output=fs.existsSync(cachePath)?JSON.parse(fs.readFileSync(cachePath,'utf8')):{};
  const metadata=fs.existsSync(metadataPath)?JSON.parse(fs.readFileSync(metadataPath,'utf8')):{};
  const generatorHash=digest([__filename,runtimePath,path.resolve(__dirname,'../walkthroughs/instrument.cjs'),path.resolve(__dirname,'../../src/components/logic/runtime/javascriptValidation.ts')].map(file=>fs.readFileSync(file,'utf8')).join('\n'));
  const proofVersion=digest([runtimePath,path.resolve(__dirname,'../walkthroughs/instrument.cjs'),path.resolve(__dirname,'../../src/components/logic/runtime/javascriptExecution.ts'),path.resolve(__dirname,'../../src/components/logic/runtime/javascriptValidation.ts')].map(file=>fs.readFileSync(file,'utf8')).join('\n')).slice(0,16);
  const proofDirectory='/tmp/leetcode-guided-js-witnesses/'+proofVersion;fs.mkdirSync(proofDirectory,{recursive:true});
  let count=0;const failures=[];
  for(const item of input){
    const fingerprint=digest(generatorHash+item.javascript+JSON.stringify(item.fixtures));
    if(output[item.id]?.sourceHash===digest(item.javascript)&&metadata[item.id]===fingerprint){count++;continue;}
    try {
    const proofFile=path.join(proofDirectory,item.id+'.json');witnessCache=new Map(fs.existsSync(proofFile)?JSON.parse(fs.readFileSync(proofFile,'utf8')):[]);
    const prior=output[item.id];if(prior?.source===item.javascript)for(const question of prior.questions)for(const choice of question.choices){if(choice.correct||!choice.witness)continue;const witness=choice.witness,fixture=item.fixtures[witness.fixtureIndex];if(!fixture||JSON.stringify(fixture.args)!==JSON.stringify(witness.input)||JSON.stringify(fixture.expected)!==JSON.stringify(witness.expected)||JSON.stringify(fixture.operations)!==JSON.stringify(witness.operations))continue;const changed=item.javascript.split('\n');changed.splice(question.line-1,question.endLine-question.line+1,...choice.code.split('\n'));witnessCache.set(digest(changed.join('\n')+JSON.stringify(item.fixtures)),witness);}
    const source=item.javascript,questions=generateJavaScriptQuestions({id:item.id,source,fixtures:item.fixtures});
    const execution=instrument(source);
    output[item.id]={id:item.id,language:'javascript',source,sourceHash:digest(source),questions,coverage:questions.coverage,execution:{code:execution.code,sites:execution.sites},validation:{correctCases:item.fixtures.length,wrongChoices:questions.reduce((n,q)=>n+q.choices.filter(c=>!c.correct).length,0),testedWitnesses:questions.reduce((n,q)=>n+q.choices.filter(c=>c.witness).length,0)}};
    fs.writeFileSync(cachePath,JSON.stringify(output));
    metadata[item.id]=fingerprint;fs.writeFileSync(metadataPath,JSON.stringify(metadata));
    fs.writeFileSync(proofFile,JSON.stringify([...witnessCache]));
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
module.exports={generateJavaScriptQuestions,generateAll,optionsByLine,statementInventory};
