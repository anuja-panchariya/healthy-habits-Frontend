import React from 'react'
import { useUser } from '@clerk/clerk-react'
import { UserButton } from '@clerk/clerk-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'

export default function ProfileCard() {
  const { isLoaded, isSignedIn, user } = useUser()
  
  const getUserEmail = () => user?.primaryEmailAddress?.emailAddress || 'No email'
  const getUserName = () => user?.fullName || user?.firstName || user?.username || 'User'

  if (!isLoaded) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          <UserButton afterSignOutUrl="/" />
          <div>
            <p className="font-semibold text-lg" data-testid="user-name">{getUserName()}</p>
            <p className="text-sm text-muted-foreground font-mono" data-testid="user-email">{getUserEmail()}</p>
            <p className="text-xs text-emerald-600">ID: {user?.id?.slice(0, 8)}...</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
