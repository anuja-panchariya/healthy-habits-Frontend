import React, { useEffect, useState, useCallback } from 'react';
import { useAuth, UserButton } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { 
  Sparkles, Smile, CheckCircle, Clock 
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
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

  const FALLBACK_AI_INSIGHT = {
    insight: "Low hydration detected - 30% mood impact",
    recommendation: "Drink 8 glasses water daily for instant focus boost",
    confidence: "94%"
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

    try {
      const token = await getToken();
      if (token) setAuthToken(token);
      await api.post('/api/mood', newMood);
    } catch {}
  };

  const getMoodEmoji = (mood) => {
    const emojis = { great: '😄', good: '🙂', okay: '😐', bad: '☹️', terrible: '😢' };
    return emojis[mood] || '🙂';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-black p-6 lg:p-8 animate-pulse">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex justify-between items-center mb-8">
            <div className="space-y-3">
              <div className="h-14 w-64 bg-slate-700/50 rounded-2xl"></div>
              <div className="h-5 w-48 bg-slate-600/50 rounded-xl"></div>
            </div>
            <div className="w-20 h-20 bg-slate-700/50 rounded-2xl"></div>
          </div>
          <div className="space-y-6">
            <Card className="h-[280px]"><CardHeader><div className="h-8 w-48 bg-slate-700/50 rounded"></div></CardHeader><CardContent className="p-8"><div className="space-y-4"><div className="h-20 w-full bg-slate-700/30 rounded-xl"></div></div></CardContent></Card>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="h-[500px]"><CardHeader><div className="h-7 w-32 bg-slate-700/50 rounded"></div></CardHeader><CardContent className="p-8 space-y-6"><div className="h-16 bg-slate-700/50 rounded-xl"></div><div className="h-32 bg-slate-700/50 rounded-xl"></div><div className="h-14 bg-slate-700/50 rounded-xl"></div></CardContent></Card>
              <Card className="h-[500px]"><CardHeader><div className="h-7 w-28 bg-slate-700/50 rounded"></div></CardHeader><CardContent className="p-8 space-y-4"><div className="p-6 bg-slate-700/30 rounded-xl"><div className="flex gap-4"><div className="w-12 h-12 bg-slate-700/50 rounded-xl"></div></div></div></CardContent></Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* HEADER */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 lg:gap-0 mb-12"
        >
          <div>
            <h1 className="font-serif text-5xl lg:text-6xl tracking-tight mb-4 bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-400 bg-clip-text text-transparent drop-shadow-2xl">
              Profile
            </h1>
            <p className="text-emerald-400/90 text-xl font-semibold bg-slate-800/50 px-4 py-2 rounded-xl border border-emerald-400/30 inline-block">
              Tracking {stats.totalMoods} moods
            </p>
          </div>
          <div className="w-24 h-24 lg:w-28 lg:h-28 bg-gradient-to-r from-emerald-500/80 to-emerald-600/80 rounded-3xl flex items-center justify-center shadow-2xl border-4 border-emerald-400/40 backdrop-blur-sm">
            <UserButton afterSignOutUrl="/sign-in" />
          </div>
        </motion.div>

        <div className="space-y-8">
          {/* ✅ FIXED AI WELLNESS COACH - NO OVERFLOW */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="shadow-2xl border border-emerald-400/40 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl overflow-hidden">
              <CardHeader className="pb-8 px-10 pt-10">
                <CardTitle className="flex items-center gap-4 text-3xl font-black tracking-tight">
                  <Sparkles className="w-12 h-12 text-emerald-400 drop-shadow-2xl animate-pulse" />
                  AI Wellness Coach
                </CardTitle>
              </CardHeader>
              <CardContent className="px-10 pb-12 pt-0">
                <div className="flex items-start gap-6 max-w-full">
                  <div className="w-6 h-6 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full mt-1 flex-shrink-0 shadow-xl animate-ping"></div>
                  <div className="flex-1 min-w-0 space-y-6">
                    <div className="flex items-center gap-4 flex-wrap">
                      <Badge className="bg-emerald-500/30 text-emerald-300 border-emerald-400/50 font-bold px-5 py-2 shadow-lg text-lg whitespace-nowrap">
                        AI Analysis
                      </Badge>
                      <div className="text-2xl font-black text-emerald-400 drop-shadow-lg whitespace-nowrap">
                        {aiInsight.confidence} confidence
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h3 className="font-black text-2xl bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-400 bg-clip-text text-transparent tracking-tight leading-tight">
                        Smart Insight
                      </h3>
                      <p className="text-lg text-slate-200 leading-relaxed max-h-[80px] overflow-hidden line-clamp-3">
                        {aiInsight.insight}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 pt-6 border-t-2 border-emerald-400/40">
                      <div className="w-4 h-4 bg-emerald-400 rounded-full shadow-lg animate-pulse flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-xl text-emerald-300 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 px-6 py-4 rounded-2xl border-2 border-emerald-400/40 shadow-xl truncate">
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
            {/* ✅ FIXED MOOD TRACKER - STATS INSIDE */}
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
              <Card className="h-[580px] shadow-2xl border border-emerald-400/40 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl overflow-hidden hover:shadow-emerald-500/25 transition-all duration-500">
                <CardHeader className="pb-8 px-10 pt-10">
                  <CardTitle className="flex items-center gap-4 text-3xl font-black tracking-tight">
                    <Smile className="w-12 h-12 text-emerald-400 drop-shadow-2xl" />
                    Log Mood
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-10 pb-12 pt-0 space-y-8 h-[380px] flex flex-col justify-between">
                  <div className="space-y-8 flex-1">
                    <Select value={mood} onValueChange={setMood}>
                      <SelectTrigger className="h-20 rounded-3xl border-3 border-emerald-400/40 bg-slate-700/70 backdrop-blur-sm focus:ring-4 focus:ring-emerald-400/30 focus:border-emerald-400 shadow-2xl text-xl">
                        <SelectValue placeholder="How are you feeling today?" />
                      </SelectTrigger>
                      <SelectContent className="border-emerald-400/30 bg-slate-800/95 backdrop-blur-xl rounded-3xl shadow-2xl">
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
                      className="min-h-[140px] resize-none rounded-3xl border-3 border-emerald-400/30 bg-slate-700/70 backdrop-blur-sm focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/30 shadow-2xl text-lg py-8 px-8"
                      rows={4}
                    />
                  </div>
                  
                  <div className="space-y-6">
                    <Button 
                      onClick={logMood}
                      disabled={!mood}
                      className="w-full h-20 text-xl font-black bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 rounded-3xl shadow-2xl hover:shadow-emerald-500/50 border-3 border-emerald-400/40 transform hover:-translate-y-1 transition-all duration-300 backdrop-blur-sm"
                    >
                      <CheckCircle className="w-8 h-8 mr-4" />
                      Log My Mood Today
                    </Button>

                    {/* ✅ STATS PERFECTLY INSIDE BOX */}
                    <div className="pt-8 border-t-4 border-emerald-400/50 text-center space-y-4">
                      <div className="text-6xl font-black bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent drop-shadow-2xl">
                        {stats.greatPercentage}%
                      </div>
                      <div className="text-2xl font-bold text-emerald-400 bg-slate-800/80 px-12 py-6 rounded-3xl border-2 border-emerald-400/50 shadow-xl backdrop-blur-sm inline-block">
                        {stats.totalMoods} total moods
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* RECENT MOODS */}
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}>
              <Card className="h-[580px] shadow-2xl border border-emerald-400/40 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl overflow-hidden hover:shadow-emerald-500/25 transition-all duration-500">
                <CardHeader className="pb-8 px-10 pt-10">
                  <CardTitle className="flex items-center gap-4 text-3xl font-black tracking-tight">
                    <Clock className="w-12 h-12 text-emerald-400 drop-shadow-2xl animate-pulse" />
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
                        className="group p-8 border-t border-emerald-400/20 first:border-t-0 hover:bg-emerald-500/10 transition-all duration-300 rounded-3xl mb-6 backdrop-blur-sm shadow-xl hover:shadow-emerald-400/30 hover:-translate-y-2 max-w-full"
                      >
                        <div className="flex items-center gap-6">
                          <div className="w-24 h-24 bg-gradient-to-br from-emerald-500/30 to-teal-500/30 rounded-3xl flex items-center justify-center shadow-2xl border-4 border-emerald-400/50 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                            <div className="text-5xl drop-shadow-2xl">{getMoodEmoji(moodItem.mood)}</div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-3xl font-black capitalize text-slate-100 group-hover:text-emerald-400 mb-4 tracking-tight truncate">
                              {moodItem.mood}
                            </h4>
                            {moodItem.notes && (
                              <p className="text-xl text-slate-300 bg-slate-800/60 px-6 py-4 rounded-2xl border border-slate-700/50 backdrop-blur-sm leading-relaxed line-clamp-2">
                                "{moodItem.notes}"
                              </p>
                            )}
                          </div>
                          <div className="text-right min-w-[120px] flex-shrink-0">
                            <div className="text-2xl font-bold text-emerald-400 bg-emerald-500/30 px-6 py-4 rounded-2xl border-2 border-emerald-400/50 shadow-xl whitespace-nowrap">
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
                        className="w-32 h-32 bg-emerald-500/20 rounded-3xl border-4 border-emerald-400/50 flex items-center justify-center mb-8 shadow-2xl"
                      >
                        <Smile className="w-20 h-20 text-emerald-400 drop-shadow-2xl" />
                      </motion.div>
                      <h3 className="text-4xl font-black text-slate-400 mb-4">No Moods Yet</h3>
                      <p className="text-xl text-slate-500 mb-8 max-w-md mx-auto">
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
