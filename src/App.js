import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import Layout from './layouts/Layout';
import Dashboard from './pages/Dashboard';
import HabitsPage from './pages/HabitsPage';
import ChallengesPage from './pages/ChallengesPage';
import ProfilePage from './pages/ProfilePage';

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

function App() {
  return (
    <ClerkProvider publishableKey={publishableKey}>
      <Router basename="/">
        <Layout>
          <Routes>
            {/* ✅ DASHBOARD  */}
            <Route index element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/habits" element={<HabitsPage />} />
            <Route path="/challenges" element={<ChallengesPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            {/* ✅ FALLBACK TO DASHBOARD */}
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </Layout>
      </Router>
    </ClerkProvider>
  );
}

export default App;
