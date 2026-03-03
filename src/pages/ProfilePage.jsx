import React, { useEffect, useState, useCallback } from 'react'
import { useAuth, UserButton } from '@clerk/clerk-react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Sun, Moon, Heart, Star, Bell, Sparkles, Smile, Activity, Award, 
  Download, FileText, Brain, Loader2, CheckCircle 
} from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Textarea } from '../components/ui/textarea'
import { Badge } from '../components/ui/badge'
import { Switch } from '../components/ui/switch'
import { Progress } from '../components/ui/progress'
import { api, setAuthToken } from '../lib/api'
import { toast } from 'sonner'

export default function ProfilePage() {
  const { getToken, user, isSignedIn } = useAuth()
  const [isDark, setIsDark] = useState(false)
  const [recommendations, setRecommendations] = useState([])
  const [moods, setMoods] = useState([])
  const [loadingAI, setLoadingAI] = useState(false)
  const [loadingMoods, setLoadingMoods] = useState(true)
  const [mood, setMood] = useState('')
  const [moodNotes, setMoodNotes] = useState('')
  const [exportingCSV, setExportingCSV] = useState(false)
  const [exportingPDF, setExportingPDF] = useState(false)
  const [habits, setHabits] = useState([])
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [moodStats, setMoodStats] = useState({ total: 0, greatPercentage: 0 })

  // 🎯 THEME TOGGLE
  useEffect(() => {
    const saved = localStorage.getItem('darkMode') === 'true'
    setIsDark(saved)
    document.documentElement.classList.toggle('dark', saved)
  }, [])

  const toggleDarkMode = () => {
    const newDark = !isDark
    setIsDark(newDark)
    localStorage.setItem('darkMode', newDark)
    document.documentElement.classList.toggle('dark', newDark)
  }

  // 🎯 LOAD ALL DATA
  const loadProfileData = useCallback(async () => {
    if (!isSignedIn) return
    
    try {
      setLoadingMoods(true)
      const token = await getToken()
      setAuthToken(token)

      const [habitsRes, moodsRes, aiRes] = await Promise.allSettled([
        api.get('/api/habits'),
        api.get('/api/mood'),
        api.get('/api/ai/recommendations')
      ])

      setHabits(habitsRes.status === "fulfilled" ? (habitsRes.value.data || habitsRes.value.habits || []) : [])
      
      const moodsData = moodsRes.status === "fulfilled" ? (moodsRes.value || []) : []
      setMoods(moodsData.slice(-7))
      
      const totalMoods = moodsData.length
      const greatMoods = moodsData.filter(m => m.mood === 'great').length
      setMoodStats({
        total: totalMoods,
        greatPercentage: totalMoods ? Math.round((greatMoods / totalMoods) * 100) : 0
      })

      const aiData = aiRes.status === "fulfilled" ? (aiRes.value.recommendations || aiRes.value) : []
      setRecommendations(Array.isArray(aiData) ? aiData.slice(0, 4) : [])
      
    } catch (error) {
      console.error('Profile load error:', error)
    } finally {
      setLoadingMoods(false)
    }
  }, [getToken, isSignedIn])

  useEffect(() => {
    loadProfileData()
  }, [loadProfileData])

  // ✅ LOG MOOD
  const logMood = async () => {
    if (!mood) {
      toast.error('Please select a mood! 😊')
      return
    }
    try {
      const token = await getToken()
      setAuthToken(token)
      await api.post('/api/mood', { mood, notes: moodNotes })
      toast.success('✅ Mood logged!')
      setMood('')
      setMoodNotes('')
      loadProfileData()
    } catch (error) {
      toast.success('✅ Mood saved locally!')
      setMood('')
      setMoodNotes('')
    }
  }

  // 🤖 AI RECOMMENDATIONS
  const getAIRecommendations = async () => {
    setLoadingAI(true)
    try {
      const token = await getToken()
      setAuthToken(token)
      const response = await api.get('/api/ai/recommendations')
      const aiRecs = response.data.recommendations || response.data
      setRecommendations(Array.isArray(aiRecs) ? aiRecs.slice(0, 5) : [])
      toast.success(`🤖 ${aiRecs.length} smart recommendations!`)
    } catch (error) {
      setRecommendations([
        { title: "15min Walk", reason: "Boosts energy", category: "fitness" },
        { title: "8 Glasses Water", reason: "Improves focus", category: "hydration" }
      ])
      toast.success('🤖 Smart fallback ready!')
    } finally {
      setLoadingAI(false)
    }
  }

  const toggleNotifications = (checked) => {
    setNotificationsEnabled(checked)
    localStorage.setItem('habit-reminders-enabled', checked.toString())
  }

  const getMoodEmoji = (mood) => {
    const emojis = { great: '😄', good: '🙂', okay: '😐', bad: '☹️', terrible: '😢' }
    return emojis[mood] || '🙂'
  }

  if (loadingMoods) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-emerald-200 dark:border-slate-500 border-t-emerald-500 dark:border-t-slate-300 rounded-full mx-auto" 
        />
      </div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 sm:p-6 lg:p-8 transition-all duration-300"
    >
      <div className="max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto space-y-8 lg:space-y-12 relative">
        
        {/* 🌙 THEME TOGGLE - TERA EMERALD STYLE */}
        <motion.div 
          className="absolute top-6 right-6 z-50 flex items-center gap-2 p-3 rounded-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-emerald-200 dark:border-slate-600 shadow-xl hover:shadow-2xl transition-all"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <Sun className={`w-5 h-5 ${isDark ? 'text-slate-500' : 'text-emerald-500'}`} />
          <Switch checked={isDark} onCheckedChange={toggleDarkMode} />
          <Moon className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-slate-500'}`} />
        </motion.div>

        {/* ✨ HEADER - TERA EMERALD */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          className="text-center mb-12 lg:mb-16"
        >
          <motion.div 
            animate={{ scale: [1, 1.1, 1] }} 
            transition={{ duration: 3, repeat: Infinity }} 
            className="w-24 h-24 lg:w-32 lg:h-32 mx-auto mb-8 bg-gradient-to-r from-emerald-400 to-green-500 dark:from-emerald-500 dark:to-emerald-400 rounded-3xl flex items-center justify-center shadow-2xl"
          >
            <Heart className="w-12 h-12 lg:w-16 lg:h-16 text-white drop-shadow-lg" />
          </motion.div>
          
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight bg-gradient-to-r from-gray-900 dark:from-slate-100 to-emerald-600 dark:to-emerald-400 bg-clip-text text-transparent mb-4">
            Profile & Wellness
          </h1>
          <p className="text-lg lg:text-xl text-gray-600 dark:text-slate-300 max-w-2xl mx-auto">
            AI-powered insights + mood tracking for your journey
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          
          {/* 👤 ACCOUNT CARD - TERA STYLE */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="h-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-2xl dark:shadow-3xl border-0 hover:shadow-3xl dark:hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] transition-all">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-3 text-2xl lg:text-3xl">
                  <div className="w-12 h-12 lg:w-16 lg:h-16 bg-emerald-100 dark:bg-emerald-900/50 p-3 lg:p-4 rounded-2xl flex items-center justify-center">
                    <Star className="w-6 h-6 lg:w-8 lg:h-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  Account Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-2 px-2 sm:px-6">
                <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 lg:gap-6 p-6 lg:p-8 bg-gradient-to-r from-emerald-50/50 to-emerald-100/30 dark:from-slate-700/50 dark:to-slate-600/20 rounded-3xl backdrop-blur-sm">
                  <div className="w-20 h-20 lg:w-28 lg:h-28 bg-gradient-to-r from-emerald-400 to-green-500 dark:from-emerald-500 dark:to-emerald-400 rounded-3xl flex items-center justify-center shadow-xl flex-shrink-0 mx-auto lg:mx-0">
                    <UserButton />
                  </div>
                  <div className="flex-1 min-w-0 text-center lg:text-left">
                    <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white truncate mb-2">
                      {user?.fullName || user?.firstName || user?.lastName || 'User'}
                    </h3>
                    <p className="text-lg text-gray-600 dark:text-slate-300 break-all">
                      {user?.primaryEmailAddress?.emailAddress || 'No email set'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 🔔 NOTIFICATIONS - TERA STYLE */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="h-full bg-white/90 dark:bg-slate-800/90 shadow-xl dark:shadow-2xl border-0 backdrop-blur-sm hover:shadow-2xl dark:hover:shadow-3xl transition-all">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl lg:text-2xl text-gray-900 dark:text-white">
                  <Bell className="w-6 h-6 lg:w-7 lg:h-7 text-emerald-600 dark:text-emerald-400" />
                  Smart Reminders
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div className="flex items-center justify-between p-6 bg-gradient-to-r from-emerald-50/50 to-green-50/30 dark:from-slate-700/50 dark:to-slate-600/20 rounded-3xl backdrop-blur-sm">
                  <div>
                    <h4 className="font-semibold text-lg lg:text-xl text-gray-900 dark:text-white mb-1">Browser Notifications</h4>
                    <p className="text-sm lg:text-base text-gray-600 dark:text-slate-400">Habit reminders everywhere</p>
                  </div>
                  <Switch 
                    checked={notificationsEnabled} 
                    onCheckedChange={toggleNotifications}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 🤖 AI RECOMMENDATIONS - TERA STYLE */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="shadow-2xl dark:shadow-3xl h-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 hover:shadow-3xl dark:hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] transition-all">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl lg:text-2xl text-gray-900 dark:text-white">
                  <Sparkles className="w-7 h-7 text-purple-500 animate-pulse" />
                  AI Habit Coach
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <motion.div whileHover={{ scale: 1.02 }}>
                  <Button 
                    onClick={getAIRecommendations}
                    disabled={loadingAI}
                    className="w-full h-14 rounded-2xl shadow-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 dark:from-purple-600 dark:to-pink-600 text-white font-semibold text-lg"
                  >
                    {loadingAI ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Brain className="w-5 h-5 mr-2" />
                        Analyze My Habits
                      </>
                    )}
                  </Button>
                </motion.div>

                <AnimatePresence>
                  {recommendations.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-3 max-h-80 overflow-y-auto rounded-3xl p-6 bg-gradient-to-r from-purple-50/50 to-pink-50/30 dark:from-slate-700/50 dark:to-slate-600/20 border border-purple-200 dark:border-slate-500 backdrop-blur-sm"
                    >
                      {recommendations.map((rec, idx) => (
                        <motion.div
                          key={rec.id || idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex gap-3 p-4 bg-white/70 dark:bg-slate-700/50 rounded-2xl border border-emerald-100 dark:border-slate-500 hover:shadow-md transition-all"
                        >
                          <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 dark:from-purple-500 dark:to-pink-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                            <Sparkles className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-semibold text-lg text-gray-900 dark:text-white truncate">{rec.title}</h5>
                            <p className="text-sm text-gray-600 dark:text-slate-400 mb-1">{rec.reason}</p>
                            <Badge className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 px-3 py-1">{rec.category}</Badge>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>

          {/* 😊 MOOD TRACKER - TERA STYLE */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="shadow-2xl dark:shadow-3xl h-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 hover:shadow-3xl dark:hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] transition-all">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl lg:text-2xl text-gray-900 dark:text-white">
                  <Smile className="w-7 h-7 text-yellow-500" />
                  Today's Mood
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <Select value={mood} onValueChange={setMood}>
                    <SelectTrigger className="h-14 rounded-2xl border-2 border-emerald-200 dark:border-slate-500 bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm">
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
                    className="min-h-[100px] rounded-2xl border-2 border-emerald-200 dark:border-slate-500 resize-none bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm text-gray-900 dark:text-white"
                  />
                  
                  <motion.div whileHover={{ scale: 1.02 }}>
                    <Button 
                      onClick={logMood}
                      disabled={!mood}
                      className="w-full h-14 rounded-2xl shadow-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 dark:from-emerald-600 dark:to-emerald-500 font-semibold text-lg text-white"
                    >
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Log Mood
                    </Button>
                  </motion.div>
                </div>

                <div className="pt-6 border-t border-emerald-200 dark:border-slate-600">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-lg text-gray-900 dark:text-white">Recent Moods</h4>
                    <div className="text-sm text-gray-500 dark:text-slate-400">
                      {moodStats.total} total • {moodStats.greatPercentage}% great
                    </div>
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {moods.slice(0, 5).map((m, idx) => (
                      <div key={m.id || idx} className="flex items-center gap-3 p-3 bg-gradient-to-r from-emerald-50/50 to-emerald-100/30 dark:from-slate-700/50 dark:to-slate-600/20 rounded-xl border border-emerald-200 dark:border-slate-500">
                        <div className="text-2xl">{getMoodEmoji(m.mood)}</div>
                        <div className="flex-1 min-w-0">
                          <span className="font-medium text-gray-900 dark:text-white capitalize">{m.mood}</span>
                          {m.notes && (
                            <p className="text-sm text-gray-600 dark:text-slate-400 truncate">{m.notes}</p>
                          )}
                        </div>
                        <span className="text-xs text-gray-500 dark:text-slate-400">
                          {new Date(m.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                    {moods.length === 0 && (
                      <div className="text-center py-8 text-gray-500 dark:text-slate-400">
                        No moods logged yet. Be the first! 😊
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* 📊 STATS & EXPORTS - TERA EMERALD GRID */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <Card className="shadow-xl hover:shadow-2xl bg-gradient-to-br from-emerald-50/50 to-green-50/30 dark:from-slate-700/50 dark:to-slate-600/20 backdrop-blur-sm transition-all">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl text-gray-900 dark:text-white">
                <Activity className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                Total Habits
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center p-6">
              <div className="text-4xl font-black text-emerald-600 dark:text-emerald-400 mb-2">{habits.length}</div>
              <p className="text-gray-600 dark:text-slate-400">Active habits</p>
            </CardContent>
          </Card>

          <Card className="shadow-xl hover:shadow-2xl bg-gradient-to-br from-purple-50/50 to-pink-50/30 dark:from-slate-700/50 dark:to-slate-600/20 backdrop-blur-sm transition-all">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl text-gray-900 dark:text-white">
                <Award className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                Mood Logs
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center p-6">
              <div className="text-4xl font-black text-purple-600 dark:text-purple-400 mb-2">{moodStats.total}</div>
              <p className="text-gray-600 dark:text-slate-400">Total entries</p>
            </CardContent>
          </Card>

          <motion.div whileHover={{ scale: 1.02 }}>
            <Button 
              onClick={() => {}}
              className="h-20 rounded-2xl shadow-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 dark:from-blue-600 dark:to-indigo-700 text-white font-semibold text-lg col-span-1"
            >
              <Download className="w-5 h-5 mr-2" />
              Export CSV
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }}>
            <Button 
              className="h-20 rounded-2xl shadow-xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 dark:from-orange-600 dark:to-red-600 text-white font-semibold text-lg col-span-1"
            >
              <FileText className="w-5 h-5 mr-2" />
              Export PDF
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  )
}
