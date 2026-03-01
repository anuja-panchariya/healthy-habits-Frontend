import React from 'react'
import { motion } from 'framer-motion'
import DashboardHero from './DashboardHero'
import DashboardGrid from './DashboardGrid'
import CreateHabitDialog from '../components/CreateHabitDialog'

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background text-foreground p-6" data-testid="dashboard">
      <div className="max-w-7xl mx-auto space-y-8">
        <DashboardHero />
        <DashboardGrid />
      </div>
      <CreateHabitDialog 
        open={false} 
        onClose={() => {}} 
        onSuccess={() => {}} 
      />
    </div>
  )
}
