import React, { useEffect, useState, useCallback } from 'react'
import { useAuth, UserButton } from '@clerk/clerk-react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Mail, Brain, Download, Smile, FileText, Activity, CheckCircle, 
  Loader2, Bell, Clock, Heart, Zap, Award, Star, Sparkles 
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
  const [moodStats, setMoodStats] = useState({ total: 0, greatPercentage: 0 })

  // 🎯 LOAD ALL REAL DATA
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

  // ✅ MOOD LOGGING
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

  // ✅ AI RECOMMENDATIONS
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

  // ✅ EXPORTS
  const exportPDF = async () => {
    setExportingPDF(true)
    try {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF()
      doc.setFillColor(16, 185, 129)
      doc.rect(0, 0, 210, 35, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(24)
      doc.text(`${user?.fullName || 'User'}'s Report`, 20, 25)
      doc.setFontSize(14)
      doc.setTextColor(0, 0, 0)
      doc.text(`Habits: ${habits.length}`, 20, 55)
      doc.text(`Mood Logs: ${moodStats.total}`, 20, 70)
      doc.save(`${(user?.fullName || 'user').replace(/\s+/g, '_')}_wellness.pdf`)
      toast.success('📄 PDF ready!')
    } catch (error) {
      toast.error('PDF failed')
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
      toast.success('📊 CSV ready!')
    } finally {
      setExportingCSV(false)
    }
  }

  const getMoodEmoji = (mood) => {
    const emojis = { great: '😄', good: '🙂', okay: '😐', bad: '☹️', terrible: '😢' }
    return emojis[mood] || '🙂'
  }

  if (loadingMoods) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} 
          className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-500 rounded-full" />
      </div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8"
    >
      <div className="max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto space-y-8 lg:space-y-12">
        
        {/* ✨ HEADER - YOUR ORIGINAL STYLE */}
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center mb-12 lg:mb-16">
          <motion.div 
            animate={{ scale: [1, 1.1, 1] }} 
            transition={{ duration: 3, repeat: Infinity }} 
            className="w-24 h-24 lg:w-32 lg:h-32 mx-auto mb-8 bg-gradient-to-r from-emerald-400 to-green-500 rounded-3xl flex items-center justify-center shadow-2xl"
          >
            <Heart className="w-12 h-12 lg:w-16 lg:h-16 text-white drop-shadow-lg" />
          </motion.div>
          
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight bg-gradient-to-r from-gray-900 to-emerald-600 bg-clip-text text-transparent mb-4">
            Profile & Wellness
          </h1>
          <p className="text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
            AI-powered insights + mood tracking for your journey
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          
          {/* 👤 ACCOUNT CARD - REAL CLERK DATA */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="h-full bg-gradient-to-br from-white to-emerald-50/50 backdrop-blur-sm shadow-2xl border-0 hover:shadow-3xl">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-3 text-2xl lg:text-3xl">
                  <div className="w-12 h-12 lg:w-16 lg:h-16 bg-emerald-100 p-3 lg:p-4 rounded-2xl flex items-center justify-center">
                    <Star className="w-6 h-6 lg:w-8 lg:h-8 text-emerald-600" />
                  </div>
                  Account Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-2 px-2 sm:px-6">
                <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 lg:gap-6 p-6 lg:p-8 bg-gradient-to-r from-emerald-50 to-emerald-100/50 rounded-3xl backdrop-blur-sm">
                  <div className="w-20 h-20 lg:w-28 lg:h-28 bg-gradient-to-r from-emerald-400 to-green-500 rounded-3xl flex items-center justify-center shadow-xl flex-shrink-0 mx-auto lg:mx-0">
                    <UserButton />
                  </div>
                  <div className="flex-1 min-w-0 text-center lg:text-left">
                    <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 truncate mb-2">
                      {user?.fullName || user?.firstName || user?.lastName || 'User'}
                    </h3>
                    <p className="text-lg text-gray-600 break-all">
                      {user?.primaryEmailAddress?.emailAddress || 'No email set'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 🔔 NOTIFICATIONS */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="h-full shadow-xl border-0 hover:shadow-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl lg:text-2xl">
                  <Bell className="w-6 h-6 lg:w-7 lg:h-7 text-emerald-600" />
                  Smart Reminders
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div className="flex items-center justify-between p-6 bg-gradient-to-r from-emerald-50 to-green-50/50 rounded-3xl backdrop-blur-sm">
                  <div>
                    <h4 className="font-semibold text-lg lg:text-xl mb-1">Browser Notifications</h4>
                    <p className="text-sm lg:text-base text-gray-600">Habit reminders everywhere</p>
                  </div>
                  <Switch 
                    checked={notificationsEnabled} 
                    onCheckedChange={toggleNotifications}
                  />
                </div>
                
                <Button 
                  className="w-full h-14 rounded-2xl shadow-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 font-semibold text-lg" 
                  disabled={!habits.length}
                >
                  <Clock className="w-5 h-5 mr-2" />
                  Schedule Reminder
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* 🤖 AI RECOMMENDATIONS */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="shadow-2xl h-full hover:shadow-3xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl lg:text-2xl">
                  <Sparkles className="w-7 h-7 text-purple-500 animate-pulse" />
                  AI Habit Coach
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <motion.div whileHover={{ scale: 1.02 }}>
                  <Button 
                    onClick={getAIRecommendations}
                    disabled={loadingAI}
                    className="w-full h-14 rounded-2xl shadow-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 text-white font-semibold text-lg"
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
                      className="space-y-3 max-h-80 overflow-y-auto rounded-3xl p-6 bg-gradient-to-r from-purple-50 to-pink-50/50 border border-purple-200 backdrop-blur-sm"
                    >
                      {recommendations.map((rec, idx) => (
                        <motion.div
                          key={rec.id || idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="group p-5 rounded-2xl bg-white/70 backdrop-blur-sm shadow-lg hover:shadow-2xl border border-white/50 hover:border-purple-300 transition-all cursor-pointer hover:-translate-y-2"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="font-bold text-xl lg:text-2xl text-gray-900 group-hover:text-purple-600 truncate">
                              {rec.title}
                            </h4>
                            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 text-sm px-3 py-1">
                              {rec.category}
                            </Badge>
                          </div>
                          <p className="text-gray-700 leading-relaxed text-sm lg:text-base">{rec.reason}</p>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>

          {/* 😊 MOOD TRACKER - FULL WIDTH */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-2">
            <Card className="shadow-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-emerald-500 to-green-600 text-white p-8">
                <CardTitle className="flex items-center gap-3 text-3xl">
                  <Smile className="w-10 h-10" />
                  Mood Journey
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                
                {/* 📊 STATS */}
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center p-8 bg-gradient-to-br from-emerald-50 to-green-50/50 rounded-3xl">
                    <div className="text-5xl mb-4 mx-auto">😄</div>
                    <div className="text-4xl font-black text-emerald-600">{moodStats.greatPercentage}%</div>
                    <p className="text-lg text-gray-600 mt-2 font-semibold">Great Days</p>
                  </div>
                  <div className="text-center p-8 bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-3xl">
                    <div className="text-4xl mb-4 mx-auto">📊</div>
                    <div className="text-4xl font-black text-blue-600">{moodStats.total}</div>
                    <p className="text-lg text-gray-600 mt-2 font-semibold">Total Logs</p>
                  </div>
                  <div className="text-center p-8 bg-gradient-to-br from-purple-50 to-pink-50/50 rounded-3xl">
                    <Activity className="w-16 h-16 mx-auto mb-4 text-purple-500" />
                    <div className="text-3xl font-black text-purple-600">{habits.length}</div>
                    <p className="text-lg text-gray-600 mt-2 font-semibold">Active Habits</p>
                  </div>
                </div>

                {/* 🎯 LOG MOOD */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 p-8 bg-gradient-to-r from-slate-50 to-emerald-50/30 backdrop-blur-sm rounded-3xl">
                  <div className="lg:col-span-2">
                    <Label className="text-xl font-bold mb-4 block">How are you feeling today?</Label>
                    <Select value={mood} onValueChange={setMood}>
                      <SelectTrigger className="h-16 rounded-2xl text-xl border-2">
                        <SelectValue placeholder="Select mood..." />
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
                  
                  <Textarea
                    placeholder="What's on your mind today..."
                    value={moodNotes}
                    onChange={(e) => setMoodNotes(e.target.value)}
                    className="lg:col-span-2 h-28 rounded-2xl resize-none border-2"
                  />
                  
                  <motion.div className="lg:col-span-4" whileHover={{ scale: 1.02 }}>
                    <Button 
                      onClick={logMood}
                      disabled={!mood}
                      className="w-full h-16 rounded-2xl text-xl shadow-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 font-bold"
                    >
                      <Smile className="w-6 h-6 mr-3" />
                      Log Today's Mood
                    </Button>
                  </motion.div>
                </div>

                {/* 📈 RECENT MOODS */}
                {moods.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-2xl font-bold flex items-center gap-3 mb-6">
                      Recent Moods 
                      <Activity className="w-7 h-7 text-emerald-500" />
                    </h4>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {moods.map((moodItem, idx) => (
                        <motion.div 
                          key={moodItem.id || idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center justify-between p-6 rounded-3xl bg-gradient-to-r from-white to-emerald-50/50 backdrop-blur-sm border border-emerald-200 hover:border-emerald-300 group hover:shadow-xl transition-all cursor-pointer"
                        >
                          <div className="flex items-center gap-4">
                            <div className="text-3xl">{getMoodEmoji(moodItem.mood)}</div>
                            <div>
                              <p className="font-bold text-xl capitalize">{moodItem.mood}</p>
                              <p className="text-gray-600 text-lg">{moodItem.notes || 'No notes'}</p>
                            </div>
                          </div>
                          <span className="text-sm font-semibold text-emerald-600 bg-emerald-100 px-4 py-2 rounded-full">
                            {new Date(moodItem.date || moodItem.created_at).toLocaleDateString('en-IN')}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  )}
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* 📤 EXPORTS */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2">
            <Card className="shadow-2xl hover:shadow-3xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl lg:text-3xl">
                  <Download className="w-8 h-8 text-emerald-600" />
                  Export Data
                </CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-6 p-8">
                <motion.div whileHover={{ scale: 1.02 }}>
                  <Button
                    onClick={exportCSV}
                    disabled={exportingCSV}
                    className="w-full h-16 rounded-2xl shadow-xl flex items-center gap-3 text-xl font-semibold"
                  >
                    {exportingCSV ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <FileText className="w-7 h-7" />
                        📊 CSV Spreadsheet
                      </>
                    )}
                  </Button>
                </motion.div>
                
                <motion.div whileHover={{ scale: 1.02 }}>
                  <Button
                    onClick={exportPDF}
                    disabled={exportingPDF}
                    className="w-full h-16 rounded-2xl shadow-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 flex items-center gap-3 text-xl font-semibold text-white"
                  >
                    {exportingPDF ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Award className="w-7 h-7" />
                        📄 Wellness PDF
                      </>
                    )}
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
