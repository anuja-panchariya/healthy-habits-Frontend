import React from 'react'
import { Progress } from '../components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'

export default function WellnessScoreCard({ score = 0 }) {
  return (
    <Card className="overflow-hidden bg-gradient-to-br from-slate-900/80 to-slate-800/80 border-slate-700/50 shadow-2xl backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-light flex items-center text-slate-100">
          Wellness Score
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <div className="text-5xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-2">
            {score}%
          </div>
          <p className="text-sm text-slate-400">Your overall wellness</p>
        </div>
        <Progress 
          value={score} 
          className="h-3 bg-slate-800" 
          indicator="bg-gradient-to-r from-emerald-500 to-teal-500"
        />
        <div className="text-xs text-center text-slate-400">
          {score > 80 ? 'Excellent! Keep it up 🚀' : score > 50 ? 'Good progress!' : 'Room to grow 💪'}
        </div>
      </CardContent>
    </Card>
  )
}

