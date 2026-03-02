import React, { useEffect, useState } from 'react'
import { apiFetch } from '../lib/api'  // ← NO setAuthToken!

export default function DashboardGrid() {
  const [habits, setHabits] = useState([])
  const [score, setScore] = useState(0)
  const [analytics, setAnalytics] = useState({})
  const [loading, setLoading] = useState(true)
  const [newHabit, setNewHabit] = useState('')

  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = async () => {
    try {
      setLoading(true)
      const [habitsData, scoreData, analyticsData] = await Promise.all([
        apiFetch('/habits'),
        apiFetch('/habits/wellness-score'),
        apiFetch('/analytics')
      ])
      
      setHabits(habitsData.habits || [])
      setScore(scoreData.score || 0)
      setAnalytics(analyticsData)
    } catch (error) {
      console.error('Load error:', error)
    } finally {
      setLoading(false)
    }
  }

  const createHabit = async () => {
    if (!newHabit.trim()) return
    try {
      await apiFetch('/habits', {
        method: 'POST',
        body: JSON.stringify({ 
          title: newHabit,
          category: newHabit.includes('Water') ? 'health' : 'general'
        })
      })
      setNewHabit('')
      loadAllData()
    } catch (error) {
      console.error('Create error:', error)
    }
  }

  const logHabit = async (habitId) => {
    try {
      await apiFetch(`/habits/${habitId}/log`, { method: 'POST' })
      loadAllData()
    } catch (error) {
      console.error('Log error:', error)
    }
  }

  if (loading) return <div className="p-12 text-center text-xl">Loading...</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* WELLNESS SCORE */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-10 shadow-2xl">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Wellness Score</h1>
          <div className="text-center">
            <div className="text-7xl font-black bg-gradient-to-r from-emerald-500 to-blue-500 bg-clip-text text-transparent mb-8">
              {score}%
            </div>
            <div className="text-xl text-emerald-700 font-semibold">
              {score > 70 ? 'Outstanding!' : score > 50 ? 'Great!' : 'Keep Going!'}
            </div>
          </div>
        </div>

        {/* ANALYTICS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white/80 p-8 rounded-2xl shadow-xl text-center">
            <div className="text-4xl font-black text-emerald-600">{analytics.totalHabits || 0}</div>
            <div className="text-gray-600 mt-2 text-lg">Total Habits</div>
          </div>
          <div className="bg-white/80 p-8 rounded-2xl shadow-xl text-center">
            <div className="text-4xl font-black text-blue-600">{analytics.todayLogs || 0}</div>
            <div className="text-gray-600 mt-2 text-lg">Today Logged</div>
          </div>
          <div className="bg-white/80 p-8 rounded-2xl shadow-xl text-center">
            <div className="text-4xl font-black text-purple-600">{analytics.weeklyLogs || 0}</div>
            <div className="text-gray-600 mt-2 text-lg">This Week</div>
          </div>
          <div className="bg-white/80 p-8 rounded-2xl shadow-xl text-center">
            <div className="text-4xl font-black text-orange-600">{analytics.bestCategory || 'none'}</div>
            <div className="text-gray-600 mt-2 text-lg">Best Category</div>
          </div>
        </div>

        {/* CREATE HABIT */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Create New Habit</h2>
          <div className="flex gap-4 max-w-md">
            <input
              value={newHabit}
              onChange={(e) => setNewHabit(e.target.value)}
              placeholder="e.g. Drink Water, Code 1hr"
              className="flex-1 px-6 py-4 border-2 border-emerald-200 rounded-2xl focus:border-emerald-500 focus:outline-none text-xl"
              onKeyDown={(e) => e.key === 'Enter' && createHabit()}
            />
            <button 
              onClick={createHabit}
              className="px-10 py-4 bg-emerald-500 text-white rounded-2xl font-bold text-xl hover:bg-emerald-600 shadow-lg"
            >
              + Add
            </button>
          </div>
        </div>

        {/* HABITS LIST */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">Your Habits ({habits.length})</h2>
          {habits.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <div className="text-6xl mb-6">🎯</div>
              <h3 className="text-3xl font-bold mb-4">No habits yet!</h3>
              <p className="text-xl">Create your first habit above</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {habits.map(habit => (
                <div key={habit.id} className="p-8 bg-gradient-to-br from-emerald-50 to-blue-50 rounded-3xl shadow-xl">
                  <h4 className="text-2xl font-bold text-gray-800 mb-4">{habit.title}</h4>
                  <div className="flex items-center justify-between mb-6">
                    <span className="px-4 py-2 bg-emerald-100 text-emerald-800 rounded-xl font-semibold">
                      {habit.category}
                    </span>
                    <span className="text-sm text-gray-500">{habit.logs?.length || 0} logs</span>
                  </div>
                  <button 
                    onClick={() => logHabit(habit.id)}
                    className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-bold text-lg hover:bg-emerald-600"
                  >
                    ✅ Log Today
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
