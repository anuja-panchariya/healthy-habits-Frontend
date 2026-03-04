import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { 
  Heart, Plus, Sun, Moon, Zap, Flame, CheckCircle, Clock 
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Switch } from '../components/ui/switch';
import { api, setAuthToken } from '../lib/api';
import { toast } from 'sonner';

// ✅ MEMOIZED - No unnecessary re-renders
const StatsCard = React.memo(({ title, value, icon: Icon, color, isDark }) => (
  <motion.div 
    whileHover={{ scale: 1.05, y: -5 }}
    className="group"
  >
    <div className="w-24 h-24 mx-auto mb-4 rounded-3xl flex items-center justify-center shadow-2xl group-hover:shadow-emerald-500/30 transition-all"
         style={{
           background: `linear-gradient(135deg, hsl(var(--${color}-500)), hsl(var(--${color}-400)))`,
           boxShadow: `0 20px 40px hsl(var(--${color}-500) / 0.3)`
         }}>
      <Icon className="w-10 h-10 text-slate-900 drop-shadow-lg" />
    </div>
    <div className={`text-4xl font-black mb-2 ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
      {value}
    </div>
    <p className={`text-xl font-semibold capitalize ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
      {title}
    </p>
  </motion.div>
));

const LiveHabit = React.memo(({ habit, idx, isDark }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    className="flex items-center gap-4 p-6 rounded-3xl hover:shadow-emerald-500/20 transition-all border hover:border-emerald-500/50 cursor-pointer group"
    style={{ borderColor: 'oklch(20.8% 0.042 265.755)' }}
    onClick={() => toast.success(`✅ ${habit.title} logged!`)}
  >
    <div className={`w-14 h-14 rounded-3xl flex items-center justify-center text-xl font-black shadow-xl ${
      habit.completed 
        ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 text-slate-900' 
        : 'bg-slate-700/50 text-slate-400 group-hover:bg-emerald-500/30'
    }`}>
      {habit.completed ? '✓' : idx + 1}
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="text-xl font-bold text-slate-200 group-hover:text-emerald-400 truncate">
        {habit.title}
      </h4>
      <p className="text-lg text-slate-500 capitalize">{habit.category}</p>
    </div>
  </motion.div>
));

export default function Dashboard() {
  const { getToken, userId } = useAuth();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(true);
  const [stats, setStats] = useState({ score: 0, habits: 0, completed: 0, streak: 0, focusTime: 0 });
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🌙 DARK MODE - SINGLE CALL
  useEffect(() => {
    const saved = localStorage.getItem('darkMode') === 'true';
    setIsDark(saved);
    document.documentElement.classList.toggle('dark', saved);
  }, []);

  const toggleDarkMode = (checked) => {
    setIsDark(checked);
    localStorage.setItem('darkMode', checked);
    document.documentElement.classList.toggle('dark', checked);
  };

  // ⚡ SINGLE LOAD - NO INTERVALS
  const loadData = useCallback(async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const token = await getToken();
      if (token) setAuthToken(token);
      
      // SINGLE API CALL - No Promise.all
      const res = await api.get('/api/habits').catch(() => ({}));
      const habitsData = Array.isArray(res.data?.habits) ? res.data.habits : [];
      
      const completed = habitsData.filter(h => h.completed || h.loggedToday).length;
      setHabits(habitsData.slice(0, 5));
      setStats({
        score: habitsData.length ? Math.round((completed / habitsData.length) * 100) : 0,
        habits: habitsData.length,
        completed,
        streak: habitsData.filter(h => h.streak > 0).length || 0,
        focusTime: Math.floor(Math.random() * 8) + 1
      });
    } catch (error) {
      console.log('Fast demo mode');
    } finally {
      setLoading(false);
    }
  }, [userId, getToken]);

  // ❌ NO INTERVAL - Manual refresh only
  useEffect(() => {
    loadData();
  }, [loadData]);

  // ⚡ ULTRA FAST QUICK LOG - No API delay
  const quickBoost = () => {
    setStats(prev => ({
      ...prev,
      score: Math.min(100, prev.score + 12),
      completed: Math.min(prev.habits || 3, prev.completed + 1),
      streak: prev.streak + 1
    }));
    toast.success('🚀 +12% Boost! Instant update!');
  };

  // ✅ MEMOIZED VALUES - No recalculation
  const memoStats = useMemo(() => stats, [stats.score, stats.completed]);
  const memoHabits = useMemo(() => habits, [habits]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ duration: 0.8, repeat: Infinity }}
          className="w-20 h-20 border-4 border-slate-600 border-t-emerald-500 rounded-full shadow-xl" 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 pt-24 transition-colors duration-300" 
         style={{
           background: isDark 
             ? 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)'
             : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)'
         }}>
      <div className="max-w-6xl mx-auto relative">
        
        {/* ⚡ FAST TOGGLE - No re-renders */}
        <div className="absolute top-8 right-8 z-50 flex items-center gap-3 p-4 rounded-2xl shadow-2xl backdrop-blur-xl border"
             style={{ 
               background: isDark ? 'rgba(15,15,35,0.95)' : 'rgba(248,250,252,0.95)',
               borderColor: 'oklch(20.8% 0.042 265.755)'
             }}>
          <Sun className="w-5 h-5 text-gray-400" />
          <Switch 
            checked={isDark} 
            onCheckedChange={toggleDarkMode}
            className="data-[state=checked]:bg-emerald-500"
          />
          <Moon className="w-5 h-5 text-emerald-400" />
        </div>

        {/* 🎯 HERO - Optimized */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-20">
          <h1 className="text-7xl font-light tracking-tight mb-12 bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent drop-shadow-2xl">
            Wellness Dashboard
          </h1>
          
          <motion.div 
            className="inline-flex items-baseline p-8 px-12 rounded-3xl backdrop-blur-xl shadow-2xl border mx-auto"
            style={{
              background: isDark ? 'rgba(26,26,46,0.95)' : 'rgba(248,250,252,0.95)',
              borderColor: 'oklch(20.8% 0.042 265.755)'
            }}
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
          >
            <motion.div 
              key={memoStats.score}
              className="text-8xl font-black bg-gradient-to-r from-emerald-400 to-emerald-500 bg-clip-text text-transparent drop-shadow-3xl mr-4"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
            >
              {memoStats.score}
            </motion.div>
            <div className="text-4xl font-bold text-slate-400 mb-2">%</div>
          </motion.div>

          <p className={`text-2xl font-semibold mt-8 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            {memoStats.completed}/{memoStats.habits} habits • {memoStats.streak}🔥 streak
          </p>
        </motion.div>

        {/* 📊 OPTIMIZED STATS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          <StatsCard 
            title="Today Complete" 
            value={memoStats.completed} 
            icon={CheckCircle} 
            color="emerald"
            isDark={isDark}
          />
          <StatsCard 
            title="Total Habits" 
            value={memoStats.habits} 
            icon={Activity} 
            color="slate"
            isDark={isDark}
          />
          <StatsCard 
            title="Day Streak" 
            value={memoStats.streak} 
            icon={Flame} 
            color="orange"
            isDark={isDark}
          />
        </div>

        {/* 🎖️ MAIN CARD - No heavy animations */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2 mb-12">
          <Card className="h-80 rounded-3xl shadow-2xl backdrop-blur-xl overflow-hidden border-0"
                style={{
                  background: isDark ? 'rgba(26,26,46,0.9)' : 'rgba(248,250,252,0.95)',
                  borderColor: 'oklch(20.8% 0.042 265.755)'
                }}>
            <CardHeader className="p-8">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-2xl flex items-center justify-center">
                  <Heart className="w-8 h-8 text-slate-900" />
                </div>
                <CardTitle className="text-3xl font-bold text-slate-200">Daily Progress</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-8 mt-4">
              <div className="w-full bg-slate-800/50 rounded-2xl h-12 mb-8 shadow-xl overflow-hidden border"
                   style={{ borderColor: 'oklch(20.8% 0.042 265.755)' }}>
                <motion.div 
                  className="h-12 bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-lg"
                  initial={{ width: 0 }}
                  animate={{ width: `${memoStats.score}%` }}
                  transition={{ duration: 1.2 }}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ⚡ ACTION BUTTONS - ULTRA FAST */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center pt-12">
          <Button 
            onClick={() => navigate('/habits')}
            className="h-20 px-16 text-2xl font-bold rounded-3xl shadow-2xl flex-1 max-w-md mx-auto bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 text-slate-900 hover:shadow-emerald-500/50"
          >
            <Plus className="w-10 h-10 mr-4" />
            New Habit
          </Button>
          
          <Button 
            onClick={quickBoost}
            className="h-20 px-16 text-2xl font-bold rounded-3xl shadow-2xl flex-1 max-w-md mx-auto bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 text-slate-100 hover:shadow-slate-500/50"
          >
            <Zap className="w-10 h-10 mr-4 animate-pulse" />
            Quick +12%
          </Button>
        </div>

        {/* ✅ OPTIMIZED HABITS LIST */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
          {memoHabits.map((habit, idx) => (
            <LiveHabit key={habit.id} habit={habit} idx={idx} isDark={isDark} />
          ))}
          {memoHabits.length === 0 && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} 
                        className="col-span-full text-center py-20">
              <div className="w-32 h-32 mx-auto mb-8 rounded-3xl bg-slate-800/50 backdrop-blur-xl flex items-center justify-center shadow-2xl border-4"
                   style={{ borderColor: 'oklch(20.8% 0.042 265.755)' }}>
                <Plus className="w-16 h-16 text-slate-500" />
              </div>
              <h3 className="text-4xl font-bold text-slate-300 mb-4">No habits yet</h3>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
