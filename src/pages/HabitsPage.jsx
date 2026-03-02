
import React, { useEffect, useState, useCallback } from 'react'
import WellnessScoreCard from '../components/WellnessScoreCard'  
import { getHabits, createHabit, deleteHabit } from '../lib/api'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog'
import { toast } from 'sonner'

// ✅ WELLNESS CALCULATOR
const calculateWellnessScore = (habits) => {
  if (!habits?.length) return 0
  const totalGoals = habits.reduce((sum, h) => sum + (h.goal || 1), 0)
  const totalProgress = habits.reduce((sum, h) => sum + (h.logs?.length || 0), 0)
  return Math.round(Math.min((totalProgress / totalGoals) * 100, 100))
}

export default function HabitsPage() {
  const [habits, setHabits] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [newHabitName, setNewHabitName] = useState('')

  // ✅ LOAD HABITS
  const loadHabits = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getHabits()
      setHabits(Array.isArray(data) ? data : [])
      console.log("✅ Habits loaded:", data)
    } catch (error) {
      console.error('Load error:', error)
      setHabits([])  // Empty array if API fails
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadHabits()
  }, [loadHabits])

  // 🔥 MAGIC: OPTIMISTIC UPDATE - INSTANTLY SHOW NEW HABIT!
  const handleCreateHabit = async (e) => {
    e.preventDefault()
    if (!newHabitName.trim()) return

    // ✅ STEP 1: INSTANTLY ADD TO UI (before API call!)
    const tempId = Date.now().toString()
    const newHabit = {
      id: tempId,
      name: newHabitName.trim(),
      category: 'general',
      goal: 1,
      logs: [],
      created_at: new Date().toISOString()
    }
    
    // ✅ OPTIMISTIC UPDATE - UI instantly shows new habit
    setHabits(prev => [newHabit, ...prev])
    
    try {
      // ✅ STEP 2: API call (background)
      await createHabit({ name: newHabitName.trim() })
      console.log("✅ API Success - reload to sync")
      loadHabits()  // Refresh with real data
      toast.success('Habit created! 🎉')
    } catch (error) {
      // ❌ STEP 3: If API fails, REMOVE from UI
      setHabits(prev => prev.filter(h => h.id !== tempId))
      toast.error('Failed to save')
    }
    
    setNewHabitName('')
    setShowCreate(false)
  }

  const wellnessScore = calculateWellnessScore(habits)

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-light font-serif">Your Habits</h1>
            <p>{habits.length} habits • Wellness: {wellnessScore}%</p>
          </div>
          <Button onClick={() => setShowCreate(true)} className="bg-blue-600 hover:bg-blue-700 rounded-full">
            + New Habit
          </Button>
        </div>

        {/* ✅ WELLNESS CARD */}
        <div className="grid md:grid-cols-2 gap-6">
          <WellnessScoreCard score={wellnessScore} />
          
          {/* STATS */}
          <Card>
            <CardContent className="p-6 pt-8 grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{habits.length}</div>
                <div>Total Habits</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{wellnessScore}%</div>
                <div>Completion</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">0 days</div>
                <div>Streak</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ✅ HABITS LIST - WILL SHOW NEW ONES INSTANTLY */}
        <div className="space-y-4">
          {habits.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <h3>No habits yet</h3>
                <Button onClick={() => setShowCreate(true)}>Create first habit</Button>
              </CardContent>
            </Card>
          ) : (
            habits.map((habit) => (
              <Card key={habit.id} className="hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold">{habit.name}</h3>
                      <div className="flex gap-2">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {habit.category}
                        </span>
                        <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                          {habit.logs?.length || 0}/{habit.goal || 1}
                        </span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Log Today</Button>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ 
                          width: `${Math.min((habit.logs?.length || 0) / (habit.goal || 1) * 100, 100)}%`
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* ✅ CREATE DIALOG */}
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Habit</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateHabit} className="space-y-4">
              <div>
                <Input
                  placeholder="e.g., Drink 8 glasses water, Meditate 10 mins"
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">Create Habit</Button>
                <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
