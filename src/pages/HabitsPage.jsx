import React, { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { motion } from 'framer-motion'
import { Plus, Check, Calendar, Target, BarChart3, Edit, Trash2, Flame } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Label } from '../components/ui/label'
import { 
  getHabits, createHabit, updateHabit, deleteHabit, 
  getStats 
} from '../lib/api'  // ✅ FIXED IMPORTS
import { toast } from 'sonner'

// ✅ CATEGORIES LIST
const CATEGORIES = [
  { id: 'fitness', label: 'Fitness', icon: '🏃‍♂️', color: 'bg-red-500' },
  { id: 'hydration', label: 'Hydration', icon: '💧', color: 'bg-blue-500' },
  { id: 'sleep', label: 'Sleep', icon: '😴', color: 'bg-purple-500' },
  { id: 'meditation', label: 'Meditation', icon: '🧘', color: 'bg-green-500' },
  { id: 'nutrition', label: 'Nutrition', icon: '🍎', color: 'bg-orange-500' },
  { id: 'reading', label: 'Reading', icon: '📚', color: 'bg-indigo-500' }
]

const HabitProgress = ({ habit, onLog }) => {
  const progress = habit.logs ? habit.logs.length : 0
  const percentage = habit.goal ? Math.min((progress / habit.goal) * 100, 100) : 0
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{habit.name}</span>
        <Badge variant={percentage === 100 ? "default" : "secondary"}>
          {progress}/{habit.goal || '∞'}
        </Badge>
      </div>
      <div className="w-full bg-muted rounded-full h-2">
        <div 
          className="h-2 bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <Button 
        size="sm" 
        className="w-full rounded-full"
        onClick={() => onLog(habit.id)}
        disabled={percentage >= 100}
      >
        {percentage >= 100 ? (
          <Check className="w-4 h-4" />
        ) : (
          <Flame className="w-4 h-4 mr-2" />
        )}
        {percentage >= 100 ? 'Completed!' : 'Log Today'}
      </Button>
    </div>
  )
}

export default function HabitsPage() {
  const { getToken } = useAuth()
  
  const [habits, setHabits] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({})
  const [showCreate, setShowCreate] = useState(false)
  const [editingHabit, setEditingHabit] = useState(null)
  
  // ✅ NEW FORM STATE
  const [formData, setFormData] = useState({
    name: '',
    category: 'fitness',
    goal: 1,
    goalType: 'daily', // daily/weekly
    frequency: 'days'  // days/times/minutes
  })

  const loadHabits = useCallback(async () => {
    try {
      setLoading(true)
      const habitsData = await getHabits()
      const statsData = await getStats()
      
      console.log("✅ Habits loaded:", habitsData)
      console.log("📊 Stats loaded:", statsData)
      
      setHabits(Array.isArray(habitsData) ? habitsData : [])
      setStats(statsData || {})
    } catch (error) {
      console.error('Error loading habits:', error)
      toast.error('Failed to load habits')
      setHabits([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadHabits()
  }, [loadHabits])

  // ✅ CREATE/UPDATE HABIT
  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingHabit) {
        await updateHabit(editingHabit.id, formData)
        toast.success('Habit updated! 🎉')
      } else {
        await createHabit(formData)
        toast.success('Habit created! 🎉')
      }
      
      setFormData({ name: '', category: 'fitness', goal: 1, goalType: 'daily', frequency: 'days' })
      setShowCreate(false)
      setEditingHabit(null)
      loadHabits()
    } catch (error) {
      console.error('Habit save error:', error)
      toast.error(editingHabit ? 'Failed to update habit' : 'Failed to create habit')
    }
  }

  // ✅ LOG HABIT COMPLETION
  const logHabit = async (habitId) => {
    try {
      // Optimistic update
      setHabits(habits.map(habit => 
        habit.id === habitId 
          ? { ...habit, logs: [...(habit.logs || []), new Date().toISOString()] }
          : habit
      ))
      
      toast.success('Habit logged! ✅')
      // TODO: Call actual log API when backend ready
    } catch (error) {
      toast.error('Failed to log habit')
    }
  }

  // ✅ DELETE HABIT
  const handleDelete = async (habitId) => {
    try {
      await deleteHabit(habitId)
      toast.success('Habit deleted!')
      loadHabits()
    } catch (error) {
      toast.error('Failed to delete habit')
    }
  }

  // ✅ EDIT HABIT
  const handleEdit = (habit) => {
    setEditingHabit(habit)
    setFormData({
      name: habit.name,
      category: habit.category || 'fitness',
      goal: habit.goal || 1,
      goalType: habit.goalType || 'daily',
      frequency: habit.frequency || 'days'
    })
    setShowCreate(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p>Loading habits...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6" data-testid="habits-page">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="font-serif font-light text-4xl tracking-tight mb-2">Habits</h1>
            <p className="text-muted-foreground">
              Track your progress • {habits.length} habits
            </p>
          </div>
          <Button 
            onClick={() => {
              setEditingHabit(null)
              setFormData({ name: '', category: 'fitness', goal: 1, goalType: 'daily', frequency: 'days' })
              setShowCreate(true)
            }} 
            className="rounded-full bg-gradient-to-r from-primary to-primary/80 shadow-lg"
            data-testid="create-habit-btn"
          >
            <Plus className="w-4 h-4 mr-2" /> New Habit
          </Button>
        </div>

        {/* STATS */}
        <Card className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <CardContent className="p-6 pt-8 text-center">
            <BarChart3 className="w-10 h-10 text-primary mx-auto mb-3" />
            <div className="text-2xl font-bold">{stats.totalHabits || habits.length}</div>
            <p className="text-sm text-muted-foreground">Total Habits</p>
          </CardContent>
          <CardContent className="p-6 pt-8 text-center">
            <Target className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
            <div className="text-2xl font-bold text-emerald-500">{stats.streak || 0}</div>
            <p className="text-sm text-muted-foreground">Current Streak</p>
          </CardContent>
          <CardContent className="p-6 pt-8 text-center">
            <Calendar className="w-10 h-10 text-orange-500 mx-auto mb-3" />
            <div className="text-2xl font-bold text-orange-500">{stats.daysLogged || 0}</div>
            <p className="text-sm text-muted-foreground">Days Logged</p>
          </CardContent>
        </Card>

        {/* HABITS LIST */}
        {habits.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent className="space-y-4">
              <Target className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No Habits Yet</h3>
              <p className="text-muted-foreground">Start building better habits today!</p>
              <Button className="rounded-full" onClick={() => setShowCreate(true)}>
                Create First Habit
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {habits.map((habit, index) => (
              <motion.div
                key={habit.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-xl transition-all border-0 overflow-hidden">
                  <CardContent className="p-0">
                    <div className="p-6 pb-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xl flex-shrink-0">
                            {CATEGORIES.find(c => c.id === habit.category)?.icon || '🎯'}
                          </div>
                          <div className="space-y-1">
                            <h3 className="font-bold text-xl">{habit.name}</h3>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs">
                                {habit.category && CATEGORIES.find(c => c.id === habit.category)?.label}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {habit.goal} {habit.frequency === 'minutes' ? 'min' : habit.frequency}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(habit)}
                            className="h-9 w-9 rounded-lg p-0"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(habit.id)}
                            className="h-9 w-9 rounded-lg p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <HabitProgress habit={habit} onLog={logHabit} />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* CREATE/EDIT DIALOG */}
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogContent className="max-w-md p-0">
            <Card className="w-full border-0">
              <CardHeader className="px-6 pt-6 pb-4">
                <DialogTitle className="font-serif text-2xl font-light">
                  {editingHabit ? 'Edit Habit' : 'Create New Habit'}
                </DialogTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Habit Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Drink water, Meditate, Exercise"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                      className="rounded-xl"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map(category => (
                            <SelectItem key={category.id} value={category.id}>
                              <div className="flex items-center space-x-2">
                                <span>{category.icon}</span>
                                <span>{category.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Goal Type</Label>
                      <Select value={formData.goalType} onValueChange={(value) => setFormData({...formData, goalType: value})}>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Goal</Label>
                      <Input
                        type="number"
                        min="1"
                        value={formData.goal}
                        onChange={(e) => setFormData({...formData, goal: parseInt(e.target.value) || 1})}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Unit</Label>
                      <Select value={formData.frequency} onValueChange={(value) => setFormData({...formData, frequency: value})}>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="days">Days</SelectItem>
                          <SelectItem value="times">Times</SelectItem>
                          <SelectItem value="minutes">Minutes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button type="submit" className="flex-1 rounded-full" disabled={!formData.name}>
                      {editingHabit ? 'Update Habit' : 'Create Habit'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowCreate(false)
                        setEditingHabit(null)
                        setFormData({ name: '', category: 'fitness', goal: 1, goalType: 'daily', frequency: 'days' })
                      }}
                      className="rounded-full"
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
