import { useState, useCallback, useEffect, useRef } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from './store/useStore';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import TopicView from './components/TopicView';
import StudySession from './components/StudySession';
import AllProblems from './components/AllProblems';
import SearchView from './components/SearchView';
import ProblemPage from './components/ProblemPage';
import DSAReference from './components/DSAReference';
import AskClaudePanel from './components/AskClaudePanel';
import GlossaryPage from './components/GlossaryPage';
import { Topic } from './types';
import { STUDY_ORDER } from './data/problems';
import { useParams } from 'react-router-dom';

function topicToSlug(topic: string): string {
  return topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');
}

function slugToTopic(slug: string): Topic | null {
  return (STUDY_ORDER.find(t => topicToSlug(t) === slug) as Topic) || null;
}

export { topicToSlug, slugToTopic };

const ENABLE_ASK_CLAUDE = false;

export default function App() {
  const store = useAppStore();
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
    <div className="relative min-h-screen bg-gray-950">
      <Sidebar
        dueCount={store.dueProblems.length}
        solvedToday={store.solvedToday}
        dailyGoal={store.dailyGoal}
        getTopicStats={store.getTopicStats}
      />
      <main className="p-2 md:p-6 pt-14 overflow-y-auto max-w-5xl mx-auto">
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
          <Route path="/glossary" element={<GlossaryPage />} />
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
      </main>

      {/* Ask Claude panel - appears on text selection (dev only) */}
      {ENABLE_ASK_CLAUDE && highlighted && panelPos && (
        <div data-ask-claude-panel>
          <AskClaudePanel
            highlighted={highlighted}
            position={panelPos}
            onClose={handleClose}
            onLoadingChange={(v) => { panelLockedRef.current = v; }}
          />
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
