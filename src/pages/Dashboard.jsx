import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import { 
  TrendingUp, Activity, Target, Flame, Plus, CheckCircle, Sun, Moon 
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
  const [isDark, setIsDark] = useState(true); // 🖤 Dark mode toggle
  const [habits, setHabits] = useState([]);
  const [wellnessScore, setWellnessScore] = useState(0);
  const [loading, setLoading] = useState(true);

  // 🎨 PERFECT THEME - Light White Emerald / Dark Black Emerald
  const theme = isDark ? {
    bg: "from-slate-900 via-black to-emerald-900/20",
    card: "bg-slate-900/80 border-emerald-500/30 hover:border-emerald-400/50",
    text: "text-emerald-400",
    accent: "from-emerald-500 to-emerald-600",
    glass: "bg-black/60 backdrop-blur-xl",
    glow: "shadow-emerald-500/25",
    statsBg: "bg-emerald-500/15",
    statsHover: "hover:bg-emerald-500/25"
  } : {
    bg: "from-emerald-50/50 via-white to-emerald-50/50",
    card: "bg-white/95 border-emerald-300/50 hover:border-emerald-400/60",
    text: "text-emerald-700",
    accent: "from-emerald-500 to-emerald-600",
    glass: "bg-white/90 backdrop-blur-xl",
    glow: "shadow-emerald-300/30",
    statsBg: "bg-emerald-400/10",
    statsHover: "hover:bg-emerald-400/20"
  };

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

  const calculateWellnessScore = useCallback((habitsData) => {
    if (!Array.isArray(habitsData) || habitsData.length === 0) return 0;
    const today = new Date().toDateString();
    const completedToday = habitsData.filter(habit => 
      habit.logs?.some(log => new Date(log.date).toDateString() === today)
    ).length;
    return Math.max(0, Math.min(100, Math.round((completedToday / habitsData.length) * 100)));
  }, []);

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
      toast.info('Already logged today!');
    }
  };

  // ✅ FIRST HABIT BUTTON - WORKING!
  const goToHabits = () => {
    window.location.href = '/habits';
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${theme.bg}`}>
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ duration: 1, repeat: Infinity }}
          className={`w-20 h-20 border-4 ${isDark ? 'border-emerald-500/30 border-t-emerald-400' : 'border-emerald-400/50 border-t-emerald-500'} rounded-full shadow-2xl`}
        />
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.bg} p-4 sm:p-6 lg:p-8`}>
      <div className="max-w-7xl mx-auto space-y-12 relative">
        
        {/* 🌟 THEME TOGGLE */}
        <div className="flex justify-end pt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDark(!isDark)}
            className={`border-2 ${isDark ? 'border-emerald-400/50 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-200' : 'border-emerald-500/60 bg-white/80 hover:bg-emerald-50 text-emerald-700'} font-mono font-bold`}
          >
            {isDark ? '☀️ Light' : '🌙 Dark'}
          </Button>
        </div>

        {/* 🖤 HERO HEADER */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`${theme.glass} border ${isDark ? 'border-emerald-500/30' : 'border-emerald-400/50'} rounded-3xl p-8 lg:p-12 shadow-2xl hover:shadow-emerald-500/20`}
        >
          <div className={`absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent`} />
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div className="max-w-lg">
              <h1 className={`text-4xl lg:text-6xl font-black bg-gradient-to-r from-emerald-400 via-emerald-300 to-emerald-500 bg-clip-text text-transparent mb-4 leading-tight`}>
                Elite Dashboard
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-lg ${isDark ? 'text-emerald-300/90' : 'text-emerald-600/90'} font-mono">
                <div className={`flex items-center gap-2 px-5 py-3 ${theme.statsBg} backdrop-blur-sm rounded-2xl border ${isDark ? 'border-emerald-400/40 hover:bg-emerald-500/25' : 'border-emerald-400/50 hover:bg-emerald-400/20'} transition-all`}>
                  <Activity className="w-5 h-5" />
                  <span>{habits.length} habits</span>
                </div>
                <div className={`flex items-center gap-2 px-5 py-3 ${theme.statsBg} backdrop-blur-sm rounded-2xl border ${isDark ? 'border-emerald-400/40 hover:bg-emerald-500/25' : 'border-emerald-400/50 hover:bg-emerald-400/20'} transition-all`}>
                  <Flame className="w-5 h-5 text-emerald-400" />
                  <span className="font-bold">{currentStreak}🔥 streak</span>
                </div>
              </div>
            </div>
            
            <Button
              size="lg"
              onClick={goToHabits}
              className={`h-16 px-10 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 text-slate-900 font-bold shadow-2xl shadow-emerald-500/40 font-mono tracking-wide text-lg`}
            >
              <Plus className="w-5 h-5 mr-2" />
              New Habit
            </Button>
          </div>
        </motion.div>

        {/* 📊 PERFECT BENTO GRID - FIXED HEIGHTS + NO OVERFLOW */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-4 gap-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          
          {/* 🌀 WELLNESS RING */}
          <motion.div className="lg:col-span-2 h-[28rem]">
            <Card className={`${theme.card} h-full shadow-2xl hover:shadow-emerald-500/25 rounded-3xl overflow-hidden`}>
              <CardHeader className="pb-8">
                <CardTitle className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-emerald-500/50">
                    <TrendingUp className="w-10 h-10 text-slate-900" />
                  </div>
                  <div>
                    <h3 className={`text-3xl lg:text-4xl font-black bg-gradient-to-r from-emerald-300 via-emerald-200 to-emerald-400 bg-clip-text text-transparent leading-tight`}>
                      Wellness Score
                    </h3>
                    <p className={`${isDark ? 'text-emerald-300/80' : 'text-emerald-500/80'} font-mono text-lg mt-1`}>Live tracking</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="text-center space-y-8">
                  <div className="relative mx-auto w-60 h-60 lg:w-72 lg:h-72">
                    <svg className="w-full h-full transform -rotate-90 origin-center" viewBox="0 0 200 200">
                      <circle cx="100" cy="100" r="85" fill="none" stroke="#10b981" strokeWidth="16" 
                        strokeDasharray="534" strokeDashoffset={534 - (wellnessScore * 5.34)}
                        className="transition-all duration-1500" style={{ filter: 'drop-shadow(0 0 30px rgba(16,185,129,0.6))' }} />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-5xl lg:text-6xl font-black bg-gradient-to-r from-emerald-400 to-emerald-200 bg-clip-text text-transparent drop-shadow-2xl">
                        {wellnessScore}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <Progress value={wellnessScore} className="h-5 w-full [&>div]:!bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-lg" />
                    <div className={`text-xl font-mono ${isDark ? 'text-emerald-300' : 'text-emerald-600'} text-center`}>
                      {habits.length === 0 ? "Create first habit →" : `${habits.length} habits • ${wellnessScore}%`}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* ✅ FIXED QUICK STATS - NO OVERFLOW */}
          <motion.div className="lg:col-span-1 h-[28rem]">
            <Card className={`${theme.card} h-full shadow-2xl hover:shadow-emerald-500/25 rounded-3xl overflow-hidden`}>
              <CardContent className="p-8 h-full flex flex-col justify-between pt-20 pb-8 space-y-6 relative">
                <div className={`absolute top-6 left-6 p-3 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl shadow-2xl shadow-emerald-500/50`}>
                  <Activity className="w-8 h-8 text-slate-900" />
                </div>
                <h3 className={`text-2xl font-black ${isDark ? 'text-emerald-300' : 'text-emerald-700'} mb-8 text-center`}>Quick Stats</h3>
                
                <div className="space-y-8">
                  {/* HABITS */}
                  <div className={`p-8 ${theme.statsBg} rounded-3xl border ${isDark ? 'border-emerald-400/40' : 'border-emerald-400/50'} hover:shadow-emerald-500/30 shadow-xl text-center transition-all`}>
                    <div className="text-5xl lg:text-6xl font-black ${isDark ? 'text-emerald-400' : 'text-emerald-600'} mb-3 leading-none">0</div>
                    <div className={`text-lg font-mono uppercase tracking-wider ${isDark ? 'text-emerald-300' : 'text-emerald-600'}`}>Habits</div>
                  </div>
                  
                  {/* STREAK */}
                  <div className={`p-8 ${theme.statsBg} rounded-3xl border ${isDark ? 'border-emerald-400/40' : 'border-emerald-400/50'} hover:shadow-emerald-500/30 shadow-xl text-center transition-all`}>
                    <div className="text-5xl lg:text-6xl font-black ${isDark ? 'text-emerald-400' : 'text-emerald-600'} mb-3 leading-none">0</div>
                    <div className={`text-lg font-mono uppercase tracking-wider ${isDark ? 'text-emerald-300' : 'text-emerald-600'}`}>Streak</div>
                  </div>
                </div>
                
                <div className={`p-6 ${theme.statsBg} rounded-2xl border ${isDark ? 'border-emerald-400/40' : 'border-emerald-400/50'} shadow-xl text-center`}>
                  <div className="flex items-center justify-between mb-3 text-sm">
                    <span className={`font-mono ${isDark ? 'text-emerald-300' : 'text-emerald-600'}`}>Efficiency</span>
                    <span className={`font-black ${isDark ? 'text-emerald-200' : 'text-emerald-700'}`}>0%</span>
                  </div>
                  <Progress value={0} className="h-3 [&>div]:!bg-gradient-to-r from-emerald-400 to-emerald-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* ✅ FIXED TODAY'S HABITS - WORKING BUTTON */}
          <motion.div className="lg:col-span-1 h-[28rem]">
            <Card className={`${theme.card} h-full shadow-2xl hover:shadow-emerald-500/25 rounded-3xl overflow-hidden`}>
              <CardHeader className="pb-6">
                <CardTitle className={`flex items-center gap-3 text-2xl font-black ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
                  <Target className="w-9 h-9 bg-gradient-to-r from-orange-400 to-red-400 text-slate-900 p-2 rounded-2xl shadow-lg" />
                  Today's Habits
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {habits.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-6">
                    <motion.div 
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-3xl flex items-center justify-center shadow-2xl mb-6"
                    >
                      <Plus className="w-10 h-10 text-slate-900" />
                    </motion.div>
                    <div className="space-y-3">
                      <h3 className={`text-2xl lg:text-3xl font-black ${isDark ? 'text-emerald-300' : 'text-emerald-700'} mb-4 leading-tight`}>Launch Journey</h3>
                      <p className={`text-lg ${isDark ? 'text-emerald-400/90' : 'text-emerald-600/90'} font-mono max-w-[12rem] mx-auto leading-relaxed`}>
                        Track hydration, sleep, meditation
                      </p>
                    </div>
                    {/* ✅ WORKING FIRST HABIT BUTTON */}
                    <Button 
                      size="lg"
                      onClick={goToHabits}
                      className={`h-14 px-8 w-full lg:w-auto bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 text-slate-900 shadow-2xl shadow-emerald-500/40 font-bold font-mono tracking-wide text-lg`}
                    >
                      🚀 First Habit
                    </Button>
                  </div>
                ) : (
                  habits.slice(0, 4).map((habit, index) => (
                    <motion.div
                      key={habit.id}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      className={`flex items-center p-4 ${theme.statsBg} hover:${theme.statsHover} border ${isDark ? 'border-emerald-400/40 hover:border-emerald-400/60' : 'border-emerald-400/50 hover:border-emerald-500/60'} rounded-2xl shadow-lg hover:shadow-emerald-500/30 transition-all`}
                    >
                      <div className={`w-4 h-4 rounded-full shadow-lg ${habit.loggedToday ? 'bg-emerald-400 shadow-emerald-400/50' : 'bg-gradient-to-r from-orange-400 to-red-400 shadow-orange-400/30'}`} />
                      <div className="flex-1 min-w-0 ml-4">
                        <h4 className={`font-bold text-base lg:text-lg ${isDark ? 'text-emerald-200' : 'text-emerald-800'} truncate`}>{habit.title}</h4>
                        <p className={`text-xs font-mono ${isDark ? 'text-emerald-300/80' : 'text-emerald-600/80'} capitalize truncate`}>{habit.category}</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleLogHabit(habit.id, habit.title)}
                        className={`ml-3 h-10 px-4 rounded-xl font-mono font-bold shadow-lg ${habit.loggedToday ? 'bg-emerald-500 hover:bg-emerald-400' : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400'}`}
                      >
                        {habit.loggedToday ? '✅' : 'Log'}
                      </Button>
                    </motion.div>
                  ))
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
