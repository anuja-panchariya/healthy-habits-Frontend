import React from 'react'
import { Target, Clock } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'

export default function TodaysHabitsCard({ habits = [], onLogHabit }) {
  const displayHabits = habits.slice(0, 5)

  return (
    <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 border-white/50">
      <CardHeader>
        <CardTitle className="flex items-center text-xl font-black text-gray-900">
          <Target className="w-6 h-6 mr-3 text-emerald-500" />
          Today's Habits ({habits.length})
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {displayHabits.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <Target className="w-16 h-16 text-gray-300 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold text-gray-600 mb-1">No habits yet</h3>
              <p className="text-sm text-gray-500">Create your first habit to get started!</p>
            </div>
          </div>
        ) : (
          displayHabits.map((habit, index) => (
            <div
              key={habit.id || habit._id || index}
              className="group flex items-center justify-between p-5 rounded-3xl bg-gradient-to-r from-slate-50 to-blue-50/50 hover:from-emerald-50 hover:to-blue-50 border border-slate-100 hover:border-emerald-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-lg text-gray-900 truncate pr-4" title={habit.name || habit.title}>
                  {habit.name || habit.title || 'Unnamed Habit'}
                </h4>
                <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                  <span className="capitalize">{habit.category || 'General'}</span>
                  {habit.streak ? (
                    <div className="flex items-center bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-xs font-semibold">
                      <span>{habit.streak}</span>
                      <span className="ml-1">day streak</span>
                    </div>
                  ) : null}
                </div>
              </div>
              
              <Button
                onClick={() => onLogHabit(habit.id || habit._id)}
                size="sm"
                className="rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold px-6 py-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 group-hover:scale-105"
              >
                Log Today
              </Button>
            </div>
          ))
        )}
        
        {habits.length > 5 && (
          <p className="text-center text-sm text-gray-500 pt-2">
            +{habits.length - 5} more habits
          </p>
        )}
      </CardContent>
    </Card>
  )
}
