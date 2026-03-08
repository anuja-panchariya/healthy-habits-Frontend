import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Brain, Zap, Clock, Droplets, Sun, Award } from 'lucide-react';

const AIInsights = ({ habits = [], moodLogs = [] }) => {
  const insights = useMemo(() => {
    const suggestions = [];
    
    // 🔥 SMART LOGIC - No Redux dependency
    const today = new Date().toDateString();
    const todayHabits = habits.filter(h => 
      h.logs?.some(log => new Date(log.date).toDateString() === today)
    );
    const hydrationCount = habits.filter(h => h.category === 'hydration').length;
    const totalHabits = habits.length;
    const consistency = totalHabits > 0 ? (todayHabits.length / totalHabits) * 100 : 0;

    // 💧 Hydration check
    if (hydrationCount === 0 || consistency < 50) {
      suggestions.push({
        icon: Droplets,
        title: 'Hydration Boost',
        reason: `Only ${Math.round(consistency)}% habits complete. Add water tracking.`,
        priority: 'high'
      });
    }
    
    // 😴 Sleep check  
    if (!habits.some(h => h.category === 'sleep')) {
      suggestions.push({
        icon: Clock,
        title: 'Sleep Priority',
        reason: 'No sleep tracking. Add "Sleep 7+ hours" habit.',
        priority: 'medium'
      });
    }
    
    // ⚡ Momentum check
    if (consistency < 70) {
      suggestions.push({
        icon: Zap,
        title: 'Morning Ritual',
        reason: 'Start with 3 easy wins: water, stretch, plan.',
        priority: 'low'
      });
    }

    return suggestions.slice(0, 3);
  }, [habits]);

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="h-full p-6 lg:p-8 space-y-6 bg-slate-900/70 border border-emerald-500/30 rounded-3xl backdrop-blur-xl shadow-2xl hover:shadow-emerald-500/25"
    >
      <h3 className="flex items-center gap-3 text-2xl font-black bg-gradient-to-r from-emerald-400 via-emerald-300 to-emerald-500 bg-clip-text text-transparent">
        <Brain className="w-8 h-8" />
        AI Insights
      </h3>
      
      <div className="space-y-4">
        {insights.map((insight, i) => {
          const Icon = insight.icon;
          return (
            <motion.div
              key={i}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -2 }}
              className="group p-6 rounded-2xl bg-emerald-500/10 border border-emerald-400/40 hover:bg-emerald-500/20 hover:border-emerald-400/60 shadow-lg hover:shadow-emerald-500/25 transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-2xl ${insight.priority === 'high' ? 'bg-red-500/20 border-red-500/40 text-red-400' : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'} border shadow-lg group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-lg text-emerald-200 group-hover:text-emerald-100 transition-colors">{insight.title}</h4>
                  <p className="text-emerald-300 text-sm mt-1">{insight.reason}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default AIInsights;
