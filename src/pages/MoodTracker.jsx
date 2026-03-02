import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Smile, TrendingUp } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { Badge } from '../components/ui/badge'
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

  // Helper functions (same)
  const getMoodEmoji = (mood) => ({ great: '😄', good: '🙂', okay: '😐', bad: '☹️', terrible: '😢' }[mood] || '😐')
  const getMoodColor = (mood) => ({
    great: 'from-emerald-400 to-green-500',
    good: 'from-blue-400 to-cyan-500',
    okay: 'from-yellow-400 to-orange-500',
    bad: 'from-orange-500 to-red-500',
    terrible: 'from-red-500 to-pink-600'
  }[mood] || 'from-gray-400 to-gray-500')
  
  const getMoodScore = (mood) => ({ great: 5, good: 4, okay: 3, bad: 2, terrible: 1 }[mood] || 3)
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })

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
    
    const newEntry = {
      id: Date.now(),
      mood,
      habitImpact: detectHabitImpact(moodNotes),
      notes: moodNotes,
      date: new Date().toISOString()
    }
    
    try {
      const token = await getToken()
      setAuthToken(token)
      await api.post('/api/moods', { mood, notes: moodNotes, habitsImpact: newEntry.habitImpact })
      setMoodHistory(prev => [newEntry, ...prev.slice(0, 19)])
      setInsights(analyzeMoodInsights([newEntry, ...moodHistory.slice(0, 19)]))
      toast.success('😊 Mood logged successfully!')
    } catch (error) {
      setMoodHistory(prev => [newEntry, ...prev.slice(0, 19)])
      localStorage.setItem('moodHistory', JSON.stringify([newEntry, ...moodHistory]))
      setInsights(analyzeMoodInsights([newEntry, ...moodHistory.slice(0, 19)]))
      toast.success('Mood saved locally!')
    } finally {
      setLoadingMood(false)
      setMood('')
      setMoodNotes('')
    }
  }

  useEffect(() => {
    const savedMoods = localStorage.getItem('moodHistory')
    if (savedMoods) {
      const history = JSON.parse(savedMoods).slice(-20)
      setMoodHistory(history)
      setInsights(analyzeMoodInsights(history))
    }
  }, [analyzeMoodInsights])

  useEffect(() => {
    localStorage.setItem('moodHistory', JSON.stringify(moodHistory))
  }, [moodHistory])

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="md:col-span-2">
      <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 border-emerald-200 dark:border-emerald-800 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <Smile className="w-7 h-7 mr-3 text-emerald-600 dark:text-emerald-400" />
            Daily Mood Tracker
          </CardTitle>
          <p className="text-emerald-700 dark:text-emerald-300 text-sm font-medium">
            Track how your habits impact mental well-being ✨
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/*  EMERALD EMOJI BUTTONS */}
          <div className="p-6 rounded-2xl bg-white/70 dark:bg-emerald-900/40 backdrop-blur-sm border border-emerald-200/50 dark:border-emerald-700/50">
            <Label className="text-xl font-semibold text-emerald-900 dark:text-emerald-200 mb-4 block">
              How are you feeling today?
            </Label>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { value: 'great', emoji: '😄', label: 'Great', color: 'from-emerald-500 to-green-500' },
                { value: 'good', emoji: '🙂', label: 'Good', color: 'from-emerald-400 to-teal-500' },
                { value: 'okay', emoji: '😐', label: 'Okay', color: 'from-amber-400 to-orange-500' },
                { value: 'bad', emoji: '☹️', label: 'Bad', color: 'from-orange-500 to-red-500' },
                { value: 'terrible', emoji: '😢', label: 'Terrible', color: 'from-red-500 to-rose-600' }
              ].map(({ value, emoji, label, color }) => (
                <motion.button
                  key={value}
                  onClick={() => setMood(value)}
                  className={`group p-5 rounded-xl border-2 shadow-md hover:shadow-emerald-500/25 transition-all duration-300 h-28 ${
                    mood === value
                      ? `bg-gradient-to-br ${color} text-white border-transparent shadow-lg ring-4 ring-emerald-200/50 dark:ring-emerald-500/30`
                      : 'border-emerald-300/50 dark:border-emerald-600/50 bg-white/80 dark:bg-emerald-900/30 hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-800/50'
                  }`}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{emoji}</div>
                  <div className="font-bold text-sm tracking-wide">{label}</div>
                </motion.button>
              ))}
            </div>

            {/* NOTES + BUTTON */}
            <div className="flex gap-4 mt-6">
              <Textarea
                placeholder="What made you feel this way? (exercise, sleep, water...)"
                value={moodNotes}
                onChange={(e) => setMoodNotes(e.target.value)}
                className="flex-1 rounded-xl min-h-[90px] focus-visible:ring-2 focus-visible:ring-emerald-500 border-emerald-300 dark:border-emerald-600 bg-white/90 dark:bg-emerald-900/50"
              />
              <Button 
                onClick={logMood} 
                disabled={!mood || loadingMood}
                className="h-[90px] rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 px-8 shadow-lg whitespace-nowrap font-semibold"
              >
                {loadingMood ? (
                  <>
                    <Smile className="w-5 h-5 mr-2 animate-spin" />
                    Logging...
                  </>
                ) : (
                  <>
                    <Smile className="w-5 h-5 mr-2" />
                    Log Mood
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* INSIGHTS - Screenshot Style */}
          {insights.length > 0 && (
            <div>
              <h3 className="flex items-center gap-2 text-xl font-bold text-emerald-900 dark:text-emerald-100 mb-6">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
                Habit Impact Analysis
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {insights.map((insight, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="group p-6 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/60 dark:to-teal-900/60 backdrop-blur-sm border border-emerald-200/50 dark:border-emerald-700/50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">{insight.emoji}</div>
                    <div className="font-bold text-2xl text-emerald-900 dark:text-emerald-100 mb-2 group-hover:text-emerald-800">
                      {insight.title}
                    </div>
                    <div className="text-4xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-3">
                      {insight.value}
                    </div>
                    <p className="text-sm text-emerald-700 dark:text-emerald-300">{insight.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/*  HISTORY - Clean List */}
          {moodHistory.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-lg font-semibold text-emerald-900 dark:text-emerald-100 mb-4">
                <TrendingUp className="w-5 h-5" />
                Recent Moods
                <Badge className="ml-auto bg-emerald-100 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-200">
                  {moodHistory.length}
                </Badge>
              </div>
              
              <div className="max-h-56 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-emerald-300 dark:scrollbar-thumb-emerald-600">
                {moodHistory.slice(0, 6).map((entry) => (
                  <motion.div
                    key={entry.id}
                    className="flex items-center p-4 rounded-xl bg-white/80 dark:bg-emerald-900/50 backdrop-blur-sm border border-emerald-200/50 dark:border-emerald-700/50 hover:shadow-md transition-all group"
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0 ${getMoodColor(entry.mood).replace('from-', 'to-')} text-white font-bold text-xl`}>
                      {getMoodEmoji(entry.mood)}
                    </div>
                    <div className="flex-1 min-w-0 ml-4">
                      <div className="font-semibold text-emerald-900 dark:text-emerald-100 truncate">
                        {entry.habitImpact}
                      </div>
                      <div className="text-sm text-emerald-700 dark:text-emerald-300 truncate">
                        {entry.notes || 'Quick check-in'}
                      </div>
                    </div>
                    <Badge variant="outline" className="ml-3 px-3 py-1 border-emerald-300 dark:border-emerald-600 text-emerald-800 dark:text-emerald-200">
                      {entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1)}
                    </Badge>
                    <div className="ml-3 text-xs text-emerald-600 dark:text-emerald-400 font-mono">
                      {formatDate(entry.date)}
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
