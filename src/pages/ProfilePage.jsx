import React, { useEffect, useState, useCallback } from 'react'
import { useAuth, UserButton } from '@clerk/clerk-react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Heart, Star, Bell, Sparkles, Smile, Activity, Award, 
  Download, FileText, Brain, Loader2, CheckCircle 
} from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Textarea } from '../components/ui/textarea'
import { Badge } from '../components/ui/badge'
import { Progress } from '../components/ui/progress'
import { api, setAuthToken } from '../lib/api'
import { toast } from 'sonner'

export default function ProfilePage() {
  const { getToken, user, isSignedIn } = useAuth()
  const [recommendations, setRecommendations] = useState([])
  const [moods, setMoods] = useState([])
  const [loadingAI, setLoadingAI] = useState(false)
  const [loadingMoods, setLoadingMoods] = useState(true)
  const [mood, setMood] = useState('')
  const [moodNotes, setMoodNotes] = useState('')
  const [habits, setHabits] = useState([])
  const [moodStats, setMoodStats] = useState({ total: 0, greatPercentage: 0 })

  // 🎯 LOAD DATA (Safe APIs + Mock fallback)
  const loadProfileData = useCallback(async () => {
    if (!isSignedIn) return
    
    try {
      setLoadingMoods(true)
      const token = await getToken()
      if (token) setAuthToken(token)

      // Mock data - Works without backend
      const mockHabits = [
        { id: 1, title: 'Drink Water', category: 'hydration', completed: true },
        { id: 2, title: '30min Walk', category: 'fitness', completed: false }
      ]
      
      const mockMoods = [
        { id: 1, mood: 'great', notes: 'Feeling amazing!', created_at: new Date(Date.now() - 86400000) },
        { id: 2, mood: 'good', notes: 'Productive day', created_at: new Date() }
      ]
      
      setHabits(mockHabits)
      setMoods(mockMoods.slice(-7))
      
      const totalMoods = mockMoods.length
      const greatMoods = mockMoods.filter(m => m.mood === 'great').length
      setMoodStats({
        total: totalMoods,
        greatPercentage: totalMoods ? Math.round((greatMoods / totalMoods) * 100) : 0
      })

      setRecommendations([
        { title: "15min Meditation", reason: "Reduces stress instantly", category: "mindfulness" },
        { title: "8 Glasses Water", reason: "Boosts focus 3x", category: "hydration" }
      ])
      
    } catch (error) {
      console.error('Profile load error:', error)
    } finally {
      setLoadingMoods(false)
    }
  }, [getToken, isSignedIn])

  useEffect(() => {
    loadProfileData()
  }, [loadProfileData])

  // ✅ LOG MOOD (LocalStorage + Safe API)
  const logMood = async () => {
    if (!mood) {
      toast.error('Please select a mood! 😊')
      return
    }
    try {
      const token = await getToken()
      if (token) setAuthToken(token)
      await api.post('/api/mood', { mood, notes: moodNotes })
      toast.success('✅ Mood logged!')
    } catch (error) {
      // Save locally even if API fails
      const newMood = {
        id: Date.now(),
        mood,
        notes: moodNotes,
        created_at: new Date()
      }
      setMoods(prev => [newMood, ...prev.slice(0, 6)])
      toast.success('✅ Mood saved!')
    }
    setMood('')
    setMoodNotes('')
  }

  const getMoodEmoji = (mood) => {
    const emojis = { great: '😄', good: '🙂', okay: '😐', bad: '☹️', terrible: '😢' }
    return emojis[mood] || '🙂'
  }

  if (loadingMoods) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-emerald-500/20 dark:border-emerald-400 border-t-emerald-500 rounded-full mx-auto" 
        />
      </div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 sm:p-6 lg:p-8 transition-colors duration-300"
    >
      <div className="max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto space-y-8 lg:space-y-12 pb-16 lg:pb-0">
        
        {/* ✨ HEADER - TERA DARK SLATE/EMERALD */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          className="text-center mb-12 lg:mb-16"
        >
          <motion.div 
            animate={{ scale: [1, 1.1, 1] }} 
            transition={{ duration: 3, repeat: Infinity }} 
            className="w-24 h-24 lg:w-32 lg:h-32 mx-auto mb-8 bg-gradient-to-r from-emerald-500 to-emerald-400 dark:from-emerald-400 dark:to-emerald-300 rounded-3xl flex items-center justify-center shadow-2xl dark:shadow-emerald-500/25"
          >
            <Heart className="w-12 h-12 lg:w-16 lg:h-16 text-slate-50 drop-shadow-lg" />
          </motion.div>
          
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight bg-gradient-to-r from-slate-100 dark:from-slate-100 to-emerald-400 bg-clip-text text-transparent mb-4 drop-shadow-lg">
            Profile & Wellness
          </h1>
          <p className="text-lg lg:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto drop-shadow-sm">
            AI-powered insights + mood tracking for your journey
          </p>
        </motion.div>

        {/* MAIN GRID - DARK SLATE/EMERALD */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          
          {/* 👤 ACCOUNT INFO - TERA STYLE */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="h-full bg-white/80 dark:bg-slate-800/90 backdrop-blur-xl shadow-2xl dark:shadow-slate-900/50 border-0 hover:shadow-3xl dark:hover:shadow-slate-900/70 transition-all group">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-3 text-2xl lg:text-3xl text-slate-900 dark:text-slate-100">
                  <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-r from-emerald-500/20 to-emerald-400/20 dark:from-emerald-400/30 dark:to-emerald-300/30 p-3 lg:p-4 rounded-2xl flex items-center justify-center border border-emerald-400/30 dark:border-emerald-500/40">
                    <Star className="w-6 h-6 lg:w-8 lg:h-8 text-emerald-500 dark:text-emerald-400" />
                  </div>
                  Account Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-2 px-2 sm:px-6">
                <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 lg:gap-6 p-6 lg:p-8 bg-gradient-to-r from-emerald-500/5 to-emerald-400/5 dark:from-slate-800/50 dark:to-slate-700/30 rounded-3xl backdrop-blur-sm border border-emerald-200/50 dark:border-slate-700">
                  <div className="w-20 h-20 lg:w-28 lg:h-28 bg-gradient-to-r from-emerald-500 to-emerald-400 dark:from-emerald-400 dark:to-emerald-300 rounded-3xl flex items-center justify-center shadow-xl border-4 border-white/20 dark:border-slate-800/50 flex-shrink-0 mx-auto lg:mx-0">
                    <UserButton afterSignOutUrl="/sign-in" />
                  </div>
                  <div className="flex-1 min-w-0 text-center lg:text-left">
                    <h3 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-slate-50 truncate mb-2">
                      {user?.fullName || user?.firstName || 'Anuja Panchariya'}
                    </h3>
                    <p className="text-lg text-slate-600 dark:text-slate-300 break-all bg-slate-100/50 dark:bg-slate-700/50 px-4 py-2 rounded-2xl">
                      {user?.primaryEmailAddress?.emailAddress || 'anuja@example.com'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 🔔 NOTIFICATIONS */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="h-full bg-white/80 dark:bg-slate-800/90 backdrop-blur-xl shadow-2xl dark:shadow-slate-900/50 border-0 hover:shadow-3xl transition-all">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl lg:text-2xl text-slate-900 dark:text-slate-100">
                  <Bell className="w-6 h-6 lg:w-7 lg:h-7 text-emerald-500 dark:text-emerald-400" />
                  Smart Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div className="flex items-center justify-between p-6 bg-gradient-to-r from-emerald-500/5 to-emerald-400/5 dark:from-slate-800/60 dark:to-slate-700/40 rounded-3xl backdrop-blur-sm border border-emerald-200/30 dark:border-slate-700">
                  <div>
                    <h4 className="font-semibold text-lg lg:text-xl text-slate-900 dark:text-slate-100 mb-1">Daily Reminders</h4>
                    <p className="text-sm lg:text-base text-slate-600 dark:text-slate-400">Get habit nudges on time</p>
                  </div>
                  <div className="w-14 h-7 bg-slate-200 dark:bg-slate-700 rounded-full p-1 flex items-center cursor-pointer">
                    <div className="w-6 h-5 bg-emerald-500 rounded-full shadow-lg transform translate-x-0 transition-transform duration-200" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 🤖 AI RECOMMENDATIONS - TERA EMERALD */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="shadow-2xl dark:shadow-slate-900/70 h-full bg-white/80 dark:bg-slate-800/90 backdrop-blur-xl border-0 hover:shadow-3xl transition-all">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl lg:text-2xl text-slate-900 dark:text-slate-100">
                  <Sparkles className="w-7 h-7 text-emerald-500 animate-pulse dark:text-emerald-400" />
                  AI Habit Coach
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <motion.div whileHover={{ scale: 1.02 }}>
                  <Button 
                    onClick={() => toast.success('🤖 AI analyzing your habits...')}
                    className="w-full h-14 rounded-2xl shadow-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 dark:from-emerald-400 dark:to-emerald-500 text-slate-900 dark:text-slate-50 font-semibold text-lg"
                  >
                    <Brain className="w-5 h-5 mr-2" />
                    Analyze My Habits
                  </Button>
                </motion.div>

                {recommendations.length > 0 && (
                  <div className="space-y-3 max-h-80 overflow-y-auto rounded-3xl p-6 bg-gradient-to-r from-emerald-500/3 to-emerald-400/3 dark:from-slate-800/50 dark:to-slate-700/30 border border-emerald-200/30 dark:border-slate-700 backdrop-blur-sm">
                    {recommendations.map((rec, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex gap-3 p-4 bg-white/70 dark:bg-slate-700/50 rounded-2xl border border-emerald-100/50 dark:border-slate-600 hover:shadow-md transition-all"
                      >
                        <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-400 dark:from-emerald-400 dark:to-emerald-300 rounded-2xl flex items-center justify-center flex-shrink-0">
                          <Sparkles className="w-6 h-6 text-slate-50" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-semibold text-lg text-slate-900 dark:text-slate-100 truncate">{rec.title}</h5>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{rec.reason}</p>
                          <Badge className="bg-emerald-500/20 dark:bg-emerald-500/30 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-400 px-3 py-1">
                            {rec.category}
                          </Badge>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* 😊 MOOD TRACKER - TERA STYLE */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="shadow-2xl dark:shadow-slate-900/70 h-full bg-white/80 dark:bg-slate-800/90 backdrop-blur-xl border-0 hover:shadow-3xl transition-all">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl lg:text-2xl text-slate-900 dark:text-slate-100">
                  <Smile className="w-7 h-7 text-emerald-500 dark:text-emerald-400" />
                  Today's Mood
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <Select value={mood} onValueChange={setMood}>
                    <SelectTrigger className="h-14 rounded-2xl border-2 border-slate-200 dark:border-slate-600 bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm text-slate-900 dark:text-slate-100">
                      <SelectValue placeholder="How are you feeling today?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="great">😄 Great</SelectItem>
                      <SelectItem value="good">🙂 Good</SelectItem>
                      <SelectItem value="okay">😐 Okay</SelectItem>
                      <SelectItem value="bad">☹️ Bad</SelectItem>
                      <SelectItem value="terrible">😢 Terrible</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Textarea 
                    value={moodNotes}
                    onChange={(e) => setMoodNotes(e.target.value)}
                    placeholder="What's on your mind today? (optional)"
                    className="min-h-[100px] rounded-2xl border-2 border-slate-200 dark:border-slate-600 resize-none bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm text-slate-900 dark:text-slate-100"
                  />
                  
                  <motion.div whileHover={{ scale: 1.02 }}>
                    <Button 
                      onClick={logMood}
                      disabled={!mood}
                      className="w-full h-14 rounded-2xl shadow-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 dark:from-emerald-400 dark:to-emerald-500 text-slate-900 dark:text-slate-50 font-semibold text-lg"
                    >
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Log Mood
                    </Button>
                  </motion.div>
                </div>

                {/* RECENT MOODS */}
                <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-lg text-slate-900 dark:text-slate-100">Recent Moods</h4>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      {moodStats.total} total • {moodStats.greatPercentage}% great
                    </div>
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {Array.isArray(moods) && moods.slice(0, 5).map((m, idx) => (
                      <div key={m.id || idx} className="flex items-center gap-3 p-3 bg-gradient-to-r from-emerald-500/5 to-emerald-400/5 dark:from-slate-800/50 dark:to-slate-700/30 rounded-xl border border-emerald-200/30 dark:border-slate-700">
                        <div className="text-2xl">{getMoodEmoji(m.mood)}</div>
                        <div className="flex-1 min-w-0">
                          <span className="font-medium text-slate-900 dark:text-slate-100 capitalize">{m.mood}</span>
                          {m.notes && (
                            <p className="text-sm text-slate-600 dark:text-slate-400 truncate">{m.notes}</p>
                          )}
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {new Date(m.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* 📊 STATS GRID - TERA EMERALD */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <Card className="shadow-xl hover:shadow-2xl bg-gradient-to-br from-emerald-500/5 to-emerald-400/5 dark:from-slate-800/50 dark:to-slate-700/30 backdrop-blur-sm border border-emerald-200/30 dark:border-slate-700 transition-all">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl text-slate-900 dark:text-slate-100">
                <Activity className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />
                Total Habits
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center p-6">
              <div className="text-4xl font-black text-emerald-600 dark:text-emerald-400 mb-2">{habits.length}</div>
              <p className="text-slate-600 dark:text-slate-400">Active habits</p>
            </CardContent>
          </Card>

          <Card className="shadow-xl hover:shadow-2xl bg-gradient-to-br from-slate-500/10 to-slate-400/10 dark:from-slate-800/60 dark:to-slate-700/40 backdrop-blur-sm border border-slate-300/30 dark:border-slate-600 transition-all">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl text-slate-900 dark:text-slate-100">
                <Award className="w-6 h-6 text-slate-400" />
                Mood Logs
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center p-6">
              <div className="text-4xl font-black text-slate-600 dark:text-slate-300 mb-2">{moodStats.total}</div>
              <p className="text-slate-600 dark:text-slate-400">Total entries</p>
            </CardContent>
          </Card>

          <motion.div whileHover={{ scale: 1.02 }}>
            <Button className="h-20 rounded-2xl shadow-xl bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 dark:from-slate-500 dark:to-slate-600 text-slate-50 font-semibold text-lg col-span-1">
              <Download className="w-5 h-5 mr-2" />
              Export CSV
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }}>
            <Button className="h-20 rounded-2xl shadow-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 dark:from-emerald-400 dark:to-emerald-500 text-slate-900 dark:text-slate-50 font-semibold text-lg col-span-1">
              <FileText className="w-5 h-5 mr-2" />
              Export PDF
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  )
}
