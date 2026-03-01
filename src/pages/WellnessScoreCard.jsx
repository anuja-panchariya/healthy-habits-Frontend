import React from 'react'
import { Progress } from '../components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'

export default function WellnessScoreCard({ score = 0 }) {
  return (
    <Card className="overflow-hidden bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200 shadow-xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-light flex items-center">
          Wellness Score
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <div className="text-5xl font-bold text-emerald-600 mb-2">{score}%</div>
          <p className="text-sm text-muted-foreground">Your overall wellness</p>
        </div>
        <Progress value={score} className="h-3 bg-muted" indicator="bg-gradient-to-r from-emerald-500 to-green-600" />
        <div className="text-xs text-center text-muted-foreground">
          {score > 80 ? 'Excellent! Keep it up 🚀' : score > 50 ? 'Good progress!' : 'Room to grow 💪'}
        </div>
      </CardContent>
    </Card>
  )
}
