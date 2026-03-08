import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import { 
  TrendingUp, Activity, Target, Flame, Plus, CheckCircle 
} from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { api, setAuthToken } from "../lib/api";
import { toast } from "sonner";

export default function Dashboard() {
  const { getToken, userId, user } = useAuth();
  const [habits, setHabits] = useState([]);
  const [wellnessScore, setWellnessScore] = useState(0);
  const [loading, setLoading] = useState(true);

  // 🔥 CURRENT STREAK
  const currentStreak = useMemo(() => {
    const allLogs = habits.flatMap(h => h.logs || []);
    const logs = allLogs.map(log => new Date(log.date).toDateString());
    let streak = 0;
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date();
      checkDate.setDate(checkDate.getDate() - i);
      if (logs.includes(checkDate.toDateString())) streak++;
      else break;
    }
    return streak;
  }, [habits]);

  // 🎯 WELLNESS SCORE
  const calculateWellnessScore = useCallback((habitsData) => {
    if (!Array.isArray(habitsData) || habitsData.length === 0) return 0;
    const today = new Date().toDateString();
    const completedToday = habitsData.filter(habit => 
      habit.logs?.some(log => new Date(log.date).toDateString() === today) ||
      habit.loggedToday
    ).length;
    return Math.max(0, Math.min(100, Math.round((completedToday / habitsData.length) * 100)));
  }, []);

  // 🚀 LOAD DATA
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (token) setAuthToken(token);

      const habitsRes = await api.get("/api/habits").catch(() => ({}));
      const habitsData = habitsRes.habits || habitsRes.data?.habits || [];
      
      setHabits(habitsData);
      setWellnessScore(calculateWellnessScore(habitsData));
      
    } catch (error) {
      console.error("Dashboard error:", error);
      setHabits([]);
      setWellnessScore(0);
    } finally {
      setLoading(false);
    }
  }, [getToken, calculateWellnessScore]);

  useEffect(() => {
    if (userId) loadDashboardData();
  }, [userId, loadDashboardData]);

  const handleLogHabit = async (habitId, habitTitle) => {
    try {
      const token = await getToken();
      setAuthToken(token);
      await api.post(`/api/habits/${habitId}/log`);
      toast.success(`✅ "${habitTitle}" logged!`);
      loadDashboardData();
    } catch (error) {
      if (error.message?.includes('409')) {
        toast.info('Already logged today!');
      } else {
        toast.error('Log failed');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-black to-emerald-900/20">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-20 h-20 border-4 border-emerald-500/30 border-t-emerald-400 rounded-full shadow-2xl"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-emerald-900/20 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* 🖤 HERO HEADER */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="relative backdrop-blur-xl bg-black/60 border border-emerald-500/30 rounded-3xl p-8 lg:p-12 shadow-2xl hover:shadow-emerald-500/20"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent" />
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div className="max-w-lg">
              <h1 className="text-4xl lg:text-6xl font-black bg-gradient-to-r from-emerald-400 via-emerald-300 to-emerald-500 bg-clip-text text-transparent mb-4 leading-tight">
                Elite Dashboard
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-emerald-300/90 font-mono text-lg">
                <div className="flex items-center gap-2 px-5 py-3 bg-emerald-500/15 backdrop-blur-sm rounded-2xl border border-emerald-400/40 hover:bg-emerald-500/25">
                  <Activity className="w-5 h-5" />
                  <span>{habits.length} habits</span>
                </div>
                <div className="flex items-center gap-2 px-5 py-3 bg-emerald-500/15 backdrop-blur-sm rounded-2xl border border-emerald-400/40 hover:bg-emerald-500/25">
                  <Flame className="w-5 h-5 text-emerald-400" />
                  <span className="font-bold">{currentStreak}🔥 streak</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-4">
              <Button
                size="lg"
                onClick={() => window.location.href = '/habits'}
                className="h-16 px-10 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 text-slate-900 font-bold shadow-2xl shadow-emerald-500/40"
              >
                <Plus className="w-5 h-5 mr-2" />
                New Habit
              </Button>
            </div>
          </div>
        </motion.div>

        {/* 📊 PERFECT 4-COLUMN BENTO - ALL SAME HEIGHT */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-4 gap-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ staggerChildren: 0.1 }}
        >
          
          {/* 🌀 WELLNESS RING - 2 COL */}
          <motion.div 
            initial={{ y: 50, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            className="lg:col-span-2 h-80 lg:h-96"
          >
            <Card className="h-full backdrop-blur-xl bg-slate-900/80 border border-emerald-500/30 hover:border-emerald-400/50 shadow-2xl hover:shadow-emerald-500/25 rounded-3xl overflow-hidden">
              <CardHeader className="pb-8">
                <CardTitle className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-emerald-500/50">
                    <TrendingUp className="w-10 h-10 text-slate-900" />
                  </div>
                  <div>
                    <h3 className="text-4xl font-black bg-gradient-to-r from-emerald-300 via-emerald-200 to-emerald-400 bg-clip-text text-transparent">
                      Wellness Score
                    </h3>
                    <p className="text-emerald-300/80 font-mono text-lg mt-1">Live tracking</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="text-center space-y-8">
                  <div className="relative mx-auto w-64 h-64 lg:w-72 lg:h-72">
                    <svg className="w-full h-full transform -rotate-90 origin-center" viewBox="0 0 200 200">
                      <defs>
                        <linearGradient id="emeraldRing" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#10b981" />
                          <stop offset="50%" stopColor="#059669" />
                          <stop offset="100%" stopColor="#047857" />
                        </linearGradient>
                      </defs>
                      <circle
                        cx="100" cy="100" r="85"
                        fill="none" stroke="url(#emeraldRing)"
                        strokeWidth="16" strokeLinecap="round"
                        strokeDasharray="534" 
                        strokeDashoffset={534 - (wellnessScore * 5.34)}
                        className="transition-all duration-1500 ease-out"
                        style={{ filter: 'drop-shadow(0 0 30px rgba(16, 185, 129, 0.6))' }}
                      />
                    </svg>
                    <motion.div
                      key={wellnessScore}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <div className="text-6xl lg:text-7xl font-black bg-gradient-to-r from-emerald-400 to-emerald-200 bg-clip-text text-transparent drop-shadow-2xl">
                        {wellnessScore}%
                      </div>
                    </motion.div>
                  </div>
                  
                  <div className="space-y-4">
                    <Progress 
                      value={wellnessScore} 
                      className="h-5 w-full [&>div]:!bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-lg" 
                    />
                    <div className="text-xl font-mono text-emerald-300">
                      {habits.length === 0 ? "Create first habit →" : `${habits.length} habits • ${wellnessScore}% today`}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* ✅ FIXED: QUICK STATS - PERFECT LAYOUT */}
          <motion.div 
            initial={{ y: 50, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            className="lg:col-span-1 h-80 lg:h-96"
          >
            <Card className="h-full backdrop-blur-xl bg-slate-900/70 border border-emerald-500/20 hover:border-emerald-400/40 shadow-2xl hover:shadow-emerald-500/30 rounded-3xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent" />
              <CardContent className="p-8 relative h-full flex flex-col justify-between pt-20 pb-8 space-y-6">
                <div>
                  <h3 className="text-2xl font-black text-emerald-300 mb-8 flex items-center gap-3">
                    <Activity className="w-9 h-9 bg-emerald-500 text-slate-900 p-2 rounded-2xl shadow-lg" />
                    Quick Stats
                  </h3>
                  
                  {/* BIG NUMBERS GRID */}
                  <div className="grid grid-cols-2 gap-8 mb-8">
                    <div className="group p-8 bg-emerald-500/10 backdrop-blur-sm rounded-3xl border border-emerald-400/40 hover:bg-emerald-500/20 hover:shadow-emerald-500/25 shadow-xl transition-all text-center">
                      <div className="text-5xl lg:text-6xl font-black text-emerald-400 mb-3">{habits.length}</div>
                      <div className="text-lg font-mono text-emerald-300 uppercase tracking-wider">Habits</div>
                    </div>
                    <div className="group p-8 bg-emerald-500/10 backdrop-blur-sm rounded-3xl border border-emerald-400/40 hover:bg-emerald-500/20 hover:shadow-emerald-500/25 shadow-xl transition-all text-center">
                      <div className="text-5xl lg:text-6xl font-black text-emerald-400 mb-3">{currentStreak}</div>
                      <div className="text-lg font-mono text-emerald-300 uppercase tracking-wider">Streak</div>
                    </div>
                  </div>

                  {/* EFFICIENCY BAR */}
                  <div className="p-6 bg-emerald-500/20 backdrop-blur-sm rounded-2xl border border-emerald-400/40 shadow-xl">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono text-emerald-300">Efficiency</span>
                      <span className="font-black text-lg text-emerald-200">{Math.round(wellnessScore * 0.95)}%</span>
                    </div>
                    <Progress value={wellnessScore * 0.95} className="h-3 [&>div]:!bg-gradient-to-r from-emerald-400 to-emerald-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* ✅ FIXED: RECENT HABITS - PERFECT LAYOUT */}
          <motion.div 
            initial={{ y: 50, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            className="lg:col-span-1 h-80 lg:h-96"
          >
            <Card className="h-full backdrop-blur-xl bg-slate-900/70 border border-emerald-500/20 hover:border-emerald-400/40 shadow-2xl hover:shadow-emerald-500/30 rounded-3xl overflow-hidden">
              <CardHeader className="pb-6 bg-emerald-500/5">
                <CardTitle className="flex items-center gap-3 text-2xl font-black text-emerald-300">
                  <Target className="w-9 h-9 bg-gradient-to-r from-orange-400 to-red-400 text-slate-900 p-3 rounded-2xl shadow-lg" />
                  Today's Habits
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4 max-h-80 overflow-y-auto">
                {habits.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-16 space-y-6">
                    <motion.div 
                      animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 3 }}
                      className="w-24 h-24 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-3xl flex items-center justify-center shadow-2xl mb-6"
                    >
                      <Plus className="w-12 h-12 text-slate-900" />
                    </motion.div>
                    <div>
                      <h3 className="text-3xl font-black text-emerald-300 mb-4">Launch Journey</h3>
                      <p className="text-emerald-400/90 text-lg font-mono mb-8 max-w-sm leading-relaxed">
                        Track hydration, sleep, meditation. 
                        <br />
                        <span className="text-sm">3 habits → 30% productivity boost</span>
                      </p>
                    </div>
                    <Button 
                      size="lg"
                      onClick={() => window.location.href = '/habits'}
                      className="h-16 px-12 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 text-slate-900 shadow-2xl shadow-emerald-500/40 font-bold font-mono tracking-wide text-lg"
                    >
                      🚀 First Habit
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {habits.slice(0, 4).map((habit, index) => (
                      <motion.div
                        key={habit.id}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.02, y: -2 }}
                        className="group flex items-center p-4 bg-emerald-500/10 backdrop-blur-sm hover:bg-emerald-500/20 border border-emerald-400/40 hover:border-emerald-400/60 rounded-2xl shadow-lg hover:shadow-emerald-500/30 transition-all"
                      >
                        <div className={`w-4 h-4 rounded-full shadow-lg flex-shrink-0 ${
                          habit.loggedToday 
                            ? 'bg-emerald-400 shadow-emerald-400/50 scale-110' 
                            : 'bg-gradient-to-r from-orange-400 to-red-400 shadow-orange-400/30'
                        }`} />
                        <div className="flex-1 min-w-0 ml-4">
                          <h4 className="font-bold text-lg text-emerald-200 truncate group-hover:text-emerald-100">
                            {habit.title}
                          </h4>
                          <p className="text-xs font-mono text-emerald-300/80 capitalize">{habit.category}</p>
                        </div>
                        <Button
                          onClick={() => handleLogHabit(habit.id, habit.title)}
                          size="sm"
                          className={`ml-4 h-10 px-4 rounded-xl font-mono font-bold shadow-lg transition-all ${
                            habit.loggedToday
                              ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-900 shadow-emerald-500/40'
                              : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 text-slate-900 shadow-emerald-500/40'
                          }`}
                        >
                          {habit.loggedToday ? <CheckCircle className="w-4 h-4" /> : 'Log'}
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
