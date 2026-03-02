import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@clerk/clerk-react'
import { useAppDispatch, useAppSelector } from '../hooks'
import { fetchHabits, logHabit, setLoading } from '../store/habitsSlice'
import { toast } from 'sonner'
import WellnessScoreCard from './WellnessScoreCard'
import QuickStatsCard from './QuickStatsCard'
import DailyRemindersCard from './DailyRemindersCard'
import TodaysHabitsCard from './TodaysHabitsCard'
import TopStreaksCard from './TopStreaksCard'

export default function DashboardGrid() {
  const { getToken, userId } = useAuth()
  const dispatch = useAppDispatch()
  
  //  FULL REDUX SELECTOR
  const { habits, wellnessScore, streaks, loading, loadingReminder, error } = useAppSelector(state => state.habits)

  // REDUX ACTION - Fetch habits from API
  const loadData = async () => {
    if (!userId) return
    
    try {
      dispatch(setLoading(true))
      const token = await getToken()
      
      // Real API call (replace with your endpoint)
      const response = await fetch('/api/habits', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await response.json()
      
      dispatch(fetchHabits()) // Optimistic update
      // dispatch(setHabits(data.habits)) // Real data
    } catch (error) {
      console.error('Failed to load habits:', error)
      dispatch(setLoading(false))
    }
  }

  useEffect(() => {
    if (userId) {
      loadData()
    }
  }, [userId, dispatch])

  // REDUX ACTION - Log habit
  const handleLogHabit = async (habitId) => {
    try {
      dispatch(logHabit(habitId))
      toast.success('✅ Habit logged successfully!')
    } catch (error) {
      toast.error('Failed to log habit')
    }
  }

  const handleCreateHabit = () => {
    loadData() // Refresh after creating new habit
  }

  const sendDailyReminder = () => {
    toast.success(`✅ Reminders scheduled for ${habits.length} habits!`)
  }

  //  REDUX LOADING STATE
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          <p className="text-muted-foreground">Loading your habits...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Wellness Score - 2x width */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.4 }}
        className="lg:col-span-2"
      >
        <WellnessScoreCard score={wellnessScore} />
      </motion.div>

      {/* Quick Stats */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <QuickStatsCard habits={habits} streaks={streaks} />
      </motion.div>

      {/* Daily Reminders */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <DailyRemindersCard 
          onSendReminder={sendDailyReminder} 
          loadingReminder={loadingReminder} 
          habitsLength={habits.length} 
        />
      </motion.div>

      {/* Today's Habits - 2x width */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.4, delay: 0.2 }}
        className="lg:col-span-2"
      >
        <TodaysHabitsCard habits={habits} onLogHabit={handleLogHabit} />
      </motion.div>

      {/* Top Streaks */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <TopStreaksCard streaks={streaks} />
      </motion.div>
    </div>
  )
}
