import React, { useEffect, useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { api, setAuthToken } from '../lib/api'
import { toast } from 'sonner'
import { TrendingUp, BarChart3, Target, AlertCircle } from 'lucide-react'

export default function AnalyticsPage() {
  const { getToken } = useAuth()
  const [trends, setTrends] = useState([])
  const [categoryStats, setCategoryStats] = useState([])
  const [wellnessScore, setWellnessScore] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)
      const token = await getToken()
      setAuthToken(token)

      console.log('🔍 Loading analytics...')

      // ✅ Backend analytics routes (NO /api/ double prefix)
      const [trendsRes, statsRes, wellnessRes] = await Promise.all([
        api.get('/analytics/trends'),
        api.get('/analytics/category-stats'), 
        api.get('/analytics/wellness-score')
      ])

      setTrends(trendsRes.data || [])
      setCategoryStats(statsRes.data || [])
      setWellnessScore(wellnessRes.data?.score || 0)
      
      toast.success('📊 Analytics loaded!')
    } catch (error) {
      console.error('Analytics error:', error)
      setError('No habit data yet - create some habits first!')
      toast.info('Start tracking habits to see analytics!')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="flex flex-col items-center space-y-4 p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          <p className="text-lg text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6" data-testid="analytics-page">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="font-serif font-light text-5xl tracking-tight mb-4 bg-gradient-to-r from-foreground to-primary/80 bg-clip-text text-transparent">
            Analytics
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Track your progress and see insights from your habits
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Wellness Score Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-emerald-500/5 to-blue-500/5 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <Target className="w-7 h-7 mr-3 text-emerald-500" />
                  Wellness Score
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-green-600 mb-6">
                  {wellnessScore || 0}%
                </div>
                <div className="w-full bg-muted/50 rounded-full h-3 mb-2">
                  <div 
                    className="bg-gradient-to-r from-emerald-500 to-green-500 h-3 rounded-full transition-all duration-1000"
                    style={{ width: `${wellnessScore || 0}%` }}
                  />
                </div>
                <p className="text-muted-foreground">
                  {wellnessScore > 80 ? 'Excellent progress! 🎉' : 
                   wellnessScore > 50 ? 'Good consistency 💪' : 
                   'Keep building your habits 🌱'}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Trends Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="border-0 shadow-2xl backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-6 h-6 mr-3 text-green-500" />
                  Weekly Trends
                </CardTitle>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center">
                {trends.length > 0 ? (
                  <div className="text-center">
                    <div className="w-32 h-32 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl">
                      <span className="text-2xl font-bold text-white">{trends[trends.length-1]?.completionRate || 0}%</span>
                    </div>
                    <p className="text-muted-foreground">This week avg: {trends.reduce((sum, t) => sum + (t.completionRate || 0), 0) / trends.length || 0}%</p>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground">
                    <p>📈 Track habits for 7+ days</p>
                    <p className="text-sm mt-2">Charts will appear automatically!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Category Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="border-0 shadow-2xl backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-6 h-6 mr-3 text-blue-500" />
                  Category Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {categoryStats.length > 0 ? (
                  categoryStats.map((stat, idx) => (
                    <div key={idx} className="flex justify-between items-center p-4 bg-muted/30 rounded-xl">
                      <span className="font-medium">{stat.category}</span>
                      <span className="font-bold text-lg text-primary">{stat.completionRate}%</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>No category data yet</p>
                    <p className="text-sm mt-2">Complete habits to see breakdown!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="text-center pt-12"
        >
          <button
            onClick={loadAnalytics}
            className="px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 inline-flex items-center gap-2"
          >
            🔄 Refresh Analytics
          </button>
        </motion.div>
      </div>
    </div>
  )
}
