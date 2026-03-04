import React from 'react'
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn, useAuth } from '@clerk/clerk-react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store/store'
import { Toaster } from './components/ui/sonner'
import { ThemeProvider } from './components/theme-provider'
import Layout from './components/Layout'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import HabitsPage from './pages/HabitsPage'
import AnalyticsPage from './pages/AnalyticsPage'
import ChallengesPage from './pages/ChallengesPage'
import ProfilePage from './pages/ProfilePage'

const CLERK_KEY = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY

function ClerkProviderWithNavigate({ children }) {
  const navigate = useNavigate()
  return (
    <ClerkProvider publishableKey={CLERK_KEY} navigate={(to) => navigate(to)}>
      {children}
    </ClerkProvider>
  )
}

function ProtectedRoute({ children }) {
  const { isSignedIn, isLoaded } = useAuth()

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return isSignedIn ? children : <RedirectToSignIn />
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="healthyhabits-theme">
      <Provider store={store}>
        <BrowserRouter>
          <ClerkProviderWithNavigate>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/habits"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <HabitsPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <AnalyticsPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/challenges"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <ChallengesPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <ProfilePage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
            </Routes>
            <Toaster richColors position="top-right" />
          </ClerkProviderWithNavigate>
        </BrowserRouter>
      </Provider>
    </ThemeProvider>
  )
}

export default App
