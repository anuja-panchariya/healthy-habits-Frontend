import React, { useEffect, useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@clerk/clerk-react'
import { toast } from 'sonner'
import WellnessScoreCard from '../components/WellnessScoreCard'
import QuickStatsCard from '../components/QuickStatsCard'
import TodaysHabitsCard from '../components/TodaysHabitsCard'

export default function DashboardGrid() {
  const { getToken, userId } = useAuth()
  const [habits, setHabits] = useState([])
  const [wellnessScore, setWellnessScore] = useState(0)
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    if (!userId) return
    
    try {
      setLoading(true)
      const token = await getToken()
      const API_URL = window.ENV?.VITE_API_URL || 'https://healthy-habits-be-1.onrender.com/api'
      
      console.log('🔍 Loading habits...')
      
      // Habits
      const habitsRes = await fetch(`${API_URL}/habits`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const habitsData = await habitsRes.json()
      const habitsList = habitsData.habits || []
      setHabits(habitsList)
      console.log('✅ Habits loaded:', habitsList.length)
      
      // Wellness
      const wellnessRes = await fetch(`${API_URL}/habits/wellness-score`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const wellnessData = await wellnessRes.json()
      setWellnessScore(wellnessData.score || 0)
      console.log('🏥 Wellness score:', wellnessData.score)
      
    } catch (error) {
      console.error('Load error:', error)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [userId, getToken])

  useEffect(() => {
    loadData()
  }, [loadData])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-24">
          {/* Wellness Score */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="lg:col-span-2"
          >
            <WellnessScoreCard score={wellnessScore} />
          </motion.div>
          
          {/* Quick Stats */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <QuickStatsCard habits={habits} />
          </motion.div>
          
          {/* Today's Habits */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <TodaysHabitsCard habits={habits} />
          </motion.div>
        </div>
      </div>
    </div>
  )
}

