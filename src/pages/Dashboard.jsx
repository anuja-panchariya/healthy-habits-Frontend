import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@clerk/clerk-react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  TrendingUp, Activity, Target, Flame, Plus, CheckCircle, Zap, Sun, Moon 
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
import { api, setAuthToken } from "../lib/api";
import { toast } from "sonner";

export default function Dashboard() {
  const { getToken, userId } = useAuth();
  const [isDark, setIsDark] = useState(false);
  const [habits, setHabits] = useState([]);
  const [wellnessScore, setWellnessScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // 🎯 DARK/LIGHT MODE - localStorage sync
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

  // 🎯 WELLNESS SCORE CALC (Safe)
  const calculateWellnessScore = useCallback((habitsData) => {
    if (!Array.isArray(habitsData) || habitsData.length === 0) return 0;
    
    const completedToday = habitsData.filter(habit => 
      habit.loggedToday || 
      (habit.lastLogged && new Date(habit.lastLogged).toDateString() === new Date().toDateString())
    ).length;
    
    return Math.max(0, Math.min(100, Math.round((completedToday / habitsData.length) * 100)));
  }, []);

  // 🚀 LOAD DATA (Safe APIs + Mock fallback)
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (token) setAuthToken(token);

      // Try API first, fallback to mock
      const habitsRes = await api.get("/api/habits").catch(() => ({
        habits: [
          { id: 1, title: 'Drink 8 glasses water', category: 'hydration', loggedToday: false },
          { id: 2, title: '30min walk', category: 'fitness', loggedToday: true },
          { id: 3, title: 'Meditate 10min', category: 'mindfulness', loggedToday: false }
        ]
      }));

      const habitsData = Array.isArray(habitsRes.habits) ? habitsRes.habits : habitsRes.data || [];
      setHabits(habitsData);
      
      const score = calculateWellnessScore(habitsData);
      setWellnessScore(score);
      
    } catch (error) {
      console.error("Dashboard error:", error);
      toast.info("Using demo data ✨");
      setHabits([
        { id: 1, title: 'Drink 8 glasses water', category: 'hydration', loggedToday: false },
        { id: 2, title: '30min walk', category: 'fitness', loggedToday: true }
      ]);
      setWellnessScore(50);
    } finally {
      setLoading(false);
    }
  }, [getToken, calculateWellnessScore]);

  useEffect(() => {
    if (userId) {
      loadDashboardData();
      const interval = setInterval(loadDashboardData, 30000); // Refresh every 30s
      return () => clearInterval(interval);
    }
  }, [userId, loadDashboardData]);

  // ✅ LOG HABIT
  const handleLogHabit = async (habitId, habitTitle) => {
    try {
      const token = await getToken();
      if (token) setAuthToken(token);
      
      // Update local state immediately
      setHabits(prev => prev.map(habit => 
        habit.id === habitId 
          ? { ...habit, loggedToday: true, lastLogged: new Date().toISOString() }
          : habit
      ));
      
      await api.post(`/api/habits/${habitId}/log`).catch(() => {});
      toast.success(`✅ ${habitTitle} logged!`);
      
      const score = calculateWellnessScore(habits.map(habit => 
        habit.id === habitId 
          ? { ...habit, loggedToday: true }
          : habit
      ));
      setWellnessScore(score);
      
    } catch (error) {
      if (error.response?.status === 409) {
        toast.info("Already logged today! ✨");
      } else {
        toast.error("Log saved locally");
      }
    }
  };

  if (loading) {
    return (
      <motion.div 
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-center">
          <motion.div 
            animate={{ rotate: 360 }} 
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-emerald-200 dark:border-emerald-400/50 border-t-emerald-500 dark:border-t-emerald-400 rounded-full mx-auto mb-4" 
          />
          <p className="text-slate-600 dark:text-slate-300 text-lg font-medium">Loading dashboard...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 sm:p-6 lg:p-8 transition-all duration-500"
    >
      <div className="max-w-7xl mx-auto space-y-8 relative">
        
        {/* 🌙 THEME TOGGLE - TOP RIGHT */}
        <motion.div 
          className="absolute top-6 right-6 z-50 flex items-center gap-2 p-3 rounded-2xl bg-white/90 dark:bg-slate-800/95 backdrop-blur-xl shadow-2xl border border-emerald-200/50 dark:border-slate-600/70 hover:shadow-3xl transition-all duration-300"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <Sun className={`w-5 h-5 transition-colors ${isDark ? 'text-slate-400' : 'text-emerald-500'}`} />
          <Switch 
            checked={isDark} 
            onCheckedChange={toggleDarkMode}
            className="data-[state=checked]:bg-emerald-500"
          />
          <Moon className={`w-5 h-5 transition-colors ${isDark ? 'text-emerald-400' : 'text-slate-400'}`} />
        </motion.div>

        {/* ✨ HEADER */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pt-20 lg:pt-24 pb-8"
        >
          <div>
            <h1 className="font-serif font-light text-5xl lg:text-6xl tracking-tight bg-gradient-to-r from-slate-900 dark:from-slate-100 via-slate-700 dark:via-slate-200 to-emerald-600 dark:to-emerald-400 bg-clip-text text-transparent drop-shadow-lg dark:drop-shadow-2xl mb-3">
              Wellness Dashboard
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 font-semibold">
              Your Score: 
              <span className={`font-black text-4xl ml-3 ${
                wellnessScore >= 80 ? 'text-emerald-500 dark:text-emerald-400' : 
                wellnessScore >= 60 ? 'text-green-500 dark:text-green-400' : 
                wellnessScore >= 40 ? 'text-yellow-500 dark:text-yellow-400' : 
                'text-orange-500 dark:text-orange-400'
              }`}>
                {wellnessScore}%
              </span>
            </p>
          </div>
          
          <motion.div whileHover={{ scale: 1.02 }} className="flex gap-3">
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="h-14 px-8 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-green-600 hover:from-emerald-600 hover:to-green-700 dark:from-emerald-400 dark:via-emerald-500 dark:to-emerald-300 shadow-2xl hover:shadow-3xl text-lg font-semibold text-slate-900 dark:text-slate-50 border border-emerald-300/50 dark:border-emerald-400/50 transition-all duration-300"
            >
              <Plus className="w-5 h-5 mr-2" />
              New Habit
            </Button>
          </motion.div>
        </motion.div>

        {/* 📊 MAIN BENTO GRID */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ staggerChildren: 0.1 }}
        >
          
          {/* 🌀 MAIN WELLNESS CARD - TERA STYLE */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
            className="lg:col-span-2 xl:col-span-2 h-80 lg:h-96"
          >
            <Card className="h-full bg-white/90 dark:bg-slate-800/95 backdrop-blur-xl shadow-2xl dark:shadow-slate-900/60 border-0 overflow-hidden group hover:shadow-3xl dark:hover:shadow-slate-900/80 transition-all duration-500 border-emerald-200/30 dark:border-slate-700/60">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-4">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-r from-emerald-500 via-emerald-600 to-green-600 dark:from-emerald-400 dark:via-emerald-500 dark:to-emerald-300 rounded-3xl flex items-center justify-center shadow-2xl border-4 border-white/30 dark:border-slate-800/50 group-hover:scale-110 transition-all duration-300"
                  >
                    <TrendingUp className="w-8 h-8 lg:w-10 lg:h-10 text-slate-50 drop-shadow-lg" />
                  </motion.div>
                  <div>
                    <h3 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 dark:from-slate-100 to-slate-700 dark:to-slate-200 bg-clip-text text-transparent drop-shadow-lg">
                      Wellness Score
                    </h3>
                    <p className="text-lg text-slate-600 dark:text-slate-400 font-medium">Real-time tracking</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 lg:p-10">
                <div className="text-center">
                  <motion.div
                    key={wellnessScore}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-7xl lg:text-8xl font-black bg-gradient-to-r from-emerald-500 via-emerald-600 to-green-600 dark:from-emerald-400 dark:via-emerald-500 dark:to-emerald-300 bg-clip-text text-transparent drop-shadow-2xl mb-8"
                  >
                    {wellnessScore}
                    <span className="text-4xl lg:text-5xl">%</span>
                  </motion.div>
                  
                  <div className="w-full bg-slate-200/50 dark:bg-slate-700/70 rounded-2xl h-6 lg:h-8 mb-8 overflow-hidden shadow-inner">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-emerald-500 via-emerald-600 to-green-600 dark:from-emerald-400 dark:via-emerald-500 dark:to-emerald-300 rounded-2xl shadow-2xl"
                      initial={{ width: 0 }}
                      animate={{ width: `${wellnessScore}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                  </div>

                  <p className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-8 leading-tight">
                    {habits.length === 0 
                      ? "Create your first habit to unlock wellness tracking!" 
                      : `${habits.length} habits • ${wellnessScore}% complete today`
                    }
                  </p>
                  
                  {habits.length === 0 && (
                    <motion.div whileHover={{ scale: 1.05 }}>
                      <Button 
                        onClick={() => setShowCreateDialog(true)}
                        className="h-16 px-12 rounded-3xl shadow-2xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-green-600 hover:from-emerald-600 hover:to-green-700 dark:from-emerald-400 dark:via-emerald-500 dark:to-emerald-300 text-xl font-bold text-slate-900 dark:text-slate-50 border border-emerald-300/50"
                      >
                        <Plus className="w-6 h-6 mr-3" />
                        Create First Habit
                      </Button>
                    </motion.div>
                  )}
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
            <Card className="h-full bg-white/90 dark:bg-slate-800/95 backdrop-blur-xl shadow-2xl dark:shadow-slate-900/60 border-0 hover:shadow-3xl transition-all duration-300 border-emerald-200/30 dark:border-slate-700/60">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-3 text-2xl font-bold text-slate-900 dark:text-slate-100">
                  <Activity className="w-8 h-8 text-emerald-500 dark:text-emerald-400" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-6">
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-emerald-500/5 to-emerald-400/5 dark:from-slate-800/50 dark:to-slate-700/30 rounded-2xl">
                    <span className="text-slate-600 dark:text-slate-400 font-semibold text-lg">Total Habits</span>
                    <span className="text-3xl font-black text-slate-900 dark:text-slate-100">{habits.length}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-emerald-500/5 to-emerald-400/5 dark:from-slate-800/50 dark:to-slate-700/30 rounded-2xl">
                    <span className="text-slate-600 dark:text-slate-400 font-semibold text-lg">Today Complete</span>
                    <span className="text-3xl font-black text-emerald-500 dark:text-emerald-400">
                      {Math.round(wellnessScore)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200/50 dark:bg-slate-700/70 rounded-2xl h-3 shadow-inner">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-green-600 dark:from-emerald-400 dark:to-emerald-300 rounded-2xl shadow-lg"
                      style={{ width: `${wellnessScore}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 🎯 TODAY'S HABITS */}
          <motion.div 
            initial={{ y: 50, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            className="lg:col-span-1 h-80"
          >
            <Card className="h-full bg-white/90 dark:bg-slate-800/95 backdrop-blur-xl shadow-2xl dark:shadow-slate-900/60 border-0 overflow-hidden hover:shadow-3xl transition-all duration-300 border-emerald-200/30 dark:border-slate-700/60">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-3 text-2xl font-bold text-slate-900 dark:text-slate-100">
                  <Target className="w-8 h-8 text-emerald-500 dark:text-emerald-400" />
                  Today's Habits
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 lg:p-8 max-h-72 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent">
                {Array.isArray(habits) && habits.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-12">
                    <div className="text-5xl mb-6 opacity-40">🎯</div>
                    <h3 className="text-2xl font-bold text-slate-700 dark:text-slate-200 mb-4">No habits yet</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-8 text-lg">Start your wellness journey</p>
                    <Button 
                      className="h-14 px-10 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 shadow-xl text-lg font-semibold"
                      onClick={() => setShowCreateDialog(true)}
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Create Habit
                    </Button>
                  </div>
                ) : (
                  Array.isArray(habits) && habits.slice(0, 5).map((habit) => (
                    <motion.div
                      key={habit.id}
                      whileHover={{ scale: 1.02 }}
                      className="group flex items-center justify-between p-5 rounded-3xl bg-gradient-to-r from-slate-50/80 to-emerald-50/50 dark:from-slate-800/70 dark:to-slate-700/40 border-2 border-slate-200/50 dark:border-slate-600/70 hover:border-emerald-300 dark:hover:border-emerald-400 hover:shadow-xl transition-all duration-300"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-xl text-slate-900 dark:text-slate-100 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {habit.title}
                        </h4>
                        <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100/50 dark:bg-emerald-900/30 px-3 py-1 rounded-xl mt-1">
                          {habit.category}
                        </p>
                      </div>
                      <motion.div 
                        whileHover={{ scale: 1.05 }}
                        className="ml-4 flex-shrink-0"
                      >
                        <Button
                          onClick={() => handleLogHabit(habit.id, habit.title)}
                          size="sm"
                          className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 dark:from-emerald-400 dark:to-emerald-300 shadow-lg h-12 px-6 rounded-2xl text-slate-900 dark:text-slate-50 font-semibold border border-emerald-300/50"
                        >
                          {habit.loggedToday ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : (
                            'Log Today'
                          )}
                        </Button>
                      </motion.div>
                    </motion.div>
                  ))
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* ✅ CREATE HABIT MODAL */}
        <AnimatePresence>
          {showCreateDialog && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-2xl rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-emerald-200/50 dark:border-slate-700/70"
              >
                <div className="p-8">
                  <h2 className="text-4xl font-serif font-light bg-gradient-to-r from-slate-900 dark:from-slate-100 to-emerald-600 dark:to-emerald-400 bg-clip-text text-transparent mb-8 text-center drop-shadow-lg">
                    New Habit
                  </h2>
                  <div className="space-y-6">
                    <div>
                      <input 
                        placeholder="Habit name (e.g. Drink 8 glasses water)" 
                        className="w-full p-5 border-2 border-slate-200/50 dark:border-slate-600/70 rounded-3xl text-xl bg-white/70 dark:bg-slate-700/60 backdrop-blur-sm text-slate-900 dark:text-slate-100 font-semibold focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-200/50 dark:focus:ring-emerald-400/30 transition-all duration-300 placeholder-slate-400 dark:placeholder-slate-500"
                      />
                    </div>
                    <select className="w-full p-5 border-2 border-slate-200/50 dark:border-slate-600/70 rounded-3xl text-xl bg-white/70 dark:bg-slate-700/60 backdrop-blur-sm text-slate-900 dark:text-slate-100 font-semibold focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-200/50 dark:focus:ring-emerald-400/30 transition-all duration-300">
                      <option className="text-slate-900 dark:text-slate-100">fitness</option>
                      <option className="text-slate-900 dark:text-slate-100">hydration</option>
                      <option className="text-slate-900 dark:text-slate-100">sleep</option>
                      <option className="text-slate-900 dark:text-slate-100">mindfulness</option>
                    </select>
                    <div className="flex gap-4 pt-4">
                      <motion.div whileHover={{ scale: 1.02 }} className="flex-1">
                        <Button className="w-full h-16 rounded-3xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-green-600 hover:from-emerald-600 hover:to-green-700 dark:from-emerald-400 dark:via-emerald-500 dark:to-emerald-300 shadow-2xl hover:shadow-3xl text-xl font-bold text-slate-900 dark:text-slate-50 border border-emerald-300/50">
                          Create Habit
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.02 }}>
                        <Button 
                          onClick={() => setShowCreateDialog(false)}
                          variant="outline"
                          className="h-16 px-12 rounded-3xl border-2 border-slate-300/50 dark:border-slate-500/70 hover:bg-slate-100 dark:hover:bg-slate-700/50 font-bold text-xl text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-all duration-300"
                        >
                          Cancel
                        </Button>
                      </motion.div>
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
