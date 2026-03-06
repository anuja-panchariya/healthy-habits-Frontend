import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { UserButton, useAuth } from '@clerk/clerk-react'
import { motion } from 'framer-motion'
import { Home, Activity, BarChart3, Trophy, User, Moon, Sun } from 'lucide-react'
import { useTheme } from './theme-provider'
import { Button } from './ui/button'

export default function Layout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { theme, setTheme } = useTheme()
  const { isSignedIn } = useAuth()

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
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2"
            >
              <Activity className="w-6 h-6 text-primary" />
              <span className="font-serif text-xl font-light tracking-tight">HealthyHabits</span>
            </motion.div>

            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                return (
                  <Button
                    key={item.path}
                    data-testid={`nav-${item.label.toLowerCase()}`}
                    onClick={() => navigate(item.path)}
                    variant={isActive ? 'default' : 'ghost'}
                    className="rounded-full"
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Button>
                )
              })}
            </div>

            <div className="flex items-center space-x-3">
              <Button
                data-testid="theme-toggle"
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="rounded-full"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
              {isSignedIn && <UserButton />}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border">
        <div className="flex items-center justify-around px-4 py-3">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center space-y-1 ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{item.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Content */}
      <main className="pb-20 md:pb-0">{children}</main>
    </div>
  )
}
