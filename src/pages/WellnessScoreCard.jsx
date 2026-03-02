import React from 'react'
import { TrendingUp, Heart } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'

export default function WellnessScoreCard({ score = 0 }) {
  console.log('🏥 Rendering WellnessScoreCard:', score)

  const getScoreColor = (score) => {
    if (score >= 80) return { bg: 'from-emerald-500', text: 'text-emerald-600' }
    if (score >= 60) return { bg: 'from-yellow-500', text: 'text-amber-600' }
    return { bg: 'from-red-500', text: 'text-red-600' }
  }

  const colors = getScoreColor(score)
  const strokeDashoffset = 465 - (score * 465 / 100)

  return (
    <Card className="bg-gradient-to-br from-slate-50 to-blue-50 border-0 shadow-2xl overflow-hidden">
      <CardHeader className="pb-6">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Wellness Score
          </CardTitle>
          <TrendingUp className="w-7 h-7 text-emerald-500 animate-pulse" />
        </div>
        <p className="text-sm text-muted-foreground">Based on your habits & consistency</p>
      </CardHeader>
      
      <CardContent className="text-center">
        {/* Score Display */}
        <div className="inline-flex items-center mb-8 p-6 bg-white/80 rounded-3xl backdrop-blur-sm shadow-xl border border-white/50">
          <Heart className="w-14 h-14 text-red-400 mr-4 drop-shadow-lg" />
          <div>
            <div className="text-5xl font-black text-gray-900 leading-none">
              {score}
              <span className="text-2xl font-normal text-gray-500">%</span>
            </div>
            <p className="text-sm text-gray-600 font-medium mt-1">Daily Wellness</p>
          </div>
        </div>
        
        {/* Animated Progress Ring */}
        <div className="w-40 h-40 mx-auto relative mb-8">
          <svg className="w-full h-full transform -rotate-90 origin-center">
            <circle
              cx="80" cy="80" r="74"
              fill="none"
              stroke="#f1f5f9"
              strokeWidth="12"
              className="transition-all duration-1000"
            />
            <circle
              cx="80" cy="80" r="74"
              fill="none"
              stroke={`url(#scoreGradient)`}
              strokeWidth="12"
              strokeDasharray="465"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-2000 ease-out origin-center"
              pathLength={1}
            />
            <defs>
              <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#ef4444"} />
                <stop offset="100%" stopColor={score >= 80 ? "#047857" : score >= 60 ? "#b45309" : "#b91c1c"} />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-3xl font-bold text-gray-900">{score}%</span>
            <span className="text-xs text-muted-foreground mt-1">Score</span>
          </div>
        </div>
        
        {/* Status */}
        <div className="space-y-1">
          <p className={`text-lg font-bold ${colors.text}`}>
            {score >= 80 ? 'Excellent!' : score >= 60 ? 'Good Progress' : 'Keep Going!'}
          </p>
          <p className="text-xs text-muted-foreground">Live calculation from habits</p>
        </div>
      </CardContent>
    </Card>
  )
}
