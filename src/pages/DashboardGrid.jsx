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

  // ✅ Wellness score from habits (LOCAL)
  const wellnessScore = useMemo(() => {
    if (!habits?.length) return 0
    let score = 50
    score += Math.min(habits.length * 8, 25)
    score += Math.min(habits.filter(h => h.streak && h.streak > 0).length * 12, 25)
    return Math.min(Math.round(score), 100)
  }, [habits])

  const loadData = useCallback(async () => {
    if (!userId || habits.length > 0) return
    
    try {
      dispatch(setLoading(true))
      const token = await getToken()
      const API_URL = window.ENV?.VITE_API_URL || 'https://healthy-habits-be-1.onrender.com/api'
      
      const response = await fetch(`${API_URL}/habits`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      
      const data = await response.json()
      dispatch(setHabits(data.habits || data || []))
      dispatch(setLoading(false))
      
    } catch (error) {
      console.error('Error:', error)
      dispatch(setLoading(false))
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
          <p className="text-lg text-gray-600">Loading habits...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-24">
          {/* Wellness Score - Span 2 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5 }}
            className="lg:col-span-2"
          >
            <WellnessScoreCard score={wellnessScore} />
          </motion.div>
          
          {/* Quick Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <QuickStatsCard habits={habits} streaks={[]} />
          </motion.div>
          
          {/* Daily Reminders */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <DailyRemindersCard 
              habitsLength={habits.length} 
              onSendReminder={() => toast.success(`✅ Reminders sent for ${habits.length} habits!`)}
            />
          </motion.div>
          
          {/* Today's Habits - Span 2 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: 0.3 }}
            className="lg:col-span-2"
          >
            <TodaysHabitsCard 
              habits={habits} 
              onLogHabit={habitId => toast.success(`✅ ${habitId ? 'Habit logged!' : 'Habit marked!'}`)}
            />
          </motion.div>
          
          {/* Top Streaks */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <TopStreaksCard streaks={[]} />
          </motion.div>
        </div>
      </div>
    </div>
  )
}
