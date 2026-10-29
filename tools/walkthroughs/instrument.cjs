// Instrument the displayed source, retaining original AST locations. Never run in the browser.
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const t = require('@babel/types');

function instrument(source) {
  const ast = parser.parse(source);
  const sites = [];
  const originalNodes = new WeakSet();
  traverse(ast, { enter(path) {
    // A concise callback passed to a built-in (Array.from, sort, map...) is part
    // of that expression. Record its result at the caller, rather than thousands
    // of allocation/comparator frames. Named algorithm helpers are still traced.
    if (path.isArrowFunctionExpression() && !t.isBlockStatement(path.node.body) &&
        (path.parentPath.isCallExpression() || path.parentPath.isNewExpression())) { path.skip(); return; }
    originalNodes.add(path.node);
  } });
  const text = node => source.slice(node.start, node.end).replace(/\s+/g, ' ').trim();
  function state(path) {
    const bindings = path.scope.getAllBindings();
    const properties = Object.keys(bindings).filter(name => !name.startsWith('__trace')).map(name =>
      t.objectProperty(t.stringLiteral(name), t.arrowFunctionExpression([], t.identifier(name))));
    if (path.getFunctionParent()) properties.push(t.objectProperty(t.stringLiteral('this'), t.arrowFunctionExpression([], t.thisExpression())));
    return t.arrowFunctionExpression([], t.objectExpression(properties));
  }
  function call(path, kind, node, value, label = text(node)) {
    const line = node.loc.start.line;
    const lastLine = kind==='call' ? node.body.loc?.start.line ?? line : ['iterate','loop-end'].includes(kind) ? line : node.loc.end.line;
    const lines = Array.from({length:lastLine-line+1},(_,index)=>line+index)
      .filter(number=>source.split('\n')[number-1].trim()&&!source.split('\n')[number-1].trim().startsWith('//'));
    const site = sites.length;
    sites.push({ line, lines, kind, label, start: node.start, end: node.end });
    return t.callExpression(t.memberExpression(t.identifier('__trace'), t.identifier('record')), [
      t.numericLiteral(site), state(path), value || t.unaryExpression('void', t.numericLiteral(0)),
    ]);
  }
  function wrap(path, kind, label) {
    const original = path.node;
    path.replaceWith(call(path, kind, original, original, label));
    path.skip();
  }
  // Normalize bodies so one-line statements can receive a following snapshot without
  // turning an unconditional statement into part of a neighboring branch.
  traverse(ast, {
    'IfStatement|ForStatement|ForOfStatement|ForInStatement|WhileStatement|DoWhileStatement'(path) {
      for (const key of path.isIfStatement() ? ['consequent', 'alternate'] : ['body']) {
        const child = path.get(key);
        if (child.node && !child.isBlockStatement() && !child.isIfStatement()) child.replaceWith(t.blockStatement([child.node]));
      }
    },
    ArrowFunctionExpression(path) {
      if (!originalNodes.has(path.node)) return;
      if (!path.get('body').isBlockStatement()) {
        const expression = path.node.body;
        const ret = t.returnStatement(expression);
        Object.assign(ret, { loc: expression.loc, start: expression.start, end: expression.end });
        originalNodes.add(ret);
        path.get('body').replaceWith(t.blockStatement([ret]));
      }
    },
  });
  traverse(ast, {
    exit(path) {
      if (!originalNodes.has(path.node)) return;
      const node = path.node;
      if (path.isIfStatement() || path.isWhileStatement() || path.isDoWhileStatement() || path.isForStatement()) {
        if (node.test) {
          const test = path.get('test');
          test.replaceWith(call(test, 'check', test.node, test.node));
        }
        if (path.isForStatement() && node.update) {
          const update = path.get('update');
          update.replaceWith(call(update, 'update', update.node, update.node));
        }
      } else if (path.isConditionalExpression()) {
        const test = path.get('test');
        test.replaceWith(call(test, 'check', test.node, test.node));
      } else if (path.isLogicalExpression()) {
        const left = path.get('left');
        left.replaceWith(call(left, 'check', left.node, left.node));
      } else if (path.isForOfStatement() || path.isForInStatement()) {
        const body = path.get('body');
        body.unshiftContainer('body', t.expressionStatement(call(body, 'iterate', node, undefined, text(node.left) + ' ← next')));
        path.insertAfter(t.expressionStatement(call(path, 'loop-end', node, undefined, 'Iteration finished')));
      } else if (path.isVariableDeclaration()) {
        if (path.parentPath.isForStatement() || path.parentPath.isForOfStatement() || path.parentPath.isForInStatement()) return;
        if (node.declarations.every(decl => t.isFunction(decl.init))) return;
        if (!path.getFunctionParent()) return;
        path.insertAfter(t.expressionStatement(call(path, 'statement', node)));
      } else if (path.isExpressionStatement()) {
        if (path.getFunctionParent()) path.insertAfter(t.expressionStatement(call(path, 'statement', node)));
      } else if (path.isReturnStatement()) {
        node.argument = call(path, 'return', node, node.argument);
      } else if (path.isBreakStatement() || path.isContinueStatement()) {
        path.insertBefore(t.expressionStatement(call(path, node.type === 'BreakStatement' ? 'break' : 'continue', node)));
      } else if (path.isCallExpression() && t.isMemberExpression(node.callee) && !node.callee.computed &&
        ['push', 'pop', 'shift', 'unshift', 'splice', 'set', 'add', 'delete', 'clear', 'sort', 'reverse', 'fill'].includes(node.callee.property.name)) {
        wrap(path, 'operation');
      } else if (path.isFunction()) {
        const body = path.get('body');
        if (!body.isBlockStatement()) return;
        const parent = path.parentPath;
        const name = node.id?.name || (parent.isVariableDeclarator() ? parent.node.id.name : parent.isAssignmentExpression() ? text(parent.node.left) : node.key?.name) || 'callback';
        const enter = t.expressionStatement(call(path, 'call', node, undefined, name));
        // try/finally makes call depth correct for early returns, recursion and throws.
        body.node.body = [enter, t.tryStatement(t.blockStatement(body.node.body), null,
          t.blockStatement([t.expressionStatement(t.callExpression(t.memberExpression(t.identifier('__trace'), t.identifier('leave')), []))]))];
      }
    },
  });
  return { code: generate(ast).code, sites };
}
module.exports = { instrument };
