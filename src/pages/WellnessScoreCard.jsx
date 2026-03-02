import React from 'react'
import { TrendingUp, Heart } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'

export default function WellnessScoreCard({ score = 0 }) {
  console.log('🏥 WellnessScoreCard score:', score)
  
  const getScoreColor = (score) => {
    if (score >= 80) return 'from-emerald-500 to-emerald-600'
    if (score >= 60) return 'from-yellow-500 to-yellow-600'
    return 'from-red-500 to-red-600'
  }

  const strokeDashoffset = 377 - (score * 377 / 100)

  return (
    <Card className="bg-gradient-to-br from-slate-50 to-blue-50 border-0 shadow-2xl overflow-hidden">
      <CardHeader className="pb-6">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Wellness Score
          </CardTitle>
          <TrendingUp className="w-7 h-7 text-emerald-500" />
        </div>
        <p className="text-sm text-muted-foreground">Based on your habits & streaks</p>
      </CardHeader>
      
      <CardContent className="text-center">
        {/* Score Badge */}
        <div className="inline-flex items-center mb-8 p-6 bg-white/70 rounded-3xl backdrop-blur-sm shadow-xl border border-white/50">
          <Heart className="w-14 h-14 text-red-400 mr-4" />
          <div>
            <div className="text-5xl font-black text-gray-900 leading-none">
              {score}%
            </div>
            <p className="text-sm text-gray-600 font-medium mt-1">Your daily wellness</p>
          </div>
        </div>
        
        {/* Progress Ring */}
        <div className="w-40 h-40 mx-auto relative mb-6">
          <svg className="w-full h-full transform -rotate-90 origin-center">
            <circle
              cx="80" cy="80" r="74"
              fill="none"
              stroke="#f1f5f9"
              strokeWidth="10"
              className="transition-all duration-1000"
            />
            <circle
              cx="80" cy="80" r="74"
              fill="none"
              stroke={`url(#scoreGradient)`}
              strokeWidth="10"
              strokeDasharray="465"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className={`transition-all duration-1500 origin-center ${
                score >= 80 ? 'animate-in slide-in-from-bottom-2' : ''
              }`}
            />
            <defs>
              <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#ef4444"} />
                <stop offset="50%" stopColor={score >= 80 ? "#059669" : score >= 60 ? "#d97706" : "#dc2626"} />
                <stop offset="100%" stopColor={score >= 80 ? "#047857" : score >= 60 ? "#b45309" : "#b91c1c"} />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-3xl font-bold text-gray-900">{score}%</span>
          </div>
        </div>
        
        {/* Score Status */}
        <div className="space-y-1">
          <p className={`text-sm font-semibold ${
            score >= 80 ? 'text-emerald-600' : 
            score >= 60 ? 'text-amber-600' : 'text-red-600'
          }`}>
            {score >= 80 ? 'Excellent!' : score >= 60 ? 'Good' : 'Keep going!'}
          </p>
          <p className="text-xs text-muted-foreground">Updated today</p>
        </div>
      </CardContent>
    </Card>
  )
}
