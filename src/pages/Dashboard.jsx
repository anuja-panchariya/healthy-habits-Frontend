import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@clerk/clerk-react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  TrendingUp, Activity, Target, Flame, Plus, Bell, Clock, CheckCircle, Zap 
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
import CreateHabitDialog from "../components/CreateHabitDialog";

export default function Dashboard() {
  const { getToken, userId } = useAuth();
  const [habits, setHabits] = useState([]);
  const [wellnessScore, setWellnessScore] = useState(0);
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [loadingReminder, setLoadingReminder] = useState(false);

  // 🔥 REAL BACKEND DATA + Promise.allSettled
  const loadData = useCallback(async () => {
    try {
      const token = await getToken();
      setAuthToken(token);

      const [habitsRes, analyticsRes, wellnessRes] = await Promise.allSettled([
        api.get("/api/habits"),
        api.get("/api/analytics"),
        api.get("/api/habits/wellness-score")
      ]);

      setHabits(habitsRes.status === "fulfilled" ? (habitsRes.value.habits || []) : []);
      setAnalytics(analyticsRes.status === "fulfilled" ? analyticsRes.value : {});
      
      setWellnessScore(
        wellnessRes.status === "fulfilled" 
          ? wellnessRes.value?.score || 0 
          : 0
      );

    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    if (userId) loadData();
  }, [userId, loadData]);

  const handleLogHabit = async (habitId, habitTitle) => {
    try {
      const token = await getToken();
      setAuthToken(token);
      await api.post(`/api/habits/${habitId}/log`);
      
      // ✨ MAGIC TOAST ANIMATION
      toast.success(`✅ ${habitTitle} logged!`);
      loadData();
    } catch (error) {
      if (error.response?.status === 409) {
        toast.info("Already logged today! ✨");
      } else {
        toast.error("Failed to log habit");
      }
    }
  };

  // ✅ YOUR REMINDER ROUTE - /api/reminders/send
  const sendDailyReminder = async () => {
    if (habits.length === 0) {
      toast.info("Create habits first! 🎯");
      return;
    }

    setLoadingReminder(true);
    try {
      const token = await getToken();
      setAuthToken(token);
      
      await api.post('/api/reminders/send', {
        email: "user@example.com", // Clerk user email
        habits: habits.slice(0, 5).map(habit => ({
          title: habit.title,
          category: habit.category || 'General'
        }))
      });
      
      toast.success(`📧 ${habits.length} habit reminder sent!`);
    } catch (error) {
      toast.error("Reminder failed");
    } finally {
      setLoadingReminder(false);
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/30"
      >
        <div className="flex flex-col items-center space-y-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full"
          />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </motion.div>
    );
  }

  const todayHabits = habits.slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-background via-background/80 to-muted/20 p-6"
      data-testid="dashboard"
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* ✨ HEADER WITH FLOATING ANIMATION */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6"
        >
          <div>
            <motion.h1 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="font-serif font-light text-5xl lg:text-6xl tracking-tight mb-2 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent"
            >
              Dashboard
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-muted-foreground/80"
            >
              Wellness Score: <span className="font-bold text-2xl text-primary">{wellnessScore}%</span>
            </motion.p>
          </div>
          
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex gap-3 flex-wrap"
          >
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="rounded-2xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 shadow-lg hover:shadow-xl h-12 px-8 group"
            >
              <motion.div 
                className="flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="w-5 h-5" />
                <span>New Habit</span>
              </motion.div>
            </Button>
            
            <Button
              onClick={sendDailyReminder}
              disabled={loadingReminder || habits.length === 0}
              className="rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl h-12 px-8 relative overflow-hidden"
            >
              <motion.div 
                animate={loadingReminder ? { rotate: 360 } : {}}
                transition={{ duration: 1, repeat: Infinity }}
                className="flex items-center gap-2"
              >
                {loadingReminder ? (
                  <Loader2 className="w-5 h-5" />
                ) : (
                  <Bell className="w-5 h-5" />
                )}
                <span>Reminder</span>
              </motion.div>
            </Button>
          </motion.div>
        </motion.div>

        {/* 🔥 BENTO GRID WITH STAGGERED ANIMATIONS */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
        >
          
          {/* 🌀 WELLNESS SCORE - MAIN CARD */}
          <motion.div
            initial={{ y: 50, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            whileHover={{ y: -8, scale: 1.02 }}
            className="lg:col-span-2 xl:col-span-2 h-64"
          >
            <Card className="h-full bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur-sm border-0 shadow-2xl overflow-hidden group">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="w-12 h-12 bg-gradient-to-r from-primary to-primary/70 rounded-2xl flex items-center justify-center shadow-lg"
                  >
                    <TrendingUp className="w-6 h-6 text-background" />
                  </motion.div>
                  <div>
                    <h3 className="text-2xl font-bold text-foreground">Wellness Score</h3>
                    <p className="text-muted-foreground text-sm">Today</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                  className="text-center"
                >
                  <motion.div
                    key={wellnessScore}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-5xl font-black bg-gradient-to-r from-primary via-blue-600 to-emerald-500 bg-clip-text text-transparent mb-4"
                  >
                    {wellnessScore}%
                  </motion.div>
                  <Progress value={wellnessScore} className="h-4" indicatorClassName="bg-gradient-to-r from-emerald-500 to-green-600" />
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4 text-lg font-semibold"
                  >
                    {wellnessScore >= 80 ? "🏆 Excellent!" : wellnessScore >= 50 ? "👍 Great!" : "💪 Keep going!"}
                  </motion.p>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 📊 QUICK STATS */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            whileHover={{ y: -4 }}
            className="h-48 group"
          >
            <Card className="h-full bg-gradient-to-b from-muted/50 to-transparent backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all duration-300 shadow-lg hover:shadow-xl">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Activity className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex justify-between items-center p-3 bg-muted/50 rounded-xl group-hover:bg-muted/70 transition-all"
                >
                  <span className="text-muted-foreground">Habits</span>
                  <motion.span 
                    className="font-bold text-xl text-primary"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    {habits.length}
                  </motion.span>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex justify-between items-center p-3 bg-muted/50 rounded-xl group-hover:bg-muted/70 transition-all"
                >
                  <span className="text-muted-foreground">Today's Logs</span>
                  <span className="font-bold text-xl text-emerald-500">
                    {analytics?.todayLogs || 0}
                  </span>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 🔔 REMINDER BUTTON */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            whileHover={{ y: -4, scale: 1.02 }}
            className="h-48"
          >
            <Card className="h-full bg-gradient-to-b from-muted/50 to-transparent backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all duration-300 shadow-lg hover:shadow-xl">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-blue-600 animate-pulse" />
                  Daily Reminders
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-2">
                <p className="text-xs text-muted-foreground text-center">
                  Send beautiful habit reminder emails
                </p>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={sendDailyReminder}
                    disabled={loadingReminder || habits.length === 0}
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg"
                  >
                    {loadingReminder ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Send Now
                      </>
                    )}
                  </Button>
                </motion.div>
                <p className="text-xs text-center text-muted-foreground">
                  {habits.length} habit{habits.length !== 1 ? 's' : ''}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* 🎯 TODAY'S HABITS - FULL WIDTH */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="col-span-full lg:col-span-4 xl:col-span-5 h-80"
          >
            <Card className="h-full shadow-2xl border-0 overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Target className="w-6 h-6 text-primary" />
                  <span>Today's Habits ({todayHabits.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <AnimatePresence>
                  {todayHabits.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="h-64 flex flex-col items-center justify-center text-center p-12"
                    >
                      <motion.div 
                        animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-6xl mb-6 opacity-40"
                      >
                        🎯
                      </motion.div>
                      <h3 className="text-2xl font-bold mb-2 text-muted-foreground/80">No habits yet</h3>
                      <p className="text-muted-foreground mb-6">Click "New Habit" to get started!</p>
                    </motion.div>
                  ) : (
                    <motion.div
                      className="space-y-3 p-6 max-h-64 overflow-y-auto"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {todayHabits.map((habit, index) => (
                        <motion.div
                          key={habit.id}
                          initial={{ opacity: 0, x: -50, y: 20 }}
                          animate={{ opacity: 1, x: 0, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ scale: 1.02, x: 5 }}
                          className="group flex items-center justify-between p-5 rounded-2xl bg-gradient-to-r from-muted/50 to-muted hover:from-primary/5 hover:shadow-xl border border-border/50 hover:border-primary/30 transition-all duration-300 cursor-pointer"
                        >
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-lg group-hover:text-primary truncate">
                              {habit.title}
                            </h4>
                            <p className="text-sm text-muted-foreground capitalize flex items-center gap-1">
                              <CheckCircle className="w-3 h-3 opacity-70" />
                              {habit.category || "General"}
                            </p>
                          </div>
                          <motion.div whileTap={{ scale: 0.95 }}>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLogHabit(habit.id, habit.title);
                              }}
                              size="sm"
                              className="rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-lg ml-4 px-6 h-10 font-semibold"
                            >
                              Log Today
                            </Button>
                          </motion.div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>

      {/* ✨ CREATE HABIT DIALOG */}
      <AnimatePresence>
        {showCreateDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <CreateHabitDialog
              open={showCreateDialog}
              onClose={() => setShowCreateDialog(false)}
              onSuccess={loadData}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
