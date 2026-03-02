import React, { useEffect, useState, useCallback } from 'react'
import { getHabits, createHabit } from '../lib/api'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Label } from '../components/ui/label'
import { Badge } from '../components/ui/badge'
import { Check, Edit3, Calendar, Flame, Target } from 'lucide-react'
import { toast } from 'sonner'

// ✅ CATEGORIES
const CATEGORIES = [
  { id: 'fitness', label: 'Fitness', icon: '🏃‍♂️' },
  { id: 'hydration', label: 'Hydration', icon: '💧' },
  { id: 'sleep', label: 'Sleep', icon: '😴' },
  { id: 'meditation', label: 'Meditation', icon: '🧘' },
  { id: 'nutrition', label: 'Nutrition', icon: '🍎' },
  { id: 'reading', label: 'Reading', icon: '📚' }
]

export default function HabitsPage() {
  const [habits, setHabits] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  
  // ✅ COMPLETE FORM STATE
  const [formData, setFormData] = useState({
    name: '',
    category: 'fitness',
    goal: 1,
    goalType: 'daily',  // daily/weekly
    unit: 'times'       // times/minutes/glasses/days
  })

  // ✅ LOAD HABITS
  const loadHabits = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getHabits()
      setHabits(Array.isArray(data) ? data : [])
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

  // ✅ CREATE HABIT WITH FULL FORM
  const handleCreateHabit = async (e) => {
    e.preventDefault()
    
    // ✅ VALIDATION
    if (!formData.name.trim()) {
      toast.error('Habit name required!')
      return
    }
    if (formData.goal < 1) {
      toast.error('Goal must be at least 1!')
      return
    }

    // ✅ OPTIMISTIC UPDATE
    const tempId = Date.now().toString()
    const newHabit = {
      id: tempId,
      ...formData,
      name: formData.name.trim(),
      logs: [],
      created_at: new Date().toISOString()
    }
    
    setHabits(prev => [newHabit, ...prev])
    
    try {
      await createHabit(formData)
      toast.success('✅ Habit created!')
      loadHabits()  // Sync with backend
    } catch (error) {
      setHabits(prev => prev.filter(h => h.id !== tempId))
      toast.error('Failed to save habit')
    }
    
    // ✅ RESET FORM
    setFormData({
      name: '',
      category: 'fitness',
      goal: 1,
      goalType: 'daily',
      unit: 'times'
    })
    setShowCreate(false)
  }

  // ✅ LOG HABIT COMPLETION
  const logHabit = (habitId) => {
    setHabits(prev => prev.map(habit => 
      habit.id === habitId 
        ? { 
            ...habit, 
            logs: [...(habit.logs || []), new Date().toISOString().split('T')[0]]
          }
        : habit
    ))
    toast.success('✅ Logged today!')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading habits...</p>
        </div>
      </div>
    )
  }

  const getProgressPercentage = (habit) => {
    const progress = habit.logs?.length || 0
    const goal = habit.goal || 1
    return Math.min((progress / goal) * 100, 100)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-light font-serif mb-2">Your Habits</h1>
            <p className="text-xl text-muted-foreground">{habits.length} habits • Track daily progress</p>
          </div>
          <Button 
            onClick={() => setShowCreate(true)} 
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-2xl px-8 h-12 font-medium shadow-lg"
          >
            <Target className="w-5 h-5 mr-2" />
            New Habit
          </Button>
        </div>

        {/* HABITS LIST */}
        <div className="grid gap-6">
          {habits.length === 0 ? (
            <Card className="text-center py-20 border-0 shadow-2xl">
              <CardContent className="space-y-6">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto text-3xl shadow-2xl">
                  🎯
                </div>
                <div>
                  <h3 className="text-3xl font-bold mb-3">No habits yet</h3>
                  <p className="text-xl text-muted-foreground mb-8 max-w-md mx-auto">
                    Create your first habit to start tracking fitness, hydration, sleep, meditation and more!
                  </p>
                </div>
                <Button onClick={() => setShowCreate(true)} className="text-lg px-8 h-14 rounded-2xl font-semibold">
                  Create First Habit
                </Button>
              </CardContent>
            </Card>
          ) : (
            habits.map((habit) => (
              <Card key={habit.id} className="hover:shadow-2xl transition-all border-0 shadow-lg overflow-hidden">
                <CardContent className="p-0">
                  {/* HEADER */}
                  <div className="p-8 pb-6 border-b border-border/50">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center space-x-4 flex-1 min-w-0">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 shadow-xl">
                          {CATEGORIES.find(c => c.id === habit.category)?.icon || '🎯'}
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold mb-2 truncate">{habit.name}</h3>
                          <div className="flex items-center gap-3">
                            <Badge className="text-lg px-4 py-2 h-auto bg-blue-100 text-blue-800 hover:bg-blue-200">
                              {CATEGORIES.find(c => c.id === habit.category)?.label || 'General'}
                            </Badge>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Calendar className="w-4 h-4" />
                              {habit.goalType}
                            </div>
                          </div>
                        </div>
                      </div>
                      <Button 
                        onClick={() => logHabit(habit.id)}
                        size="lg" 
                        className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 rounded-xl px-8 shadow-lg font-semibold ml-4 flex-shrink-0"
                      >
                        <Check className="w-5 h-5 mr-2" />
                        Log Today
                      </Button>
                    </div>
                  </div>

                  {/* PROGRESS */}
                  <div className="p-8 pt-0">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold">Progress</span>
                        <Badge className="text-xl px-4 py-2 font-bold bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg">
                          {getProgressPercentage(habit).toFixed(0)}%
                        </Badge>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="w-full bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl h-4 overflow-hidden shadow-inner">
                        <div 
                          className="h-4 bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 rounded-2xl shadow-lg transition-all duration-1000 flex items-center justify-end pr-3"
                          style={{ width: `${getProgressPercentage(habit)}%` }}
                        >
                          <span className="text-xs font-bold text-white drop-shadow-md">
                            {habit.logs?.length || 0}/{habit.goal}
                          </span>
                        </div>
                      </div>

                      {/* Goal Display */}
                      <div className="text-center py-4 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-2xl">
                        <div className="flex items-center justify-center gap-2 text-sm text-emerald-800">
                          <Flame className="w-5 h-5" />
                          <span>Goal: {habit.goal} {habit.unit} {habit.goalType}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* ✅ COMPLETE FORM DIALOG */}
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogContent className="sm:max-w-2xl p-0">
            <Card className="border-0 shadow-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-8 text-center">
                <DialogTitle className="text-3xl font-light font-serif">
                  Create New Habit
                </DialogTitle>
              </CardHeader>
              
              <CardContent className="p-8">
                <form onSubmit={handleCreateHabit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Habit Name */}
                  <div className="space-y-2 lg:col-span-2">
                    <Label className="text-lg font-semibold">Habit Name</Label>
                    <Input
                      placeholder="e.g., Drink 8 glasses water, Meditate 10 mins, Walk 10k steps"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="rounded-2xl text-lg h-14 py-4 px-6 shadow-inner"
                      required
                    />
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                    <Label className="text-lg font-semibold">Category</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value)}>
                      <SelectTrigger className="rounded-2xl h-14 shadow-inner">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl">
                        {CATEGORIES.map(category => (
                          <SelectItem key={category.id} value={category.id} className="text-lg py-4">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{category.icon}</span>
                              <span>{category.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Goal Type */}
                  <div className="space-y-2">
                    <Label className="text-lg font-semibold">Goal Type</Label>
                    <Select value={formData.goalType} onValueChange={(value) => setFormData({...formData, goalType: value})}>
                      <SelectTrigger className="rounded-2xl h-14 shadow-inner">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily" className="text-lg py-4">Daily</SelectItem>
                        <SelectItem value="weekly" className="text-lg py-4">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Goal Number */}
                  <div className="space-y-2">
                    <Label className="text-lg font-semibold">Goal Amount</Label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.goal}
                      onChange={(e) => setFormData({...formData, goal: parseInt(e.target.value) || 1})}
                      className="rounded-2xl h-14 text-lg shadow-inner"
                      placeholder="8"
                    />
                  </div>

                  {/* Unit */}
                  <div className="space-y-2">
                    <Label className="text-lg font-semibold">Unit</Label>
                    <Select value={formData.unit} onValueChange={(value) => setFormData({...formData, unit: value})}>
                      <SelectTrigger className="rounded-2xl h-14 shadow-inner">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="times" className="text-lg py-4">Times</SelectItem>
                        <SelectItem value="minutes" className="text-lg py-4">Minutes</SelectItem>
                        <SelectItem value="glasses" className="text-lg py-4">Glasses</SelectItem>
                        <SelectItem value="hours" className="text-lg py-4">Hours</SelectItem>
                        <SelectItem value="pages" className="text-lg py-4">Pages</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Buttons */}
                  <div className="lg:col-span-2 flex gap-4 pt-4">
                    <Button 
                      type="submit" 
                      className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 rounded-2xl h-16 text-lg font-semibold shadow-xl"
                    >
                      Create Habit
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowCreate(false)}
                      className="rounded-2xl h-16 px-12 text-lg font-semibold border-2 hover:bg-muted"
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
