import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Smile } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { Badge } from '../components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { toast } from 'sonner'
import { useAuth } from '@clerk/clerk-react'
import { api, setAuthToken } from '../lib/api'

export default function MoodTracker() {
  const { getToken } = useAuth()
  const [mood, setMood] = useState('')
  const [moodNotes, setMoodNotes] = useState('')
  const [loadingMood, setLoadingMood] = useState(false)
  const [moodHistory, setMoodHistory] = useState([])
  const [insights, setInsights] = useState([])

  // 🔥 MOOD HELPER FUNCTIONS
  const getMoodEmoji = (mood) => {
    const emojis = {
      great: '😄', good: '🙂', okay: '😐', 
      bad: '☹️', terrible: '😢'
    }
    return emojis[mood] || '😐'
  }

  const getMoodColor = (mood) => {
    const colors = {
      great: 'from-emerald-400 to-green-500',
      good: 'from-blue-400 to-cyan-500',
      okay: 'from-yellow-400 to-orange-500',
      bad: 'from-orange-500 to-red-500',
      terrible: 'from-red-500 to-pink-600'
    }
    return colors[mood] || 'from-gray-400 to-gray-500'
  }

  const getMoodScore = (mood) => {
    const scores = { great: 5, good: 4, okay: 3, bad: 2, terrible: 1 }
    return scores[mood] || 3
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', { 
      weekday: 'short', month: 'short', day: 'numeric' 
    })
  }

  const detectHabitImpact = (notes) => {
    const habitKeywords = {
      exercise: ['exercise', 'gym', 'workout', 'run', 'walk', 'yoga'],
      water: ['water', 'hydrate', 'drank', 'drink'],
      sleep: ['sleep', 'rest', 'bed', 'tired', 'energy'],
      meditate: ['meditate', 'mindful', 'zen', 'calm', 'peace']
    }
    
    const lowerNotes = notes.toLowerCase()
    for (const [category, keywords] of Object.entries(habitKeywords)) {
      if (keywords.some(kw => lowerNotes.includes(kw))) {
        return `${category.charAt(0).toUpperCase() + category.slice(1)} helped today`
      }
    }
    return 'General reflection'
  }

  const analyzeMoodInsights = (history) => {
    if (!history.length) return []
    
    const goodMoods = history.filter(h => ['great', 'good'].includes(h.mood)).length
    const avgMoodScore = history.reduce((sum, h) => sum + getMoodScore(h.mood), 0) / history.length
    
    return [
      {
        emoji: '📈',
        title: `${Math.round((goodMoods/history.length)*100)}%`,
        value: 'Good Days',
        description: 'Percentage of positive mood days'
      },
      {
        emoji: '🔥',
        title: history.length,
        value: 'Mood Logs',
        description: 'Total mood entries tracked'
      },
      {
        emoji: '⚡',
        title: `${Math.round(avgMoodScore)}/5`,
        value: 'Avg Mood',
        description: 'Average mood score'
      }
    ]
  }

  // ENHANCED logMood with analytics
  const logMood = async () => {
    if (!mood) {
      toast.error('Please select a mood')
      return
    }
    setLoadingMood(true)
    try {
      const token = await getToken()
      setAuthToken(token)
      
      const response = await api.post('/api/moods', { 
        mood, 
        notes: moodNotes,
        habitsImpact: detectHabitImpact(moodNotes) 
      })
      
      const newEntry = {
        id: Date.now(),
        mood,
        habitImpact: detectHabitImpact(moodNotes),
        notes: moodNotes,
        date: new Date().toISOString()
      }
      
      setMoodHistory(prev => [newEntry, ...prev.slice(0, 19)])
      setInsights(analyzeMoodInsights([newEntry, ...moodHistory.slice(0, 19)]))
      
      toast.success('😊 Mood logged + habit insights analyzed!')
      setMood('')
      setMoodNotes('')
    } catch (error) {
      const newEntry = {
        id: Date.now(),
        mood,
        habitImpact: detectHabitImpact(moodNotes),
        notes: moodNotes,
        date: new Date().toISOString()
      }
      setMoodHistory(prev => [newEntry, ...prev.slice(0, 19)])
      localStorage.setItem(`mood_${Date.now()}`, JSON.stringify(newEntry))
      setInsights(analyzeMoodInsights([newEntry, ...moodHistory.slice(0, 19)]))
      toast.success('Mood saved locally with habit insights!')
      setMood('')
      setMoodNotes('')
    } finally {
      setLoadingMood(false)
    }
  }

  useEffect(() => {
    const savedMoods = localStorage.getItem('moodHistory')
    if (savedMoods) {
      const history = JSON.parse(savedMoods).slice(-20)
      setMoodHistory(history)
      setInsights(analyzeMoodInsights(history))
    }
  }, [])

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="md:col-span-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Smile className="w-5 h-5 mr-2" />
            Daily Mood Tracker
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mood Selection */}
          <div className="space-y-3">
            <Label className="text-lg font-medium">How are you feeling today?</Label>
            <Select value={mood} onValueChange={setMood}>
              <SelectTrigger className="rounded-xl h-14 text-lg" data-testid="mood-select">
                <SelectValue placeholder="Select your mood..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="great">😄 Great</SelectItem>
                <SelectItem value="good">🙂 Good</SelectItem>
                <SelectItem value="okay">😐 Okay</SelectItem>
                <SelectItem value="bad">☹️ Bad</SelectItem>
                <SelectItem value="terrible">😢 Terrible</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>What's on your mind?</Label>
            <Textarea
              placeholder="e.g., 'Great day! Exercise helped my energy, drank 3L water 💧'"
              value={moodNotes}
              onChange={(e) => setMoodNotes(e.target.value)}
              className="rounded-xl min-h-[100px]"
              data-testid="mood-notes-input"
            />
          </div>

          {/* Log Button */}
          <Button 
            onClick={logMood} 
            disabled={!mood || loadingMood}
            className="w-full h-14 rounded-full text-lg font-medium" 
            data-testid="log-mood-btn"
          >
            {loadingMood ? (
              <span className="flex items-center">
                <Smile className="w-5 h-5 mr-2 animate-pulse" />
                Logging...
              </span>
            ) : (
              <span className="flex items-center">
                <Smile className="w-5 h-5 mr-2" />
                Log Today's Mood
              </span>
            )}
          </Button>

          {/* Insights */}
          {insights.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-3 p-6 rounded-2xl bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200"
            >
              <h4 className="font-semibold text-lg flex items-center">
                <Smile className="w-5 h-5 mr-2" />
                Your Mood Insights
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {insights.map((insight, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="text-center p-4 rounded-xl bg-white/50 backdrop-blur-sm border"
                  >
                    <div className="text-2xl mb-1">{insight.emoji}</div>
                    <div className="font-bold text-xl text-emerald-600 mb-1">{insight.title}</div>
                    <div className="text-xs uppercase tracking-wide text-emerald-700 font-medium">{insight.value}</div>
                    <p className="text-xs text-muted-foreground mt-1">{insight.description}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Recent History */}
          {moodHistory.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-lg flex items-center">
                Recent Moods
                <span className="ml-2 text-xs bg-muted px-2 py-1 rounded-full">
                  {moodHistory.length}
                </span>
              </h4>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {moodHistory.slice(0, 5).map((entry) => (
                  <motion.div
                    key={entry.id}
                    className="flex items-start p-4 rounded-xl border bg-card/50 hover:bg-card hover:shadow-sm"
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0 bg-gradient-to-br ${getMoodColor(entry.mood)}`}>
                      <span className="text-2xl">{getMoodEmoji(entry.mood)}</span>
                    </div>
                    <div className="ml-4 flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium">{getMoodEmoji(entry.mood)} {entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1)}</span>
                        <Badge variant="outline" className="text-xs">{entry.habitImpact}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1 line-clamp-2">{entry.notes}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(entry.date)}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
