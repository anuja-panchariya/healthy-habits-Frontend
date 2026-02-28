import React, { useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { api, setAuthToken } from '../lib/api'
import { toast } from 'sonner'

export default function CreateHabitDialog({ open, onClose, onSuccess }) {
  const { getToken } = useAuth()
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    goal_type: 'daily',
    goal_value: '1'
  })
  const [loading, setLoading] = useState(false)

  const categories = [
    { value: 'fitness', label: 'Fitness' },
    { value: 'nutrition', label: 'Nutrition' },
    { value: 'mindfulness', label: 'Mindfulness' },
    { value: 'sleep', label: 'Sleep' },
    { value: 'hydration', label: 'Hydration' },
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = await getToken()
      setAuthToken(token)
      await api.post('/api/habits', formData)
      toast.success('Habit created successfully!')
      setFormData({ title: '', category: '', goal_type: 'daily', goal_value: '1' })
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error creating habit:', error)
      toast.error('Failed to create habit')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl font-light">Create New Habit</DialogTitle>
          <DialogDescription>Add a new healthy habit to track</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <Label htmlFor="title">Habit Name</Label>
            <Input
              id="title"
              data-testid="habit-title-input"
              placeholder="e.g., Morning meditation"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="rounded-xl"
            />
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
              required
            >
              <SelectTrigger data-testid="habit-category-select" className="rounded-xl">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="goal_value">Daily Goal</Label>
            <Input
              id="goal_value"
              type="number"
              min="1"
              placeholder="1"
              value={formData.goal_value}
              onChange={(e) => setFormData({ ...formData, goal_value: e.target.value })}
              required
              className="rounded-xl"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-full">
              Cancel
            </Button>
            <Button
              data-testid="create-habit-submit-btn"
              type="submit"
              disabled={loading}
              className="rounded-full"
            >
              {loading ? 'Creating...' : 'Create Habit'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
