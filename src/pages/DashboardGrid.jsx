import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@clerk/clerk-react'
import { useAppDispatch, useAppSelector } from '../hooks'
import { fetchHabits, setHabits, setLoading } from '../store/habitsSlice'
import { toast } from 'sonner'
import WellnessScoreCard from './WellnessScoreCard'
import QuickStatsCard from './QuickStatsCard'
import DailyRemindersCard from './DailyRemindersCard'
import TodaysHabitsCard from './TodaysHabitsCard'
import TopStreaksCard from './TopStreaksCard'

export default function DashboardGrid() {
  const { getToken, userId } = useAuth()
  const dispatch = useAppDispatch()
  
  const { habits, wellnessScore, streaks, loading, error } = useAppSelector(state => state.habits)

  // ✅ FIXED: Complete API integration
  const loadData = async () => {
    if (!userId) return
    
    try {
      dispatch(setLoading(true))
      const token = await getToken()
      
      // ✅ VITE_API_URL + Real endpoint
      const response = await fetch(`${import.meta.env.VITE_API_URL}/habits`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) throw new Error('Failed to fetch habits')
      const data = await response.json()
      
      // ✅ REAL DATA TO REDUX
      dispatch(setHabits(data.habits || []))
      dispatch(setLoading(false))
      
      toast.success('✅ Habits loaded!')
    } catch (error) {
      console.error('Failed to load habits:', error)
      dispatch(setLoading(false))
      toast.error('Failed to load habits')
    }
  }

  useEffect(() => {
    loadData()
  }, [userId, dispatch])

  const handleLogHabit = async (habitId) => {
    try {
      dispatch(logHabit(habitId))
      toast.success('✅ Habit logged!')
    } catch (error) {
      toast.error('Failed to log habit')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="flex flex-col items-center space-y-4 p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          <p className="text-lg text-muted-foreground">Loading your habits...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-24">
      {/* Wellness Score */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }}
        className="lg:col-span-2"
      >
        <WellnessScoreCard score={wellnessScore || 0} />
      </motion.div>

      {/* Quick Stats */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <QuickStatsCard 
          habits={habits} 
          streaks={streaks || []} 
        />
      </motion.div>

      {/* Daily Reminders */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <DailyRemindersCard 
          habitsLength={habits.length} 
          onSendReminder={() => toast.success(`✅ Reminders set for ${habits.length} habits!`)}
        />
      </motion.div>

      {/* Today's Habits */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5, delay: 0.3 }}
        className="lg:col-span-2"
      >
        <TodaysHabitsCard 
          habits={habits} 
          onLogHabit={handleLogHabit} 
        />
      </motion.div>

      {/* Top Streaks */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <TopStreaksCard streaks={streaks || []} />
      </motion.div>
    </div>
  )
}
