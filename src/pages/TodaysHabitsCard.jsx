import React from 'react'
import { Target } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'

export default function TodaysHabitsCard({ habits = [], onLogHabit }) {
  console.log('🎨 TodaysHabitsCard received:', habits)  // DEBUG
  
  const todayHabits = habits.slice(0, 5)

  return (
    <Card className="bg-card text-card-foreground border-border/40 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center text-foreground">
          <Target className="w-5 h-5 mr-2 text-primary" />
          Today's Habits ({habits.length})  {/* COUNT VISIBLE */}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {todayHabits.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No habits yet. Create your first one!
          </p>
        ) : (
          todayHabits.map((habit, index) => (
            <div
              key={habit.id || habit._id || index}  // ✅ FLEXIBLE KEY
              className="flex items-center justify-between p-4 rounded-2xl bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className="flex-1">
                <h4 className="font-medium text-foreground">
                  {habit.name || habit.title || 'Unnamed Habit'}  {/* ✅ BOTH FIELDS */}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {habit.category || 'General'}
                </p>
              </div>
              <Button
                onClick={() => onLogHabit(habit.id || habit._id)}
                size="sm"
                className="rounded-full bg-green-500 hover:bg-green-600 text-white"
              >
                Log
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
