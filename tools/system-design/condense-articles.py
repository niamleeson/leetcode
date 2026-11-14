"""Build compact reading notes and extract local diagrams from the verified HTML exports.

Requires beautifulsoup4. Builds reviewed plain-bullet notes with complete original
image coverage. No network access is required.
"""
from pathlib import Path
from bs4 import BeautifulSoup
import base64
import hashlib
import json
import re

ROOT = Path(__file__).resolve().parents[2]
OUTPUT = ROOT / 'src/data/system-design-notes'
PUBLIC = ROOT / 'public/system-design/notes'
def extract(article):
    doc = BeautifulSoup((ROOT / 'public/system-design/hello-interview' / article['filename']).read_text(encoding='utf8'), 'html.parser')
    images = doc.select('#markdown img')
    if len(images) != article['imageCount']:
        raise ValueError('Image count changed: ' + article['slug'])
    directory = PUBLIC / article['slug']
    directory.mkdir(parents=True, exist_ok=True)
    diagrams = []
    for index, element in enumerate(images, 1):
        match = re.fullmatch(r'data:image/([^;]+);base64,(.*)', element.get('src', ''), re.S)
        if not match:
            raise ValueError('Nonlocal image: ' + article['slug'])
        extension = {'svg+xml': 'svg', 'jpeg': 'jpg'}.get(match[1], match[1])
        contents = base64.b64decode(match[2], validate=True)
        filename = f'{index:02d}.{extension}'
        (directory / filename).write_bytes(contents)
        caption = element.get('alt') or next((p.get('aria-label') for p in element.parents if p.get('role') == 'img'), '') or f"{article['title']} diagram {index}"
        diagrams.append({'filename': filename, 'caption': caption,
            'revision': hashlib.sha256(contents).hexdigest()[:12],
            'width': float(element.get('width', 1000)), 'height': float(element.get('height', 600))})
    return diagrams


def main():
    OUTPUT.mkdir(parents=True, exist_ok=True)
    PUBLIC.mkdir(parents=True, exist_ok=True)
    raw = (ROOT / 'src/data/system-design-articles.ts').read_text(encoding='utf8')
    articles = json.loads(raw[raw.index('=') + 1:raw.rindex('as const')])
    process_source = (ROOT / 'src/data/system-design-processes.txt').read_text(encoding='utf8')
    process_chunks = re.findall(r'^@@ ([^\n]+)\n(.*?)(?=^@@ |\Z)', process_source, re.M | re.S)
    processes = dict(process_chunks)
    if len(processes) != len(process_chunks) or set(processes) != {a['slug'] for a in articles}:
        raise ValueError('Expected exactly one process-flow source for every article.')
    report = []
    for article in articles:
        originals = extract(article)
        if article['slug'] == 'bitly':
            raw = (ROOT / 'src/data/bitly-diagrams.ts').read_text(encoding='utf8')
            diagrams = json.loads(raw[raw.index('=') + 1:raw.rindex('as const')])
            sections = []
            for block in (ROOT / 'src/data/bitly-condensed.txt').read_text(encoding='utf8').strip().split('\n\n'):
                title, *points = block.splitlines()
                sections.append({'title': title, 'level': 4 if re.match(r'^\d+\)', title) else 3,
                    'points': [p.removeprefix('- ') for p in points],
                    'diagrams': [{**d, 'filename': f"{i + 1:02d}.svg"} for i, d in enumerate(diagrams) if d['section'] == title]})
        else:
            source = (ROOT / 'src/data/system-design-notes-source.txt').read_text(encoding='utf8')
            chunks = dict(re.findall(r'^@@ ([^\n]+)\n(.*?)(?=^@@ |\Z)', source, re.M | re.S))
            if article['slug'] not in chunks:
                raise ValueError('Missing reviewed notes: ' + article['slug'])
            sections = []
            used = []
            for block in re.split(r'\n\s*\n', chunks[article['slug']].strip()):
                heading, *lines = block.splitlines()
                title, _, image_ids = heading.partition(' | ')
                ids = [int(i.strip()) for i in image_ids.split(',') if i.strip()]
                if any(not line.startswith('- ') for line in lines):
                    raise ValueError('Expected plain bullet: ' + heading)
                sections.append({'title': title, 'level': 4 if re.match(r'^\d+[.)] ', title) else 3,
                    'points': [line[2:] for line in lines],
                    'diagrams': [originals[i - 1] for i in ids]})
                used.extend(ids)
            if sorted(used) != list(range(1, len(originals) + 1)):
                raise ValueError(f"Diagram coverage error: {article['slug']} {used}")
            if article['slug'] == 'postgresql':
                diagram = ROOT / 'public/system-design/postgresql-architecture.svg'
                contents = diagram.read_bytes()
                destination = PUBLIC / 'postgresql'
                destination.mkdir(exist_ok=True)
                (destination / 'architecture.svg').write_bytes(contents)
                sections[4]['diagrams'].append({'filename': 'architecture.svg', 'caption': 'Primary writes, read replicas, and recovery (study diagram)',
                    'width': 880, 'height': 390, 'revision': hashlib.sha256(contents).hexdigest()[:12]})
        for section in sections:
            section['flows'] = []
        for block in re.split(r'\n\s*\n', processes[article['slug']].strip()):
            heading, *lines = block.splitlines()
            section_title, separator, flow_title = heading.partition(' >> ')
            targets = [s for s in sections if s['title'] == section_title]
            if not separator or not flow_title or len(targets) != 1:
                raise ValueError(f"Invalid process location: {article['slug']} / {heading}")
            if len(lines) < 3 or any(not line.startswith('- ') or not line[2:].strip() for line in lines):
                raise ValueError(f'Expected at least three complete process steps: {heading}')
            if any(f['title'] == flow_title for f in targets[0]['flows']):
                raise ValueError(f'Duplicate process title: {heading}')
            targets[0]['flows'].append({'title': flow_title, 'steps': [line[2:] for line in lines]})
        note = {'title': article['title'], 'sections': sections}
        (OUTPUT / (article['slug'] + '.json')).write_text(json.dumps(note, ensure_ascii=False, indent=2) + '\n', encoding='utf8', newline='\n')
        blocks = []
        for section in sections:
            block = [section['title'], *('- ' + p for p in section['points'])]
            for flow in section['flows']:
                block.extend(['', 'Process: ' + flow['title'], *('- Step ' + str(i + 1) + ': ' + step for i, step in enumerate(flow['steps']))])
            blocks.append('\n'.join(block))
        plain = '\n\n'.join(blocks) + '\n'
        (PUBLIC / (article['slug'] + '.txt')).write_text(plain, encoding='utf8', newline='\n')
        if article['slug'] == 'bitly':
            (ROOT / 'public/system-design/bitly-condensed.txt').write_text(plain, encoding='utf8', newline='\n')
        steps = sum(len(flow['steps']) for s in sections for flow in s['flows'])
        report.append({'slug': article['slug'], 'words': len(plain.split()), 'sections': len(sections),
            'points': sum(len(s['points']) for s in sections) + steps,
            'processes': sum(len(s['flows']) for s in sections), 'processSteps': steps,
            'diagrams': sum(len(s['diagrams']) for s in sections)})
    (PUBLIC / 'manifest.json').write_text(json.dumps(report, indent=2) + '\n', encoding='utf8', newline='\n')
    print(json.dumps(report, indent=2))


if __name__ == '__main__':
    main()
