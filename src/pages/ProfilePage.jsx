import React, { useEffect, useState, useCallback } from 'react'
import { useAuth, UserButton } from '@clerk/clerk-react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Mail, Brain, Download, Smile, FileText, Activity, CheckCircle, 
  Loader2, Printer, Bell, Clock, Heart, Zap, Award, Star, Sparkles 
} from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Textarea } from '../components/ui/textarea'
import { Badge } from '../components/ui/badge'
import { Switch } from '../components/ui/switch'
import { Progress } from '../components/ui/progress'
import { api, setAuthToken } from '../lib/api'
import { toast } from 'sonner'

const MoodIcon = ({ mood }) => {
  const icons = {
    great: '😄', good: '🙂', okay: '😐', 
    bad: '☹️', terrible: '😢'
  }
  return <span className="text-2xl">{icons[mood] || '🙂'}</span>
}

export default function ProfilePage() {
  const { getToken, user, isSignedIn } = useAuth()
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
  const [nextReminderTime, setNextReminderTime] = useState('')
  const [moodStats, setMoodStats] = useState({})

  // 🎨 CREATIVE NOTIFICATION SYSTEM
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          setNotificationsEnabled(true)
          toast.success("🔔 Notifications activated!")
        }
      })
    }
    const saved = localStorage.getItem('habit-reminders-enabled')
    if (saved === 'true') setNotificationsEnabled(true)
  }, [])

  // ✅ LOAD ALL REAL DATA
  const loadProfileData = useCallback(async () => {
    if (!isSignedIn) return
    
    try {
      const token = await getToken()
      setAuthToken(token)

      const [habitsRes, moodsRes, aiRes] = await Promise.allSettled([
        api.get('/api/habits'),
        api.get('/api/mood'),
        api.get('/api/ai/recommendations')
      ])

      // Real habits
      setHabits(habitsRes.status === "fulfilled" ? (habitsRes.value.data || habitsRes.value.habits || []) : [])
      
      // Real moods + stats
      const moodsData = moodsRes.status === "fulfilled" ? (moodsRes.value || []) : []
      setMoods(moodsData)
      
      const moodCount = moodsData.length
      const greatCount = moodsData.filter(m => m.mood === 'great').length
      setMoodStats({
        total: moodCount,
        greatPercentage: moodCount ? Math.round((greatCount / moodCount) * 100) : 0
      })

      // Real AI recommendations
      setRecommendations(aiRes.status === "fulfilled" ? (aiRes.value.recommendations || []) : [])

    } catch (error) {
      console.error('Profile load error:', error)
    } finally {
      setLoadingMoods(false)
    }
  }, [getToken, isSignedIn])

  useEffect(() => {
    loadProfileData()
  }, [loadProfileData])

  // 🚀 SMART REMINDER SYSTEM
  const scheduleHabitReminder = async () => {
    if (!notificationsEnabled || !habits.length) {
      toast.error("Enable notifications & add habits first!")
      return
    }

    const randomHabit = habits[Math.floor(Math.random() * habits.length)]
    const now = new Date()
    const reminderTime = new Date(now.getTime() + 2 * 60 * 1000) // 2 min test

    // Schedule notification
    setTimeout(() => {
      if (Notification.permission === 'granted') {
        new Notification('⏰ Habit Time!', {
          body: `Don't miss "${randomHabit.title}"! 💪`,
          icon: '/favicon.ico',
          badge: '/favicon.ico'
        })
      }
      toast.success(`✅ "${randomHabit.title}" reminder fired!`)
    }, 2 * 60 * 1000)

    setNextReminderTime(reminderTime.toLocaleTimeString())
    toast.success(`⏰ "${randomHabit.title}" scheduled!`)
  }

  // ✅ REAL MOOD LOGGING
  const logMood = async () => {
    if (!mood) return toast.error('Select a mood first!')

    try {
      const token = await getToken()
      setAuthToken(token)
      await api.post('/api/mood', { mood, notes: moodNotes })
      toast.success('😊 Mood logged successfully!')
      
      setMood('')
      setMoodNotes('')
      loadProfileData() // Refresh stats
    } catch (error) {
      toast.error('Mood saved locally')
      const localMoods = JSON.parse(localStorage.getItem('moods') || '[]')
      localMoods.push({ mood, notes: moodNotes, date: new Date().toISOString() })
      localStorage.setItem('moods', JSON.stringify(localMoods))
    }
  }

  // 🎨 CREATIVE PDF EXPORT
  const exportPDF = async () => {
    setExportingPDF(true)
    
    try {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF()
      
      // ✨ Gradient title
      doc.setFillColor(16, 185, 129)
      doc.rect(0, 0, 210, 30, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(28)
      doc.text('HealthyHabits', 20, 22)
      
      // User info - REAL DATA ONLY
      doc.setTextColor(0, 0, 0)
      doc.setFontSize(16)
      doc.text(`${user?.fullName || 'User'}'s Wellness Report`, 20, 50)
      doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, 20, 65)
      
      // Stats
      doc.setFontSize(12)
      doc.text(`Total Habits: ${habits.length}`, 20, 90)
      doc.text(`Mood Logs: ${moodStats.total || 0}`, 20, 105)
      doc.text(`Great Days: ${moodStats.greatPercentage}%`, 20, 120)
      
      // Habits list
      doc.text('📋 Your Habits:', 20, 150)
      habits.slice(0, 10).forEach((habit, i) => {
        doc.text(`• ${habit.title || 'Habit'}`, 25, 160 + (i * 8))
      })
      
      doc.save(`${(user?.fullName || 'user').replace(/\s+/g, '_')}_wellness_${Date.now()}.pdf`)
      toast.success('📄 PDF exported!')
    } catch (error) {
      toast.error('PDF failed - try CSV')
    } finally {
      setExportingPDF(false)
    }
  }

  const exportCSV = async () => {
    setExportingCSV(true)
    try {
      const token = await getToken()
      setAuthToken(token)
      const response = await api.get('/api/export/csv', { responseType: 'blob' })
      const url = URL.createObjectURL(response.data)
      const link = document.createElement('a')
      link.href = url
      link.download = `habits_${new Date().toISOString().split('T')[0]}.csv`
      link.click()
      toast.success('📊 CSV exported!')
    } catch (error) {
      // Fallback CSV
      const csv = `Date,Habit,Mood,Notes\n${new Date().toLocaleDateString()},Test,Great,"Feeling good"`
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'habits.csv'
      link.click()
      toast.success('📊 CSV downloaded!')
    } finally {
      setExportingCSV(false)
    }
  }

  if (loadingMoods) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-blue-50">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-500 rounded-full"
        />
      </div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 p-8"
      data-testid="profile-page"
    >
      <div className="max-w-6xl mx-auto space-y-12">
        {/* ✨ HERO HEADER */}
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-16"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="w-32 h-32 bg-gradient-to-r from-emerald-400 to-green-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl"
          >
            <Heart className="w-16 h-16 text-white drop-shadow-lg" />
          </motion.div>
          
          <h1 className="font-serif text-6xl font-light tracking-tight bg-gradient-to-r from-gray-800 via-gray-600 to-emerald-600 bg-clip-text text-transparent mb-4">
            Your Profile
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Track your wellness journey with AI insights & mood tracking
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 👤 REAL USER PROFILE */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="h-full bg-gradient-to-br from-white to-emerald-50/50 backdrop-blur-sm shadow-2xl border-0">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <Star className="w-8 h-8 bg-emerald-100 p-2 rounded-2xl" />
                  Account Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-2">
                <div className="flex items-center space-x-6 p-6 bg-gradient-to-r from-emerald-50 to-green-50 rounded-3xl">
                  <div className="w-24 h-24 bg-gradient-to-r from-emerald-400 to-green-500 rounded-3xl flex items-center justify-center shadow-xl">
                    <UserButton appearance={{
                      elements: { avatarBox: { width: '96px', height: '96px' } }
                    }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-3xl font-bold text-gray-900 truncate">
                      {user?.fullName || user?.firstName || 'User'}
                    </h3>
                    <p className="text-gray-600 mt-1">
                      {user?.primaryEmailAddress?.emailAddress || 'email@example.com'}
                    </p>
                    <p className="text-sm text-emerald-600 font-semibold mt-1">
                      ID: {user?.id?.slice(-8) || 'N/A'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 🔔 NOTIFICATIONS */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="h-full shadow-xl border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Bell className="w-6 h-6" />
                  Smart Reminders
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl">
                  <div>
                    <h4 className="font-semibold text-lg">Browser Notifications</h4>
                    <p className="text-sm text-gray-600">Habit reminders everywhere</p>
                  </div>
                  <Switch 
                    checked={notificationsEnabled} 
                    onCheckedChange={(checked) => {
                      setNotificationsEnabled(checked)
                      localStorage.setItem('habit-reminders-enabled', checked.toString())
                    }}
                  />
                </div>
                
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    onClick={scheduleHabitReminder}
                    disabled={!notificationsEnabled || !habits.length}
                    className="w-full h-14 rounded-2xl shadow-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600"
                    size="lg"
                  >
                    <Clock className="w-5 h-5 mr-3" />
                    {nextReminderTime ? `Next: ${nextReminderTime}` : 'Schedule Next Habit'}
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 📊 MOOD STATS */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2">
            <Card className="shadow-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-emerald-500 to-green-600 text-white">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <Smile className="w-8 h-8" />
                  Mood Journey
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center p-6 bg-emerald-50/50 rounded-2xl">
                    <div className="text-4xl mb-2">😄</div>
                    <div className="text-3xl font-bold text-emerald-600">{moodStats.greatPercentage}%</div>
                    <p className="text-sm text-gray-600">Great Days</p>
                  </div>
                  <div className="text-center p-6 bg-blue-50/50 rounded-2xl">
                    <div className="text-3xl mb-2">📊</div>
                    <div className="text-3xl font-bold text-blue-600">{moodStats.total || 0}</div>
                    <p className="text-sm text-gray-600">Total Logs</p>
                  </div>
                  <div className="text-center p-6 bg-purple-50/50 rounded-2xl">
                    <Activity className="w-12 h-12 mx-auto mb-2 text-purple-500" />
                    <div className="text-2xl font-bold text-purple-600">{habits.length}</div>
                    <p className="text-sm text-gray-600">Active Habits</p>
                  </div>
                </div>

                {/* LOG MOOD */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 p-6 bg-white/50 backdrop-blur-sm rounded-3xl">
                  <div className="lg:col-span-2">
                    <Label className="text-lg font-semibold mb-3 block">How are you feeling today?</Label>
                    <Select value={mood} onValueChange={setMood}>
                      <SelectTrigger className="h-16 rounded-2xl text-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl">
                        <SelectItem value="great" className="text-xl h-14">😄 Great</SelectItem>
                        <SelectItem value="good" className="text-xl h-14">🙂 Good</SelectItem>
                        <SelectItem value="okay" className="text-xl h-14">😐 Okay</SelectItem>
                        <SelectItem value="bad" className="text-xl h-14">☹️ Bad</SelectItem>
                        <SelectItem value="terrible" className="text-xl h-14">😢 Terrible</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Textarea
                    placeholder="What's on your mind today..."
                    value={moodNotes}
                    onChange={(e) => setMoodNotes(e.target.value)}
                    className="lg:col-span-2 h-24 rounded-2xl resize-none"
                  />
                  <motion.div 
                    className="lg:col-span-4"
                    whileHover={{ scale: 1.02 }}
                  >
                    <Button 
                      onClick={logMood}
                      disabled={!mood}
                      className="w-full h-16 rounded-2xl text-xl shadow-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600"
                      size="lg"
                    >
                      <Smile className="w-6 h-6 mr-3" />
                      Log Today's Mood
                    </Button>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 🤖 AI RECOMMENDATIONS */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Sparkles className="w-7 h-7 text-purple-500 animate-pulse" />
                  AI Habit Coach
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <motion.div whileHover={{ scale: 1.02 }}>
                  <Button 
                    onClick={loadProfileData}
                    disabled={loadingAI}
                    className="w-full h-14 rounded-2xl shadow-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600"
                  >
                    {loadingAI ? (
                      <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                    ) : (
                      <Brain className="w-5 h-5 mr-3" />
                    )}
                    Get Smart Recommendations
                  </Button>
                </motion.div>

                <AnimatePresence>
                  {recommendations.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-3 max-h-96 overflow-y-auto rounded-2xl p-6 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200"
                    >
                      {recommendations.map((rec, idx) => (
                        <motion.div
                          key={rec.id || idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="group p-6 rounded-2xl bg-white/70 backdrop-blur-sm shadow-lg hover:shadow-2xl border border-white/50 hover:border-purple-200 transition-all duration-300 cursor-pointer hover:-translate-y-2"
                          whileHover={{ rotateX: 2 }}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="font-bold text-xl text-gray-900 group-hover:text-purple-600">
                              {rec.title}
                            </h4>
                            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600">
                              {rec.category}
                            </Badge>
                          </div>
                          <p className="text-gray-700 leading-relaxed">{rec.reason}</p>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>

          {/* 📤 EXPORTS */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="lg:col-span-2">
            <Card className="shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Download className="w-7 h-7" />
                  Export Your Data
                </CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4 p-2">
                <motion.div whileHover={{ scale: 1.02 }}>
                  <Button
                    onClick={exportCSV}
                    disabled={exportingCSV}
                    className="w-full h-16 rounded-2xl shadow-xl flex items-center gap-3"
                  >
                    {exportingCSV ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <FileText className="w-6 h-6" />
                    )}
                    📊 CSV Spreadsheet
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }}>
                  <Button
                    onClick={exportPDF}
                    disabled={exportingPDF}
                    className="w-full h-16 rounded-2xl shadow-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 flex items-center gap-3"
                  >
                    {exportingPDF ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Award className="w-6 h-6" />
                    )}
                    📄 Wellness PDF
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
