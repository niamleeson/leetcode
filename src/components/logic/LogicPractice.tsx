import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { hasLogicProblem, loadLogicProblem, logicManifest } from '../../data/logic';
import type { LogicProblem } from '../../data/logic/types';
import LogicEditor from './LogicEditor';
import './logicPractice.css';

const firstProblems = [1, 217, 242, 704, 121, 20, 125, 206];

export default function LogicPractice() {
  const { id } = useParams();
  return id ? <ProblemLoader key={id} id={Number(id)} /> : <PracticeLibrary />;
}

function PracticeLibrary() {
  const [query, setQuery] = useState('');
  const [topic, setTopic] = useState('All topics');
  const topics = useMemo(() => Array.from(new Set(logicManifest.map(p => p.topic))), []);
  const matches = logicManifest.filter(p => (topic === 'All topics' || p.topic === topic) && `${p.id} ${p.title} ${p.topic}`.toLowerCase().includes(query.toLowerCase()));
  const recommended = firstProblems.map(id => logicManifest.find(p => p.id === id)).filter(Boolean);
  const cards = (items: typeof matches) => items.map(p => <Link key={p.id} to={`/practice/${p.id}`} className="logic-problem-card">
    <span><small>#{p.id} · {p.topic}</small><strong>{p.title}</strong></span>
    <span className={`logic-difficulty logic-difficulty-${p.difficulty.toLowerCase()}`}>{p.difficulty}</span>
  </Link>);
  return <div className="logic-library">
    <div className="logic-eyebrow">PYTHON · BUILD BY TAPPING</div>
    <h1>Decide the logic.</h1>
    <p className="logic-intro">Add whole statements, run your code, and work out what went wrong. You choose the order. Your drafts stay on this device.</p>
    <div className="logic-library-note">One screen for all 250 problems. Common statements take one tap; custom expressions and advanced algorithms may need editing.</div>
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

function ProblemLoader({ id }: { id: number }) {
  const [problem, setProblem] = useState<LogicProblem | null>(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    setError(''); setProblem(null);
    if (hasLogicProblem(id)) loadLogicProblem(id).then(value => { if (active) setProblem(value); }, () => { if (active) setError('This problem could not load. Your saved code is still on this device.'); });
    return () => { active = false; };
  }, [id, attempt]);
  if (!hasLogicProblem(id)) return <div className="logic-library"><h1>Choose a NeetCode 250 problem</h1><p>This builder currently has practice tests for the NeetCode 250.</p><Link to="/practice">Browse practice problems</Link></div>;
  if (!problem) return <div className="logic-library"><Link to="/practice">← Practice problems</Link><p role={error ? 'alert' : 'status'}>{error || 'Loading problem…'}</p>{error && <button onClick={() => setAttempt(n => n + 1)}>Retry</button>}</div>;
  return <LogicEditor key={id} problem={problem} />;
}
