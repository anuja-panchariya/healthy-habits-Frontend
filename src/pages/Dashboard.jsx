<<<<<<< HEAD
import React from 'react'
import { motion } from 'framer-motion'
import DashboardHero from './DashboardHero'
import DashboardGrid from './DashboardGrid'
import CreateHabitDialog from '../components/CreateHabitDialog'

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background text-foreground p-6" data-testid="dashboard">
      <div className="max-w-7xl mx-auto space-y-8">
        <DashboardHero />
        <DashboardGrid />
      </div>
      <CreateHabitDialog 
        open={false} 
        onClose={() => {}} 
        onSuccess={() => {}} 
=======
import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import { 
  TrendingUp, Activity, Target, Flame, Plus, Bell, Clock 
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
import { useSelector, useDispatch } from 'react-redux'  // REDUX
import { 
  setHabits, 
  setLoading, 
  setError, 
  addHabit 
} from "../store/habitsSlice";  //  REDUX
import CreateHabitDialog from "../components/CreateHabitDialog";
import WellnessScore from "../components/WellnessScore";

export default function Dashboard() {
  const { getToken, userId } = useAuth();
  const dispatch = useDispatch();  //  REDUX
  
  //  REDUX STATE 
  const { habits: reduxHabits, loading: reduxLoading, error: reduxError } = 
    useSelector((state) => state.habits);
  
  // Local states (Not in Redux - component specific)
  const [wellnessScore, setWellnessScore] = useState(0);
  const [streaks, setStreaks] = useState([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [loadingReminder, setLoadingReminder] = useState(false);

  // REDUX loadData() - FULLY INTEGRATED
  const loadData = useCallback(async () => {
    dispatch(setLoading(true));  //  REDUX
    dispatch(setError(null));    // REDUX

    try {
      const token = await getToken();
      setAuthToken(token);

      const [habitsRes, wellnessRes, streaksRes] = await Promise.allSettled([
        api.get("/api/habits"),
        api.get("/api/habits/wellness-score"),
        api.get("/api/analytics/streaks"),
      ]);

      //  REDUX: Habits to Redux store
      if (habitsRes.status === "fulfilled" && Array.isArray(habitsRes.value?.data)) {
        dispatch(setHabits(habitsRes.value.data));  //  REDUX
      } else {
        dispatch(setHabits([]));  //  REDUX
      }

      // Local state updates (Not in Redux)
      setWellnessScore(
        wellnessRes.status === "fulfilled"
          ? wellnessRes.value?.data?.score || 0
          : 0
      );

      let streaksData = [];
      if (streaksRes.status === "fulfilled") {
        const streaksDataRaw = streaksRes.value?.data;
        if (Array.isArray(streaksDataRaw)) {
          streaksData = streaksDataRaw;
        } else if (streaksDataRaw?.streaks && Array.isArray(streaksDataRaw.streaks)) {
          streaksData = streaksDataRaw.streaks;
        } else if (streaksDataRaw?.data && Array.isArray(streaksDataRaw.data)) {
          streaksData = streaksDataRaw.data;
        }
      }
      setStreaks(streaksData);

    } catch (error) {
      console.error("Error loading data:", error);
      dispatch(setError(error.message));  //  REDUX ERROR
      dispatch(setHabits([]));            //  REDUX
      setWellnessScore(0);
      setStreaks([]);
    } finally {
      dispatch(setLoading(false));  //  REDUX
    }
  }, [dispatch, getToken]);  //  dispatch added to deps

  useEffect(() => {
    if (userId) {
      loadData();
    }
  }, [userId, loadData]);

  //  REDUX: Auto reminders (uses reduxHabits)
  useEffect(() => {
    const interval = setInterval(() => {
      if (reduxHabits.length > 0 && Notification.permission === "granted") {
        const habit = reduxHabits[0];
        new Notification("⏰ Habit Reminder", {
          body: `Time for ${habit.title || 'your habit'}!`,
          icon: "/favicon.ico"
        });
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [reduxHabits]);  //  reduxHabits instead of habits

  //  REDUX: handleLogHabit with optimistic update
  const handleLogHabit = async (habitId) => {
    try {
      const token = await getToken();
      setAuthToken(token);
      
      // Optimistic UI update
      const updatedHabits = reduxHabits.map(habit => 
        habit.id === habitId 
          ? { ...habit, loggedToday: true }
          : habit
      );
      dispatch(setHabits(updatedHabits));  //  REDUX OPTIMISTIC

      await api.post(`/api/habits/${habitId}/log`);
      toast.success(" Habit logged!");
      
      // Final refresh
      loadData();
    } catch (error) {
      // Revert optimistic update on error
      loadData();
      if (error.response?.status === 409) {
        toast.info("Already logged today");
      } else {
        toast.error("Failed to log habit");
      }
    }
  };

  //  REDUX: Create dialog onSuccess with addHabit
  const handleCreateSuccess = (newHabit) => {
    dispatch(addHabit(newHabit));  //  REDUX OPTIMISTIC ADD
    toast.success("🎉 New habit created!");
  };

  const sendDailyReminder = async () => {
    setLoadingReminder(true);
    setTimeout(() => {
      toast.success(` Reminders scheduled for ${reduxHabits.length || 0} habits!`);
      setLoadingReminder(false);
      
      if ("Notification" in window && Notification.permission !== "granted") {
        Notification.requestPermission();
      }
    }, 1000);
  };

  //  REDUX LOADING SCREEN
  if (reduxLoading) {  //  reduxLoading instead of loading
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your habits...</p>
        </div>
      </div>
    );
  }

  //  Use reduxHabits instead of local state
  const todayHabits = Array.isArray(reduxHabits) ? reduxHabits.slice(0, 5) : [];

  return (
    <div className="min-h-screen bg-background text-foreground p-6" data-testid="dashboard">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="font-serif font-light text-4xl tracking-tight mb-2 text-foreground">
              Your Dashboard
            </h1>
            <p className="text-muted-foreground">Track your wellness journey</p>
          </div>
          <div className="flex gap-3">
            <Button
              data-testid="create-habit-btn"
              onClick={() => setShowCreateDialog(true)}
              className="rounded-full"
            >
              <Plus className="w-4 h-4 mr-2" /> New Habit
            </Button>
            <Button
              onClick={sendDailyReminder}
              disabled={loadingReminder}
              className="rounded-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              data-testid="reminder-btn"
            >
              {loadingReminder ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Bell className="w-4 h-4 mr-2" />
                  Reminder
                </>
              )}
            </Button>
          </div>
        </div>

        {/*  REDUX ERROR BANNER */}
        {reduxError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-destructive/10 border border-destructive/30 rounded-2xl text-destructive"
          >
            <p className="font-medium">⚠️ {reduxError}</p>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={loadData}
              className="mt-2 h-8"
            >
              Retry
            </Button>
          </motion.div>
        )}

        {/* Bento Grid - SAME UI */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Wellness Score */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-2"
          >
            <WellnessScore score={wellnessScore} />
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card className="h-full bg-card text-card-foreground border-border/40 shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="flex items-center text-lg text-foreground">
                  <Activity className="w-5 h-5 mr-2 text-primary" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Total Habits</span>
                    <span className="font-medium text-foreground">{reduxHabits.length}</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Best Streak</span>
                    <span className="font-medium text-foreground">
                      {Array.isArray(streaks) && streaks.length > 0
                        ? Math.max(
                            ...streaks.map((s) => s.streak || s.currentStreak || 0),
                            0
                          )
                        : 0}{" "}
                      days
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Daily Reminders */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            <Card className="h-full bg-card text-card-foreground border-border/40 shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="flex items-center text-lg text-foreground">
                  <Bell className="w-5 h-5 mr-2 text-primary" />
                  Daily Reminders
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-1">
                <p className="text-sm text-muted-foreground">
                  Get email reminders for your habits
                </p>
                <Button
                  onClick={sendDailyReminder}
                  disabled={loadingReminder}
                  className="w-full rounded-full bg-blue-600 hover:bg-blue-700 text-white"
                  size="sm"
                  data-testid="daily-reminder-btn"
                >
                  {loadingReminder ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Clock className="w-4 h-4 mr-2" />
                      Send Now
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  {reduxHabits.length > 0 
                    ? `${reduxHabits.length} habit${reduxHabits.length !== 1 ? 's' : ''}` 
                    : 'Create habits first'
                  }
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Today's Habits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card className="bg-card text-card-foreground border-border/40 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-foreground">
                  <Target className="w-5 h-5 mr-2 text-primary" />
                  Today's Habits
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {todayHabits.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No habits yet. Create your first one!
                  </p>
                ) : (
                  todayHabits.map((habit) => (
                    <div
                      key={habit.id || Math.random()}
                      data-testid={`habit-item-${habit.id}`}
                      className="flex items-center justify-between p-4 rounded-2xl bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">
                          {habit.title || "Unnamed Habit"}
                        </h4>
                        <p className="text-sm text-muted-foreground capitalize">
                          {habit.category || "General"}
                        </p>
                      </div>
                      <Button
                        data-testid={`log-habit-btn-${habit.id}`}
                        onClick={() => handleLogHabit(habit.id)}
                        size="sm"
                        className="rounded-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white"
                        disabled={habit.loggedToday || habit.completed}
                      >
                        {habit.loggedToday ? " Done" : "Log"}
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Streaks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Card className="bg-card text-card-foreground border-border/40 shadow-sm h-full">
              <CardHeader>
                <CardTitle className="flex items-center text-foreground">
                  <Flame className="w-5 h-5 mr-2 text-accent" />
                  Top Streaks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Array.isArray(streaks) && streaks.length > 0 ? (
                  streaks
                    .slice(0, 3)
                    .filter(Boolean)
                    .map((streak, index) => (
                      <div
                        key={streak?.habitId || streak?.id || index}
                        className="flex justify-between items-center"
                      >
                        <span className="text-sm text-foreground truncate">
                          {streak?.title || streak?.habitName || "Unnamed Habit"}
                        </span>
                        <span className="font-medium text-accent text-foreground">
                          {streak?.streak || streak?.currentStreak || 0} 🔥
                        </span>
                      </div>
                    ))
                ) : (
                  <p className="text-muted-foreground text-sm">
                    Start logging habits to build streaks!
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/*  REDUX CreateHabitDialog */}
      <CreateHabitDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSuccess={handleCreateSuccess}  //  Redux addHabit()
>>>>>>> ec1a3b340244c832793b13282ae7c0d81d613555
      />
    </div>
  )
}
