import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import { 
  TrendingUp, Activity, Target, Flame, Plus, CheckCircle, Zap, Crown 
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
import StreakHeatmap from './StreakHeatmap';
import AIInsights from './AIInsights';
import ShareMilestone from './ShareMilestone';

export default function Dashboard() {
  const { getToken, userId, user } = useAuth();
  const [habits, setHabits] = useState([]);
  const [moodLogs, setMoodLogs] = useState([]);  
  const [wellnessScore, setWellnessScore] = useState(0);
  const [loading, setLoading] = useState(true);

  // 🔥 REAL STREAK CALCULATION FROM habit.logs
  const currentStreak = useMemo(() => {
    const allLogs = habits.flatMap(h => h.logs || []);
    const logs = allLogs.map(log => new Date(log.date).toDateString());
    let streak = 0;
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date();
      checkDate.setDate(checkDate.getDate() - i);
      if (logs.includes(checkDate.toDateString())) {
        streak++;
      } else break;
    }
    return streak;
  }, [habits]);

  // 🎯 REAL WELLNESS SCORE FROM today completions
  const calculateWellnessScore = useCallback((habitsData) => {
    if (!Array.isArray(habitsData) || habitsData.length === 0) return 0;
    
    const today = new Date().toDateString();
    const completedToday = habitsData.filter(habit => 
      habit.logs?.some(log => new Date(log.date).toDateString() === today) ||
      habit.loggedToday
    ).length;
    
    return Math.max(0, Math.min(100, Math.round((completedToday / habitsData.length) * 100)));
  }, []);

  // 🚀 LOAD REAL DATA FROM YOUR SUPABASE
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (token) setAuthToken(token);

      const habitsRes = await api.get("/api/habits");
      const habitsData = habitsRes.habits || [];
      
      const moodsRes = await api.get("/api/mood").catch(() => ({}));
      const moodData = Array.isArray(moodsRes.data) ? moodsRes.data : [];
      
      setHabits(habitsData);
      setMoodLogs(moodData);
      const score = calculateWellnessScore(habitsData);
      setWellnessScore(score);
      
    } catch (error) {
      console.error("Dashboard error:", error);
      toast.error("Backend connection issue");
      setHabits([]);
      setMoodLogs([]);
      setWellnessScore(0);
    } finally {
      setLoading(false);
    }
  }, [getToken, calculateWellnessScore]);

  useEffect(() => {
    if (userId) {
      loadDashboardData();
    }
  }, [userId, loadDashboardData]);

  const handleLogHabit = async (habitId, habitTitle) => {
    try {
      const token = await getToken();
      setAuthToken(token);
      await api.post(`/api/habits/${habitId}/log`);
      toast.success(`✅ "${habitTitle}" logged!`);
      loadDashboardData();
    } catch (error) {
      if (error.message.includes('409')) {
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
      <div className="max-w-7xl mx-auto space-y-12 relative">
        {/* ⭐ EMERALD PARTICLES */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-24 left-24 w-2 h-2 bg-emerald-400 rounded-full opacity-40 animate-ping" />
          <div className="absolute top-64 right-32 w-1.5 h-1.5 bg-emerald-300 rounded-full opacity-30 animate-ping" style={{animationDelay: '1.5s'}} />
          <div className="absolute bottom-40 left-1/2 w-3 h-3 bg-emerald-500 rounded-full opacity-50 animate-pulse" style={{animationDelay: '2.5s'}} />
        </div>

        {/* 🖤 HERO HEADER */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="relative backdrop-blur-xl bg-black/60 border border-emerald-500/30 rounded-3xl p-8 lg:p-12 shadow-2xl hover:shadow-emerald-500/20"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent" />
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div className="max-w-lg">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl lg:text-6xl font-black bg-gradient-to-r from-emerald-400 via-emerald-300 to-emerald-500 bg-clip-text text-transparent mb-4 leading-tight drop-shadow-2xl"
              >
                Elite Dashboard
                <span className="block text-5xl mt-2">
                  {user?.firstName || 'Anuja'} 👑
                </span>
              </motion.h1>
              <div className="flex flex-wrap items-center gap-4 text-emerald-300/90 font-mono text-lg">
                <div className="flex items-center gap-2 px-5 py-3 bg-emerald-500/15 backdrop-blur-sm rounded-2xl border border-emerald-400/40 hover:bg-emerald-500/25">
                  <Activity className="w-5 h-5" />
                  <span>{habits.length} active habits</span>
                </div>
                <div className="flex items-center gap-2 px-5 py-3 bg-emerald-500/15 backdrop-blur-sm rounded-2xl border border-emerald-400/40 hover:bg-emerald-500/25">
                  <Flame className="w-5 h-5 text-emerald-400" />
                  <span className="font-bold">{currentStreak}🔥 streak</span>
                </div>
              </div>
            </div>
            
            <motion.div whileHover={{ scale: 1.05 }} className="flex gap-4">
              <Button
                size="lg"
                onClick={() => window.location.href = '/habits'}
                className="h-16 px-10 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 text-slate-900 font-bold shadow-2xl shadow-emerald-500/40 hover:shadow-emerald-400/50 border border-emerald-400/50 font-mono tracking-wide text-lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                New Elite Habit
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => window.location.href = '/analytics'}
                className="h-16 px-10 border-2 border-emerald-400/50 bg-emerald-500/10 backdrop-blur-sm hover:bg-emerald-500/20 font-bold font-mono text-emerald-200"
              >
                📊
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* 📊 BLACK EMERALD BENTO GRID */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-4 gap-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ staggerChildren: 0.1 }}
        >
          
          {/* 🌀 EMERALD RING - REAL DATA */}
          <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="lg:col-span-2 h-96 lg:h-[28rem]">
            <Card className="h-full backdrop-blur-xl bg-slate-900/80 border border-emerald-500/30 hover:border-emerald-400/50 shadow-2xl hover:shadow-emerald-500/25 rounded-3xl overflow-hidden">
              <CardHeader className="pb-8">
                <CardTitle className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-emerald-500/50">
                    <TrendingUp className="w-10 h-10 text-slate-900" />
                  </div>
                  <div>
                    <h3 className="text-4xl font-black bg-gradient-to-r from-emerald-300 via-emerald-200 to-emerald-400 bg-clip-text text-transparent">
                      Wellness Matrix
                    </h3>
                    <p className="text-emerald-300/80 font-mono text-lg mt-1">Live quantum tracking</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="text-center space-y-8">
                  {/* 🔥 REAL DATA EMERALD RING */}
                  <div className="relative mx-auto w-64 h-64 lg:w-80 lg:h-80">
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
                        className="transition-all duration-1500 ease-out origin-center"
                        style={{ filter: 'drop-shadow(0 0 30px rgba(16, 185, 129, 0.6))' }}
                      />
                    </svg>
                    <motion.div
                      key={wellnessScore}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <div className="text-7xl lg:text-8xl font-black bg-gradient-to-r from-emerald-400 to-emerald-200 bg-clip-text text-transparent drop-shadow-2xl">
                        {wellnessScore}%
                      </div>
                    </motion.div>
                  </div>
                  
                  <div className="space-y-4">
                    <Progress 
                      value={wellnessScore} 
                      className="h-5 w-full [&>div]:!bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-lg shadow-emerald-500/30" 
                    />
                    <div className="text-xl font-mono text-emerald-300">
                      {habits.length === 0 
                        ? "Initialize matrix →" 
                        : `${habits.length} nodes • ${wellnessScore}% matrix`
                      }
                    </div>
                    {habits.length > 0 && (
                      <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="px-6 py-3 bg-emerald-500/20 backdrop-blur-sm border border-emerald-400/50 rounded-2xl font-mono text-emerald-200 shadow-xl"
                      >
                        ⚡ Projected: <span className="font-black text-emerald-100">{Math.min(100, wellnessScore + 18)}%</span>
                      </motion.div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 📈 ELITE STATS - REAL DATA */}
          <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="lg:col-span-1 h-80">
            <Card className="h-full backdrop-blur-xl bg-slate-900/70 border border-emerald-500/20 hover:border-emerald-400/40 shadow-2xl hover:shadow-emerald-500/30 rounded-3xl p-8 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent" />
              <div className="relative space-y-8">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-500/40">
                    <Activity className="w-7 h-7 text-slate-900" />
                  </div>
                  <h3 className="text-2xl font-black text-emerald-300">Matrix Stats</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="group p-8 bg-emerald-500/10 backdrop-blur-sm rounded-3xl border border-emerald-400/40 hover:bg-emerald-500/20 shadow-lg hover:shadow-emerald-500/25 transition-all">
                    <div className="text-5xl font-black text-emerald-400 mb-3">{habits.length}</div>
                    <div className="text-sm font-mono text-emerald-300 uppercase tracking-wider">Active Nodes</div>
                  </div>
                  <div className="group p-8 bg-emerald-500/10 backdrop-blur-sm rounded-3xl border border-emerald-400/40 hover:bg-emerald-500/20 shadow-lg hover:shadow-emerald-500/25 transition-all">
                    <div className="text-5xl font-black text-emerald-400 mb-3">{currentStreak}</div>
                    <div className="text-sm font-mono text-emerald-300 uppercase tracking-wider">Streak Chain</div>
                  </div>
                </div>
                
                <div className="p-5 bg-emerald-500/20 backdrop-blur-sm rounded-2xl border border-emerald-400/40 shadow-lg">
                  <div className="flex items-center justify-between text-sm font-mono">
                    <span className="text-emerald-300">⚡ Output Efficiency</span>
                    <span className="font-black text-emerald-200 text-lg">{Math.round(wellnessScore * 0.92)}%</span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* 🎯 PRIORITY MATRIX - REAL HABITS */}
          <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="lg:col-span-1 h-80">
            <Card className="h-full backdrop-blur-xl bg-slate-900/70 border border-emerald-500/20 hover:border-emerald-400/40 shadow-2xl hover:shadow-emerald-500/30 rounded-3xl overflow-hidden">
              <CardHeader className="pb-6 bg-emerald-500/5">
                <CardTitle className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/40">
                    <Target className="w-6 h-6 text-slate-900" />
                  </div>
                  <span className="font-black text-xl text-emerald-300">Priority Matrix</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4 max-h-72 overflow-y-auto">
                {habits.length === 0 ? (
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="h-full flex flex-col items-center justify-center text-center py-12 space-y-6"
                  >
                    <motion.div 
                      animate={{ scale: [1, 1.1, 1], rotate: [0, 3, -3, 0] }}
                      transition={{ repeat: Infinity, duration: 3 }}
                      className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-emerald-500/50 mb-6"
                    >
                      <Plus className="w-12 h-12 text-slate-900" />
                    </motion.div>
                    <h3 className="text-3xl font-black text-emerald-300 mb-4">Initialize System</h3>
                    <p className="text-emerald-400/90 text-lg font-mono mb-8 max-w-sm">
                      Deploy 3 core habits → 35% efficiency gain
                    </p>
                    <Button 
                      size="lg"
                      onClick={() => window.location.href = '/habits'}
                      className="h-14 px-12 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 text-slate-900 shadow-2xl shadow-emerald-500/40 font-bold font-mono tracking-wide text-lg"
                    >
                      DEPLOY CORE
                    </Button>
                  </motion.div>
                ) : (
                  <div className="space-y-3">
                    {habits.slice(0, 5).map((habit, index) => (
                      <motion.div
                        key={habit.id}
                        initial={{ x: -30, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.08 }}
                        whileHover={{ scale: 1.02, y: -3 }}
                        className="group flex items-center p-5 bg-emerald-500/10 backdrop-blur-sm hover:bg-emerald-500/20 border border-emerald-400/40 hover:border-emerald-400/60 rounded-2xl shadow-lg hover:shadow-emerald-500/30 transition-all duration-300"
                      >
                        <div className={`w-4 h-4 rounded-full shadow-lg flex-shrink-0 transition-all ${
                          habit.loggedToday 
                            ? 'bg-emerald-400 shadow-emerald-400/50 scale-110' 
                            : 'bg-gradient-to-r from-orange-400/80 to-red-400/80 shadow-orange-400/30'
                        }`} />
                        <div className="flex-1 min-w-0 ml-4">
                          <h4 className="font-bold text-lg text-emerald-200 truncate group-hover:text-emerald-100 transition-all">
                            {habit.title}
                          </h4>
                          <p className="text-xs font-mono text-emerald-300/80 capitalize">{habit.category}</p>
                        </div>
                        <Button
                          onClick={() => handleLogHabit(habit.id, habit.title)}
                          size="sm"
                          className={`ml-4 h-11 px-6 rounded-xl font-mono font-bold shadow-lg transition-all ${
                            habit.loggedToday
                              ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-900 shadow-emerald-500/40 scale-105'
                              : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 text-slate-900 shadow-emerald-500/40'
                          }`}
                        >
                          {habit.loggedToday ? 'SECURED' : 'EXECUTE'}
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* 🔥 ELITE INSIGHTS - REAL DATA */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-16"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ staggerChildren: 0.15 }}
        >
          <StreakHeatmap habitLogs={habits.flatMap(h => h.logs || [])} />
          <AIInsights habits={habits} moodLogs={moodLogs} />
          {currentStreak > 3 && <ShareMilestone streak={currentStreak} username={user?.firstName || 'Anuja'} />}
        </motion.div>
      </div>
    </div>
  );
}
