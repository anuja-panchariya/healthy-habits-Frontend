import React, { useEffect, useState, useCallback } from 'react'
import { getHabits, createHabit } from '../lib/api'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Label } from '../components/ui/label'
import { Badge } from '../components/ui/badge'
import { toast } from 'sonner'
import { Plus, Check, Target, Calendar, Flame } from 'lucide-react'
import { useTheme } from 'next-themes' // ✅ DARK MODE

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
  const { theme } = useTheme()

  // ✅ FIXED LOAD + REFRESH
  const loadHabits = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getHabits()
      console.log('🔥 API DATA:', data)
      setHabits(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('API Error:', error)
      setHabits([]) // Always empty if API fails
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadHabits()
  }, [loadHabits])

  // ✅ FIXED CREATE - 3 STEP PROCESS
  const handleCreateHabit = async (e) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error('Habit name required!')
      return
    }

    // ✅ STEP 1: Show loading
    toast.loading('Creating habit...')
    
    try {
      // ✅ STEP 2: API CALL FIRST
      const result = await createHabit({
        name: formData.name.trim(),
        category: formData.category,
        goal: formData.goal,
        goalType: formData.goalType
      })
      
      console.log('✅ CREATE RESULT:', result)
      
      // ✅ STEP 3: RELOAD DATA (guaranteed fresh)
      await loadHabits()
      
      toast.success('Habit created! 🎉')
      
      // ✅ RESET FORM
      setFormData({ name: '', category: 'fitness', goal: 1, goalType: 'daily' })
      setShowCreate(false)
      
    } catch (error) {
      console.error('CREATE ERROR:', error)
      toast.error('Failed to create habit')
    }
  }

  const logHabit = async (habitId) => {
    // TODO: Add log API later
    setHabits(prev => prev.map(habit => 
      habit.id === habitId 
        ? { ...habit, logs: [...(habit.logs || []), new Date().toISOString()] }
        : habit
    ))
    toast.success('Habit logged! ✅')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto"></div>
          <p className="text-lg">Loading your habits...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen p-6 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gradient-to-br from-slate-50 to-blue-50 text-gray-900'}`}>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* HEADER - MATCHES YOUR SCREENSHOT */}
        <div className="flex justify-between items-center pb-8 border-b border-border/50">
          <div>
            <h1 className="text-4xl md:text-5xl font-light font-serif tracking-tight">
              Your Habits
            </h1>
            <p className={`mt-2 text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-muted-foreground'}`}>
              {habits.length} habits active
            </p>
          </div>
          <Button 
            onClick={() => setShowCreate(true)}
            className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground rounded-2xl px-8 py-4 h-auto font-medium shadow-lg hover:shadow-xl transition-all text-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Habit
          </Button>
        </div>

        {/* HABITS LIST */}
        {habits.length === 0 ? (
          <Card className={`text-center py-20 border-0 shadow-2xl ${theme === 'dark' ? 'bg-gray-800/50 backdrop-blur-sm' : 'bg-white/80 backdrop-blur-sm'}`}>
            <CardContent className="space-y-6">
              <div className={`w-28 h-28 rounded-3xl flex items-center justify-center mx-auto text-4xl shadow-2xl ${theme === 'dark' ? 'bg-gradient-to-br from-blue-500/20 to-indigo-500/20' : 'bg-gradient-to-br from-blue-100 to-indigo-100'}`}>
                🎯
              </div>
              <div>
                <h3 className="text-3xl font-bold mb-3">No habits yet</h3>
                <p className={`text-xl ${theme === 'dark' ? 'text-gray-400' : 'text-muted-foreground'}`}>
                  Start tracking fitness, hydration, sleep, meditation and more!
                </p>
              </div>
              <Button className="text-lg px-12 h-14 rounded-2xl font-semibold shadow-xl" onClick={() => setShowCreate(true)}>
                Create First Habit
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {habits.map((habit) => {
              const progress = Math.min((habit.logs?.length || 0) / (habit.goal || 1) * 100, 100)
              
              return (
                <Card key={habit.id} className={`hover:shadow-2xl transition-all border-0 shadow-xl overflow-hidden ${theme === 'dark' ? 'bg-gray-800/70 backdrop-blur-sm' : 'bg-white/80 backdrop-blur-sm'}`}>
                  <CardContent className="p-0">
                    <div className="p-8">
                      <div className="flex items-start justify-between gap-6">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold shadow-xl flex-shrink-0 ${theme === 'dark' ? 'bg-gradient-to-br from-blue-500/30 to-indigo-500/30 text-blue-200' : 'bg-gradient-to-br from-blue-500/20 to-indigo-500/20 text-blue-600'}`}>
                            {CATEGORIES.find(c => c.id === habit.category)?.icon || '🎯'}
                          </div>
                          <div className="space-y-2">
                            <h3 className="text-2xl font-bold truncate">{habit.name}</h3>
                            <div className="flex items-center gap-3 flex-wrap">
                              <Badge variant="secondary" className="text-lg px-4 py-2 h-auto">
                                {CATEGORIES.find(c => c.id === habit.category)?.label || 'General'}
                              </Badge>
                              <Badge variant="outline" className="text-lg px-4 py-2 h-auto">
                                {habit.logs?.length || 0}/{habit.goal}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        <Button 
                          onClick={() => logHabit(habit.id)}
                          className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-emerald-foreground rounded-xl px-8 py-3 font-semibold shadow-lg hover:shadow-xl whitespace-nowrap flex-shrink-0 ml-auto"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Log Today
                        </Button>
                      </div>
                    </div>

                    {/* PROGRESS BAR */}
                    <div className={`p-8 pt-0 ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gradient-to-r from-emerald-50 to-emerald-100'}`}>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-xl font-semibold flex items-center gap-2">
                          <Flame className="w-5 h-5" />
                          Progress
                        </span>
                        <Badge className="text-xl px-4 py-2 font-bold shadow-lg">
                          {Math.round(progress)}%
                        </Badge>
                      </div>
                      
                      <div className="w-full bg-gray-200/50 rounded-2xl h-6 overflow-hidden shadow-inner backdrop-blur-sm">
                        <div 
                          className="h-6 bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 rounded-2xl shadow-lg transition-all duration-1000 relative overflow-hidden"
                          style={{ width: `${progress}%` }}
                        >
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-white drop-shadow-lg whitespace-nowrap">
                            {habit.logs?.length || 0}/{habit.goal}
                          </div>
                        </div>
                      </div>

                      {/* GOAL DISPLAY */}
                      <div className="mt-6 p-4 bg-white/50 dark:bg-gray-800/50 rounded-2xl backdrop-blur-sm border border-border/50">
                        <div className="flex items-center justify-center gap-2 text-lg font-semibold text-muted-foreground">
                          <Target className="w-5 h-5" />
                          <span>{habit.goal} {habit.goalType}</span>
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
          <DialogContent className="sm:max-w-2xl p-0 max-h-[90vh] overflow-y-auto">
            <Card className={`border-0 shadow-2xl overflow-hidden ${theme === 'dark' ? 'bg-gray-900/95' : 'bg-white/95'}`}>
              <CardHeader className={`p-8 text-center ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gradient-to-r from-blue-50 to-indigo-50'}`}>
                <DialogTitle className="text-3xl font-light font-serif">
                  Create New Habit
                </DialogTitle>
                <DialogDescription className="mt-2">
                  Track fitness, hydration, sleep, meditation and more
                </DialogDescription>
              </CardHeader>
              
              <CardContent className="p-8">
                <form onSubmit={handleCreateHabit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="lg:col-span-2 space-y-2">
                    <Label className="text-lg font-semibold">Habit Name</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="e.g., Drink 8 glasses water daily"
                      className="h-16 text-lg rounded-2xl shadow-inner"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-lg font-semibold">Category</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                      <SelectTrigger className="h-16 rounded-2xl shadow-inner">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(cat => (
                          <SelectItem key={cat.id} value={cat.id} className="text-lg h-14">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{cat.icon}</span>
                              {cat.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-lg font-semibold">Goal Type</Label>
                    <Select value={formData.goalType} onValueChange={(value) => setFormData({...formData, goalType: value})}>
                      <SelectTrigger className="h-16 rounded-2xl shadow-inner">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-lg font-semibold">Goal Amount</Label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.goal}
                      onChange={(e) => setFormData({...formData, goal: parseInt(e.target.value) || 1})}
                      className="h-16 text-lg rounded-2xl shadow-inner"
                    />
                  </div>

                  <div className="lg:col-span-2 flex gap-4 pt-6">
                    <Button type="submit" className="flex-1 h-16 rounded-2xl text-lg font-semibold shadow-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700">
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
