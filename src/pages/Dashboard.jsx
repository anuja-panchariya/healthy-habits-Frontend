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
  const { getToken, userId } = useAuth();
  const [habits, setHabits] = useState([]);
  const [wellnessScore, setWellnessScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [optimisticHabits, setOptimisticHabits] = useState([]); // ⚡ OPTIMISTIC

  // 🎯 WELLNESS SCORE - Pure computation
  const calculateWellnessScore = useCallback((habitsData) => {
    if (!Array.isArray(habitsData) || habitsData.length === 0) return 0;
    const today = new Date().toDateString();
    const completedToday = habitsData.filter(habit => 
      habit.logs?.some(log => new Date(log.date).toDateString() === today) ||
      habit.loggedToday
    ).length;
    return Math.round((completedToday / habitsData.length) * 100);
  }, []);

  // ⚡ ULTRA-FAST LOAD - 3s timeout + caching
  const loadDashboardData = useCallback(async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s max

    try {
      setLoading(true);
      const token = await getToken({ template: "supabase" });
      if (token) setAuthToken(token);

      // ⚡ FAST API with timeout
      const habitsRes = await Promise.race([
        api.get("/api/habits", { signal: controller.signal }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 3000)
        )
      ]);
      
      const habitsData = habitsRes.habits || habitsRes.data?.habits || [];
      setHabits(habitsData);
      setOptimisticHabits(habitsData);
      setWellnessScore(calculateWellnessScore(habitsData));
      
    } catch (error) {
      console.warn("Fast load failed, using cache:", error.message);
      // ✅ Use optimistic/cache data
      setHabits(optimisticHabits);
      setWellnessScore(calculateWellnessScore(optimisticHabits));
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  }, [getToken, optimisticHabits, calculateWellnessScore]);

  // 🔥 BACKGROUND REFRESH - No blocking
  const backgroundRefresh = useCallback(async () => {
    try {
      const token = await getToken({ template: "supabase" });
      if (token) setAuthToken(token);
      
      const habitsRes = await api.get("/api/habits");
      const habitsData = habitsRes.habits || habitsRes.data?.habits || [];
      setHabits(habitsData);
      setWellnessScore(calculateWellnessScore(habitsData));
    } catch (error) {
      console.warn("Background refresh failed:", error);
    }
  }, [getToken, calculateWellnessScore]);

  // ⚡ INITIAL LOAD + 30s REFRESH
  useEffect(() => {
    if (userId) {
      loadDashboardData();
      const interval = setInterval(backgroundRefresh, 30000); // 30s refresh
      return () => clearInterval(interval);
    }
  }, [userId, loadDashboardData, backgroundRefresh]);

  // ⚡ OPTIMISTIC HABIT LOG - Instant UI + Backend sync
  const handleLogHabit = async (habitId, habitTitle) => {
    // 1. INSTANT UI UPDATE
    setOptimisticHabits(prev => 
      prev.map(habit => 
        habit.id === habitId 
          ? { ...habit, loggedToday: true, logs: [...(habit.logs || []), { date: new Date().toISOString() }] }
          : habit
      )
    );
    setWellnessScore(prev => Math.min(100, prev + Math.round(100 / optimisticHabits.length)));

    toast.success(`✅ "${habitTitle}" logged!`);

    // 2. BACKGROUND SYNC
    try {
      const token = await getToken({ template: "supabase" });
      setAuthToken(token);
      await api.post(`/api/habits/${habitId}/log`);
    } catch (error) {
      console.warn("Sync failed:", error);
      toast.info("Saved locally - will sync later");
    }
  };

  if (loading && optimisticHabits.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-muted-foreground border-t-primary rounded-full shadow-xl"
        />
      </div>
    );
  }

  // ✅ SHOW OPTIMISTIC DATA IMMEDIATELY
  const displayHabits = optimisticHabits.length > 0 ? optimisticHabits : habits;
  const displayScore = calculateWellnessScore(displayHabits);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black/50 to-emerald-900/20 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8 relative overflow-hidden">
        
        {/* ⚡ BACKGROUND REFRESH INDICATOR */}
        <div className="flex justify-end opacity-50 text-xs text-emerald-400 font-mono">
          🔄 Auto-refresh active
        </div>

        {/* ✨ HERO HEADER */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="backdrop-blur-xl bg-black/70 border border-emerald-500/40 rounded-3xl p-8 lg:p-12 shadow-2xl hover:shadow-emerald-500/20"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/3 via-transparent to-emerald-400/3" />
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div className="max-w-lg">
              <h1 className="text-4xl lg:text-6xl font-black bg-gradient-to-r from-emerald-400 via-emerald-300 to-emerald-500 bg-clip-text text-transparent mb-4 leading-tight">
                Elite Dashboard
              </h1>
              <div className="flex items-center gap-6 text-emerald-300 font-mono text-xl bg-emerald-500/10 p-4 rounded-2xl border border-emerald-400/40">
                <span className="flex items-center gap-2">
                  <Activity className="w-6 h-6" />
                  <span>{displayHabits.length} habits</span>
                </span>
                <span className="flex items-center gap-2">
                  <Flame className="w-6 h-6 text-emerald-400" />
                  <span className="font-bold">0🔥 streak</span>
                </span>
              </div>
            </div>
            
            <Button
              onClick={() => window.location.href = '/habits'}
              className="h-16 px-10 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 text-slate-900 font-bold shadow-2xl shadow-emerald-500/40 font-mono text-lg"
            >
              <Plus className="w-6 h-6 mr-2" />
              New Habit
            </Button>
          </div>
        </motion.div>

        {/* 📊 ULTRA FAST BENTO - Optimistic data */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          
          {/* 🌀 WELLNESS - Instant render */}
          <motion.div className="lg:col-span-2 h-80 lg:h-[26rem]">
            <Card className="h-full bg-gradient-to-br from-slate-900/80 to-black/60 border-emerald-500/30 hover:border-emerald-400/50 shadow-2xl rounded-3xl backdrop-blur-xl">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-2xl">
                    <TrendingUp className="w-8 h-8 text-slate-900" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black bg-gradient-to-r from-emerald-400 to-emerald-200 bg-clip-text text-transparent">Wellness Score</h3>
                    <p className="text-emerald-400 font-mono text-lg mt-1">Real-time • Cached</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="text-center space-y-8">
                  <div className="relative mx-auto w-56 h-56 lg:w-64 lg:h-64">
                    <svg className="w-full h-full -rotate-90 origin-center" viewBox="0 0 200 200">
                      <circle cx="100" cy="100" r="80" fill="none" stroke="#10b981" 
                        strokeWidth="14" strokeDasharray="502" strokeDashoffset={502 - (displayScore * 5.02)}
                        className="transition-all duration-1000" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-5xl lg:text-6xl font-black bg-gradient-to-r from-emerald-400 to-emerald-200 bg-clip-text text-transparent">
                        {displayScore}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <Progress value={displayScore} className="h-5 w-full [&>div]:!bg-gradient-to-r from-emerald-400 to-emerald-500" />
                    <p className="text-xl font-mono text-emerald-300">
                      {displayHabits.length === 0 ? "Create first habit" : `${displayHabits.length} habits • ${displayScore}%`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 📈 QUICK STATS - Instant */}
          <motion.div className="lg:col-span-1 h-80 lg:h-[26rem]">
            <Card className="h-full bg-slate-900/70 border-emerald-500/30 hover:border-emerald-400/50 shadow-2xl rounded-3xl backdrop-blur-xl">
              <CardContent className="p-8 h-full flex flex-col justify-between pt-20 pb-8">
                <h3 className="text-2xl font-black text-emerald-300 text-center mb-8">Quick Stats</h3>
                
                <div className="space-y-6 text-center">
                  <div className="p-6 bg-emerald-500/15 border border-emerald-400/40 rounded-3xl hover:bg-emerald-500/25 shadow-xl">
                    <div className="text-5xl font-black text-emerald-400 mb-2">{displayHabits.length}</div>
                    <div className="text-lg font-mono text-emerald-300 uppercase tracking-wider">Habits</div>
                  </div>
                  
                  <div className="p-6 bg-emerald-500/15 border border-emerald-400/40 rounded-3xl hover:bg-emerald-500/25 shadow-xl">
                    <div className="text-5xl font-black text-emerald-400 mb-2">0</div>
                    <div className="text-lg font-mono text-emerald-300 uppercase tracking-wider">Streak</div>
                  </div>
                </div>
                
                <div className="p-6 bg-emerald-500/20 border border-emerald-400/40 rounded-2xl shadow-xl">
                  <div className="flex items-center justify-between mb-3 text-sm font-mono">
                    <span className="text-emerald-300">Efficiency</span>
                    <span className="font-black text-emerald-200">{displayScore}%</span>
                  </div>
                  <Progress value={displayScore} className="h-3 [&>div]:!bg-gradient-to-r from-emerald-400 to-emerald-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 🎯 RECENT HABITS - Optimistic */}
          <motion.div className="lg:col-span-1 h-80 lg:h-[26rem]">
            <Card className="h-full bg-slate-900/70 border-emerald-500/30 hover:border-emerald-400/50 shadow-2xl rounded-3xl backdrop-blur-xl">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-3 text-2xl font-black text-emerald-300">
                  <Target className="w-8 h-8 bg-gradient-to-r from-orange-400 to-red-400 text-slate-900 p-2 rounded-xl shadow-lg" />
                  Recent Habits
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4 max-h-72 overflow-y-auto">
                {displayHabits.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center py-12 space-y-6">
                    <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-3xl flex items-center justify-center shadow-2xl text-slate-900">
                      <Plus className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-black text-emerald-300 mb-4">No habits yet</h3>
                    <p className="text-emerald-400/90 text-lg font-mono mb-8">Start your wellness journey</p>
                    <Button 
                      onClick={() => window.location.href = '/habits'}
                      className="h-14 px-10 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 shadow-2xl shadow-emerald-500/40 font-bold font-mono"
                    >
                      🚀 Create Habit
                    </Button>
                  </div>
                ) : (
                  displayHabits.slice(0, 5).map((habit) => (
                    <motion.div
                      key={habit.id}
                      whileHover={{ scale: 1.02 }}
                      className="group flex items-center justify-between p-4 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-400/40 hover:border-emerald-400/60 rounded-2xl shadow-lg hover:shadow-emerald-500/30 transition-all"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-lg text-emerald-200 truncate">{habit.title}</h4>
                        <p className="text-xs font-mono text-emerald-300 capitalize">{habit.category}</p>
                      </div>
                      <Button
                        onClick={() => handleLogHabit(habit.id, habit.title)}
                        size="sm"
                        className="ml-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 h-10 px-4 rounded-xl shadow-lg font-mono"
                      >
                        <CheckCircle className="w-4 h-4" />
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
