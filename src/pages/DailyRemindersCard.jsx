import React from 'react'
import { Bell, Clock, Loader2 } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { toast } from 'sonner'

export default function DailyRemindersCard({ 
  onSendReminder, 
  loadingReminder, 
  habitsLength 
}) {
  return (
    <Card className="h-full bg-card text-card-foreground border-border/40 shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="flex items-center text-lg text-foreground">
          <Bell className="w-5 h-5 mr-2 text-primary" />
          Daily Reminders
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-1">
        <p className="text-sm text-muted-foreground">
          Get email reminders for your habits
        </p>
        <Button
          onClick={onSendReminder}
          disabled={loadingReminder}
          className="w-full rounded-full bg-blue-600 hover:bg-blue-700 text-white"
          size="sm"
          data-testid="daily-reminder-btn"
        >
          {loadingReminder ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Clock className="w-4 h-4 mr-2" />
              Send Now
            </>
          )}
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          {habitsLength > 0 
            ? `${habitsLength} habit${habitsLength !== 1 ? 's' : ''}` 
            : 'Create habits first'
          }
        </p>
      </CardContent>
    </Card>
  )
}
