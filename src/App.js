import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import Dashboard from './pages/Dashboard';
import HabitsPage from './pages/HabitsPage';
import ChallengesPage from './pages/ChallengesPage';
import ProfilePage from './pages/ProfilePage';
import Navbar from './components/Navbar';

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

function App() {
  return (
    <ClerkProvider publishableKey={publishableKey}>
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
    
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/habits" element={<HabitsPage />} />
            <Route path="/challenges" element={<ChallengesPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            {/* ✅ CATCH-ALL ROUTE */}
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </div>
      </Router>
    </ClerkProvider>
  );
}

export default App;
