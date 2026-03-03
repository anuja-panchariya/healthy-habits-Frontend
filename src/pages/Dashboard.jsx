import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@clerk/clerk-react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  TrendingUp, Activity, Target, Flame, Plus, Bell, Clock, CheckCircle, Zap, AlertTriangle 
} from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { Loader2 } from "lucide-react";
import { api, setAuthToken } from "../lib/api";
import { toast } from "sonner";

export default function Dashboard() {
  const { getToken, userId } = useAuth();
  const [habits, setHabits] = useState([]);
  const [wellnessScore, setWellnessScore] = useState(0);
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [loadingReminder, setLoadingReminder] = useState(false);
  const [showLowScoreAlert, setShowLowScoreAlert] = useState(false);
  const [categoryStats, setCategoryStats] = useState({});

  //  TRUE WELLNESS FORMULA - Category Weighted (0% if no habits!)
  const calculateRealWellnessScore = useCallback((habitsData, analyticsData) => {
    console.log('🔢 Calculating wellness with:', habitsData.length, 'habits');
    
    //  NO HABITS = 0% (NOT 50%)
    if (!habitsData?.length) {
      console.log('❌ No habits = 0% wellness');
      return 0;
    }

    // CATEGORY WEIGHTS [web:204]
    const categoryWeights = {
      fitness: 0.35,      // 35% - Exercise
      sleep: 0.25,        // 25% - Sleep  
      hydration: 0.20,    // 20% - Water
      mindfulness: 0.15,  // 15% - Meditation
      nutrition: 0.05     // 5% - Food
    };

    const categoryStats = {};
    let totalCompleted = 0;
    let totalHabits = 0;

    // Group by category + check completion
    habitsData.forEach(habit => {
      const cat = (habit.category || 'general').toLowerCase();
      categoryStats[cat] = categoryStats[cat] || { total: 0, completed: 0, weight: categoryWeights[cat] || 0.05 };
      categoryStats[cat].total += 1;
      totalHabits += 1;

      // Check if completed TODAY (multiple sources)
      const isCompletedToday = 
        analyticsData.todayLogs?.includes(habit.id) ||
        habit.loggedToday === true ||
        habit.status === 'completed' ||
        analyticsData[`habit_${habit.id}`] === 'completed' ||
        new Date(habit.lastLogged).toDateString() === new Date().toDateString();

      if (isCompletedToday) {
        categoryStats[cat].completed += 1;
        totalCompleted += 1;
      }
    });

    // Calculate weighted score per category
    let weightedScore = 0;
    let totalWeight = 0;

    Object.values(categoryStats).forEach(cat => {
      if (cat.total > 0) {
        const categoryCompletion = (cat.completed / cat.total) * 100;
        weightedScore += (categoryCompletion * cat.weight);
        totalWeight += cat.weight;
      }
    });

    const finalScore = totalWeight > 0 ? Math.round(weightedScore) : 0;
    
    console.log('📊 WELLNESS BREAKDOWN:', {
      totalHabits,
      totalCompleted,
      categoryStats,
      finalScore: `${finalScore}%`
    });

    //  LOW SCORE ALERT TRIGGER
    if (finalScore < 50 && !showLowScoreAlert) {
      setShowLowScoreAlert(true);
      setTimeout(() => setShowLowScoreAlert(false), 10000);
    }

    setCategoryStats(categoryStats);
    return Math.max(0, Math.min(100, finalScore));
  }, [showLowScoreAlert]);

  // 🚀 LOAD REAL DATA + CALCULATE
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getToken();
      setAuthToken(token);

      //  PRIORITY 1: Backend wellness API
      const [habitsRes, analyticsRes, wellnessRes] = await Promise.allSettled([
        api.get("/api/habits"),
        api.get("/api/analytics"),
        api.get("/api/habits/wellness-score") // Backend calculation
      ]);

      const habitsData = habitsRes.status === "fulfilled" 
        ? (habitsRes.value.habits || habitsRes.value.data || []) 
        : [];
      
      const analyticsData = analyticsRes.status === "fulfilled" ? analyticsRes.value : {};
      const backendWellness = wellnessRes.status === "fulfilled" ? wellnessRes.value : {};

      setHabits(habitsData);
      setAnalytics(analyticsData);

      // 🎯 WELLNESS PRIORITY:
      let wellness = 0;
      
      // 1️⃣ Backend API (highest priority)
      if (backendWellness?.score !== undefined && !isNaN(backendWellness.score)) {
        wellness = parseFloat(backendWellness.score);
        console.log('✅ Backend wellness:', wellness);
      }
      // 2️⃣ Frontend weighted calculation
      else {
        wellness = calculateRealWellnessScore(habitsData, analyticsData);
      }

      setWellnessScore(wellness);
      
    } catch (error) {
      console.error("Dashboard load error:", error);
      setWellnessScore(0);
    } finally {
      setLoading(false);
    }
  }, [getToken, calculateRealWellnessScore]);

  useEffect(() => {
    if (userId) {
      loadDashboardData();
      // Refresh every 30s for real-time updates
      const interval = setInterval(loadDashboardData, 30000);
      return () => clearInterval(interval);
    }
  }, [userId, loadDashboardData]);

  // ✅ LOG HABIT → RECALCULATE INSTANTLY
  const handleLogHabit = async (habitId, habitTitle) => {
    try {
      const token = await getToken();
      setAuthToken(token);
      await api.post(`/api/habits/${habitId}/log`);
      toast.success(`✅ ${habitTitle} logged! Wellness updated!`);
      loadDashboardData(); // ✅ Recalculates instantly
    } catch (error) {
      if (error.response?.status === 409) {
        toast.info("Already logged today! ✨");
      } else {
        toast.error("Failed to log habit");
      }
    }
  };

  // ✅ SMART REMINDERS - Low score detection
  const sendSmartReminder = async () => {
    if (habits.length === 0) {
      toast.info("Create habits first! 🎯");
      return;
    }

    setLoadingReminder(true);
    try {
      const token = await getToken();
      setAuthToken(token);
      
      const message = wellnessScore < 50 
        ? `🚨 Wellness Alert: ${wellnessScore}% - Log your habits to boost your score!`
        : `💪 Daily reminder: Keep your ${habits.length} habits on track!`;
      
      await api.post('/api/reminders/send', {
        habits: habits.slice(0, 3).map(h => ({ title: h.title, category: h.category })),
        wellness_score: wellnessScore,
        message
      });
      
      toast.success(`📧 ${wellnessScore < 50 ? '🚨 Low score boost' : 'Daily'} reminder sent!`);
    } catch (error) {
      toast.error("Reminder failed - check console");
    } finally {
      setLoadingReminder(false);
    }
  };

  if (loading) {
    return (
      <motion.div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/30">
        <div className="flex flex-col items-center space-y-4">
          <motion.div 
            animate={{ rotate: 360 }} 
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full" 
          />
          <p className="text-muted-foreground">Calculating wellness score...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="min-h-screen bg-gradient-to-br from-background via-background/80 to-muted/20 p-6"
      data-testid="dashboard"
    >
      {/* 🚨 LOW SCORE ALERT */}
      <AnimatePresence>
        {showLowScoreAlert && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-4 right-4 z-50 max-w-sm"
          >
            <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-2xl border-0 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 mt-0.5 flex-shrink-0 animate-pulse" />
                  <div>
                    <h4 className="font-bold text-lg mb-1">⚠️ Wellness Dropping!</h4>
                    <p className="text-sm opacity-90">
                      Your score is <span className="font-black">{wellnessScore}%</span>. 
                      Log habits to boost it back up!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* ✨ HEADER */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6"
        >
          <div>
            <motion.h1 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="font-serif font-light text-5xl lg:text-6xl tracking-tight mb-2 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent"
            >
              Wellness Dashboard
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-muted-foreground"
            >
              Your Score: 
              <span className={`font-black text-3xl ml-2 ${
                wellnessScore >= 80 ? 'text-emerald-500' : 
                wellnessScore >= 60 ? 'text-green-500' : 
                wellnessScore >= 40 ? 'text-yellow-500' : 
                'text-orange-500'
              }`}>
                {wellnessScore}%
              </span>
              {habits.length === 0 && (
                <span className="text-sm font-normal ml-2 text-orange-500">(No habits = 0%)</span>
              )}
            </motion.p>
          </div>
          
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="flex gap-3 flex-wrap"
          >
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="h-14 px-8 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 shadow-xl"
            >
              <Plus className="w-5 h-5 mr-2" />
              New Habit
            </Button>
            
            <Button
              onClick={sendSmartReminder}
              disabled={loadingReminder || habits.length === 0}
              className="h-14 px-8 rounded-2xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 shadow-xl"
            >
              <motion.div 
                animate={loadingReminder ? { rotate: 360 } : {}}
                className="flex items-center gap-2"
              >
                {loadingReminder ? (
                  <Loader2 className="w-5 h-5" />
                ) : (
                  <Bell className="w-5 h-5" />
                )}
                {wellnessScore < 50 ? 'Boost Score!' : 'Smart Reminder'}
              </motion.div>
            </Button>
          </motion.div>
        </motion.div>

        {/* 📊 BENTO GRID */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
        >
          {/* 🌀 MAIN WELLNESS CARD */}
          <motion.div
            initial={{ y: 50, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            whileHover={{ y: -8 }}
            className="lg:col-span-2 xl:col-span-2 h-72"
          >
            <Card className="h-full bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur-sm border-0 shadow-2xl overflow-hidden group">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 20, repeat: Infinity }}
                    className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-2xl"
                  >
                    <TrendingUp className="w-7 h-7 text-background" />
                  </motion.div>
                  <div>
                    <h3 className="text-2xl font-bold text-foreground">Wellness Score</h3>
                    <p className="text-muted-foreground text-sm">Real-time calculation</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center"
                >
                  <motion.div
                    key={wellnessScore}
                    initial={{ scale: 0.7 }}
                    animate={{ scale: 1 }}
                    className="text-6xl font-black bg-gradient-to-r from-emerald-500 via-green-500 to-primary bg-clip-text text-transparent mb-6"
                  >
                    {wellnessScore}
                    <span className="text-3xl">%</span>
                  </motion.div>
                  
                  <div className="w-full bg-muted/50 rounded-full h-4 mb-6 overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-green-600 rounded-full shadow-lg"
                      initial={{ width: 0 }}
                      animate={{ width: `${wellnessScore}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                  </div>

                  <motion.p 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xl font-semibold text-foreground/80"
                  >
                    {habits.length === 0 
                      ? "🚫 No habits tracked" 
                      : wellnessScore >= 80 ? "🏆 Peak Performance" : 
                        wellnessScore >= 60 ? "👍 Excellent" : 
                        wellnessScore >= 40 ? "⚡ Good Progress" :
                        wellnessScore >= 20 ? "💪 Keep Going" : "🚀 Start Strong"
                    }
                  </motion.p>
                  
                  {/* ✅ CATEGORY BREAKDOWN */}
                  {Object.keys(categoryStats).length > 0 && (
                    <div className="mt-6 grid grid-cols-3 gap-2 text-xs">
                      {Object.entries(categoryStats).slice(0, 3).map(([cat, stats]) => (
                        <div key={cat} className="text-center p-2 bg-muted/30 rounded-lg">
                          <div className="font-bold text-primary capitalize">{cat}</div>
                          <div className="text-2xs text-muted-foreground">
                            {stats.total > 0 ? Math.round((stats.completed/stats.total)*100) : 0}%
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Today's Habits - SHORTENED */}
          <motion.div initial={{ y: 50 }} animate={{ y: 0 }} className="col-span-full h-80">
            <Card className="h-full shadow-2xl border-0 overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Target className="w-6 h-6 text-primary" />
                  Today's Habits ({habits.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 max-h-64 overflow-y-auto space-y-3">
                {habits.slice(0, 5).map((habit, idx) => (
                  <motion.div
                    key={habit.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-muted/50 to-muted hover:from-primary/10 border hover:border-primary/30"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-lg truncate">{habit.title}</h4>
                      <p className="text-sm text-muted-foreground capitalize">{habit.category}</p>
                    </div>
                    <Button
                      onClick={() => handleLogHabit(habit.id, habit.title)}
                      size="sm"
                      className="ml-4 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600"
                    >
                      Log Today
                    </Button>
                  </motion.div>
                ))}
                {habits.length === 0 && (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} 
                    className="h-64 flex flex-col items-center justify-center text-center text-muted-foreground">
                    <div className="text-6xl mb-6 opacity-40">🎯</div>
                    <h3 className="text-2xl font-bold mb-2">No habits yet</h3>
                    <Button className="rounded-2xl">Create First Habit</Button>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
