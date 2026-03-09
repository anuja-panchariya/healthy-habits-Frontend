import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import { api, setAuthToken } from "../lib/api";
import { toast } from "sonner";
import { TrendingUp, Activity, Target, Flame, Plus, Sun, Moon } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Progress } from "../components/ui/progress";

export default function Dashboard() {
  const { getToken, userId } = useAuth();
  const [isDark, setIsDark] = useState(true);
  const [habits, setHabits] = useState([]);
  const [optimisticHabits, setOptimisticHabits] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🎨 PERFECT BLACK EMERALD / WHITE EMERALD THEME
  const theme = isDark ? {
    bg: "from-slate-900 via-black to-emerald-900/20",
    card: "bg-slate-900/80 border-emerald-500/30 hover:border-emerald-400/50 bg-gradient-to-br from-slate-900/90 backdrop-blur-xl",
    text: "text-emerald-400",
    title: "from-emerald-400 via-emerald-300 to-emerald-500",
    accent: "from-emerald-500 to-emerald-600",
    glow: "shadow-emerald-500/25",
    stats: "bg-emerald-500/15 border-emerald-400/40 hover:bg-emerald-500/25",
    progress: "from-emerald-400 to-emerald-500",
    lightText: "text-emerald-300",
    darkText: "text-emerald-200"
  } : {
    bg: "from-emerald-50/80 via-white/90 to-emerald-50/80",
    card: "bg-white/95 border-emerald-300/50 hover:border-emerald-400/60 bg-gradient-to-br from-white/95 backdrop-blur-xl",
    text: "text-emerald-700",
    title: "from-emerald-500 via-emerald-600 to-emerald-700",
    accent: "from-emerald-500 to-emerald-600",
    glow: "shadow-emerald-300/30",
    stats: "bg-emerald-400/10 border-emerald-400/50 hover:bg-emerald-400/20",
    progress: "from-emerald-500 to-emerald-600",
    lightText: "text-emerald-600",
    darkText: "text-emerald-800"
  };

  // ⚡ DEMO DATA - Instant load
  const demoHabits = [
    { id: '1', title: 'Morning Meditation', category: 'Health', loggedToday: false, logs: [] },
    { id: '2', title: '10K Steps', category: 'Fitness', loggedToday: true, logs: [] },
    { id: '3', title: 'Read 30min', category: 'Productivity', loggedToday: false, logs: [] },
    { id: '4', title: 'Water Intake', category: 'Health', loggedToday: true, logs: [] }
  ];

  const displayHabits = optimisticHabits.length > 0 ? optimisticHabits : demoHabits;
  const currentStreak = displayHabits.filter(h => h.loggedToday).length;
  const displayScore = Math.min(100, Math.round((currentStreak / Math.max(1, displayHabits.length)) * 100));

  // ⚡ FAST LOAD - Background only
  useEffect(() => {
    const loadData = async () => {
      try {
        const token = await getToken();
        if (token) setAuthToken(token);
        const habitsRes = await api.get("/api/habits").catch(() => ({}));
        const habitsData = habitsRes.habits || habitsRes.data?.habits || [];
        setHabits(habitsData);
        setOptimisticHabits(habitsData);
      } catch (error) {
        console.warn("Using demo data:", error);
      }
    };
    loadData();
  }, [getToken]);

  const handleLogHabit = (habitId, habitTitle) => {
    setOptimisticHabits(prev => 
      prev.map(habit => 
        habit.id === habitId 
          ? { ...habit, loggedToday: true, logs: [...(habit.logs || []), { date: new Date().toISOString() }] }
          : habit
      )
    );
    toast.success(`✅ "${habitTitle}" logged!`);
  };

  const goToHabits = () => {
    window.location.href = '/habits';
  };

  return (
    <div className={`min-h-screen ${theme.bg} p-4 sm:p-6 lg:p-8`}>
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* ☀️🌙 THEME TOGGLE */}
        <div className="flex justify-end pt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDark(prev => !prev)}
            className={`border-2 font-mono font-bold shadow-lg ${
              isDark 
                ? 'border-emerald-400/50 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-200 shadow-emerald-500/30' 
                : 'border-emerald-500/60 bg-white/80 hover:bg-emerald-50 text-emerald-700 shadow-emerald-300/30'
            }`}
          >
            {isDark ? '☀️ Light' : '🌙 Dark'}
          </Button>
        </div>

        {/* 🖤 HERO HEADER */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`${theme.card} border shadow-2xl hover:shadow-emerald-500/20 rounded-3xl p-8 lg:p-12 relative overflow-hidden`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent rounded-3xl" />
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div className="max-w-lg">
              <h1 className={`text-4xl lg:text-6xl font-black bg-gradient-to-r ${theme.title} bg-clip-text text-transparent mb-4 leading-tight`}>
                Elite Dashboard
              </h1>
              <div className="flex flex-wrap items-center gap-4 font-mono text-lg">
                <div className={`flex items-center gap-2 px-5 py-3 ${theme.stats} rounded-2xl border shadow-lg transition-all ${theme.lightText}`}>
                  <Activity className="w-5 h-5" />
                  <span>{displayHabits.length} habits</span>
                </div>
                <div className={`flex items-center gap-2 px-5 py-3 ${theme.stats} rounded-2xl border shadow-lg transition-all ${theme.lightText}`}>
                  <Flame className="w-5 h-5 text-emerald-400" />
                  <span className="font-bold">{currentStreak}🔥 streak</span>
                </div>
              </div>
            </div>
            
            <Button
              size="lg"
              onClick={goToHabits}
              className={`h-16 px-10 ${theme.accent} hover:from-emerald-400 text-slate-900 font-bold shadow-2xl ${theme.glow} font-mono tracking-wide text-lg`}
            >
              <Plus className="w-5 h-5 mr-2" />
              New Habit
            </Button>
          </div>
        </motion.div>

        {/* 📊 BENTO GRID */}
        <motion.div className="grid grid-cols-1 lg:grid-cols-4 gap-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          
          {/* 🌀 WELLNESS SCORE */}
          <motion.div className="lg:col-span-2 h-[28rem]">
            <Card className={`${theme.card} h-full shadow-2xl hover:shadow-emerald-500/25 rounded-3xl border overflow-hidden`}>
              <CardHeader className="pb-8">
                <CardTitle className="flex items-center gap-4">
                  <div className={`w-20 h-20 ${theme.accent} rounded-3xl flex items-center justify-center shadow-2xl ${theme.glow}`}>
                    <TrendingUp className="w-10 h-10 text-slate-900" />
                  </div>
                  <div>
                    <h3 className={`text-3xl lg:text-4xl font-black bg-gradient-to-r ${theme.title} bg-clip-text text-transparent leading-tight`}>
                      Wellness Score
                    </h3>
                    <p className={`${theme.lightText} font-mono text-lg mt-1`}>Live tracking</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="text-center space-y-8">
                  <div className="relative mx-auto w-60 h-60 lg:w-72 lg:h-72">
                    <svg className="w-full h-full transform -rotate-90 origin-center" viewBox="0 0 200 200">
                      <circle 
                        cx="100" 
                        cy="100" 
                        r="85" 
                        fill="none" 
                        stroke="#10b981" 
                        strokeWidth="16" 
                        strokeDasharray="534" 
                        strokeDashoffset={534 - (displayScore * 5.34)}
                        className="transition-all duration-1000 ease-out"
                        style={{ filter: `drop-shadow(0 0 30px ${isDark ? 'rgba(16,185,129,0.6)' : 'rgba(16,185,129,0.4)'})` }}
                      />
                      <circle 
                        cx="100" 
                        cy="100" 
                        r="85" 
                        fill="none" 
                        stroke="rgba(15,23,42,0.3)" 
                        strokeWidth="16"
                        className="opacity-50"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className={`text-5xl lg:text-6xl font-black bg-gradient-to-r ${theme.title} bg-clip-text text-transparent drop-shadow-2xl`}>
                        {displayScore}%
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <Progress value={displayScore} className={`h-5 [&>div]:!bg-gradient-to-r ${theme.progress} shadow-lg`} />
                    <div className={`${theme.lightText} text-xl font-mono text-center`}>
                      {displayHabits.length === 0 ? "Create first habit →" : `${displayHabits.length} habits • ${displayScore}%`}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 📈 QUICK STATS */}
          <motion.div className="lg:col-span-1 h-[28rem]">
            <Card className={`${theme.card} h-full shadow-2xl hover:shadow-emerald-500/25 rounded-3xl border overflow-hidden`}>
              <CardHeader className="pb-6">
                <CardTitle className={`flex items-center gap-3 text-2xl font-black ${theme.lightText}`}>
                  <Activity className="w-8 h-8" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-6">
                  <div className={`${theme.stats} p-8 rounded-3xl border shadow-xl text-center transition-all`}>
                    <div className={`text-5xl lg:text-6xl font-black ${isDark ? 'text-emerald-400' : 'text-emerald-600'} mb-3 leading-none`}>
                      {displayHabits.length}
                    </div>
                    <div className={`${theme.lightText} text-lg font-mono uppercase tracking-wider`}>Habits</div>
                  </div>
                  
                  <div className={`${theme.stats} p-8 rounded-3xl border shadow-xl text-center transition-all`}>
                    <div className={`text-5xl lg:text-6xl font-black ${isDark ? 'text-emerald-400' : 'text-emerald-600'} mb-3 leading-none`}>
                      {currentStreak}
                    </div>
                    <div className={`${theme.lightText} text-lg font-mono uppercase tracking-wider`}>Streak</div>
                  </div>
                </div>
                
                <div className={`${theme.stats} p-6 rounded-2xl border shadow-xl text-center`}>
                  <div className="flex items-center justify-between mb-3 text-sm font-mono">
                    <span className={theme.lightText}>Efficiency</span>
                    <span className={theme.darkText} font-bold>{displayScore}%</span>
                  </div>
                  <Progress value={displayScore} className={`h-3 [&>div]:!bg-gradient-to-r ${theme.progress}`} />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* ✅ RECENT HABITS */}
          <motion.div className="lg:col-span-1 h-[28rem]">
            <Card className={`${theme.card} h-full shadow-2xl hover:shadow-emerald-500/25 rounded-3xl border overflow-hidden`}>
              <CardHeader className="pb-6">
                <CardTitle className={`flex items-center gap-3 text-2xl font-black ${theme.lightText}`}>
                  <Target className="w-8 h-8" />
                  Recent Habits
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4 max-h-[22rem] overflow-y-auto">
                {displayHabits.slice(0, 4).map((habit, index) => (
                  <motion.div
                    key={habit.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`${theme.stats} p-6 rounded-2xl border shadow-lg hover:shadow-emerald-500/30 transition-all group cursor-pointer`}
                    onClick={() => handleLogHabit(habit.id, habit.title)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className={`font-bold text-lg truncate ${theme.darkText}`}>
                        {habit.title}
                      </h4>
                      <div className={`w-3 h-3 rounded-full shadow-lg transition-all ${
                        habit.loggedToday 
                          ? 'bg-emerald-400 shadow-emerald-400/50 scale-110' 
                          : `${isDark ? 'bg-slate-600/50' : 'bg-slate-200/50'} shadow-slate-500/30`
                      }`} />
                    </div>
                    <p className={`text-xs font-mono capitalize mb-4 truncate ${theme.lightText}`}>
                      {habit.category}
                    </p>
                    <Button
                      size="sm"
                      className={`flex-1 h-10 rounded-xl font-mono font-bold shadow-lg w-full transition-all ${
                        habit.loggedToday 
                          ? `${isDark ? 'bg-emerald-500/70 hover:bg-emerald-400/70 text-slate-900' : 'bg-emerald-500/60 hover:bg-emerald-400/60 text-slate-900'}` 
                          : `${theme.accent} hover:from-emerald-400 text-slate-900`
                      }`}
                    >
                      {habit.loggedToday ? '✅ Logged' : 'Log Today'}
                    </Button>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
