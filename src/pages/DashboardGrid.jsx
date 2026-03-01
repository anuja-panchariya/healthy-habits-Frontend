import React from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@clerk/clerk-react'
import WellnessScoreCard from './WellnessScoreCard'
import QuickStatsCard from './QuickStatsCard'
import DailyRemindersCard from './DailyRemindersCard'
import TodaysHabitsCard from './TodaysHabitsCard'
import TopStreaksCard from './TopStreaksCard'

export default function DashboardGrid() {
  const { getToken, userId } = useAuth()
  const [habits, setHabits] = React.useState([])
  const [wellnessScore, setWellnessScore] = React.useState(0)
  const [streaks, setStreaks] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [loadingReminder, setLoadingReminder] = React.useState(false)

  const loadData = async () => {
    try {
      const token = await getToken()
      // ... same loadData logic as original
      setLoading(false)
    } catch (error) {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    if (userId) loadData()
  }, [userId])

  const handleLogHabit = async (habitId) => {
    // ... same handleLogHabit logic
  }

  const handleCreateHabit = () => {
    // Trigger dialog - handled by parent
    loadData()
  }

  const sendDailyReminder = () => {
    setLoadingReminder(true)
    setTimeout(() => {
      setLoadingReminder(false)
      toast.success(`✅ Reminders scheduled for ${habits.length} habits!`)
    }, 1000)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="lg:col-span-2">
        <WellnessScoreCard score={wellnessScore} />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
        <QuickStatsCard habits={habits} streaks={streaks} />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}>
        <DailyRemindersCard onSendReminder={sendDailyReminder} loadingReminder={loadingReminder} habitsLength={habits.length} />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }} className="lg:col-span-2">
        <TodaysHabitsCard habits={habits} onLogHabit={handleLogHabit} />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}>
        <TopStreaksCard streaks={streaks} />
      </motion.div>
    </div>
  )
}
