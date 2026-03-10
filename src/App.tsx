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
import { Topic } from './types';
import { STUDY_ORDER } from './data/problems';

function topicToSlug(topic: string): string {
  return topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');
}

function slugToTopic(slug: string): Topic | null {
  return (STUDY_ORDER.find(t => topicToSlug(t) === slug) as Topic) || null;
}

export { topicToSlug, slugToTopic };

export default function App() {
  const store = useAppStore();

  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar
        dueCount={store.dueProblems.length}
        solvedToday={store.solvedToday}
        dailyGoal={store.dailyGoal}
        getTopicStats={store.getTopicStats}
      />
      <main className="flex-1 p-6 overflow-y-auto max-w-5xl">
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
    </div>
  );
}

/** Wrapper to resolve slug → Topic for the TopicView route */
function TopicRoute({ store }: { store: ReturnType<typeof useAppStore> }) {
  // useParams must be called inside a Route-rendered component
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

// need to import useParams
import { useParams } from 'react-router-dom';
