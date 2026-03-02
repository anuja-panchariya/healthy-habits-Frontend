import React, { useState } from 'react'  // ← useState ADD KIA!
import { motion } from 'framer-motion'
import DashboardHero from './DashboardHero'
import DashboardGrid from './DashboardGrid'
import CreateHabitDialog from '../components/CreateHabitDialog'

export default function Dashboard() {
  const [open, setOpen] = useState(false)  // ← DIALOG STATE ADD
  
  return (
    <div className="min-h-screen bg-background text-foreground p-6" data-testid="dashboard">
      <div className="max-w-7xl mx-auto space-y-8">
        <DashboardHero 
          onCreateHabit={() => setOpen(true)}  // ← BUTTON CONNECT!
        />
        <DashboardGrid />
      </div>
      
      <CreateHabitDialog 
        open={open}                          // ← CONTROLLED!
        onClose={() => setOpen(false)}       // ← CLOSE HANDLER
        onSuccess={() => {                   // ← SUCCESS HANDLER
          setOpen(false)
          window.location.reload()           // REFRESH DATA
        }}
      />
    </div>
  )
}
