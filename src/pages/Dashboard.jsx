import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import { 
  TrendingUp, Activity, Target, Flame, Plus, CheckCircle, Zap 
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

  // 🎯 REAL WELLNESS SCORE - Backend data
  const calculateWellnessScore = useCallback((habitsData) => {
    if (!Array.isArray(habitsData) || habitsData.length === 0) return 0;
    
    const today = new Date().toDateString();
    const completedToday = habitsData.filter(habit => 
      habit.logs?.some(log => new Date(log.date).toDateString() === today) ||
      habit.loggedToday
    ).length;
    
    return Math.max(0, Math.min(100, Math.round((completedToday / habitsData.length) * 100)));
  }, []);

  // 🚀 LOAD REAL DATA - Backend first
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (token) setAuthToken(token);

      const habitsRes = await api.get("/api/habits");
      const habitsData = habitsRes.habits || [];
      
      setHabits(habitsData);
      const score = calculateWellnessScore(habitsData);
      setWellnessScore(score);
      
    } catch (error) {
      console.error("Dashboard error:", error);
      toast.error("Backend error - Check connection");
      setHabits([]);
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

  // ✅ REAL HABIT LOG - Backend sync
  const handleLogHabit = async (habitId, habitTitle) => {
    try {
      const token = await getToken();
      setAuthToken(token);
      await api.post(`/api/habits/${habitId}/log`);
      toast.success(`✅ "${habitTitle}" logged today!`);
      loadDashboardData();
    } catch (error) {
      if (error.message.includes('409')) {
        toast.info('Already logged today!');
      } else {
        toast.error('Log failed - Backend issue');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ duration: 1, repeat: Infinity }}
          className="w-16 h-16 border-4 border-muted-foreground border-t-primary rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* ✨ HEADER */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="pt-16 pb-8"
        >
          <h1 className="font-serif font-light text-4xl sm:text-5xl lg:text-6xl tracking-tight text-foreground mb-4 leading-tight">
            Wellness Dashboard
          </h1>
          <p className="text-xl sm:text-2xl text-muted-foreground font-semibold">
            Your Score: 
            <span className={`font-black text-2xl sm:text-3xl lg:text-4xl ml-3 px-2 py-1 rounded-lg bg-muted/80 ${wellnessScore >= 80 ? 'text-green-500' : wellnessScore >= 60 ? 'text-primary' : wellnessScore >= 40 ? 'text-yellow-500' : 'text-destructive'}`}>
              {wellnessScore}%
            </span>
          </p>
        </motion.div>

        {/* 📊 MAIN BENTO GRID - FIXED SIZING */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 h-[28rem] lg:h-[32rem]">
          
          {/* 🌀 WELLNESS SCORE */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="xl:col-span-2 h-full"
          >
            <Card className="h-full hover:shadow-2xl border-0 bg-gradient-to-br from-card/90 via-card to-muted/30 backdrop-blur-sm">
              <CardHeader className="pb-4 pt-6 px-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-7 h-7 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-2xl font-bold text-foreground leading-tight truncate">Wellness Score</h3>
                    <p className="text-sm text-muted-foreground font-medium">Real-time tracking</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 pb-8">
                <div className="text-center space-y-6">
                  <motion.div
                    key={wellnessScore}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className="text-6xl sm:text-7xl font-black text-primary"
                  >
                    {wellnessScore}%
                  </motion.div>
                  
                  <Progress value={wellnessScore} className="h-5 [&>div]:!bg-gradient-to-r from-primary to-primary/80 mx-8" />
                  
                  <p className="text-lg sm:text-xl font-bold text-foreground leading-tight px-4 line-clamp-3">
                    {habits.length === 0 
                      ? "Create your first habit to unlock wellness tracking" 
                      : `${habits.length} habits • ${wellnessScore}% complete today`
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* ✅ QUICK STATS - FIXED TEXT OVERFLOW */}
          <motion.div 
            initial={{ y: 50, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            className="h-full"
          >
            <Card className="h-full hover:shadow-2xl border-0 bg-gradient-to-br from-card/90 via-card to-muted/30 backdrop-blur-sm">
              <CardHeader className="pb-4 pt-6 px-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Activity className="w-7 h-7 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-2xl font-bold text-foreground leading-tight truncate">Quick Stats</h3>
                    <p className="text-sm text-muted-foreground font-medium">Today overview</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 pb-8 space-y-6">
                <div className="space-y-4 text-center">
                  <div className="p-6 bg-muted/30 rounded-2xl border border-border/30 hover:border-primary/30 transition-all">
                    <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider mb-2">Total Habits</p>
                    <div className="text-4xl sm:text-5xl font-black text-foreground leading-none">{habits.length}</div>
                  </div>
                  
                  <div className="p-6 bg-muted/30 rounded-2xl border border-border/30 hover:border-primary/30 transition-all">
                    <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider mb-2">Today Complete</p>
                    <div className="text-4xl sm:text-5xl font-black text-primary leading-none">{wellnessScore}%</div>
                  </div>
                  
                  <Progress value={wellnessScore} className="h-4 [&>div]:!bg-gradient-to-r from-primary to-primary/80" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* ✅ RECENT HABITS - FIXED TEXT OVERFLOW */}
          <motion.div 
            initial={{ y: 50, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            className="h-full"
          >
            <Card className="h-full hover:shadow-2xl border-0 bg-gradient-to-br from-card/90 via-card to-muted/30 backdrop-blur-sm">
              <CardHeader className="pb-4 pt-6 px-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Target className="w-7 h-7 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-2xl font-bold text-foreground leading-tight truncate">Recent Habits</h3>
                    <p className="text-sm text-muted-foreground font-medium">Latest activity</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 pb-8">
                {habits.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-4">
                    <motion.div 
                      animate={{ scale: [1, 1.05, 1] }} 
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="w-20 h-20 bg-gradient-to-r from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center shadow-lg"
                    >
                      <Target className="w-10 h-10 text-primary/70" />
                    </motion.div>
                    <div className="space-y-2 max-w-[200px]">
                      <h3 className="text-xl font-bold text-foreground leading-tight">No habits yet</h3>
                      <p className="text-sm text-muted-foreground font-medium leading-relaxed">Start your wellness journey</p>
                    </div>
                    <Button 
                      onClick={() => window.location.href = '/habits'}
                      size="lg"
                      className="h-12 px-8 rounded-2xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 shadow-xl font-semibold"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Start Tracking
                    </Button>
                  </div>
                ) : (
                  <div className="max-h-64 overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                    {habits.slice(0, 4).map((habit, index) => (
                      <motion.div
                        key={habit.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        className="group p-4 rounded-xl bg-gradient-to-r from-muted/40 to-muted hover:from-primary/5 hover:to-primary/10 border border-border/50 hover:border-primary/30 transition-all shadow-sm hover:shadow-md cursor-pointer"
                        onClick={() => handleLogHabit(habit.id, habit.title)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="min-w-0 flex-1">
                            <h4 className="font-bold text-base leading-tight truncate text-foreground group-hover:text-primary">
                              {habit.title}
                            </h4>
                            <p className="text-xs text-muted-foreground capitalize font-medium mt-1 truncate">
                              {habit.category || 'General'}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            className="ml-3 h-9 px-4 rounded-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 shadow-md font-semibold border-0 text-xs flex-shrink-0"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
