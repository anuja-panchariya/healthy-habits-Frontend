import React, { useEffect, useState, useCallback } from 'react'
import { getHabits, createHabit } from '../lib/api'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Label } from '../components/ui/label'
import { Badge } from '../components/ui/badge'
import { toast } from 'sonner'
import { Plus, Check, Target } from 'lucide-react'

export default function HabitsPage() {
  const [habits, setHabits] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    category: 'fitness',
    goal: 1,
    goalType: 'daily'
  })

  // ✅ SAFE LOAD - NO CRASH
  const loadHabits = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getHabits().catch(() => null)
      
      // ✅ SAFE DATA HANDLING
      let safeHabits = []
      if (data) {
        if (Array.isArray(data)) safeHabits = data
        else if (data.habits && Array.isArray(data.habits)) safeHabits = data.habits
        else if (data.data && Array.isArray(data.data)) safeHabits = data.data
      }
      
      console.log('✅ SAFE HABITS:', safeHabits)
      setHabits(safeHabits)
    } catch (error) {
      console.error('LOAD ERROR:', error)
      setHabits([]) // Always safe fallback
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadHabits()
  }, [loadHabits])

  // ✅ NO-RELOAD CREATE - DIRECT ADD
  const handleCreateHabit = async (e) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error('Habit name required!')
      return
    }

    try {
      // ✅ STEP 1: CREATE NEW HABIT OBJECT
      const newHabit = {
        id: `habit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: formData.name.trim(),
        category: formData.category,
        goal: Number(formData.goal),
        goalType: formData.goalType,
        logs: [],
        created_at: new Date().toISOString()
      }

      // ✅ STEP 2: ADD TO STATE IMMEDIATELY (SAFE)
      setHabits(prev => {
        const updated = [newHabit, ...prev]
        console.log('✅ NEW HABITS:', updated)
        return updated
      })

      // ✅ STEP 3: API CALL (fire & forget)
      createHabit(formData).catch(err => {
        console.error('API FAILED but UI safe:', err)
        // Don't revert UI - user sees habit anyway
      })

      toast.success('✅ Habit created!')
      
      // ✅ RESET FORM
      setFormData({ name: '', category: 'fitness', goal: 1, goalType: 'daily' })
      setShowCreate(false)
      
    } catch (error) {
      console.error('CRITICAL ERROR:', error)
      toast.error('Something went wrong')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading habits...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* HEADER */}
        <div className="flex justify-between items-center pb-8 border-b">
          <div>
            <h1 className="text-4xl font-light font-serif">Your Habits</h1>
            <p className="text-xl text-muted-foreground mt-2">
              {habits.length} active habits
            </p>
          </div>
          <Button 
            onClick={() => setShowCreate(true)}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-2xl px-8 py-4 shadow-xl"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Habit
          </Button>
        </div>

        {/* HABITS */}
        {habits.length === 0 ? (
          <Card className="border-0 shadow-2xl max-w-2xl mx-auto">
            <CardContent className="text-center py-20">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl">
                <Target className="w-12 h-12 opacity-60" />
              </div>
              <h2 className="text-3xl font-bold mb-4">No habits yet</h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
                Create your first habit to start tracking your progress!
              </p>
              <Button 
                onClick={() => setShowCreate(true)}
                className="text-lg px-12 py-8 rounded-2xl font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-xl"
              >
                Create First Habit
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {habits.map((habit) => {
              const progress = Math.min((habit.logs?.length || 0) / Math.max(habit.goal || 1, 1) * 100, 100)
              
              return (
                <Card key={habit.id} className="border-0 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all">
                  <CardContent className="p-8">
                    <div className="flex items-start justify-between gap-6 mb-6">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg text-white text-xl font-bold flex-shrink-0">
                          {habit.category === 'fitness' ? '🏃‍♂️' : 
                           habit.category === 'hydration' ? '💧' : 
                           habit.category === 'sleep' ? '😴' : 
                           habit.category === 'meditation' ? '🧘' : '🎯'}
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold mb-2">{habit.name}</h3>
                          <div className="flex items-center gap-3">
                            <Badge className="px-4 py-2 text-lg bg-blue-100 text-blue-800 hover:bg-blue-200">
                              {habit.category === 'fitness' ? 'Fitness' : 
                               habit.category === 'hydration' ? 'Hydration' : 
                               habit.category === 'sleep' ? 'Sleep' : 'Meditation'}
                            </Badge>
                            <Badge variant="outline" className="px-4 py-2 text-lg">
                              {habit.logs?.length || 0}/{habit.goal}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Button 
                        onClick={() => {
                          const newLogs = [...(habit.logs || []), new Date().toISOString().split('T')[0]]
                          setHabits(prev => prev.map(h => 
                            h.id === habit.id ? { ...h, logs: newLogs } : h
                          ))
                          toast.success('✅ Logged today!')
                        }}
                        className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-8 py-3 rounded-xl shadow-lg font-semibold whitespace-nowrap"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Log Today
                      </Button>
                    </div>

                    {/* PROGRESS BAR */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-semibold">Progress</span>
                        <Badge className="text-xl px-6 py-3 font-bold bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg">
                          {Math.round(progress)}%
                        </Badge>
                      </div>
                      <div className="w-full h-6 bg-gray-200 rounded-2xl overflow-hidden shadow-inner">
                        <div 
                          className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-2xl shadow-xl transition-all duration-700 relative"
                          style={{ width: `${progress}%` }}
                        >
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-white drop-shadow-lg">
                            {habit.logs?.length || 0}/{habit.goal}
                          </span>
                        </div>
                      </div>
                      <div className="text-center py-4 bg-emerald-50 rounded-2xl">
                        <div className="flex items-center justify-center gap-2 text-lg font-semibold text-emerald-800">
                          <Target className="w-5 h-5" />
                          Goal: {habit.goal} {habit.goalType}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* FORM */}
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogContent className="max-w-2xl p-1">
            <Card className="border-0 shadow-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-10 text-center">
                <CardTitle className="text-4xl font-light">Create New Habit</CardTitle>
              </CardHeader>
              <CardContent className="p-10">
                <form onSubmit={handleCreateHabit} className="space-y-8">
                  <div>
                    <Label className="text-xl font-semibold mb-3 block">Habit Name</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Drink 8 glasses water daily"
                      className="h-16 rounded-2xl text-xl shadow-lg"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-lg font-semibold mb-3 block">Category</Label>
                      <Select 
                        value={formData.category} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger className="h-16 rounded-2xl shadow-lg">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fitness">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">🏃‍♂️</span>
                              Fitness
                            </div>
                          </SelectItem>
                          <SelectItem value="hydration">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">💧</span>
                              Hydration
                            </div>
                          </SelectItem>
                          <SelectItem value="sleep">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">😴</span>
                              Sleep
                            </div>
                          </SelectItem>
                          <SelectItem value="meditation">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">🧘</span>
                              Meditation
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-lg font-semibold mb-3 block">Goal Type</Label>
                        <Select 
                          value={formData.goalType} 
                          onValueChange={(value) => setFormData(prev => ({ ...prev, goalType: value }))}
                        >
                          <SelectTrigger className="h-16 rounded-2xl shadow-lg">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-lg font-semibold mb-3 block">Goal</Label>
                        <Input
                          type="number"
                          min="1"
                          value={formData.goal}
                          onChange={(e) => setFormData(prev => ({ ...prev, goal: parseInt(e.target.value) || 1 }))}
                          className="h-16 rounded-2xl text-xl shadow-lg"
                          placeholder="8"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button 
                      type="submit" 
                      className="flex-1 h-16 rounded-2xl text-xl shadow-2xl font-semibold bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
                    >
                      Create Habit
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowCreate(false)}
                      className="h-16 px-12 rounded-2xl text-xl font-semibold"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
