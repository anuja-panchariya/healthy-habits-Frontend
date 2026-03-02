import React from 'react'
import { TrendingUp, Heart } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'

export default function WellnessScoreCard({ score = 0 }) {
  console.log('🏥 REAL WellnessScoreCard:', score)
  
  const strokeDashoffset = 465 - (score * 465 / 100)
  const getStatus = (score) => {
    if (score >= 80) return { text: 'Excellent!', color: 'text-emerald-600' }
    if (score >= 60) return { text: 'Good!', color: 'text-amber-600' }
    return { text: 'Keep Going!', color: 'text-red-600' }
  }

  const status = getStatus(score)

  return (
    <Card className="group bg-gradient-to-br from-white/80 to-slate-50/80 backdrop-blur-xl border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 border-white/50">
      <CardHeader className="pb-6">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-black bg-gradient-to-r from-gray-900 to-slate-800 bg-clip-text text-transparent">
            Wellness Score
          </CardTitle>
          <TrendingUp className="w-8 h-8 text-emerald-500 group-hover:scale-110 transition-transform duration-300" />
        </div>
        <p className="text-sm text-gray-600 font-medium">From your real habit data</p>
      </CardHeader>
      
      <CardContent className="text-center space-y-6">
        <div className="inline-flex items-center p-6 bg-white/60 rounded-3xl backdrop-blur-sm shadow-2xl border border-white/50 hover:shadow-3xl transition-all duration-300">
          <Heart className="w-16 h-16 text-red-400 drop-shadow-lg mr-4" />
          <div>
            <div className="text-6xl font-black text-gray-900 leading-none">
              {score}%
            </div>
            <p className="text-sm text-gray-600 font-semibold mt-2">Real Score</p>
          </div>
        </div>
        
        <div className="w-44 h-44 mx-auto relative">
          <svg className="w-full h-full -rotate-90 origin-center">
            <circle cx="88" cy="88" r="80" fill="none" stroke="#f8fafc" strokeWidth="10" />
            <circle 
              cx="88" cy="88" r="80" 
              fill="none" 
              stroke={`url(#gradient-${score})`}
              strokeWidth="10"
              strokeDasharray="502"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1500 ease-out"
            />
            <defs>
              <linearGradient id={`gradient-${score}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#ef4444"} />
                <stop offset="100%" stopColor={score >= 80 ? "#047857" : score >= 60 ? "#b45309" : "#b91c1c"} />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-black text-gray-900">{score}%</span>
            <span className="text-xs text-gray-500 font-medium mt-1">Live Data</span>
          </div>
        </div>
        
        <div>
          <p className={`text-xl font-bold ${status.color} animate-pulse`}>
            {status.text}
          </p>
          <p className="text-xs text-gray-500 mt-1">Real backend calculation</p>
        </div>
      </CardContent>
    </Card>
  )
}
