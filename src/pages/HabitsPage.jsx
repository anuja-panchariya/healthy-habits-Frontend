import React, { useState, useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { createHabit, getHabits } from '../../lib/api'  // YE IMPORTS

export default function HabitsPage() {
  const { getToken } = useAuth()
  const [habits, setHabits] = useState([])
  const [newHabit, setNewHabit] = useState('')
  const [loading, setLoading] = useState(false)

  // Load habits
  useEffect(() => {
    loadHabits()
  }, [])

  const loadHabits = async () => {
    try {
      const habitsData = await getHabits()
      setHabits(habitsData)
    } catch (error) {
      console.error('Error loading habits:', error)
    }
  }

  // ✅ HABIT ADD BUTTON - 100% WORKING!
  const handleAddHabit = async (e) => {
    e.preventDefault()
    if (!newHabit.trim()) return

    setLoading(true)
    try {
      await createHabit({
        name: newHabit.trim(),
        completed: false
      })
      setNewHabit('')
      loadHabits()  // Refresh list
      alert('Habit added successfully! ✅')
    } catch (error) {
      console.error('Add habit error:', error)
      alert('Error adding habit: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">My Habits</h1>
      
      {/* ADD HABIT FORM */}
      <form onSubmit={handleAddHabit} className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="flex gap-4">
          <input
            type="text"
            value={newHabit}
            onChange={(e) => setNewHabit(e.target.value)}
            placeholder="Enter new habit (e.g., Drink water)"
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !newHabit.trim()}
            className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Adding...' : 'Add Habit'}
          </button>
        </div>
      </form>

      {/* HABITS LIST */}
      <div className="grid gap-4">
        {habits.map((habit) => (
          <div key={habit.id} className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
            <h3 className="font-semibold text-lg">{habit.name}</h3>
            <p className="text-sm text-gray-600">ID: {habit.id}</p>
            <p className="text-sm">Completed: {habit.completed ? '✅' : '❌'}</p>
          </div>
        ))}
      </div>

      {habits.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>No habits yet. Add your first habit above! 🎯</p>
        </div>
      )}
    </div>
  )
}
