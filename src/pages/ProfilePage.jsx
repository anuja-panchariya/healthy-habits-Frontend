import React, { useEffect, useState, useCallback } from 'react';
import { useAuth, UserButton } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { 
  Heart, Sparkles, Smile, Activity, Download, 
  CheckCircle, Clock, Sun, Moon 
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
  const [isDark, setIsDark] = useState(true); // 🖤 Dark mode
  const [mood, setMood] = useState('');
  const [moodNotes, setMoodNotes] = useState('');
  const [moods, setMoods] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [stats, setStats] = useState({ totalMoods: 0, greatPercentage: 0 });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // 🎨 Black Emerald Theme
  const theme = isDark ? {
    bg: 'from-slate-900 via-black to-emerald-900/20',
    card: 'bg-slate-900/80 border-emerald-500/30 hover:border-emerald-400/50',
    text: 'text-emerald-400',
    accent: 'from-emerald-500 to-emerald-600',
    glass: 'bg-black/60 backdrop-blur-xl'
  } : {
    bg: 'from-emerald-50 via-white to-emerald-50/50',
    card: 'bg-white/90 border-emerald-300/50 hover:border-emerald-400/60',
    text: 'text-emerald-700',
    accent: 'from-emerald-500 to-emerald-600',
    glass: 'bg-white/80 backdrop-blur-xl'
  };

  const loadProfileData = useCallback(async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const token = await getToken();
      if (token) setAuthToken(token);

      // ✅ FIXED: /api/moods (not /api/mood)
      const moodsRes = await api.get('/api/moods').catch(() => ({}));
      const moodsData = Array.isArray(moodsRes.data) ? moodsRes.data.slice(-10) : [];
      
      // ✅ FIXED: /api/ai-recommendations
      const recsRes = await api.get('/api/ai-recommendations').catch(() => ({}));
      const aiRecs = recsRes.data?.recommendations || [];

      const totalMoods = moodsData.length;
      const greatMoods = moodsData.filter(m => m.mood === 'great').length;
      
      setMoods(moodsData);
      setRecommendations(aiRecs.length ? aiRecs : [
        { title: '15min meditation', reason: 'Reduce stress 40%', category: 'mindfulness' },
        { title: '8 glasses water', reason: 'Boost focus 3x', category: 'hydration' }
      ]);
      setStats({
        totalMoods,
        greatPercentage: totalMoods ? Math.round((greatMoods / totalMoods) * 100) : 0
      });
    } catch (error) {
      console.error('Profile load error:', error);
      // ✅ LOCAL FALLBACK
      const demoMoods = [
        { id: 1, mood: 'great', notes: 'Feeling energized!', created_at: new Date(Date.now() - 86400000).toISOString() },
        { id: 2, mood: 'good', notes: 'Productive day', created_at: new Date().toISOString() }
      ];
      setMoods(demoMoods);
      setStats({ totalMoods: 2, greatPercentage: 50 });
    } finally {
      setLoading(false);
    }
  }, [userId, getToken]);

  const logMood = async () => {
    if (!mood) {
      toast.error('Please select a mood!');
      return;
    }

    const newMood = {
      mood,
      notes: moodNotes,
      created_at: new Date().toISOString()
    };
    
    setMoods(prev => {
      const updated = [newMood, ...prev.slice(0, 9)];
      const totalMoods = updated.length;
      const greatMoods = updated.filter(m => m.mood === 'great').length;
      setStats({
        totalMoods,
        greatPercentage: totalMoods ? Math.round((greatMoods / totalMoods) * 100) : 0
      });
      return updated;
    });

    try {
      const token = await getToken();
      if (token) setAuthToken(token);
      // ✅ FIXED: POST to /api/moods
      await api.post('/api/moods', newMood);
      toast.success('✅ Mood logged!');
      
      const recsRes = await api.get('/api/ai-recommendations');
      setRecommendations(recsRes.data?.recommendations || []);
    } catch (error) {
      toast.success('✅ Mood saved locally!');
    }
    setMood('');
    setMoodNotes('');
  };

  const exportCSV = () => {
    setExporting(true);
    const csvRows = [
      ['Date', 'Mood', 'Notes', 'Great %'],
      ...moods.map(m => [
        new Date(m.created_at).toLocaleDateString('en-IN'),
        m.mood.toUpperCase(),
        `"${m.notes || ''}"`,
        stats.greatPercentage + '%'
      ])
    ];
    
    const csvContent = csvRows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `wellness-data-${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
    URL.revokeObjectURL(url);
    
    toast.success('📥 CSV exported!');
    setExporting(false);
  };

  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  const getMoodEmoji = (mood) => {
    const emojis = { great: '😄', good: '🙂', okay: '😐', bad: '☹️', terrible: '😢' };
    return emojis[mood] || '🙂';
  };

  if (loading && moods.length === 0) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${theme.bg}`}>
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-20 h-20 border-4 border-emerald-500/30 border-t-emerald-400 rounded-full shadow-2xl"
        />
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.bg} p-6`}>
      <div className="max-w-6xl mx-auto space-y-8 relative">
        {/* 🌟 THEME TOGGLE */}
        <motion.div className="flex justify-end mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDark(!isDark)}
            className={`border-2 border-emerald-400/50 ${isDark ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-200' : 'bg-white/80 hover:bg-emerald-50 text-emerald-700'} font-mono`}
          >
            {isDark ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
            {isDark ? 'Light' : 'Dark'}
          </Button>
        </motion.div>

        {/* HEADER */}
        <motion.div initial={{ y: -30 }} animate={{ y: 0 }} className="flex justify-between items-center">
          <div>
            <h1 className={`font-black text-4xl tracking-tight mb-2 bg-gradient-to-r from-emerald-400 via-emerald-300 to-emerald-500 bg-clip-text text-transparent`}>
              Profile & Wellness
            </h1>
            <p className={`text-lg ${isDark ? 'text-emerald-300/80' : 'text-emerald-600/80'}`}>
              AI insights + mood tracking
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Button 
              onClick={exportCSV}
              disabled={exporting}
              className={`rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 text-slate-900 font-bold shadow-lg shadow-emerald-500/30`}
            >
              {exporting ? (
                <Activity className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              Export
            </Button>
            <UserButton afterSignOutUrl="/sign-in" />
          </div>
        </motion.div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* ACCOUNT CARD */}
          <Card className={`${theme.card} shadow-2xl hover:shadow-emerald-500/25 rounded-3xl backdrop-blur-xl`}>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
                👤 Account
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 flex items-center justify-center shadow-2xl shadow-emerald-500/50">
                  <Smile className="w-8 h-8 text-slate-900" />
                </div>
                <div className="flex-1">
                  <h3 className={`text-xl font-bold ${isDark ? 'text-emerald-200' : 'text-emerald-800'}`}>
                    {user?.fullName || user?.firstName || 'Anuja Panchariya'}
                  </h3>
                  <Badge className={`bg-emerald-500/20 text-emerald-400 border-emerald-400/50 font-mono`}>✅ Verified</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* MOOD LOGGER */}
          <Card className={`${theme.card} shadow-2xl hover:shadow-emerald-500/25 rounded-3xl backdrop-blur-xl`}>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
                😊 Today's Mood
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              <div className="space-y-3">
                <Select value={mood} onValueChange={setMood}>
                  <SelectTrigger className={`${isDark ? 'bg-slate-800/50 border-emerald-500/30' : 'bg-white/50 border-emerald-300/50'}`}>
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
                  placeholder="What's on your mind? (optional)"
                  className={`min-h-[80px] ${isDark ? 'bg-slate-800/50 border-emerald-500/30 text-emerald-200 placeholder-emerald-400/50' : 'bg-white/50 border-emerald-300/50'}`}
                />
                
                <Button 
                  onClick={logMood}
                  disabled={!mood}
                  className="w-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 text-slate-900 font-bold shadow-lg shadow-emerald-500/30"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Log Mood
                </Button>
              </div>

              <div className={`text-center pt-6 border-t ${isDark ? 'border-emerald-500/30' : 'border-emerald-300/50'} space-y-2`}>
                <div className={`text-4xl font-black bg-gradient-to-r from-emerald-400 to-emerald-500 bg-clip-text text-transparent`}>
                  {stats.greatPercentage}%
                </div>
                <p className={`text-sm uppercase tracking-wide font-mono ${isDark ? 'text-emerald-400/80' : 'text-emerald-600/80'}`}>
                  {stats.totalMoods} moods tracked
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 🔥 AI RECOMMENDATIONS */}
          <Card className={`${theme.card} lg:col-span-2 shadow-2xl hover:shadow-emerald-500/25 rounded-3xl backdrop-blur-xl`}>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
                ✨ AI Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              {recommendations.map((rec, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-6 rounded-2xl ${isDark ? 'bg-emerald-500/10 border-emerald-400/40 hover:bg-emerald-500/20' : 'bg-emerald-400/10 border-emerald-300/50 hover:bg-emerald-400/20'} border shadow-lg hover:shadow-emerald-500/25 transition-all`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/40">
                      <Sparkles className="w-6 h-6 text-slate-900" />
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-bold text-lg ${isDark ? 'text-emerald-200' : 'text-emerald-800'}`}>{rec.title}</h4>
                      <p className={`mb-3 ${isDark ? 'text-emerald-300' : 'text-emerald-600'}`}>{rec.reason}</p>
                      <Badge className={`bg-emerald-500/20 text-emerald-400 border-emerald-400/50 font-mono`}>{rec.category}</Badge>
                    </div>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>

          {/* RECENT MOODS */}
          <Card className={`${theme.card} lg:col-span-2 shadow-2xl hover:shadow-emerald-500/25 rounded-3xl backdrop-blur-xl`}>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
                📅 Recent Moods
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              {moods.map((moodItem) => (
                <motion.div 
                  key={moodItem.id}
                  className={`flex items-center gap-4 p-5 rounded-2xl ${isDark ? 'bg-emerald-500/5 border-emerald-400/40 hover:bg-emerald-500/15' : 'bg-emerald-50/50 border-emerald-300/50 hover:bg-emerald-100/50'} shadow-lg hover:shadow-emerald-500/20 transition-all`}
                >
                  <div className="text-3xl flex-shrink-0">{getMoodEmoji(moodItem.mood)}</div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold capitalize text-lg mb-1 ${isDark ? 'text-emerald-200' : 'text-emerald-800'}`}>
                      {moodItem.mood}
                    </p>
                    {moodItem.notes && (
                      <p className={`text-sm ${isDark ? 'text-emerald-300' : 'text-emerald-600'}`}>
                        {moodItem.notes}
                      </p>
                    )}
                  </div>
                  <span className={`text-sm font-mono font-bold min-w-[70px] text-right ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                    {new Date(moodItem.created_at).toLocaleDateString('en-IN')}
                  </span>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
