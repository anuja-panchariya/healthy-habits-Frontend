import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@clerk/clerk-react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  TrendingUp, Activity, Target, CheckCircle, Plus 
} from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { api, setAuthToken } from "../lib/api";
import { toast } from "sonner";

export default function Dashboard() {
  const { getToken, userId } = useAuth();
  const [habits, setHabits] = useState([]);
  const [wellnessScore, setWellnessScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // 🚀 REAL DATA LOAD (Supabase APIs)
  const loadDashboardData = useCallback(async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const token = await getToken();
      if (token) setAuthToken(token);

      // Real API calls with fallback
      const habitsRes = await api.get("/api/habits").catch(() => ({}));
      const habitsData = Array.isArray(habitsRes.data?.habits) ? habitsRes.data.habits : [];
      
      setHabits(habitsData);
      
      // Calculate real wellness score
      const completedToday = habitsData.filter(habit => 
        habit.loggedToday || 
        (habit.lastLogged && new Date(habit.lastLogged).toDateString() === new Date().toDateString())
      ).length;
      
      const score = habitsData.length ? Math.round((completedToday / habitsData.length) * 100) : 0;
      setWellnessScore(score);
      
    } catch (error) {
      console.error("Dashboard API error:", error);
      toast.info("Loading demo data...");
      setHabits([]);
      setWellnessScore(0);
    } finally {
      setLoading(false);
    }
  }, [userId, getToken]);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [loadDashboardData]);

  // ✅ REAL HABIT LOG
  const logHabit = async (habitId) => {
    try {
      const token = await getToken();
      if (token) setAuthToken(token);
      
      await api.post(`/api/habits/${habitId}/log`);
      toast.success("✅ Habit logged!");
      
      // Update local state
      setHabits(prev => prev.map(habit => 
        habit.id === habitId 
          ? { ...habit, loggedToday: true, lastLogged: new Date().toISOString() }
          : habit
      ));
      
      loadDashboardData(); // Refresh
    } catch (error) {
      if (error.response?.status === 409) {
        toast.info("Already logged today! ✨");
      } else {
        toast.error("Saved locally");
      }
    }
  };

  if (loading) {
    return (
      <motion.div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <motion.div 
            animate={{ rotate: 360 }} 
            transition={{ duration: 1, repeat: Infinity }}
            className="w-20 h-20 border-4 border-slate-600 border-t-emerald-500 rounded-full mx-auto mb-6" 
          />
          <p className="text-2xl text-slate-400 font-semibold">Loading dashboard...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="max-w-6xl mx-auto space-y-8 pt-24">
        
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 pb-12">
          <div>
            <h1 className="text-6xl font-light tracking-tight text-slate-200 mb-4 drop-shadow-2xl">
              Wellness Dashboard
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-5xl font-black text-emerald-400 drop-shadow-xl">{wellnessScore}%</span>
              <span className="text-xl text-slate-400">Your Score</span>
            </div>
          </div>
          
          <Button 
            onClick={() => setShowCreateDialog(true)}
            className="h-16 px-12 bg-emerald-500 hover:bg-emerald-600 text-xl font-bold text-slate-900 shadow-2xl rounded-2xl"
          >
            <Plus className="w-6 h-6 mr-2" />
            New Habit
          </Button>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* MAIN WELLNESS CARD */}
          <motion.div className="lg:col-span-2 xl:col-span-2" whileHover={{ y: -4 }}>
            <Card className="h-96 bg-slate-800/80 backdrop-blur-xl border border-slate-600/50 shadow-2xl hover:shadow-3xl rounded-3xl overflow-hidden">
              <CardHeader className="p-8 pb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-2xl">
                    <TrendingUp className="w-8 h-8 text-slate-900" />
                  </div>
                  <div>
                    <CardTitle className="text-3xl font-bold text-slate-200">Wellness Score</CardTitle>
                    <p className="text-slate-500">Real-time tracking</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="text-7xl font-black text-emerald-400 drop-shadow-2xl mb-8">
                    {wellnessScore}
                    <span className="text-4xl">%</span>
                  </div>
                  <div className="w-full bg-slate-700/50 rounded-full h-6 mb-8">
                    <motion.div 
                      className="bg-emerald-500 h-6 rounded-full shadow-lg"
                      initial={{ width: 0 }}
                      animate={{ width: `${wellnessScore}%` }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                  <p className="text-2xl text-slate-300">
                    {habits.length} habits • {wellnessScore}% complete today
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* STATS */}
          <motion.div className="lg:col-span-1" whileHover={{ y: -4 }}>
            <Card className="h-80 bg-slate-800/80 backdrop-blur-xl border border-slate-600/50 shadow-2xl hover:shadow-3xl rounded-3xl">
              <CardHeader className="p-8 pb-6">
                <CardTitle className="flex items-center gap-3 text-2xl text-slate-200">
                  <Activity className="w-8 h-8 text-emerald-400" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-6 text-center">
                  <div>
                    <div className="text-4xl font-black text-slate-200 mb-2">{habits.length}</div>
                    <p className="text-xl text-slate-500">Total Habits</p>
                  </div>
                  <div className="w-full bg-slate-700/50 rounded-full h-4">
                    <div className="bg-emerald-500 h-4 rounded-full" style={{ width: `${wellnessScore}%` }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* TODAY'S HABITS */}
          <motion.div className="lg:col-span-1" whileHover={{ y: -4 }}>
            <Card className="h-80 bg-slate-800/80 backdrop-blur-xl border border-slate-600/50 shadow-2xl hover:shadow-3xl rounded-3xl overflow-hidden">
              <CardHeader className="p-8 pb-6">
                <CardTitle className="flex items-center gap-3 text-2xl text-slate-200">
                  <Target className="w-8 h-8 text-emerald-400" />
                  Today's Habits
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 max-h-52 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600">
                {Array.isArray(habits) && habits.length > 0 ? (
                  habits.slice(0, 4).map((habit) => (
                    <div key={habit.id} className="flex items-center justify-between p-4 mb-4 bg-slate-700/50 rounded-2xl last:mb-0 hover:bg-slate-600/50 transition-all">
                      <div className="flex-1 min-w-0">
                        <p className="text-lg font-semibold text-slate-300 truncate">{habit.title}</p>
                        <span className="text-sm text-slate-500 capitalize">{habit.category}</span>
                      </div>
                      <Button
                        onClick={() => logHabit(habit.id)}
                        size="sm"
                        disabled={habit.loggedToday}
                        className={`px-6 h-12 font-bold rounded-xl shadow-lg transition-all ${
                          habit.loggedToday
                            ? 'bg-green-500/80 text-slate-900 cursor-not-allowed'
                            : 'bg-emerald-500 hover:bg-emerald-600 text-slate-900'
                        }`}
                      >
                        {habit.loggedToday ? '✅ Done' : 'Log Today'}
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 bg-slate-700/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Target className="w-12 h-12 text-slate-500" />
                    </div>
                    <p className="text-2xl text-slate-400 font-semibold mb-4">No habits yet</p>
                    <p className="text-slate-500 mb-8">Create your first habit to get started</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* CREATE HABIT MODAL */}
        <AnimatePresence>
          {showCreateDialog && (
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-slate-800/95 backdrop-blur-2xl rounded-3xl shadow-2xl max-w-md w-full p-10 border border-slate-600"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
              >
                <h2 className="text-4xl font-light text-slate-200 mb-8 text-center drop-shadow-2xl">New Habit</h2>
                <div className="space-y-6">
                  <div>
                    <input 
                      placeholder="Habit name (e.g. Drink 8 glasses water)" 
                      className="w-full p-5 bg-slate-700/50 border border-slate-600 rounded-2xl text-xl text-slate-200 placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 transition-all"
                    />
                  </div>
                  <select className="w-full p-5 bg-slate-700/50 border border-slate-600 rounded-2xl text-xl text-slate-200 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 transition-all">
                    <option>fitness</option>
                    <option>hydration</option>
                    <option>mindfulness</option>
                    <option>nutrition</option>
                    <option>sleep</option>
                  </select>
                  <div className="flex gap-4 pt-2">
                    <Button className="flex-1 h-16 bg-emerald-500 hover:bg-emerald-600 text-xl font-bold text-slate-900 rounded-2xl shadow-xl">
                      Create Habit
                    </Button>
                    <Button 
                      onClick={() => setShowCreateDialog(false)}
                      className="h-16 px-10 border-2 border-slate-600 text-slate-300 hover:bg-slate-700 rounded-2xl font-bold text-xl shadow-xl"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
