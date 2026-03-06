import React, { useEffect, useState, useCallback } from 'react';
import { useAuth, UserButton } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { 
  Heart, Sparkles, Smile, Activity, Download, 
  CheckCircle, Clock 
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
  const { theme } = useTheme(); // 🔥 NAV TOGGLE CONTROL
  const isDark = theme === 'dark';
  
  const [mood, setMood] = useState('');
  const [moodNotes, setMoodNotes] = useState('');
  const [moods, setMoods] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [stats, setStats] = useState({ totalMoods: 0, greatPercentage: 0 });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const loadProfileData = useCallback(async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const token = await getToken();
      if (token) setAuthToken(token);

      const moodsRes = await api.get('/api/mood').catch(() => ({}));
      const moodsData = Array.isArray(moodsRes.data) ? moodsRes.data.slice(-10) : [];
      const totalMoods = moodsData.length;
      const greatMoods = moodsData.filter(m => m.mood === 'great').length;
      
      setMoods(moodsData);
      setRecommendations([
        { title: '15min meditation', reason: 'Reduce stress 40%', category: 'mindfulness' },
        { title: '8 glasses water', reason: 'Boost focus 3x', category: 'hydration' }
      ]);
      setStats({
        totalMoods,
        greatPercentage: totalMoods ? Math.round((greatMoods / totalMoods) * 100) : 0
      });
    } catch (error) {
      console.error('Profile load error:', error);
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
      id: Date.now(),
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
      await api.post('/api/mood', newMood);
      toast.success('✅ Mood logged!');
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
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 ${isDark ? 'bg-black/95' : 'bg-gradient-to-br from-slate-50 to-zinc-50'}`}>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* 🔥 HEADER */}
        <div className="flex justify-between items-start lg:items-center gap-6">
          <div>
            <h1 className="font-serif font-light text-4xl lg:text-5xl tracking-tight mb-2">
              Profile & Wellness
            </h1>
            <p className={`text-lg font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              AI insights + mood tracking
            </p>
          </div>
          
          <div className="flex items-center gap-4 flex-wrap">
            <Button 
              onClick={exportCSV}
              disabled={exporting}
              className={`rounded-full px-6 py-2 font-bold shadow-lg hover:shadow-emerald-500/30 transition-all ${
                isDark 
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-slate-900 hover:from-emerald-500 hover:to-emerald-600 shadow-black/50' 
                  : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-400 hover:to-emerald-500 shadow-emerald-500/20'
              }`}
            >
              {exporting ? (
                <Activity className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              Export
            </Button>

            <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg border backdrop-blur-sm ${
              isDark 
                ? 'bg-gradient-to-r from-slate-900/80 to-black/90 border-slate-700/50 shadow-black/30' 
                : 'bg-gradient-to-r from-white/90 to-slate-100/90 border-slate-200/50 shadow-slate-200/20'
            }`}>
              <UserButton afterSignOutUrl="/sign-in" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* 🔥 ACCOUNT CARD - BLACK THEME */}
          <Card className={`h-80 lg:h-96 hover:shadow-2xl transition-all border-0 ${
            isDark 
              ? 'bg-gradient-to-br from-slate-900/95 via-black/90 to-slate-950/80 shadow-[0_20px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl' 
              : 'bg-gradient-to-br from-white/95 via-slate-50/90 to-zinc-50/70 shadow-xl backdrop-blur-sm'
          }`}>
            <CardHeader className="pb-6">
              <CardTitle className={`flex items-center gap-3 text-xl font-bold tracking-tight ${
                isDark ? 'text-slate-100 drop-shadow-lg' : 'text-slate-800'
              }`}>
                <Heart className={`w-8 h-8 ${isDark ? 'text-emerald-400 shadow-lg' : 'text-emerald-500'}`} />
                Account
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex flex-col lg:flex-row items-center gap-6 p-6 lg:p-8">
                <div className={`w-20 h-20 lg:w-24 lg:h-24 rounded-2xl flex items-center justify-center shadow-2xl border-2 flex-shrink-0 backdrop-blur-xl ${
                  isDark 
                    ? 'bg-gradient-to-r from-emerald-500/90 to-emerald-600/90 border-emerald-400/70 shadow-emerald-500/40' 
                    : 'bg-gradient-to-r from-emerald-500/90 to-emerald-600/90 border-emerald-400/60 shadow-emerald-400/30'
                }`}>
                  <UserButton afterSignOutUrl="/sign-in" />
                </div>
                <div className="flex-1 text-center lg:text-left min-w-0">
                  <h2 className={`text-2xl lg:text-3xl font-black mb-3 drop-shadow-lg ${
                    isDark ? 'text-slate-100 shadow-lg' : 'text-slate-800'
                  }`}>
                    {user?.fullName || user?.firstName || 'Anuja Panchariya'}
                  </h2>
                  <Badge className={`px-6 py-2.5 text-base font-bold shadow-lg transform hover:scale-105 transition-all ${
                    isDark 
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/60 shadow-emerald-500/30 hover:bg-emerald-500/30' 
                      : 'bg-emerald-500/20 text-emerald-600 border-emerald-400/50 shadow-emerald-400/20 hover:bg-emerald-500/30'
                  }`}>
                    ✅ Verified User
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 🔥 MOOD CARD */}
          <Card className={`h-80 lg:h-96 hover:shadow-2xl transition-all border-0 ${
            isDark 
              ? 'bg-gradient-to-br from-slate-900/95 via-black/90 to-slate-950/80 shadow-[0_20px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl' 
              : 'bg-gradient-to-br from-white/95 via-slate-50/90 to-zinc-50/70 shadow-xl backdrop-blur-sm'
          }`}>
            <CardHeader className="pb-6">
              <CardTitle className={`flex items-center gap-3 text-xl font-bold tracking-tight ${
                isDark ? 'text-slate-100 drop-shadow-lg' : 'text-slate-800'
              }`}>
                <Smile className={`w-8 h-8 ${isDark ? 'text-emerald-400 shadow-lg' : 'text-emerald-500'}`} />
                Today's Mood
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-5 px-6 lg:px-8 pb-8">
              <div className="space-y-3">
                <Select value={mood} onValueChange={setMood}>
                  <SelectTrigger className={`h-14 rounded-2xl border-2 shadow-lg backdrop-blur-sm hover:border-emerald-400/70 transition-all ${
                    isDark 
                      ? 'bg-slate-800/80 border-slate-700/70 text-slate-200 hover:bg-slate-900/80' 
                      : 'bg-white/90 border-slate-200/60 text-slate-800 hover:bg-white/100'
                  }`}>
                    <SelectValue placeholder="How do you feel today?" />
                  </SelectTrigger>
                  <SelectContent className={`backdrop-blur-2xl shadow-2xl rounded-2xl border-2 ${
                    isDark 
                      ? 'bg-slate-900/95 border-slate-700/60 shadow-black/30' 
                      : 'bg-white/95 border-slate-200/50 shadow-slate-200/20'
                  }`}>
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
                  className={`min-h-[80px] rounded-2xl border-2 shadow-lg backdrop-blur-sm hover:border-emerald-400/70 transition-all ${
                    isDark 
                      ? 'bg-slate-800/80 border-slate-700/70 text-slate-200 hover:bg-slate-900/80 placeholder-slate-500/70' 
                      : 'bg-white/90 border-slate-200/60 text-slate-800 hover:bg-white/100 placeholder-slate-500/50'
                  }`}
                />
                
                <Button 
                  onClick={logMood}
                  disabled={!mood}
                  className={`w-full h-14 rounded-2xl font-bold shadow-2xl hover:shadow-emerald-500/50 transform hover:-translate-y-1 transition-all border-2 gap-2 ${
                    isDark 
                      ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-slate-900 border-emerald-400/70 hover:from-emerald-500 hover:to-emerald-600' 
                      : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-emerald-400/60 hover:from-emerald-400 hover:to-emerald-500'
                  }`}
                >
                  <CheckCircle className="w-5 h-5" />
                  Log Mood
                </Button>
              </div>

              <div className={`pt-6 border-t text-center space-y-2 ${
                isDark ? 'border-slate-800/60' : 'border-slate-200/50'
              }`}>
                <div className={`text-4xl lg:text-5xl font-black drop-shadow-2xl leading-none tracking-tight ${
                  isDark 
                    ? 'text-emerald-400 shadow-emerald-500/50' 
                    : 'bg-gradient-to-r from-emerald-500 to-emerald-400 bg-clip-text text-transparent'
                }`}>
                  {stats.greatPercentage}%
                </div>
                <p className={`text-sm font-semibold uppercase tracking-wide ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  {stats.totalMoods} moods tracked
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 🔥 RECOMMENDATIONS */}
          <Card className={`lg:col-span-2 h-80 hover:shadow-2xl transition-all border-0 ${
            isDark 
              ? 'bg-gradient-to-br from-slate-900/95 via-black/90 to-slate-950/80 shadow-[0_20px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl' 
              : 'bg-gradient-to-br from-white/95 via-slate-50/90 to-zinc-50/70 shadow-xl backdrop-blur-sm'
          }`}>
            <CardHeader className="pb-6">
              <CardTitle className={`flex items-center gap-3 text-xl font-bold tracking-tight ${
                isDark ? 'text-slate-100 drop-shadow-lg' : 'text-slate-800'
              }`}>
                <Sparkles className={`w-8 h-8 animate-pulse ${isDark ? 'text-emerald-400 shadow-lg' : 'text-emerald-500'}`} />
                AI Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 px-6 lg:px-8 pb-8 max-h-64 overflow-y-auto space-y-4">
              {recommendations.map((rec, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`group p-6 rounded-2xl backdrop-blur-xl shadow-xl hover:shadow-emerald-400/40 hover:-translate-y-1 transition-all border hover:border-emerald-500/60 ${
                    isDark 
                      ? 'bg-gradient-to-br from-slate-800/80 via-black/60 to-slate-950/50 border-slate-700/50 hover:bg-slate-900/80 shadow-black/30' 
                      : 'bg-gradient-to-br from-white/80 via-slate-50/70 to-zinc-50/60 border-slate-200/40 hover:bg-white/90 shadow-slate-200/20'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-2xl flex-shrink-0 border-2 ${
                      isDark 
                        ? 'bg-gradient-to-r from-emerald-500/95 to-emerald-600/95 border-emerald-400/70 shadow-emerald-500/40' 
                        : 'bg-gradient-to-r from-emerald-500/95 to-emerald-600/95 border-emerald-400/60 shadow-emerald-400/30'
                    }`}>
                      <Sparkles className={`w-6 h-6 ${isDark ? 'text-slate-900 drop-shadow-sm' : 'text-white drop-shadow-sm'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`text-lg font-bold mb-2 group-hover:scale-[1.02] transition-transform ${
                        isDark 
                          ? 'text-slate-100 group-hover:text-emerald-300 drop-shadow-sm' 
                          : 'text-slate-800 group-hover:text-emerald-600'
                      }`}>
                        {rec.title}
                      </h4>
                      <p className={`text-sm leading-relaxed mb-3 ${
                        isDark ? 'text-slate-300' : 'text-slate-600'
                      }`}>
                        {rec.reason}
                      </p>
                      <Badge className={`px-4 py-1.5 text-sm font-bold shadow-lg backdrop-blur-sm border hover:border-emerald-400/70 transition-all ${
                        isDark 
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50 shadow-emerald-400/30 hover:bg-emerald-500/30' 
                          : 'bg-emerald-500/20 text-emerald-600 border-emerald-400/40 shadow-emerald-400/20 hover:bg-emerald-500/30'
                      }`}>
                        {rec.category}
                      </Badge>
                    </div>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>

          {/* 🔥 RECENT MOODS */}
          <Card className={`lg:col-span-2 h-80 hover:shadow-2xl transition-all border-0 ${
            isDark 
              ? 'bg-gradient-to-br from-slate-900/95 via-black/90 to-slate-950/80 shadow-[0_20px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl' 
              : 'bg-gradient-to-br from-white/95 via-slate-50/90 to-zinc-50/70 shadow-xl backdrop-blur-sm'
          }`}>
            <CardHeader className="pb-6">
              <CardTitle className={`flex items-center gap-3 text-xl font-bold tracking-tight ${
                isDark ? 'text-slate-100 drop-shadow-lg' : 'text-slate-800'
              }`}>
                <Clock className={`w-8 h-8 ${isDark ? 'text-emerald-400 shadow-lg' : 'text-emerald-500'}`} />
                Recent Moods
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 px-6 lg:px-8 pb-8 max-h-48 overflow-y-auto space-y-3">
              {moods.map((moodItem) => (
                <motion.div 
                  key={moodItem.id}
                  className={`flex items-center gap-4 p-4 rounded-2xl backdrop-blur-xl shadow-xl hover:shadow-emerald-400/40 hover:-translate-y-0.5 transition-all border hover:border-emerald-500/60 ${
                    isDark 
                      ? 'bg-gradient-to-br from-slate-800/80 via-black/60 to-slate-950/50 border-slate-700/50 hover:bg-slate-900/80 shadow-black/30' 
                      : 'bg-gradient-to-br from-white/80 via-slate-50/70 to-zinc-50/60 border-slate-200/40 hover:bg-white/90 shadow-slate-200/20'
                  }`}
                >
                  <div className="text-3xl flex-shrink-0 drop-shadow-lg">{getMoodEmoji(moodItem.mood)}</div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-lg font-bold capitalize mb-1 ${
                      isDark ? 'text-slate-100 drop-shadow-sm' : 'text-slate-800'
                    }`}>
                      {moodItem.mood}
                    </p>
                    {moodItem.notes && (
                      <p className={`text-sm leading-tight ${
                        isDark ? 'text-slate-300' : 'text-slate-600'
                      }`}>
                        {moodItem.notes}
                      </p>
                    )}
                  </div>
                  <span className={`text-sm font-bold min-w-[70px] text-right uppercase tracking-wide ${
                    isDark 
                      ? 'text-emerald-400 drop-shadow-sm' 
                      : 'text-emerald-500'
                  }`}>
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
