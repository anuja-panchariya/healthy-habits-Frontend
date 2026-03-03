import React, { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { motion } from 'framer-motion'
import { Plus, Trash2, X, CheckCircle, Clock } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { api, setAuthToken } from '../lib/api'
import { toast } from 'sonner'

export default function HabitsPage() {
  const { getToken } = useAuth()
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
  const todayDay = new Date().toLocaleDateString('en-US', { weekday: 'short' }) // "Wed"

  const loadHabits = useCallback(async () => {
    try {
      const token = await getToken()
      setAuthToken(token)
      const res = await api.get('/api/habits')
      setHabits(Array.isArray(res.data) ? res.data : [])
    } catch (error) {
      console.error('Error loading habits:', error)
      toast.error('Failed to load habits')
    } finally {
      setLoading(false)
    }
  }, [getToken])

  useEffect(() => {
    loadHabits()
  }, [loadHabits])

  const handleDelete = async (habitId) => {
    if (!window.confirm('Are you sure you want to delete this habit?')) return
    try {
      const token = await getToken()
      setAuthToken(token)
      await api.delete(`/api/habits/${habitId}`)
      toast.success('Habit deleted')
      loadHabits()
    } catch (error) {
      toast.error('Failed to delete habit')
    }
  }

  const handleLogHabit = async (habitId) => {
    try {
      const token = await getToken()
      setAuthToken(token)
      await api.post(`/api/habits/${habitId}/log`)
      toast.success('Habit logged!')
      loadHabits()
    } catch (error) {
      if (error.response?.status === 409) {
        toast.info('Already logged today')
      } else if (error.response?.status === 403) {
        toast.warning(error.response.data.message || 'Cannot log today')
      } else {
        toast.error('Failed to log habit')
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.title.trim()) return toast.error('Habit name required!')
    if (!formData.category) return toast.error('Category required!')
    if (formData.goal_type === 'daywise' && formData.days.length === 0) {
      return toast.error('Select at least one day!')
    }

    setIsCreating(true)
    try {
      const token = await getToken()
      setAuthToken(token)
      await api.post('/api/habits', formData)
      toast.success('Habit created!')
      loadHabits()
      setShowAddForm(false)
      setFormData({ title: '', category: '', goal_type: 'daily', goal_value: 1, days: [] })
    } catch (error) {
      toast.error('Failed to create habit')
    } finally {
      setIsCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  const groupedHabits = habits.reduce((acc, habit) => {
    if (!acc[habit.category]) acc[habit.category] = []
    acc[habit.category].push(habit)
    return acc
  }, {})

  const canLogHabit = (habit) => {
    if (habit.goal_type !== 'daywise') return true
    return habit.days && habit.days.includes(todayDay)
  }

  return (
    <div className="min-h-screen bg-background p-6" data-testid="habits-page">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="font-serif font-light text-4xl tracking-tight mb-2">My Habits</h1>
            <p className="text-muted-foreground">Today: <span className="font-semibold">{todayDay}</span></p>
          </div>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="rounded-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            {showAddForm ? 'Cancel' : 'Add Habit'}
          </Button>
        </div>

        {/* ✅ INLINE ADD FORM */}
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-muted/50 p-6 rounded-2xl border border-dashed border-muted-foreground/50"
          >
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Habit Name *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Drink Water"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Category *</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select *" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Goal Type</Label>
                <Select value={formData.goal_type} onValueChange={(v) => setFormData({ ...formData, goal_type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="daywise">Specific Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Goal Value</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.goal_value}
                  onChange={(e) => setFormData({ ...formData, goal_value: parseInt(e.target.value) || 1 })}
                  placeholder="8"
                />
              </div>

              {formData.goal_type === 'daywise' && (
                <div className="lg:col-span-2 space-y-2">
                  <Label>Select Days</Label>
                  <div className="flex flex-wrap gap-2">
                    {daysOfWeek.map(day => (
                      <label key={day} className="flex items-center space-x-1 cursor-pointer text-sm p-2 bg-muted/50 hover:bg-muted rounded-lg transition-colors">
                        <input
                          type="checkbox"
                          checked={formData.days.includes(day)}
                          onChange={(e) => {
                            const newDays = e.target.checked
                              ? [...formData.days, day]
                              : formData.days.filter(d => d !== day)
                            setFormData({ ...formData, days: newDays })
                          }}
                          className="w-4 h-4 rounded"
                        />
                        <span>{day}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="lg:col-span-3 flex gap-2 pt-2">
                <Button type="submit" disabled={isCreating} className="flex-1">
                  {isCreating ? 'Creating...' : 'Create Habit'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddForm(false)
                    setFormData({ title: '', category: '', goal_type: 'daily', goal_value: 1, days: [] })
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Habits List */}
        {Object.keys(groupedHabits).length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <p className="text-muted-foreground mb-4">No habits yet. Add your first habit above!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedHabits).map(([category, categoryHabits], idx) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="capitalize text-xl font-serif font-normal">{category}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {categoryHabits.map((habit) => (
                      <div key={habit.id} className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-colors">
                        <div className="flex-1">
                          <h4 className="font-medium">{habit.title}</h4>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span className="text-sm text-muted-foreground">
                              {habit.goal_value} {habit.goal_type === 'daily' ? 'per day' : habit.goal_type}
                            </span>
                            {habit.days && habit.days.length > 0 && (
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                canLogHabit(habit)
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-orange-100 text-orange-800'
                              }`}>
                                {canLogHabit(habit) ? '✅ Today' : `📅 ${habit.days.join(', ')}`}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            onClick={() => handleLogHabit(habit.id)} 
                            size="sm" 
                            className={`rounded-full ${
                              !canLogHabit(habit) 
                                ? 'bg-gray-400 cursor-not-allowed text-gray-500 hover:bg-gray-400' 
                                : 'bg-green-500 hover:bg-green-600'
                            }`}
                            disabled={!canLogHabit(habit)}
                          >
                            {canLogHabit(habit) ? 'Log Today' : <Clock className="w-4 h-4" />}
                          </Button>
                          <Button onClick={() => handleDelete(habit.id)} size="sm" variant="outline" className="rounded-full">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
