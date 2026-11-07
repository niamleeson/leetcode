#!/usr/bin/env python3
"""Build the complete catalog from a fixed official snapshot and licensed sources."""
import argparse
import ast
import hashlib
import html
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import shutil
from urllib.parse import quote, urljoin, urlparse

ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).resolve().parent
LANGUAGES = {
    'python': ('python', 'Python 3'), 'ts': ('typescript', 'TypeScript'),
    'js': ('javascript', 'JavaScript'), 'sql': ('sql', 'SQL'),
    'java': ('java', 'Java'), 'cpp': ('cpp', 'C++'), 'go': ('go', 'Go'),
    'bash': ('bash', 'Bash'), 'cs': ('csharp', 'C#'), 'c': ('c', 'C'),
    'rust': ('rust', 'Rust'), 'php': ('php', 'PHP'), 'kotlin': ('kotlin', 'Kotlin'),
    'swift': ('swift', 'Swift'), 'rb': ('ruby', 'Ruby'), 'scala': ('scala', 'Scala'),
    'dart': ('dart', 'Dart'), 'nim': ('nim', 'Nim'), 'cj': ('cangjie', 'Cangjie'),
}
PRIORITY = ['python', 'ts', 'js', 'sql', 'java', 'cpp', 'go', 'bash', 'cs', 'c', 'rust']
TOPIC_ALIASES = {
    'Array': 'Arrays & Hashing', 'Hash Table': 'Arrays & Hashing',
    'Tree': 'Trees', 'Binary Tree': 'Trees', 'Binary Search Tree': 'Trees',
    'Trie': 'Tries', 'Heap (Priority Queue)': 'Heap / Priority Queue',
    'Graph Theory': 'Graphs', 'Math': 'Math & Geometry', 'Geometry': 'Math & Geometry',
    'Union-Find': 'Union Find', 'Divide and Conquer': 'Divide & Conquer',
    'Sort': 'Sorting',
}
GAP_IDS = {4047, 4054, 4055, 4058, 4059, 4069, 4072, 4073, 4077, 4081, 4082, 4095, 4096, 4100}
ALLOWED_TAGS = {'p', 'div', 'span', 'strong', 'b', 'em', 'i', 'u', 's', 'del', 'code',
                'pre', 'ul', 'ol', 'li', 'table', 'thead', 'tbody', 'tfoot', 'tr', 'th',
                'td', 'sup', 'sub', 'br', 'hr', 'img', 'a', 'blockquote', 'h1', 'h2',
                'h3', 'h4', 'h5', 'h6', 'small', 'dl', 'dt', 'dd'}
VOID_TAGS = {'img', 'br', 'hr'}


def compact(value):
    return json.dumps(value, ensure_ascii=False, separators=(',', ':'))


class CleanHTML(HTMLParser):
    """Keep statement formatting; discard scripts, hidden instructions and unsafe URLs."""
    def __init__(self, base):
        super().__init__(convert_charrefs=False)
        self.base = base
        self.result = []
        self.hidden_depth = 0

    def handle_starttag(self, tag, attrs):
        attributes = dict(attrs)
        style = (attributes.get('style') or '').replace(' ', '').lower()
        hidden = tag in {'script', 'style', 'iframe', 'object', 'template', 'noscript'} or \
            'hidden' in attributes or attributes.get('aria-hidden') == 'true' or \
            any(rule in style for rule in ['display:none', 'visibility:hidden', 'opacity:0', 'font-size:0'])
        if self.hidden_depth:
            if tag not in VOID_TAGS:
                self.hidden_depth += 1
            return
        if hidden:
            if tag not in VOID_TAGS:
                self.hidden_depth = 1
            return
        if tag not in ALLOWED_TAGS:
            return
        safe = []
        for key, value in attrs:
            if value is None:
                continue
            if key in {'href', 'src'}:
                value = urljoin(self.base, value)
                if urlparse(value).scheme not in {'http', 'https'}:
                    continue
            elif key not in {'alt', 'title', 'colspan', 'rowspan', 'width', 'height', 'start'}:
                continue
            if key in {'colspan', 'rowspan', 'width', 'height', 'start'} and not value.isdigit():
                continue
            safe.append(f' {key}="{html.escape(value, quote=True)}"')
        if tag == 'a':
            safe.append(' rel="noopener noreferrer"')
        if tag == 'img':
            safe.append(' loading="lazy"')
        self.result.append('<' + tag + ''.join(safe) + '>')

    def handle_endtag(self, tag):
        if self.hidden_depth:
            if tag not in VOID_TAGS:
                self.hidden_depth -= 1
            return
        if tag in ALLOWED_TAGS and tag not in VOID_TAGS:
            self.result.append(f'</{tag}>')

    def handle_data(self, data):
        if not self.hidden_depth:
            self.result.append(html.escape(data))

    def handle_entityref(self, name):
        if not self.hidden_depth:
            self.result.append('&' + name + ';')

    def handle_charref(self, name):
        if not self.hidden_depth:
            self.result.append('&#' + name + ';')


def description_from(text, base):
    match = re.search(r'<!-- description:start -->(.*?)<!-- description:end -->', text, re.S)
    if not match:
        raise ValueError('Missing description markers')
    parser = CleanHTML(base)
    parser.feed(match.group(1))
    parser.close()
    return ''.join(parser.result).strip()


def explanation_from(section):
    text = section.split('<!-- tabs:start -->')[0].split('```')[0]
    text = re.sub(r'<!--.*?-->', '', text, flags=re.S)
    text = re.sub(r'^### Solution[^\n]*\n?', '', text, flags=re.M)
    text = re.sub(r'^#### (?:Python3|Java|C\+\+|Go|TypeScript|JavaScript|MySQL|SQL|Rust|C#).*$', '', text, flags=re.M)
    # Upstream notes about empty tabs become stale when another licensed source fills them.
    text = re.sub(r"(?:This problem's|The|Its) (?:language|code|solution) tabs[^.;\n]*(?:empty|unimplemented)[^.;\n]*[.;]?\s*", '', text, flags=re.I)
    text = re.sub(r'\bthere is no implemented algorithm yet\.\s*', '', text, flags=re.I)
    text = re.sub(r'\n{3,}', '\n\n', text).strip()
    return text


def github_url(source, path):
    return 'https://github.com/' + source['repository'] + '/blob/' + source['commit'] + '/' + quote(str(path), safe='/')


def source_info(key, sources, path):
    source = sources[key]
    names = {'doocs': 'doocs/leetcode contributors', 'walkccc': 'Peng-Yu Chen (walkccc)',
             'kamyu': 'kamyu104/LeetCode-Solutions contributors'}
    return {
        'id': key, 'name': names[key], 'url': github_url(source, path),
        'license': source['license'],
        'licenseUrl': 'https://creativecommons.org/licenses/by-sa/4.0/' if key == 'doocs'
                      else github_url(source, source['licenseFile']),
        'modifications': 'Selected the first solution; removed empty language tabs and repository-only notes; sanitized statement formatting.'
                         if key == 'doocs' else 'Selected an implementation; algorithm source is unchanged.',
    }


def meaningful_code(language, code):
    if not code.strip():
        return False
    if re.search(r'\b(?:TODO|YOUR CODE HERE|NotImplementedError)\b', code):
        return False
    if language == 'python':
        tree = ast.parse(code)
        return any(isinstance(node, (ast.Return, ast.Assign, ast.AugAssign, ast.For,
                                    ast.While, ast.Raise, ast.Call)) for node in ast.walk(tree))
    without_comments = re.sub(r'/\*.*?\*/|//[^\n]*', '', code, flags=re.S)
    without_comments = re.sub(r'^\s*(?:#|--).*$', '', without_comments, flags=re.M)
    return len(without_comments.strip()) > 15


def load_authored(source_dir):
    # Keep authored additions in the repository after the first import.
    merged = {}
    for path in sorted(HERE.glob('authored-explanations-*.json')) + sorted(source_dir.glob('authored-explanations-*.json')):
        merged.update(json.loads(path.read_text()))
    missing = GAP_IDS - {int(key) for key in merged}
    if missing:
        raise ValueError(f'Missing authored explanations: {sorted(missing)}')
    for key, item in merged.items():
        if len(item.get('explanationMarkdown', '').strip()) < 100:
            raise ValueError(f'{key}: authored explanation is too short')
    return merged


def topics_for(raw_topics, solutions):
    topics = list(dict.fromkeys(TOPIC_ALIASES.get(tag, tag) for tag in raw_topics))
    languages = {solution['language'] for solution in solutions}
    if 'sql' in languages:
        topics.append('Database')
    if 'bash' in languages:
        topics.append('Shell')
    if re.search(r'\bpd\.DataFrame|\bimport pandas\b', '\n'.join(s['code'] for s in solutions)):
        topics.append('Pandas')
    # A TypeScript implementation does not make a general algorithm a
    # JavaScript exercise. Infer this category only for JS/TS-only entries.
    if not raw_topics and languages and languages <= {'javascript', 'typescript'}:
        topics.append('JavaScript')
    return list(dict.fromkeys(topics)) or ['Programming']


def generate(source_dir):
    official = json.loads((HERE / 'official-snapshot.json').read_text())
    sources = json.loads((HERE / 'sources.json').read_text())
    authored = load_authored(source_dir)
    adaptation_file = source_dir / 'cpp-adaptations.json'
    if not adaptation_file.exists():
        adaptation_file = HERE / 'cpp-adaptations.json'
    adaptations = json.loads(adaptation_file.read_text()) if adaptation_file.exists() else {}
    repos = {key: source_dir / source['directory'] for key, source in sources.items()}
    for key, repo in repos.items():
        if not (repo / sources[key]['licenseFile']).is_file():
            raise ValueError(f'Missing pinned {key} source tree or license: {repo}')
    doocs = {int(path.parent.name.split('.')[0]): path for path in (repos['doocs'] / 'solution').glob('*/*/README_EN.md')}
    walkccc = {int(path.name.split('.')[0]): path for path in (repos['walkccc'] / 'solutions').iterdir()
               if path.is_dir() and path.name.split('.')[0].isdigit()}
    questions = sorted(official['questions'], key=lambda item: int(item['questionFrontendId']))
    ids = [int(item['questionFrontendId']) for item in questions]
    if len(ids) != official['total'] or len(set(ids)) != official['total']:
        raise ValueError('Official snapshot has duplicate IDs or a total mismatch')
    documents = []
    metadata = []
    counts = {'doocs': 0, 'walkccc': 0, 'kamyu': 0}
    for question in questions:
        id = int(question['questionFrontendId'])
        path = doocs[id]
        text = path.read_text()
        rel = path.relative_to(repos['doocs'])
        raw_base = 'https://raw.githubusercontent.com/' + sources['doocs']['repository'] + '/' + sources['doocs']['commit'] + '/' + quote(str(rel), safe='/')
        sections = re.findall(r'<!-- solution:start -->(.*?)<!-- solution:end -->', text, re.S)
        if not sections:
            raise ValueError(f'{id}: missing source solution section')
        section = sections[0]
        heading = re.search(r'^### (.*)', section, re.M)
        title = heading.group(1).strip() if heading else 'Solution'
        description = description_from(text, raw_base)
        explanation = explanation_from(section)
        solutions = []
        source_list = [source_info('doocs', sources, rel)]
        chosen_languages = set()
        for language, code in re.findall(r'```([^\n]*)\n(.*?)```', section, re.S):
            language = language.strip()
            if language not in LANGUAGES or language in chosen_languages or not code.strip():
                continue
            canonical, label = LANGUAGES[language]
            if not meaningful_code(canonical, code):
                raise ValueError(f'{id}: populated {label} block is a placeholder')
            solutions.append({'language': canonical, 'label': label, 'code': code.strip(), 'sourceId': 'doocs'})
            chosen_languages.add(language)
        relationship = 'matching'
        if solutions:
            counts['doocs'] += 1
        else:
            relationship = 'alternative'
            candidate = None
            if id in walkccc:
                for extension, language, label in [('.py', 'python', 'Python 3'), ('.ts', 'typescript', 'TypeScript'),
                                                   ('.js', 'javascript', 'JavaScript'), ('.sql', 'sql', 'SQL'),
                                                   ('.java', 'java', 'Java'), ('.cpp', 'cpp', 'C++')]:
                    files = sorted(walkccc[id].glob('*' + extension), key=lambda item: ('-' in item.stem, len(item.name), item.name))
                    if files:
                        candidate = ('walkccc', files[0], language, label)
                        break
            if candidate is None:
                cpp = repos['kamyu'] / 'C++' / (question['titleSlug'] + '.cpp')
                if cpp.exists():
                    candidate = ('kamyu', cpp, 'cpp', 'C++')
            if candidate is None:
                raise ValueError(f'{id}: no executable source implementation')
            source_id, source_path, language, label = candidate
            code = source_path.read_text().strip()
            if not meaningful_code(language, code):
                raise ValueError(f'{id}: fallback code is empty or a placeholder')
            solutions.append({'language': language, 'label': label, 'code': code, 'sourceId': source_id})
            source_list.append(source_info(source_id, sources, source_path.relative_to(repos[source_id])))
            counts[source_id] += 1
        if str(id) in adaptations:
            adaptation = adaptations[str(id)]
            cpp_solutions = [solution for solution in solutions if solution['language'] == 'cpp']
            if len(cpp_solutions) != 1:
                raise ValueError(f'{id}: C++ adaptation does not identify exactly one implementation')
            cpp = cpp_solutions[0]
            for replacement in adaptation['replacements']:
                old, new = replacement['old'], replacement['new']
                if cpp['code'].count(old) != 1:
                    raise ValueError(f'{id}: reviewed C++ replacement no longer matches exactly once: {old!r}')
                cpp['code'] = cpp['code'].replace(old, new, 1)
            cpp['label'] = adaptation['label']
            attribution = next(source for source in source_list if source['id'] == cpp['sourceId'])
            changes = adaptation.get('modifications', [])
            attribution['modifications'] = ' '.join(changes + [f"Implementation requires {adaptation['standard']}."])
        if str(id) in authored:
            addition = authored[str(id)]
            explanation = addition['explanationMarkdown'].strip()
            complexity = [(key, addition.get(key)) for key in ('timeComplexity', 'spaceComplexity')]
            explanation += '\n\n### Complexity\n\n' + '\n\n'.join(
                f'**{"Time" if key == "timeComplexity" else "Space"}:** {value}' for key, value in complexity if value)
            relationship = 'matching'
            title = 'Solution and correctness'
            source_list.append({'id': 'trainer', 'name': 'LeetCode Trainer explanation',
                                'url': 'https://github.com/niamleeson/leetcode/tree/main/tools/catalog',
                                'license': 'CC-BY-SA-4.0', 'licenseUrl': 'https://creativecommons.org/licenses/by-sa/4.0/',
                                'modifications': 'Original explanation and validation notes added for the selected implementation.'})
        if len(re.sub(r'[^A-Za-z]', '', explanation)) < 40:
            raise ValueError(f'{id}: missing meaningful local explanation')
        if re.search(r'(?:language|code|solution) tabs[^\n]*empty', explanation, re.I):
            raise ValueError(f'{id}: stale empty-tab prose remains')
        url = 'https://leetcode.com/problems/' + question['titleSlug'] + '/'
        documents.append({'id': id, 'title': question['title'], 'descriptionHtml': description,
                          'explanationMarkdown': explanation, 'approachTitle': title,
                          'implementationRelationship': relationship, 'solutions': solutions,
                          'sources': source_list, 'originalUrl': url})
        raw_topics = [tag['name'] for tag in question['topicTags']]
        topics = topics_for(raw_topics, solutions)
        metadata.append({'id': id, 'title': question['title'], 'difficulty': question['difficulty'],
                         'topics': topics, 'sourceTopics': raw_topics,
                         'url': url, 'isPremium': question['isPaidOnly']})
    digest = hashlib.sha256()
    for document in documents:
        digest.update(compact(document).encode())
    digest.update(compact(metadata).encode())
    revision = digest.hexdigest()[:16]
    content_base = f'catalog/{revision}'
    output = ROOT / 'public' / content_base
    output.mkdir(parents=True, exist_ok=True)
    for document in documents:
        (output / f"{document['id']}.json").write_text(compact(document) + '\n')
    license_dir = ROOT / 'public/catalog/licenses'
    license_dir.mkdir(parents=True, exist_ok=True)
    for key, repo in repos.items():
        shutil.copyfile(repo / sources[key]['licenseFile'], license_dir / (key + '.txt'))
    (license_dir / 'ATTRIBUTION.txt').write_text(
        'Catalog statements and doocs explanations/implementations: doocs/leetcode contributors, CC BY-SA 4.0.\n'
        'Imported content has been selected and reformatted; HTML has been sanitized.\n'
        'Original explanatory additions in tools/catalog are also CC BY-SA 4.0.\n'
        'Fallback implementations: Peng-Yu Chen (walkccc), MIT; kamyu104/LeetCode-Solutions contributors, MIT.\n'
        'Every catalog document contains source links pinned to the exact imported commits.\n'
        'Original problem links identify LeetCode; no affiliation or endorsement is implied.\n')
    for path in source_dir.glob('authored-explanations-*.json'):
        shutil.copyfile(path, HERE / path.name)
    if adaptation_file.exists() and adaptation_file.parent != HERE:
        shutil.copyfile(adaptation_file, HERE / adaptation_file.name)
    generated = ROOT / 'src/data/catalog'
    generated.mkdir(parents=True, exist_ok=True)
    batches = [metadata[start:start + 100] for start in range(0, len(metadata), 100)]
    # Keep TypeScript's contextual unions bounded instead of inferring 4,101
    # heterogeneous object literals as one enormous array-expression type.
    batch_source = '\n'.join(f'const batch{index}: Problem[] = {compact(batch)};' for index, batch in enumerate(batches))
    (generated / 'metadata.ts').write_text("// Generated by tools/catalog/import.py; metadata only.\nimport type { Problem } from '../../types';\n\n" + batch_source + '\nexport const catalogProblems: Problem[] = [' + ','.join(f'...batch{index}' for index in range(len(batches))) + '];\n')
    topics = sorted({topic for item in metadata for topic in item['topics']})
    (generated / 'topics.ts').write_text('// Generated catalog study topics.\nexport const catalogTopics = ' + compact(topics) + ' as const;\nexport type CatalogTopic = typeof catalogTopics[number];\n')
    manifest = {'revision': revision, 'snapshotDate': official['fetchedAt'][:10],
                'total': official['total'], 'contentBase': content_base, 'licenseBase': 'catalog/licenses'}
    (generated / 'manifest.ts').write_text('// Generated catalog revision.\nexport const catalogManifest = ' + compact(manifest) + ' as const;\n')
    audit = {**manifest, 'sources': sources, 'implementationCounts': counts,
             'authoredExplanationIds': sorted(map(int, authored)), 'missingIds': [],
             'totalSolutions': sum(len(item['solutions']) for item in documents),
             'contentBytes': sum(len(compact(item).encode()) for item in documents)}
    (HERE / 'coverage.json').write_text(json.dumps(audit, indent=2) + '\n')
    for previous in (ROOT / 'public/catalog').iterdir():
        if previous.is_dir() and re.fullmatch(r'[a-f0-9]{16}', previous.name) and previous.name != revision:
            shutil.rmtree(previous)
    print(json.dumps(audit, indent=2))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--sources-dir', type=Path, required=True,
                        help='Directory containing the pinned extracted source archives and authored additions.')
    generate(parser.parse_args().sources_dir)
