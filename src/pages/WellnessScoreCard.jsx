import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'

export default function WellnessScoreCard({ score = 0 }) {
  const strokeDashoffset = 440 - (score * 440 / 100)
  
  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle>Wellness Score</CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-6">
        <div className="text-5xl font-black">{score}%</div>
        
        {/* Progress Ring */}
        <svg width="200" height="200" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="80" fill="none" stroke="#e5e7eb" strokeWidth="20"/>
          <circle 
            cx="100" cy="100" r="80" 
            fill="none" 
            stroke="#10b981"
            strokeWidth="20"
            strokeDasharray="502"
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        
        <div>
          <div className="text-xl font-bold text-emerald-600">
            {score > 50 ? 'Good Progress!' : 'Keep Going!'}
          </div>
          <div className="text-sm text-gray-500">Based on your habits</div>
        </div>
      </CardContent>
    </Card>
  )
}
