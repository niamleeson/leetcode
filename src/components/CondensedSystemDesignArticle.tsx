import { useEffect, useState } from 'react';

interface Diagram { filename: string; caption: string; revision: string; width: number; height: number }
interface ProcessFlow { title: string; steps: string[]; diagramFilenames?: string[] }
interface Notes { title: string; sections: { title: string; level: number; points: string[]; diagrams: Diagram[]; flows: ProcessFlow[] }[] }
const loaders = import.meta.glob<{ default: Notes }>('../data/system-design-notes/*.json');

const concepts = [
  { key: 'cache', terms: ['cache', 'caches'], color: 'bg-amber-400/15 text-amber-200 light:bg-amber-100 light:text-amber-950' },
  { key: 'database', terms: ['database', 'databases'], color: 'bg-sky-400/15 text-sky-200 light:bg-sky-100 light:text-sky-950' },
  { key: 'gateway', terms: ['API gateway'], color: 'bg-violet-400/20 text-violet-200 light:bg-violet-100 light:text-violet-950' },
  { key: 'load-balancer', terms: ['load balancer', 'load balancers'], color: 'bg-indigo-400/20 text-indigo-200 light:bg-indigo-100 light:text-indigo-950' },
  { key: 'counter', terms: ['global counter', 'counter', 'counters', 'ID allocator', 'allocator'], color: 'bg-emerald-400/15 text-emerald-200 light:bg-emerald-100 light:text-emerald-950' },
  { key: 'service', terms: ['primary server', 'read service', 'write service', 'creation service', 'redirect service'], color: 'bg-rose-400/15 text-rose-200 light:bg-rose-100 light:text-rose-950' },
];
const conceptByTerm = new Map(concepts.flatMap(concept => concept.terms.map(term => [term.toLowerCase(), concept] as const)));
const conceptPattern = new RegExp(`\\b(${[...conceptByTerm.keys()].sort((a, b) => b.length - a.length).join('|')})\\b`, 'gi');

function conceptText(text: string, enabled: boolean) {
  if (!enabled) return text;
  return text.split(conceptPattern).map((part, index) => {
    const concept = conceptByTerm.get(part.toLowerCase());
    return concept ? <span key={index} data-concept={concept.key} className={`box-decoration-clone rounded px-1 py-0.5 ${concept.color}`}>{part}</span> : part;
  });
}

function ArticleDiagram({ diagram, slug }: { diagram: Diagram; slug: string }) {
  const url = `${import.meta.env.BASE_URL}system-design/notes/${slug}/${diagram.filename}?v=${diagram.revision}`;
  return <figure className="py-2">
    <a href={url} target="_blank" rel="noreferrer" aria-label={`Open ${diagram.caption.toLowerCase()} diagram at full size`} className="block w-fit max-w-full cursor-zoom-in rounded bg-white p-2">
      <img src={url} alt={diagram.caption} width={diagram.width} height={diagram.height} loading="lazy" className="block h-auto max-w-full" />
    </a>
    <figcaption className="mt-1 text-xs leading-5 text-gray-400 light:text-gray-600">{diagram.caption}</figcaption>
  </figure>;
}

export default function CondensedSystemDesignArticle({ slug, title }: { slug: string; title: string }) {
  const [notes, setNotes] = useState<Notes | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    setError(false);
    setNotes(null);
    const load = loaders[`../data/system-design-notes/${slug}.json`];
    (load ? load() : Promise.reject(new Error('Notes not found'))).then(result => {
      if (active) setNotes(result.default);
    }).catch(() => { if (active) setError(true); });
    return () => { active = false; };
  }, [slug, attempt]);
  if (error) return <div role="alert" className="space-y-2 text-sm text-gray-400 light:text-gray-600"><p>These notes could not be loaded. You can retry or open the full article.</p><button className="text-blue-400 hover:underline light:text-blue-700" onClick={() => setAttempt(value => value + 1)}>Retry notes</button></div>;
  if (!notes) return <p role="status" className="text-sm text-gray-400 light:text-gray-600">Loading notes…</p>;
  return <div aria-label={`${title} condensed notes`} className="space-y-5 text-base leading-6 text-gray-200 light:text-gray-800">
    {notes.sections.map(({ title: sectionTitle, level, points, diagrams, flows }, index) => {
      const Heading = level === 4 ? 'h4' : 'h3';
      const id = `${slug}-notes-${index}`;
      const flowDiagrams = new Set(flows.flatMap(flow => flow.diagramFilenames ?? []));
      return <section key={id} aria-labelledby={id} className="space-y-2">
        <Heading id={id} className={Heading === 'h3' ? 'text-lg font-semibold text-white light:text-gray-900' : 'text-base font-medium text-white light:text-gray-900'}>{sectionTitle}</Heading>
        {points.length > 0 && <ul className="list-none space-y-1">
          {points.map((point, pointIndex) => <li key={pointIndex} className="flex gap-2"><span aria-hidden="true" className="shrink-0">-</span><span className="min-w-0 break-words">{conceptText(point, slug === 'bitly')}</span></li>)}
        </ul>}
        {flows.map(flow => <div key={flow.title} role="group" aria-label={`${flow.title} process`} className="space-y-1 pt-2">
          <p className="font-medium text-white light:text-gray-900">Process: {flow.title}</p>
          <ul className="list-none space-y-1">
            {flow.steps.map((step, stepIndex) => <li key={stepIndex} className="flex gap-2"><span aria-hidden="true" className="shrink-0">-</span><span className="min-w-0 break-words">{stepIndex + 1}. {conceptText(step, slug === 'bitly')}</span></li>)}
          </ul>
          {diagrams.filter(diagram => flow.diagramFilenames?.includes(diagram.filename)).map(diagram => <ArticleDiagram key={diagram.filename} diagram={diagram} slug={slug} />)}
        </div>)}
        {diagrams.filter(diagram => !flowDiagrams.has(diagram.filename)).map(diagram => <ArticleDiagram key={diagram.filename} diagram={diagram} slug={slug} />)}
      </section>;
    })}
  </div>;
}
