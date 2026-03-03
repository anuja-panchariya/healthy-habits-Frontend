import React, { useEffect, useState, useCallback } from 'react'
import { getHabits, createHabit } from '@/lib/api'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Label } from '../components/ui/label'
import { Badge } from '../components/ui/badge'
import { toast } from 'sonner'
import { Plus, Check, Target } from 'lucide-react'

const CATEGORIES = [
  { id: 'fitness', label: 'Fitness', icon: '🏃‍♂️' },
  { id: 'hydration', label: 'Hydration', icon: '💧' },
  { id: 'sleep', label: 'Sleep', icon: '😴' },
  { id: 'meditation', label: 'Meditation', icon: '🧘' }
]

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

  const loadHabits = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getHabits()
      console.log('🔥 RAW API DATA:', data)
      
      // ✅ FIX: Handle ANY response format
      let habitList = []
      if (Array.isArray(data)) {
        habitList = data
      } else if (data && data.habits) {
        habitList = data.habits
      } else if (data && Array.isArray(data.data)) {
        habitList = data.data
      } else {
        habitList = []
      }
      
      console.log('✅ PROCESSED HABITS:', habitList)
      setHabits(habitList)
    } catch (error) {
      console.error('❌ LOAD ERROR:', error)
      setHabits([]) 
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadHabits()
  }, [loadHabits])

  // ✅ FIXED CREATE - NO RELOAD DEPENDENCY!
  const handleCreateHabit = async (e) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error('Habit name required!')
      return
    }

    toast.loading('Creating habit...', { duration: 2000 })

    try {
      // ✅ API CALL
      const result = await createHabit({
        name: formData.name.trim(),
        category: formData.category,
        goal: parseInt(formData.goal),
        goalType: formData.goalType
      })
      
      console.log('✅ CREATE RESULT:', result)
      
      // ✅ DON'T RELOAD - ADD LOCAL HABIT
      const newHabit = {
        id: Date.now().toString(),
        name: formData.name.trim(),
        category: formData.category,
        goal: parseInt(formData.goal),
        goalType: formData.goalType,
        logs: [],
        created_at: new Date().toISOString()
      }
      
      // ✅ ADD TO EXISTING LIST
      setHabits(prevHabits => [newHabit, ...prevHabits])
      
      toast.success('✅ Habit created successfully!')
      
      // ✅ RESET FORM
      setFormData({ name: '', category: 'fitness', goal: 1, goalType: 'daily' })
      setShowCreate(false)
      
    } catch (error) {
      console.error('❌ CREATE ERROR:', error)
      toast.error('Failed to create habit')
    }
  }

  const logHabit = (habitId) => {
    setHabits(prev => prev.map(habit => 
      habit.id === habitId 
        ? { ...habit, logs: [...(habit.logs || []), new Date().toISOString()] }
        : habit
    ))
    toast.success('✅ Today logged!')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="animate-pulse space-y-4">
          <div className="w-16 h-16 bg-primary/20 rounded-full mx-auto"></div>
          <div className="h-4 bg-primary/20 rounded w-48 mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* HEADER */}
        <div className="flex justify-between items-center pb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-light font-serif tracking-tight">Your Habits</h1>
            <p className="mt-2 text-xl text-muted-foreground">{habits.length} active habits</p>
          </div>
          <Button 
            onClick={() => setShowCreate(true)}
            className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground rounded-2xl px-8 py-4 h-auto font-medium shadow-lg hover:shadow-xl text-lg flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Habit
          </Button>
        </div>

        {/* HABITS LIST */}
        {habits.length === 0 ? (
          <Card className="border-0 shadow-2xl backdrop-blur-sm bg-white/80">
            <CardContent className="text-center py-20 space-y-6">
              <div className="w-32 h-32 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl flex items-center justify-center mx-auto shadow-2xl backdrop-blur-sm">
                <Target className="w-16 h-16 text-primary opacity-60" />
              </div>
              <div>
                <h3 className="text-3xl font-bold mb-3">No habits yet</h3>
                <p className="text-xl text-muted-foreground max-w-md mx-auto">
                  Start tracking fitness, hydration, sleep, meditation and more!
                </p>
              </div>
              <Button 
                onClick={() => setShowCreate(true)} 
                className="text-lg px-12 h-14 rounded-2xl font-semibold shadow-xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
              >
                Create First Habit
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {habits.map((habit) => {
              const progress = Math.min((habit.logs?.length || 0) / (habit.goal || 1) * 100, 100)
              
              return (
                <Card key={habit.id} className="border-0 shadow-xl backdrop-blur-sm bg-white/80 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden">
                  <CardContent className="p-0">
                    {/* Header */}
                    <div className="p-8 pb-6">
                      <div className="flex items-start justify-between gap-6">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center shadow-xl backdrop-blur-sm border">
                            <span className="text-2xl">
                              {CATEGORIES.find(c => c.id === habit.category)?.icon || '🎯'}
                            </span>
                          </div>
                          <div className="space-y-2">
                            <h3 className="text-2xl font-bold leading-tight">{habit.name}</h3>
                            <div className="flex items-center gap-3">
                              <Badge variant="secondary" className="text-lg px-4 py-2">
                                {CATEGORIES.find(c => c.id === habit.category)?.label || 'General'}
                              </Badge>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                                <Calendar className="w-4 h-4" />
                                {habit.goalType}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <Button 
                          onClick={() => logHabit(habit.id)}
                          variant="default"
                          className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-emerald-foreground shadow-lg hover:shadow-xl rounded-xl px-8 py-3 font-semibold whitespace-nowrap ml-auto flex-shrink-0"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Log Today
                        </Button>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="px-8 pb-8 pt-2">
                      <div className="flex justify-between items-center mb-6">
                        <span className="text-xl font-semibold flex items-center gap-2">
                          Progress
                        </span>
                        <Badge className="text-xl px-6 py-3 font-bold shadow-lg bg-gradient-to-r from-emerald-500 to-emerald-600">
                          {Math.round(progress)}%
                        </Badge>
                      </div>
                      
                      <div className="w-full bg-muted rounded-2xl h-8 shadow-inner overflow-hidden">
                        <div 
                          className="h-8 bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 rounded-2xl shadow-xl transition-all duration-1000 relative"
                          style={{ width: `${progress}%` }}
                        >
                          <div className="absolute inset-0 flex items-center justify-end pr-4">
                            <span className="text-sm font-bold text-white/90 drop-shadow-lg">
                              {habit.logs?.length || 0}/{habit.goal}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 p-4 bg-muted/50 rounded-2xl backdrop-blur-sm border">
                        <div className="flex items-center justify-center gap-2 text-lg font-medium text-muted-foreground">
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
          <DialogContent className="sm:max-w-2xl">
            <Card className="border-0 shadow-2xl">
              <CardHeader className="p-8 text-center">
                <DialogTitle className="text-3xl font-light font-serif">Create New Habit</DialogTitle>
                <DialogDescription>Track fitness, hydration, sleep & meditation</DialogDescription>
              </CardHeader>
              <CardContent className="p-8 pt-0">
                <form onSubmit={handleCreateHabit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="md:col-span-2 space-y-3">
                    <Label className="text-xl font-semibold">Habit Name</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Drink 8 glasses water daily"
                      className="h-16 rounded-2xl text-lg shadow-lg"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-xl font-semibold">Category</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                      <SelectTrigger className="h-16 rounded-2xl shadow-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl shadow-2xl">
                        {CATEGORIES.map(cat => (
                          <SelectItem key={cat.id} value={cat.id} className="h-14 text-lg">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{cat.icon}</span>
                              {cat.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-xl font-semibold">Goal Type</Label>
                    <Select value={formData.goalType} onValueChange={(value) => setFormData({...formData, goalType: value})}>
                      <SelectTrigger className="h-16 rounded-2xl shadow-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-xl font-semibold">Goal Amount</Label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.goal}
                      onChange={(e) => setFormData({...formData, goal: parseInt(e.target.value) || 1})}
                      className="h-16 rounded-2xl text-lg shadow-lg"
                      placeholder="8"
                    />
                  </div>

                  <div className="md:col-span-2 flex gap-4 pt-8">
                    <Button type="submit" className="flex-1 h-16 rounded-2xl text-lg shadow-2xl font-semibold">
                      Create Habit
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowCreate(false)}
                      className="h-16 px-12 rounded-2xl text-lg font-semibold"
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
