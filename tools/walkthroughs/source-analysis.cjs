const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const t = require('@babel/types');

function indexingFor(source) {
  const indexing = {};
  function objectPath(node) {
    if(t.isIdentifier(node))return node.name;
    if(t.isThisExpression(node))return 'this';
    if(t.isMemberExpression(node)&&!node.computed&&t.isIdentifier(node.property)) {
      const parent=objectPath(node.object);
      if(parent)return `${parent}.${node.property.name}`;
    }
    return null;
  }
  const entry = key => indexing[key] ||= {indices:[],cells:[]};
  traverse(parser.parse(source),{MemberExpression({node}) {
    if(!node.computed||!t.isIdentifier(node.property))return;
    const path=objectPath(node.object);
    if(path&&!entry(path).indices.includes(node.property.name))entry(path).indices.push(node.property.name);
    if(t.isMemberExpression(node.object)&&node.object.computed&&t.isIdentifier(node.object.property)) {
      const grid=objectPath(node.object.object);
      const cell=[node.object.property.name,node.property.name];
      if(grid&&!entry(grid).cells.some(pair=>pair[0]===cell[0]&&pair[1]===cell[1]))entry(grid).cells.push(cell);
    }
  }});
  return indexing;
}
module.exports={indexingFor};
