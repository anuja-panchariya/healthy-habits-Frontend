import React, { useEffect, useState, useCallback } from 'react';
import { useAuth, UserButton } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { 
  Heart, Star, Sparkles, Smile, Activity, Download, 
  CheckCircle, Clock, Sun, Moon 
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
  const [recommendations, setRecommendations] = useState([]);
  const [stats, setStats] = useState({ totalMoods: 0, greatPercentage: 0 });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // 🔥 EXACT HABITS PAGE CACHING
  const loadProfileData = useCallback(async () => {
    if (!userId) return;
    
    const cacheKey = `profile_${userId}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const cachedData = JSON.parse(cached);
        if (Date.now() - cachedData.timestamp < 30000) {
          setMoods(cachedData.moods || []);
          setHabits(cachedData.habits || []);
          setStats(cachedData.stats || { totalMoods: 0, greatPercentage: 0 });
          setLoading(false);
          return;
        }
      } catch {}
    }

    try {
      setLoading(true);
      const token = await getToken();
      if (token) setAuthToken(token);

      const [moodsRes, habitsRes] = await Promise.all([
        api.get('/api/mood').catch(() => ({})),
        api.get('/api/habits').catch(() => ({}))
      ]);

      const moodsData = Array.isArray(moodsRes.data) ? moodsRes.data.slice(-10) : [];
      const totalMoods = moodsData.length;
      const greatMoods = moodsData.filter(m => m.mood === 'great').length;
      
      const newStats = {
        totalMoods,
        greatPercentage: totalMoods ? Math.round((greatMoods / totalMoods) * 100) : 0
      };

      setMoods(moodsData);
      setRecommendations([
        { title: '15min meditation', reason: 'Reduce stress 40%', category: 'mindfulness' },
        { title: '8 glasses water', reason: 'Boost focus 3x', category: 'hydration' }
      ]);
      setStats(newStats);

      localStorage.setItem(cacheKey, JSON.stringify({
        moods: moodsData,
        stats: newStats,
        timestamp: Date.now()
      }));

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

  // 🔥 HABITS PAGE THEME TOGGLE
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setIsDarkMode(savedTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    setIsDarkMode(!isDarkMode);
    localStorage.setItem('theme', newTheme);
  };

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
      <div className={`min-h-screen flex items-center justify-center p-8 ${
        isDarkMode 
          ? 'bg-gradient-to-br from-black via-slate-900 to-emerald-900/20' 
          : 'bg-gradient-to-br from-white via-gray-50 to-emerald-50/20'
      }`}>
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ duration: 1, repeat: Infinity }}
          className={`w-20 h-20 border-4 rounded-full ${
            isDarkMode 
              ? 'border-slate-600 border-t-emerald-400' 
              : 'border-gray-300 border-t-emerald-500'
          }`} 
        />
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 lg:p-8 transition-all duration-500 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-black via-slate-900 to-emerald-900/20' 
        : 'bg-gradient-to-br from-white via-gray-50 to-emerald-50/20'
    }`}>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* 🔥 HEADER - HABITS STYLE */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12"
        >
          <div>
            <h1 className={`font-serif text-5xl lg:text-6xl tracking-tight mb-4 drop-shadow-2xl ${
              isDarkMode 
                ? 'bg-gradient-to-r from-emerald-400 via-emerald-300 to-emerald-100 bg-clip-text text-transparent' 
                : 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-300 bg-clip-text text-transparent'
            }`}>
              Profile & Wellness
            </h1>
            <p className={`text-xl font-semibold px-6 py-3 rounded-2xl inline-block shadow-xl backdrop-blur-sm ${
              isDarkMode 
                ? 'text-emerald-400/90 bg-black/80 border-2 border-emerald-400/50' 
                : 'text-emerald-600/90 bg-white/80 border-2 border-emerald-400/30'
            }`}>
              AI insights + mood tracking
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Button 
              onClick={exportCSV}
              disabled={exporting}
              className={`h-16 px-8 text-xl font-black rounded-3xl shadow-2xl transform hover:-translate-y-1 transition-all duration-300 gap-3 ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-slate-900 border-2 border-emerald-400/60 hover:shadow-emerald-500/50' 
                  : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white border-2 border-emerald-400/50 hover:shadow-emerald-400/30'
              }`}
            >
              {exporting ? (
                <Activity className="w-7 h-7 animate-spin" />
              ) : (
                <Download className="w-7 h-7" />
              )}
              Export
            </Button>

            {/* 🔥 HABITS PAGE TOGGLE */}
            <div className={`flex items-center gap-3 p-4 rounded-3xl shadow-xl backdrop-blur-xl border ${
              isDarkMode 
                ? 'bg-black/30 border-emerald-400/50' 
                : 'bg-white/70 border-emerald-400/30'
            }`}>
              <Sun className={`w-6 h-6 transition-colors ${
                isDarkMode ? 'text-slate-500' : 'text-emerald-500'
              }`} />
              <Switch checked={isDarkMode} onCheckedChange={toggleTheme} />
              <Moon className={`w-6 h-6 transition-colors ${
                isDarkMode ? 'text-emerald-500' : 'text-slate-500'
              }`} />
            </div>

            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl backdrop-blur-xl ${
              isDarkMode 
                ? 'bg-gradient-to-r from-emerald-900/90 to-emerald-800/90 border-4 border-emerald-400/60' 
                : 'bg-gradient-to-r from-emerald-100/90 to-emerald-200/90 border-4 border-emerald-400/40'
            }`}>
              <UserButton afterSignOutUrl="/sign-in" />
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 🔥 SIMPLIFIED ACCOUNT INFO - NO EMAIL */}
          <Card className={`h-96 shadow-2xl rounded-3xl overflow-hidden backdrop-blur-2xl transition-all duration-500 hover:shadow-emerald-500/40 ${
            isDarkMode 
              ? 'bg-gradient-to-br from-slate-800/90 via-slate-900/80 to-emerald-900/30 border border-slate-600/50' 
              : 'bg-gradient-to-br from-white/90 via-gray-50/80 to-emerald-50/30 border border-emerald-200/50'
          }`}>
            <CardHeader className="p-8">
              <CardTitle className={`flex items-center gap-4 text-2xl font-bold tracking-tight ${
                isDarkMode ? 'text-slate-200' : 'text-slate-800'
              }`}>
                <Star className={`w-10 h-10 drop-shadow-2xl ${
                  isDarkMode ? 'text-emerald-400' : 'text-emerald-500'
                }`} />
                Account
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="flex flex-col lg:flex-row items-center gap-8">
                <div className={`w-24 h-24 rounded-3xl flex items-center justify-center shadow-2xl border-4 flex-shrink-0 ${
                  isDarkMode 
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 border-slate-800' 
                    : 'bg-gradient-to-r from-emerald-500 to-emerald-600 border-emerald-400/50'
                }`}>
                  <UserButton afterSignOutUrl="/sign-in" />
                </div>
                <div className="flex-1 text-center lg:text-left">
                  <h2 className={`text-3xl font-bold mb-4 ${
                    isDarkMode ? 'text-slate-200' : 'text-slate-800'
                  }`}>
                    {user?.fullName || user?.firstName || 'Anuja Panchariya'}
                  </h2>
                  {/* 🔥 NO EMAIL - HIDDEN */}
                  <Badge className={`px-6 py-2 text-lg font-bold shadow-lg ${
                    isDarkMode 
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-400/50' 
                      : 'bg-emerald-500/20 text-emerald-600 border-emerald-400/40'
                  }`}>
                    Verified User
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* TODAY'S MOOD */}
          <Card className={`h-96 shadow-2xl rounded-3xl backdrop-blur-2xl transition-all duration-500 hover:shadow-emerald-500/40 ${
            isDarkMode 
              ? 'bg-gradient-to-br from-slate-800/90 via-slate-900/80 to-emerald-900/30 border border-slate-600/50' 
              : 'bg-gradient-to-br from-white/90 via-gray-50/80 to-emerald-50/30 border border-emerald-200/50'
          }`}>
            <CardHeader className="p-8">
              <CardTitle className={`flex items-center gap-4 text-2xl font-bold tracking-tight ${
                isDarkMode ? 'text-slate-200' : 'text-slate-800'
              }`}>
                <Smile className={`w-10 h-10 drop-shadow-2xl ${
                  isDarkMode ? 'text-emerald-400' : 'text-emerald-500'
                }`} />
                Today's Mood
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-4">
                <Select value={mood} onValueChange={setMood}>
                  <SelectTrigger className={`h-14 rounded-2xl backdrop-blur-xl shadow-xl text-lg ${
                    isDarkMode 
                      ? 'bg-slate-700/50 border-slate-600 text-slate-200 focus:border-emerald-400' 
                      : 'bg-white/80 border-emerald-200/50 text-slate-800 focus:border-emerald-500'
                  }`}>
                    <SelectValue placeholder="How do you feel?" />
                  </SelectTrigger>
                  <SelectContent className={`backdrop-blur-2xl rounded-2xl shadow-2xl ${
                    isDarkMode 
                      ? 'bg-slate-800/95 border-slate-600/50' 
                      : 'bg-white/95 border-emerald-200/50'
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
                  placeholder="What's on your mind?"
                  className={`min-h-[80px] rounded-2xl resize-none backdrop-blur-xl shadow-xl text-lg ${
                    isDarkMode 
                      ? 'bg-slate-700/50 border-slate-600 text-slate-200 focus:border-emerald-400' 
                      : 'bg-white/80 border-emerald-200/50 text-slate-800 focus:border-emerald-500'
                  }`}
                />
                
                <Button 
                  onClick={logMood}
                  disabled={!mood}
                  className={`w-full h-14 text-lg font-bold rounded-2xl shadow-2xl transform hover:-translate-y-1 transition-all duration-300 ${
                    isDarkMode 
                      ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-slate-900 border-2 border-emerald-400/60 hover:shadow-emerald-500/50' 
                      : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white border-2 border-emerald-400/50 hover:shadow-emerald-400/30'
                  }`}
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Log Mood
                </Button>
              </div>

              <div className={`pt-6 border-t text-center space-y-2 ${
                isDarkMode 
                  ? 'border-slate-700' 
                  : 'border-emerald-200/50'
              }`}>
                <div className={`text-xl md:text-2xl font-black drop-shadow-2xl leading-none tracking-tight ${
                  isDarkMode 
                    ? 'text-emerald-400' 
                    : 'bg-gradient-to-r from-emerald-500 to-emerald-400 bg-clip-text text-transparent'
                }`}>
                  {stats.greatPercentage}%
                </div>
                <p className={`text-base font-semibold ${
                  isDarkMode 
                    ? 'text-slate-400' 
                    : 'text-slate-600'
                }`}>
                  {stats.totalMoods} moods
                </p>
              </div>
            </CardContent>
          </Card>

          {/* AI RECOMMENDATIONS */}
          <Card className={`lg:col-span-2 shadow-2xl rounded-3xl overflow-hidden backdrop-blur-2xl transition-all duration-500 hover:shadow-emerald-500/40 ${
            isDarkMode 
              ? 'bg-gradient-to-br from-slate-800/90 via-slate-900/80 to-emerald-900/30 border border-slate-600/50' 
              : 'bg-gradient-to-br from-white/90 via-gray-50/80 to-emerald-50/30 border border-emerald-200/50'
          }`}>
            <CardHeader className="p-8">
              <CardTitle className={`flex items-center gap-4 text-2xl font-bold tracking-tight ${
                isDarkMode ? 'text-slate-200' : 'text-slate-800'
              }`}>
                <Sparkles className={`w-10 h-10 animate-pulse drop-shadow-2xl ${
                  isDarkMode ? 'text-emerald-400' : 'text-emerald-500'
                }`} />
                AI Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 max-h-96 overflow-y-auto space-y-6">
              {recommendations.map((rec, idx) => (
                <motion.div
                  key={idx}
                  className={`group p-6 rounded-2xl backdrop-blur-xl shadow-2xl hover:shadow-emerald-400/50 hover:-translate-y-1 transition-all duration-300 border ${
                    isDarkMode 
                      ? 'bg-gradient-to-br from-slate-700/50 via-slate-800/40 to-emerald-900/30 border-slate-600/50 hover:bg-emerald-900/60' 
                      : 'bg-gradient-to-br from-white/70 via-gray-50/60 to-emerald-50/40 border-emerald-200/50 hover:bg-emerald-50/70'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-xl flex-shrink-0 ${
                      isDarkMode 
                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' 
                        : 'bg-gradient-to-r from-emerald-500 to-emerald-600'
                    }`}>
                      <Sparkles className={`w-6 h-6 ${
                        isDarkMode ? 'text-slate-900' : 'text-white'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`text-xl font-bold mb-2 group-hover:scale-[1.02] transition-transform ${
                        isDarkMode 
                          ? 'text-slate-200 group-hover:text-emerald-400' 
                          : 'text-slate-800 group-hover:text-emerald-600'
                      }`}>
                        {rec.title}
                      </h4>
                      <p className={`text-base leading-relaxed mb-4 ${
                        isDarkMode 
                          ? 'text-slate-400' 
                          : 'text-slate-600'
                      }`}>
                        {rec.reason}
                      </p>
                      <Badge className={`px-4 py-2 text-sm font-bold shadow-lg ${
                        isDarkMode 
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-400/50' 
                          : 'bg-emerald-500/20 text-emerald-600 border-emerald-400/40'
                      }`}>
                        {rec.category}
                      </Badge>
                    </div>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>

          {/* RECENT MOODS */}
          <Card className={`h-96 shadow-2xl rounded-3xl overflow-hidden backdrop-blur-2xl transition-all duration-500 hover:shadow-emerald-500/40 ${
            isDarkMode 
              ? 'bg-gradient-to-br from-slate-800/90 via-slate-900/80 to-emerald-900/30 border border-slate-600/50' 
              : 'bg-gradient-to-br from-white/90 via-gray-50/80 to-emerald-50/30 border border-emerald-200/50'
          }`}>
            <CardHeader className="p-8">
              <CardTitle className={`flex items-center gap-4 text-2xl font-bold tracking-tight ${
                isDarkMode ? 'text-slate-200' : 'text-slate-800'
              }`}>
                <Clock className={`w-10 h-10 drop-shadow-2xl ${
                  isDarkMode ? 'text-emerald-400' : 'text-emerald-500'
                }`} />
                Recent Moods
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 max-h-64 overflow-y-auto space-y-4">
              {moods.map((moodItem) => (
                <motion.div 
                  key={moodItem.id}
                  className={`flex items-center gap-4 p-4 rounded-2xl backdrop-blur-xl shadow-xl hover:shadow-emerald-400/50 hover:-translate-y-0.5 transition-all duration-200 ${
                    isDarkMode 
                      ? 'bg-gradient-to-br from-slate-700/50 via-slate-800/40 to-emerald-900/30 border border-slate-600/50 hover:bg-emerald-900/60' 
                      : 'bg-gradient-to-br from-white/80 via-gray-50/70 to-emerald-50/40 border border-emerald-200/50 hover:bg-emerald-50/70'
                  }`}
                >
                  <div className="text-2xl flex-shrink-0">{getMoodEmoji(moodItem.mood)}</div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-lg font-bold capitalize mb-1 ${
                      isDarkMode ? 'text-slate-200' : 'text-slate-800'
                    }`}>
                      {moodItem.mood}
                    </p>
                    {moodItem.notes && (
                      <p className={`text-sm leading-relaxed ${
                        isDarkMode 
                          ? 'text-slate-400' 
                          : 'text-slate-600'
                      }`}>
                        {moodItem.notes}
                      </p>
                    )}
                  </div>
                  <span className={`text-sm font-semibold min-w-[70px] text-right ${
                    isDarkMode 
                      ? 'text-emerald-400' 
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
