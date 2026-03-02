import React, { useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@clerk/clerk-react'
import { useAppDispatch, useAppSelector } from '../hooks'
import { setHabits, setLoading, setWellnessScore } from '../store/habitsSlice'
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

  const loadData = useCallback(async () => {
    if (!userId) return
    
    // Prevent double calls
    if (habits.length > 0 && wellnessScore !== null) {
      console.log('✅ Data already loaded')
      return
    }
    
    try {
      dispatch(setLoading(true))
      const token = await getToken()
      const API_URL = window.ENV?.VITE_API_URL || 'https://healthy-habits-be-1.onrender.com/api'
      
      // ✅ 1. Habits API
      console.log('🔍 Loading habits...')
      const habitsResponse = await fetch(`${API_URL}/habits`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!habitsResponse.ok) throw new Error(`Habits: ${habitsResponse.status}`)
      const habitsData = await habitsResponse.json()
      console.log('✅ Habits:', habitsData)
      dispatch(setHabits(habitsData.habits || habitsData || []))

      // ✅ 2. Wellness Score API  
      console.log('🔍 Loading wellness score...')
      const wellnessResponse = await fetch(`${API_URL}/habits/wellness-score`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!wellnessResponse.ok) {
        console.warn('⚠️ Wellness score unavailable, using 0')
        dispatch(setWellnessScore(0))
      } else {
        const wellnessData = await wellnessResponse.json()
        console.log('🏥 Wellness score:', wellnessData)
        dispatch(setWellnessScore(wellnessData.score || 0))
      }
      
      dispatch(setLoading(false))
      toast.success(`✅ ${habitsData.habits?.length || habitsData.length || 0} habits loaded!`)
      
    } catch (error) {
      console.error('💥 Load error:', error)
      dispatch(setLoading(false))
      toast.error(`Load failed: ${error.message}`)
    }
  }, [userId, habits.length, wellnessScore, dispatch, getToken])

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
