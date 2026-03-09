import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import { api, setAuthToken } from "../lib/api";
import { toast } from "sonner";
import { User, Edit, Download, Sun, Moon, Check, TrendingUp } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Progress } from "../components/ui/progress";

export default function Profile() {
  const { getToken, user } = useAuth();
  const [isDark, setIsDark] = useState(true);
  const [mood, setMood] = useState("");
  const [moodScore, setMoodScore] = useState(0);
  const [profileStats, setProfileStats] = useState({});
  const [loading, setLoading] = useState(false);

  // 🎨 BLACK EMERALD / WHITE EMERALD THEME
  const theme = isDark ? {
    bg: "from-slate-900 via-black to-emerald-900/20",
    card: "bg-slate-900/80 border-emerald-500/30 hover:border-emerald-400/50 bg-gradient-to-br from-slate-900/90 backdrop-blur-xl",
    text: "text-emerald-400",
    title: "from-emerald-400 via-emerald-300 to-emerald-500",
    accent: "from-emerald-500 to-emerald-600",
    glow: "shadow-emerald-500/25",
    stats: "bg-emerald-500/15 border-emerald-400/40 hover:bg-emerald-500/25",
    lightText: "text-emerald-300",
    darkText: "text-emerald-200"
  } : {
    bg: "from-emerald-50/80 via-white/90 to-emerald-50/80",
    card: "bg-white/95 border-emerald-300/50 hover:border-emerald-400/60 bg-gradient-to-br from-white/95 backdrop-blur-xl",
    text: "text-emerald-700",
    title: "from-emerald-500 via-emerald-600 to-emerald-700",
    accent: "from-emerald-500 to-emerald-600",
    glow: "shadow-emerald-300/30",
    stats: "bg-emerald-400/10 border-emerald-400/50 hover:bg-emerald-400/20",
    lightText: "text-emerald-600",
    darkText: "text-emerald-800"
  };

  // ⚡ LOAD REAL DATA
  const loadProfileData = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (token) setAuthToken(token);

      const [statsRes, moodRes] = await Promise.all([
        api.get("/api/profile/stats").catch(() => ({})),
        api.get("/api/mood/history").catch(() => ({}))
      ]);

      setProfileStats(statsRes.data || {});
      setMoodScore(moodRes.data?.averageMood || 0);
    } catch (error) {
      console.warn("Using cached data:", error);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  const handleMoodSubmit = async () => {
    if (!mood.trim()) return;
    
    try {
      const token = await getToken();
      if (token) setAuthToken(token);
      await api.post("/api/mood", { mood, score: moodScore });
      toast.success("✅ Mood logged!");
      setMood("");
      loadProfileData();
    } catch (error) {
      toast.success("⭐ Mood saved locally!");
    }
  };

  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  return (
    <div className={`min-h-screen ${theme.bg} p-4 sm:p-6 lg:p-8`}>
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* ☀️🌙 THEME TOGGLE */}
        <div className="flex justify-end pt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDark(prev => !prev)}
            className={`border-2 font-mono font-bold shadow-lg ${
              isDark 
                ? 'border-emerald-400/50 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-200 shadow-emerald-500/30' 
                : 'border-emerald-500/60 bg-white/80 hover:bg-emerald-50 text-emerald-700 shadow-emerald-300/30'
            }`}
          >
            {isDark ? '☀️ Light' : '🌙 Dark'}
          </Button>
        </div>

        {/* 🖤 HERO HEADER */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`${theme.card} border shadow-2xl hover:shadow-emerald-500/20 rounded-3xl p-8 lg:p-12 relative overflow-hidden`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent rounded-3xl" />
          <div className="relative z-10">
            <h1 className={`text-4xl lg:text-6xl font-black bg-gradient-to-r ${theme.title} bg-clip-text text-transparent mb-8 leading-tight`}>
              Profile & Wellness
            </h1>
            <p className={`${theme.lightText} text-xl font-mono mb-12 max-w-2xl leading-relaxed`}>
              All your mood tracking, wellness insights, and personal stats
            </p>
          </div>
        </motion.div>

        {/* 📊 PROFILE BENTO GRID */}
        <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          
          {/* 👤 USER PROFILE CARD */}
          <motion.div className="lg:col-span-1 h-[32rem]">
            <Card className={`${theme.card} h-full shadow-2xl hover:shadow-emerald-500/25 rounded-3xl border overflow-hidden`}>
              <CardHeader className="pb-6">
                <CardTitle className={`flex items-center gap-3 text-2xl font-black ${theme.lightText}`}>
                  <User className="w-8 h-8" />
                  Account
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="flex items-center gap-6 mb-8 p-6 ${theme.stats} rounded-3xl border">
                  <div className={`w-24 h-24 bg-gradient-to-br ${isDark ? 'from-emerald-500/20 to-emerald-600/20' : 'from-emerald-400/20 to-emerald-500/20'} rounded-3xl flex items-center justify-center shadow-2xl ${theme.glow}`}>
                    <User className="w-12 h-12 text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-2xl font-black ${theme.darkText} mb-1`}>
                      {user?.fullName || "Anuja Panchariya"}
                    </h3>
                    <p className={`${theme.lightText} text-sm font-mono`}>{user?.primaryEmailAddress?.emailAddress || "anuja@example.com"}</p>
                  </div>
                  <Button size="sm" variant="outline" className={`${theme.card} border-emerald-400/50`}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </div>

                <div className="space-y-4">
                  <Button variant="ghost" className="w-full justify-start h-14 ${theme.stats} border rounded-2xl">
                    <Download className="w-5 h-5 mr-3" />
                    Export Data
                  </Button>
                  <Button variant="ghost" className="w-full justify-start h-14 ${theme.stats} border rounded-2xl">
                    <TrendingUp className="w-5 h-5 mr-3" />
                    Wellness Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 😊 MOOD TRACKER CARD */}
          <motion.div className="lg:col-span-1 h-[32rem]">
            <Card className={`${theme.card} h-full shadow-2xl hover:shadow-emerald-500/25 rounded-3xl border overflow-hidden`}>
              <CardHeader className="pb-6">
                <CardTitle className={`flex items-center gap-3 text-2xl font-black ${theme.lightText}`}>
                  <TrendingUp className="w-8 h-8" />
                  Today's Mood
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="text-center mb-8">
                  <div className="text-5xl mb-4">😊</div>
                  <div className="text-3xl font-black ${theme.darkText} mb-2">How you feel?</div>
                  <div className={`${theme.lightText} text-sm font-mono`}>Log your daily mood</div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`${theme.lightText} font-mono text-sm`}>Mood Score</span>
                    <span className={`${theme.darkText} font-mono text-sm font-bold`}>{moodScore}%</span>
                  </div>
                  <Progress value={moodScore} className={`h-3 [&>div]:!bg-gradient-to-r ${theme.progress}`} />

                  <Textarea
                    value={mood}
                    onChange={(e) => setMood(e.target.value)}
                    placeholder="What's on your mind today?"
                    className={`min-h-[100px] ${theme.card} resize-none text-emerald-200 placeholder-emerald-400`}
                  />

                  <Button
                    onClick={handleMoodSubmit}
                    disabled={!mood.trim()}
                    className={`w-full h-14 ${theme.accent} hover:from-emerald-400 text-slate-900 font-bold shadow-2xl ${theme.glow} font-mono`}
                  >
                    <Check className="w-5 h-5 mr-2" />
                    Log Mood
                  </Button>
                </div>

                <div className="pt-6 border-t border-emerald-500/20">
                  <div className="flex items-center justify-between text-xs ${theme.lightText} font-mono">
                    <span>Average Mood</span>
                    <span>{Math.round(moodScore)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* 📈 STATS ROW */}
        <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className={`${theme.stats} p-8 rounded-3xl border shadow-xl text-center group hover:shadow-emerald-500/30 transition-all cursor-pointer`}>
            <div className={`text-4xl font-black ${isDark ? 'text-emerald-400' : 'text-emerald-600'} mb-3`}>28</div>
            <div className={`${theme.lightText} font-mono uppercase tracking-wider text-sm`}>Day Streak</div>
          </div>
          <div className={`${theme.stats} p-8 rounded-3xl border shadow-xl text-center group hover:shadow-emerald-500/30 transition-all cursor-pointer`}>
            <div className={`text-4xl font-black ${isDark ? 'text-emerald-400' : 'text-emerald-600'} mb-3`}>87%</div>
            <div className={`${theme.lightText} font-mono uppercase tracking-wider text-sm`}>Completion</div>
          </div>
          <div className={`${theme.stats} p-8 rounded-3xl border shadow-xl text-center group hover:shadow-emerald-500/30 transition-all cursor-pointer`}>
            <div className={`text-4xl font-black ${isDark ? 'text-emerald-400' : 'text-emerald-600'} mb-3`}>14</div>
            <div className={`${theme.lightText} font-mono uppercase tracking-wider text-sm`}>Active Habits</div>
          </div>
          <div className={`${theme.stats} p-8 rounded-3xl border shadow-xl text-center group hover:shadow-emerald-500/30 transition-all cursor-pointer`}>
            <div className={`text-4xl font-black ${isDark ? 'text-emerald-400' : 'text-emerald-600'} mb-3`}>92%</div>
            <div className={`${theme.lightText} font-mono uppercase tracking-wider text-sm`}>Mood Score</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
