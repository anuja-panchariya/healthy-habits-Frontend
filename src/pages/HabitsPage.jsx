import React, { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { motion } from 'framer-motion'
import { api, setAuthToken } from '../lib/api'
import { toast } from 'sonner'
import { Plus, Trash2, CheckCircle } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'

export default function HabitsPage() {
  const { getToken } = useAuth()
  const [habits, setHabits] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '', category: '', goal_type: 'daily', goal_value: 1, days: []
  })
  const [isCreating, setIsCreating] = useState(false)

  const loadHabits = useCallback(async () => {
    try {
      const token = await getToken()
      setAuthToken(token)
      const res = await api.get('/api/habits')
      setHabits(res.habits || [])
    } catch (error) {
      console.error('Error loading habits:', error)
    } finally {
      setLoading(false)
    }
  }, [getToken])

  useEffect(() => {
    loadHabits()
  }, [loadHabits])

  // ✅ FIXED: handleDelete FUNCTION
  const handleDelete = async (habitId, habitTitle) => {
    if (!confirm(`Delete "${habitTitle}"?`)) return
    try {
      const token = await getToken()
      setAuthToken(token)
      await api.delete(`/api/habits/${habitId}`)
      toast.success('🗑️ Habit deleted!')
      loadHabits()
    } catch (error) {
      toast.error('Failed to delete habit')
    }
  }

  // ✅ FIXED: handleLogHabit FUNCTION  
  const handleLogHabit = async (habitId, habitTitle) => {
    try {
      const token = await getToken()
      setAuthToken(token)
      await api.post(`/api/habits/${habitId}/log`)
      toast.success(`✅ "${habitTitle}" logged today!`)
      loadHabits()
    } catch (error) {
      if (error.response?.status === 409) {
        toast.info('Already logged today!')
      } else {
        toast.error('Failed to log habit')
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.category) {
      toast.error('Title & category required!')
      return
    }

    const tempHabit = {
      id: `temp-${Date.now()}`,
      title: formData.title,
      category: formData.category,
      goal_type: formData.goal_type,
      goal_value: formData.goal_value,
      days: formData.days,
      created_at: new Date().toISOString(),
      logs: []
    }

    setHabits(prev => [tempHabit, ...prev])
    setIsCreating(true)

    try {
      const token = await getToken()
      setAuthToken(token)
      const res = await api.post('/api/habits', formData)
      
      const realHabit = res.habit || { ...tempHabit, id: res.id || Date.now().toString() }
      setHabits(prev => prev.map(h => h.id === tempHabit.id ? realHabit : h))
      
      toast.success(`🎉 "${formData.title}" created!`)
      setShowAddForm(false)
      setFormData({ title: '', category: '', goal_type: 'daily', goal_value: 1, days: [] })
    } catch (error) {
      setHabits(prev => prev.filter(h => !h.id.startsWith('temp-')))
      toast.error('Failed to create habit')
    } finally {
      setIsCreating(false)
    }
  }

  if (loading && habits.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="font-serif font-light text-4xl tracking-tight mb-2">My Habits</h1>
            <p className="text-muted-foreground">Today: {new Date().toLocaleDateString('en-US', { weekday: 'long' })}</p>
          </div>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            disabled={isCreating}
            className="rounded-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            {showAddForm ? 'Cancel' : 'Add Habit'}
          </Button>
        </div>

        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-muted/50 p-6 rounded-2xl border border-dashed border-muted-foreground/50"
          >
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Habit Name *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Drink Water"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category *</label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Health">💧 Health</SelectItem>
                    <SelectItem value="Fitness">🏃 Fitness</SelectItem>
                    <SelectItem value="Productivity">⚡ Productivity</SelectItem>
                    <SelectItem value="Nutrition">🍎 Nutrition</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2 flex gap-2 pt-4">
                <Button type="submit" disabled={isCreating} className="flex-1">
                  {isCreating ? 'Creating...' : 'Create Habit'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </motion.div>
        )}

        {habits.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <div className="text-6xl mb-6 opacity-50">🎯</div>
              <h3 className="text-2xl font-bold mb-4">No habits yet!</h3>
              <p className="text-muted-foreground">Add your first habit above</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {habits.map((habit) => (
              <motion.div
                key={habit.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="h-full hover:shadow-xl">
                  <CardHeader>
                    <CardTitle>{habit.title}</CardTitle>
                    <p className="text-muted-foreground">{habit.category}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleLogHabit(habit.id, habit.title)}  // ✅ FIXED!
                        size="sm" 
                        className="flex-1"
                        variant="default"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Log Today
                      </Button>
                      <Button 
                        onClick={() => handleDelete(habit.id, habit.title)}     // ✅ FIXED!
                        size="sm" 
                        variant="outline"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
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
