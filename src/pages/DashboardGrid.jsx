import React, { useEffect, useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@clerk/clerk-react'
import { toast } from 'sonner'

const DashboardGrid = () => {
  const { getToken, userId } = useAuth()
  const [habits, setHabits] = useState([])
  const [wellnessScore, setWellnessScore] = useState(0)
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    if (!userId) return
    
    try {
      setLoading(true)
      const token = await getToken()
      const API_URL = window.ENV?.VITE_API_URL || 'https://healthy-habits-be-1.onrender.com/api'
      
      // Habits
      const habitsRes = await fetch(`${API_URL}/habits`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const habitsData = await habitsRes.json()
      setHabits(habitsData.habits || [])
      
      // Wellness
      const wellnessRes = await fetch(`${API_URL}/habits/wellness-score`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const wellnessData = await wellnessRes.json()
      setWellnessScore(wellnessData.score || 0)
      
    } catch (error) {
      console.error('Load error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [userId])

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
      {/* Wellness - Full width */}
      <div className="lg:col-span-2">
        <WellnessScoreCard score={wellnessScore} />
      </div>
      
      <QuickStatsCard habits={habits} />
      <TodaysHabitsCard habits={habits} />
      
      <div className="lg:col-span-2">
        <DailyHabitsGrid habits={habits} />
      </div>
    </div>
  )
}
