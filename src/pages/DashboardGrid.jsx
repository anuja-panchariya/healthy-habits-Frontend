// src/pages/DashboardGrid.jsx - SELF-CONTAINED (No imports needed!)
import React, { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { toast } from 'sonner'

export default function DashboardGrid() {
  const { getToken, userId } = useAuth()
  const [habits, setHabits] = useState([])
  const [wellnessScore, setWellnessScore] = useState(0)
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    if (!userId) return
    
    try {
      setLoading(true)
      const token = await getToken()
      const API_URL = 'https://healthy-habits-be-1.onrender.com/api'
      
      console.log('🔍 Loading habits...')
      
      // Habits
      const habitsRes = await fetch(`${API_URL}/habits`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const habitsData = await habitsRes.json()
      setHabits(habitsData.habits || [])
      console.log('✅ Habits loaded:', habitsData.habits?.length || 0)
      
      // Wellness
      const wellnessRes = await fetch(`${API_URL}/habits/wellness-score`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const wellnessData = await wellnessRes.json()
      setWellnessScore(wellnessData.score || 0)
      
    } catch (error) {
      console.error('Load error:', error)
    } finally {
      setLoading(false)
    }
  }, [userId, getToken])

  useEffect(() => {
    loadData()
  }, [loadData])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-xl text-gray-500">Loading your habits...</div>
      </div>
    )
  }

  // INLINE WELLNESS CARD
  const WellnessScoreCard = ({ score = 0 }) => (
    <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/50">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Wellness Score</h2>
      <div className="text-center">
        <div className="text-6xl font-black bg-gradient-to-r from-emerald-500 to-blue-500 bg-clip-text text-transparent mb-6">
          {score}%
        </div>
        <div className="w-64 h-64 mx-auto mb-6">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <circle cx="100" cy="100" r="85" fill="none" stroke="#e5e7eb" strokeWidth="15"/>
            <circle 
              cx="100" cy="100" r="85" 
              fill="none" stroke="url(#gradient)" 
              strokeWidth="15" strokeDasharray="535" 
              strokeDashoffset={535 - (score * 535 / 100)}
              strokeLinecap="round"
              pathLength="1"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981"/>
                <stop offset="100%" stopColor="#3b82f6"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <p className="text-lg font-semibold text-emerald-700">
          {score > 50 ? 'Great progress!' : 'Keep going!'}
        </p>
      </div>
    </div>
  )

  // INLINE STATS CARD
  const QuickStatsCard = ({ habits = [] }) => {
    const total = habits.length
    const active = habits.filter(h => h.goal_value > 0).length
    return (
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/50">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Quick Stats</h3>
        <div className="grid grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-3xl font-black text-emerald-600">{total}</div>
            <div className="text-sm text-gray-600 mt-1">Total Habits</div>
          </div>
          <div>
            <div className="text-3xl font-black text-blue-600">{active}</div>
            <div className="text-sm text-gray-600 mt-1">Active</div>
          </div>
          <div>
            <div className="text-3xl font-black text-purple-600">0</div>
            <div className="text-sm text-gray-600 mt-1">Avg Streak</div>
          </div>
        </div>
      </div>
    )
  }

  // INLINE HABITS CARD
  const TodaysHabitsCard = ({ habits = [] }) => (
    <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/50">
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        Today's Habits ({habits.length})
      </h3>
      {habits.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No habits yet. <br/>
          Create your first one!
        </div>
      ) : (
        habits.slice(0, 3).map(habit => (
          <div key={habit.id} className="flex items-center justify-between p-4 bg-white/50 rounded-xl mb-3">
            <div>
              <div className="font-semibold text-gray-800">{habit.title}</div>
              <div className="text-sm text-gray-500">{habit.category}</div>
            </div>
            <button className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600">
              Log Today
            </button>
          </div>
        ))
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Wellness - Full width */}
          <div className="lg:col-span-2">
            <WellnessScoreCard score={wellnessScore} />
          </div>
          
          {/* Stats & Habits */}
          <div className="space-y-8 lg:space-y-0 lg:space-x-8 lg:flex lg:flex-col">
            <QuickStatsCard habits={habits} />
            <TodaysHabitsCard habits={habits} />
          </div>
        </div>
      </div>
    </div>
  )
}
