import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'

export default function QuickStatsCard({ habits = [] }) {
  const total = habits.length || 0
  const active = habits.filter(h => h.goal_value > 0).length || 0
  const avgStreak = 0 // File DB doesn't track streaks yet
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Stats</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-3 gap-4 p-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-emerald-600">{total}</div>
          <div className="text-sm text-gray-600">Total Habits</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{active}</div>
          <div className="text-sm text-gray-600">Active</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{avgStreak}</div>
          <div className="text-sm text-gray-600">Avg Streak</div>
        </div>
      </CardContent>
    </Card>
  )
}
