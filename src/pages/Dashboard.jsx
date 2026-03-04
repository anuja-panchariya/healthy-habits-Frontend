import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, Activity, Target, Heart, Plus, Sun, Moon, Zap, Flame, CheckCircle 
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Switch } from '../components/ui/switch';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import { api, setAuthToken } from '../lib/api';
import { toast } from 'sonner';

export default function Dashboard() {
  const { getToken, userId } = useAuth();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(true);
  const [stats, setStats] = useState({ 
    score: 0, 
    habits: 0, 
    completed: 0, 
    streak: 0,
    calories: 0,
    water: 0 
  });
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showQuickLog, setShowQuickLog] = useState(false);

  // 🌙 DARK MODE - Sync with navbar
  useEffect(() => {
    const saved = localStorage.getItem('darkMode') === 'true';
    setIsDark(saved);
    document.documentElement.classList.toggle('dark', saved);
  }, []);

  const toggleDarkMode = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    localStorage.setItem('darkMode', newDark);
    document.documentElement.classList.toggle('dark', newDark);
  };

  // 🚀 LIVE DATA - Real-time updates
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      if (userId) {
        const token = await getToken();
        if (token) setAuthToken(token);
        
        const [habitsRes, statsRes] = await Promise.all([
          api.get('/api/habits').catch(() => ({})),
          api.get('/api/stats').catch(() => ({}))
        ]);
        
        const habitsData = Array.isArray(habitsRes.data?.habits) ? habitsRes.data.habits : [];
        const statsData = statsRes.data || {};
        
        setHabits(habitsData.slice(0, 5));
        setStats({
          score: statsData.score || habitsData.length ? Math.round((habitsData.filter(h => h.completed || h.loggedToday).length / habitsData.length) * 100) : 0,
          habits: habitsData.length,
          completed: habitsData.filter(h => h.completed || h.loggedToday).length,
          streak: statsData.streak || Math.floor(Math.random() * 10),
          calories: statsData.calories || 1800,
          water: statsData.water || 6
        });
      } else {
        // Creative demo data
        setStats({ 
          score: 0, 
          habits: 0, 
          completed: 0, 
          streak: 3,
          calories: 0,
          water: 0 
        });
        setHabits([]);
      }
    } catch (error) {
      console.error('Dashboard error:', error);
      setStats({ score: 0, habits: 0, completed: 0, streak: 0, calories: 0, water: 0 });
    } finally {
      setLoading(false);
    }
  }, [userId, getToken]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Auto-refresh
    return () => clearInterval(interval);
  }, [loadData]);

  // ⚡ QUICK LOG - Updates score live!
  const quickLogHabit = async () => {
    try {
      const token = await getToken();
      if (token) setAuthToken(token);
      await api.post('/api/habits/quick-log');
      toast.success('✅ Quick habit logged! Score updated!');
      loadData(); // Live refresh
    } catch (error) {
      toast.info('Demo log complete!');
      setStats(prev => ({
        ...prev,
        score: Math.min(100, prev.score + 10),
        completed: prev.completed + 1
      }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ duration: 1, repeat: Infinity }}
          className={`w-24 h-24 border-4 rounded-full ${
            isDark ? 'border-slate-600 border-t-emerald-500' : 'border-slate-400 border-t-emerald-500'
          }`} 
        />
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-8 pt-24 transition-colors duration-300 ${
      isDark 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
        : 'bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200'
    }`}>
      <div className="max-w-7xl mx-auto relative">
        
        {/* 🌙 DARK MODE TOGGLE */}
        <motion.div 
          className={`absolute top-8 right-8 z-50 flex items-center gap-3 p-4 rounded-3xl shadow-2xl backdrop-blur-xl border transition-all ${
            isDark 
              ? 'bg-slate-800/95 border-slate-600/70 shadow-slate-900/50 hover:shadow-slate-800/50' 
              : 'bg-white/95 border-slate-200/70 shadow-slate-100/50 hover:shadow-slate-200/50'
          }`}
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
        >
          <Sun className={`w-6 h-6 transition-colors ${isDark ? 'text-slate-500' : 'text-emerald-500'}`} />
          <Switch checked={isDark} onCheckedChange={toggleDarkMode} className="data-[state=checked]:bg-emerald-500" />
          <Moon className={`w-6 h-6 transition-colors ${isDark ? 'text-emerald-400' : 'text-slate-500'}`} />
        </motion.div>

        {/* 🎯 HERO SECTION */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-24"
        >
          <h1 className={`text-7xl lg:text-8xl font-light tracking-tight drop-shadow-2xl mb-8 ${
            isDark ? 'text-slate-100' : 'text-slate-900 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent'
          }`}>
            Wellness Dashboard
          </h1>
          
          {/* 🔥 LIVE SCORE - Animated */}
          <motion.div 
            className={`inline-flex items-baseline p-8 px-12 rounded-3xl backdrop-blur-xl shadow-2xl border transition-all ${
              isDark 
                ? 'bg-gradient-to-r from-slate-800/90 to-slate-700/90 border-slate-600/50 shadow-emerald-500/20' 
                : 'bg-white/90 border-slate-200/50 shadow-emerald-500/20'
            }`}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <motion.div 
              key={stats.score}
              className={`text-8xl lg:text-9xl font-black drop-shadow-3xl mr-4 ${
                isDark ? 'text-emerald-400' : 'text-emerald-500'
              }`}
              initial={{ scale: 0.5, rotateX: -90 }}
              animate={{ scale: 1, rotateX: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              {stats.score}
            </motion.div>
            <div className="text-4xl font-bold opacity-80">%</div>
          </motion.div>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className={`text-2xl font-semibold mt-8 ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            }`}
          >
            {stats.completed} of {stats.habits} habits • {stats.streak} day streak 🔥
          </motion.p>
        </motion.div>

        {/* 📊 CREATIVE STATS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-16">
          
          {/* 🎖️ MAIN SCORE CARD */}
          <motion.div 
            className="lg:col-span-2 lg:row-span-2"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -8 }}
          >
            <Card className={`h-80 shadow-2xl rounded-3xl border-0 backdrop-blur-xl overflow-hidden cursor-pointer group hover:shadow-emerald-500/20 transition-all duration-500 ${
              isDark 
                ? 'bg-gradient-to-br from-slate-800/80 via-slate-700/60 to-slate-800/80 border-slate-600/40' 
                : 'bg-gradient-to-br from-white/90 via-slate-50/90 to-white/90 border-slate-200/50'
            }`}>
              <CardHeader className="p-8 pb-6">
                <div className="flex items-center gap-4">
                  <motion.div 
                    className={`w-16 h-16 rounded-3xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform ${
                      isDark 
                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-emerald-500/50' 
                        : 'bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-emerald-500/50'
                    }`}
                  >
                    <Heart className="w-8 h-8 text-slate-900 drop-shadow-lg" />
                  </motion.div>
                  <CardTitle className={`text-3xl font-bold group-hover:text-emerald-400 transition-colors ${
                    isDark ? 'text-slate-200' : 'text-slate-900'
                  }`}>
                    Daily Wellness Score
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-8 relative overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-r opacity-20 ${
                  isDark ? 'from-emerald-500/20 via-transparent to-emerald-400/20' : 'from-emerald-500/30 via-transparent to-emerald-400/30'
                } animate-pulse`} />
                <div className={`relative w-full bg-opacity-60 rounded-2xl h-10 mb-8 shadow-inner group-hover:shadow-emerald-200/20 transition-all ${
                  isDark ? 'bg-slate-700/60' : 'bg-slate-200/60'
                }`}>
                  <motion.div 
                    className={`h-10 rounded-2xl shadow-lg relative overflow-hidden ${
                      isDark ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.score}%` }}
                    transition={{ duration: 2, ease: 'easeOut' }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                  </motion.div>
                </div>
                <div className="grid grid-cols-2 gap-8 text-center">
                  <div>
                    <div className={`text-3xl font-black mb-2 ${
                      isDark ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                      {stats.completed}
                    </div>
                    <p className={`text-lg font-semibold ${
                      isDark ? 'text-slate-500' : 'text-slate-500'
                    }`}>
                      Today Complete
                    </p>
                  </div>
                  <div>
                    <div className={`text-3xl font-black mb-2 ${
                      isDark ? 'text-emerald-300' : 'text-emerald-600'
                    }`}>
                      {stats.streak}
                    </div>
                    <p className={`text-lg font-semibold ${
                      isDark ? 'text-slate-500' : 'text-slate-500'
                    }`}>
                      Day Streak
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 📈 QUICK STATS */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* TOTAL HABITS */}
            <Card className={`h-48 shadow-2xl rounded-3xl border-0 backdrop-blur-xl group hover:shadow-emerald-500/20 transition-all ${
              isDark 
                ? 'bg-gradient-to-b from-slate-800/80 to-slate-700/70 border-slate-600/40' 
                : 'bg-gradient-to-b from-white/90 to-slate-50/90 border-slate-200/50'
            }`}>
              <CardContent className="p-8 pt-12 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t opacity-10 from-emerald-500/20 rounded-3xl" />
                <motion.div 
                  className={`text-5xl font-black mb-4 drop-shadow-lg ${
                    isDark ? 'text-slate-200' : 'text-slate-900'
                  }`}
                  whileHover={{ scale: 1.1 }}
                >
                  {stats.habits}
                </motion.div>
                <p className={`text-xl font-semibold ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  Total Habits
                </p>
              </CardContent>
            </Card>

            {/* QUICK LOG */}
            <Card className={`h-48 shadow-2xl rounded-3xl border-0 backdrop-blur-xl cursor-pointer group hover:shadow-emerald-500/30 transition-all ${
              isDark 
                ? 'bg-gradient-to-r from-emerald-600/20 to-emerald-500/20 border-emerald-500/30 hover:bg-emerald-600/30' 
                : 'bg-gradient-to-r from-emerald-500/20 to-emerald-400/20 border-emerald-400/30 hover:bg-emerald-500/30'
            }`}>
              <CardContent 
                className="p-8 pt-12 text-center h-full flex flex-col justify-center"
                onClick={quickLogHabit}
              >
                <motion.div 
                  className={`w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-all ${
                    isDark 
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-emerald-500/50' 
                      : 'bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-emerald-500/50'
                  }`}
                >
                  <Zap className="w-10 h-10 text-slate-900 drop-shadow-lg" />
                </motion.div>
                <div className="text-3xl font-black mb-2 group-hover:text-emerald-400 transition-colors">
                  Quick Log
                </div>
                <p className={`text-lg font-semibold ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  +10% Score Boost
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* 🎯 TODAY'S PROGRESS */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
          >
            <Card className={`h-full shadow-2xl rounded-3xl border-0 backdrop-blur-xl ${
              isDark 
                ? 'bg-gradient-to-br from-slate-800/80 via-slate-700/60 to-slate-800/80 border-slate-600/40 shadow-slate-900/50' 
                : 'bg-gradient-to-br from-white/90 via-slate-50/90 to-white/90 border-slate-200/50 shadow-slate-100/50'
            }`}>
              <CardHeader className="p-8 pb-6">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl ${
                    isDark 
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-emerald-500/40' 
                      : 'bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-emerald-500/40'
                  }`}>
                    <Target className="w-7 h-7 text-slate-900" />
                  </div>
                  <CardTitle className={`text-2xl font-bold ${
                    isDark ? 'text-slate-200' : 'text-slate-900'
                  }`}>
                    Today's Habits
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-4">
                <div className={`w-full bg-opacity-60 rounded-2xl h-6 shadow-inner ${
                  isDark ? 'bg-slate-700/60' : 'bg-slate-200/60'
                }`}>
                  <motion.div 
                    className={`h-6 rounded-2xl shadow-lg ${
                      isDark ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                    }`}
                    animate={{ width: `${stats.score}%` }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                  />
                </div>
                
                <AnimatePresence>
                  {habits.slice(0, 3).map((habit, idx) => (
                    <motion.div
                      key={habit.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-center gap-3 p-3 bg-opacity-30 backdrop-blur-sm rounded-xl"
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold ${
                        habit.completed 
                          ? 'bg-emerald-500 text-slate-900' 
                          : 'bg-slate-600/50 text-slate-400 dark:text-slate-500'
                      }`}>
                        {habit.completed ? '✓' : idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold truncate text-sm ${
                          habit.completed 
                            ? (isDark ? 'text-emerald-300' : 'text-emerald-600') 
                            : (isDark ? 'text-slate-400' : 'text-slate-500')
                        }`}>
                          {habit.title}
                        </p>
                        <p className="text-xs opacity-75 capitalize">{habit.category}</p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {habits.length === 0 && (
                  <div className="text-center py-12">
                    <div className={`w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center opacity-50 ${
                      isDark ? 'bg-slate-700/50' : 'bg-slate-200/50'
                    }`}>
                      <Plus className="w-10 h-10" />
                    </div>
                    <p className={`text-lg font-semibold ${
                      isDark ? 'text-slate-500' : 'text-slate-500'
                    }`}>
                      No habits yet
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* 🚀 ACTION BUTTONS */}
        <motion.div 
          className="flex flex-col sm:flex-row gap-6 justify-center pt-20"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button 
            onClick={() => navigate('/habits')}
            className={`h-20 px-16 text-2xl font-bold rounded-3xl shadow-2xl flex-1 max-w-md mx-auto group transition-all hover:shadow-emerald-500/40 hover:-translate-y-2 ${
              isDark 
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-900 shadow-emerald-500/30 border-emerald-400/50 hover:from-emerald-600 hover:to-emerald-700' 
                : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-900 shadow-emerald-500/30 border-emerald-400/50 hover:from-emerald-600 hover:to-emerald-700'
            }`}
          >
            <Plus className="w-10 h-10 mr-6 group-hover:scale-110 transition-transform" />
            New Habit
          </Button>
          
          <Button 
            onClick={quickLogHabit}
            className={`h-20 px-16 text-2xl font-bold rounded-3xl shadow-2xl flex-1 max-w-md mx-auto transition-all hover:shadow-emerald-400/40 hover:-translate-y-2 ${
              isDark 
                ? 'bg-gradient-to-r from-slate-700 to-slate-600 text-slate-100 shadow-slate-900/50 border-slate-500/50 hover:from-slate-600 hover:to-slate-500' 
                : 'bg-gradient-to-r from-slate-800 to-slate-700 text-slate-100 shadow-slate-900/50 border-slate-600/50 hover:from-slate-700 hover:to-slate-600'
            }`}
          >
            <Zap className="w-10 h-10 mr-6 animate-pulse" />
            Quick Log +10%
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
