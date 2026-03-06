import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { UserButton, useAuth } from '@clerk/clerk-react'
import { motion } from 'framer-motion'
import { Home, Activity, BarChart3, Trophy, User, Moon, Sun } from 'lucide-react'
import { Button } from '../components/ui/button'  // ✅ ABSOLUTE PATH

export default function Layout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { isSignedIn } = useAuth()

  // ✅ PURE CSS THEME TOGGLE - NO IMPORTS
  const toggleTheme = () => {
    const html = document.documentElement
    const isDark = html.classList.contains('dark')
    if (isDark) {
      html.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    } else {
      html.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    }
  }

  // Load theme on mount
  React.useEffect(() => {
    const saved = localStorage.getItem('theme')
    const isDark = saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)
    if (isDark) document.documentElement.classList.add('dark')
  }, [])

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/habits', label: 'Habits', icon: Activity },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/challenges', label: 'Challenges', icon: Trophy },
    { path: '/profile', label: 'Profile', icon: User },
  ]

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-3"
            >
              <Activity className="w-8 h-8 text-primary drop-shadow-sm" />
              <span className="font-serif text-2xl font-light tracking-tight bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                HealthyHabits
              </span>
            </motion.div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-2">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                return (
                  <Button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    variant={isActive ? 'default' : 'ghost'}
                    className={`rounded-full h-12 px-6 font-medium transition-all hover:scale-105 ${
                      isActive 
                        ? 'bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/25' 
                        : 'hover:bg-accent hover:text-foreground'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Button>
                )
              })}
            </div>

            {/* Right Controls */}
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="rounded-full h-12 w-12 hover:bg-accent hover:scale-110 transition-all shadow-md"
              >
                <Moon className="w-5 h-5 dark:hidden" />
                <Sun className="w-5 h-5 hidden dark:block" />
              </Button>
              {isSignedIn && <UserButton afterSignOutUrl="/sign-in" />}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border/50 shadow-2xl">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <motion.button
                key={item.path}
                onClick={() => navigate(item.path)}
                whileTap={{ scale: 0.95 }}
                className={`flex flex-col items-center space-y-1 p-2 rounded-2xl transition-all group ${
                  isActive 
                    ? 'text-primary bg-primary/10 shadow-lg shadow-primary/20 scale-105' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                <Icon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium tracking-wide">{item.label}</span>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Main Content */}
      <main className="pt-2 pb-24 md:pb-0 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  )
}
