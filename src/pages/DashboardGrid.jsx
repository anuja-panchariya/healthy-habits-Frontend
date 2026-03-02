import React, { useEffect, useState } from 'react'
import { useAuth } from '@clerk/clerk-react'

// ✅ CORRECT BACKEND URL!
const API_URL = 'https://healthy-habits-be-1.onrender.com/api'

export default function DashboardGrid() {
  const [habits, setHabits] = useState([])
  const [score, setScore] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // ✅ HABITS
      const habitsRes = await fetch(`${API_URL}/habits`)
      const habitsData = await habitsRes.json()
      setHabits(habitsData.habits || [])
      
      // ✅ WELLNESS
      const scoreRes = await fetch(`${API_URL}/habits/wellness-score`)
      const scoreData = await scoreRes.json()
      setScore(scoreData.score || 0)
      
      console.log('✅ Data loaded!')
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="p-8 text-center">Loading...</div>

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* WELLNESS */}
      <div className="bg-white p-8 rounded-2xl shadow-xl">
        <h2 className="text-2xl font-bold mb-6">Wellness Score</h2>
        <div className="text-6xl font-black text-emerald-600 text-center">{score}%</div>
      </div>
      
      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg text-center">
          <div className="text-3xl font-bold text-emerald-600">{habits.length}</div>
          <div className="text-gray-600">Total Habits</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg text-center">
          <div className="text-3xl font-bold text-blue-600">0</div>
          <div className="text-gray-600">Active</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg text-center">
          <div className="text-3xl font-bold text-purple-600">0</div>
          <div className="text-gray-600">Streak</div>
        </div>
      </div>
      
      {/* HABITS */}
      <div className="bg-white p-8 rounded-2xl shadow-xl">
        <h3 className="text-xl font-bold mb-4">Your Habits ({habits.length})</h3>
        {habits.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-lg">
            No habits yet! Create your first one 👆
          </div>
        ) : (
          habits.map(habit => (
            <div key={habit.id} className="flex justify-between p-4 bg-gray-50 rounded-lg mb-3">
              <span className="font-semibold">{habit.title}</span>
              <button className="px-4 py-2 bg-emerald-500 text-white rounded-lg">Log</button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
