import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@clerk/clerk-react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  TrendingUp, Activity, Target, Plus, Sun, Moon, CheckCircle 
} from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { Switch } from "../components/ui/switch";
import { api, setAuthToken } from "../lib/api";
import { toast } from "sonner";

export default function Dashboard() {
  const { getToken, userId } = useAuth();
  const [isDark, setIsDark] = useState(false);
  const [habits, setHabits] = useState([]);
  const [wellnessScore, setWellnessScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // 🎯 THEME CONTROL
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

  const calculateWellnessScore = useCallback((habitsData) => {
    if (!habitsData?.length) return 0;
    const completedToday = habitsData.filter(habit => habit.loggedToday).length;
    return Math.round((completedToday / habitsData.length) * 100);
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-slate-200 dark:border-slate-600 border-t-emerald-500 dark:border-t-slate-300 rounded-full" 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 sm:p-6 lg:p-8 transition-all duration-300">
      <div className="max-w-7xl mx-auto space-y-8 relative">
        
        {/* 🌙 THEME TOGGLE */}
        <div className="absolute top-6 right-6 z-50 flex items-center gap-2 p-3 rounded-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-600 shadow-xl">
          <Sun className={`w-5 h-5 transition-colors ${isDark ? 'text-slate-500' : 'text-yellow-500'}`} />
          <Switch checked={isDark} onCheckedChange={toggleDarkMode} />
          <Moon className={`w-5 h-5 transition-colors ${isDark ? 'text-yellow-400' : 'text-slate-500'}`} />
        </div>

        {/* ✨ HEADER */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6"
        >
          <div>
            <h1 className="font-serif font-light text-5xl lg:text-6xl tracking-tight bg-gradient-to-r from-gray-900 dark:from-slate-100 to-emerald-600 dark:to-slate-300 bg-clip-text text-transparent mb-2">
              Wellness Dashboard
            </h1>
            <p className="text-xl text-gray-700 dark:text-slate-200">
              Your Score: 
              <span className={`font-black text-3xl ml-2 text-emerald-500 dark:text-emerald-400`}>
                {wellnessScore}%
              </span>
            </p>
          </div>
          
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="h-14 px-8 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 dark:from-slate-300 dark:to-white dark:hover:from-slate-200 shadow-xl text-lg font-semibold text-slate-900 dark:text-slate-900"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Habit
          </Button>
        </motion.div>

        {/* 📊 MAIN BENTO GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* 🌀 MAIN WELLNESS CARD */}
          <motion.div className="lg:col-span-2 xl:col-span-2 h-72" initial={{ y: 50 }} animate={{ y: 0 }}>
            <Card className="h-full bg-white/80 dark:bg-slate-800/90 backdrop-blur-sm shadow-2xl dark:shadow-3xl border-0 overflow-hidden group hover:shadow-3xl dark:hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] transition-all">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 20, repeat: Infinity }}
                    className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-green-600 dark:from-slate-400 dark:to-slate-300 rounded-2xl flex items-center justify-center shadow-2xl"
                  >
                    <TrendingUp className="w-7 h-7 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Wellness Score</h3>
                    <p className="text-sm text-gray-600 dark:text-slate-400">Real-time calculation</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="text-center">
                  <motion.div
                    className="text-6xl font-black bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 dark:from-slate-300 dark:via-slate-200 dark:to-slate-400 bg-clip-text text-transparent mb-6"
                  >
                    {wellnessScore}<span className="text-3xl">%</span>
                  </motion.div>
                  
                  <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-4 mb-6 overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-green-600 dark:from-slate-400 dark:to-slate-300 rounded-full shadow-lg"
                      initial={{ width: 0 }}
                      animate={{ width: `${wellnessScore}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                  </div>

                  <p className="text-xl font-semibold text-gray-800 dark:text-slate-200 mb-4">
                    {habits.length === 0 
                      ? "Create your first habit to start tracking!" 
                      : `${habits.length} habits • ${wellnessScore}% complete`
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 📈 QUICK STATS */}
          <motion.div initial={{ y: 50 }} animate={{ y: 0 }} className="lg:col-span-1 h-72">
            <Card className="h-full bg-white/80 dark:bg-slate-800/90 shadow-2xl dark:shadow-3xl border-0 backdrop-blur-sm hover:shadow-3xl dark:hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.4)] transition-all">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl text-gray-900 dark:text-white">
                  <Activity className="w-6 h-6 text-emerald-600 dark:text-slate-300" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-slate-400 font-medium">Total Habits</span>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">{habits.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-slate-400 font-medium">Today Complete</span>
                    <span className={`text-2xl font-bold text-emerald-600 dark:text-emerald-400`}>
                      {wellnessScore}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-emerald-500 to-green-600 dark:from-slate-400 dark:to-slate-300 h-2 rounded-full"
                      style={{ width: `${wellnessScore}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 🎯 TODAY'S HABITS */}
          <motion.div initial={{ y: 50 }} animate={{ y: 0 }} className="lg:col-span-1 h-72">
            <Card className="h-full bg-white/80 dark:bg-slate-800/90 shadow-2xl dark:shadow-3xl border-0 overflow-hidden backdrop-blur-sm hover:shadow-3xl transition-all">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-white">
                  <Target className="w-6 h-6 text-emerald-600 dark:text-slate-300" />
                  Today's Habits
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 max-h-64 overflow-y-auto space-y-3">
                {habits.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-8">
                    <div className="text-4xl mb-4 opacity-40">🎯</div>
                    <h3 className="text-xl font-bold text-gray-700 dark:text-slate-200 mb-2">No habits yet</h3>
                    <Button 
                      className="h-12 px-8 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 dark:from-slate-300 dark:to-white dark:hover:from-slate-200 shadow-xl"
                      onClick={() => setShowCreateDialog(true)}
                    >
                      Create Habit
                    </Button>
                  </div>
                ) : (
                  habits.slice(0, 6).map((habit) => (
                    <motion.div
                      key={habit.id}
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-gray-50 to-emerald-50/30 dark:from-slate-700/50 dark:to-slate-600/20 border border-emerald-100 dark:border-slate-600 hover:shadow-md transition-all"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-lg text-gray-900 dark:text-white truncate">{habit.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-slate-400 capitalize">{habit.category}</p>
                      </div>
                      <Button
                        size="sm"
                        className="ml-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 dark:from-slate-300 dark:to-white dark:hover:from-slate-200 shadow-lg h-10 px-4 rounded-xl"
                      >
                        Log Today
                      </Button>
                    </motion.div>
                  ))
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* ✅ CREATE HABIT MODAL */}
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
                className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-600"
              >
                <div className="p-8">
                  <h2 className="text-3xl font-serif font-light bg-gradient-to-r from-gray-900 dark:from-slate-100 to-emerald-600 dark:to-slate-300 bg-clip-text text-transparent mb-6 text-center">
                    New Habit
                  </h2>
                  <div className="space-y-4">
                    <input 
                      placeholder="Habit name (e.g. Drink water)" 
                      className="w-full p-4 border-2 border-gray-200 dark:border-slate-600 rounded-2xl text-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100 dark:focus:ring-slate-400 transition-all"
                    />
                    <select className="w-full p-4 border-2 border-gray-200 dark:border-slate-600 rounded-2xl text-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-none">
                      <option>fitness</option>
                      <option>hydration</option>
                      <option>sleep</option>
                      <option>mindfulness</option>
                    </select>
                    <div className="flex gap-3 pt-2">
                      <Button className="flex-1 h-14 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 dark:from-slate-300 dark:to-white dark:hover:from-slate-200 shadow-xl font-semibold text-lg text-slate-900 dark:text-slate-900">
                        Create Habit
                      </Button>
                      <Button 
                        onClick={() => setShowCreateDialog(false)}
                        className="h-14 px-8 rounded-2xl border-2 border-gray-300 dark:border-slate-500 hover:bg-gray-50 dark:hover:bg-slate-700 font-semibold text-lg text-gray-700 dark:text-slate-200"
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
    </div>
  );
}
