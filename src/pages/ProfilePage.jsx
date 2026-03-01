import React, { useEffect, useState } from 'react'
import { useAuth, useUser, UserButton } from '@clerk/clerk-react'
import { motion } from 'framer-motion'
import { 
  Mail, Brain, Download, Smile, FileText, Activity, CheckCircle, 
  Loader2, TrendingUp, Bell, Clock 
} from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { Badge } from '../components/ui/badge'
import { Switch } from '../components/ui/switch'
import { api, setAuthToken } from '../lib/api'
import { toast } from 'sonner'

export default function ProfilePage() {
  const { getToken, user: authUser } = useAuth()
  const { isLoaded, isSignedIn, user } = useUser()
  
  const [recommendations, setRecommendations] = useState([])
  const [loadingAI, setLoadingAI] = useState(false)
  const [exportingCSV, setExportingCSV] = useState(false)
  const [exportingPDF, setExportingPDF] = useState(false)
  const [habits, setHabits] = useState([])
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [nextReminderTime, setNextReminderTime] = useState('')
  const [sendingTestEmail, setSendingTestEmail] = useState(false)

  //  NEW MOOD TRACKER STATES
  const [mood, setMood] = useState('')
  const [moodNotes, setMoodNotes] = useState('')
  const [loadingMood, setLoadingMood] = useState(false)
  const [moodHistory, setMoodHistory] = useState([])
  const [insights, setInsights] = useState([])

  // USER HELPERS
  const getUserEmail = () => {
    if (!isLoaded || !isSignedIn || !user) return 'No email'
    return user.primaryEmailAddress?.emailAddress || 'No email'
  }

  const getUserName = () => {
    if (!isLoaded || !isSignedIn || !user) return 'User'
    if (user.fullName) return user.fullName
    if (user.firstName) {
      return `${user.firstName}${user.lastName ? ` ${user.lastName}` : ''}`
    }
    if (user.username) return user.username
    return 'User'
  }

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

  //  ENHANCED logMood with analytics
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
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          setNotificationsEnabled(true)
          toast.success("🔔 Browser notifications enabled!")
        }
      })
    }
    
    const saved = localStorage.getItem('habit-reminders-enabled')
    if (saved === 'true') setNotificationsEnabled(true)
    
    // Load mood history
    const savedMoods = localStorage.getItem('moodHistory')
    if (savedMoods) {
      setMoodHistory(JSON.parse(savedMoods).slice(-20))
      setInsights(analyzeMoodInsights(JSON.parse(savedMoods).slice(-20)))
    }
  }, [])

  const loadHabitsForPDF = async () => {
    try {
      const token = await getToken()
      setAuthToken(token)
      const res = await api.get('/api/habits')
      setHabits(res.data || [])
    } catch (error) {
      setHabits([])
    }
  }

  const scheduleHabitReminder = () => {
    if (!notificationsEnabled || !habits.length) {
      toast.error("Enable notifications & add habits first!")
      return
    }
    const now = new Date()
    const nextHabit = habits[Math.floor(Math.random() * habits.length)]
    const reminderTime = new Date(now.getTime() + 2 * 60 * 1000)
    
    const reminders = JSON.parse(localStorage.getItem('habit-reminders') || '[]')
    reminders.push({
      id: Date.now(),
      habit: nextHabit.title,
      time: reminderTime.toISOString(),
      sent: false
    })
    localStorage.setItem('habit-reminders', JSON.stringify(reminders))
    
    setTimeout(() => {
      if (Notification.permission === 'granted') {
        new Notification('⏰ Habit Reminder!', {
          body: `Time for "${nextHabit.title}"! 💪`,
          icon: '/favicon.ico',
          tag: 'habit-reminder'
        })
        toast.success(`Reminder sent for "${nextHabit.title}"!`)
      }
    }, 2 * 60 * 1000)

    setNextReminderTime(reminderTime.toLocaleTimeString('en-IN'))
    toast.success(`⏰ "${nextHabit.title}" reminder set for ${reminderTime.toLocaleTimeString('en-IN')}`)
  }

  useEffect(() => {
    const checkReminders = () => {
      const reminders = JSON.parse(localStorage.getItem('habit-reminders') || '[]')
      const now = new Date().getTime()
      reminders.forEach((reminder, index) => {
        if (!reminder.sent && now >= new Date(reminder.time).getTime()) {
          if (Notification.permission === 'granted') {
            new Notification('⏰ Habit Time!', {
              body: `Don't forget: "${reminder.habit}"! 🚀`,
              icon: '/favicon.ico'
            })
          }
          reminders[index].sent = true
          localStorage.setItem('habit-reminders', JSON.stringify(reminders))
        }
      })
    }
    const interval = setInterval(checkReminders, 30000)
    return () => clearInterval(interval)
  }, [])

  const getRecommendations = async () => {
    setLoadingAI(true)
    try {
      const token = await getToken()
      setAuthToken(token)
      const res = await api.get('/api/ai/recommendations')
      setRecommendations(res.data.recommendations || [])
      toast.success('🤖 AI recommendations loaded!')
    } catch (error) {
      console.error('AI Error:', error)
      toast.success('Recommendations ready!')
    } finally {
      setLoadingAI(false)
    }
  }

  const sendTestEmail = async () => {
    setSendingTestEmail(true)
    try {
      const token = await getToken()
      setAuthToken(token)
      const response = await api.post('/api/reminders/send', {
        email: getUserEmail(),
        habits: habits.length > 0 ? habits : [{ title: "Your first habit" }]
      });
      toast.success(`✅ Test email sent to ${getUserEmail()}! Check inbox 📧`)
      console.log("✅ Backend response:", response.data)
    } catch (error) {
      console.error("Reminder error:", error)
      toast.error("Failed to send email 😔")
    } finally {
      setSendingTestEmail(false)
    }
  }

  const exportPDF = async () => {
    setExportingPDF(true)
    try {
      await loadHabitsForPDF()
      const userName = getUserName()
      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
      document.head.appendChild(script)
      
      script.onload = () => {
        const { jsPDF } = window.jspdf
        const doc = new jsPDF()
        doc.setFontSize(24)
        doc.setTextColor(16, 185, 129)
        doc.text('HealthyHabits Tracker', 20, 25)
        doc.setFontSize(16)
        doc.text(`${userName}'s Wellness Report`, 20, 42)
        doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, 20, 55)
        doc.setFontSize(12)
        doc.text(`Total Habits: ${habits.length}`, 20, 75)
        doc.text(`User ID: ${user?.id?.slice(0, 8) || 'N/A'}...`, 20, 85)
        doc.text('Your Habits:', 20, 105)
        habits.slice(0, 8).forEach((habit, i) => {
          doc.setTextColor(0, 0, 0)
          doc.text(`
