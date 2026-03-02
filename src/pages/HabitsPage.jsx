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
    goalType: 'daily',
    unit: 'times'
  })

  const loadHabits = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getHabits()
      setHabits(Array.isArray(data) ? data : [])
    } catch (error) {
      setHabits([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadHabits()
  }, [loadHabits])

  const handleCreateHabit = async (e) => {
    e.preventDefault()
    if (!formData.name.trim()) return toast.error('Name required')

    const tempId = Date.now().toString()
    const newHabit = {
      id: tempId,
      ...formData,
      name: formData.name.trim(),
      logs: []
    }
    
    setHabits(prev => [newHabit, ...prev])
    
    try {
      await createHabit(formData)
      toast.success('Habit created!')
      loadHabits()
    } catch (error) {
      setHabits(prev => prev.filter(h => h.id !== tempId))
      toast.error('Failed to save')
    }
    
    setFormData({ name: '', category: 'fitness', goal: 1, goalType: 'daily', unit: 'times' })
    setShowCreate(false)
  }

  const logHabit = (habitId) => {
    setHabits(prev => prev.map(habit => 
      habit.id === habitId 
        ? { ...habit, logs: [...(habit.logs || []), new Date().toISOString().split('T')[0]] }
        : habit
    ))
    toast.success('Logged!')
  }

  if (loading) return <div className="p-8 text-center">Loading...</div>

  const getProgress = (habit) => {
    const progress = habit.logs?.length || 0
    return Math.min((progress / (habit.goal || 1)) * 100, 100)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-light font-serif">Your Habits</h1>
            <p>{habits.length} habits</p>
          </div>
          <Button onClick={() => setShowCreate(true)}>+ New Habit</Button>
        </div>

        {habits.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <h3>No habits yet</h3>
              <Button onClick={() => setShowCreate(true)}>Create first habit</Button>
            </CardContent>
          </Card>
        ) : (
          habits.map((habit) => (
            <Card key={habit.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{habit.name}</h3>
                    <div className="flex gap-2 mt-2">
                      <Badge>{CATEGORIES.find(c => c.id === habit.category)?.label || 'General'}</Badge>
                      <Badge>{habit.logs?.length || 0}/{habit.goal}</Badge>
                    </div>
                  </div>
                  <Button onClick={() => logHabit(habit.id)} variant="outline">Log Today</Button>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-600 h-3 rounded-full transition-all"
                    style={{ width: `${getProgress(habit)}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          ))
        )}

        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Habit</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateHabit} className="space-y-4">
              <div>
                <Label>Habit Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Drink water"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Goal</Label>
                  <Input
                    type="number"
                    value={formData.goal}
                    onChange={(e) => setFormData({...formData, goal: parseInt(e.target.value) || 1})}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">Create</Button>
                <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
