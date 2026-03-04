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

  // ✅ REAL USERNAME PRIORITY ORDER
  const getDisplayName = () => {
    if (!user) return 'Wellness Warrior'
    return user.fullName || user.firstName || user.username || 'Healthy Habits User'
  }

  // 🎯 LOAD DATA
  const loadProfileData = useCallback(async () => {
    if (!isSignedIn) return
    
    try {
      setLoadingMoods(true)
      const token = await getToken()
      if (token) setAuthToken(token)

      // Mock data - Real API fallback
      const mockHabits = [
        { id: 1, title: 'Drink Water', category: 'Health', completed: true, streak: 3 },
        { id: 2, title: '30min Walk', category: 'Fitness', completed: false, streak: 1 }
      ]
      
      const mockMoods = [
        { id: 1, mood: 'great', notes: 'Feeling amazing after workout!', created_at: new Date(Date.now() - 86400000) },
        { id: 2, mood: 'good', notes: 'Productive coding day', created_at: new Date() }
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
        { title: "15min Meditation", reason: "Reduces stress instantly", category: "Mental Health" },
        { title: "8 Glasses Water", reason: "Boosts focus 3x", category: "Health" }
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
      const newMood = {
        id: Date.now(),
        mood,
        notes: moodNotes,
        created_at: new Date()
      }
      setMoods(prev => [newMood, ...prev.slice(0, 6)])
      toast.success('✅ Mood saved locally!')
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-emerald-400/20 border-t-emerald-500 rounded-full" 
        />
      </div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 p-4 sm:p-6 lg:p-8"
    >
      <div className="max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto space-y-12 pb-16">
        
        {/* ✨ HEADER - SLATE/EMERALD PERFECTION */}
        <motion.div 
          initial={{ y: -30, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          className="text-center"
        >
          <motion.div 
            animate={{ scale: [1, 1.05, 1] }} 
            transition={{ duration: 4, repeat: Infinity }} 
            className="w-28 h-28 lg:w-36 lg:h-36 mx-auto mb-8 bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-2xl ring-4 ring-emerald-500/30"
          >
            <Heart className="w-14 h-14 lg:w-16 lg:h-16 text-slate-900 drop-shadow-2xl" />
          </motion.div>
          
          <h1 className="font-serif text-5xl lg:text-7xl font-light tracking-tight bg-gradient-to-r from-slate-100 via-slate-200 to-emerald-300 bg-clip-text text-transparent mb-6 drop-shadow-2xl">
            Wellness Profile
          </h1>
          <p className="text-xl lg:text-2xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Track your journey with AI insights & mood analytics
          </p>
        </motion.div>

        {/* MAIN CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-8 lg:gap-12">
          
          {/* 👤 PROFILE CARD - REAL USERNAME ONLY */}
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }}>
            <Card className="h-full bg-slate-800/90 backdrop-blur-xl shadow-2xl border border-slate-700/50 hover:shadow-emerald-500/20 hover:border-emerald-500/50 transition-all duration-500 group">
              <CardHeader className="pb-8">
                <CardTitle className="flex items-center gap-4 text-3xl lg:text-4xl text-slate-100 font-serif">
                  <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-2xl border-4 border-slate-900/50 group-hover:scale-110 transition-transform">
                    <Star className="w-8 h-8 lg:w-10 lg:h-10 text-slate-900" />
                  </div>
                  Your Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8 pt-4">
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }} 
                  animate={{ scale: 1, opacity: 1 }} 
                  className="group/profile flex flex-col lg:flex-row items-start lg:items-center gap-6 lg:gap-8 p-8 lg:p-10 bg-gradient-to-br from-slate-700/50 to-emerald-500/10 rounded-3xl backdrop-blur-xl border border-slate-600/50 hover:border-emerald-400/50 transition-all duration-300"
                >
                  <div className="w-24 h-24 lg:w-32 lg:h-32 bg-gradient-to-r from-slate-800 to-slate-700 rounded-3xl flex items-center justify-center shadow-2xl border-4 border-slate-900/60 flex-shrink-0 ring-4 ring-emerald-500/20 mx-auto lg:mx-0">
                    <UserButton afterSignOutUrl="/sign-in" />
                  </div>
                  
                  <div className="flex-1 text-center lg:text-left min-w-0">
                    <h2 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-slate-100 to-emerald-300 bg-clip-text text-transparent mb-4 leading-tight">
                      {getDisplayName()}
                    </h2>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                      <Badge className="text-lg px-6 py-3 bg-emerald-500/20 text-emerald-300 border-2 border-emerald-400/50 backdrop-blur-sm shadow-lg">
                        Active Member
                      </Badge>
                      <Badge className="text-lg px-6 py-3 bg-slate-500/20 text-slate-300 border-2 border-slate-600/50 backdrop-blur-sm shadow-lg">
                        {habits.length} Habits
                      </Badge>
                    </div>
                  </div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 🔔 NOTIFICATIONS */}
          <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <Card className="h-full bg-slate-800/90 backdrop-blur-xl shadow-2xl border border-slate-700/50 hover:shadow-emerald-500/20 hover:border-emerald-500/50 transition-all duration-500">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-4 text-2xl lg:text-3xl text-slate-100">
                  <Bell className="w-8 h-8 text-emerald-400" />
                  Smart Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-8">
                <div className="flex items-center justify-between p-8 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-3xl backdrop-blur-xl border border-emerald-400/40 hover:shadow-emerald-500/20 transition-all">
                  <div>
                    <h4 className="font-bold text-2xl text-slate-100 mb-2">Daily Reminders</h4>
                    <p className="text-lg text-slate-400">Smart nudges for your habits</p>
                  </div>
                  <div className="w-16 h-8 bg-slate-700/50 rounded-full p-1 flex items-center relative cursor-pointer hover:bg-slate-600/50 transition-all">
                    <motion.div 
                      className="w-7 h-6 bg-emerald-500 rounded-full shadow-lg"
                      animate={{ x: 0 }}
                      transition={{ duration: 0.2 }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 🤖 AI RECOMMENDATIONS */}
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="shadow-2xl h-full bg-slate-800/90 backdrop-blur-xl border border-slate-700/50 hover:shadow-emerald-500/25 hover:border-emerald-500/50 transition-all lg:col-span-2">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-4 text-2xl lg:text-3xl text-slate-100">
                  <Sparkles className="w-9 h-9 text-emerald-400 animate-pulse" />
                  AI Habit Coach
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-8">
                <motion.div whileHover={{ scale: 1.02 }}>
                  <Button 
                    onClick={() => toast.success('🤖 AI analyzing your patterns...')}
                    className="w-full h-16 rounded-3xl shadow-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-900 font-bold text-xl shadow-emerald-500/25"
                  >
                    <Brain className="w-6 h-6 mr-3" />
                    Get AI Recommendations
                  </Button>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-4 max-h-96 overflow-y-auto rounded-3xl p-8 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border border-emerald-400/30 backdrop-blur-xl">
                  {recommendations.map((rec, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="group flex gap-4 p-6 bg-slate-700/50 rounded-2xl border border-slate-600/50 hover:border-emerald-400/70 hover:bg-slate-700/70 transition-all shadow-lg hover:shadow-emerald-500/20"
                    >
                      <div className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xl">
                        <Sparkles className="w-7 h-7 text-slate-900" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="font-bold text-xl text-slate-100 group-hover:text-emerald-300 mb-2 truncate">{rec.title}</h5>
                        <p className="text-slate-400 mb-3 leading-relaxed">{rec.reason}</p>
                        <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 px-4 py-2 text-base font-semibold">
                          {rec.category}
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 😊 MOOD TRACKER */}
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="shadow-2xl h-full bg-slate-800/90 backdrop-blur-xl border border-slate-700/50 hover:shadow-emerald-500/20 hover:border-emerald-500/50 transition-all">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-4 text-2xl lg:text-3xl text-slate-100">
                  <Smile className="w-9 h-9 text-emerald-400" />
                  Daily Mood Tracker
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="space-y-6">
                  <Select value={mood} onValueChange={setMood}>
                    <SelectTrigger className="h-16 rounded-3xl border-2 border-slate-600/50 bg-slate-700/50 backdrop-blur-xl text-slate-100 text-xl shadow-xl hover:border-emerald-400/70">
                      <SelectValue placeholder="How are you feeling today?" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 backdrop-blur-xl">
                      <SelectItem value="great" className="text-xl h-16">😄 Great</SelectItem>
                      <SelectItem value="good" className="text-xl h-16">🙂 Good</SelectItem>
                      <SelectItem value="okay" className="text-xl h-16">😐 Okay</SelectItem>
                      <SelectItem value="bad" className="text-xl h-16">☹️ Bad</SelectItem>
                      <SelectItem value="terrible" className="text-xl h-16">😢 Terrible</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Textarea 
                    value={moodNotes}
                    onChange={(e) => setMoodNotes(e.target.value)}
                    placeholder="What's making you feel this way? (optional)"
                    className="min-h-[120px] rounded-3xl border-2 border-slate-600/50 resize-none bg-slate-700/50 backdrop-blur-xl text-slate-100 text-lg shadow-xl hover:border-emerald-400/70 focus:border-emerald-400/70"
                  />
                  
                  <motion.div whileHover={{ scale: 1.02 }}>
                    <Button 
                      onClick={logMood}
                      disabled={!mood}
                      className="w-full h-16 rounded-3xl shadow-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-900 font-bold text-xl shadow-emerald-500/25"
                    >
                      <CheckCircle className="w-6 h-6 mr-3" />
                      Log Today's Mood
                    </Button>
                  </motion.div>
                </div>

                {/* RECENT MOODS */}
                <div className="pt-8 border-t border-slate-700/50">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="font-bold text-2xl text-slate-100">Recent Moods</h4>
                    <div className="text-lg text-slate-400 font-mono">
                      {moodStats.total} total • {moodStats.greatPercentage}% great
                    </div>
                  </div>
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {moods.slice(0, 5).map((m, idx) => (
                      <motion.div 
                        key={m.id || idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-4 p-6 bg-gradient-to-r from-slate-700/60 to-emerald-500/10 rounded-2xl border border-slate-600/50 hover:border-emerald-400/60 backdrop-blur-xl shadow-lg hover:shadow-emerald-500/20 transition-all"
                      >
                        <div className="text-3xl flex-shrink-0">{getMoodEmoji(m.mood)}</div>
                        <div className="flex-1 min-w-0">
                          <span className="font-bold text-xl text-slate-100 capitalize block">{m.mood}</span>
                          {m.notes && (
                            <p className="text-lg text-slate-300 mt-1 truncate">{m.notes}</p>
                          )}
                        </div>
                        <span className="text-sm text-slate-500 font-mono bg-slate-700/50 px-3 py-1 rounded-xl">
                          {new Date(m.created_at).toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* 📊 STATS DASHBOARD */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <Card className="shadow-2xl group bg-gradient-to-br from-emerald-500/10 to-teal-500/10 backdrop-blur-xl border border-emerald-400/40 hover:shadow-emerald-500/30 hover:border-emerald-500/60 transition-all">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-2xl text-slate-100">
                <Activity className="w-7 h-7 text-emerald-400" />
                Active Habits
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center p-6">
              <div className="text-5xl font-black bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-2">
                {habits.length}
              </div>
              <p className="text-slate-400 text-lg">Tracking daily</p>
            </CardContent>
          </Card>

          <Card className="shadow-2xl group bg-gradient-to-br from-slate-600/20 to-slate-700/20 backdrop-blur-xl border border-slate-600/50 hover:shadow-slate-500/30 hover:border-slate-500/60 transition-all">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-2xl text-slate-100">
                <Award className="w-7 h-7 text-slate-300" />
                Mood Entries
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center p-6">
              <div className="text-5xl font-black bg-gradient-to-r from-slate-300 to-slate-200 bg-clip-text text-transparent mb-2">
                {moodStats.total}
              </div>
              <p className="text-slate-400 text-lg">Total logged</p>
            </CardContent>
          </Card>

          <motion.div whileHover={{ scale: 1.05 }} className="lg:col-span-1">
            <Button className="h-24 w-full rounded-3xl shadow-2xl bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-slate-100 font-bold text-xl shadow-slate-500/25">
              <Download className="w-6 h-6 mr-3" />
              Export Data
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} className="lg:col-span-1">
            <Button className="h-24 w-full rounded-3xl shadow-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-900 font-bold text-xl shadow-emerald-500/25">
              <FileText className="w-6 h-6 mr-3" />
              Print Report
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  )
}
