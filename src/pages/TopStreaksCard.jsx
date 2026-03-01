import React from 'react'
import { Flame } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'

export default function TopStreaksCard({ streaks = [] }) {
  return (
    <Card className="bg-card text-card-foreground border-border/40 shadow-sm h-full">
      <CardHeader>
        <CardTitle className="flex items-center text-foreground">
          <Flame className="w-5 h-5 mr-2 text-accent" />
          Top Streaks
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {streaks.length > 0 ? (
          streaks.slice(0, 3).filter(Boolean).map((streak, index) => (
            <div key={streak?.habitId || streak?.id || index} className="flex justify-between items-center">
              <span className="text-sm text-foreground truncate">
                {streak?.title || streak?.habitName || "Unnamed Habit"}
              </span>
              <span className="font-medium text-accent text-foreground">
                {streak?.streak || streak?.currentStreak || 0} 🔥
              </span>
            </div>
          ))
        ) : (
          <p className="text-muted-foreground text-sm">
            Start logging habits to build streaks!
          </p>
        )}
      </CardContent>
    </Card>
  )
}
