
import React, { useEffect, useState, useCallback } from 'react'
import { apiFetch } from '../lib/api'  // ← Simple fetch, no Clerk!

export default function HabitsPage() {
  const [habits, setHabits] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    goal_type: 'daily',
    goal_value: 1,
    days: []
  })
  const [isCreating, setIsCreating] = useState(false)

  const categories = ['Health', 'Fitness', 'Productivity', 'Nutrition', 'Mental Health']
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const todayDay = new Date().toLocaleDateString('en-US', { weekday: 'short' })

  // ✅ FIXED: loadHabits
  const loadHabits = useCallback(async () => {
    try {
      setLoading(true)
      const res = await apiFetch('/habits')  // ← Simple call
      console.log('API Response:', res)     // ← DEBUG
      setHabits(res.habits || [])
    } catch (error) {
      console.error('Error loading habits:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadHabits()
  }, [loadHabits])

  // ✅ FIXED: Create habit
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.category) return

    setIsCreating(true)
    try {
      await apiFetch('/habits', {
        method: 'POST',
        body: JSON.stringify(formData)
      })
      console.log('✅ Habit created:', formData.title)
      setShowAddForm(false)
      setFormData({ title: '', category: '', goal_type: 'daily', goal_value: 1, days: [] })
      loadHabits()  // ← REFRESH LIST
    } catch (error) {
      console.error('Create error:', error)
    } finally {
      setIsCreating(false)
    }
  }

  // ✅ FIXED: Delete
  const handleDelete = async (habitId) => {
    if (!confirm('Delete this habit?')) return
    try {
      await apiFetch(`/habits/${habitId}`, { method: 'DELETE' })
      loadHabits()
    } catch (error) {
      console.error('Delete error:', error)
    }
  }

  // ✅ FIXED: Log habit
  const handleLogHabit = async (habitId) => {
    try {
      await apiFetch(`/habits/${habitId}/log`, { method: 'POST' })
      loadHabits()
    } catch (error) {
      console.error('Log error:', error)
    }
  }

  if (loading) return <div className="p-12 text-center">Loading...</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold text-gray-800">My Habits</h1>
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-6 py-3 bg-emerald-500 text-white rounded-2xl font-semibold hover:bg-emerald-600"
          >
            {showAddForm ? 'Cancel' : '➕ Add Habit'}
          </button>
        </div>

        {/* ADD FORM */}
        {showAddForm && (
          <div className="bg-white p-8 rounded-3xl shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Habit name (e.g. Drink Water)"
                className="w-full p-4 border border-gray-200 rounded-2xl text-xl focus:border-emerald-500"
              />
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-4 border border-gray-200 rounded-2xl text-xl focus:border-emerald-500"
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              
              <button 
                type="submit" 
                disabled={isCreating}
                className="w-full p-4 bg-emerald-500 text-white rounded-2xl font-bold text-xl hover:bg-emerald-600 disabled:opacity-50"
              >
                {isCreating ? 'Creating...' : 'Create Habit'}
              </button>
            </form>
          </div>
        )}

        {/* HABITS LIST */}
        {habits.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-2xl">
            <div className="text-6xl mb-6">🎯</div>
            <h3 className="text-3xl font-bold mb-4">No habits yet!</h3>
            <p>Add your first habit above</p>
          </div>
        ) : (
          <div className="space-y-6">
            {habits.map(habit => (
              <div key={habit.id} className="bg-white p-8 rounded-3xl shadow-2xl hover:shadow-3xl transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">{habit.title}</h3>
                    <span className="px-4 py-2 bg-emerald-100 text-emerald-800 rounded-xl font-semibold mt-2 inline-block">
                      {habit.category}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => handleLogHabit(habit.id)}
                      className="px-8 py-4 bg-emerald-500 text-white rounded-2xl font-bold hover:bg-emerald-600 shadow-lg"
                    >
                      ✅ Log Today
                    </button>
                    <button 
                      onClick={() => handleDelete(habit.id)}
                      className="p-4 bg-red-500 text-white rounded-2xl hover:bg-red-600"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
