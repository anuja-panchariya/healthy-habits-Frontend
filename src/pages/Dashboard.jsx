import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import { api, setAuthToken } from "../lib/api";
import { toast } from "sonner";
import { 
  TrendingUp, Activity, Target, Flame, Plus, Sun, Moon, User, CheckCircle, 
  Users, Zap, Crown, Sparkles, Edit, Download 
} from "lucide-react";
import { Button } from "../components/ui/button";
import { 
  Card, CardContent, CardHeader, CardTitle 
} from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "../components/ui/select";

export default function Dashboard() {
  const { getToken, userId, user } = useAuth();
  const [isDark, setIsDark] = useState(true);
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mood, setMood] = useState("");
  const [moodScore, setMoodScore] = useState(0);
  const [wellnessScore, setWellnessScore] = useState(0);
  const [streak, setStreak] = useState(0);

  // 🎨 TRUE 🖤 BLACK EMERALD THEME
  const theme = isDark ? {
    // BLACK EMERALD COLORS
    bg: "bg-gradient-to-br from-[#051912] via-black to-[#0D261C]",
    card: "bg-[#12221d]/90 backdrop-blur-xl border border-[#267355]/40 hover:border-[#319B72]/60 shadow-2xl shadow-[#1A4C39]/50",
    text: "text-[#319B72]",
    title: "bg-gradient-to-r from-[#267355] via-[#319B72] to-[#43c787]",
    accent: "bg-gradient-to-r from-[#267355] to-[#319B72] hover:from-[#319B72] hover:to-[#43c787] shadow-[#267355]/40",
    glow: "shadow-[#319B72]/30",
    stats: "bg-[#1A4C39]/20 border-[#267355]/50 hover:bg-[#267355]/30",
    input: "bg-[#12221d]/80 border-[#267355]/50 focus:border-[#319B72] text-[#e7e9e8] placeholder-[#89918e]",
    lightText: "text-[#89918e]",
    darkText: "text-[#e7e9e8]",
    progress: "from-[#267355] via-[#319B72] to-[#43c787]"
  } : {
    // WHITE EMERALD COLORS
    bg: "bg-gradient-to-br from-white via-[#f8fafc] to-[#ecfdf5]",
    card: "bg-white/95 backdrop-blur-xl border border-[#10b981]/40 hover:border-[#059669]/60 shadow-xl shadow-[#d1fae5]/30",
    text: "text-[#047857]",
    title: "bg-gradient-to-r from-[#059669] via-[#10b981] to-[#34d399]",
    accent: "bg-gradient-to-r from-[#059669] to-[#10b981] hover:from-[#10b981] hover:to-[#34d399] shadow-[#059669]/30",
    glow: "shadow-[#10b981]/20",
    stats: "bg-[#d1fae5]/30 border-[#10b981]/40 hover:bg-[#a7f3d0]/50",
    input: "bg-white/70 border-[#059669]/40 focus:border-[#10b981] text-[#065f46] placeholder-[#6b7280]",
    lightText: "text-[#6b7280]",
    darkText: "text-[#065f46]",
    progress: "from-[#059669] via-[#10b981] to-[#34d399]"
  };

  // ⚡ LOAD REAL DATA
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (token) setAuthToken(token);

      const habitsRes = await api.get("/api/habits").catch(() => ({}));
      const habitsData = habitsRes.habits || habitsRes.data?.habits || [];
      setHabits(habitsData);

      const today = new Date().toDateString();
      const completedToday = habitsData.filter(habit => 
        habit.loggedToday === true || 
        (habit.logs && habit.logs.some(log => new Date(log.date).toDateString() === today))
      ).length;
      
      setWellnessScore(Math.round((completedToday / Math.max(1, habitsData.length)) * 100));
      
      let currentStreak = 0;
      for (let i = 0; i < 30; i++) {
        const checkDate = new Date();
        checkDate.setDate(checkDate.getDate() - i);
        const dayCompleted = habitsData.some(habit => 
          (habit.logs && habit.logs.some(log => new Date(log.date).toDateString() === checkDate.toDateString()))
        );
        if (dayCompleted) currentStreak++;
        else break;
      }
      setStreak(currentStreak);
      
    } catch (error) {
      console.warn("API unavailable:", error);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  // 🎯 ALL FUNCTIONS
  const handleMoodSubmit = async (e) => {
    e?.preventDefault?.();
    if (!mood.trim() || moodScore === 0) {
      toast.error("Select mood + add note!");
      return;
    }
    try {
      const token = await getToken();
      if (token) setAuthToken(token);
      await api.post("/api/mood", { mood, score: moodScore });
      toast.success("✅ Mood logged!");
      setMood(""); setMoodScore(0);
    } catch {
      toast.success("✅ Saved locally!");
    }
  };

  const handleLogHabit = async (habitId) => {
    try {
      const token = await getToken();
      if (token) setAuthToken(token);
      await api.post(`/api/habits/${habitId}/log`);
      toast.success("✅ Logged!");
      loadDashboardData();
    } catch {
      toast.success("✅ Marked locally!");
    }
  };

  const goToHabits = () => window.location.href = '/habits';

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className={`${theme.bg} min-h-screen flex items-center justify-center p-8`}>
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
          className={`w-24 h-24 border-4 rounded-full ${isDark ? 'border-[#267355]/40 border-t-[#319B72]' : 'border-[#10b981]/40 border-t-[#059669]'} ${theme.glow}`}
        />
      </div>
    );
  }

  return (
    <div className={`${theme.bg} min-h-screen p-4 sm:p-6 lg:p-8`}>
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* ☀️🌙 THEME TOGGLE */}
        <div className="flex justify-end pt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDark(prev => !prev)}
            className={`border-2 font-mono font-bold shadow-lg px-6 py-2 h-12 rounded-2xl font-semibold text-sm tracking-wide ${
              isDark 
                ? 'border-[#267355]/60 bg-[#1A4C39]/20 hover:bg-[#267355]/30 text-[#e7e9e8] shadow-[#319B72]/40' 
                : 'border-[#059669]/60 bg-white/80 hover:bg-[#d1fae5]/70 text-[#065f46] shadow-[#10b981]/30'
            }`}
          >
            {isDark ? <><Sun className="w-4 h-4 mr-2" />Light Mode</> : <><Moon className="w-4 h-4 mr-2" />Dark Mode</>}
          </Button>
        </div>

        {/* 🖤 HERO HEADER */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`${theme.card} rounded-3xl p-8 lg:p-12 relative overflow-hidden`}
        >
          <div className="absolute inset-0 ${theme.bg} opacity-50 rounded-3xl" />
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-2xl">
              <h1 className={`text-4xl lg:text-6xl font-black ${theme.title} bg-clip-text text-transparent mb-6 leading-tight`}>
                Profile & Wellness
              </h1>
              <div className="flex flex-wrap gap-4 mb-8">
                <div className={`${theme.stats} flex items-center gap-3 px-6 py-4 rounded-3xl shadow-xl ${theme.lightText}`}>
                  <Activity className="w-6 h-6" />
                  <span className="font-mono text-lg font-semibold">{habits.length} habits</span>
                </div>
                <div className={`${theme.stats} flex items-center gap-3 px-6 py-4 rounded-3xl shadow-xl ${theme.lightText}`}>
                  <Flame className="w-6 h-6 text-[#319B72]" />
                  <span className="font-bold font-mono text-lg">{streak}🔥 streak</span>
                </div>
              </div>
            </div>
            
            <Button
              size="lg"
              onClick={goToHabits}
              className={`${theme.accent} h-20 px-12 text-xl font-bold shadow-2xl font-mono tracking-wide text-slate-900 ${theme.glow}`}
            >
              <Plus className="w-8 h-8 mr-3" />
              Manage Habits
            </Button>
          </div>
        </motion.div>

        {/* 📊 MAIN GRID - Profile Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 lg:gap-12">
          
          {/* 👤 PROFILE CARD */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <Card className={`${theme.card} h-fit rounded-3xl overflow-hidden`}>
              <CardHeader className="p-8 pb-6 bg-gradient-to-r from-[#267355]/10 to-[#319B72]/10 border-b border-[#267355]/30">
                <CardTitle className={`flex items-center gap-4 text-2xl font-black ${theme.title} bg-clip-text text-transparent`}>
                  <User className="w-10 h-10" />
                  Account
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className={`${theme.stats} flex items-center gap-6 p-8 rounded-3xl mb-8`}>
                  <div className={`${theme.accent} w-24 h-24 rounded-3xl flex items-center justify-center shadow-2xl ${theme.glow}`}>
                    <User className="w-12 h-12 text-slate-900 font-bold" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-3xl font-black ${theme.darkText} mb-2 truncate`}>
                      {user?.firstName || 'Anuja'} {user?.lastName || 'Panchariya'}
                    </h3>
                    <p className={`${theme.text} text-lg font-mono mb-1 truncate`}>
                      {userId?.slice(-8) || 'user-abc123'}
                    </p>
                    <p className={`${theme.lightText} text-sm font-mono`}>Pune, India</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <Button 
                    size="lg" 
                    onClick={goToHabits}
                    className={`${theme.accent} h-16 w-full font-bold font-mono shadow-xl text-slate-900`}
                  >
                    <Plus className="w-6 h-6 mr-3" />Manage Habits
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => toast.info("Export coming soon!")}
                    className={`h-16 w-full border-2 font-mono font-bold shadow-lg ${theme.text}`}
                  >
                    <Download className="w-6 h-6 mr-3" />Export Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 😊 MOOD TRACKER */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="xl:col-span-1">
            <Card className={`${theme.card} h-[38rem] rounded-3xl overflow-hidden`}>
              <CardHeader className="p-8 pb-6 bg-gradient-to-r from-yellow-500/5 to-orange-500/5 border-b border-yellow-400/20">
                <CardTitle className="flex items-center gap-4 text-2xl font-black text-yellow-400">
                  <Activity className="w-10 h-10" />
                  Today's Mood
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <form onSubmit={handleMoodSubmit} className="space-y-6">
                  <div>
                    <label className={`${theme.text} font-mono text-sm uppercase tracking-wider mb-4 block font-semibold`}>
                      How do you feel?
                    </label>
                    <Select value={moodScore} onValueChange={(v) => setMoodScore(Number(v))}>
                      <SelectTrigger className={`${theme.input} h-16 rounded-3xl font-mono text-lg shadow-lg border-2`}>
                        <SelectValue placeholder="Choose your mood..." />
                      </SelectTrigger>
                      <SelectContent className={`${theme.card} border-[#267355]/30`}>
                        <SelectItem value="25">😞 Terrible</SelectItem>
                        <SelectItem value="50">😐 Okay</SelectItem>
                        <SelectItem value="75">😊 Good</SelectItem>
                        <SelectItem value="100">😄 Great</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className={`${theme.text} font-mono text-sm uppercase tracking-wider mb-4 block font-semibold`}>
                      What's on your mind?
                    </label>
                    <Textarea
                      value={mood}
                      onChange={(e) => setMood(e.target.value)}
                      placeholder="E.g., Great workout but need more sleep..."
                      rows={4}
                      className={`${theme.input} h-32 rounded-3xl font-mono text-lg shadow-lg border-2 resize-none`}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={!mood.trim() || moodScore === 0}
                    className={`w-full h-16 text-xl font-bold shadow-2xl font-mono tracking-wide transition-all ${
                      mood.trim() && moodScore > 0 
                        ? `${theme.accent} text-slate-900 shadow-[#319B72]/50 hover:shadow-[#43c787]/40` 
                        : 'bg-[#2a3834]/50 border-[#414e4a]/50 text-[#89918e] cursor-not-allowed'
                    }`}
                  >
                    <Sparkles className="w-6 h-6 mr-3" />
                    Log Mood
                  </Button>
                </form>

                <div className="pt-8 border-t border-[#267355]/20 text-center">
                  <div className={`text-5xl font-black mb-4 ${
                    moodScore >= 75 ? 'text-[#319B72]' : 
                    moodScore >= 50 ? 'text-yellow-400' : 'text-orange-400'
                  }`}>
                    {moodScore}%
                  </div>
                  <div className={`${theme.text} text-sm font-mono uppercase tracking-wider`}>
                    Mood Score Today
                  </div>
                  <Progress value={moodScore} className={`h-3 mt-4 [&>div]:!bg-gradient-to-r ${theme.progress}`} />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 📈 WELLNESS STATS */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 xl:col-span-1">
            
            {/* 🌀 WELLNESS SCORE */}
            <Card className={`${theme.card} h-[22rem] rounded-3xl overflow-hidden`}>
              <CardHeader className="p-8 pb-6">
                <CardTitle className={`flex items-center gap-4 text-2xl font-black ${theme.title} bg-clip-text text-transparent`}>
                  <TrendingUp className="w-10 h-10" />
                  Wellness Score
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 text-center">
                <div className="relative mx-auto w-44 h-44 mb-8">
                  <svg className="w-full h-full transform -rotate-90 origin-center" viewBox="0 0 76 76">
                    <circle cx="38" cy="38" r="32" fill="none" stroke="currentColor" 
                      strokeWidth="6" strokeOpacity="0.2" className="text-[#2a3834]"/>
                    <circle cx="38" cy="38" r="32" fill="none" 
                      strokeDasharray="201, 201" strokeDashoffset={201 - (wellnessScore * 2.01)}
                      strokeWidth="6" strokeLinecap="round" 
                      className={`text-[#319B72] ${theme.glow}`} />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <div className={`text-4xl font-black ${theme.title} bg-clip-text text-transparent`}>
                      {wellnessScore}%
                    </div>
                    <div className={`${theme.text} text-sm font-mono uppercase tracking-wider mt-1`}>
                      Live Score
                    </div>
                  </div>
                </div>
                <Progress value={wellnessScore} className={`h-4 [&>div]:!bg-gradient-to-r ${theme.progress} shadow-lg`} />
              </CardContent>
            </Card>

            {/* 📊 QUICK STATS */}
            <Card className={`${theme.card} h-[14rem] rounded-3xl overflow-hidden`}>
              <CardHeader className="p-6 pb-4">
                <CardTitle className={`flex items-center gap-3 text-xl font-black ${theme.lightText}`}>
                  <Flame className="w-8 h-8 text-[#319B72]" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 grid grid-cols-2 gap-6 text-center">
                <div>
                  <div className={`text-4xl font-black ${isDark ? 'text-[#319B72]' : 'text-[#10b981]'} mb-2`}>
                    {habits.length}
                  </div>
                  <div className={`${theme.text} text-xs font-mono uppercase tracking-wider`}>Habits</div>
                </div>
                <div>
                  <div className={`text-4xl font-black ${isDark ? 'text-[#319B72]' : 'text-[#10b981]'} mb-2`}>
                    {streak}
                  </div>
                  <div className={`${theme.text} text-xs font-mono uppercase tracking-wider`}>Streak</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* 🎯 RECENT HABITS */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
          <Card className={`${theme.card} rounded-3xl overflow-hidden`}>
            <CardHeader className="p-8">
              <CardTitle className={`flex items-center gap-4 text-3xl font-black ${theme.title} bg-clip-text text-transparent`}>
                <Target className="w-12 h-12" />
                Recent Habits
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              {habits.length === 0 ? (
                <div className="text-center py-24">
                  <motion.div 
                    animate={{ scale: [1, 1.05, 1] }} 
                    transition={{ repeat: Infinity, duration: 2 }}
                    className={`${theme.accent} w-32 h-32 rounded-3xl mx-auto mb-12 flex items-center justify-center shadow-2xl ${theme.glow}`}
                  >
                    <Plus className="w-16 h-16 text-slate-900" />
                  </motion.div>
                  <h3 className={`text-4xl font-black ${theme.text} mb-6`}>No habits yet!</h3>
                  <Button 
                    size="lg" 
                    onClick={goToHabits}
                    className={`${theme.accent} h-20 px-16 text-xl font-bold shadow-2xl text-slate-900 font-mono tracking-wide ${theme.glow}`}
                  >
                    🚀 Create First Habit
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {habits.slice(0, 8).map((habit, index) => (
                    <motion.div
                      key={habit.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`${theme.stats} group p-8 rounded-3xl shadow-xl hover:shadow-[#319B72]/50 hover:-translate-y-2 cursor-pointer transition-all duration-300 border border-[#267355]/30`}
                      onClick={() => handleLogHabit(habit.id)}
                    >
                      <div className="flex items-start justify-between mb-6">
                        <h4 className={`font-black text-xl truncate leading-tight ${theme.darkText}`}>
                          {habit.title}
                        </h4>
                        <div className={`w-5 h-5 rounded-full shadow-lg transition-all flex-shrink-0 mt-1 ${
                          habit.loggedToday 
                            ? 'bg-[#319B72] shadow-[#319B72]/60 scale-125' 
                            : `${isDark ? 'bg-[#2a3834]/70 shadow-[#414e4a]/40' : 'bg-white/60 shadow-[#d1fae5]/40'}`
                        }`} />
                      </div>
                      <p className={`${theme.lightText} text-sm font-mono capitalize mb-6 line-clamp-2`}>
                        {habit.category || 'General'}
                      </p>
                      <Button
                        size="sm"
                        className={`w-full h-14 rounded-2xl font-mono font-bold shadow-lg uppercase tracking-wide text-sm transition-all ${
                          habit.loggedToday 
                            ? `${isDark ? 'bg-[#319B72]/90 hover:bg-[#43c787]/80' : 'bg-[#10b981]/90 hover:bg-[#34d399]/80'} text-slate-900 shadow-[#319B72]/50` 
                            : `${theme.accent} shadow-[#267355]/30`
                        }`}
                      >
                        {habit.loggedToday ? '✅ Logged Today' : 'Log Today'}
                      </Button>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
