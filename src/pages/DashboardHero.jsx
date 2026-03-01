import React from 'react'
import { Button } from '../components/ui/button'
import { Plus, Bell } from 'lucide-react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function DashboardHero({ 
  onCreateHabit, 
  onSendReminder, 
  loadingReminder,
  habitsLength 
}) {
  const sendDailyReminder = () => {
    toast.success(`✅ Reminders scheduled for ${habitsLength || 0} habits!`)
  }

  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="font-serif font-light text-4xl tracking-tight mb-2 text-foreground">
          Your Dashboard
        </h1>
        <p className="text-muted-foreground">Track your wellness journey</p>
      </div>
      <div className="flex gap-3">
        <Button onClick={onCreateHabit} className="rounded-full" data-testid="create-habit-btn">
          <Plus className="w-4 h-4 mr-2" /> New Habit
        </Button>
        <Button 
          onClick={onSendReminder} 
          disabled={loadingReminder}
          className="rounded-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
          data-testid="reminder-btn"
        >
          {loadingReminder ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Bell className="w-4 h-4 mr-2" />
              Reminder
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
