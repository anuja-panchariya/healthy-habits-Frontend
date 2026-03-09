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
      loadDashboardData(); // Refresh real data
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
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* ✨ HEADER - NO NEW HABIT BUTTON */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pt-20"
        >
          <div>
            <h1 className="font-serif font-light text-5xl lg:text-6xl tracking-tight text-foreground mb-3">
              Wellness Dashboard
            </h1>
            <p className="text-2xl text-muted-foreground font-semibold">
              Your Score: 
              <span className={`font-black text-4xl ml-3 ${wellnessScore >= 80 ? 'text-green-500' : wellnessScore >= 60 ? 'text-primary' : wellnessScore >= 40 ? 'text-yellow-500' : 'text-destructive'}`}>
                {wellnessScore}%
              </span>
            </p>
          </div>
        </motion.div>

        {/* 📊 MAIN BENTO GRID - ALL BOXES SAME HEIGHT */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ staggerChildren: 0.1 }}
        >
          
          {/* 🌀 MAIN WELLNESS CARD - SAME */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="lg:col-span-2 h-80 lg:h-96"
          >
            <Card className="h-full hover:shadow-xl border-0 bg-gradient-to-br from-card to-muted">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <TrendingUp className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-foreground">Wellness Score</h3>
                    <p className="text-muted-foreground font-medium">Real-time tracking</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="text-center">
                  <motion.div
                    key={wellnessScore}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className="text-7xl font-black text-primary mb-8"
                  >
                    {wellnessScore}%
                  </motion.div>
                  
                  <Progress value={wellnessScore} className="h-6 mb-8 [&>div]:!bg-gradient-to-r from-primary to-primary/80" />
                  
                  <p className="text-2xl font-bold text-foreground leading-tight">
                    {habits.length === 0 
                      ? "Create your first habit to unlock wellness tracking!" 
                      : `${habits.length} habits • ${wellnessScore}% complete today`
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* ✅ FIXED QUICK STATS - BIGGER + PROPER TEXT */}
          <motion.div 
            initial={{ y: 50, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            className="lg:col-span-1 h-80 lg:h-96"  // SAME HEIGHT AS WELLNESS
          >
            <Card className="h-full hover:shadow-xl border-0 bg-gradient-to-br from-card to-muted">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <Activity className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-foreground">Quick Stats</h3>
                    <p className="text-muted-foreground font-medium">Today overview</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="space-y-6 text-center">
                  <div className="p-6 bg-muted/50 rounded-3xl border border-border/50">
                    <p className="text-sm text-muted-foreground font-mono uppercase tracking-wider mb-3">Total Habits</p>
                    <div className="text-5xl font-black text-foreground">{habits.length}</div>
                  </div>
                  
                  <div className="p-6 bg-muted/50 rounded-3xl border border-border/50">
                    <p className="text-sm text-muted-foreground font-mono uppercase tracking-wider mb-3">Today Complete</p>
                    <div className="text-5xl font-black text-primary">{wellnessScore}%</div>
                  </div>
                  
                  <Progress value={wellnessScore} className="h-6 [&>div]:!bg-gradient-to-r from-primary to-primary/80" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* ✅ FIXED RECENT HABITS - BIGGER + START TRACKING */}
          <motion.div 
            initial={{ y: 50, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            className="lg:col-span-1 h-80 lg:h-96"  // SAME HEIGHT AS WELLNESS
          >
            <Card className="h-full hover:shadow-xl border-0 bg-gradient-to-br from-card to-muted">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <Target className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-foreground">Recent Habits</h3>
                    <p className="text-muted-foreground font-medium">Latest activity</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                {habits.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-8">
                    <motion.div 
                      animate={{ scale: [1, 1.1, 1] }} 
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="w-24 h-24 bg-gradient-to-r from-primary/20 to-primary/10 rounded-3xl flex items-center justify-center shadow-xl"
                    >
                      <Target className="w-12 h-12 text-primary/70" />
                    </motion.div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold text-foreground mb-2">No habits yet</h3>
                      <p className="text-muted-foreground text-lg font-medium max-w-[250px] mx-auto leading-relaxed">
                        Start your wellness journey with your first habit
                      </p>
                    </div>
                    <Button 
                      onClick={() => window.location.href = '/habits'}  // ✅ REDIRECT TO HABITS
                      className="h-14 px-12 rounded-2xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 shadow-xl font-semibold text-lg"
                    >
                      <Plus className="w-5 h-5 mr-3" />
                      Start Tracking
                    </Button>
                  </div>
                ) : (
                  <div className="max-h-72 overflow-y-auto space-y-4 pr-2">
                    {habits.slice(0, 5).map((habit, index) => (
                      <motion.div
                        key={habit.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        className="group flex items-center justify-between p-5 rounded-2xl bg-gradient-to-r from-muted/50 to-muted hover:from-primary/10 hover:to-primary/5 border border-border hover:border-primary/40 transition-all shadow-sm hover:shadow-md"
                      >
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-lg text-foreground truncate group-hover:text-primary leading-tight">
                            {habit.title}
                          </h4>
                          <p className="text-sm text-muted-foreground capitalize font-medium mt-1 truncate">
                            {habit.category || 'General'}
                          </p>
                        </div>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLogHabit(habit.id, habit.title);
                          }}
                          size="sm"
                          className="ml-4 h-11 px-6 rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-md font-semibold border-0 text-sm"
                        >
                          <CheckCircle className="w-4 h-4" />
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
