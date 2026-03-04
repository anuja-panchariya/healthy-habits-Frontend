import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  TrendingUp, Activity, Target, Heart, Plus, Sun, Moon 
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Switch } from '../components/ui/switch';
import { api, setAuthToken } from '../lib/api';
import { useAuth } from '@clerk/clerk-react';
import { toast } from 'sonner';

export default function Dashboard() {
  const { getToken, userId } = useAuth();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(true);
  const [stats, setStats] = useState({ score: 0, habits: 0, completed: 0 });
  const [loading, setLoading] = useState(true);

  // 🌙 DARK MODE TOGGLE (localStorage)
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

  // 🚀 LOAD DATA
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      if (userId) {
        const token = await getToken();
        if (token) setAuthToken(token);
        const habitsRes = await api.get('/api/habits').catch(() => ({}));
        const habitsData = Array.isArray(habitsRes.data?.habits) ? habitsRes.data.habits : [];
        
        setStats({
          score: habitsData.length ? Math.round((habitsData.filter(h => h.completed).length / habitsData.length) * 100) : 0,
          habits: habitsData.length,
          completed: habitsData.filter(h => h.completed).length
        });
      } else {
        // Demo data
        setStats({ score: 0, habits: 0, completed: 0 });
      }
    } catch (error) {
      setStats({ score: 0, habits: 0, completed: 0 });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 from-gray-100 via-blue-50 to-indigo-100">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ duration: 1, repeat: Infinity }}
          className="w-20 h-20 border-4 border-slate-600 dark:border-slate-500 border-t-emerald-500 rounded-full" 
        />
      </div>
    );
  }

  return (
    <>
      <style jsx>{`
        :global(.dark) { @apply dark; }
      `}</style>
      
      <div className={`min-h-screen p-8 pt-24 transition-all duration-300 ${
        isDark 
          ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-200' 
          : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 text-slate-900'
      }`}>
        <div className="max-w-6xl mx-auto relative">
          
          {/* 🌙 DARK TOGGLE - TOP RIGHT */}
          <div className="absolute top-8 right-8 z-50 flex items-center gap-3 p-4 rounded-2xl shadow-2xl backdrop-blur-xl border ${
            isDark 
              ? 'bg-slate-800/95 border-slate-600/50' 
              : 'bg-white/90 border-slate-200/50'
          } hover:shadow-3xl transition-all">
            <Sun className={`w-6 h-6 transition-colors ${isDark ? 'text-slate-500' : 'text-emerald-500'}`} />
            <Switch 
              checked={isDark} 
              onCheckedChange={toggleDarkMode}
              className="data-[state=checked]:bg-emerald-500"
            />
            <Moon className={`w-6 h-6 transition-colors ${isDark ? 'text-emerald-400' : 'text-slate-500'}`} />
          </div>

          {/* HEADER */}
          <div className="text-center mb-20">
            <motion.h1 
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              className={`text-6xl font-light tracking-tight drop-shadow-2xl mb-8 ${
                isDark ? 'text-slate-200' : 'text-slate-900'
              }`}
            >
              Wellness Dashboard
            </motion.h1>
            
            <motion.div 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className={`text-7xl font-black drop-shadow-2xl mb-2 ${
                isDark ? 'text-emerald-400' : 'text-emerald-500'
              }`}
            >
              {stats.score}%
            </motion.div>
            <p className={`text-2xl font-semibold ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}>
              {stats.completed}/{stats.habits} habits today
            </p>
          </div>

          {/* MAIN STATS GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* WELLNESS SCORE CARD */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-2"
            >
              <Card className={`h-80 shadow-2xl rounded-3xl border-0 backdrop-blur-xl overflow-hidden ${
                isDark 
                  ? 'bg-slate-800/80 border-slate-600/50 shadow-slate-900/50' 
                  : 'bg-white/90 border-slate-200/50 shadow-slate-100/50'
              }`}>
                <CardHeader className="p-8 pb-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl ${
                      isDark 
                        ? 'bg-slate-700 text-emerald-400' 
                        : 'bg-slate-100 text-emerald-500'
                    }`}>
                      <Heart className="w-8 h-8" />
                    </div>
                    <CardTitle className={`text-3xl font-bold ${
                      isDark ? 'text-slate-200' : 'text-slate-900'
                    }`}>
                      Wellness Score
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <div className={`w-full bg-opacity-50 rounded-full h-8 mb-8 shadow-inner ${
                    isDark ? 'bg-slate-700/50' : 'bg-slate-200/50'
                  }`}>
                    <motion.div 
                      className={`h-8 rounded-full shadow-lg ${
                        isDark ? 'bg-emerald-500' : 'bg-emerald-500'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${stats.score}%` }}
                      transition={{ duration: 1.5 }}
                    />
                  </div>
                  <p className={`text-2xl font-semibold text-center ${
                    isDark ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    {stats.completed} of {stats.habits} habits • {stats.score}% score
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* STATS CARDS */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* TOTAL HABITS */}
              <Card className={`h-48 shadow-2xl rounded-3xl border-0 backdrop-blur-xl ${
                isDark 
                  ? 'bg-slate-800/80 border-slate-600/50 shadow-slate-900/50' 
                  : 'bg-white/90 border-slate-200/50 shadow-slate-100/50'
              }`}>
                <CardContent className="p-8 pt-12 text-center">
                  <div className={`text-5xl font-black mb-4 ${
                    isDark ? 'text-slate-200' : 'text-slate-900'
                  }`}>
                    {stats.habits}
                  </div>
                  <p className={`text-xl font-semibold ${
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    Total Habits
                  </p>
                </CardContent>
              </Card>

              {/* TODAY'S HABITS */}
              <Card className={`h-48 shadow-2xl rounded-3xl border-0 backdrop-blur-xl ${
                isDark 
                  ? 'bg-slate-800/80 border-slate-600/50 shadow-slate-900/50' 
                  : 'bg-white/90 border-slate-200/50 shadow-slate-100/50'
              }`}>
                <CardContent className="p-8 pt-12 text-center">
                  <div className={`text-5xl font-black mb-4 ${
                    isDark ? 'text-emerald-400' : 'text-emerald-500'
                  }`}>
                    {stats.completed}
                  </div>
                  <p className={`text-xl font-semibold ${
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    Today Complete
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* ADD HABIT BUTTON */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center pt-16"
          >
            <Button 
              onClick={() => navigate('/habits')}
              className={`h-20 px-16 text-2xl font-bold rounded-3xl shadow-2xl transition-all ${
                isDark 
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-slate-900 shadow-emerald-500/25 border-emerald-400/50' 
                  : 'bg-emerald-500 hover:bg-emerald-600 text-slate-900 shadow-emerald-500/25 border-emerald-400/50'
              }`}
            >
              <Plus className="w-8 h-8 mr-4" />
              New Habit
            </Button>
          </motion.div>
        </div>
      </div>
    </>
  );
}
