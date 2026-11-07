// These skeletons preserve source organization, not implementation expressions.
// They are shared question context: every answer still uses its audited plan.
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const parser = require('@babel/parser');
const t = require('@babel/types');
const fixtures = require('../walkthroughs/fixtures.json');

function javascriptOutline(source, entry, roundtrip, limit = 12) {
  const ast = parser.parse(source);
  const children = node => node?.type === 'BlockStatement' ? node.body : node ? [node] : [];
  function summary(nodes) {
    const kinds = new Set();
    for (const node of nodes) t.traverseFast(node, child => kinds.add(child.type));
    const roles = [];
    if (['IfStatement', 'ConditionalExpression', 'SwitchStatement'].some(kind => kinds.has(kind))) roles.push('check cases');
    if (['ForStatement', 'ForOfStatement', 'ForInStatement', 'WhileStatement', 'DoWhileStatement'].some(kind => kinds.has(kind))) roles.push('traverse the required work');
    if (kinds.has('CallExpression') || kinds.has('NewExpression')) roles.push('apply operations or helper calls');
    if (['VariableDeclaration', 'AssignmentExpression', 'UpdateExpression'].some(kind => kinds.has(kind))) roles.push('update working state');
    if (kinds.has('ReturnStatement')) roles.push('return the computed result');
    return roles.join('; ') || 'perform this operation';
  }
  const name = node => node?.type === 'Identifier' ? node.name
    : node?.type === 'MemberExpression' ? [name(node.object), name(node.property)].filter(Boolean).join('.') : 'helper';
  let roots = ast.program.body;
  if (entry) {
    const names = new Set([entry, roundtrip].filter(Boolean));
    roots = roots.filter(node => names.has(node.id?.name)
      || node.type === 'VariableDeclaration' && node.declarations.some(declaration => names.has(declaration.id?.name))
      || node.type === 'ExpressionStatement' && node.expression.type === 'AssignmentExpression' && name(node.expression.left).startsWith(entry + '.prototype.'));
    if (!roots.length) throw Error('Missing public JavaScript entry: ' + entry);
  }

  function block(nodes, indent, depth, maximum) {
    const lines = [];
    let pending = false;
    const line = value => lines.push('  '.repeat(indent) + value);
    const flush = () => { if (pending) line('prepare or update working state'); pending = false; };
    const body = nodes => {
      if (!nodes.length) return;
      if (depth >= maximum) lines.push('  '.repeat(indent + 1) + summary(nodes));
      else lines.push(...block(nodes, indent + 1, depth + 1, maximum));
    };
    for (const node of nodes) {
      if (['EmptyStatement', 'ImportDeclaration'].includes(node.type)) continue;
      if (node.type === 'FunctionDeclaration' || node.type === 'ClassMethod') {
        flush(); line(`operation ${name(node.id || node.key)}:`); body(children(node.body));
      } else if (node.type === 'VariableDeclaration' && node.declarations.length === 1 && ['FunctionExpression', 'ArrowFunctionExpression'].includes(node.declarations[0].init?.type)) {
        flush(); line(`operation ${name(node.declarations[0].id)}:`);
        const expression = node.declarations[0].init.body;
        body(expression.type === 'BlockStatement' ? expression.body : [{ type: 'ReturnStatement', argument: expression }]);
      } else if (node.type === 'ExpressionStatement' && node.expression.type === 'AssignmentExpression' && ['FunctionExpression', 'ArrowFunctionExpression'].includes(node.expression.right.type)) {
        flush(); line(`operation ${name(node.expression.left)}:`); body(children(node.expression.right.body));
      } else if (node.type === 'ClassDeclaration') {
        flush(); line(`class ${name(node.id)}:`); body(node.body.body);
      } else if (['ForStatement', 'ForOfStatement', 'ForInStatement', 'WhileStatement', 'DoWhileStatement'].includes(node.type)) {
        flush();
        line(node.type.startsWith('For') ? 'for each item in the traversal:' : node.type === 'DoWhileStatement' ? 'repeat, then check whether to continue:' : 'while the continuation test holds:');
        body(children(node.body));
      } else if (node.type === 'IfStatement') {
        flush(); line('if this case applies:'); body(children(node.consequent));
        if (node.alternate) { line('otherwise:'); body(children(node.alternate)); }
      } else if (node.type === 'ReturnStatement') {
        flush(); line('return the computed result');
      } else if (['BreakStatement', 'ContinueStatement', 'ThrowStatement'].includes(node.type)) {
        flush(); line({ BreakStatement: 'leave this loop', ContinueStatement: 'continue with the next item', ThrowStatement: 'reject this case' }[node.type]);
      } else if (node.type === 'SwitchStatement') {
        flush(); line('choose a case:');
        for (const branch of node.cases) body(branch.consequent);
      } else if (node.type === 'TryStatement') {
        flush(); line('try this operation:'); body(children(node.block));
        if (node.handler) { line('handle a failure:'); body(children(node.handler.body)); }
        if (node.finalizer) { line('always finish with:'); body(children(node.finalizer)); }
      } else pending = true;
    }
    flush();
    return lines;
  }
  let lines;
  for (const maximum of [4, 3, 2, 1]) {
    lines = block(roots, 0, 0, maximum);
    if (lines.length <= limit) break;
  }
  // Prototype-based designs have multiple public operations. Summarize each
  // operation's body without dropping its name or the final operations.
  if (lines.length > limit && roots.length > 1) lines = block(roots, 0, 0, 0);
  if (lines.length > limit) {
    const compact = [];
    for(let index=0;index<lines.length;index++) {
      if(lines[index].trimStart().startsWith('operation ') && lines[index+1] && !lines[index+1].endsWith(':')) compact.push(lines[index]+' '+lines[++index].trim());
      else compact.push(lines[index]);
    }
    lines=compact;
  }
  if (!lines.length) throw Error('No structural outline for JavaScript source');
  return lines.join('\n');
}

function buildStructureOutlines(problems, solutionMap) {
  const python = spawnSync('python3', [path.join(__dirname, 'guided-structure.py')], {
    input: JSON.stringify(Object.fromEntries(problems.map(problem => [problem.id, {source:solutionMap[problem.id].code,entry:fixtures[problem.id][0].entry,roundtrip:fixtures[problem.id][0].roundtrip}]))),
    encoding: 'utf8', maxBuffer: 4 * 1024 * 1024,
  });
  if (python.status !== 0) throw Error(python.stderr || 'Python outline generation failed');
  const pythonOutlines = JSON.parse(python.stdout);
  return Object.fromEntries(problems.map(problem => [problem.id, {
    python: pythonOutlines[problem.id],
    javascript: javascriptOutline(solutionMap[problem.id].jsCode, fixtures[problem.id][0].entry, fixtures[problem.id][0].roundtrip),
  }]));
}

module.exports = { buildStructureOutlines, javascriptOutline };
