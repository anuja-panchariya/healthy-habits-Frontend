import React from 'react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { toast } from 'sonner'

export default function TodaysHabitsCard({ habits = [] }) {
  const handleLog = (id) => {
    toast.success('Habit logged!')
  }

  if (habits.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-gray-500">No habits yet. Create your first one!</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Today's Habits ({habits.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {habits.slice(0, 5).map(habit => (
          <div key={habit.id} className="flex items-center justify-between p-4 border-b">
            <div>
              <div className="font-semibold">{habit.title}</div>
              <div className="text-sm text-gray-500">{habit.category}</div>
            </div>
            <Button onClick={() => handleLog(habit.id)} size="sm">Log Today</Button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
