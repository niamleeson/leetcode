(function(){"use strict";const S=`class MinHeap {
  constructor() {
    this.heap = [];
  }

  get size() {
    return this.heap.length;
  }

  push(value) {
    const heap = this.heap;
    heap.push(value);

    let i = heap.length - 1;

    // Move up until the parent has a smaller or equal distance.
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);

      if (heap[parent][0] <= heap[i][0]) break;

      [heap[parent], heap[i]] = [heap[i], heap[parent]];
      i = parent;
    }
  }

  pop() {
    const heap = this.heap;
    if (heap.length === 0) return undefined;

    const min = heap[0];
    const last = heap.pop();

    if (heap.length > 0) {
      heap[0] = last;
      let i = 0;

      // Move down, swapping with the smaller child.
      while (true) {
        const left = 2 * i + 1;
        const right = 2 * i + 2;
        let smallest = i;

        if (left < heap.length && heap[left][0] < heap[smallest][0]) {
          smallest = left;
        }

        if (right < heap.length && heap[right][0] < heap[smallest][0]) {
          smallest = right;
        }

        if (smallest === i) break;

        [heap[i], heap[smallest]] = [heap[smallest], heap[i]];
        i = smallest;
      }
    }

    return min;
  }
}`,$=[1631,743,778],N=`
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
`;function O(e){const a=e.entry;if(!/^[a-zA-Z_$][\w$]*$/.test(a))throw new Error("Invalid entry point");if(e.operations)return`
    __trace.start({ arguments: __args });
    const __instance = new ${a}(...__args);
    const __results = [null];
    for (const [method, args] of __case.operations) {
      __trace.start({ instance: __instance, arguments: args });
      __results.push(__normalize(__instance[method](...args.map(__convert))));
    }
    __trace.stop(); __results;`;let i=`${a}(...__args)`;return e.roundtrip&&(i=`${e.roundtrip}(${i})`),`
    __trace.start(Object.fromEntries(__args.map((value,index)=>[(__case.params || [])[index] || 'input'+index,value])));
    const __returned = ${i};
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
    __normalize(${e.resultArg!==void 0?`__args[${e.resultArg}]`:"__returned"}, __case.output);`}function p(e,a){if(typeof e!=typeof a)return!1;if(Array.isArray(a))return Array.isArray(e)&&e.length===a.length&&a.every((i,l)=>p(e[l],i));if(a&&typeof a=="object"){if(!e||typeof e!="object")return!1;const i=e,l=a;return Object.keys(i).length===Object.keys(l).length&&Object.keys(l).every(s=>Object.prototype.hasOwnProperty.call(i,s)&&p(i[s],l[s]))}return e===a}const g=e=>[...e].sort((a,i)=>JSON.stringify(a).localeCompare(JSON.stringify(i))),b=e=>{const a=new Map;for(const i of e)a.set(i,(a.get(i)??0)+1);return a};function k(e,a,i){const l=a.expected,s=a.args;if(i===1||i===167){if(!Array.isArray(e)||e.length!==2||!e.every(Number.isInteger))return!1;const[t,r]=e.map(n=>n-(i===167?1:0));return t!==r&&t>=0&&r>=0&&t<s[0].length&&r<s[0].length&&s[0][t]+s[0][r]===s[1]}if(i===347){if(!Array.isArray(e)||e.length!==s[1]||!e.every(Number.isInteger)||new Set(e).size!==e.length)return!1;const t=b(s[0]),r=[...t.values()].sort((n,o)=>o-n)[s[1]-1];return e.every(n=>(t.get(n)??0)>=r)&&[...t].every(([n,o])=>o<=r||e.includes(n))}if(i===973){if(!Array.isArray(e)||e.length!==s[1]||!e.every(n=>Array.isArray(n)&&n.length===2&&n.every(Number.isInteger)))return!1;const t=b(s[0].map(n=>JSON.stringify(n)));for(const n of e){const o=JSON.stringify(n),d=t.get(o)??0;if(!d)return!1;t.set(o,d-1)}const r=([n,o])=>n*n+o*o;return p(e.map(r).sort((n,o)=>n-o),s[0].map(r).sort((n,o)=>n-o).slice(0,s[1]))}if(i===269){if(typeof e!="string")return!1;if(!l)return e==="";const t=new Set(s[0].join(""));if(e.length!==t.size||new Set(e).size!==t.size||[...e].some(r=>!t.has(r)))return!1;for(let r=1;r<s[0].length;r++){const n=s[0][r-1],o=s[0][r];if(n.length>o.length&&n.startsWith(o))return!1;for(let d=0;d<Math.min(n.length,o.length);d++)if(n[d]!==o[d]){if(e.indexOf(n[d])>=e.indexOf(o[d]))return!1;break}}return!0}if(i===1489)return Array.isArray(e)&&e.length===2&&e.every((t,r)=>Array.isArray(t)&&p(g(t),g(l[r])));switch(a.compare){case"unordered":return Array.isArray(e)&&p(g(e),g(l));case"groups":return Array.isArray(e)&&e.every(Array.isArray)&&p(g(e.map(g)),g(l.map(g)));case"accounts":{const t=r=>g(r.map(([n,...o])=>[n,...o.sort()]));return Array.isArray(e)&&e.every(r=>Array.isArray(r)&&r.length)&&p(t(e),t(l))}case"topological":{if(!l.length)return p(e,[]);const[t,r]=s;return!Array.isArray(e)||e.length!==t||new Set(e).size!==t||!e.every(n=>Number.isInteger(n)&&n>=0&&n<t)?!1:r.every(([n,o])=>e.indexOf(o)<e.indexOf(n))}case"matrixConditions":{if(!l.length)return p(e,[]);const[t,r,n]=s;if(!Array.isArray(e)||e.length!==t||!e.every(d=>Array.isArray(d)&&d.length===t))return!1;const o=new Map;for(let d=0;d<t;d++)for(let c=0;c<t;c++){const h=e[d][c];if(!Number.isInteger(h)||h<0||h>t||h!==0&&o.has(h))return!1;h&&o.set(h,[d,c])}return o.size===t&&r.every(([d,c])=>o.get(d)[0]<o.get(c)[0])&&n.every(([d,c])=>o.get(d)[1]<o.get(c)[1])}case"longestPalindrome":return typeof e=="string"&&e.length===l.length&&s[0].includes(e)&&e===[...e].reverse().join("");case"reorganized":return typeof e=="string"&&(l?[...e].sort().join("")===[...s[0]].sort().join("")&&[...e].every((t,r)=>!r||t!==e[r-1]):e==="");case"happyString":{if(typeof e!="string")return!1;const t=Math.max(...s),r=s.reduce((n,o)=>n+o,0)-t;return e.length===r+Math.min(t,2*(r+1))&&/^[abc]*$/.test(e)&&!/aaa|bbb|ccc/.test(e)&&[..."abc"].every((n,o)=>[...e].filter(d=>d===n).length<=s[o])}default:return p(e,l)}}function m(e,a=0,i=new Set){var r;if(typeof e=="string")return JSON.stringify(e.slice(0,120))+(e.length>120?"…":"");if(typeof e=="bigint")return`${e}n`;if(e===null||typeof e!="object")return String(e);if(i.has(e))return"<circular reference>";if(a>=3)return`<${Array.isArray(e)?"Array":((r=e.constructor)==null?void 0:r.name)||"Object"}>`;const l=new Set(i).add(e),s=n=>m(n,a+1,l);if(Array.isArray(e))return`[${e.slice(0,8).map(s).join(", ")}${e.length>8?", …":""}]`;if(e instanceof Map)return`Map {${[...e].slice(0,8).map(([n,o])=>`${s(n)} => ${s(o)}`).join(", ")}${e.size>8?", …":""}}`;if(e instanceof Set)return`Set {${[...e].slice(0,8).map(s).join(", ")}${e.size>8?", …":""}}`;const t=Object.entries(e).filter(([,n])=>typeof n!="function");return`{${t.slice(0,8).map(([n,o])=>`${n}: ${s(o)}`).join(", ")}${t.length>8?", …":""}}`}function z(e){const a="if (__case.prefix && JSON.stringify(__args[0].slice(0,__returned)) !== JSON.stringify(__case.prefix)) throw new Error('Incorrect in-place output prefix');";let i=O(e);if(!e.operations){if(!i.includes(a))throw new Error("The JavaScript fixture validation adapter needs regeneration.");i=i.replace(a,"__validateResultShape(__returned, __args, __case, __problemId);")}const l=i.lastIndexOf(e.operations?"__results;":"__normalize(");if(l<0)throw new Error("Missing JavaScript fixture return adapter.");return i.slice(0,l)+"return "+i.slice(l)}function E(e,a,i,l){if(i.prefix){if(!Number.isInteger(e)||e<0||e>a[0].length)throw new Error("Return the number of elements in the updated prefix.");const t=a[0].slice(0,e),r=i.prefix,n=o=>[...o].sort((d,c)=>JSON.stringify(d).localeCompare(JSON.stringify(c)));if(JSON.stringify(l===27?n(t):t)!==JSON.stringify(l===27?n(r):r))throw new Error("The returned length does not describe the correct in-place array prefix.")}const s=i.resultArg!==void 0?a[i.resultArg]:e;if(i.output==="list"||i.output==="randomList"){const t=new Set;for(let r=s;r;r=r.next){if(t.has(r))throw new Error("The returned linked list contains a cycle.");t.add(r)}}if(i.output==="tree"){const t=[s],r=new Set;for(let n=0;n<t.length;n++){const o=t[n];if(o){if(r.has(o))throw new Error("The returned tree contains a cycle or a shared child.");r.add(o),t.push(o.left,o.right)}}}}function J(e,a={frames:160,events:5e5,milliseconds:2e3}){const i=e.fixtures.map(l=>{const s={name:l.name,input:l.args,expected:l.expected,passed:!1,trace:[],traceTruncated:!1,executionEvents:0,stdout:""},t=[];let r=!1;const n=performance.now()+a.milliseconds,o={start(){r=!0},stop(){r=!1},leave(){r&&t.pop()},record(c,h,_){var A;if(s.executionEvents++,s.executionEvents>a.events||s.executionEvents%64===0&&performance.now()>n)throw new Error("Execution stopped. Check whether your loops finish.");if(!r)return _;const u=e.execution.sites[c];if(!u)throw new Error("The prepared JavaScript trace does not match the source.");u.kind==="call"&&t.push(u.label);const y={};for(const[x,j]of Object.entries(h()).slice(0,32))try{const w=j();typeof w!="function"&&!(x==="this"&&(w===void 0||w===globalThis))&&(y[x]=m(w))}catch{}const f={line:u.line,kind:u.kind==="call"||u.kind==="return"?u.kind:"statement",functionName:t[t.length-1]||"<module>",locals:y,stack:[...t]};return f.statement=u.kind==="call"?(A=e.code.split(`
`)[u.line-1])==null?void 0:A.trim():e.code.slice(u.start,u.end).trim(),u.kind==="check"&&(f.detail="condition evaluated",f.value=m(_),f.valueLabel="condition"),u.kind==="iterate"&&(f.detail="next iteration"),u.kind==="loop-end"&&(f.detail="iteration finished"),u.kind==="return"&&(f.value=m(_)),s.trace.length<a.frames?s.trace.push(f):(s.trace[s.trace.length-1]=f,s.traceTruncated=!0),_}},d=Math.random;try{const c=$.includes(e.problemId)?S:"",h=new Function("__case","__problemId","__trace","console","__validateResultShape",`${N}
${c}
${e.execution.code}
${z(l)}`),_=(...y)=>{s.stdout=(s.stdout+y.map(f=>typeof f=="string"?f:m(f)).join(" ")+`
`).slice(0,4e3)},u=h(JSON.parse(JSON.stringify(l)),e.problemId,o,{log:_,warn:_,error:_},E);s.actual=JSON.parse(JSON.stringify(u)),s.passed=k(s.actual,l,e.problemId)}catch(c){s.error={type:c instanceof Error?c.name:"Error",message:(c instanceof Error?c.message:String(c)).slice(0,500)}}finally{Math.random=d}return s});return{tests:i,passed:i.filter(l=>l.passed).length,total:i.length}}const v=self;v.onmessage=({data:e})=>{v.postMessage({runId:e.runId,type:"status",status:"running"});try{v.postMessage({runId:e.runId,type:"result",result:J(e)})}catch(a){v.postMessage({runId:e.runId,type:"error",message:a instanceof Error?a.message:String(a)})}}})();
