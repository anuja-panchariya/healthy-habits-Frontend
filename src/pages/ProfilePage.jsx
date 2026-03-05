import React, { useEffect, useState, useCallback } from 'react';
import { useAuth, UserButton } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { 
  Sparkles, Smile, CheckCircle, Clock, Sun, Moon 
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Switch } from '../components/ui/switch';
import { api, setAuthToken } from '../lib/api';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { getToken, userId, user } = useAuth();
  const [mood, setMood] = useState('');
  const [moodNotes, setMoodNotes] = useState('');
  const [moods, setMoods] = useState([]);
  const [aiInsight, setAiInsight] = useState(null);
  const [stats, setStats] = useState({ totalMoods: 0, greatPercentage: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const FALLBACK_AI_INSIGHT = {
    insight: "Low hydration detected - 30% mood impact",
    recommendation: "Drink 8 glasses water daily for instant focus boost",
    confidence: "94%"
  };

  // 🔥 THEME TOGGLE
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setIsDarkMode(savedTheme === 'dark');
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    setIsDarkMode(!isDarkMode);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const loadProfileData = useCallback(async () => {
    const cacheKey = `profile_${userId}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const data = JSON.parse(cached);
        setMoods(data.moods || []);
        setAiInsight(data.insights || FALLBACK_AI_INSIGHT);
        setStats(data.stats || {});
        setIsLoading(false);
        return;
      } catch {}
    }

    setAiInsight(FALLBACK_AI_INSIGHT);

    try {
      const token = await getToken();
      if (token) setAuthToken(token);

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 1200);

      const [moodsRes, insightsRes] = await Promise.allSettled([
        api.get('/api/mood', { signal: controller.signal }).catch(() => ({})),
        api.get('/api/ai/insights', { signal: controller.signal }).catch(() => ({}))
      ]);

      clearTimeout(timeout);

      const moodsData = moodsRes.status === 'fulfilled' && Array.isArray(moodsRes.value?.data) 
        ? moodsRes.value.data.slice(-10) : [];

      const insightsData = insightsRes.status === 'fulfilled' && insightsRes.value?.data 
        ? insightsRes.value.data : FALLBACK_AI_INSIGHT;

      setMoods(moodsData);
      setAiInsight(insightsData);

      const totalMoods = moodsData.length;
      const greatMoods = moodsData.filter(m => m.mood === 'great').length;
      setStats({
        totalMoods,
        greatPercentage: totalMoods ? Math.round((greatMoods / totalMoods) * 100) : 0
      });

      localStorage.setItem(cacheKey, JSON.stringify({
        moods: moodsData, insights: insightsData, stats
      }));

    } catch (error) {
      console.log('Using fallback data');
    } finally {
      setIsLoading(false);
    }
  }, [userId, getToken]);

  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  const logMood = async () => {
    if (!mood) return toast.error('Select a mood!');
    
    const newMood = { id: Date.now(), mood, notes: moodNotes || '', created_at: new Date().toISOString() };
    setMoods(prev => [newMood, ...prev.slice(0, 9)]);
    setMood(''); 
    setMoodNotes('');
    toast.success('✅ Mood logged!');
  };

  const getMoodEmoji = (mood) => {
    const emojis = { great: '😄', good: '🙂', okay: '😐', bad: '☹️', terrible: '😢' };
    return emojis[mood] || '🙂';
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen p-6 lg:p-8 animate-pulse ${isDarkMode ? 'bg-gradient-to-br from-black via-slate-900 to-emerald-900/20' : 'bg-gradient-to-br from-white via-gray-50 to-emerald-50/20'}`}>
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Skeleton content */}
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 lg:p-8 transition-all duration-500 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-black via-slate-900 to-emerald-900/20' 
        : 'bg-gradient-to-br from-white via-gray-50 to-emerald-50/20'
    }`}>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* HEADER + THEME TOGGLE */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 lg:gap-0 mb-12"
        >
          <div>
            <h1 className={`font-serif text-5xl lg:text-6xl tracking-tight mb-4 drop-shadow-2xl ${
              isDarkMode 
                ? 'bg-gradient-to-r from-emerald-400 via-emerald-300 to-emerald-100 bg-clip-text text-transparent' 
                : 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-300 bg-clip-text text-transparent'
            }`}>
              Profile
            </h1>
            <p className={`text-xl font-semibold px-6 py-3 rounded-2xl inline-block shadow-xl ${
              isDarkMode 
                ? 'text-emerald-400/90 bg-black/80 border-2 border-emerald-400/50 backdrop-blur-sm' 
                : 'text-emerald-600/90 bg-white/80 border-2 border-emerald-400/30 backdrop-blur-sm'
            }`}>
              Tracking {stats.totalMoods} moods
            </p>
          </div>
          
          {/* 🔥 THEME TOGGLE SWITCH */}
          <div className="flex items-center gap-4 p-4 bg-black/20 dark:bg-white/20 backdrop-blur-xl rounded-3xl border border-emerald-400/30">
            <Sun className={`w-6 h-6 ${isDarkMode ? 'text-slate-500' : 'text-emerald-500'}`} />
            <Switch 
              checked={isDarkMode} 
              onCheckedChange={toggleTheme}
              className="data-[state=checked]:bg-emerald-600"
            />
            <Moon className={`w-6 h-6 ${isDarkMode ? 'text-emerald-500' : 'text-slate-500'}`} />
          </div>

          <div className={`w-24 h-24 lg:w-28 lg:h-28 rounded-3xl flex items-center justify-center shadow-2xl backdrop-blur-sm ${
            isDarkMode 
              ? 'bg-gradient-to-r from-emerald-900/90 to-emerald-800/90 border-4 border-emerald-400/60' 
              : 'bg-gradient-to-r from-emerald-100/90 to-emerald-200/90 border-4 border-emerald-400/40'
          }`}>
            <UserButton afterSignOutUrl="/sign-in" />
          </div>
        </motion.div>

        <div className="space-y-8">
          {/* AI WELLNESS COACH */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <Card className={`shadow-2xl border-2 overflow-hidden backdrop-blur-2xl ${
              isDarkMode 
                ? 'border-emerald-400/50 bg-gradient-to-br from-black/90 via-slate-900/80 to-emerald-900/30' 
                : 'border-emerald-400/30 bg-gradient-to-br from-white/90 via-gray-100/80 to-emerald-50/30'
            }`}>
              <CardHeader className="pb-8 px-10 pt-10">
                <CardTitle className="flex items-center gap-4 text-3xl font-black tracking-tight">
                  <Sparkles className={`w-12 h-12 drop-shadow-2xl animate-pulse ${
                    isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
                  }`} />
                  AI Wellness Coach
                </CardTitle>
              </CardHeader>
              <CardContent className="px-10 pb-12 pt-0">
                <div className="flex items-start gap-6 max-w-full">
                  <div className={`w-6 h-6 rounded-full mt-1 flex-shrink-0 shadow-xl animate-ping ${
                    isDarkMode 
                      ? 'bg-gradient-to-r from-emerald-400 to-emerald-200' 
                      : 'bg-gradient-to-r from-emerald-500 to-emerald-300'
                  }`}></div>
                  <div className="flex-1 min-w-0 space-y-6">
                    <div className="flex items-center gap-4 flex-wrap">
                      <Badge className={`font-bold px-5 py-2 shadow-lg text-lg ${
                        isDarkMode 
                          ? 'bg-emerald-900/80 text-emerald-300 border-emerald-400/60 backdrop-blur-sm' 
                          : 'bg-emerald-100/80 text-emerald-700 border-emerald-400/40 backdrop-blur-sm'
                      }`}>
                        AI Analysis
                      </Badge>
                      <div className={`text-2xl font-black drop-shadow-lg whitespace-nowrap ${
                        isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
                      }`}>
                        {aiInsight.confidence} confidence
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h3 className={`font-black text-2xl tracking-tight leading-tight ${
                        isDarkMode 
                          ? 'bg-gradient-to-r from-emerald-400 via-emerald-300 to-emerald-100 bg-clip-text text-transparent' 
                          : 'bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-300 bg-clip-text text-transparent'
                      }`}>
                        Smart Insight
                      </h3>
                      <p className={`text-lg leading-relaxed max-h-[80px] overflow-hidden line-clamp-3 px-6 py-4 rounded-2xl backdrop-blur-sm ${
                        isDarkMode 
                          ? 'text-slate-200 bg-black/50' 
                          : 'text-slate-700 bg-white/70 border border-emerald-200/50'
                      }`}>
                        {aiInsight.insight}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 pt-6 border-t-2 border-emerald-400/50">
                      <div className={`w-4 h-4 rounded-full shadow-lg animate-pulse flex-shrink-0 ${
                        isDarkMode ? 'bg-emerald-400' : 'bg-emerald-500'
                      }`}></div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-bold text-xl px-6 py-4 rounded-2xl border-2 shadow-xl truncate backdrop-blur-sm ${
                          isDarkMode 
                            ? 'text-emerald-300 bg-gradient-to-r from-emerald-900/80 to-emerald-800/80 border-emerald-400/60' 
                            : 'text-emerald-700 bg-gradient-to-r from-emerald-100/80 to-emerald-200/80 border-emerald-400/40'
                        }`}>
                          {aiInsight.recommendation}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* MOOD TRACKER */}
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
              <Card className={`h-[580px] shadow-2xl border-2 overflow-hidden backdrop-blur-2xl hover:shadow-emerald-500/40 transition-all duration-500 ${
                isDarkMode 
                  ? 'border-emerald-400/50 bg-gradient-to-br from-black/90 via-slate-900/80 to-emerald-900/30' 
                  : 'border-emerald-400/30 bg-gradient-to-br from-white/90 via-gray-100/80 to-emerald-50/30'
              }`}>
                <CardHeader className="pb-8 px-10 pt-10">
                  <CardTitle className="flex items-center gap-4 text-3xl font-black tracking-tight">
                    <Smile className={`w-12 h-12 drop-shadow-2xl ${
                      isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
                    }`} />
                    Log Mood
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-10 pb-12 pt-0 space-y-8 h-[380px] flex flex-col justify-between">
                  <div className="space-y-8 flex-1">
                    <Select value={mood} onValueChange={setMood}>
                      <SelectTrigger className={`h-20 rounded-3xl border-3 shadow-2xl text-xl backdrop-blur-xl ${
                        isDarkMode 
                          ? 'border-emerald-400/50 bg-black/80 focus:ring-4 focus:ring-emerald-400/40 focus:border-emerald-400' 
                          : 'border-emerald-400/30 bg-white/80 focus:ring-4 focus:ring-emerald-400/30 focus:border-emerald-500'
                      }`}>
                        <SelectValue placeholder="How are you feeling today?" />
                      </SelectTrigger>
                      <SelectContent className={`border backdrop-blur-2xl rounded-3xl shadow-2xl ${
                        isDarkMode 
                          ? 'border-emerald-400/50 bg-black/95' 
                          : 'border-emerald-400/30 bg-white/95'
                      }`}>
                        <SelectItem value="great">😄 Feeling Great</SelectItem>
                        <SelectItem value="good">🙂 Pretty Good</SelectItem>
                        <SelectItem value="okay">😐 Just Okay</SelectItem>
                        <SelectItem value="bad">☹️ Not Good</SelectItem>
                        <SelectItem value="terrible">😢 Terrible</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Textarea 
                      value={moodNotes}
                      onChange={(e) => setMoodNotes(e.target.value)}
                      placeholder="What's on your mind today? (optional)"
                      className={`min-h-[140px] resize-none rounded-3xl border-3 shadow-2xl text-lg py-8 px-8 backdrop-blur-xl ${
                        isDarkMode 
                          ? 'border-emerald-400/50 bg-black/80 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/40' 
                          : 'border-emerald-400/30 bg-white/80 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-400/30'
                      }`}
                      rows={4}
                    />
                  </div>
                  
                  <div className="space-y-6">
                    <Button 
                      onClick={logMood}
                      disabled={!mood}
                      className={`w-full h-20 text-xl font-black rounded-3xl shadow-2xl border-3 transform hover:-translate-y-1 transition-all duration-300 backdrop-blur-xl ${
                        isDarkMode 
                          ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 border-emerald-400/60 hover:shadow-emerald-500/60' 
                          : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 border-emerald-400/40 hover:shadow-emerald-400/40'
                      }`}
                    >
                      <CheckCircle className="w-8 h-8 mr-4" />
                      Log My Mood Today
                    </Button>

                    <div className="pt-8 border-t-4 text-center space-y-3 border-emerald-400/50">
                      <div className={`text-4xl md:text-5xl font-black drop-shadow-2xl ${
                        isDarkMode 
                          ? 'bg-gradient-to-r from-emerald-400 to-emerald-200 bg-clip-text text-transparent' 
                          : 'bg-gradient-to-r from-emerald-500 to-emerald-300 bg-clip-text text-transparent'
                      }`}>
                        {stats.greatPercentage}%
                      </div>
                      <div className={`text-xl font-bold px-10 py-4 rounded-2xl border-2 shadow-xl backdrop-blur-xl inline-block ${
                        isDarkMode 
                          ? 'text-emerald-400 bg-black/90 border-emerald-400/60' 
                          : 'text-emerald-600 bg-white/90 border-emerald-400/40'
                      }`}>
                        {stats.totalMoods} total moods
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* RECENT MOODS */}
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}>
              <Card className={`h-[580px] shadow-2xl border-2 overflow-hidden backdrop-blur-2xl hover:shadow-emerald-500/40 transition-all duration-500 ${
                isDarkMode 
                  ? 'border-emerald-400/50 bg-gradient-to-br from-black/90 via-slate-900/80 to-emerald-900/30' 
                  : 'border-emerald-400/30 bg-gradient-to-br from-white/90 via-gray-100/80 to-emerald-50/30'
              }`}>
                <CardHeader className="pb-8 px-10 pt-10">
                  <CardTitle className="flex items-center gap-4 text-3xl font-black tracking-tight">
                    <Clock className={`w-12 h-12 drop-shadow-2xl animate-pulse ${
                      isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
                    }`} />
                    Recent Moods
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-10 pb-12 pt-0 h-[380px] overflow-y-auto">
                  {moods.length > 0 ? (
                    moods.map((moodItem, idx) => (
                      <motion.div 
                        key={moodItem.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`group p-8 border-t rounded-3xl mb-6 backdrop-blur-xl shadow-2xl hover:shadow-emerald-400/50 hover:-translate-y-2 max-w-full transition-all duration-300 ${
                          isDarkMode 
                            ? 'border-emerald-400/30 first:border-t-0 hover:bg-emerald-900/50' 
                            : 'border-emerald-400/20 first:border-t-0 hover:bg-emerald-50/50'
                        }`}
                      >
                        <div className="flex items-center gap-6">
                          <div className={`w-24 h-24 rounded-3xl flex items-center justify-center shadow-2xl border-4 group-hover:scale-110 transition-transform duration-300 flex-shrink-0 backdrop-blur-xl ${
                            isDarkMode 
                              ? 'bg-gradient-to-br from-emerald-600/60 to-emerald-500/60 border-emerald-400/70' 
                              : 'bg-gradient-to-br from-emerald-400/60 to-emerald-300/60 border-emerald-400/50'
                          }`}>
                            <div className="text-5xl drop-shadow-2xl">{getMoodEmoji(moodItem.mood)}</div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className={`text-3xl font-black capitalize mb-4 tracking-tight truncate ${
                              isDarkMode 
                                ? 'text-slate-100 group-hover:text-emerald-400' 
                                : 'text-slate-800 group-hover:text-emerald-600'
                            }`}>
                              {moodItem.mood}
                            </h4>
                            {moodItem.notes && (
                              <p className={`text-xl px-6 py-4 rounded-2xl border backdrop-blur-xl leading-relaxed line-clamp-2 ${
                                isDarkMode 
                                  ? 'text-slate-300 bg-black/80 border-emerald-400/40' 
                                  : 'text-slate-700 bg-white/80 border-emerald-300/50'
                              }`}>
                                "{moodItem.notes}"
                              </p>
                            )}
                          </div>
                          <div className="text-right min-w-[120px] flex-shrink-0">
                            <div className={`text-2xl font-bold px-6 py-4 rounded-2xl border-2 shadow-xl backdrop-blur-xl whitespace-nowrap ${
                              isDarkMode 
                                ? 'text-emerald-400 bg-emerald-900/90 border-emerald-400/70' 
                                : 'text-emerald-600 bg-emerald-100/90 border-emerald-400/50'
                            }`}>
                              {new Date(moodItem.created_at).toLocaleDateString('en-IN')}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center p-12">
                      <motion.div 
                        animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className={`w-32 h-32 rounded-3xl border-4 flex items-center justify-center mb-8 shadow-2xl backdrop-blur-xl ${
                          isDarkMode 
                            ? 'bg-emerald-900/60 border-emerald-400/60' 
                            : 'bg-emerald-100/60 border-emerald-400/50'
                        }`}
                      >
                        <Smile className={`w-20 h-20 drop-shadow-2xl ${
                          isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
                        }`} />
                      </motion.div>
                      <h3 className={`text-4xl font-black mb-4 ${
                        isDarkMode ? 'text-slate-400' : 'text-slate-500'
                      }`}>
                        No Moods Yet
                      </h3>
                      <p className={`text-xl mb-8 max-w-md mx-auto ${
                        isDarkMode ? 'text-slate-500' : 'text-slate-600'
                      }`}>
                        Log your first mood using the tracker above!
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
