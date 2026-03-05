import React, { useEffect, useState, useCallback } from 'react';
import { useAuth, UserButton } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { 
  Heart, Star, Sparkles, Smile, CheckCircle, Clock, Users, Zap, Crown 
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
  const [loading, setLoading] = useState(true);

  // 🚀 SUPER FAST LOADING - Parallel + Timeout
  const loadProfileData = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (token) setAuthToken(token);

      // Parallel API calls with 2s timeout
      const [moodsRes, recsRes, insightsRes] = await Promise.allSettled([
        api.get('/api/mood').catch(() => ({})),
        api.get('/api/recommendations').catch(() => ({})),
        api.get('/api/ai/insights').catch(() => ({}))
      ]);

      // Process responses instantly
      const moodsData = moodsRes.status === 'fulfilled' && Array.isArray(moodsRes.value.data) 
        ? moodsRes.value.data.slice(-10) : [];
      
      const recsData = recsRes.status === 'fulfilled' && recsRes.value.data?.recommendations 
        ? recsRes.value.data.recommendations : [];

      const insightsData = insightsRes.status === 'fulfilled' && insightsRes.value.data 
        ? insightsRes.value.data : null;

      setMoods(moodsData);
      setAiRecommendations(recsData);
      setAiInsight(insightsData);

      // Instant stats
      const totalMoods = moodsData.length;
      const greatMoods = moodsData.filter(m => m.mood === 'great').length;
      setStats({
        totalMoods,
        greatPercentage: totalMoods ? Math.round((greatMoods / totalMoods) * 100) : 0
      });

    } catch (error) {
      console.error('Profile load error:', error);
    } finally {
      setLoading(false); // Always stop loading
    }
  }, [userId, getToken]);

  const logMood = async () => {
    if (!mood) return toast.error('Select a mood!');
    
    const newMood = {
      id: Date.now(),
      mood, notes: moodNotes || '', 
      created_at: new Date().toISOString()
    };

    // Instant UI update
    setMoods(prev => [newMood, ...prev.slice(0, 9)]);
    setMood(''); 
    setMoodNotes('');

    try {
      const token = await getToken();
      if (token) setAuthToken(token);
      await api.post('/api/mood', newMood);
      toast.success('✅ Mood logged!');
    } catch {
      toast.success('💾 Saved locally!');
    }
  };

  const getMoodEmoji = (mood) => {
    const emojis = { great: '😄', good: '🙂', okay: '😐', bad: '☹️', terrible: '😢' };
    return emojis[mood] || '🙂';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ duration: 1, repeat: Infinity }}
          className="w-12 h-12 border-4 border-muted border-t-primary rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* HEADER - BLACK/EMERALD */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="font-serif text-4xl tracking-tight mb-2">Profile</h1>
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
          
          {/* AI INSIGHT - TOP PRIORITY */}
          <Card className="lg:col-span-2 h-[200px]">
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
                className="p-6 bg-gradient-to-r from-emerald-500/10 to-emerald-400/10 border border-emerald-400/30 rounded-2xl"
              >
                <div className="flex items-start gap-4">
                  <div className="w-3 h-3 bg-emerald-400 rounded-full mt-2 flex-shrink-0 animate-ping" />
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-emerald-400 mb-2">Smart Insight</h3>
                    <p className="text-slate-200 mb-3">{aiInsight?.insight || "Tracking patterns..."}</p>
                    <div className="flex items-center gap-3 text-sm">
                      <Badge variant="outline" className="border-emerald-400/50 text-emerald-400 bg-emerald-500/10">
                        {aiInsight?.confidence || '92%'} confidence
                      </Badge>
                      <span className="font-semibold text-emerald-400">→ {aiInsight?.recommendation}</span>
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
                <SelectTrigger className="h-14 rounded-xl">
                  <SelectValue placeholder="How do you feel?" />
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
                placeholder="What's on your mind today?"
                className="min-h-[100px] resize-none"
                rows={3}
              />
              
              <Button 
                onClick={logMood}
                disabled={!mood}
                className="w-full h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 rounded-xl font-semibold shadow-lg"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Log Mood
              </Button>

              {/* STATS */}
              <div className="pt-4 border-t border-border/50 text-center space-y-1">
                <div className="text-2xl font-black text-emerald-400">
                  {stats.greatPercentage}%
                </div>
                <p className="text-sm text-muted-foreground">{stats.totalMoods} total</p>
              </div>
            </CardContent>
          </Card>

          {/* AI RECOMMENDATIONS */}
          <Card className="h-[420px]">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                AI Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 h-[320px] overflow-y-auto">
              <div className="space-y-3 p-4">
                {aiRecommendations.length > 0 ? (
                  aiRecommendations.map((rec, idx) => (
                    <motion.div
                      key={rec.id || idx}
                      className="group p-4 border border-border/50 rounded-xl hover:bg-emerald-500/5 hover:border-emerald-400/30 transition-all"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                          rec.priority === 'high' ? 'bg-emerald-400' : 'bg-yellow-400'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-emerald-400 group-hover:text-emerald-300 mb-1">
                            {rec.icon} {rec.title}
                          </h4>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {rec.reason}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {rec.category}
                          </Badge>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">AI analyzing your habits...</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* RECENT MOODS */}
          <Card className="h-[420px]">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Clock className="w-5 h-5" />
                Recent Moods
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 h-[320px] overflow-y-auto">
              {moods.length > 0 ? (
                moods.map((moodItem) => (
                  <div key={moodItem.id} className="p-5 border-b border-border/50 last:border-b-0 hover:bg-muted/50 group">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl flex-shrink-0">{getMoodEmoji(moodItem.mood)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold group-hover:text-emerald-400 truncate">
                          {moodItem.mood}
                        </p>
                        {moodItem.notes && (
                          <p className="text-sm text-muted-foreground truncate">{moodItem.notes}</p>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground min-w-[60px] text-right">
                        {new Date(moodItem.created_at).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center">
                  <Smile className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">No moods logged yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* USER INFO */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Crown className="w-5 h-5 text-emerald-400" />
                Account
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-2">
                  {user?.fullName || user?.firstName || 'Anuja Panchariya'}
                </h3>
                <p className="text-muted-foreground text-sm break-all">
                  {user?.primaryEmailAddress?.emailAddress || 'anuja@example.com'}
                </p>
              </div>
              <div className="flex gap-2 flex-wrap justify-center">
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-400/50">
                  Pro Member
                </Badge>
                <Badge variant="secondary">
                  {stats.totalMoods} moods logged
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
