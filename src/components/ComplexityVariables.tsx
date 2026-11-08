interface ComplexityMetadata {
  complexityVariables?: Record<string, string>;
  pythonComplexityVariables?: Record<string, string>;
}

export default function ComplexityVariables({ solution, language = 'javascript' }: {
  solution: ComplexityMetadata;
  language?: 'javascript' | 'python';
}) {
  const variables = language === 'python'
    ? solution.pythonComplexityVariables ?? solution.complexityVariables
    : solution.complexityVariables;
  const entries = Object.entries(variables ?? {});
  if (!entries.length) return null;

  return <ul aria-label="Complexity variables" className="complexity-variables flex w-full flex-wrap gap-x-5 gap-y-1 text-xs leading-relaxed text-gray-400 light:text-gray-600">
    {entries.map(([symbol, meaning]) => <li key={symbol} className="min-w-0 break-words">
      <code className="font-semibold text-gray-300 light:text-gray-700">{symbol}</code><span aria-hidden="true"> — </span><span>{meaning}</span>
    </li>)}
  </ul>;
}
