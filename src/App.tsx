import { lazy, Suspense, useState, useCallback, useEffect, useRef } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAppStore } from './store/useStore';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import { slugToTopic } from './utils/topic-routing';
import { useParams } from 'react-router-dom';

const ENABLE_ASK_CLAUDE = false;
const HackerRankReact = lazy(() => import('./components/HackerRankReact'));
const TopicView = lazy(() => import('./components/TopicView'));
const StudySession = lazy(() => import('./components/StudySession'));
const AllProblems = lazy(() => import('./components/AllProblems'));
const SearchView = lazy(() => import('./components/SearchView'));
const ProblemPage = lazy(() => import('./components/ProblemPage'));
const DSAReference = lazy(() => import('./components/DSAReference'));
const NeetCode250 = lazy(() => import('./components/NeetCode250'));
const NeetCode150 = lazy(() => import('./components/NeetCode150'));
const NeetCodeBlind75 = lazy(() => import('./components/NeetCodeBlind75'));
const SystemDesignReference = lazy(() => import('./components/SystemDesignHub'));
const SDIVol1Reference = lazy(() => import('./components/SDIVol1Reference'));
const GlossaryPage = lazy(() => import('./components/GlossaryPage'));
const AskClaudePanel = lazy(() => import('./components/AskClaudePanel'));
const StudyMode = lazy(() => import('./components/study/StudyMode'));
const LogicPractice = lazy(() => import('./components/logic/LogicPractice'));

export default function App() {
  const store = useAppStore();
  const { pathname } = useLocation();
  const isNeetCodePage = ['/neetcode', '/neetcode150', '/blind75'].includes(pathname.replace(/\/+$/, ''));
  const isLogicPage = pathname === '/practice' || pathname.startsWith('/practice/');
  const [highlighted, setHighlighted] = useState('');
  const [panelPos, setPanelPos] = useState<{ top: number; left: number } | null>(null);
  const panelLockedRef = useRef(false);

  const handleClose = useCallback(() => {
    setHighlighted('');
    setPanelPos(null);
  }, []);

  useEffect(() => {
    if (!ENABLE_ASK_CLAUDE) return;

    const handleMouseUp = () => {
      // Don't replace panel while a request is pending
      if (panelLockedRef.current) return;

      const selection = window.getSelection();
      const text = selection?.toString().trim();

      if (!text || text.length < 2) return;

      // Don't trigger inside the AskClaudePanel itself or textareas/inputs
      const anchorNode = selection?.anchorNode;
      if (anchorNode) {
        const el = anchorNode instanceof HTMLElement ? anchorNode : anchorNode.parentElement;
        if (el?.closest('[data-ask-claude-panel]') || el?.closest('textarea') || el?.closest('input')) {
          return;
        }
      }

      const range = selection?.getRangeAt(0);
      if (!range) return;

      const rect = range.getBoundingClientRect();

      // Position panel near the selection using viewport-relative coords
      // (panel uses position: fixed, so we use viewport coords directly)
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let top = rect.bottom + 8;
      let left = rect.left;

      // If panel would overflow right side, clamp it
      if (left + 384 > viewportWidth) {
        left = Math.max(16, viewportWidth - 400);
      }

      // If panel would overflow bottom, place above the selection
      if (top + 300 > viewportHeight) {
        top = Math.max(8, rect.top - 300);
      }

      setHighlighted(text);
      setPanelPos({ top, left });
    };

    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, []);

  return (
    <div className="relative min-h-screen bg-gray-950 light:bg-white">
      <Sidebar
        dueCount={store.dueProblems.length}
        solvedToday={store.solvedToday}
        dailyGoal={store.dailyGoal}
        getTopicStats={store.getTopicStats}
      />
      <main className={`mx-auto ${isLogicPage ? 'logic-main' : isNeetCodePage ? 'neetcode-main' : 'p-2 md:p-6 pt-14 overflow-y-auto max-w-5xl'}`}>
        <Suspense fallback={<p role="status" className="p-4 text-sm text-gray-400 light:text-gray-600">Loading page…</p>}>
        <Routes>
          <Route path="/" element={
            <Dashboard
              stats={store.stats}
              dueCount={store.dueProblems.length}
              solvedToday={store.solvedToday}
              dailyGoal={store.dailyGoal}
              setDailyGoal={store.setDailyGoal}
              getTopicStats={store.getTopicStats}
            />
          } />
          <Route path="/study" element={
            <StudySession
              topic={null}
              getProgress={store.getProgress}
              getStudyQueue={store.getStudyQueue}
              dueCount={store.dueProblems.length}
            />
          } />
          <Route path="/problems" element={
            <AllProblems
              getProgress={store.getProgress}
              stats={store.stats}
            />
          } />
          <Route path="/search" element={
            <SearchView
              getProgress={store.getProgress}
            />
          } />
          <Route path="/dsa" element={<DSAReference />} />
          <Route path="/neetcode" element={<NeetCode250 />} />
          <Route path="/practice/:id?" element={<LogicPractice />} />
          <Route path="/neetcode150" element={<NeetCode150 />} />
          <Route path="/blind75" element={<NeetCodeBlind75 />} />
          <Route path="/system-design/:slug?" element={<SystemDesignReference />} />
          <Route path="/sdi-book" element={<SDIVol1Reference />} />
          <Route path="/train/sdi" element={<StudyMode source="sdi" />} />
          <Route path="/train/dsa" element={<StudyMode source="dsa" />} />
          <Route path="/glossary" element={<GlossaryPage />} />
          <Route path="/hackerrank-react/:slug?" element={
            <Suspense fallback={<p className="text-gray-400 light:text-gray-600">Loading React solutions…</p>}>
              <HackerRankReact />
            </Suspense>
          } />
          <Route path="/topic/:slug" element={
            <TopicRoute store={store} />
          } />
          <Route path="/problem/:id" element={
            <ProblemPage
              getProgress={store.getProgress}
              onRate={store.updateProgress}
              onUpdateNotes={store.updateNotes}
              onReset={store.resetProgress}
            />
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </Suspense>
      </main>

      {/* Ask Claude panel - appears on text selection (dev only) */}
      {ENABLE_ASK_CLAUDE && highlighted && panelPos && (
        <div data-ask-claude-panel>
          <Suspense fallback={null}><AskClaudePanel
            highlighted={highlighted}
            position={panelPos}
            onClose={handleClose}
            onLoadingChange={(v) => { panelLockedRef.current = v; }}
          /></Suspense>
        </div>
      )}
    </div>
  );
}

/** Wrapper to resolve slug → Topic for the TopicView route */
function TopicRoute({ store }: { store: ReturnType<typeof useAppStore> }) {
  const { slug } = useParams();
  const topic = slugToTopic(slug || '');

  if (!topic) return <Navigate to="/" replace />;

  return (
    <TopicView
      topic={topic}
      getProgress={store.getProgress}
    />
  );
}
