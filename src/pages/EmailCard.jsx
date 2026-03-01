import React, { useState } from 'react'
import { useAuth, useUser } from '@clerk/clerk-react'
import { Mail, CheckCircle, Loader2 } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { toast } from 'sonner'
import { api, setAuthToken } from '../lib/api'

export default function EmailCard() {
  const { getToken } = useAuth()
  const { user } = useUser()
  const [sendingTestEmail, setSendingTestEmail] = useState(false)

  const getUserEmail = () => user?.primaryEmailAddress?.emailAddress || 'No email'

  const sendTestEmail = async () => {
    setSendingTestEmail(true)
    try {
      const token = await getToken()
      setAuthToken(token)
      await api.post('/api/reminders/send', {
        email: getUserEmail(),
        habits: [{ title: "Your first habit" }]
      })
      toast.success(`✅ Test email sent to ${getUserEmail()}! Check inbox 📧`)
    } catch (error) {
      console.error("Email error:", error)
      toast.error("Failed to send email 😔")
    } finally {
      setSendingTestEmail(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Mail className="w-5 h-5 mr-2" />
          Email Reminders
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center mb-4">
          <p className="text-sm text-muted-foreground mb-2">Test your daily habit reminder email:</p>
          <p className="font-mono bg-muted px-3 py-1 rounded-lg text-xs">
            📧 {getUserEmail()}
          </p>
        </div>
        <Button
          onClick={sendTestEmail}
          disabled={sendingTestEmail || !getUserEmail() || getUserEmail() === 'No email'}
          className="w-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
          data-testid="test-email-btn"
        >
          {sendingTestEmail ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              📧 Send Test Reminder Email
            </>
          )}
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          Sends beautiful HTML email with your habits list
        </p>
      </CardContent>
    </Card>
  )
}
