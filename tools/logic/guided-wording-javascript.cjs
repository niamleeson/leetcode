// Source facts for learner-facing wording. This never changes executable code.
const fs = require('node:fs');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const q = text => `“${text}”`;
function analyze(source, fixture) {
  const ast = parser.parse(source), facts = [], types = new Map();
  const raw = node => node ? source.slice(node.start, node.end).replace(/\s+/g, ' ').trim() : '';
  const name = node => raw(node).replace(/^this\./, 'this.');
  const quote = node => q(raw(node));
  function classify(node) {
    if (!node) return '';
    if (node.type === 'ArrayExpression') return 'array';
    if (node.type === 'ObjectExpression') return 'object';
    if (node.type === 'StringLiteral' || node.type === 'TemplateLiteral') return 'string';
    if (node.type === 'NumericLiteral') return 'number';
    if (node.type === 'BooleanLiteral') return 'boolean';
    if (node.type === 'NewExpression') return ['Array','Map','Set'].includes(raw(node.callee)) ? raw(node.callee).toLowerCase() : 'object';
    if (node.type === 'Identifier') return types.get(node.name) || '';
    if(node.type==='MemberExpression') {if(raw(node.property)==='length'&&!node.computed)return 'number';if(['left','right','next','prev'].includes(raw(node.property)) && classify(node.object)==='node') return 'node';return types.get(raw(node)) || '';}
    if (node.type==='BinaryExpression') {
      if(['===','==','!==','!=','<','<=','>','>=','in','instanceof'].includes(node.operator)) return 'boolean';
      if(node.operator==='+') {const left=classify(node.left),right=classify(node.right);return left===right && ['number','string'].includes(left) ? left : '';}
      if(['-','*','/','%','**','|','&','^','<<','>>','>>>'].includes(node.operator)) return 'number';
    }
    if (node.type==='LogicalExpression') {const left=classify(node.left),right=classify(node.right);return left===right ? left : '';}
    if (node.type==='UnaryExpression' && node.operator==='!') return 'boolean';
    if (node.type==='UpdateExpression' || node.type === 'MemberExpression' && raw(node.property)==='length') return 'number';
    return '';
  }
  const ambiguous = new Set();
  function record(key,type) {if(!type || types.has(key) && types.get(key)!==type) {ambiguous.add(key);types.delete(key);} else if(!ambiguous.has(key)) types.set(key,type);}
  if(fixture) traverse(ast,{Function(p){
    const functionName=p.node.id?.name || p.node.key?.name || (p.parent.type==='VariableDeclarator'?p.parent.id?.name:null);
    if(functionName!==fixture.entry) return;
    for(let index=0;index<p.node.params.length;index++) {
      const value=fixture.args[index],parameter=p.node.params[index];
      if(parameter.type!=='Identifier') continue;
      const type=Array.isArray(value)?'array':value && typeof value==='object'?Object.keys(value).some(key=>['$tree','$list','$randomList','$graph'].includes(key))?'node':'object':typeof value;
      if(['array','node','object','number','string','boolean'].includes(type)) record(parameter.name,type);
    }
  }});
  traverse(ast, {VariableDeclarator(p) {if(p.node.init)record(raw(p.node.id),classify(p.node.init));},AssignmentExpression(p){record(raw(p.node.left),classify(p.node.operator==='=' ? p.node.right : {type:'BinaryExpression',operator:p.node.operator.slice(0,-1),left:p.node.left,right:p.node.right}));}});
  // A repeated name in different functions can denote different data types.
  const bindingScopes=new Map();
  traverse(ast,{BindingIdentifier(p){const key=p.node.name;const scope=p.scope.getBinding(key)?.scope.uid;if(scope!==undefined){if(bindingScopes.has(key)&&bindingScopes.get(key)!==scope){ambiguous.add(key);types.delete(key);}else bindingScopes.set(key,scope);}}});
  function expr(node) {
    if (!node) return 'no value';
    const text = raw(node);
    if (node.type === 'Identifier') return q(node.name);
    if (node.type === 'NullLiteral') return 'null';
    if (['NumericLiteral','BooleanLiteral'].includes(node.type)) return String(node.value);
    if (node.type === 'StringLiteral') return node.value === '' ? 'an empty string' : JSON.stringify(node.value);
    if (node.type === 'ArrayExpression' && !node.elements.length) return 'an empty array';
    if (node.type === 'ObjectExpression' && !node.properties.length) return 'an empty object';
    if (node.type === 'MemberExpression' || node.type === 'OptionalMemberExpression') {
      if (!node.computed && raw(node.property)==='length') return `the length of ${expr(node.object)}`;
      return quote(node);
    }
    if (node.type === 'NewExpression' && !node.arguments.length && ['Map','Set','Array'].includes(raw(node.callee))) return `an empty ${raw(node.callee).toLowerCase()}`;
    if (node.type === 'CallExpression' || node.type === 'OptionalCallExpression') {
      const callee=raw(node.callee), args=node.arguments.map(expr);
      if (['Math.max','Math.min'].includes(callee)) return `${callee==='Math.max'?'the maximum':'the minimum'} of ${args.join(', ')}`;
      if (callee==='Math.floor') return `${args[0]} rounded down`;
      if (callee==='Math.ceil') return `${args[0]} rounded up`;
      if (callee==='Math.abs') return `the absolute value of ${args[0]}`;
      if (node.callee.type==='MemberExpression') {
        const method=raw(node.callee.property), object=expr(node.callee.object);
        if (method==='join') return `${object} joined with ${args[0] || 'commas'}`;
        if (method==='split') return `${object} split at ${args[0] || 'the separator'}`;
        if (method==='get') return `the value stored for ${args[0]} in ${object}`;
        if (method==='pop' && types.get(raw(node.callee.object))==='array') return `the last item removed from ${object}`;
        if (method==='shift') return `the first item removed from ${object}`;
      }
    }
    if (node.type==='ConditionalExpression') return `${expr(node.consequent)} when ${condition(node.test)}; otherwise ${expr(node.alternate)}`;
    return quote(node);
  }
  function condition(node) {
    if (!node) return 'the loop has not been stopped';
    if (node.type==='LogicalExpression') {const part=value=>value.type==='LogicalExpression' ? '('+condition(value)+')' : condition(value);return `${part(node.left)} ${node.operator==='&&'?'and':node.operator==='||'?'or':'or, if it is missing,'} ${part(node.right)}`;}
    if (node.type==='UnaryExpression' && node.operator==='!') {
      const child=node.argument;
      if (child.type==='Identifier') {
        const type=types.get(child.name);
        if (type==='string') return `${expr(child)} is empty`;
        if (type==='number') return `${expr(child)} is zero`;
        if (type==='boolean') return `${expr(child)} is false`;
        if (type==='node') return `${expr(child)} is missing`;
        if (['array','map','set','object'].includes(type)) return `${expr(child)} is missing; an empty object or array does not satisfy this check`;
        return `the condition ${quote(node)} is true`;
      }
      if(classify(child)==='number') return `${expr(child)} is zero`;
      if(classify(child)==='node') return `${expr(child)} is missing`;
      if (child.type==='CallExpression' && child.callee.type==='MemberExpression' && raw(child.callee.property)==='has') return `${expr(child.arguments[0])} is absent from ${expr(child.callee.object)}`;
      return `not (${condition(child)})`;
    }
    if (['BinaryExpression','LogicalExpression'].includes(node.type)) {
      const operators={'===':'equals','==':'equals','!==':'differs from','!=':'differs from','<':'is less than','<=':'is at most','>':'is greater than','>=':'is at least','in':'is a property in'};
      if (operators[node.operator]) return `${expr(node.left)} ${operators[node.operator]} ${expr(node.right)}`;
    }
    if (node.type==='CallExpression' && node.callee.type==='MemberExpression') {
      const method=raw(node.callee.property);
      if (['has','includes'].includes(method)) return `${expr(node.arguments[0])} is present in ${expr(node.callee.object)}`;
    }
    if (node.type==='Identifier') {
      const type=types.get(node.name);
      if(type==='string') return `${expr(node)} is not empty`;
      if(type==='number') return `${expr(node)} is not zero`;
      if(type==='boolean') return `${expr(node)} is true`;
      if(type==='node') return `${expr(node)} exists`;
      if(['array','map','set','object'].includes(type)) return `${expr(node)} is present; an empty object or array also passes this check`;
      return `${expr(node)} has a true value`;
    }
    if(classify(node)==='number') return `${expr(node)} is not zero`;
    if(classify(node)==='node') return `${expr(node)} exists`;
    return `${expr(node)} is true`;
  }
  function refs(node) {
    const values=[];
    function walk(current) {
      if(!current || typeof current!=='object') return;
      if(current.type==='Identifier') {if(!['undefined','Infinity','NaN','Math'].includes(current.name) && !values.includes(current.name)) values.push(current.name);return;}
      if(current.type==='MemberExpression' || current.type==='OptionalMemberExpression') {if(current.object.type==='ThisExpression') {const key=raw(current);if(!values.includes(key))values.push(key);return;}walk(current.object);if(current.computed) walk(current.property);return;}
      if(current.type==='CallExpression') {if(current.callee.type==='MemberExpression') walk(current.callee.object);for(const arg of current.arguments)walk(arg);return;}
      for(const [key,value] of Object.entries(current)) if(!['loc','start','end','comments','leadingComments','trailingComments','extra'].includes(key)) {
        if(Array.isArray(value)) value.forEach(walk); else walk(value);
      }
    }
    walk(node);return values.slice(0,4);
  }
  function callAction(node) {
    if(node.type!=='CallExpression' && node.type!=='OptionalCallExpression') return `Evaluate ${expr(node)}.`;
    if(node.callee.type==='MemberExpression') {
      const method=raw(node.callee.property), object=expr(node.callee.object),args=node.arguments.map(expr);
      const actions={push:`Append ${args.join(', ')} to ${object}.`,unshift:`Insert ${args.join(', ')} at the front of ${object}.`,add:`Add ${args[0]} to ${object}.`,set:`Store ${args[1]} under key ${args[0]} in ${object}.`,delete:`Remove ${args[0]} from ${object}.`,reverse:`Reverse the order of ${object}.`,clear:`Remove all entries from ${object}.`,shift:`Remove the first item from ${object}.`};
      if(actions[method]) return actions[method];
      if(method==='pop') return types.get(raw(node.callee.object))==='array' ? `Remove the last item from ${object}.` : `Call ${quote(node.callee)} to remove its next item.`;
      if(method==='splice') return `Remove ${args[1] || 'the remaining'} items from ${object}, starting at ${args[0] || '0'}${args.length>2 ? `, and insert ${args.slice(2).join(', ')}`:''}.`;
      if(method==='sort') {
        const compare=node.arguments[0];
        if(compare && ['ArrowFunctionExpression','FunctionExpression'].includes(compare.type) && compare.params.length===2) {const body=compare.body.type==='BlockStatement' && compare.body.body.length===1 && compare.body.body[0].type==='ReturnStatement' ? compare.body.body[0].argument : compare.body;
          if(body?.type==='BinaryExpression' && body.operator==='-') {const a=raw(compare.params[0]),b=raw(compare.params[1]),left=raw(body.left),right=raw(body.right);if(left===a&&right===b)return `Sort ${object} in ascending numeric order.`;if(left===b&&right===a)return `Sort ${object} in descending numeric order.`;}
        }
        return `Sort ${object}${args.length ? ` using ${quote(node.arguments[0])}` : ' in its default order'}.`;
      }
    }
    return `Call ${quote(node.callee)} with ${node.arguments.length ? node.arguments.map(expr).join(', ') : 'no arguments'}.`;
  }
  function info(node,p) {
    let kind,subject='',description='',inputs=[];
    if(node.type==='VariableDeclaration') {
      if(node.declarations.some(d=>['FunctionExpression','ArrowFunctionExpression'].includes(d.init?.type))) return;
      kind='assign';subject=node.declarations.map(d=>raw(d.id)).join(', ');
      description=node.declarations.map(d=>`Set ${quote(d.id)} to ${expr(d.init)}.`).join(' ');
    } else if(node.type==='ExpressionStatement') {
      const value=node.expression;
      if(value.type==='AssignmentExpression' && ['FunctionExpression','ArrowFunctionExpression'].includes(value.right.type)) return;
      if(value.type==='AssignmentExpression') {kind='assign';subject=raw(value.left);description=value.operator==='='?`Set ${expr(value.left)} to ${expr(value.right)}.`:`${value.operator==='+='?'Add':value.operator==='-='?'Subtract':'Apply '+value.operator} ${expr(value.right)} ${value.operator==='-='?'from':'to'} ${expr(value.left)}.`;}
      else if(value.type==='UpdateExpression') {kind='assign';subject=raw(value.argument);description=`${value.operator==='++'?'Increase':'Decrease'} ${expr(value.argument)} by 1.`;}
      else if(value.type==='UnaryExpression' && value.operator==='delete') {kind='delete';subject=raw(value.argument);description=`Delete ${expr(value.argument)}.`;}
      else {kind='call';subject=value.callee ? raw(value.callee) : raw(value);description=callAction(value);}
    } else if(node.type==='IfStatement' || node.type==='WhileStatement' || node.type==='DoWhileStatement') {kind=node.type==='IfStatement'?'if':'while';inputs=refs(node.test);subject=inputs.join(', ');description=`${kind==='if'?'Take this branch':'Keep repeating the loop'} when ${condition(node.test)}.`;}
    else if(node.type==='ForStatement') {kind='for';subject=node.init?.type==='VariableDeclaration' ? node.init.declarations.map(d=>raw(d.id)).join(', ') : refs(node.init || node.test).join(', ');inputs=refs(node.test);const start=node.init?.type==='VariableDeclaration' ? node.init.declarations.map(d=>`Start ${quote(d.id)} at ${expr(d.init)}`).join('; ') : node.init ? `Start with ${quote(node.init)}` : 'Keep the existing loop variable';const update=node.update?.type==='UpdateExpression' ? `${node.update.operator==='++'?'increase':'decrease'} ${expr(node.update.argument)} by 1` : node.update ? `execute ${quote(node.update)}` : '';description=`${start}; continue while ${condition(node.test)}${update ? `; after each iteration, ${update}`:''}.`;}
    else if(['ForOfStatement','ForInStatement'].includes(node.type)) {kind='for';subject=raw(node.left).replace(/^(let|const|var) /,'');inputs=refs(node.right);description=`Visit each ${node.type==='ForInStatement'?'key':'item'} in ${expr(node.right)}, storing it as ${q(subject)}.`;}
    else if(node.type==='ReturnStatement') {kind='return';subject=node.argument?raw(node.argument):'';description=node.argument?`Return ${expr(node.argument)} and stop this call.`:'Stop this call without returning a value.';}
    else if(node.type==='BreakStatement') {kind='break';description='Leave the current loop or switch immediately.';}
    else if(node.type==='ContinueStatement') {kind='continue';description='Skip the rest of this iteration and continue with the next iteration.';}
    else if(node.type==='ThrowStatement') {kind='throw';subject=raw(node.argument);description=`Throw ${expr(node.argument)} and stop normal execution of this call.`;}
    if(!kind) return;
    const fn=p.getFunctionParent();
    const functionName=fn ? raw(fn.node.id || fn.node.key || (fn.parent.type==='VariableDeclarator'?fn.parent.id:fn.parent.type==='AssignmentExpression'?fn.parent.left:null)) : '';
    let action='';
    const first=(node.consequent?.body || node.body?.body || [node.consequent]).find?.(value=>value);
    if(first?.type==='ReturnStatement') action=first.argument ? ['NullLiteral','NumericLiteral','BooleanLiteral','StringLiteral','Identifier'].includes(first.argument.type) ? `return ${expr(first.argument)}` : 'return its answer' : 'stop this call';
    if(first?.type==='ExpressionStatement' && first.expression.type==='CallExpression') {const call=first.expression;if(call.callee.type==='MemberExpression' && ['push','unshift','add'].includes(raw(call.callee.property))) action=`add an item to ${expr(call.callee.object)}`;else action=`call ${quote(call.callee)}`;}
    if(first?.type==='VariableDeclaration') {const value=first.declarations[0]?.init;if(value?.type==='CallExpression' && value.callee.type==='MemberExpression' && ['pop','shift'].includes(raw(value.callee.property))) action=`remove an item from ${expr(value.callee.object)}`;}
    facts.push({line:node.loc.start.line,endLine:node.loc.end.line,kind,subject,inputs,description,functionName,action,source:raw(node)});
  }
  traverse(ast,{Statement(p){if(!['FunctionDeclaration','ClassDeclaration','BlockStatement','EmptyStatement'].includes(p.node.type)) info(p.node,p);},ArrowFunctionExpression(p){if(p.node.body.type!=='BlockStatement' && ['VariableDeclarator','AssignmentExpression'].includes(p.parent.type)) {const node=p.node.body,binding=p.parent.id || p.parent.left;facts.push({line:node.loc.start.line,endLine:node.loc.end.line,kind:'return',subject:raw(node),inputs:refs(node),description:`Return ${expr(node)} from ${quote(binding)}.`,functionName:raw(binding),source:raw(node)});}}});
  return facts.sort((a,b)=>a.line-b.line || a.endLine-b.endLine);
}
if(require.main===module) {
  const rows=JSON.parse(fs.readFileSync(0,'utf8'));
  process.stdout.write(JSON.stringify(Object.fromEntries(rows.map(row=>[String(row.id),analyze(row.javascript,row.fixtures?.[0])]))));
}
module.exports={analyze};
