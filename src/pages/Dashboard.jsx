import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Heart, Plus, Zap, Flame, CheckCircle, Clock } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useAuth } from '@clerk/clerk-react';
import { api, setAuthToken } from '../lib/api';
import { toast } from 'sonner';

export default function Dashboard() {
  const { getToken, userId } = useAuth();
  const [stats, setStats] = useState({ 
    score: 0, 
    habits: 0, 
    completed: 0, 
    streak: 0,
    challenges: 0 
  });
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🚀 REAL DATA LOAD - Supabase/Clerk auth
  const loadRealData = useCallback(async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const token = await getToken();
      setAuthToken(token);

      // ✅ REAL API CALLS - Sequential for reliability
      const habitsRes = await api.get('/api/habits');
      const challengesRes = await api.get('/api/challenges/my');
      
      const realHabits = habitsRes.data?.habits || [];
      const realChallenges = challengesRes.data?.challenges || [];
      
      // ✅ REAL CALCULATIONS FROM DATABASE
      const today = new Date().toDateString();
      const completedToday = realHabits.filter(habit => 
        habit.logs?.some(log => new Date(log.created_at).toDateString() === today)
      ).length;
      
      const currentStreak = realHabits.reduce((streak, habit) => {
        return habit.streak > streak ? habit.streak : streak;
      }, 0);

      setHabits(realHabits.slice(0, 6));
      setStats({
        score: realHabits.length ? Math.round((completedToday / realHabits.length) * 100) : 0,
        habits: realHabits.length,
        completed: completedToday,
        streak: currentStreak,
        challenges: realChallenges.length
      });
      
    } catch (error) {
      console.error('Real data load error:', error);
      toast.error('Failed to load data - Check backend');
    } finally {
      setLoading(false);
    }
  }, [userId, getToken]);

  useEffect(() => {
    loadRealData();
  }, [loadRealData]);

  // ✅ REAL QUICK LOG - Updates database
  const quickLogHabit = async () => {
    try {
      const token = await getToken();
      setAuthToken(token);
      
      // Log first habit or create demo
      if (habits[0]?.id) {
        await api.post(`/api/habits/${habits[0].id}/log`);
        toast.success(`✅ ${habits[0].title} logged!`);
      } else {
        await api.post('/api/habits/quick-log');
        toast.success('🚀 Quick habit logged!');
      }
      
      loadRealData(); // Refresh real data
    } catch (error) {
      toast.error('Log failed - Backend issue');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900/90 to-slate-900">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-24 h-24 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full shadow-2xl"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* 🎯 HERO - REAL STATS */}
        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-7xl lg:text-8xl font-light tracking-tight mb-8 bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent drop-shadow-2xl">
            Wellness Dashboard
          </h1>
          
          <motion.div 
            className="inline-flex items-baseline p-12 px-20 rounded-3xl bg-slate-900/90 backdrop-blur-xl shadow-2xl border-2 border-emerald-500/50 mx-auto mb-8 max-w-2xl"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            style={{ boxShadow: '0 25px 50px -12px rgba(16, 185, 129, 0.3)' }}
          >
            <motion.div 
              key={stats.score}
              className="text-8xl lg:text-9xl font-black bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 bg-clip-text text-transparent drop-shadow-4xl mr-8"
              initial={{ scale: 0.7 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {stats.score}%
            </motion.div>
            <div className="text-5xl font-bold text-slate-400 mb-4">Score</div>
          </motion.div>

          {/* 📊 LIVE METRICS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
            <div className="p-8 rounded-3xl bg-slate-800/70 backdrop-blur-xl border border-slate-700/50">
              <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
              <div className="text-4xl font-black text-slate-200">{stats.completed}</div>
              <p className="text-xl text-slate-400 mt-2">Today Complete</p>
            </div>
            <div className="p-8 rounded-3xl bg-slate-800/70 backdrop-blur-xl border border-slate-700/50">
              <Flame className="w-16 h-16 text-orange-400 mx-auto mb-4" />
              <div className="text-4xl font-black text-slate-200">{stats.streak}</div>
              <p className="text-xl text-slate-400 mt-2">🔥 Streak</p>
            </div>
            <div className="p-8 rounded-3xl bg-slate-800/70 backdrop-blur-xl border border-slate-700/50">
              <Clock className="w-16 h-16 text-blue-400 mx-auto mb-4" />
              <div className="text-4xl font-black text-slate-200">{stats.habits}</div>
              <p className="text-xl text-slate-400 mt-2">Total Habits</p>
            </div>
            <div className="p-8 rounded-3xl bg-slate-800/70 backdrop-blur-xl border border-slate-700/50">
              <Zap className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <div className="text-4xl font-black text-slate-200">{stats.challenges}</div>
              <p className="text-xl text-slate-400 mt-2">Challenges</p>
            </div>
          </div>
        </motion.section>

        {/* ⚡ ACTION BUTTONS */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row gap-6 justify-center"
        >
          <Button 
            onClick={() => window.location.href = '/habits'}
            size="lg"
            className="h-20 px-12 text-2xl font-bold rounded-3xl shadow-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 text-slate-900 flex-1 max-w-md mx-auto"
          >
            <Plus className="w-10 h-10 mr-4" />
            Add New Habit
          </Button>
          
          <Button 
            onClick={quickLogHabit}
            size="lg"
            className="h-20 px-12 text-2xl font-bold rounded-3xl shadow-2xl bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 text-slate-100 flex-1 max-w-md mx-auto"
          >
            <Zap className="w-10 h-10 mr-4 animate-pulse" />
            Log Today
          </Button>
        </motion.section>

        {/* 📈 RECENT HABITS - REAL DATA */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-slate-200 flex items-center gap-4">
                Recent Habits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {habits.map((habit) => (
                  <motion.div 
                    key={habit.id}
                    className="p-6 rounded-3xl bg-slate-800/70 border border-slate-700/50 hover:border-emerald-500/50 hover:bg-slate-800/90 transition-all cursor-pointer group"
                    whileHover={{ y: -4, scale: 1.02 }}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black shadow-xl ${
                        habit.logs?.length > 0 
                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 text-slate-900' 
                          : 'bg-slate-700/50 text-slate-400 group-hover:bg-emerald-500/30'
                      }`}>
                        {habit.logs?.length > 0 ? '✓' : '⚡'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-2xl font-bold text-slate-200 group-hover:text-emerald-400 truncate">
                          {habit.title}
                        </h3>
                        <p className="text-lg text-slate-500 capitalize mt-1">{habit.category}</p>
                        {habit.logs?.length > 0 && (
                          <p className="text-sm text-emerald-400 mt-2 font-mono">
                            Logged {habit.logs.length} times
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
                {habits.length === 0 && (
                  <div className="col-span-full text-center py-20">
                    <div className="w-32 h-32 mx-auto mb-8 rounded-3xl bg-slate-800/50 backdrop-blur-xl border-2 border-dashed border-slate-600 flex items-center justify-center">
                      <Plus className="w-16 h-16 text-slate-500" />
                    </div>
                    <h3 className="text-4xl font-bold text-slate-300 mb-4">No habits yet</h3>
                    <p className="text-xl text-slate-500">Create your first habit to see real data</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.section>
      </div>
    </div>
  );
}
