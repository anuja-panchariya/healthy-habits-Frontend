import React, { useEffect, useState, useCallback, useMemo } from "react";
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
import StreakHeatmap from './StreakHeatmap';
import AIInsights from './AIInsights';
import ShareMilestone from './ShareMilestone';

export default function Dashboard() {
  const { getToken, userId } = useAuth();
  const [habits, setHabits] = useState([]);
  const [moodLogs, setMoodLogs] = useState([]);  
  const [wellnessScore, setWellnessScore] = useState(0);
  const [loading, setLoading] = useState(true);

  // 🔥 CURRENT STREAK CALCULATION ✅ ADDED
  const currentStreak = useMemo(() => {
    const allLogs = habits.flatMap(h => h.logs || []);
    const logs = allLogs.map(log => new Date(log.date).toDateString());
    let streak = 0;
    const today = new Date().toDateString();
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date();
      checkDate.setDate(checkDate.getDate() - i);
      if (logs.includes(checkDate.toDateString())) {
        streak++;
      } else break;
    }
    return streak;
  }, [habits]);

  // 🎯 REAL WELLNESS SCORE
  const calculateWellnessScore = useCallback((habitsData) => {
    if (!Array.isArray(habitsData) || habitsData.length === 0) return 0;
    
    const today = new Date().toDateString();
    const completedToday = habitsData.filter(habit => 
      habit.logs?.some(log => new Date(log.date).toDateString() === today) ||
      habit.loggedToday
    ).length;
    
    return Math.max(0, Math.min(100, Math.round((completedToday / habitsData.length) * 100)));
  }, []);

  // 🚀 LOAD REAL DATA
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (token) setAuthToken(token);

      const habitsRes = await api.get("/api/habits");
      const habitsData = habitsRes.habits || [];
      
      // ✅ FETCH MOOD LOGS TOO
      const moodsRes = await api.get("/api/mood").catch(() => ({}));
      const moodData = Array.isArray(moodsRes.data) ? moodsRes.data : [];
      
      setHabits(habitsData);
      setMoodLogs(moodData);
      const score = calculateWellnessScore(habitsData);
      setWellnessScore(score);
      
    } catch (error) {
      console.error("Dashboard error:", error);
      toast.error("Backend error - Check connection");
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
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* ✨ HEADER */}
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
          
          <Button
            onClick={() => window.location.href = '/habits'}
            className="h-14 px-8 rounded-2xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 shadow-lg text-lg font-semibold"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Habit
          </Button>
        </motion.div>

        {/* 📊 MAIN BENTO GRID */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ staggerChildren: 0.1 }}
        >
          
          {/* 🌀 MAIN WELLNESS CARD */}
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

          {/* 📈 QUICK STATS */}
          <motion.div 
            initial={{ y: 50, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            className="lg:col-span-1 h-80"
          >
            <Card className="h-full hover:shadow-xl bg-card">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-3 text-2xl font-bold text-foreground">
                  <Activity className="w-8 h-8 text-primary" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-6">
                  <div className="flex justify-between items-center p-4 bg-muted rounded-2xl">
                    <span className="text-muted-foreground font-semibold text-lg">Total Habits</span>
                    <span className="text-3xl font-black text-foreground">{habits.length}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-muted rounded-2xl">
                    <span className="text-muted-foreground font-semibold text-lg">Today Complete</span>
                    <span className="text-3xl font-black text-primary">{wellnessScore}%</span>
                  </div>
                  <Progress value={wellnessScore} className="h-3 [&>div]:!bg-primary" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 🎯 RECENT HABITS */}
          <motion.div 
            initial={{ y: 50, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            className="lg:col-span-1 h-80"
          >
            <Card className="h-full hover:shadow-xl bg-card">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-3 text-2xl font-bold text-foreground">
                  <Target className="w-8 h-8 text-primary" />
                  Recent Habits
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 max-h-72 overflow-y-auto space-y-4">
                {habits.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-12">
                    <div className="text-5xl mb-6 opacity-50">🎯</div>
                    <h3 className="text-2xl font-bold text-foreground mb-4">No habits yet</h3>
                    <p className="text-muted-foreground mb-8 text-lg">Start your wellness journey</p>
                    <Button 
                      onClick={() => window.location.href = '/habits'}
                      className="h-14 px-10 rounded-2xl bg-primary hover:bg-primary/90 shadow-lg"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Create Habit
                    </Button>
                  </div>
                ) : (
                  habits.slice(0, 5).map((habit) => (
                    <motion.div
                      key={habit.id}
                      whileHover={{ scale: 1.02 }}
                      className="group flex items-center justify-between p-4 rounded-2xl bg-muted hover:bg-muted/80 border border-border hover:border-primary/50 transition-all"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-lg text-foreground truncate group-hover:text-primary">
                          {habit.title}
                        </h4>
                        <p className="text-sm text-muted-foreground capitalize">{habit.category}</p>
                      </div>
                      <Button
                        onClick={() => handleLogHabit(habit.id, habit.title)}
                        size="sm"
                        className="ml-4 bg-primary hover:bg-primary/90 h-10 px-4 rounded-xl shadow-md"
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

        {/* 🔥 NEW FEATURES SECTION */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* 🔥 STREAK HEATMAP */}
          <StreakHeatmap habitLogs={habits.flatMap(h => h.logs || [])} />
          
          {/* 🧠 AI INSIGHTS */}
          <div className="lg:col-span-1">
            <AIInsights habits={habits} moodLogs={moodLogs} />
          </div>

          {/* 🏆 SHARE MILESTONE */}
          {currentStreak > 3 && (
            <ShareMilestone streak={currentStreak} username="Anuja" />
          )}
        </motion.div>
      </div>
    </div>
  );
}
