import React from 'react'
import { Progress } from '../components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'

export default function WellnessScoreCard({ score = 0 }) {
  return (
    <Card className="overflow-hidden bg-gradient-to-br from-emerald-900/90 to-emerald-800/90 border-emerald-700/50 shadow-2xl backdrop-blur-xl">
      <CardHeader className="pb-6">
        <CardTitle className="text-3xl font-light flex items-center text-slate-100 tracking-wide">
          Wellness Score
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="text-center">
          <div className="text-6xl font-black bg-gradient-to-r from-emerald-400 via-emerald-500 to-green-400 bg-clip-text text-transparent mb-4 drop-shadow-2xl">
            {score}%
          </div>
          <p className="text-lg text-emerald-200 font-medium tracking-wide">Your overall wellness</p>
        </div>
        
        <Progress 
          value={score} 
          className="h-4 bg-emerald-900/50 border border-emerald-700/50" 
          indicator="bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 shadow-lg"
        />
        
        <div className="text-center">
          <div className="text-sm font-semibold text-emerald-300 uppercase tracking-wider mb-1">
            {score > 80 ? 'Excellent! Keep it up 🚀' : score > 50 ? 'Good progress! 💪' : 'Room to grow 🌱'}
          </div>
          <div className="w-full bg-emerald-900/50 rounded-full h-2">
            <div 
              className="h-2 rounded-full transition-all duration-1000 bg-gradient-to-r from-emerald-400 to-green-400 shadow-lg"
              style={{ width: `${score}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
