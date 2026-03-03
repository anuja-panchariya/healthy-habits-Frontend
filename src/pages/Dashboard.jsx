import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@clerk/clerk-react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  TrendingUp, Activity, Target, Flame, Plus, Clock, CheckCircle, Zap 
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
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // 🎯 CLEAN WELLNESS CALCULATION (Safe - 0% if no habits)
  const calculateWellnessScore = useCallback((habitsData, analyticsData = {}) => {
    if (!Array.isArray(habitsData) || habitsData.length === 0) {
      return 0;
    }

    let completedToday = 0;
    habitsData.forEach(habit => {
      const isCompletedToday = 
        (analyticsData.todayLogs && analyticsData.todayLogs.includes(habit.id)) ||
        habit.loggedToday === true ||
        (habit.lastLogged && new Date(habit.lastLogged).toDateString() === new Date().toDateString());
      
      if (isCompletedToday) completedToday++;
    });

    return Math.max(0, Math.min(100, Math.round((completedToday / habitsData.length) * 100)));
  }, []);

  // 🚀 LOAD DATA (Safe API handling)
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (token) setAuthToken(token);

      // Safe API calls with fallback
      const habitsData = await api.get("/api/habits").catch(() => ([]));
      const analyticsData = await api.get("/api/analytics").catch(() => ({}));
      
      setHabits(Array.isArray(habitsData) ? habitsData : []);
      setAnalytics(analyticsData || {});
      
      const score = calculateWellnessScore(habitsData, analyticsData);
      setWellnessScore(score);
      
    } catch (error) {
      console.error("Dashboard error:", error);
      toast.info("Using demo data 😊");
      setHabits([]);
      setWellnessScore(0);
    } finally {
      setLoading(false);
    }
  }, [getToken, calculateWellnessScore]);

  useEffect(() => {
    if (userId) {
      loadDashboardData();
      const interval = setInterval(loadDashboardData, 30000);
      return () => clearInterval(interval);
    }
  }, [userId, loadDashboardData]);

  // ✅ LOG HABIT (Safe)
  const handleLogHabit = async (habitId, habitTitle) => {
    try {
      const token = await getToken();
      if (token) setAuthToken(token);
      await api.post(`/api/habits/${habitId}/log`);
      toast.success(`✅ ${habitTitle} logged!`);
      loadDashboardData();
    } catch (error) {
      if (error.response?.status === 409) {
        toast.info("Already logged today! ✨");
      } else {
        toast.error("Failed to log");
      }
    }
  };

  if (loading) {
    return (
      <motion.div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <motion.div 
            animate={{ rotate: 360 }} 
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-500 rounded-full mx-auto mb-4" 
          />
          <p className="text-gray-600 text-lg">Loading dashboard...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8"
    >
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* ✨ HEADER - NO OVERLAP */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pb-16 lg:pb-0"
        >
          <div>
            <h1 className="font-serif font-light text-5xl lg:text-6xl tracking-tight bg-gradient-to-r from-gray-900 to-emerald-600 bg-clip-text text-transparent mb-2">
              Wellness Dashboard
            </h1>
            <p className="text-xl text-gray-600">
              Your Score: 
              <span className={`font-black text-3xl ml-2 ${
                wellnessScore >= 80 ? 'text-emerald-500' : 
                wellnessScore >= 60 ? 'text-green-500' : 
                wellnessScore >= 40 ? 'text-yellow-500' : 
                'text-orange-500'
              }`}>
                {wellnessScore}%
              </span>
            </p>
          </div>
          
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="h-14 px-8 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 shadow-xl text-lg font-semibold"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Habit
          </Button>
        </motion.div>

        {/* 📊 MAIN BENTO GRID */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-4 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
        >
          
          {/* 🌀 MAIN WELLNESS CARD */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            whileHover={{ y: -8 }}
            className="lg:col-span-2 xl:col-span-2 h-72"
          >
            <Card className="h-full bg-gradient-to-br from-white to-emerald-50/50 backdrop-blur-sm shadow-2xl border-0 overflow-hidden group hover:shadow-3xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 20, repeat: Infinity }}
                    className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-2xl"
                  >
                    <TrendingUp className="w-7 h-7 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Wellness Score</h3>
                    <p className="text-sm text-gray-600">Real-time calculation</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="text-center">
                  <motion.div
                    key={wellnessScore}
                    initial={{ scale: 0.7 }}
                    animate={{ scale: 1 }}
                    className="text-6xl font-black bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 bg-clip-text text-transparent mb-6"
                  >
                    {wellnessScore}
                    <span className="text-3xl">%</span>
                  </motion.div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-4 mb-6 overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-green-600 rounded-full shadow-lg"
                      initial={{ width: 0 }}
                      animate={{ width: `${wellnessScore}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                  </div>

                  <p className="text-xl font-semibold text-gray-800 mb-4">
                    {habits.length === 0 
                      ? "Create your first habit to start tracking!" 
                      : `${habits.length} habits • ${wellnessScore}% complete`
                    }
                  </p>
                  
                  {habits.length === 0 && (
                    <motion.div whileHover={{ scale: 1.02 }}>
                      <Button 
                        onClick={() => setShowCreateDialog(true)}
                        className="h-14 px-12 rounded-2xl shadow-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 text-lg font-semibold"
                      >
                        <Plus className="w-5 h-5 mr-2" />
                        Create First Habit
                      </Button>
                    </motion.div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 📈 QUICK STATS */}
          <motion.div initial={{ y: 50 }} animate={{ y: 0 }} className="lg:col-span-1 h-72">
            <Card className="h-full shadow-2xl border-0 bg-gradient-to-br from-white to-emerald-50/30 backdrop-blur-sm hover:shadow-3xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <Activity className="w-6 h-6 text-emerald-600" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Total Habits</span>
                    <span className="text-2xl font-bold text-gray-900">{habits.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Today Complete</span>
                    <span className={`text-2xl font-bold text-emerald-600`}>
                      {Math.round(wellnessScore)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-emerald-500 to-green-600 h-2 rounded-full"
                      style={{ width: `${wellnessScore}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 🎯 TODAY'S HABITS */}
          <motion.div initial={{ y: 50 }} animate={{ y: 0 }} className="lg:col-span-1 h-72">
            <Card className="h-full shadow-2xl border-0 overflow-hidden bg-gradient-to-br from-white to-emerald-50/50 backdrop-blur-sm hover:shadow-3xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3">
                  <Target className="w-6 h-6 text-emerald-600" />
                  Today's Habits
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 max-h-64 overflow-y-auto space-y-3">
                {habits.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-8">
                    <div className="text-4xl mb-4 opacity-40">🎯</div>
                    <h3 className="text-xl font-bold text-gray-700 mb-2">No habits yet</h3>
                    <p className="text-gray-500 mb-6">Start tracking your wellness journey</p>
                    <Button 
                      className="h-12 px-8 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 shadow-xl"
                      onClick={() => setShowCreateDialog(true)}
                    >
                      Create Habit
                    </Button>
                  </div>
                ) : (
                  Array.isArray(habits) && habits.slice(0, 6).map((habit) => (
                    <motion.div
                      key={habit.id}
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-gray-50 to-emerald-50/30 border border-emerald-100 hover:border-emerald-200 hover:shadow-md transition-all"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-lg text-gray-900 truncate">{habit.title || 'Demo Habit'}</h4>
                        <p className="text-sm text-gray-600 capitalize">{habit.category || 'fitness'}</p>
                      </div>
                      <Button
                        onClick={() => handleLogHabit(habit.id, habit.title)}
                        size="sm"
                        className="ml-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 shadow-lg h-10 px-4 rounded-xl"
                      >
                        Log Today
                      </Button>
                    </motion.div>
                  ))
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* ✅ CREATE HABIT DIALOG */}
        <AnimatePresence>
          {showCreateDialog && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="p-8">
                  <h2 className="text-3xl font-serif font-light bg-gradient-to-r from-gray-900 to-emerald-600 bg-clip-text text-transparent mb-6 text-center">
                    New Habit
                  </h2>
                  <div className="space-y-4">
                    <input 
                      placeholder="Habit name (e.g. Drink water)" 
                      className="w-full p-4 border-2 border-gray-200 rounded-2xl text-lg focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100 transition-all"
                    />
                    <select className="w-full p-4 border-2 border-gray-200 rounded-2xl text-lg focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100 transition-all">
                      <option>fitness</option>
                      <option>hydration</option>
                      <option>sleep</option>
                      <option>mindfulness</option>
                    </select>
                    <div className="flex gap-3 pt-2">
                      <Button className="flex-1 h-14 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 shadow-xl font-semibold text-lg">
                        Create Habit
                      </Button>
                      <Button 
                        onClick={() => setShowCreateDialog(false)}
                        variant="outline"
                        className="h-14 px-8 rounded-2xl border-2 border-gray-300 hover:bg-gray-50 font-semibold text-lg"
                      >
                        Cancel
                      </Button>
                    </div>
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
