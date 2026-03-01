import React from 'react'
import { Activity } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'

export default function QuickStatsCard({ habits = [], streaks = [] }) {
  const totalHabits = habits.length
  const bestStreak = Math.max(...streaks.map(s => s.streak || s.currentStreak || 0), 0)

  return (
    <Card className="h-full bg-card text-card-foreground border-border/40 shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="flex items-center text-lg text-foreground">
          <Activity className="w-5 h-5 mr-2 text-primary" />
          Quick Stats
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Total Habits</span>
            <span className="font-medium text-foreground">{totalHabits}</span>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Best Streak</span>
            <span className="font-medium text-foreground">{bestStreak} days</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
