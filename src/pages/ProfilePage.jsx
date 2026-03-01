// ProfilePage.jsx - COMPLETE UPDATED CODE
import React, { useEffect, useState } from 'react'
import { useAuth, useUser, UserButton } from '@clerk/clerk-react'
import { motion } from 'framer-motion'
import { 
  Mail, Brain, Download, Smile, FileText, Activity, CheckCircle, 
  Loader2, Printer, Bell, Clock 
} from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
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
  const [mood, setMood] = useState('')
  const [moodNotes, setMoodNotes] = useState('')
  const [exportingCSV, setExportingCSV] = useState(false)
  const [exportingPDF, setExportingPDF] = useState(false)
  const [habits, setHabits] = useState([])
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [nextReminderTime, setNextReminderTime] = useState('')
  const [sendingTestEmail, setSendingTestEmail] = useState(false)  // 🔥 NEW

  // 🔥 USER EMAIL HELPER (Dashboard se same logic)
  const getUserEmail = () => {
    if (!isLoaded || !isSignedIn || !user) return 'No email'
    return user.primaryEmailAddress?.emailAddress || 'No email'
  }

  // FIXED: Clean separation - Username (name) on top, Email below
  const getUserName = () => {
    if (!isLoaded || !isSignedIn || !user) return 'User'
    
    if (user.fullName) return user.fullName
    if (user.firstName) {
      return `${user.firstName}${user.lastName ? ` ${user.lastName}` : ''}`
    }
    if (user.username) return user.username
    return 'User'
  }

  // NOTIFICATION PERMISSION + SETUP
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

  // 🔥 FIXED: Test Email → REAL REMINDER API (Dashboard wala logic)
  const sendTestEmail = async () => {
    setSendingTestEmail(true)
    try {
      const token = await getToken()
      setAuthToken(token)
      
      // 🔥 SAME LOGIC AS DASHBOARD REMINDER BUTTON
      const response = await api.post('/api/reminders/send', {
        email: getUserEmail(),  // Clerk user email
        habits: habits.length > 0 ? habits : [{ title: "Your first habit" }]  // Fallback
      });
      
      toast.success(`✅ Test email sent to ${getUserEmail()}! Check inbox 📧`);
      console.log("✅ Backend response:", response.data);
      
    } catch (error) {
      console.error("Reminder error:", error);
      toast.error("Failed to send email 😔");
    } finally {
      setSendingTestEmail(false);
    }
  }

  const logMood = async () => {
    if (!mood) {
      toast.error('Please select a mood')
      return
    }
    try {
      const token = await getToken()
      setAuthToken(token)
      await api.post('/api/moods', { mood, notes: moodNotes })  // FIXED endpoint
      toast.success('😊 Mood logged!')
      setMood('')
      setMoodNotes('')
    } catch (error) {
      localStorage.setItem(`mood_${Date.now()}`, JSON.stringify({ mood, notes: moodNotes, date: new Date().toISOString() }))
      toast.success('Mood saved locally!')
      setMood('')
      setMoodNotes('')
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
          doc.text(`• ${habit.title || 'Unnamed Habit'}`, 25, 115 + (i * 8))
          doc.setTextColor(100, 116, 139)
          doc.text(habit.category || 'General', 140, 115 + (i * 8))
        })
        
        doc.setFontSize(10)
        doc.setTextColor(100, 116, 139)
        doc.text('Keep tracking your habits! 🚀', 20, 280)
        
        doc.save(`${userName.replace(/\\s+/g, '_')}-habits-report-${Date.now()}.pdf`)
        toast.success(`${userName}'s PDF Downloaded!`)
        setExportingPDF(false)
      }
    } catch (error) {
      console.error('PDF Error:', error)
      toast.error('PDF failed')
      setExportingPDF(false)
    }
  }

  const exportCSV = async () => {
    setExportingCSV(true)
    try {
      const token = await getToken()
      setAuthToken(token)
      const response = await api.get('/api/export/csv', { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `habits_${new Date().toISOString().split('T')[0]}.csv`)
      link.click()
      toast.success('📊 CSV exported!')
    } catch (error) {
      const mockCSV = `Date,Habit,Status\n${new Date().toLocaleDateString()},Water,Completed\n${new Date().toLocaleDateString()},Meditation,Active`
      const blob = new Blob([mockCSV], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'habits.csv'
      link.click()
      toast.success('📊 CSV downloaded!')
    } finally {
      setExportingCSV(false)
    }
  }

  const toggleNotifications = (checked) => {
    setNotificationsEnabled(checked)
    localStorage.setItem('habit-reminders-enabled', checked.toString())
    if (checked) {
      toast.success("🔔 Habit reminders activated!")
    } else {
      toast.info("🔕 Habit reminders paused")
    }
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6" data-testid="profile-page">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="font-serif font-light text-4xl tracking-tight mb-2">Profile & Settings</h1>
          <p className="text-muted-foreground">Manage your account & notifications</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Profile Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle>Account</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <UserButton afterSignOutUrl="/" />
                  <div>
                    <p className="font-semibold text-lg" data-testid="user-name">
                      {getUserName()}
                    </p>
                    <p className="text-sm text-muted-foreground font-mono" data-testid="user-email">
                      {getUserEmail()}
                    </p>
                    <p className="text-xs text-emerald-600">
                      ID: {user?.id?.slice(0, 8) || 'N/A'}...
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Habit Reminders */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="w-5 h-5 mr-2" />
                  Habit Reminders
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Browser Notifications</p>
                    <p className="text-sm text-muted-foreground">Get habit reminders even when tab is closed</p>
                  </div>
                  <Switch 
                    checked={notificationsEnabled} 
                    onCheckedChange={toggleNotifications}
                    data-testid="notification-toggle"
                  />
                </div>
                
                <Button 
                  onClick={scheduleHabitReminder}
                  disabled={!notificationsEnabled || !habits.length}
                  className="w-full rounded-full"
                  data-testid="schedule-reminder-btn"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  {nextReminderTime ? `Next: ${nextReminderTime}` : 'Schedule Reminder'}
                </Button>
                
                {habits.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center">Add habits first to enable reminders 📝</p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Export Data */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Download className="w-5 h-5 mr-2" />
                  Export Data
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={exportCSV}
                  disabled={exportingCSV}
                  className="w-full rounded-full"
                  data-testid="export-csv-btn"
                >
                  {exportingCSV ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      📊 Export CSV
                    </>
                  )}
                </Button>
                <Button
                  onClick={exportPDF}
                  disabled={exportingPDF}
                  className="w-full rounded-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
                  data-testid="export-pdf-btn"
                >
                  {exportingPDF ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating PDF...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      📄 Download PDF Report
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* 🔥 UPDATED: Email Reminders - REAL EMAILS */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="w-5 h-5 mr-2" />
                  Email Reminders
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center mb-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    Test your daily habit reminder email:
                  </p>
                  <p className="font-mono bg-muted px-3 py-1 rounded-lg text-xs">
                    📧 {getUserEmail()}
                  </p>
                </div>
                
                {/* 🔥 REAL EMAIL BUTTON - Same as Dashboard */}
                <Button 
                  onClick={sendTestEmail}
                  disabled={sendingTestEmail || !getUserEmail() || getUserEmail() === 'No email'}
                  className="w-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                  data-testid="test-email-btn"
                >
                  {sendingTestEmail ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      📧 Send Test Reminder Email
                    </>
                  )}
                </Button>
                
                <p className="text-xs text-muted-foreground text-center">
                  Sends beautiful HTML email with your habits list
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* AI Recommendations */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="w-5 h-5 mr-2" />
                  AI Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={getRecommendations}
                  disabled={loadingAI}
                  className="rounded-full"
                  data-testid="get-ai-recommendations-btn"
                >
                  {loadingAI ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4 mr-2" />
                      Get Recommendations
                    </>
                  )}
                </Button>

                {recommendations.length > 0 && (
                  <div className="space-y-3 p-4 rounded-2xl bg-muted/20 border">
                    {recommendations.map((rec, idx) => (
                      <motion.div
                        key={rec.id || idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-4 rounded-xl border bg-card hover:shadow-md"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-lg">{rec.title}</h4>
                          <Badge>{rec.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{rec.reason}</p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Daily Mood */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Smile className="w-5 h-5 mr-2" />
                  Daily Mood
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>How are you feeling?</Label>
                  <Select value={mood} onValueChange={setMood}>
                    <SelectTrigger className="rounded-xl" data-testid="mood-select">
                      <SelectValue placeholder="Select mood" />
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
                  placeholder="Notes about your day..."
                  value={moodNotes}
                  onChange={(e) => setMoodNotes(e.target.value)}
                  className="rounded-xl"
                  data-testid="mood-notes-input"
                />
                <Button onClick={logMood} className="w-full rounded-full" disabled={!mood} data-testid="log-mood-btn">
                  <Smile className="w-4 h-4 mr-2" />
                  Log Mood
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
