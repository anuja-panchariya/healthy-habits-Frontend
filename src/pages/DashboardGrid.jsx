import React, { useEffect, useMemo, useCallback } from 'react'
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
  const { habits, loading } = useAppSelector(state => state.habits)

  // ✅ LOCAL WELLNESS SCORE CALCULATION (No Redux!)
  const wellnessScore = useMemo(() => {
    if (!habits?.length) return 0
    
    let score = 50 // Base
    score += Math.min(habits.length * 8, 25) // Habits count
    score += Math.min(habits.filter(h => h.streak && h.streak > 0).length * 12, 25) // Streaks
    return Math.min(Math.round(score), 100)
  }, [habits])

  const loadData = useCallback(async () => {
    if (!userId) return
    if (habits.length > 0) {
      console.log('✅ Habits cached, skipping')
      return
    }
    
    try {
      dispatch(setLoading(true))
      const token = await getToken()
      const API_URL = window.ENV?.VITE_API_URL || 'https://healthy-habits-be-1.onrender.com/api'
      
      console.log('🔍 Loading habits:', `${API_URL}/habits`)
      const response = await fetch(`${API_URL}/habits`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      console.log('📡 Status:', response.status)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      
      const data = await response.json()
      console.log('✅ Habits loaded:', data)
      
      dispatch(setHabits(data.habits || data || []))
      dispatch(setLoading(false))
      toast.success(`✅ ${data.habits?.length || data.length || 0} habits loaded!`)
      
    } catch (error) {
      console.error('💥 Error:', error)
      dispatch(setLoading(false))
      toast.error(`Failed to load: ${error.message}`)
    }
  }, [userId, habits.length, dispatch, getToken])

  useEffect(() => {
    loadData()
  }, [loadData])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="flex flex-col items-center space-y-4 p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          <p className="text-lg text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  console.log('🏥 Wellness score:', wellnessScore)
  console.log('🎨 Habits for UI:', habits)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-24 p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }} 
        className="lg:col-span-2"
      >
        <WellnessScoreCard score={wellnessScore} />
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <QuickStatsCard habits={habits} streaks={[]} />
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <DailyRemindersCard 
          habitsLength={habits.length} 
          onSendReminder={() => toast.success(`✅ Reminders for ${habits.length} habits!`)} 
        />
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5, delay: 0.3 }} 
        className="lg:col-span-2"
      >
        <TodaysHabitsCard habits={habits} onLogHabit={habitId => toast.success('✅ Habit logged!')} />
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <TopStreaksCard streaks={[]} />
      </motion.div>
    </div>
  )
}
