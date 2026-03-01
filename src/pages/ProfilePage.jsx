import React from 'react'
import { motion } from 'framer-motion'
import ProfileHero from './ProfileHero'
import ProfileGrid from './ProfileGrid'
import MoodTracker from './MoodTracker'

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-background p-6" data-testid="profile-page">
      <div className="max-w-4xl mx-auto space-y-8">
        <ProfileHero />
        <ProfileGrid />
        <MoodTracker />
      </div>
    </div>
  )
}
