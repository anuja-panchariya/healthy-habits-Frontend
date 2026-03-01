import React, { useState, useEffect, useCallback } from 'react'
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

  //  MOOD HELPER FUNCTIONS (UNCHANGED)
  const getMoodEmoji = (mood) => {
    const emojis = { great: '😄', good: '🙂', okay: '😐', bad: '☹️', terrible: '😢' }
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

  //  ESLINT FIXED - useCallback
  const analyzeMoodInsights = useCallback((history) => {
    if (!history.length) return []
    
    const goodMoods = history.filter(h => ['great', 'good'].includes(h.mood)).length
    const avgMoodScore = history.reduce((sum, h) => sum + getMoodScore(h.mood), 0) / history.length
    
    return [
      { emoji: '📈', title: `${Math.round((goodMoods/history.length)*100)}%`, value: 'Good Days', description: 'Percentage of positive mood days' },
      { emoji: '🔥', title: history.length, value: 'Mood Logs', description: 'Total mood entries tracked' },
      { emoji: '⚡', title: `${Math.round(avgMoodScore)}/5`, value: 'Avg Mood', description: 'Average mood score' }
    ]
  }, [])

  const logMood = async () => {
    if (!mood) { toast.error('Please select a mood'); return }
    setLoadingMood(true)
    try {
      const token = await getToken()
      setAuthToken(token)
      await api.post('/api/moods', { mood, notes: moodNotes, habitsImpact: detectHabitImpact(moodNotes) })
      
      const newEntry = { id: Date.now(), mood, habitImpact: detectHabitImpact(moodNotes), notes: moodNotes, date: new Date().toISOString() }
      setMoodHistory(prev => [newEntry, ...prev.slice(0, 19)])
      setInsights(analyzeMoodInsights([newEntry, ...moodHistory.slice(0, 19)]))
      toast.success('😊 Mood logged + habit insights analyzed!')
    } catch (error) {
      const newEntry = { id: Date.now(), mood, habitImpact: detectHabitImpact(moodNotes), notes: moodNotes, date: new Date().toISOString() }
      setMoodHistory(prev => [newEntry, ...prev.slice(0, 19)])
      localStorage.setItem(`mood_${Date.now()}`, JSON.stringify(newEntry))
      setInsights(analyzeMoodInsights([newEntry, ...moodHistory.slice(0, 19)]))
      toast.success('Mood saved locally with habit insights!')
    } finally {
      setLoadingMood(false)
      setMood('')
      setMoodNotes('')
    }
  }

  //  ESLINT FIXED useEffect
  useEffect(() => {
    const savedMoods = localStorage.getItem('moodHistory')
    if (savedMoods) {
      const history = JSON.parse(savedMoods).slice(-20)
      setMoodHistory(history)
      setInsights(analyzeMoodInsights(history))
    }
  }, [analyzeMoodInsights])

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="md:col-span-2">
      <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border-slate-700/50 shadow-2xl backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center text-slate-100 text-2xl font-light">
            <Smile className="w-6 h-6 mr-3" />
            Daily Mood Tracker
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mood Selection */}
          <div className="space-y-3">
            <Label className="text-lg font-medium text-slate-200">How are you feeling today?</Label>
            <Select value={mood} onValueChange={setMood}>
              <SelectTrigger className="rounded-xl h-14 text-lg bg-slate-800/50 border-slate-600 hover:bg-slate-800/70" data-testid="mood-select">
                <SelectValue placeholder="Select your mood..." />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700">
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
            <Label className="text-slate-200">What's on your mind?</Label>
            <Textarea
              placeholder="e.g., 'Great day! Exercise helped my energy, drank 3L water 💧'"
              value={moodNotes}
              onChange={(e) => setMoodNotes(e.target.value)}
              className="rounded-xl min-h-[100px] bg-slate-800/50 border-slate-600 hover:bg-slate-800/70 text-slate-100 placeholder-slate-400"
              data-testid="mood-notes-input"
            />
          </div>

          {/* Log Button */}
          <Button 
            onClick={logMood} 
            disabled={!mood || loadingMood}
            className="w-full h-14 rounded-full text-lg font-medium bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-xl" 
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

          {/*  DARK INSIGHTS */}
          {insights.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-4 p-8 rounded-2xl bg-gradient-to-r from-slate-800/70 to-slate-900/70 border border-slate-700/50 backdrop-blur-xl shadow-2xl"
            >
              <h4 className="font-semibold text-xl flex items-center text-slate-100">
                <Smile className="w-6 h-6 mr-3" />
                Your Mood Insights
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {insights.map((insight, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="group text-center p-6 rounded-2xl bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 hover:bg-slate-800/95 hover:shadow-2xl hover:border-emerald-500/50 transition-all duration-300"
                  >
                    <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{insight.emoji}</div>
                    <div className="font-black text-2xl bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-2">
                      {insight.title}
                    </div>
                    <div className="text-sm uppercase tracking-wider text-slate-300 font-semibold">{insight.value}</div>
                    <p className="text-xs text-slate-500 mt-2">{insight.description}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/*  DARK HISTORY */}
          {moodHistory.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-semibold text-xl flex items-center text-slate-100">
                Recent Moods
                <span className="ml-3 text-sm bg-slate-800/70 px-3 py-1.5 rounded-full text-slate-300 border border-slate-700 font-medium">
                  {moodHistory.length}
                </span>
              </h4>
              <div className="max-h-60 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
                {moodHistory.slice(0, 5).map((entry) => (
                  <motion.div
                    key={entry.id}
                    className="flex items-start p-5 rounded-2xl border border-slate-700/50 bg-slate-800/40 hover:bg-slate-800/60 backdrop-blur-sm hover:shadow-xl transition-all duration-300 group"
                  >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl flex-shrink-0 bg-gradient-to-br ${getMoodColor(entry.mood)} ring-2 ring-white/20`}>
                      <span className="text-2xl drop-shadow-lg">{getMoodEmoji(entry.mood)}</span>
                    </div>
                    <div className="ml-5 flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="font-semibold text-slate-100 text-lg drop-shadow-sm">
                          {getMoodEmoji(entry.mood)} {entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1)}
                        </span>
                        <Badge variant="secondary" className="text-xs bg-slate-700/50 border-slate-600 text-slate-300 px-3 py-1">
                          {entry.habitImpact}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-300 mb-2 line-clamp-2 leading-relaxed">{entry.notes}</p>
                      <p className="text-xs text-slate-500 font-medium bg-slate-800/50 px-2.5 py-1 rounded-full inline-block">
                        {formatDate(entry.date)}
                      </p>
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

