import React from 'react'
import { motion } from 'framer-motion'
import ProfileHero from './ProfileHero'
import ProfileGrid from './ProfileGrid'
import MoodTracker from './MoodTracker'

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-background p-6" data-testid="profile-page">
      <div className="max-w-4xl mx-auto space-y-8">
        {/*  HERO - No delay (first) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <ProfileHero />
        </motion.div>

        {/*  GRID - Middle delay */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <ProfileGrid />
        </motion.div>

        {/* MOOD TRACKER  */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="md:col-span-2"  // Full width (optional)
        >
          <MoodTracker />
        </motion.div>
      </div>
    </div>
  )
}
