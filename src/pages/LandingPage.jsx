import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Activity, TrendingUp, Users, Brain, Zap, Award } from 'lucide-react'
import { Button } from '../components/ui/button'
import { useNavigate } from 'react-router-dom'

export default function LandingPage() {
  const navigate = useNavigate()

  const features = [
    {
      icon: <Activity className="w-8 h-8" />,
      title: "Habit Tracking",
      description: "Track habits across fitness, nutrition, mindfulness, and sleep",
      image: "https://images.pexels.com/photos/2035066/pexels-photo-2035066.jpeg"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Wellness Score",
      description: "Get a holistic view of your health with our AI-powered wellness score",
      image: "https://images.pexels.com/photos/31756484/pexels-photo-31756484.jpeg"
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: "AI Recommendations",
      description: "Receive personalized habit suggestions powered by Gemini AI",
      image: "https://images.pexels.com/photos/30552849/pexels-photo-30552849.jpeg"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Community Challenges",
      description: "Join friends and compete on habit challenges with leaderboards",
      image: "https://images.pexels.com/photos/26973618/pexels-photo-26973618.jpeg"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Smart Reminders",
      description: "Never miss a habit with intelligent email reminders",
      image: "https://images.unsplash.com/photo-1765279333918-949ddcb655ba?crop=entropy&cs=srgb&fm=jpg&q=85"
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Streaks & Achievements",
      description: "Stay motivated with streak tracking and milestone sharing",
      image: "https://images.pexels.com/photos/2035066/pexels-photo-2035066.jpeg"
    }
  ]

  const techStack = [
    { name: "Node.js", color: "from-green-400 to-green-600" },
    { name: "Supabase", color: "from-emerald-400 to-emerald-600" },
    { name: "React", color: "from-blue-400 to-cyan-500" },
    { name: "Tailwind CSS", color: "from-sky-400 to-blue-500" }
  ]

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-6">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5"></div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative max-w-7xl mx-auto text-center"
        >
          <h1 className="font-serif font-light text-5xl sm:text-6xl lg:text-7xl tracking-tight mb-6 text-foreground">
            Build Better Habits,
            <br />
            <span className="text-primary">Live Healthier</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 font-medium">
            Track your wellness journey with AI-powered insights, personalized recommendations, and community challenges.
          </p>
          <Button
            data-testid="get-started-btn"
            onClick={() => navigate('/dashboard')}
            className="rounded-full px-8 py-6 text-lg hover:scale-105 active:scale-95 transition-transform duration-200"
          >
            Get Started <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </motion.div>
      </section>

      {/* Features Bento Grid */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="font-serif font-light text-4xl sm:text-5xl mb-4 tracking-tight">Everything You Need</h2>
            <p className="text-muted-foreground text-lg">Powerful features to help you build lasting habits</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="bg-card border border-border/40 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden group"
              >
                <div className="relative h-40 rounded-2xl overflow-hidden mb-4">
                  <img src={feature.image} alt={feature.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-3 left-3 text-white">{feature.icon}</div>
                </div>
                <h3 className="font-serif text-xl mb-2 text-card-foreground">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-serif font-light text-3xl sm:text-4xl mb-12 tracking-tight">Built with Modern Tech</h2>
            <div className="flex flex-wrap justify-center gap-4">
              {techStack.map((tech, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className={`px-6 py-3 rounded-full bg-gradient-to-r ${tech.color} text-white font-medium shadow-lg`}
                >
                  {tech.name}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="font-serif font-light text-4xl sm:text-5xl mb-6 tracking-tight">Start Your Wellness Journey Today</h2>
          <p className="text-muted-foreground text-lg mb-10">Join thousands of users building healthier habits</p>
          <Button
            data-testid="cta-get-started-btn"
            onClick={() => navigate('/dashboard')}
            size="lg"
            className="rounded-full px-10 py-6 text-lg hover:scale-105 active:scale-95 transition-transform duration-200"
          >
            Start Tracking Now <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-border">
        <div className="max-w-7xl mx-auto text-center text-muted-foreground">
          <p>© 2026 HealthyHabits Tracker. Built with passion for wellness.</p>
        </div>
      </footer>
    </div>
  )
}
