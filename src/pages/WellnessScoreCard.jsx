import React from 'react'
import { Progress } from '../components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { TrendingUp, Star } from 'lucide-react'

export default function WellnessScoreCard({ score = 0 }) {
  return (
    <Card className="group relative overflow-hidden bg-card/80 backdrop-blur-xl border-border/50 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 border border-white/20 dark:border-black/20">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-green-400/10 to-emerald-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <CardHeader className="pb-4 relative z-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl shadow-lg">
            <TrendingUp className="w-6 h-6 text-white drop-shadow-sm" />
          </div>
          <CardTitle className="text-2xl font-light tracking-wide bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            Wellness Score
          </CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="relative z-10 space-y-6">
        {/* Score Display */}
        <div className="text-center">
          <div className={`text-6xl font-black mb-4 drop-shadow-2xl transition-all duration-1000 ${
            score > 80 ? 'bg-gradient-to-r from-emerald-500 to-green-500' : 
            score > 50 ? 'bg-gradient-to-r from-blue-500 to-indigo-500' : 
            'bg-gradient-to-r from-orange-500 to-red-500'
          } bg-clip-text text-transparent`}>
            {score}%
          </div>
          <p className="text-lg font-medium text-muted-foreground/90 tracking-wide">
            Your overall wellness
          </p>
        </div>
        
        {/* Main Progress Bar */}
        <div className="space-y-2">
          <Progress 
            value={score} 
            className="h-3 [&>div]:!bg-gradient-to-r [&>div]:from-emerald-500 [&>div]:via-green-500 [&>div]:to-emerald-600 [&>div]:shadow-lg h-4 bg-muted/50 border border-muted-foreground/20 rounded-full overflow-hidden"
          />
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Poor</span>
            <span className="font-mono text-sm font-semibold">{score}%</span>
            <span className="text-emerald-600 font-semibold">Perfect</span>
          </div>
        </div>
        
        {/* Status Badge */}
        <div className="flex items-center justify-center gap-2 p-3 bg-muted/50 backdrop-blur-sm rounded-2xl border border-muted-foreground/30">
          <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
            score > 80 ? 'bg-emerald-500/20 text-emerald-700 border-emerald-500/30' :
            score > 50 ? 'bg-blue-500/20 text-blue-700 border-blue-500/30' :
            'bg-orange-500/20 text-orange-700 border-orange-500/30'
          }`}>
            {score > 80 ? '🏆 Excellent!' : score > 50 ? '💪 Great!' : '🌱 Keep Going!'}
          </div>
          {score > 80 && (
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 animate-pulse" />
          )}
        </div>
      </CardContent>
    </Card>
  )
}
