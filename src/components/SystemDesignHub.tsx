import { lazy, Suspense } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import SystemDesignLibrary from './SystemDesignLibrary';

const PracticeReference = lazy(() => import('./SystemDesignReference'));

export default function SystemDesignHub() {
  const { slug } = useParams();
  const [params] = useSearchParams();
  const practice = !slug && params.get('view') === 'practice';
  const tabClass = (active: boolean) => `px-3 py-2 border-b-2 text-sm transition-colors ${active
    ? 'border-blue-400 text-blue-300 light:border-blue-600 light:text-blue-700'
    : 'border-transparent text-gray-400 hover:text-white light:text-gray-600 light:hover:text-gray-900'}`;

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <h1 className="text-2xl font-bold text-white light:text-gray-900">System Design</h1>
        <nav aria-label="System Design sections" className="flex gap-3 border-b border-gray-800 light:border-gray-200">
          <Link to="/system-design" aria-current={!practice ? 'page' : undefined} className={tabClass(!practice)}>Hello Interview · 49</Link>
          <Link to="/system-design?view=practice" aria-current={practice ? 'page' : undefined} className={tabClass(practice)}>Practice reference · 30</Link>
        </nav>
      </header>
      {practice
        ? <Suspense fallback={<p role="status" className="text-gray-400 light:text-gray-600">Loading practice reference…</p>}><PracticeReference /></Suspense>
        : <SystemDesignLibrary />}
    </div>
  );
}
