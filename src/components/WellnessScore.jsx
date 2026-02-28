import React from 'react'
import { motion } from 'framer-motion'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { TrendingDown, TrendingUp, Minus } from 'lucide-react'

export default function WellnessScore({ score }) {
  const getScoreColor = (score) => {
    if (score >= 70) return { color: 'hsl(142, 40%, 45%)', text: 'Excellent', icon: <TrendingUp className="w-5 h-5" /> }
    if (score >= 40) return { color: 'hsl(45, 80%, 55%)', text: 'Good', icon: <Minus className="w-5 h-5" /> }
    return { color: 'hsl(0, 70%, 60%)', text: 'Needs Attention', icon: <TrendingDown className="w-5 h-5" /> }
  }

  const { color, text, icon } = getScoreColor(score)

  return (
    <Card className="bg-card border-border/40 shadow-sm hover:shadow-md transition-all duration-300 h-full">
      <CardHeader>
        <CardTitle className="font-serif text-2xl font-light tracking-tight">Wellness Score</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 100, damping: 15 }}
            className="w-40 h-40"
          >
            <CircularProgressbar
              value={score}
              text={`${score}%`}
              styles={buildStyles({
                textSize: '24px',
                pathColor: color,
                textColor: 'hsl(var(--foreground))',
                trailColor: 'hsl(var(--muted))',
                pathTransitionDuration: 1.5,
              })}
            />
          </motion.div>

          <div className="flex-1 ml-8 space-y-4">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center space-x-3"
            >
              <div className={`p-3 rounded-full`} style={{ backgroundColor: `${color}20` }}>
                <div style={{ color }}>{icon}</div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="font-medium text-lg" style={{ color }}>{text}</p>
              </div>
            </motion.div>

            <p className="text-sm text-muted-foreground">
              Your wellness score is calculated based on your habit completion rates across all categories over the past 7 days.
            </p>

            {score < 40 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20"
              >
                <p className="text-sm text-destructive font-medium">
                  ⚠️ Your wellness score is dropping! Try to be more consistent with your habits.
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
