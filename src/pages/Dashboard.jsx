import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import { 
  TrendingUp, Activity, Target, Flame, Plus, CheckCircle, Zap, Sun, Moon, Crown 
} from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Switch } from "../components/ui/switch";
import { Progress } from "../components/ui/progress";
import { Badge } from "../components/ui/badge";
import { api, setAuthToken } from "../lib/api";
import { toast } from "sonner";

export default function Dashboard() {
  const { getToken, userId } = useAuth();
  const [isDark, setIsDark] = useState(false);
  const [habits, setHabits] = useState([]);
  const [wellnessScore, setWellnessScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  // 🎯 PROPER DARK MODE - Fixed
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

  // 🎯 REAL CALCULATIONS
  const calculateWellnessScore = useCallback((habitsData) => {
    if (!habitsData?.length) return 0;
    const today = new Date().toDateString();
    const completedToday = habitsData.filter(habit => 
      habit.logs?.some(log => new Date(log.date).toDateString() === today)
    ).length;
    return Math.max(0, Math.min(100, Math.round((completedToday / habitsData.length) * 100)));
  }, []);

  const calculateStreak = useCallback((habitsData) => {
    if (!habitsData?.length) return 0;
    return habitsData.reduce((max, habit) => Math.max(max, habit.streak || 0), 0);
  }, []);

  // 🚀 LOAD DATA - Backend first
  const loadDashboardData = useCallback(async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const token = await getToken();
      if (token) setAuthToken(token);

      const habitsRes = await api.get("/api/habits").catch(() => ({ habits: [] }));
      const habitsData = habitsRes.habits || [];
      
      setHabits(habitsData);
      setWellnessScore(calculateWellnessScore(habitsData));
      setStreak(calculateStreak(habitsData));
      
    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  }, [userId, getToken, calculateWellnessScore, calculateStreak]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // ✅ FIXED HABIT LOG
  const handleLogHabit = async (habitId, habitTitle) => {
    try {
      const token = await getToken();
      setAuthToken(token);
      await api.post(`/api/habits/${habitId}/log`);
      toast.success(`✅ ${habitTitle} logged! +10 pts`);
      loadDashboardData(); // Refresh
    } catch (error) {
      if (error.message.includes('409')) {
        toast.info('Already logged today! ✨');
      } else {
        toast.error('Log failed');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ duration: 1, repeat: Infinity }}
          className="w-20 h-20 border-4 border-muted border-t-primary rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto relative">
        
        {/* 🎯 PREMIUM TOP BAR */}
        <motion.div 
          className="absolute top-8 right-8 z-50 flex items-center gap-3 p-4 rounded-2xl bg-card backdrop-blur-xl shadow-xl border border-border hover:shadow-2xl transition-all"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div className="text-sm font-medium text-muted-foreground">Theme</div>
          <Switch 
            checked={isDark} 
            onCheckedChange={toggleDarkMode}
            className="data-[state=checked]:bg-primary"
          />
        </motion.div>

        {/* 🏆 HEADER - Luxury */}
        <motion.section
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-20 pt-24"
        >
          <motion.div 
            className="inline-flex items-center gap-4 mb-8 p-6 rounded-3xl bg-gradient-to-r from-primary/10 to-secondary/10 backdrop-blur-xl border border-primary/20"
            whileHover={{ scale: 1.02 }}
          >
            <Crown className="w-10 h-10 text-primary" />
            <h1 className="text-5xl lg:text-7xl font-light tracking-tight bg-gradient-to-r from-foreground via-primary to-secondary bg-clip-text text-transparent">
              Wellness Dashboard
            </h1>
          </motion.div>
          
          <motion.div 
            className="max-w-4xl mx-auto p-12 rounded-3xl bg-card/90 backdrop-blur-2xl shadow-2xl border border-border"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
          >
            <div className="text-center">
              <motion.div
                key={wellnessScore}
                initial={{ scale: 0.8, rotateY: -180 }}
                animate={{ scale: 1, rotateY: 0 }}
                className="text-8xl lg:text-9xl font-black bg-gradient-to-r from-primary via-destructive to-primary bg-clip-text text-transparent mb-8 drop-shadow-2xl"
              >
                {wellnessScore}
                <span className="text-5xl">%</span>
              </motion.div>
              
              <div className="flex items-center justify-center gap-8 mb-12">
                <Progress 
                  value={wellnessScore} 
                  className="w-96 h-4 [&>div]:!bg-gradient-to-r [&>div]:!from-primary [&>div]:!to-destructive"
                />
              </div>

              <div className="grid grid-cols-3 gap-8 text-center">
                <div className="space-y-2">
                  <div className="text-3xl font-black text-foreground">{habits.length}</div>
                  <div className="text-sm text-muted-foreground uppercase tracking-wider">Habits</div>
                </div>
                <div className="space-y-2">
                  <Badge variant="secondary" className="text-xl px-6 py-2">
                    🔥 {streak} Day Streak
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-black text-primary">{wellnessScore}%</div>
                  <div className="text-sm text-muted-foreground uppercase tracking-wider">Today</div>
                </div>
              </div>
            </motion.div>
          </motion.section>

        {/* 🚀 PREMIUM BENTO GRID */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          
          {/* 🎯 MAIN ACTIONS - FIXED BUTTON */}
          <motion.div className="lg:col-span-2 h-72 group" 
            whileHover={{ y: -8 }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <Card className="h-full group-hover:shadow-2xl bg-gradient-to-br from-card via-primary/5 to-secondary/5 backdrop-blur-xl border-0 shadow-xl hover:shadow-3xl transition-all duration-500">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <Zap className="w-8 h-8 text-primary" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2 space-y-4">
                <Button 
                  onClick={() => window.location.href = '/habits'}
                  size="lg"
                  className="h-20 w-full text-xl font-bold bg-gradient-to-r from-primary via-destructive to-primary hover:from-primary/90 shadow-2xl hover:shadow-3xl border-0 rounded-2xl group-hover:scale-[1.02] transition-all duration-300"
                >
                  <Plus className="w-8 h-8 mr-4" />
                  Create New Habit
                </Button>
                
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <Button 
                    variant="outline" 
                    className="h-16 rounded-xl hover:bg-primary/5 border-primary/30 hover:border-primary"
                    onClick={loadDashboardData}
                  >
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Refresh
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="h-16 rounded-xl justify-start hover:bg-muted/50"
                  >
                    <Activity className="w-5 h-5 mr-2" />
                    View Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 📊 PREMIUM QUICK STATS - Redesigned */}
          <motion.div className="lg:col-span-1 h-72" 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <Card className="h-full shadow-xl hover:shadow-2xl bg-gradient-to-b from-card to-muted/20 backdrop-blur-xl border-0">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <Flame className="w-6 h-6 text-destructive" />
                  Live Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/10 to-destructive/10 rounded-2xl backdrop-blur-sm border border-primary/20">
                    <div>
                      <div className="text-2xl font-bold text-foreground">Total Habits</div>
                      <div className="text-sm text-muted-foreground">Active trackers</div>
                    </div>
                    <div className="text-4xl font-black text-primary">{habits.length}</div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-destructive/10 to-orange-500/10 rounded-2xl backdrop-blur-sm border border-destructive/20">
                    <div>
                      <div className="text-2xl font-bold text-foreground">Current Streak</div>
                      <div className="text-sm text-muted-foreground">Consecutive days</div>
                    </div>
                    <div className="text-4xl font-black text-destructive">{streak}</div>
                  </div>
                  
                  <div className="w-full bg-muted/50 rounded-full h-2">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-destructive rounded-full shadow-lg"
                      style={{ width: `${wellnessScore}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 🎯 RECENT HABITS - Premium cards */}
          <motion.div className="lg:col-span-2 h-72" 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <Card className="h-full shadow-xl hover:shadow-2xl bg-gradient-to-br from-card/90 backdrop-blur-xl border-0">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <Target className="w-6 h-6 text-primary" />
                  Recent Habits
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 max-h-64 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                {habits.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-12">
                    <motion.div 
                      className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mb-6"
                      whileHover={{ scale: 1.1 }}
                    >
                      <Plus className="w-10 h-10 text-muted-foreground" />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-foreground mb-2">No habits yet</h3>
                    <p className="text-muted-foreground mb-8">Start building your wellness journey</p>
                    <Button 
                      onClick={() => window.location.href = '/habits'}
                      size="lg"
                      className="bg-gradient-to-r from-primary to-destructive hover:from-primary/90 shadow-xl"
                    >
                      Create First Habit
                    </Button>
                  </div>
                ) : (
                  habits.slice(0, 4).map((habit, index) => (
                    <motion.div
                      key={habit.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="group flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-muted/50 hover:from-primary/5 hover:to-secondary/5 border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-lg text-foreground group-hover:text-primary truncate">
                          {habit.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full font-mono">
                            {habit.category}
                          </span>
                          {habit.logs?.length > 0 && (
                            <span className="px-2 py-1 bg-destructive/10 text-destructive text-xs rounded-full font-mono">
                              {habit.logs.length} logs
                            </span>
                          )}
                        </div>
                      </div>
                      <motion.div 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          size="sm"
                          onClick={() => handleLogHabit(habit.id, habit.title)}
                          className="ml-3 h-12 px-6 bg-gradient-to-r from-primary to-destructive hover:from-primary/90 shadow-lg rounded-xl font-semibold border-0"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Log
                        </Button>
                      </motion.div>
                    </motion.div>
                  ))
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* 💎 FOOTER CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mt-20 p-12"
        >
          <Button 
            size="lg"
            onClick={() => window.location.href = '/habits'}
            className="text-xl px-16 h-20 bg-gradient-to-r from-primary via-destructive to-primary hover:from-primary/90 shadow-2xl hover:shadow-3xl rounded-3xl border-0 font-bold tracking-wide"
          >
            <Plus className="w-8 h-8 mr-4" />
            Start Building Habits → 
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
