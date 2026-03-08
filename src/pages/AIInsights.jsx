import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Brain, Zap, Clock, Droplets } from 'lucide-react';

const AIInsights = ({ habits = [], moodLogs = [] }) => {
  const insights = useMemo(() => {
    // 🔥 SMART LOGIC
    const hydrationHabits = habits.filter(h => h.category === 'hydration');
    const sleepHabits = habits.filter(h => h.category === 'sleep');
    const consistency = habits.length > 0 ? (habits.filter(h => h.completionRate > 50).length / habits.length) * 100 : 0;
    
    const suggestions = [];
    
    if (hydrationHabits.length === 0 || hydrationHabits[0]?.completionRate < 50) {
      suggestions.push({
        icon: Droplets,
        title: 'Hydration Reminder',
        reason: 'Low water intake detected. Add daily reminder.',
        priority: 'high'
      });
    }
    
    if (sleepHabits.length === 0 || sleepHabits[0]?.completionRate < 60) {
      suggestions.push({
        icon: Clock,
        title: 'Sleep Before 11 PM',
        reason: 'Better sleep = 30% higher productivity.',
        priority: 'medium'
      });
    }
    
    if (consistency < 70) {
      suggestions.push({
        icon: Zap,
        title: 'Morning Routine',
        reason: 'Start day with 3 easy wins for momentum.',
        priority: 'low'
      });
    }
    
    return suggestions.slice(0, 3);
  }, [habits]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      <h3 className="flex items-center gap-2 text-xl font-bold">
        <Brain className="w-6 h-6" />
        Smart Suggestions
      </h3>
      {insights.map((insight, i) => {
        const Icon = insight.icon;
        return (
          <motion.div
            key={i}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className="p-4 border rounded-xl hover:shadow-md bg-gradient-to-r from-muted/50 to-card"
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${insight.priority === 'high' ? 'bg-red-500/10 text-red-500' : 'bg-primary/10 text-primary'}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold">{insight.title}</h4>
                <p className="text-sm text-muted-foreground">{insight.reason}</p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default AIInsights;
