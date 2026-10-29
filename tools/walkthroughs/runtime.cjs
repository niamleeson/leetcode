const vm = require('node:vm');
const { instrument } = require('./instrument.cjs');

const setup = `
// Reproducible teaching examples, including randomized quickselect pivots.
let __seed = __case.seed ?? 250;
Math.random = function() {
  __seed = (Math.imul(1664525, __seed) + 1013904223) >>> 0;
  return __seed / 4294967296;
};
function ListNode(val = 0, next = null) { this.val = val; this.next = next; }
function TreeNode(val = 0, left = null, right = null) { this.val = val; this.left = left; this.right = right; }
function Node(val = 0, second = null, topLeft = null, topRight = null, bottomLeft = null, bottomRight = null) {
  this.val = val;
  if (__problemId === 427) { this.isLeaf = second; Object.assign(this, {topLeft, topRight, bottomLeft, bottomRight}); }
  else if (__problemId === 133) this.neighbors = second || [];
  else { this.next = second; this.random = null; }
}
const _Node = Node;
function __list(values) { return values.reduceRight((next, val) => new ListNode(val, next), null); }
function __tree(values) {
  if (!values.length || values[0] === null) return null;
  const root = new TreeNode(values[0]), queue = [root]; let index = 1;
  for (let head = 0; head < queue.length && index < values.length; head++) {
    for (const side of ['left','right']) {
      const value = values[index++];
      if (value != null) { queue[head][side] = new TreeNode(value); queue.push(queue[head][side]); }
    }
  }
  return root;
}
function __convert(value) {
  if (value && value.$tree) return __tree(value.$tree);
  if (value && value.$list) {
    const head = __list(value.$list);
    if (value.cycle != null && value.cycle >= 0) {
      const nodes = []; for (let n = head; n; n = n.next) nodes.push(n);
      nodes[nodes.length - 1].next = nodes[value.cycle];
    }
    return head;
  }
  if (value && value.$randomList) {
    const nodes = value.$randomList.map(([val]) => new Node(val));
    nodes.forEach((node, i) => { node.next = nodes[i+1] || null; node.random = nodes[value.$randomList[i][1]] || null; });
    return nodes[0] || null;
  }
  if (value && value.$graph) {
    const nodes = value.$graph.map((_, i) => new Node(i+1, []));
    nodes.forEach((node, i) => { node.neighbors = value.$graph[i].map(n => nodes[n-1]); });
    return nodes[0] || null;
  }
  if (value && value.$mountain) return { values: value.$mountain, get(index) { return this.values[index]; }, length() { return this.values.length; } };
  if (Array.isArray(value)) return value.map(__convert);
  return value;
}
function __treeValues(root) {
  if (!root) return [];
  const values = [], queue = [root];
  for (let i = 0; i < queue.length; i++) {
    const node = queue[i]; values.push(node ? node.val : null);
    if (node) queue.push(node.left, node.right);
  }
  while (values.length && values[values.length-1] === null) values.pop();
  return values;
}
function __normalize(value, output) {
  if (output === 'tree') return __treeValues(value);
  if (output === 'node') return value ? value.val : null;
  if (output === 'list' || output === 'randomList') {
    const nodes = [], seen = new Set();
    for (let node = value; node && !seen.has(node); node = node.next) { nodes.push(node); seen.add(node); }
    return nodes.map(node => output === 'list' ? node.val : [node.val, node.random ? nodes.indexOf(node.random) : null]);
  }
  if (output === 'graph') {
    if (!value) return [];
    const nodes = [value], seen = new Set(nodes);
    for (let i = 0; i < nodes.length; i++) for (const next of nodes[i].neighbors) if (!seen.has(next)) { seen.add(next); nodes.push(next); }
    nodes.sort((a,b) => a.val-b.val);
    return nodes.map(n => n.neighbors.map(v => v.val).sort((a,b)=>a-b));
  }
  if (output === 'quad') {
    const expand = (node, size) => {
      if (node.isLeaf) return Array.from({length:size},()=>Array(size).fill(Number(node.val)));
      const a = expand(node.topLeft,size/2), b = expand(node.topRight,size/2), c = expand(node.bottomLeft,size/2), d = expand(node.bottomRight,size/2);
      return a.map((row,i)=>row.concat(b[i])).concat(c.map((row,i)=>row.concat(d[i])));
    };
    return expand(value, __case.args[0].length);
  }
  return value === undefined ? null : value;
}
const __args = (__case.args || []).map(__convert);
if (__case.nodeArgs) for (const index of __case.nodeArgs) {
  const queue = [__args[0]]; let found = null;
  for (let i=0; i<queue.length; i++) { const node=queue[i]; if (!node) continue; if (node.val===__args[index]) {found=node; break;} queue.push(node.left,node.right); }
  __args[index] = found;
}
function guess(n) { return n === __case.pick ? 0 : n < __case.pick ? 1 : -1; }
`;

function execute(source, fixture, id, traced = true) {
  const built = traced ? instrument(source) : { code: source, sites: [] };
  const steps = [];
  const ids = new WeakMap(); let nextId = 1;
  const priorHeap = new Map(); const stack = [];
  let roots = {}; let active = false;
  function snapshot(getters = {}) {
    const heap = {}, state = {};
    function encode(value) {
      if (value === undefined) return { $scalar: 'undefined' };
      if (typeof value === 'bigint') return { $scalar: value + 'n' };
      if (typeof value === 'number' && !Number.isFinite(value)) return { $scalar: String(value) };
      if (!value || typeof value !== 'object') return typeof value === 'function' ? { $scalar: 'function' } : value;
      if (!ids.has(value)) ids.set(value, 'o' + nextId++);
      const key = ids.get(value);
      if (heap[key]) return { $ref: key };
      const entry = heap[key] = { kind: 'object', fields: {} };
      const tag = Object.prototype.toString.call(value);
      if (Array.isArray(value)) {
        entry.kind = 'array'; entry.items = Array.from(value, encode); delete entry.fields;
      } else if (tag === '[object Map]') {
        entry.kind = 'map'; entry.entries = [...value].map(([k,v]) => [encode(k),encode(v)]); delete entry.fields;
      } else if (tag === '[object Set]') {
        entry.kind = 'set'; entry.items = [...value].map(encode); delete entry.fields;
      } else {
        for (const name of Object.keys(value)) if (typeof value[name] !== 'function') entry.fields[name] = encode(value[name]);
        if ('isLeaf' in value && 'topLeft' in value) entry.kind = 'quad';
        else if ('left' in value && 'right' in value && 'val' in value) entry.kind = 'tree';
        else if ('neighbors' in value && 'val' in value) entry.kind = 'graph';
        else if ('next' in value && 'val' in value) entry.kind = 'list';
      }
      return { $ref: key };
    }
    const input = Object.fromEntries(Object.entries(roots).map(([key,value])=>[key,encode(value)]));
    for (const [name, getter] of Object.entries(getters)) {
      try { const value = getter(); if (typeof value !== 'function' && !(value && value.__trace)) state[name] = encode(value); } catch { /* Temporal dead zone: binding does not yet exist. */ }
    }
    return { state, input, heap, encode };
  }
  function append(site, getters, value) {
    if (!active) return value;
    if (steps.length >= 20000) throw new Error('Trace exceeded 20,000 steps; use a smaller teaching example.');
    const meta = built.sites[site];
    if (meta.kind === 'call') stack.push(meta.label);
    const snap = snapshot(getters());
    const result = snap.encode(value);
    const heap = {};
    for (const [key, entry] of Object.entries(snap.heap)) {
      const json = JSON.stringify(entry);
      if (priorHeap.get(key) !== json) { heap[key] = entry; priorHeap.set(key, json); }
    }
    steps.push({ site, line: meta.line, kind: meta.kind, label: meta.label, state: snap.state, input: snap.input, heap, value: result, stack: [...stack] });
    return value;
  }
  const context = vm.createContext({ __problemId: id, __case: JSON.parse(JSON.stringify(fixture)), __trace: {
    record: append, leave() { if (active) stack.pop(); },
    start(input) { roots = input; active = true; },
    stop() { active = false; },
  } });
  const script = `${setup}\n${built.code}\n${invocation(fixture)}`;
  const result = new vm.Script(script).runInContext(context, { timeout: 15000 });
  return { result: JSON.parse(JSON.stringify(result)), steps, sites: built.sites };
}

function invocation(fixture) {
  const entry = fixture.entry;
  if (!/^[a-zA-Z_$][\w$]*$/.test(entry)) throw new Error('Invalid entry point');
  if (fixture.operations) return `
    __trace.start({ arguments: __args });
    const __instance = new ${entry}(...__args);
    const __results = [null];
    for (const [method, args] of __case.operations) {
      __trace.start({ instance: __instance, arguments: args });
      __results.push(__normalize(__instance[method](...args.map(__convert))));
    }
    __trace.stop(); __results;`;
  let expression = `${entry}(...__args)`;
  if (fixture.roundtrip) expression = `${fixture.roundtrip}(${expression})`;
  return `
    __trace.start(Object.fromEntries(__args.map((value,index)=>[(__case.params || [])[index] || 'input'+index,value])));
    const __returned = ${expression};
    __trace.stop();
    if (__case.prefix && JSON.stringify(__args[0].slice(0,__returned)) !== JSON.stringify(__case.prefix)) throw new Error('Incorrect in-place output prefix');
    if (__case.distinctClone) {
      function collect(root) {
        const nodes = new Set();
        function visit(node) { if(!node || nodes.has(node)) return; nodes.add(node); visit(node.next); visit(node.random); for(const neighbor of node.neighbors || []) visit(neighbor); }
        visit(root); return nodes;
      }
      const originals = collect(__args[0]);
      for(const node of collect(__returned)) if(originals.has(node)) throw new Error('Clone shares input nodes');
    }
    __normalize(${fixture.resultArg !== undefined ? `__args[${fixture.resultArg}]` : '__returned'}, __case.output);`;
}
module.exports = { execute, setup, invocation };
