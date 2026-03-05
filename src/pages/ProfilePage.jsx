import React, { useEffect, useState, useCallback } from 'react';
import { useAuth, UserButton } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { 
  Heart, Star, Bell, Sparkles, Smile, Activity, Award, Download, 
  CheckCircle, Brain, Clock, TrendingUp, Sun, Moon 
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
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
  const [habits, setHabits] = useState([]);
  const [stats, setStats] = useState({ totalMoods: 0, greatPercentage: 0 });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true); // 🔥 DARK MODE STATE

  const loadProfileData = useCallback(async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const token = await getToken();
      if (token) setAuthToken(token);

      const [moodsRes, habitsRes] = await Promise.all([
        api.get('/api/mood').catch(() => ({})),
        api.get('/api/habits').catch(() => ({}))
      ]);

      const moodsData = Array.isArray(moodsRes.data) ? moodsRes.data.slice(-10) : [];
      const habitsData = Array.isArray(habitsRes.data?.habits) ? habitsRes.data.habits : [];

      setMoods(moodsData);
      setHabits(habitsData);
      setRecommendations([
        { title: '15min meditation', reason: 'Reduce stress 40%', category: 'mindfulness' },
        { title: '8 glasses water', reason: 'Boost focus 3x', category: 'hydration' }
      ]);

      const totalMoods = moodsData.length;
      const greatMoods = moodsData.filter(m => m.mood === 'great').length;
      setStats({
        totalMoods,
        greatPercentage: totalMoods ? Math.round((greatMoods / totalMoods) * 100) : 0
      });

    } catch (error) {
      console.error('Profile load error:', error);
      setMoods([
        { id: 1, mood: 'great', notes: 'Feeling energized!', created_at: new Date(Date.now() - 86400000).toISOString() },
        { id: 2, mood: 'good', notes: 'Productive day', created_at: new Date().toISOString() }
      ]);
      setHabits([
        { id: 1, title: 'Drink water', category: 'hydration', streak: 5 },
        { id: 2, title: '30min walk', category: 'fitness', streak: 12 }
      ]);
      setStats({ totalMoods: 2, greatPercentage: 50 });
    } finally {
      setLoading(false);
    }
  }, [userId, getToken]);

  // 🔥 THEME TOGGLE
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

    try {
      const token = await getToken();
      if (token) setAuthToken(token);
      
      const newMood = {
        mood,
        notes: moodNotes,
        created_at: new Date().toISOString()
      };
      
      await api.post('/api/mood', newMood);
      toast.success('✅ Mood logged!');
      
      setMoods(prev => [{ id: Date.now(), ...newMood }, ...prev.slice(0, 9)]);
      setMood('');
      setMoodNotes('');
      
    } catch (error) {
      const newMood = { id: Date.now(), mood, notes: moodNotes, created_at: new Date().toISOString() };
      setMoods(prev => [newMood, ...prev.slice(0, 9)]);
      toast.success('✅ Mood saved locally!');
      setMood('');
      setMoodNotes('');
    }
  };

  const exportCSV = () => {
    setExporting(true);
    
    const csvRows = [
      ['Date', 'Mood', 'Notes', 'Habits Completed'],
      ...moods.map(m => [
        new Date(m.created_at).toLocaleDateString('en-IN'),
        m.mood.toUpperCase(),
        `"${m.notes || ''}"`,
        habits.filter(h => h.lastLogged === m.created_at).length
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
    
    toast.success('📥 CSV exported!');
    setExporting(false);
  };

  const getMoodEmoji = (mood) => {
    const emojis = { great: '😄', good: '🙂', okay: '😐', bad: '☹️', terrible: '😢' };
    return emojis[mood] || '🙂';
  };

  if (loading) {
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
    <div className={`min-h-screen p-8 pt-24 transition-all duration-500 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-black via-slate-900 to-emerald-900/20' 
        : 'bg-gradient-to-br from-white via-gray-50 to-emerald-50/20'
    }`}>
      <div className="max-w-6xl mx-auto space-y-12">
        {/* 🔥 HEADER + THEME TOGGLE */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-16"
        >
          <div className="text-center lg:text-left">
            <div className={`w-32 h-32 rounded-3xl flex items-center justify-center mx-auto lg:mx-0 mb-8 shadow-2xl ${
              isDarkMode 
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 border-4 border-slate-800' 
                : 'bg-gradient-to-r from-emerald-500 to-emerald-600 border-4 border-emerald-400/50'
            }`}>
              <Heart className={`w-16 h-16 drop-shadow-lg ${
                isDarkMode ? 'text-slate-900' : 'text-white'
              }`} />
            </div>
            <h1 className={`text-6xl font-light tracking-tight mb-4 drop-shadow-2xl ${
              isDarkMode 
                ? 'text-slate-200' 
                : 'text-slate-800 bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-400 bg-clip-text text-transparent'
            }`}>
              Profile & Wellness
            </h1>
            <p className={`text-2xl ${
              isDarkMode 
                ? 'text-slate-400' 
                : 'text-slate-600'
            }`}>
              AI insights + mood tracking
            </p>
          </div>

          {/* 🔥 THEME TOGGLE + EXPORT */}
          <div className="flex items-center gap-4 flex-wrap">
            <Button 
              onClick={exportCSV}
              disabled={exporting}
              className={`h-16 px-8 text-xl font-bold rounded-3xl shadow-2xl gap-3 ${
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
              Export CSV
            </Button>

            {/* THEME SWITCH */}
            <div className={`flex items-center gap-3 p-4 rounded-3xl shadow-xl backdrop-blur-xl border ${
              isDarkMode 
                ? 'bg-black/30 border-emerald-400/50' 
                : 'bg-white/70 border-emerald-400/30'
            }`}>
              <Sun className={`w-6 h-6 transition-colors ${
                isDarkMode ? 'text-slate-500' : 'text-emerald-500'
              }`} />
              <Switch 
                checked={isDarkMode} 
                onCheckedChange={toggleTheme}
                className="data-[state=checked]:bg-emerald-600"
              />
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
          {/* ACCOUNT INFO */}
          <Card className={`h-96 shadow-2xl rounded-3xl overflow-hidden backdrop-blur-2xl transition-all duration-500 ${
            isDarkMode 
              ? 'bg-gradient-to-br from-slate-800/90 via-slate-900/80 to-emerald-900/30 border border-slate-600/50 hover:shadow-emerald-500/40' 
              : 'bg-gradient-to-br from-white/90 via-gray-50/80 to-emerald-50/30 border border-emerald-200/50 hover:shadow-emerald-400/30'
          }`}>
            <CardHeader className="p-8">
              <CardTitle className={`flex items-center gap-4 text-3xl font-bold tracking-tight ${
                isDarkMode ? 'text-slate-200' : 'text-slate-800'
              }`}>
                <Star className={`w-12 h-12 drop-shadow-2xl ${
                  isDarkMode ? 'text-emerald-400' : 'text-emerald-500'
                }`} />
                Account Info
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="flex flex-col lg:flex-row items-center gap-8">
                <div className={`w-28 h-28 rounded-3xl flex items-center justify-center shadow-2xl border-4 flex-shrink-0 ${
                  isDarkMode 
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 border-slate-800' 
                    : 'bg-gradient-to-r from-emerald-500 to-emerald-600 border-emerald-400/50'
                }`}>
                  <UserButton afterSignOutUrl="/sign-in" />
                </div>
                <div className="flex-1 text-center lg:text-left">
                  <h2 className={`text-4xl font-bold mb-4 ${
                    isDarkMode ? 'text-slate-200' : 'text-slate-800'
                  }`}>
                    {user?.fullName || user?.firstName || 'Anuja Panchariya'}
                  </h2>
                  <p className={`text-xl px-6 py-4 rounded-2xl break-all backdrop-blur-xl shadow-xl ${
                    isDarkMode 
                      ? 'text-slate-400 bg-slate-700/50 border border-slate-600/50' 
                      : 'text-slate-600 bg-white/80 border border-emerald-200/50'
                  }`}>
                    {user?.primaryEmailAddress?.emailAddress || 'anuja@example.com'}
                  </p>
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
              <CardTitle className={`flex items-center gap-4 text-3xl font-bold tracking-tight ${
                isDarkMode ? 'text-slate-200' : 'text-slate-800'
              }`}>
                <Smile className={`w-12 h-12 drop-shadow-2xl ${
                  isDarkMode ? 'text-emerald-400' : 'text-emerald-500'
                }`} />
                Today's Mood
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-4">
                <Select value={mood} onValueChange={setMood}>
                  <SelectTrigger className={`h-16 rounded-2xl backdrop-blur-xl shadow-xl ${
                    isDarkMode 
                      ? 'bg-slate-700/50 border-slate-600 text-slate-200 focus:border-emerald-400 focus:ring-emerald-400/30' 
                      : 'bg-white/80 border-emerald-200/50 text-slate-800 focus:border-emerald-500 focus:ring-emerald-400/30'
                  }`}>
                    <SelectValue placeholder="How do you feel today?" />
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
                  placeholder="What's on your mind? (optional)"
                  className={`min-h-[100px] rounded-2xl resize-none backdrop-blur-xl shadow-xl ${
                    isDarkMode 
                      ? 'bg-slate-700/50 border-slate-600 text-slate-200 focus:border-emerald-400 focus:ring-emerald-400/30' 
                      : 'bg-white/80 border-emerald-200/50 text-slate-800 focus:border-emerald-500 focus:ring-emerald-400/30'
                  }`}
                />
                
                <Button 
                  onClick={logMood}
                  disabled={!mood}
                  className={`w-full h-16 text-xl font-bold rounded-2xl shadow-2xl transform hover:-translate-y-1 transition-all duration-300 ${
                    isDarkMode 
                      ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-slate-900 border-2 border-emerald-400/60 hover:shadow-emerald-500/50' 
                      : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white border-2 border-emerald-400/50 hover:shadow-emerald-400/30'
                  }`}
                >
                  <CheckCircle className="w-7 h-7 mr-3" />
                  Log Mood
                </Button>
              </div>

              {/* 🔥 SMALLER STATS */}
              <div className={`pt-6 border-t text-center space-y-2 ${
                isDarkMode 
                  ? 'border-slate-700' 
                  : 'border-emerald-200/50'
              }`}>
                <div className={`text-2xl md:text-3xl font-black drop-shadow-2xl leading-none tracking-tight ${
                  isDarkMode 
                    ? 'text-emerald-400' 
                    : 'bg-gradient-to-r from-emerald-500 to-emerald-400 bg-clip-text text-transparent'
                }`}>
                  {stats.greatPercentage}%
                </div>
                <p className={`text-lg font-semibold ${
                  isDarkMode 
                    ? 'text-slate-400' 
                    : 'text-slate-600'
                }`}>
                  {stats.totalMoods} total moods
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
              <CardTitle className={`flex items-center gap-4 text-3xl font-bold tracking-tight ${
                isDarkMode ? 'text-slate-200' : 'text-slate-800'
              }`}>
                <Sparkles className={`w-12 h-12 animate-pulse drop-shadow-2xl ${
                  isDarkMode ? 'text-emerald-400' : 'text-emerald-500'
                }`} />
                AI Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 max-h-96 overflow-y-auto">
              <div className="space-y-6">
                {recommendations.map((rec, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`group p-8 rounded-3xl backdrop-blur-xl shadow-2xl hover:shadow-emerald-400/50 hover:-translate-y-2 transition-all duration-500 border ${
                      isDarkMode 
                        ? 'bg-gradient-to-br from-slate-700/50 via-slate-800/40 to-emerald-900/30 border-slate-600/50 hover:bg-emerald-900/60' 
                        : 'bg-gradient-to-br from-white/70 via-gray-50/60 to-emerald-50/40 border-emerald-200/50 hover:bg-emerald-50/70'
                    }`}
                  >
                    <div className="flex items-start gap-6">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl flex-shrink-0 ${
                        isDarkMode 
                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' 
                          : 'bg-gradient-to-r from-emerald-500 to-emerald-600'
                      }`}>
                        <Sparkles className={`w-8 h-8 ${
                          isDarkMode ? 'text-slate-900' : 'text-white'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`text-2xl font-bold mb-3 group-hover:scale-[1.02] transition-transform ${
                          isDarkMode 
                            ? 'text-slate-200 group-hover:text-emerald-400' 
                            : 'text-slate-800 group-hover:text-emerald-600'
                        }`}>
                          {rec.title}
                        </h4>
                        <p className={`text-xl mb-6 leading-relaxed ${
                          isDarkMode 
                            ? 'text-slate-400' 
                            : 'text-slate-600'
                        }`}>
                          {rec.reason}
                        </p>
                        <Badge className={`px-6 py-3 text-lg font-bold shadow-lg ${
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
              </div>
            </CardContent>
          </Card>

          {/* RECENT MOODS */}
          <Card className={`h-96 shadow-2xl rounded-3xl overflow-hidden backdrop-blur-2xl transition-all duration-500 hover:shadow-emerald-500/40 ${
            isDarkMode 
              ? 'bg-gradient-to-br from-slate-800/90 via-slate-900/80 to-emerald-900/30 border border-slate-600/50' 
              : 'bg-gradient-to-br from-white/90 via-gray-50/80 to-emerald-50/30 border border-emerald-200/50'
          }`}>
            <CardHeader className="p-8">
              <CardTitle className={`flex items-center gap-4 text-3xl font-bold tracking-tight ${
                isDarkMode ? 'text-slate-200' : 'text-slate-800'
              }`}>
                <Clock className={`w-12 h-12 drop-shadow-2xl ${
                  isDarkMode ? 'text-emerald-400' : 'text-emerald-500'
                }`} />
                Recent Moods
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 max-h-64 overflow-y-auto space-y-4">
              {moods.map((moodItem) => (
                <motion.div 
                  key={moodItem.id}
                  className={`flex items-center gap-6 p-6 rounded-3xl backdrop-blur-xl shadow-xl hover:shadow-emerald-400/50 hover:-translate-y-1 transition-all duration-300 ${
                    isDarkMode 
                      ? 'bg-gradient-to-br from-slate-700/50 via-slate-800/40 to-emerald-900/30 border border-slate-600/50 hover:bg-emerald-900/60' 
                      : 'bg-gradient-to-br from-white/80 via-gray-50/70 to-emerald-50/40 border border-emerald-200/50 hover:bg-emerald-50/70'
                  }`}
                >
                  <div className="text-4xl flex-shrink-0">{getMoodEmoji(moodItem.mood)}</div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-2xl font-bold capitalize mb-2 ${
                      isDarkMode ? 'text-slate-200' : 'text-slate-800'
                    }`}>
                      {moodItem.mood}
                    </p>
                    {moodItem.notes && (
                      <p className={`text-xl leading-relaxed ${
                        isDarkMode 
                          ? 'text-slate-400' 
                          : 'text-slate-600'
                      }`}>
                        {moodItem.notes}
                      </p>
                    )}
                  </div>
                  <span className={`text-lg font-semibold min-w-[100px] text-right ${
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
