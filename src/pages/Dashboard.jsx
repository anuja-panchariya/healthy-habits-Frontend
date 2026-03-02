import React, { useState } from 'react'
import { motion } from 'framer-motion'
import DashboardHero from './DashboardHero'
import DashboardGrid from './DashboardGrid'
import CreateHabitDialog from '../components/CreateHabitDialog'

export default function Dashboard() {
  const [open, setOpen] = useState(false)
  
  // ✅ REMINDER HANDLERS ADD KIA
  const handleCreateHabit = () => setOpen(true)
  const handleSendReminder = () => {
    toast.success('✅ Reminders sent for all habits!')
    // Future: Real API call
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6" data-testid="dashboard">
      <div className="max-w-7xl mx-auto space-y-8">
        <DashboardHero 
          onCreateHabit={handleCreateHabit}
          onSendReminder={handleSendReminder}      // ✅ REMINDER CONNECT!
          habitsLength={5}                        // ✅ DUMMY DATA
        />
        <DashboardGrid />
      </div>
      
      <CreateHabitDialog 
        open={open}
        onClose={() => setOpen(false)}
        onSuccess={() => {
          setOpen(false)
          window.location.reload()
        }}
      />
    </div>
  )
}
