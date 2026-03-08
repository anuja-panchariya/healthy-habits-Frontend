import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "@clerk/clerk-react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  TrendingUp, Activity, Flame, Plus, Crown, CheckCircle, ChevronRight 
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
  const [isDark, setIsDark] = useState(true);
  const [habits, setHabits] = useState([]);
  const [moodLogs, setMoodLogs] = useState([]);
  const [wellnessScore, setWellnessScore] = useState(0);
  const [loading, setLoading] = useState(true);

  // 🎨 PERFECT THEME COLORS
  const theme = {
    dark: {
      bg: "from-slate-900 via-black to-emerald-900/20",
      card: "bg-slate-900/80 border-emerald-500/30 hover:border-emerald-400/50",
      text: "text-emerald-400",
      accent: "from-emerald-500 to-emerald-600",
      glass: "bg-black/60 backdrop-blur-xl",
      glow: "shadow-emerald-500/25"
    },
    light: {
      bg: "from-emerald-50 via-white to-emerald-50/50",
      card: "bg-white/90 border-emerald-300/50 hover:border-emerald-400/60",
      text: "text-emerald-700",
      accent: "from-emerald-500 to-emerald-600",
      glass: "bg-white/80 backdrop-blur-xl",
      glow: "shadow-emerald-300/30"
    }
  };

  const currentTheme = isDark ? theme.dark : theme.light;

  // 🔥 STREAK CALCULATION
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

  // 🚀 LOAD DATA - BULLETPROOF
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (token) setAuthToken(token);

      let habitsData = [];
      try {
        const habitsRes = await api.get("/api/habits");
        habitsData = habitsRes.habits || habitsRes.data?.habits || [];
      } catch (e) {
        console.warn("Habits unavailable:", e);
      }

      let moodData = [];
      try {
        const moodsRes = await api.get("/api/moods");
        moodData = moodsRes.data || moodsRes.moods || [];
      } catch (e) {
        console.warn("Moods unavailable:", e);
      }

      setHabits(habitsData);
      setMoodLogs(moodData);
      setWellnessScore(calculateWellnessScore(habitsData));
    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  }, [getToken, calculateWellnessScore]);

  useEffect(() => {
    loadDashboardData();
  }, [userId, loadDashboardData]);

  // 🔄 REFRESH ON THEME CHANGE
  useEffect(() => {
    loadDashboardData();
  }, [isDark, loadDashboardData]);

  const toggleTheme = () => setIsDark(!isDark);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${currentTheme.bg}`}>
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className={`w-20 h-20 border-4 border-${isDark ? 'emerald-500/30' : 'emerald-400/50'} border-t-${isDark ? 'emerald-400' : 'emerald-500'} rounded-full shadow-2xl`}
        />
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${currentTheme.bg} p-4 sm:p-6 lg:p-8`}>
      <div className="max-w-7xl mx-auto space-y-12 relative">
        
        {/* 🌟 THEME TOGGLE + EMERALD GLOW */}
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex justify-end mb-8"
        >
          <Button
            variant="outline"
            size="sm"
            onClick={toggleTheme}
            className={`border-2 border-${isDark ? 'emerald-400/50' : 'emerald-500/60'} bg-${isDark ? 'emerald-500/10' : 'white/80'} backdrop-blur-sm hover:bg-${isDark ? 'emerald-500/20' : 'emerald-50'} font-mono font-bold`}
          >
            {isDark ? '☀️ Light' : '🌙 Dark'}
          </Button>
        </motion.div>

        {/* 🖤 HERO HEADER - PERFECT ALIGNMENT */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`relative ${currentTheme.glass} border border-${isDark ? 'emerald-500/30' : 'emerald-400/50'} rounded-3xl p-8 lg:p-12 shadow-2xl hover:shadow-[0_0_50px_rgba(16,185,129,0.3)] transition-all`}
        >
          <div className={`absolute inset-0 bg-gradient-to-r from-${isDark ? 'emerald-500/5' : 'emerald-400/10'} to-transparent`} />
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div className="max-w-lg">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`text-4xl lg:text-6xl font-black bg-gradient-to-r from-${isDark ? 'emerald-400 via-emerald-300' : 'emerald-600 via-emerald-500'} to-${isDark ? 'emerald-500' : 'emerald-700'} bg-clip-text text-transparent mb-4 leading-tight drop-shadow-2xl`}
              >
                Elite Dashboard
                <span className="block text-5xl mt-2">{user?.firstName || 'Anuja'} 👑</span>
              </motion.h1>
              <div className="flex flex-wrap items-center gap-4 text-lg">
                <motion.div 
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className={`flex items-center gap-2 px-5 py-3 ${isDark ? 'bg-emerald-500/15 text-emerald-300 border-emerald-400/40 hover:bg-emerald-500/25' : 'bg-emerald-400/10 text-emerald-700 border-emerald-300/50 hover:bg-emerald-400/20'} backdrop-blur-sm rounded-2xl border transition-all`}
                >
                  <Activity className="w-5 h-5" />
                  <span className="font-mono">{habits.length} habits</span>
                </motion.div>
                <motion.div 
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className={`flex items-center gap-2 px-5 py-3 ${isDark ? 'bg-emerald-500/15 text-emerald-300 border-emerald-400/40 hover:bg-emerald-500/25' : 'bg-emerald-400/10 text-emerald-700 border-emerald-300/50 hover:bg-emerald-400/20'} backdrop-blur-sm rounded-2xl border font-bold transition-all`}
                >
                  <Flame className="w-5 h-5" />
                  <span>{currentStreak}🔥 streak</span>
                </motion.div>
              </div>
            </div>
            
            <motion.div whileHover={{ scale: 1.05 }} className="flex gap-4 flex-wrap">
              <Button
                size="lg"
                onClick={() => window.location.href = '/habits'}
                className={`h-16 px-10 bg-gradient-to-r ${currentTheme.accent} hover:from-emerald-400 text-slate-900 font-bold shadow-2xl shadow-emerald-500/40 hover:shadow-emerald-400/50 border border-emerald-400/50 font-mono tracking-wide text-lg`}
              >
                <Plus className="w-5 h-5 mr-2" />
                New Habit
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => window.location.href = '/analytics'}
                className={`h-16 px-10 border-2 border-emerald-400/50 ${isDark ? 'bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/20' : 'bg-white/80 text-emerald-700 hover:bg-emerald-50'} backdrop-blur-sm font-bold font-mono`}
              >
                📊
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* 📊 PERFECTLY ALIGNED BENTO GRID */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ staggerChildren: 0.1 }}
        >
          {/* 🌀 EMERALD RING - FULL WIDTH LEFT */}
          <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="h-96 lg:h-[28rem]">
            <Card className={`h-full ${currentTheme.card} shadow-2xl hover:shadow-[0_0_40px_rgba(16,185,129,0.2)] rounded-3xl overflow-hidden backdrop-blur-xl transition-all`}>
              <CardHeader className="pb-8">
                <CardTitle className="flex items-center gap-4">
                  <div className={`w-20 h-20 bg-gradient-to-br ${currentTheme.accent} rounded-3xl flex items-center justify-center shadow-2xl shadow-emerald-500/50`}>
                    <TrendingUp className={`w-10 h-10 ${isDark ? 'text-slate-900' : 'text-white'}`} />
                  </div>
                  <div>
                    <h3 className={`text-4xl font-black bg-gradient-to-r from-${currentTheme.text} to-emerald-500 bg-clip-text text-transparent`}>
                      Wellness Matrix
                    </h3>
                    <p className={`font-mono text-lg mt-1 ${isDark ? 'text-emerald-300/80' : 'text-emerald-600/80'}`}>Live tracking</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="text-center space-y-8">
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
                      <div className={`text-7xl lg:text-8xl font-black bg-gradient-to-r from-emerald-400 to-emerald-200 bg-clip-text text-transparent drop-shadow-2xl`}>
                        {wellnessScore}%
                      </div>
                    </motion.div>
                  </div>
                  
                  <div className="space-y-4">
                    <Progress 
                      value={wellnessScore} 
                      className="h-5 w-full [&>div]:!bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-lg shadow-emerald-500/30" 
                    />
                    <div className={`text-xl font-mono ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
                      {habits.length === 0 ? "Create first habit →" : `${habits.length} habits • ${wellnessScore}%`}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 📈 STATS + ACTIONS - RIGHT SIDE */}
          <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="space-y-6 lg:space-y-8">
            
            {/* STATS CARD */}
            <Card className={`${currentTheme.card} shadow-2xl rounded-3xl p-8 overflow-hidden h-80 backdrop-blur-xl`}>
              <div className={`absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent`} />
              <div className="relative space-y-8">
                <div className="flex items-center gap-3">
                  <div className={`w-14 h-14 bg-gradient-to-r ${currentTheme.accent} rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-500/40`}>
                    <Activity className={`w-7 h-7 ${isDark ? 'text-slate-900' : 'text-white'}`} />
                  </div>
                  <h3 className={`text-2xl font-black ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>Live Stats</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className={`group p-8 ${isDark ? 'bg-emerald-500/10 border-emerald-400/40 hover:bg-emerald-500/20' : 'bg-emerald-400/10 border-emerald-300/50 hover:bg-emerald-400/20'} backdrop-blur-sm rounded-3xl border hover:shadow-emerald-500/25 shadow-lg transition-all`}>
                    <div className={`text-5xl font-black ${isDark ? 'text-emerald-400' : 'text-emerald-600'} mb-3`}>{habits.length}</div>
                    <div className={`text-sm font-mono uppercase tracking-wider ${isDark ? 'text-emerald-300' : 'text-emerald-600'}`}>Active Habits</div>
                  </div>
                  <div className={`group p-8 ${isDark ? 'bg-emerald-500/10 border-emerald-400/40 hover:bg-emerald-500/20' : 'bg-emerald-400/10 border-emerald-300/50 hover:bg-emerald-400/20'} backdrop-blur-sm rounded-3xl border hover:shadow-emerald-500/25 shadow-lg transition-all`}>
                    <div className={`text-5xl font-black ${isDark ? 'text-emerald-400' : 'text-emerald-600'} mb-3`}>{currentStreak}</div>
                    <div className={`text-sm font-mono uppercase tracking-wider ${isDark ? 'text-emerald-300' : 'text-emerald-600'}`}>Streak Days</div>
                  </div>
                </div>
              </div>
            </Card>

            {/* ✅ WORKING QUICK ACTIONS */}
            <Card className={`${currentTheme.card.replace('hover:border-emerald-400/50', 'hover:border-emerald-400/60')} shadow-xl rounded-2xl p-6 backdrop-blur-xl`}>
              <h4 className={`text-xl font-black mb-6 flex items-center gap-3 ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
                ⚡ Quick Actions
              </h4>
              <div className="space-y-3">
                <Button 
                  size="sm" 
                  className={`w-full h-12 bg-gradient-to-r ${currentTheme.accent} hover:from-emerald-400 text-slate-900 font-bold shadow-lg shadow-emerald-500/30 font-mono ${isDark ? 'hover:shadow-emerald-400/50' : 'hover:shadow-emerald-500/40'}`}
                  onClick={() => {
                    toast.success("Redirecting to habits...");
                    window.location.href = '/habits';
                  }}
                >
                  ➕ Manage Habits <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
                <Button 
                  variant="outline"
                  size="sm" 
                  className={`w-full h-12 border-emerald-400/50 ${isDark ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-200' : 'bg-white/80 hover:bg-emerald-50 text-emerald-700'} font-mono font-bold`}
                  onClick={() => {
                    toast.success("Redirecting to moods...");
                    window.location.href = '/moods';
                  }}
                >
                  😊 Log Mood <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </Card>
          </motion.div>
        </motion.div>

        {/* 🔥 INSIGHTS SECTION */}
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
