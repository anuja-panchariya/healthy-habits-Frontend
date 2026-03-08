import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import { 
  TrendingUp, Activity, Target, Flame, Plus, CheckCircle, Zap, User, Award 
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

  // 🔥 CURRENT STREAK CALCULATION
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

  // 🎯 WELLNESS SCORE CALCULATION
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-20 h-20 border-4 border-muted-foreground/50 border-t-primary rounded-full shadow-xl"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-slate-50/50 to-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* ✨ HERO HEADER */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8 lg:p-12 shadow-2xl"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_right,_var(--tw-gradient-stops))] from-white/20 to-transparent backdrop-blur-sm" />
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div className="max-w-lg">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl lg:text-6xl font-black text-white/95 mb-4 leading-tight drop-shadow-2xl"
              >
                Welcome Back
                <span className="block bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 bg-clip-text text-transparent mt-2 text-5xl">
                  {user?.firstName || 'Anuja'} ✨
                </span>
              </motion.h1>
              <div className="flex flex-wrap items-center gap-4 text-white/90 text-sm">
                <div className="flex items-center gap-2 px-4 py-2 bg-white/15 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/25 transition-all">
                  <Activity className="w-4 h-4" />
                  <span className="font-mono">{habits.length} habits</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/15 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/25 transition-all">
                  <Flame className="w-4 h-4" />
                  <span className="font-mono font-bold text-orange-300">{currentStreak}d streak</span>
                </div>
              </div>
            </div>
            
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex gap-3"
            >
              <Button
                size="lg"
                onClick={() => window.location.href = '/habits'}
                className="h-14 px-8 text-lg bg-white/20 backdrop-blur-sm hover:bg-white/30 border-2 border-white/30 shadow-2xl font-bold transition-all"
              >
                <Plus className="w-5 h-5 mr-2" />
                New Habit
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => window.location.href = '/analytics'}
                className="h-14 px-8 text-lg border-2 border-white/40 bg-white/10 backdrop-blur-sm hover:bg-white/20 font-bold"
              >
                📊
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* 📊 MAIN BENTO GRID */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ staggerChildren: 0.1 }}
        >
          
          {/* 🌀 UPGRADED WELLNESS RING */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="lg:col-span-2 h-80 lg:h-96"
          >
            <Card className="h-full border-0 bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/70 backdrop-blur-sm shadow-2xl hover:shadow-3xl transition-all">
              <CardHeader className="pb-8">
                <CardTitle className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-gradient-to-r from-primary to-purple-500 rounded-3xl flex items-center justify-center shadow-2xl">
                    <TrendingUp className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h3 className="text-3xl lg:text-4xl font-black bg-gradient-to-r from-foreground via-primary to-purple-600 bg-clip-text text-transparent">
                      Wellness Score
                    </h3>
                    <p className="text-lg text-muted-foreground font-medium mt-1">Live tracking</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="text-center space-y-6">
                  {/* 🔥 ANIMATED RING */}
                  <div className="relative mx-auto w-52 h-52 lg:w-64 lg:h-64">
                    <svg className="w-full h-full -rotate-90 transform origin-center" viewBox="0 0 160 160">
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        fill="none"
                        stroke="url(#gradient)"
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray="439.6"
                        strokeDashoffset={439.6 - (wellnessScore * 4.396)}
                        className="transition-all duration-1000 ease-out"
                        style={{ filter: 'drop-shadow(0 0 20px rgba(99, 102, 241, 0.5))' }}
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="hsl(var(--primary))" />
                          <stop offset="50%" stopColor="#8b5cf6" />
                          <stop offset="100%" stopColor="#ec4899" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <motion.div
                      key={wellnessScore}
                      initial={{ scale: 0.6, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <div className="text-6xl lg:text-7xl font-black bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow-2xl">
                        {wellnessScore}%
                      </div>
                    </motion.div>
                  </div>
                  
                  {/* 📈 PREDICTION */}
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-2"
                  >
                    <Progress 
                      value={wellnessScore} 
                      className="h-4 w-full [&>div]:!bg-gradient-to-r from-primary via-purple-500 to-pink-500 shadow-lg" 
                    />
                    <p className="text-xl font-bold text-foreground">
                      {habits.length === 0 
                        ? "Create your first habit →" 
                        : `${habits.length} habits • ${wellnessScore}% today`
                      }
                    </p>
                    {habits.length > 0 && (
                      <p className="text-sm bg-emerald-500/10 text-emerald-600 px-4 py-2 rounded-xl font-mono font-bold">
                        🚀 Next week prediction: {Math.min(100, wellnessScore + 12)}%
                      </p>
                    )}
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 📈 SENIOR-LEVEL STATS */}
          <motion.div 
            initial={{ y: 50, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            className="lg:col-span-1 h-80"
          >
            <Card className="h-full shadow-xl hover:shadow-2xl transition-all border-0 overflow-hidden">
              <CardHeader className="pb-6 bg-gradient-to-r from-emerald-500/5 to-blue-500/5">
                <CardTitle className="flex items-center gap-3 text-2xl font-black">
                  <Activity className="w-9 h-9 bg-emerald-500 text-white p-2 rounded-2xl shadow-lg" />
                  <span className="bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                    Live Stats
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="group p-6 bg-gradient-to-br from-emerald-400/10 to-blue-400/10 rounded-3xl border border-emerald-200/30 hover:shadow-xl transition-all cursor-default">
                    <div className="text-3xl lg:text-4xl font-black text-emerald-500 mb-2">{habits.length}</div>
                    <div className="text-sm font-mono text-emerald-600 uppercase tracking-wider">Active Habits</div>
                  </div>
                  <div className="group p-6 bg-gradient-to-br from-orange-400/10 to-red-400/10 rounded-3xl border border-orange-200/30 hover:shadow-xl transition-all cursor-default">
                    <div className="text-3xl lg:text-4xl font-black text-orange-500 mb-2">{currentStreak}</div>
                    <div className="text-sm font-mono text-orange-600 uppercase tracking-wider">Day Streak</div>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-r from-slate-100/50 to-slate-200/50 rounded-2xl border border-slate-200/50 backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-mono text-muted-foreground">⚡ Productivity</span>
                    <span className="font-bold text-lg text-primary font-mono">
                      {Math.round(wellnessScore * 0.9)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 🎯 UPGRADED RECENT HABITS / ONBOARDING */}
          <motion.div 
            initial={{ y: 50, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            className="lg:col-span-1 h-80"
          >
            <Card className="h-full hover:shadow-2xl transition-all">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-3 text-2xl font-bold">
                  <Target className="w-8 h-8 bg-gradient-to-r from-orange-400 to-red-400 text-white p-2 rounded-2xl shadow-md" />
                  <span>Today's Priorities</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {habits.length === 0 ? (
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="h-full flex flex-col items-center justify-center text-center py-12 space-y-6"
                  >
                    <motion.div 
                      animate={{ 
                        scale: [1, 1.1, 1], 
                        rotate: [0, 5, -5, 0] 
                      }}
                      transition={{ 
                        scale: { duration: 2, repeat: Infinity },
                        rotate: { duration: 3, repeat: Infinity }
                      }}
                      className="w-24 h-24 bg-gradient-to-r from-primary to-purple-500 rounded-3xl flex items-center justify-center shadow-2xl mb-6"
                    >
                      <Plus className="w-12 h-12 text-white" />
                    </motion.div>
                    <div>
                      <h3 className="text-3xl font-black bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent mb-4">
                        Launch Your Journey
                      </h3>
                      <p className="text-xl text-muted-foreground mb-8 max-w-sm leading-relaxed">
                        Track hydration, sleep, meditation. 
                        <br />
                        <span className="font-mono text-sm text-emerald-600">3 habits → 30% productivity boost</span>
                      </p>
                    </div>
                    <Button 
                      size="lg"
                      onClick={() => window.location.href = '/habits'}
                      className="h-16 px-12 text-xl bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 shadow-2xl font-bold"
                    >
                      🚀 First Habit
                    </Button>
                  </motion.div>
                ) : (
                  <div className="max-h-72 overflow-y-auto space-y-3">
                    {habits.slice(0, 5).map((habit, index) => (
                      <motion.div
                        key={habit.id}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.02, y: -2 }}
                        className="group flex items-center p-4 rounded-3xl bg-gradient-to-r from-muted/50 to-card hover:from-primary/5 border hover:border-primary/30 transition-all shadow-sm hover:shadow-md"
                      >
                        <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                          habit.loggedToday 
                            ? 'bg-emerald-400 shadow-lg shadow-emerald-400/25' 
                            : 'bg-gradient-to-r from-orange-400 to-red-400 shadow-lg'
                        }`} />
                        <div className="flex-1 min-w-0 ml-3">
                          <h4 className="font-bold text-lg text-foreground truncate group-hover:text-primary transition-colors">
                            {habit.title}
                          </h4>
                          <p className="text-xs font-mono text-muted-foreground capitalize">{habit.category}</p>
                        </div>
                        <Button
                          onClick={() => handleLogHabit(habit.id, habit.title)}
                          size="sm"
                          className={`ml-3 h-10 px-4 rounded-2xl font-mono shadow-lg transition-all ${
                            habit.loggedToday
                              ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/25'
                              : 'bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 shadow-primary/25'
                          }`}
                        >
                          {habit.loggedToday ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            'Log'
                          )}
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* 🔥 SENIOR-LEVEL INSIGHTS SECTION */}
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
