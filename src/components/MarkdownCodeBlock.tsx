import type { ComponentProps } from 'react';
import type { ExtraProps } from 'react-markdown';
import type { Nodes } from 'hast';
import CodeBlock from './CodeBlock';
import CopyableBlock from './CopyableBlock';

// Read the parsed text, preserving indentation, blank lines, and decoded entities.
// Labels and copy controls never become part of the copied source.
export function markdownCodeText(node?: Nodes): string {
  if (!node) return '';
  if (node.type === 'text') return node.value;
  if (node.type === 'element' && node.tagName === 'br') return '\n';
  return 'children' in node ? node.children.map(markdownCodeText).join('') : '';
}

export default function MarkdownCodeBlock({ node, children, ...props }: ComponentProps<'pre'> & ExtraProps) {
  const code = node?.children.find(child => child.type === 'element' && child.tagName === 'code');
  if (code?.type === 'element') {
    const classes = Array.isArray(code.properties.className) ? code.properties.className.map(String) : [];
    const language = classes.find(name => name.startsWith('language-'))?.slice('language-'.length) || 'text';
    return <CodeBlock code={markdownCodeText(code)} language={language} />;
  }
  return <CopyableBlock text={markdownCodeText(node)}><pre {...props}>{children}</pre></CopyableBlock>;
}
