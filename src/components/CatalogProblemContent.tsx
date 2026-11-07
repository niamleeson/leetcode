import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import 'prismjs';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-markup-templating';
import 'prismjs/components/prism-php';
import 'prismjs/components/prism-kotlin';
import 'prismjs/components/prism-swift';
import 'prismjs/components/prism-ruby';
import 'prismjs/components/prism-scala';
import 'prismjs/components/prism-nim';
import 'prismjs/components/prism-dart';
import { catalogDocumentUrl, type CatalogDocument } from '../data/catalog';
import CodeBlock from './CodeBlock';
import './catalogProblemContent.css';

const cache = new Map<number, Promise<CatalogDocument>>();

function loadDocument(id: number) {
  let request = cache.get(id);
  if (!request) {
    request = fetch(catalogDocumentUrl(id)).then(async response => {
      if (!response.ok) throw new Error('The problem could not load. Please retry.');
      const document = await response.json() as CatalogDocument;
      if (document.id !== id || !document.descriptionHtml || !document.explanationMarkdown || !document.solutions?.length) {
        throw new Error('The problem content is incomplete. Please retry.');
      }
      return document;
    }).catch(error => {
      cache.delete(id);
      throw error;
    });
    cache.set(id, request);
  }
  return request;
}

function RichText({ text }: { text: string }) {
  return <div className="catalog-prose">
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeRaw, rehypeSanitize, rehypeKatex]}
      components={{
        a: ({ node, children, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer">{children}</a>,
        img: ({ node, ...props }) => <img {...props} loading="lazy" decoding="async" />,
      }}
    >{text}</ReactMarkdown>
  </div>;
}

export default function CatalogProblemContent({ id }: { id: number }) {
  return <DocumentContent key={id} id={id}/>;
}

function DocumentContent({ id }: { id: number }) {
  const [document, setDocument] = useState<CatalogDocument>();
  const [error, setError] = useState<string>();
  const [attempt, setAttempt] = useState(0);
  const [selected, setSelected] = useState(0);
  useEffect(() => {
    let active = true;
    setError(undefined);
    loadDocument(id).then(data => {
      if (active) setDocument(data);
    }).catch(reason => {
      if (active) setError(reason instanceof Error ? reason.message : 'The problem could not load.');
    });
    return () => { active = false; };
  }, [id, attempt]);

  if (!document) return <div className="catalog-loading" role={error ? 'alert' : 'status'}>
    <p>{error ?? 'Loading problem and solution…'}</p>
    {error && <button type="button" onClick={() => setAttempt(value => value + 1)}>Retry</button>}
  </div>;

  const solution = document.solutions[selected] ?? document.solutions[0];
  return <div className="space-y-6">
    <section aria-label="Problem description">
      <h2 className="catalog-section-title">Problem</h2>
      <RichText text={document.descriptionHtml}/>
    </section>
    <section aria-label="Solution explanation">
      <h2 className="catalog-section-title">Explanation</h2>
      {document.approachTitle && <h3 className="mb-3 font-semibold text-gray-200 light:text-gray-800">{document.approachTitle}</h3>}
      <RichText text={document.explanationMarkdown}/>
    </section>
    <section aria-label="Solution implementation">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="catalog-section-title !mb-0">Solution · {solution.label}</h2>
        {document.solutions.length > 1 && <label className="text-xs text-gray-400 light:text-gray-600">
          Language
          <select aria-label="Solution language" value={selected} onChange={event => setSelected(Number(event.target.value))}
            className="ml-2 rounded border border-gray-700 bg-gray-900 p-2 text-gray-200 light:border-gray-300 light:bg-white light:text-gray-800">
            {document.solutions.map((item, index) => <option key={index} value={index}>{item.label}</option>)}
          </select>
        </label>}
      </div>
      {document.implementationRelationship === 'alternative' && <p className="mb-3 text-xs leading-relaxed text-gray-400 light:text-gray-600">
        This implementation is an alternative approach from {document.sources.find(source => source.id === solution.sourceId)?.name ?? 'the credited source'}. The explanation above presents the approach credited below.
      </p>}
      <CodeBlock code={solution.code} language={solution.language}/>
    </section>
    <details className="catalog-attribution">
      <summary>Sources and licenses</summary>
      <p className="mt-3">Problem: <a href={document.originalUrl} target="_blank" rel="noopener noreferrer">LeetCode #{id}</a>.</p>
      {document.sources.map(source => <div key={source.id} className="mt-3">
        <a href={source.url} target="_blank" rel="noopener noreferrer">{source.name}</a>
        {' · '}<a href={source.licenseUrl} target="_blank" rel="noopener noreferrer">{source.license}</a>
        {source.modifications && <p className="mt-1">{source.modifications}</p>}
      </div>)}
    </details>
  </div>;
}
