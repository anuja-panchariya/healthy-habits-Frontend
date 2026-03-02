import React, { useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { toast } from 'sonner'

export default function CreateHabitDialog({ open, onClose, onSuccess }) {
  const { getToken } = useAuth()
  const [formData, setFormData] = useState({
    name: '',        // ✅ Backend expect 'name' NOT 'title'
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
      const API_URL = window.ENV?.VITE_API_URL || 'https://healthy-habits-be-1.onrender.com/api'
      
      console.log('📤 Creating habit:', formData)  // DEBUG
      
      const response = await fetch(`${API_URL}/habits`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)  // ✅ name, category match backend
      })
      
      console.log('📡 Response:', response.status)  // DEBUG
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }
      
      const result = await response.json()
      console.log('✅ Habit created:', result)
      
      toast.success('✅ Habit created successfully!')
      setFormData({ name: '', category: '', goal_type: 'daily', goal_value: '1' })
      onSuccess?.()  // Refresh habits list
      onClose()
      
    } catch (error) {
      console.error('💥 Create error:', error)
      toast.error(`Failed to create habit: ${error.message}`)
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
            <Label htmlFor="name">Habit Name</Label>
            <Input
              id="name"                    // ✅ Changed from 'title'
              data-testid="habit-name-input"
              placeholder="e.g., Morning meditation"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
              className="rounded-full bg-emerald-500 hover:bg-emerald-600"
            >
              {loading ? 'Creating...' : 'Create Habit'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
