import type { ProgrammingLanguage } from '../hooks/useProgrammingLanguage';

export default function ProgrammingLanguageToggle({ language, setLanguage }: {
  language: ProgrammingLanguage;
  setLanguage: (language: ProgrammingLanguage) => void;
}) {
  return <div className="inline-flex shrink-0 rounded-md bg-gray-800 light:bg-gray-100 p-0.5" role="group" aria-label="Implementation language">
    {(['javascript', 'python'] as const).map(value => <button
      key={value}
      type="button"
      aria-pressed={language === value}
      onClick={() => setLanguage(value)}
      className={`min-h-10 px-3 py-1 !text-xs !font-medium rounded transition-colors ${
        language === value
          ? value === 'javascript' ? 'bg-yellow-600 text-white' : 'bg-blue-600 text-white'
          : 'text-gray-400 light:text-gray-600 hover:text-gray-200 light:hover:text-gray-800'
      }`}
    >{value === 'javascript' ? 'JavaScript' : 'Python'}</button>)}
  </div>;
}
