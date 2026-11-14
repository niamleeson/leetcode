const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const source = process.argv[2];
if (!source) throw new Error('Usage: node tools/system-design/import-articles.cjs <export-directory>');
const root = path.resolve(__dirname, '../..');
const manifest = JSON.parse(fs.readFileSync(path.join(source, 'verification.json'), 'utf8'));
const output = path.join(root, 'public/system-design/hello-interview');
fs.mkdirSync(output, { recursive: true });
const articles = manifest.pages.map((page, index) => {
  const bytes = fs.readFileSync(path.join(source, page.filename));
  const check = page.audit;
  if (!check.textMatchesSource || check.missingImages.length || check.excludedSectionsRemaining.length || check.closedAccordions) {
    throw new Error(`Source verification failed: ${page.name}`);
  }
  fs.writeFileSync(path.join(output, page.filename), bytes);
  return {
    slug: page.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    title: page.name,
    category: index < 32 ? 'Question breakdowns' : index < 39 ? 'Patterns' : 'Key technologies',
    filename: page.filename,
    sourceUrl: page.url,
    revision: crypto.createHash('sha256').update(bytes).digest('hex').slice(0, 12),
    imageCount: check.imageCount,
  };
});
if (articles.length !== 49 || new Set(articles.map(a => a.slug)).size !== 49) throw new Error('Expected 49 unique articles.');
fs.writeFileSync(path.join(root, 'src/data/system-design-articles.ts'), 'export const systemDesignArticles = ' + JSON.stringify(articles, null, 2) + ' as const;\n');
fs.copyFileSync(path.join(root, 'src/data/bitly-condensed.txt'), path.join(root, 'public/system-design/bitly-condensed.txt'));
console.log(`Imported ${articles.length} articles with ${articles.reduce((n, a) => n + a.imageCount, 0)} embedded images.`);
