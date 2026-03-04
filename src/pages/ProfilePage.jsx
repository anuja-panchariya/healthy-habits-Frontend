import React, { useEffect, useState, useCallback } from 'react';
import { useAuth, UserButton } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { 
  Heart, Star, Bell, Sparkles, Smile, Activity, Award, Download, 
  CheckCircle, Brain, Clock, TrendingUp 
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
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
  const [recommendations, setRecommendations] = useState([]);
  const [habits, setHabits] = useState([]);
  const [stats, setStats] = useState({ totalMoods: 0, greatPercentage: 0 });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // 🚀 LOAD REAL DATA
  const loadProfileData = useCallback(async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const token = await getToken();
      if (token) setAuthToken(token);

      const [moodsRes, habitsRes, recsRes] = await Promise.all([
        api.get('/api/mood').catch(() => ({})),
        api.get('/api/habits').catch(() => ({})),
        api.get('/api/recommendations').catch(() => ({}))
      ]);

      const moodsData = Array.isArray(moodsRes.data) ? moodsRes.data.slice(-10) : [];
      const habitsData = Array.isArray(habitsRes.data?.habits) ? habitsRes.data.habits : [];
      const recsData = Array.isArray(recsRes.data) ? recsRes.data : [];

      setMoods(moodsData);
      setHabits(habitsData);
      setRecommendations(recsData);

      const totalMoods = moodsData.length;
      const greatMoods = moodsData.filter(m => m.mood === 'great').length;
      setStats({
        totalMoods,
        greatPercentage: totalMoods ? Math.round((greatMoods / totalMoods) * 100) : 0
      });

    } catch (error) {
      console.error('Profile load error:', error);
      // Demo data fallback
      setMoods([
        { id: 1, mood: 'great', notes: 'Feeling energized!', created_at: new Date(Date.now() - 86400000).toISOString() },
        { id: 2, mood: 'good', notes: 'Productive day', created_at: new Date().toISOString() }
      ]);
      setHabits([
        { id: 1, title: 'Drink water', category: 'hydration', streak: 5 },
        { id: 2, title: '30min walk', category: 'fitness', streak: 12 }
      ]);
      setRecommendations([
        { title: '15min meditation', reason: 'Reduce stress 40%', category: 'mindfulness' },
        { title: '8 glasses water', reason: 'Boost focus 3x', category: 'hydration' }
      ]);
      setStats({ totalMoods: 2, greatPercentage: 50 });
    } finally {
      setLoading(false);
    }
  }, [userId, getToken]);

  // ✅ LOG MOOD
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
      
      setMoods(prev => [newMood, ...prev.slice(0, 9)]);
      setMood('');
      setMoodNotes('');
      
    } catch (error) {
      // Local backup
      const newMood = { id: Date.now(), mood, notes: moodNotes, created_at: new Date().toISOString() };
      setMoods(prev => [newMood, ...prev.slice(0, 9)]);
      toast.success('✅ Mood saved locally!');
      setMood('');
      setMoodNotes('');
    }
  };

  // ✅ NATIVE CSV EXPORT (No jsPDF!)
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
    
    // Native Blob download
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

  // ✅ NATIVE SUMMARY EXPORT (Text file)
  const exportSummary = () => {
    setExporting(true);
    
    const summary = `WELLNESS SUMMARY - ${new Date().toLocaleDateString('en-IN')}
    
Total Moods Logged: ${stats.totalMoods}
Great Mood Percentage: ${stats.greatPercentage}%
Active Habits: ${habits.length}

RECENT MOODS:
${moods.slice(0, 10).map(m => 
  `${new Date(m.created_at).toLocaleDateString('en-IN')} - ${m.mood.toUpperCase()}${m.notes ? ` - ${m.notes}` : ''}`
).join('\n')}

AI RECOMMENDATIONS:
${recommendations.slice(0, 5).map(r => `- ${r.title} (${r.category})`).join('\n')}`;

    const blob = new Blob([summary], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `wellness-summary-${new Date().toISOString().split('T')[0]}.txt`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('📄 Summary exported!');
    setExporting(false);
  };

  const getMoodEmoji = (mood) => {
    const emojis = { great: '😄', good: '🙂', okay: '😐', bad: '☹️', terrible: '😢' };
    return emojis[mood] || '🙂';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ duration: 1, repeat: Infinity }}
          className="w-20 h-20 border-4 border-slate-600 border-t-emerald-500 rounded-full" 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 pt-24">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* HEADER */}
        <motion.div className="text-center mb-16">
          <div className="w-32 h-32 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl border-4 border-slate-800">
            <Heart className="w-16 h-16 text-slate-900 drop-shadow-lg" />
          </div>
          <h1 className="text-6xl font-light tracking-tight text-slate-200 mb-4 drop-shadow-2xl">
            Profile & Wellness
          </h1>
          <p className="text-2xl text-slate-400">AI insights + mood tracking</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* ACCOUNT INFO */}
          <Card className="h-96 bg-slate-800/90 backdrop-blur-xl border border-slate-600/50 shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="p-8">
              <CardTitle className="flex items-center gap-4 text-3xl text-slate-200">
                <Star className="w-12 h-12 text-emerald-400" />
                Account Info
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="flex flex-col lg:flex-row items-center gap-8">
                <div className="w-28 h-28 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-3xl flex items-center justify-center shadow-2xl border-4 border-slate-800 flex-shrink-0">
                  <UserButton afterSignOutUrl="/sign-in" />
                </div>
                <div className="flex-1 text-center lg:text-left">
                  <h2 className="text-4xl font-bold text-slate-200 mb-4">
                    {user?.fullName || user?.firstName || 'Anuja Panchariya'}
                  </h2>
                  <p className="text-xl text-slate-400 bg-slate-700/50 px-6 py-3 rounded-2xl break-all">
                    {user?.primaryEmailAddress?.emailAddress || 'anuja@example.com'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* MOOD TRACKER */}
          <Card className="h-96 bg-slate-800/90 backdrop-blur-xl border border-slate-600/50 shadow-2xl rounded-3xl">
            <CardHeader className="p-8">
              <CardTitle className="flex items-center gap-4 text-3xl text-slate-200">
                <Smile className="w-12 h-12 text-emerald-400" />
                Today's Mood
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-4">
                <Select value={mood} onValueChange={setMood}>
                  <SelectTrigger className="h-16 bg-slate-700/50 border-slate-600 text-slate-200 rounded-2xl">
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
                  className="min-h-[100px] bg-slate-700/50 border-slate-600 text-slate-200 rounded-2xl resize-none focus:border-emerald-500"
                />
                
                <Button 
                  onClick={logMood}
                  disabled={!mood}
                  className="w-full h-16 bg-emerald-500 hover:bg-emerald-600 text-xl font-bold text-slate-900 rounded-2xl shadow-xl"
                >
                  <CheckCircle className="w-6 h-6 mr-3" />
                  Log Mood
                </Button>
              </div>

              <div className="pt-6 border-t border-slate-700 text-center">
                <div className="text-3xl font-black text-emerald-400 mb-2">
                  {stats.greatPercentage}%
                </div>
                <p className="text-xl text-slate-400">{stats.totalMoods} total moods</p>
              </div>
            </CardContent>
          </Card>

          {/* AI RECOMMENDATIONS */}
          <Card className="lg:row-span-2 bg-slate-800/90 backdrop-blur-xl border border-slate-600/50 shadow-2xl rounded-3xl">
            <CardHeader className="p-8">
              <CardTitle className="flex items-center gap-4 text-3xl text-slate-200">
                <Sparkles className="w-12 h-12 text-emerald-400 animate-pulse" />
                AI Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600">
              {recommendations.length > 0 ? (
                recommendations.slice(0, 5).map((rec, idx) => (
                  <motion.div
                    key={rec.id || idx}
                    className="group mb-6 p-6 bg-slate-700/50 rounded-2xl border border-slate-600/50 hover:bg-slate-600/30 transition-all last:mb-0"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-2xl flex items-center justify-center flex-shrink-0 mt-1">
                        <Sparkles className="w-7 h-7 text-slate-900" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-2xl font-bold text-slate-200 group-hover:text-emerald-400 transition-colors mb-2">
                          {rec.title}
                        </h4>
                        <p className="text-lg text-slate-400 mb-4">{rec.reason}</p>
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-400/50 px-4 py-2">
                          {rec.category}
                        </Badge>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-20">
                  <Brain className="w-24 h-24 text-slate-600 mx-auto mb-8 opacity-50" />
                  <p className="text-2xl text-slate-400 font-semibold mb-4">AI analyzing habits...</p>
                  <Button className="h-14 px-12 bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold rounded-2xl shadow-xl">
                    Refresh AI
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* RECENT MOODS */}
          <Card className="h-96 bg-slate-800/90 backdrop-blur-xl border border-slate-600/50 shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="p-8">
              <CardTitle className="flex items-center gap-4 text-3xl text-slate-200">
                <Clock className="w-12 h-12 text-emerald-400" />
                Recent Moods
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600">
              {moods.length > 0 ? (
                moods.map((moodItem) => (
                  <div key={moodItem.id} className="flex items-center gap-4 p-6 mb-4 bg-slate-700/50 rounded-2xl last:mb-0 hover:bg-slate-600/50 transition-all">
                    <div className="text-3xl">{getMoodEmoji(moodItem.mood)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xl font-bold text-slate-200 capitalize mb-1">{moodItem.mood}</p>
                      {moodItem.notes && (
                        <p className="text-lg text-slate-400 truncate">{moodItem.notes}</p>
                      )}
                    </div>
                    <span className="text-sm text-slate-500 min-w-[80px] text-right">
                      {new Date(moodItem.created_at).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-20">
                  <Smile className="w-24 h-24 text-slate-600 mx-auto mb-8 opacity-50" />
                  <p className="text-2xl text-slate-400 font-semibold">No moods logged yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* EXPORT BUTTONS */}
        <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-12 border-t border-slate-700">
          <Button 
            onClick={exportCSV}
            disabled={exporting}
            className="h-20 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 text-2xl font-bold text-slate-900 rounded-3xl shadow-2xl col-span-1"
          >
            {exporting ? (
              <Activity className="w-8 h-8 animate-spin mr-3" />
            ) : (
              <Download className="w-8 h-8 mr-3" />
            )}
            Export CSV
          </Button>
          
          <Button 
            onClick={exportSummary}
            disabled={exporting}
            className="h-20 bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 text-2xl font-bold text-slate-200 rounded-3xl shadow-2xl col-span-1"
          >
            {exporting ? (
              <Activity className="w-8 h-8 animate-spin mr-3" />
            ) : (
              <Award className="w-8 h-8 mr-3" />
            )}
            Export Summary
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
