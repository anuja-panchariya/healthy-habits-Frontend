import React, { useEffect, useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { motion } from 'framer-motion'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
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

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)
      const token = await getToken()
      setAuthToken(token)

      // ✅ REAL BACKEND CALLS - Exact backend routes
      const [trendsRes, categoryRes, wellnessRes] = await Promise.all([
        api.get('/analytics/trends?period=week'),                    // Backend route ✓
        api.get('/analytics/category-stats'),                        // Backend route ✓
        api.get('/analytics/habits/wellness-score')                  // Backend route ✓
      ])

      // ✅ REAL DATA SET
      setTrends(trendsRes.data || [])
      setCategoryStats(categoryRes.data || [])
      setWellnessScore(wellnessRes.data?.score || 0)
      
      toast.success('📊 Real analytics loaded!')
    } catch (error) {
      console.error('Analytics error:', error)
      setError('Failed to load analytics data')
      toast.error('Analytics temporarily unavailable')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          <p className="text-lg text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md mx-auto text-center p-8"
        >
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-serif font-light mb-2">Analytics Unavailable</h2>
          <p className="text-muted-foreground mb-6">No habit data yet or server issue</p>
          <div className="space-y-2">
            <button 
              onClick={loadAnalytics}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all w-full"
            >
              Retry
            </button>
            <p className="text-sm text-muted-foreground">
              Create some habits first → Analytics will populate automatically
            </p>
          </div>
        </motion.div>
      </div>
    )
  }

  const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EF4444']

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6" data-testid="analytics-page">
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-serif font-light text-5xl tracking-tight mb-2 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            Analytics
          </h1>
          <p className="text-xl text-muted-foreground">Your habit performance insights</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Weekly Trends - Full Width */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2"
          >
            <Card className="border-0 shadow-2xl bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <TrendingUp className="w-7 h-7 mr-3 bg-green-500/20 p-2 rounded-2xl text-green-600" />
                  Weekly Completion Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                {trends.length > 0 ? (
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={trends}>
                      <defs>
                        <linearGradient id="trendGradient" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#10B981" stopOpacity={0.8}/>
                          <stop offset="100%" stopColor="#10B981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" vertical={false} />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={14} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={14} />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '16px',
                          boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="completionRate"
                        stroke="#10B981"
                        strokeWidth={4}
                        strokeLinecap="round"
                        dot={{ fill: '#10B981', strokeWidth: 2 }}
                        name="Completion Rate (%)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-80 flex items-center justify-center">
                    <p className="text-muted-foreground text-lg">No trend data yet. Track habits for 7+ days!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Category Performance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="border-0 shadow-2xl bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <BarChart3 className="w-6 h-6 mr-3 bg-blue-500/20 p-2 rounded-xl text-blue-600" />
                  Category Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                {categoryStats.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={categoryStats} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                      <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                      <YAxis dataKey="category" type="category" stroke="hsl(var(--muted-foreground))" width={120} />
                      <Tooltip />
                      <Bar dataKey="completionRate" fill="#3B82F6" radius={[8, 8, 0, 0]} name="Completion Rate" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-72 flex items-center justify-center rounded-xl bg-muted/30">
                    <p className="text-muted-foreground">Complete some habits by category</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Wellness Score */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-emerald-500/10 to-blue-500/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Target className="w-6 h-6 mr-3 bg-gradient-to-r from-emerald-500 to-green-600 p-2 rounded-xl text-white bg-opacity-20" />
                  Overall Wellness Score
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-5xl font-serif font-light mb-4" style={{color: `hsl(${wellnessScore * 3.6}, 70%, 45%)`}}>
                  {wellnessScore}%
                </div>
                <p className="text-muted-foreground mb-6">Based on your habit consistency</p>
                <div className="w-full bg-muted rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-emerald-500 to-blue-500 h-3 rounded-full transition-all duration-1000"
                    style={{width: `${wellnessScore}%`}}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Refresh Button */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="text-center pt-12"
        >
          <button
            onClick={loadAnalytics}
            className="px-8 py-3 bg-primary/90 hover:bg-primary text-primary-foreground rounded-2xl font-medium transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
          >
            🔄 Refresh Analytics
          </button>
        </motion.div>
      </div>
    </div>
  )
}
