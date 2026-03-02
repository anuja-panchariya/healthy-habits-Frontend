import React from 'react'
import { Target } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'

export default function TodaysHabitsCard({ habits = [], onLogHabit }) {
  console.log('🎨 TodaysHabitsCard:', habits)

  const todayHabits = habits.slice(0, 5)

  return (
    <Card className="bg-card text-card-foreground border-border/40 shadow-lg hover:shadow-xl transition-all">
      <CardHeader>
        <CardTitle className="flex items-center text-foreground text-lg">
          <Target className="w-5 h-5 mr-2 text-emerald-500" />
          Today's Habits ({habits.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {todayHabits.length === 0 ? (
          <div className="text-center py-12">
            <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No habits yet. Create your first one!</p>
          </div>
        ) : (
          todayHabits.map((habit, index) => (
            <div
              key={habit.id || habit._id || `habit-${index}`}
              className="flex items-center justify-between p-4 rounded-2xl bg-muted/50 hover:bg-muted transition-all group"
            >
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-foreground truncate" title={habit.name || habit.title}>
                  {habit.name || habit.title || 'Unnamed Habit'}
                </h4>
                <p className="text-sm text-muted-foreground capitalize">
                  {habit.category || 'General'}
                  {habit.streak ? ` • ${habit.streak} day streak` : ''}
                </p>
              </div>
              <Button
                onClick={() => onLogHabit(habit.id || habit._id)}
                size="sm"
                className="rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium ml-3 px-4 whitespace-nowrap"
              >
                Log Today
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
