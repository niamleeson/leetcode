import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  themeVariables: {
    primaryColor: '#1e1e2e',
    primaryTextColor: '#cdd6f4',
    primaryBorderColor: '#89b4fa',
    lineColor: '#89b4fa',
    secondaryColor: '#1e1e2e',
    tertiaryColor: '#1e1e2e',
    background: '#11111b',
    mainBkg: '#1e1e2e',
    nodeBorder: '#89b4fa',
    clusterBkg: '#181825',
    clusterBorder: '#45475a',
    titleColor: '#89b4fa',
    edgeLabelBackground: '#11111b',
    fontSize: '14px',
  },
  flowchart: { curve: 'basis', padding: 20 },
});

function MermaidBlock({ chart }: { chart: string }) {
  const [svgHtml, setSvgHtml] = useState<string | null>(null);
  const idRef = useRef(`mmd-${Math.random().toString(36).substring(2, 10)}`);

  useEffect(() => {
    let cancelled = false;
    mermaid.render(idRef.current, chart.trim()).then(({ svg }) => {
      if (!cancelled) setSvgHtml(svg);
    }).catch((err) => { console.error('Mermaid render error:', err); });
    return () => { cancelled = true; };
  }, [chart]);

  if (!svgHtml) return <div className="text-gray-600 light:text-gray-500 text-xs p-4">Rendering diagram...</div>;
  return (
    <div className="my-3 p-2 bg-[#11111b] light:bg-gray-50 border border-gray-800 light:border-gray-200 rounded-lg overflow-x-auto flex justify-center" dangerouslySetInnerHTML={{ __html: svgHtml }} />
  );
}

export default function MarkdownContent({ content, className }: { content: string; className?: string }) {
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => <h1 className="text-xl font-bold text-white light:text-gray-900 mt-4 mb-2">{children}</h1>,
          h2: ({ children }) => <h2 className="text-lg font-semibold text-blue-300 light:text-blue-700 mt-4 mb-2 pb-1 border-b border-gray-800 light:border-gray-200">{children}</h2>,
          h3: ({ children }) => <h3 className="text-sm font-semibold text-gray-200 light:text-gray-800 mt-3 mb-1">{children}</h3>,
          p: ({ children }) => <p className="text-sm text-gray-400 light:text-gray-600 leading-relaxed mb-2">{children}</p>,
          ul: ({ children }) => <ul className="space-y-1 mb-3 ml-1">{children}</ul>,
          ol: ({ children }) => <ol className="space-y-1 mb-3 ml-1 list-decimal list-inside">{children}</ol>,
          li: ({ children }) => (
            <li className="text-sm text-gray-400 light:text-gray-600 flex gap-2">
              <span className="text-blue-500 mt-0.5 shrink-0">&bull;</span>
              <span>{children}</span>
            </li>
          ),
          strong: ({ children }) => <strong className="text-gray-200 light:text-gray-800 font-semibold">{children}</strong>,
          em: ({ children }) => <em className="text-gray-300 light:text-gray-700">{children}</em>,
          code: ({ className: codeClassName, children }) => {
            const hasLang = codeClassName?.startsWith('language-');
            const text = String(children);
            const lang = hasLang ? codeClassName!.replace('language-', '') : '';

            if (lang === 'mermaid') {
              return <MermaidBlock chart={text} />;
            }

            const isBlock = hasLang || text.includes('\n');
            if (isBlock) {
              return (
                <pre className="!bg-gray-950 light:!bg-gray-50 !border !border-gray-800 light:!border-gray-200 !rounded-md !p-4 !text-xs overflow-x-auto !leading-relaxed !m-0 mb-3">
                  <code className={lang ? `language-${lang}` : 'text-gray-300 light:text-gray-700 font-mono whitespace-pre'}>
                    {text.trim()}
                  </code>
                </pre>
              );
            }
            return (
              <code className="bg-gray-800 light:bg-gray-100 text-blue-300 light:text-blue-700 px-1.5 py-0.5 rounded text-xs font-mono">
                {children}
              </code>
            );
          },
          pre: ({ children }) => <>{children}</>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-blue-500 pl-3 my-2 text-gray-400 light:text-gray-600 italic text-sm">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto mb-3">
              <table className="w-full text-xs text-gray-400 light:text-gray-600 border border-gray-800 light:border-gray-200 rounded">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-gray-800/50 light:bg-gray-100">{children}</thead>,
          th: ({ children }) => <th className="px-3 py-2 text-left text-gray-300 light:text-gray-700 font-semibold border border-gray-800 light:border-gray-200">{children}</th>,
          td: ({ children }) => <td className="px-3 py-2 border border-gray-800 light:border-gray-200">{children}</td>,
          hr: () => <hr className="border-gray-800 light:border-gray-200 my-4" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
