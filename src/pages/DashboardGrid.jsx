import React, { useEffect, useState } from 'react'
import { apiFetch } from '../lib/api'

export default function DashboardGrid() {
  const [habits, setHabits] = useState([])
  const [score, setScore] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const habitsData = await apiFetch('/habits')
      const scoreData = await apiFetch('/habits/wellness-score')
      
      setHabits(habitsData.habits || [])
      setScore(scoreData.score || 0)
      
      console.log('✅ Dashboard loaded!')
    } catch (error) {
      console.error('Load error:', error)
    } finally {
      setLoading(false)
    }
  }

  const createHabit = async () => {
    try {
      await apiFetch('/habits', {
        method: 'POST',
        body: JSON.stringify({ title: 'Drink Water', category: 'health' })
      })
      loadData() // Refresh
    } catch (error) {
      console.error('Create error:', error)
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
              {score > 50 ? 'Excellent Progress!' : 'Keep Going!'}
            </div>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/80 p-8 rounded-2xl shadow-xl text-center">
            <div className="text-4xl font-black text-emerald-600">{habits.length}</div>
            <div className="text-gray-600 mt-2 text-lg">Total Habits</div>
          </div>
          <div className="bg-white/80 p-8 rounded-2xl shadow-xl text-center">
            <div className="text-4xl font-black text-blue-600">{habits.length}</div>
            <div className="text-gray-600 mt-2 text-lg">Active Today</div>
          </div>
          <div className="bg-white/80 p-8 rounded-2xl shadow-xl text-center">
            <div className="text-4xl font-black text-purple-600">7</div>
            <div className="text-gray-600 mt-2 text-lg">Current Streak</div>
          </div>
        </div>

        {/* HABITS LIST */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Your Habits</h2>
            <button 
              onClick={createHabit}
              className="px-8 py-3 bg-emerald-500 text-white rounded-2xl font-semibold hover:bg-emerald-600 shadow-lg"
            >
              + New Habit
            </button>
          </div>
          
          {habits.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-2xl font-bold mb-2">No habits yet!</h3>
              <p>Click "New Habit" to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {habits.map(habit => (
                <div key={habit.id} className="flex items-center justify-between p-6 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-2xl">
                  <div>
                    <h4 className="text-xl font-bold text-gray-800">{habit.title}</h4>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm">
                      {habit.category}
                    </span>
                  </div>
                  <button className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600">
                    Log Today
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
