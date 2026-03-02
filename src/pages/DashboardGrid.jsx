import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@clerk/clerk-react'
import { useAppDispatch, useAppSelector } from '../hooks'
import { setHabits, setLoading } from '../store/habitsSlice'
import { toast } from 'sonner'
import WellnessScoreCard from './WellnessScoreCard'
import QuickStatsCard from './QuickStatsCard'
import DailyRemindersCard from './DailyRemindersCard'
import TodaysHabitsCard from './TodaysHabitsCard'
import TopStreaksCard from './TopStreaksCard'

export default function DashboardGrid() {
  const { getToken, userId } = useAuth()
  const dispatch = useAppDispatch()
  const { habits, wellnessScore, streaks, loading } = useAppSelector(state => state.habits)

  const loadData = async () => {
    if (!userId) return
    
    try {
      dispatch(setLoading(true))
      const token = await getToken()
      
      // ✅ CRACO FIX: window.ENV instead of import.meta.env
      const API_URL = window.ENV?.VITE_API_URL || 'https://healthy-habits-be-1.onrender.com/api'
      console.log('🔍 API URL:', `${API_URL}/habits`)
      
      const response = await fetch(`${API_URL}/habits`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      // ✅ CRITICAL: Check response FIRST
      console.log('📡 Response status:', response.status, response.statusText)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Backend error:', response.status, errorText)
        throw new Error(`HTTP ${response.status}: ${errorText.slice(0, 100)}`)
      }
      
      // ✅ Check Content-Type before JSON parse
      const contentType = response.headers.get('content-type')
      if (!contentType?.includes('application/json')) {
        const text = await response.text()
        console.error('❌ Not JSON:', contentType, text.slice(0, 200))
        throw new Error('Server returned HTML, not JSON')
      }
      
      const data = await response.json()
      console.log('✅ Habits data:', data)
      
      dispatch(setHabits(data.habits || data || []))
      dispatch(setLoading(false))
      toast.success(`✅ ${data.habits?.length || 0} habits loaded!`)
      
    } catch (error) {
      console.error('💥 Full error:', error)
      dispatch(setLoading(false))
      toast.error(`Failed to load habits: ${error.message}`)
    }
  }

  useEffect(() => {
    loadData()
  }, [userId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="flex flex-col items-center space-y-4 p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          <p className="text-lg text-muted-foreground">Loading habits...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-24">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="lg:col-span-2">
        <WellnessScoreCard score={wellnessScore || 0} />
      </motion.div>
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
        <QuickStatsCard habits={habits} streaks={streaks || []} />
      </motion.div>
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
        <DailyRemindersCard habitsLength={habits.length} onSendReminder={() => toast.success(`✅ Reminders for ${habits.length} habits!`)} />
      </motion.div>
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="lg:col-span-2">
        <TodaysHabitsCard habits={habits} onLogHabit={habitId => toast.success('✅ Habit logged!')} />
      </motion.div>
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
        <TopStreaksCard streaks={streaks || []} />
      </motion.div>
    </div>
  )
}
