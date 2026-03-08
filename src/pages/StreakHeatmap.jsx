import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Flame } from 'lucide-react';

const StreakHeatmap = ({ habitLogs = [] }) => {
  const weeks = useMemo(() => {
    const today = new Date();
    const start = new Date(today.getFullYear(), 0, 1);
    const days = Math.floor((today - start) / (24 * 60 * 60 * 1000));
    return Math.ceil(days / 7);
  }, []);

  // 🔥 Calculate streaks
  const currentStreak = useMemo(() => {
    const logs = habitLogs.map(log => new Date(log.date).toDateString());
    let streak = 0;
    const today = new Date().toDateString();
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date();
      checkDate.setDate(checkDate.getDate() - i);
      if (logs.includes(checkDate.toDateString())) {
        streak++;
      } else break;
    }
    return streak;
  }, [habitLogs]);

  const heatmapData = useMemo(() => {
    const data = [];
    for (let week = 0; week < 12; week++) {
      for (let day = 0; day < 7; day++) {
        const date = new Date();
        date.setDate(date.getDate() - (week * 7 + day + 1));
        const completions = habitLogs.filter(log => 
          new Date(log.date).toDateString() === date.toDateString()
        ).length;
        data.push({ week, day, completions, date: date.toDateString() });
      }
    }
    return data;
  }, [habitLogs]);

  const getColor = (count) => {
    if (count === 0) return 'bg-gray-200 dark:bg-gray-800';
    if (count === 1) return 'bg-emerald-400/30 dark:bg-emerald-500/30';
    if (count >= 2) return 'bg-emerald-500/60 dark:bg-emerald-600/60';
    return 'bg-emerald-500';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 bg-card rounded-2xl border hover:shadow-xl"
    >
      <div className="flex items-center gap-3 mb-6">
        <Flame className="w-8 h-8 text-orange-500" />
        <h3 className="text-2xl font-bold">Habit Streaks</h3>
      </div>
      
      {/* 🔥 CURRENT STREAK */}
      <div className="text-center mb-8 p-6 bg-gradient-to-r from-orange-500/10 to-orange-400/10 rounded-2xl">
        <div className="text-4xl font-black text-orange-500 mb-2">{currentStreak}</div>
        <p className="text-muted-foreground text-lg">Current Streak</p>
        {currentStreak > 0 && (
          <p className="text-sm text-orange-600 font-semibold mt-1">
            {currentStreak === 1 ? 'Keep going!' : `${currentStreak} days strong!`}
          </p>
        )}
      </div>

      {/* 📊 HEATMAP */}
      <div className="space-y-2">
        <div className="flex gap-1 text-xs font-semibold text-muted-foreground">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
            <div key={day} className="w-8 flex-1 text-center">{day}</div>
          ))}
        </div>
        {Array.from({ length: 12 }, (_, week) => (
          <div key={week} className="flex gap-1">
            {Array.from({ length: 7 }, (_, day) => {
              const cell = heatmapData.find(c => c.week === (11 - week) && c.day === day);
              return (
                <div
                  key={day}
                  className={`w-4 h-4 rounded-sm flex-1 cursor-pointer hover:scale-125 transition-all border ${getColor(cell?.completions || 0)}`}
                  title={`${cell?.date}: ${cell?.completions || 0} completions`}
                />
              );
            })}
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default StreakHeatmap;
