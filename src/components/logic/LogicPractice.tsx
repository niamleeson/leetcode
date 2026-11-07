import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { hasLogicProblem, loadLogicProblem, logicManifest } from '../../data/logic';
import type { LogicProblem } from '../../data/logic/types';
import GuidedPractice, { LanguageToggle } from './GuidedPractice';
import { useLocalStorage } from '../../hooks/useLocalStorage';
const LogicEditor = lazy(() => import('./LogicEditor'));
import './logicPractice.css';

const firstProblems = [1, 217, 242, 704, 121, 20, 125, 206];

export default function LogicPractice() {
  const { id } = useParams();
  const [query, setQuery] = useSearchParams();
  const [stored, setStored] = useLocalStorage<'python' | 'javascript'>('lc-language', 'python');
  const requested = query.get('language');
  const language = requested === 'python' || requested === 'javascript' ? requested : stored === 'javascript' ? 'javascript' : 'python';
  function changeLanguage(value: 'python' | 'javascript') { setStored(value); const next = new URLSearchParams(query); next.set('language', value); next.delete('draft'); setQuery(next, { replace: true }); }
  return id ? <ProblemLoader key={id} id={Number(id)} language={language} onLanguageChange={changeLanguage} draft={query.get('draft') === '1'}/> : <PracticeLibrary language={language} onLanguageChange={changeLanguage}/>;
}

function PracticeLibrary({ language, onLanguageChange }: { language: 'python' | 'javascript'; onLanguageChange: (language: 'python' | 'javascript') => void }) {
  const [query, setQuery] = useState('');
  const [topic, setTopic] = useState('All topics');
  const topics = useMemo(() => Array.from(new Set(logicManifest.map(p => p.topic))), []);
  const matches = logicManifest.filter(p => (topic === 'All topics' || p.topic === topic) && `${p.id} ${p.title} ${p.topic}`.toLowerCase().includes(query.toLowerCase()));
  const recommended = firstProblems.map(id => logicManifest.find(p => p.id === id)).filter(Boolean);
  const cards = (items: typeof matches) => items.map(p => <Link key={p.id} to={`/practice/${p.id}?language=${language}`} className="logic-problem-card">
    <span><small>#{p.id} · {p.topic}</small><strong>{p.title}</strong></span>
    <span className={`logic-difficulty logic-difficulty-${p.difficulty.toLowerCase()}`}>{p.difficulty}</span>
  </Link>);
  return <div className="logic-library">
    <div className="logic-heading"><div className="logic-eyebrow">LEARN BY MAKING DECISIONS</div><LanguageToggle language={language} onChange={onLanguageChange}/></div>
    <h1>Decide the logic.</h1>
    <p className="logic-intro">Choose an approach, plan the structure, and work through the implementation. Get feedback after every decision, then run and debug the completed code.</p>
    <div className="logic-library-note">All 250 problems in Python and JavaScript. Start with eight pattern choices. Your progress stays on this device.</div>
    {!query && topic === 'All topics' && <section aria-labelledby="logic-start"><h2 id="logic-start">Start here</h2><div className="logic-card-list">{cards(recommended as typeof matches)}</div></section>}
    <section aria-labelledby="logic-library-title">
      <h2 id="logic-library-title">NeetCode 250 <span>{matches.length} problems</span></h2>
      <div className="logic-library-filters"><input type="search" aria-label="Find a practice problem" placeholder="Find a problem…" value={query} onChange={e => setQuery(e.target.value)} />
        <select aria-label="Filter practice topics" value={topic} onChange={e => setTopic(e.target.value)}>{['All topics', ...topics].map(t => <option key={t}>{t}</option>)}</select></div>
      <div className="logic-card-list">{cards(matches)}</div>
      {!matches.length && <p>No problems match. Try another name or topic.</p>}
    </section>
  </div>;
}

function ProblemLoader({ id, language, onLanguageChange, draft }: { id: number; language: 'python' | 'javascript'; onLanguageChange: (language: 'python' | 'javascript') => void; draft: boolean }) {
  const [problem, setProblem] = useState<LogicProblem | null>(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    setError(''); setProblem(null);
    if (hasLogicProblem(id)) loadLogicProblem(id).then(value => { if (active) setProblem(value); }, () => { if (active) setError('This problem could not load. Your saved code is still on this device.'); });
    return () => { active = false; };
  }, [id, attempt]);
  if (!hasLogicProblem(id)) return <div className="logic-library"><h1>Choose a NeetCode 250 problem</h1><p>Guided practice covers the NeetCode 250.</p><Link to="/practice">Browse practice problems</Link></div>;
  if (!problem) return <div className="logic-library"><Link to="/practice">← Practice problems</Link><p role={error ? 'alert' : 'status'}>{error || 'Loading problem…'}</p>{error && <button onClick={() => setAttempt(n => n + 1)}>Retry</button>}</div>;
  return draft ? <><Link to={`/practice/${id}?language=${language}`} className="guided-saved-draft">← Guided practice</Link><Suspense fallback={<p role="status">Loading your saved draft…</p>}><LogicEditor key={id} problem={problem}/></Suspense></> : <GuidedPractice problem={problem} language={language} onLanguageChange={onLanguageChange}/>;
}
