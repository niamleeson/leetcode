import { ReactNode, useMemo } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import { TraceLanguage } from '../../data/walkthroughs/execution';
import '../../styles/prism-themes.css';

type SyntaxToken = string | Prism.Token;

function splitSyntaxLines(tokens: SyntaxToken[]): SyntaxToken[][] {
  const rows: SyntaxToken[][] = [[]];
  for (const token of tokens) {
    const pieces: SyntaxToken[][] = typeof token === 'string'
      ? token.split('\n').map(part => [part])
      : splitSyntaxLines(Array.isArray(token.content) ? token.content : [token.content])
        .map(parts => [new Prism.Token(token.type, parts, token.alias)]);
    rows[rows.length - 1].push(...pieces[0]);
    rows.push(...pieces.slice(1));
  }
  return rows;
}

function renderSyntax(tokens: SyntaxToken[]): ReactNode {
  return tokens.map((token, index) => typeof token === 'string' ? token : (
    <span key={index} className={['token', token.type, ...(Array.isArray(token.alias) ? token.alias : token.alias ? [token.alias] : [])].join(' ')}>
      {renderSyntax(Array.isArray(token.content) ? token.content : [token.content])}
    </span>
  ));
}

export default function WalkthroughCode({ code, lines, enabled, noop, language = 'javascript' }: { code: string; lines: number[]; enabled: boolean; noop?: boolean; language?: TraceLanguage }) {
  const syntaxLines = useMemo(() => splitSyntaxLines(Prism.tokenize(code, Prism.languages[language])), [code, language]);
  const label = language === 'python' ? 'Python' : 'JavaScript';

  return <div className="traversal-source">
    <div className="traversal-source-heading"><span>{label}</span><span>{enabled && lines.length > 0 ? `${lines.length === 1 ? 'Line' : 'Lines'} ${lines.join(', ')}` : ''}</span></div>
    <pre tabIndex={0} aria-label={`Walkthrough ${label} code`} className="traversal-source-code">
      <code className={`language-${language}`}>{syntaxLines.map((tokens, index) => {
        const active = enabled && lines.includes(index + 1);
        return <span key={index} data-line={index + 1} aria-current={active ? 'step' : undefined} className={`traversal-source-line ${active ? noop ? 'is-noop' : 'is-active' : ''}`}>
          <span className="traversal-line-number" aria-hidden="true">{index + 1}</span>
          <span className="traversal-line-content">{renderSyntax(tokens)}</span>
        </span>;
      })}</code>
    </pre>
  </div>;
}
