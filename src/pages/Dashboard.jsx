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
import CreateHabitDialog from "../components/CreateHabitDialog";
import WellnessScore from "../components/WellnessScore";

export default function Dashboard() {
  const { getToken, userId } = useAuth();
  const [habits, setHabits] = useState([]);
  const [wellnessScore, setWellnessScore] = useState(0);
  const [streaks, setStreaks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [loadingReminder, setLoadingReminder] = useState(false); // ✅ NEW

  // ✅ REAL DATA ONLY - Promise.allSettled (NO CRASHES!)
  const loadData = useCallback(async () => {
    try {
      const token = await getToken();
      setAuthToken(token);

      // ✅ Promise.allSettled - Individual failures don't crash everything!
      const [habitsRes, wellnessRes, streaksRes] = await Promise.allSettled([
        api.get("/api/habits"),
        api.get("/api/habits/wellness-score"),
        api.get("/api/analytics/streaks"),
      ]);

      // ✅ REAL HABITS - No fake data
      setHabits(
        habitsRes.status === "fulfilled" && Array.isArray(habitsRes.value?.data)
          ? habitsRes.value.data
          : []
      );

      // ✅ REAL WELLNESS SCORE - Backend se ya 0
      setWellnessScore(
        wellnessRes.status === "fulfilled"
          ? wellnessRes.value?.data?.score || 0  // Backend real score
          : 0  // No backend = honest 0%
      );

      // ✅ REAL STREAKS - Bulletproof handling
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
      toast.error("Failed to load dashboard data");
      setHabits([]);
      setWellnessScore(0);  // ✅ REAL 0 - no fake!
      setStreaks([]);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    if (userId) {
      loadData();
    }
  }, [userId]);
  /* eslint-enable react-hooks/exhaustive-deps */

  const handleLogHabit = async (habitId) => {
    try {
      const token = await getToken();
      setAuthToken(token);
      await api.post(`/api/habits/${habitId}/log`);
      toast.success("Habit logged!");
      loadData();  // Refresh real data
    } catch (error) {
      if (error.response?.status === 409) {
        toast.info("Already logged today");
      } else {
        toast.error("Failed to log habit");
      }
    }
  };

  // ✅ NEW: REAL REMINDER FUNCTION
  const sendDailyReminder = async () => {
    setLoadingReminder(true);
    try {
      const token = await getToken();
      setAuthToken(token);
      const res = await api.post('/api/reminders/daily');
      toast.success(
        `✅ Daily reminder sent! (${res.data.habitsCount || 0} habits)`  
      );
    } catch (error) {
      console.error('Reminder error:', error);
      toast.error('Reminder failed - check backend');
    } finally {
      setLoadingReminder(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const todayHabits = Array.isArray(habits) ? habits.slice(0, 5) : [];

  return (
    <div className="min-h-screen bg-background p-6" data-testid="dashboard">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="font-serif font-light text-4xl tracking-tight mb-2">
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
            {/* ✅ NEW REMINDER BUTTON */}
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

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Wellness Score - Large */}
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
            <Card className="h-full bg-card border-border/40 shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Activity className="w-5 h-5 mr-2 text-primary" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Total Habits</span>
                    <span className="font-medium">{habits.length}</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Best Streak</span>
                    <span className="font-medium">
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

          {/* ✅ NEW REMINDER CARD */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            <Card className="h-full bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Bell className="w-5 h-5 mr-2 text-blue-600" />
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
                  className="w-full rounded-full bg-blue-600 hover:bg-blue-700"
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
                  {habits.length > 0 
                    ? `${habits.length} habit${habits.length !== 1 ? 's' : ''}` 
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
            <Card className="bg-card border-border/40 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
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
                        <h4 className="font-medium">
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
                        className="rounded-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400"
                        disabled={habit.loggedToday || habit.completed}
                      >
                        {habit.loggedToday ? "✅ Done" : "Log"}
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
            <Card className="bg-card border-border/40 shadow-sm h-full">
              <CardHeader>
                <CardTitle className="flex items-center">
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
                        <span className="text-sm truncate">
                          {streak?.title || streak?.habitName || "Unnamed Habit"}
                        </span>
                        <span className="font-medium text-accent">
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

      <CreateHabitDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSuccess={loadData}
      />
    </div>
  );
}
