const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '../..');
const definitions = [
  { id: 'requirements', section: 'Non-functional Requirements', caption: 'Functional and non-functional requirements', marker: 'Functional Requirements' },
  { id: 'entities', section: 'Core Entities', caption: 'Core entities', marker: 'Core Entities' },
  { id: 'create-url', section: '1) Create a short URL', caption: 'Creating and storing a short URL', marker: 'POST /urls' },
  { id: 'redirect', section: '2) Redirect to the original URL', caption: 'Looking up a short code and returning a redirect', marker: 'GET /{short_code}' },
  { id: 'hash', section: '1) Generate unique short codes', caption: 'Generating a short code with a hash function', marker: 'Hash Function' },
  { id: 'counter', section: '1) Generate unique short codes', caption: 'Generating a short code with a unique counter', marker: 'Counter' },
  { id: 'cache', section: '2) Make redirects fast', caption: 'Checking the cache before the database', marker: 'Cache' },
  { id: 'final-design', section: 'Final Design', caption: 'Final design with separate read and write services', marker: 'Read Service' },
];

function extractBitlyDiagrams() {
  const html = fs.readFileSync(path.join(root, 'public/system-design/hello-interview/01-bitly.html'), 'utf8');
  const images = [...html.matchAll(/<img\b[^>]*>/g)].map(([tag]) => tag.match(/\bsrc="data:image\/svg\+xml;base64,([^"]+)"/)?.[1]);
  if (images.length !== definitions.length || images.some(image => !image)) throw new Error('Expected all eight embedded Bitly SVG diagrams.');
  const output = path.join(root, 'public/system-design/bitly-diagrams');
  fs.mkdirSync(output, { recursive: true });
  const diagrams = definitions.map(({ marker, ...definition }, index) => {
    const bytes = Buffer.from(images[index], 'base64');
    const svg = bytes.toString('utf8');
    if (!svg.includes(marker)) throw new Error(`Unexpected diagram order: ${definition.id}`);
    const box = svg.match(/viewBox="([^"]+)"/)?.[1].split(/\s+/).map(Number);
    if (!box || box.length !== 4 || !box.every(Number.isFinite)) throw new Error(`Missing diagram dimensions: ${definition.id}`);
    const filename = `${definition.id}.svg`;
    fs.writeFileSync(path.join(output, filename), bytes);
    return { ...definition, filename, width: box[2], height: box[3], revision: crypto.createHash('sha256').update(bytes).digest('hex').slice(0, 12) };
  });
  fs.writeFileSync(path.join(root, 'src/data/bitly-diagrams.ts'), 'export const bitlyDiagrams = ' + JSON.stringify(diagrams, null, 2) + ' as const;\n');
  console.log(`Extracted ${diagrams.length} original Bitly diagrams.`);
}

module.exports = { extractBitlyDiagrams };
if (require.main === module) extractBitlyDiagrams();
