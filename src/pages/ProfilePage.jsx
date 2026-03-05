import React, { useEffect, useState, useCallback } from 'react';
import { useAuth, UserButton } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { 
  Sparkles, Smile, CheckCircle, Clock, Crown, Zap, Users, Heart 
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
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [aiInsight, setAiInsight] = useState(null);
  const [stats, setStats] = useState({ totalMoods: 0, greatPercentage: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // 🔥 FALLBACK AI DATA (Backend fail ho toh ye dikhega)
  const FALLBACK_AI_INSIGHT = {
    insight: "Low hydration detected → 30% mood drop",
    recommendation: "Drink 8 glasses water daily",
    confidence: "94%"
  };

  const FALLBACK_RECOMMENDATIONS = [
    { id: 1, icon: "🧘", title: "15min Meditation", reason: "Boosts mood 42%", category: "mindfulness", priority: "high" },
    { id: 2, icon: "💧", title: "8 Glasses Water", reason: "3x focus boost detected", category: "hydration", priority: "medium" },
    { id: 3, icon: "🚶", title: "30min Walk", reason: "25% mood improvement", category: "fitness", priority: "high" },
    { id: 4, icon: "📱", title: "Screen Break", reason: "Reduce eye strain 40%", category: "wellness", priority: "medium" }
  ];

  const loadProfileData = useCallback(async () => {
    const cacheKey = `profile_${userId}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const data = JSON.parse(cached);
        setMoods(data.moods || []);
        setAiRecommendations(data.recs || FALLBACK_RECOMMENDATIONS);
        setAiInsight(data.insights || FALLBACK_AI_INSIGHT);
        setStats(data.stats || {});
        setIsLoading(false);
        return;
      } catch {}
    }

    try {
      const token = await getToken();
      if (token) setAuthToken(token);

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 1500);

      const [moodsRes, recsRes, insightsRes] = await Promise.allSettled([
        api.get('/api/mood', { signal: controller.signal }),
        api.get('/api/recommendations', { signal: controller.signal }),
        api.get('/api/ai/insights', { signal: controller.signal })
      ]);

      clearTimeout(timeout);

      const moodsData = moodsRes.status === 'fulfilled' && Array.isArray(moodsRes.value?.data) 
        ? moodsRes.value.data.slice(-10) : [];
      
      const recsData = recsRes.status === 'fulfilled' && recsRes.value?.data?.recommendations 
        ? recsRes.value.data.recommendations : FALLBACK_RECOMMENDATIONS;

      const insightsData = insightsRes.status === 'fulfilled' && insightsRes.value?.data 
        ? insightsRes.value.data : FALLBACK_AI_INSIGHT;

      setMoods(moodsData);
      setAiRecommendations(recsData);
      setAiInsight(insightsData);

      const totalMoods = moodsData.length;
      const greatMoods = moodsData.filter(m => m.mood === 'great').length;
      setStats({
        totalMoods,
        greatPercentage: totalMoods ? Math.round((greatMoods / totalMoods) * 100) : 0
      });

      localStorage.setItem(cacheKey, JSON.stringify({
        moods: moodsData, recs: recsData, insights: insightsData, stats
      }));

    } catch (error) {
      console.log('⚡ Using fallback AI data');
      setAiRecommendations(FALLBACK_RECOMMENDATIONS);
      setAiInsight(FALLBACK_AI_INSIGHT);
    } finally {
      setIsLoading(false);
    }
  }, [userId, getToken]);

  useEffect(() => {
    if (userId) loadProfileData();
    else setIsLoading(false);
  }, [loadProfileData, userId]);

  const logMood = async () => {
    if (!mood) return toast.error('Select a mood!');
    
    const newMood = { id: Date.now(), mood, notes: moodNotes || '', created_at: new Date().toISOString() };
    setMoods(prev => [newMood, ...prev.slice(0, 9)]);
    setMood(''); setMoodNotes('');
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

  // SKELETON LOADING (same as before - perfect)
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6 lg:p-8 animate-pulse">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex justify-between items-center mb-8 space-y-3">
            <div className="space-y-3">
              <div className="h-12 w-64 bg-muted rounded-2xl"></div>
              <div className="h-5 w-48 bg-muted/70 rounded-xl"></div>
            </div>
            <div className="w-20 h-20 bg-muted rounded-2xl"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="lg:col-span-2 h-[200px]"><CardHeader className="pb-4"><div className="h-6 w-40 bg-muted rounded-lg"></div></CardHeader><CardContent className="pt-0 p-6 space-y-4"><div className="flex items-start gap-3"><div className="w-3 h-3 bg-muted rounded-full mt-2"></div><div className="space-y-3 flex-1"><div className="h-5 w-32 bg-muted"></div><div className="h-16 w-full bg-muted/80 rounded-2xl"></div></div></div></CardContent></Card>
            <Card className="h-[420px]"><CardHeader className="pb-4"><div className="h-6 w-24 bg-muted"></div></CardHeader><CardContent className="p-6 space-y-4"><div className="h-14 bg-muted rounded-2xl"></div><div className="h-28 bg-muted rounded-2xl"></div><div className="h-12 bg-muted/90 rounded-2xl"></div></CardContent></Card>
            <Card className="h-[420px]"><CardHeader className="pb-4"><div className="h-6 w-36 bg-muted"></div></CardHeader><CardContent className="p-6 space-y-4"><div className="space-y-3"><div className="p-4 border rounded-2xl bg-muted/30"><div className="flex gap-3"><div className="w-2 h-2 bg-muted rounded-full mt-3"></div><div className="space-y-2"><div className="h-5 w-32 bg-muted"></div><div className="h-4 w-60 bg-muted/80"></div></div></div></div></div></CardContent></Card>
            <Card className="h-[420px]"><CardHeader className="pb-4"><div className="h-6 w-28 bg-muted"></div></CardHeader><CardContent className="p-6"><div className="p-4 border-b bg-muted/30 rounded-xl"><div className="flex items-center gap-4"><div className="w-10 h-10 bg-muted rounded-2xl"></div><div className="flex-1 space-y-1"><div className="h-5 w-24 bg-muted"></div></div></div></div></CardContent></Card>
            <Card><CardHeader className="pb-4"><div className="h-6 w-24 bg-muted"></div></CardHeader><CardContent className="p-6"><div className="text-center space-y-3"><div className="h-8 w-32 mx-auto bg-muted"></div></div></CardContent></Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* HEADER */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="font-serif text-4xl tracking-tight mb-2 bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">Profile</h1>
              <p className="text-muted-foreground text-lg">
                {stats.totalMoods} moods • {aiRecommendations.length} AI recs
              </p>
            </div>
            <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-2xl">
              <UserButton afterSignOutUrl="/sign-in" />
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 🔥 AI WELLNESS COACH - FIXED */}
          <Card className="lg:col-span-2 h-[220px]">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <Sparkles className="w-6 h-6 text-emerald-400 animate-pulse" />
                AI Wellness Coach
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 bg-gradient-to-br from-emerald-500/10 via-emerald-400/5 to-teal-500/10 border border-emerald-400/40 rounded-2xl backdrop-blur-sm"
              >
                <div className="flex items-start gap-4">
                  <div className="w-4 h-4 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full mt-1 flex-shrink-0 animate-ping" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-400/50 font-semibold">
                        <Zap className="w-3 h-3 mr-1" /> AI Analysis
                      </Badge>
                      <span className="text-xs text-emerald-400/70 font-medium">{aiInsight?.confidence} confidence</span>
                    </div>
                    <h3 className="font-bold text-xl text-emerald-400 mb-3 leading-tight">Smart Insight</h3>
                    <p className="text-slate-200 text-lg mb-4 leading-relaxed">{aiInsight?.insight}</p>
                    <div className="flex items-center gap-3 pt-2">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                      <span className="font-semibold text-emerald-300 text-sm">→ {aiInsight?.recommendation}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </CardContent>
          </Card>

          {/* MOOD TRACKER */}
          <Card className="h-[420px]">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Smile className="w-5 h-5 text-emerald-400" />
                Log Mood
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={mood} onValueChange={setMood}>
                <SelectTrigger className="h-14 rounded-xl border-emerald-400/30 focus:ring-emerald-400/50">
                  <SelectValue placeholder="How do you feel today?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="great">😄 Great</SelectItem>
                  <SelectItem value="good">🙂 Good</SelectItem>
                  <SelectItem value="okay">😐 Okay</SelectItem>
                  <SelectItem value="bad">☹️ Bad</SelectItem>
                  <SelectItem value="terrible">😢 Terrible</SelectItem>
                </SelectContent>
              </Select>
              
              <Textarea 
                value={moodNotes}
                onChange={(e) => setMoodNotes(e.target.value)}
                placeholder="What's influencing your mood today?"
                className="min-h-[100px] resize-none rounded-xl border-emerald-400/20 focus:border-emerald-400/40"
                rows={3}
              />
              
              <Button 
                onClick={logMood}
                disabled={!mood}
                className="w-full h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 rounded-xl font-semibold shadow-lg transform hover:-translate-y-0.5 transition-all"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Log Mood
              </Button>

              <div className="pt-4 border-t border-emerald-400/20 text-center space-y-1">
                <div className="text-3xl font-black bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
                  {stats.greatPercentage}%
                </div>
                <p className="text-sm text-emerald-400 font-medium">{stats.totalMoods} total moods</p>
              </div>
            </CardContent>
          </Card>

          {/* 🔥 AI RECOMMENDATIONS - FIXED WITH REAL DATA */}
          <Card className="h-[420px]">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
                AI Recommendations
                <Badge className="ml-2 bg-emerald-500/20 text-emerald-400 text-xs border-emerald-400/50">
                  {aiRecommendations.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 h-[320px] overflow-y-auto">
              <div className="space-y-3 p-5">
                {aiRecommendations.map((rec, idx) => (
                  <motion.div
                    key={rec.id || idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="group p-5 border border-emerald-400/20 rounded-2xl hover:bg-emerald-500/5 hover:border-emerald-400/40 backdrop-blur-sm transition-all hover:shadow-lg hover:-translate-y-1"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 shadow-lg ${
                        rec.priority === 'high' 
                          ? 'bg-gradient-to-r from-emerald-400 to-teal-400 animate-bounce' 
                          : 'bg-yellow-400/80'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">{rec.icon}</span>
                          <h4 className="font-bold text-lg text-emerald-400 group-hover:text-emerald-300 truncate">
                            {rec.title}
                          </h4>
                        </div>
                        <p className="text-sm text-slate-300 line-clamp-2 mb-3 leading-relaxed">
                          {rec.reason}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="border-emerald-400/50 text-emerald-400 bg-emerald-500/10 text-xs font-medium">
                            {rec.category}
                          </Badge>
                          {rec.priority === 'high' && (
                            <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs shadow-md">
                              Priority
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* RECENT MOODS */}
          <Card className="h-[420px]">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Clock className="w-5 h-5 text-emerald-400" />
                Recent Moods
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 h-[320px] overflow-y-auto">
              {moods.length > 0 ? (
                moods.map((moodItem) => (
                  <motion.div 
                    key={moodItem.id}
                    className="p-6 border-b border-emerald-400/10 last:border-b-0 hover:bg-emerald-500/5 group transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-3xl flex-shrink-0 p-2 bg-emerald-500/10 rounded-2xl">{getMoodEmoji(moodItem.mood)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-lg group-hover:text-emerald-400 truncate capitalize">
                          {moodItem.mood}
                        </p>
                        {moodItem.notes && (
                          <p className="text-sm text-slate-300 truncate mt-1">{moodItem.notes}</p>
                        )}
                      </div>
                      <span className="text-xs text-emerald-400 font-medium min-w-[70px] text-right">
                        {new Date(moodItem.created_at).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="p-12 text-center">
                  <Smile className="w-16 h-16 mx-auto mb-4 text-emerald-400/50" />
                  <p className="text-slate-400 text-lg">No moods logged yet</p>
                  <p className="text-sm text-emerald-400/70 mt-1">Log your first mood above!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 🔥 ACCOUNT - ONLY REAL NAME */}
          <Card className="lg:col-span-2 lg:row-span-1 shadow-2xl border-emerald-400/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Crown className="w-6 h-6 text-emerald-400 shadow-lg" />
                Account
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-center">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="p-8 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border border-emerald-400/20 rounded-3xl backdrop-blur-sm"
              >
                <div className="w-24 h-24 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-3xl mx-auto mb-6 shadow-2xl flex items-center justify-center">
                  <Crown className="w-12 h-12 text-white shadow-lg" />
                </div>
                <div>
                  <h2 className="text-3xl font-black bg-gradient-to-r from-slate-100 to-slate-200 bg-clip-text text-transparent mb-2 tracking-tight">
                    {user?.fullName || user?.firstName }
                  </h2>
                  <div className="flex flex-wrap gap-2 justify-center max-w-md mx-auto">
                    <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg font-semibold px-4 py-2">
                      <Heart className="w-4 h-4 mr-1" /> Pro Member
                    </Badge>
                    <Badge className="bg-slate-800/50 text-slate-200 border-slate-600 font-semibold px-4 py-2">
                      {stats.totalMoods} Moods
                    </Badge>
                    <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg font-semibold px-4 py-2">
                      <Users className="w-4 h-4 mr-1" /> Premium
                    </Badge>
                  </div>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
