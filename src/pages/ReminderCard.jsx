import React, { useState, useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { Bell, Clock, Loader2 } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Switch } from '../components/ui/switch'
import { toast } from 'sonner'
import { api, setAuthToken } from '../lib/api'

export default function ReminderCard() {
  const { getToken } = useAuth()
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [nextReminderTime, setNextReminderTime] = useState('')
  const [habits, setHabits] = useState([])

  useEffect(() => {
    const saved = localStorage.getItem('habit-reminders-enabled')
    if (saved === 'true') setNotificationsEnabled(true)
    
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          setNotificationsEnabled(true)
          toast.success("🔔 Browser notifications enabled!")
        }
      })
    }
  }, [])

  const toggleNotifications = (checked) => {
    setNotificationsEnabled(checked)
    localStorage.setItem('habit-reminders-enabled', checked.toString())
    toast.success(checked ? "🔔 Habit reminders activated!" : "🔕 Habit reminders paused")
  }

  const scheduleHabitReminder = async () => {
    if (!notificationsEnabled || !habits.length) {
      toast.error("Enable notifications & add habits first!")
      return
    }
    // ... reminder logic (same as original)
  }

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bell className="w-5 h-5 mr-2" />
          Habit Reminders
        </CardTitle>
      </CardHeader>
      {/* Rest of reminder UI */}
    </Card>
  )
}
