import React, { useEffect, useCallback, useState } from 'react'
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
  const [wellnessScore, setWellnessScore] = useState(0)  // ✅ LOCAL STATE

  const loadData = useCallback(async () => {
    if (!userId || loading) return
    
    try {
      const token = await getToken()
      const API_URL = window.ENV?.VITE_API_URL || 'https://healthy-habits-be-1.onrender.com/api'
      
      // ✅ 1. Habits
      console.log('🔍 Loading habits...')
      const habitsResponse = await fetch(`${API_URL}/habits`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (habitsResponse.ok) {
        const habitsData = await habitsResponse.json()
        dispatch(setHabits(habitsData.habits || habitsData || []))
        console.log('✅ Habits loaded:', habitsData.length || 0)
      }

      // ✅ 2. REAL WELLNESS API
      console.log('🔍 Loading REAL wellness score...')
      const wellnessResponse = await fetch(`${API_URL}/habits/wellness-score`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (wellnessResponse.ok) {
        const wellnessData = await wellnessResponse.json()
        setWellnessScore(wellnessData.score || 0)
        console.log('🏥 REAL Wellness score:', wellnessData.score)
      } else {
        console.warn('⚠️ Wellness API failed, using 0')
        setWellnessScore(0)
      }
      
      dispatch(setLoading(false))
      
    } catch (error) {
      console.error('💥 Error:', error)
      dispatch(setLoading(false))
      setWellnessScore(0)
    }
  }, [userId, loading, dispatch, getToken, setWellnessScore])

  useEffect(() => {
    loadData()
  }, [loadData])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="flex flex-col items-center space-y-4 p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          <p className="text-lg text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-24">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="lg:col-span-2">
            <WellnessScoreCard score={wellnessScore} />
          </motion.div>
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
            <QuickStatsCard habits={habits} streaks={[]} />
          </motion.div>
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
            <DailyRemindersCard habitsLength={habits.length} onSendReminder={() => toast.success(`✅ Reminders for ${habits.length} habits!`)} />
          </motion.div>
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="lg:col-span-2">
            <TodaysHabitsCard habits={habits} onLogHabit={habitId => toast.success('✅ Habit logged!')} />
          </motion.div>
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
            <TopStreaksCard streaks={[]} />
          </motion.div>
        </div>
      </div>
    </div>
  )
}
