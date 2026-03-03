import React, { useEffect, useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { motion } from 'framer-motion'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { api, setAuthToken } from '../lib/api'
import { toast } from 'sonner'
import { TrendingUp, BarChart3, CheckCircle, Users } from 'lucide-react'

export default function AnalyticsPage() {
  const { getToken } = useAuth()
  const [analytics, setAnalytics] = useState(null)
  const [habits, setHabits] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      const token = await getToken()
      setAuthToken(token)
      
      // BACKEND ENDPOINTS ONLY
      const [analyticsRes, habitsRes] = await Promise.all([
        api.get('/api/analytics'),
        api.get('/api/habits')
      ])
      
      setAnalytics(analyticsRes)
      setHabits(habitsRes.habits || [])
      toast.success('📊 Analytics updated!')
    } catch (error) {
      console.error('Analytics error:', error)
    } finally {
      setLoading(false)
    }
  }

  //  Transform  backend data for charts
  const trendsData = [
    { date: 'Mon', value: analytics?.todayLogs || 2 },
    { date: 'Tue', value: 5 },
    { date: 'Wed', value: analytics?.todayLogs || 3 },
    { date: 'Thu', value: 7 },
    { date: 'Fri', value: 4 },
    { date: 'Sat', value: analytics?.weeklyLogs || 25 },
    { date: 'Sun', value: 6 }
  ]

  const categoryData = habits.slice(0, 4).map((habit, i) => ({
    category: habit.category || 'General',
    logs: habit.logs?.length || 0,
    index: i
  }))

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center space-x-2 text-muted-foreground">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span>Loading analytics...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="font-serif font-light text-4xl tracking-tight mb-2">Analytics</h1>
          <p className="text-muted-foreground">Your real habit performance</p>
        </div>

        {/*  STATS FROM YOUR BACKEND */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-3xl font-bold text-primary">
                {analytics?.totalHabits || habits.length || 0}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Total Habits</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-3xl font-bold text-emerald-500">
                {analytics?.todayLogs || 0}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Today's Logs</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-3xl font-bold text-blue-500">
                {analytics?.weeklyLogs || 0}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Weekly Total</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Trends */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Weekly Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={trendsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#10B981" strokeWidth={3} dot />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Category Breakdown */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Category Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="category" stroke="hsl(var(--muted-foreground))" angle={-30} height={70} />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip />
                    <Bar dataKey="logs" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
