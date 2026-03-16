import { useEffect } from 'react';
import { BrowserRouter, Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import Layout from './components/layout/Layout';
import DailyCheckIn from './pages/DailyCheckIn';
import DreamJournal from './pages/DreamJournal';
import ExerciseSession from './pages/ExerciseSession';
import Exercises from './pages/Exercises';
import Home from './pages/Home';
import Journal from './pages/Journal';
import JournalEntry from './pages/JournalEntry';
import Learn from './pages/Learn';
import LearnTopic from './pages/LearnTopic';
import Onboarding from './pages/Onboarding';
import Progress from './pages/Progress';
import Settings from './pages/Settings';
import TriggerPatterns from './pages/TriggerPatterns';
import { useUserSettings } from './db/hooks';

/** Redirects to /onboarding on first launch (when no settings or onboardingComplete is false). */
function OnboardingGuard() {
  const navigate = useNavigate();
  const location = useLocation();
  const settings = useUserSettings();

  useEffect(() => {
    if (
      settings !== undefined &&
      settings?.onboardingComplete !== true &&
      location.pathname !== '/onboarding'
    ) {
      navigate('/onboarding', { replace: true });
    }
  }, [settings, navigate, location.pathname]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <OnboardingGuard />
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/check-in" element={<DailyCheckIn />} />
          <Route path="/exercises" element={<Exercises />} />
          <Route path="/exercises/trigger-patterns" element={<TriggerPatterns />} />
          <Route path="/exercises/dream-journal" element={<DreamJournal />} />
          <Route path="/exercises/:id" element={<ExerciseSession />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/journal/new" element={<JournalEntry />} />
          <Route path="/journal/:id" element={<JournalEntry />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/learn/:slug" element={<LearnTopic />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/onboarding" element={<Onboarding />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
