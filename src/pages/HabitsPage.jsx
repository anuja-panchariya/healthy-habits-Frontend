import React, { useEffect, useState, useCallback } from 'react'
import { getHabits, createHabit, deleteHabit } from '../lib/api'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog'
import { toast } from 'sonner'

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
      setHabits([])  
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadHabits()
  }, [loadHabits])

  // 🔥 OPTIMISTIC UPDATE - INSTANTLY SHOW NEW HABIT!
  const handleCreateHabit = async (e) => {
    e.preventDefault()
    if (!newHabitName.trim()) return

    // ✅ STEP 1: INSTANTLY ADD TO UI 
    const tempId = Date.now().toString()
    const newHabit = {
      id: tempId,
      name: newHabitName.trim(),
      category: 'general',
      goal: 1,
      logs: [],
      created_at: new Date().toISOString()
    }
    
    setHabits(prev => [newHabit, ...prev])
    
    try {
      await createHabit({ name: newHabitName.trim() })
      console.log("✅ API Success")
      loadHabits()  
      toast.success('Habit created! 🎉')
    } catch (error) {
      setHabits(prev => prev.filter(h => h.id !== tempId))
      toast.error('Failed to save')
    }
    
    setNewHabitName('')
    setShowCreate(false)
  }

  if (loading) {
    return <div className="p-8 text-center">Loading habits...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-light font-serif mb-2">Your Habits</h1>
            <p className="text-muted-foreground">{habits.length} habits active</p>
          </div>
          <Button 
            onClick={() => setShowCreate(true)} 
            className="bg-blue-600 hover:bg-blue-700 rounded-full px-6"
          >
            + New Habit
          </Button>
        </div>

        {/* HABITS LIST - INSTANTLY UPDATES */}
        <div className="space-y-4">
          {habits.length === 0 ? (
            <Card className="text-center py-16 border-0 shadow-lg">
              <CardContent className="space-y-4">
                <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto text-3xl">
                  🎯
                </div>
                <h3 className="text-2xl font-semibold">No habits yet</h3>
                <p className="text-muted-foreground">Start building better habits today!</p>
                <Button onClick={() => setShowCreate(true)} className="rounded-full">
                  Create First Habit
                </Button>
              </CardContent>
            </Card>
          ) : (
            habits.map((habit) => (
              <Card key={habit.id} className="hover:shadow-xl transition-all border-0">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold mb-2 truncate">{habit.name}</h3>
                      <div className="flex gap-2 flex-wrap">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                          {habit.category || 'General'}
                        </span>
                        <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                          {habit.logs?.length || 0}/{habit.goal || 1}
                        </span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="ml-4 flex-shrink-0">
                      Log Today
                    </Button>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mt-6">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span>{Math.round((habit.logs?.length || 0) / (habit.goal || 1) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
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

        {/* CREATE DIALOG */}
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader className="text-center pb-4">
              <DialogTitle className="text-2xl font-light font-serif">New Habit</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateHabit} className="space-y-6">
              <div>
                <Input
                  placeholder="e.g., Drink 8 glasses water, Meditate 10 mins, Walk 10k steps"
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  className="rounded-xl text-lg py-6"
                  required
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 rounded-xl h-12 font-medium">
                  Create Habit
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowCreate(false)}
                  className="rounded-xl h-12 px-8"
                >
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
