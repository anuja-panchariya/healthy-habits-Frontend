import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { UserButton, useAuth } from '@clerk/clerk-react'
import { motion } from 'framer-motion'
import { Home, Activity, BarChart3, Trophy, User, Moon, Sun } from 'lucide-react'

export default function Layout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { isSignedIn } = useAuth()

  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark')
  }

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/habits', label: 'Habits', icon: Activity },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/challenges', label: 'Challenges', icon: Trophy },
    { path: '/profile', label: 'Profile', icon: User },
  ]

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Top Nav */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Activity className="w-8 h-8 text-primary" />
              <span className="text-2xl font-light tracking-tight">HealthyHabits</span>
            </div>

            <div className="hidden md:flex items-center space-x-2">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`px-4 py-2 rounded-full font-medium transition-all ${
                      isActive 
                        ? 'bg-primary text-primary-foreground shadow-lg' 
                        : 'hover:bg-accent hover:text-foreground'
                    }`}
                  >
                    <Icon className="w-4 h-4 inline mr-2" />
                    {item.label}
                  </button>
                )
              })}
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-accent"
              >
                <Moon className="w-5 h-5 dark:hidden" />
                <Sun className="w-5 h-5 hidden dark:block" />
              </button>
              {isSignedIn && <UserButton afterSignOutUrl="/sign-in" />}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t">
        <div className="flex justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center space-y-1 p-2 rounded-xl transition-all ${
                  isActive ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:bg-accent'
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs">{item.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <main className="pt-2 pb-20 md:pb-0 px-4 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  )
}
