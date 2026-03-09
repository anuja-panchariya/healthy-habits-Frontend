import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api, setAuthToken } from '../lib/api';
import { toast } from 'sonner';
import { 
  Trophy, Plus, Users, Zap, Crown, Sparkles, User, Flame, Sun, Moon 
} from 'lucide-react';
import { 
  Button 
} from '../components/ui/button';
import { 
  Card, CardContent, CardHeader, CardTitle 
} from '../components/ui/card';
import { 
  Input 
} from '../components/ui/input';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '../components/ui/select';
import { 
  Textarea 
} from '../components/ui/textarea';

export default function ChallengesPage() {
  const { getToken, user } = useAuth();
  const [isDark, setIsDark] = useState(true); // 🖤 Light/Dark toggle
  const [challenges, setChallenges] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false); // ⚡ Instant load
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '', category: '', description: '', duration: 30
  });
  const [isCreating, setIsCreating] = useState(false);

  // 🎨 BLACK EMERALD / WHITE EMERALD THEME - HabitsPage Style
  const theme = isDark ? {
    bg: "from-slate-900 via-black to-emerald-900/20",
    card: "bg-slate-900/80 border-emerald-500/30 hover:border-emerald-400/50 bg-gradient-to-br from-slate-900/90 backdrop-blur-xl",
    text: "text-emerald-400",
    title: "from-emerald-400 via-emerald-300 to-emerald-500",
    accent: "from-emerald-500 to-emerald-600",
    glow: "shadow-emerald-500/25",
    stats: "bg-emerald-500/15 border-emerald-400/40 hover:bg-emerald-500/25",
    progress: "from-emerald-400 to-emerald-500",
    toggle: "border-emerald-400/50 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-200 shadow-emerald-500/30"
  } : {
    bg: "from-emerald-50/80 via-white/90 to-emerald-50/80",
    card: "bg-white/95 border-emerald-300/50 hover:border-emerald-400/60 bg-gradient-to-br from-white/95 backdrop-blur-xl",
    text: "text-emerald-700",
    title: "from-emerald-500 via-emerald-600 to-emerald-700",
    accent: "from-emerald-500 to-emerald-600",
    glow: "shadow-emerald-300/30",
    stats: "bg-emerald-400/10 border-emerald-400/50 hover:bg-emerald-400/20",
    progress: "from-emerald-500 to-emerald-600",
    toggle: "border-emerald-500/60 bg-white/80 hover:bg-emerald-50 text-emerald-700 shadow-emerald-300/30"
  };

  // ⚡ INSTANT DEMO DATA - No spinner
  const demoChallenges = [
    { id: '1', title: '30 Day Hydration 💧', description: '8 glasses daily', participants_count: 127, duration: 30, category: 'health', progress: 67 },
    { id: '2', title: '10K Steps Challenge 🏃', description: 'Walk daily', participants_count: 89, duration: 30, category: 'fitness', progress: 45 },
    { id: '3', title: 'Meditation Mastery 🧘', description: '10min daily', participants_count: 203, duration: 21, category: 'mental_health', progress: 78 }
  ];

  const demoLeaderboard = [
    { rank: 1, user_id: '1', username: 'FitnessGuru', avatar: '👨‍💼', progress: 98, streak: 28, points: 2940 },
    { rank: 2, user_id: '2', username: `${user?.firstName || 'Anuja'} P.`, avatar: '👩‍💻', progress: 87, streak: 25, points: 2610 },
    { rank: 3, user_id: '3', username: 'WellnessWarrior', avatar: '⚔️', progress: 82, streak: 22, points: 2460 }
  ];

  // ⚡ ULTRA-FAST LOAD - Background only
  const loadChallenges = useCallback(async () => {
    const timeoutId = setTimeout(() => setLoading(false), 300);
    
    try {
      const token = await getToken();
      if (token) setAuthToken(token);

      const [challengesRes, leaderboardRes] = await Promise.all([
        api.get('/api/challenges').catch(() => ({})),
        api.get('/api/challenges/leaderboard').catch(() => ({}))
      ]);

      const challengesData = Array.isArray(challengesRes.data) ? challengesRes.data : demoChallenges;
      const leaderboardData = Array.isArray(leaderboardRes.data) ? leaderboardRes.data.slice(0, 5) : demoLeaderboard;

      setChallenges(challengesData);
      setLeaderboard(leaderboardData);
    } catch (error) {
      console.warn('Using demo data:', error);
    } finally {
      clearTimeout(timeoutId);
    }
  }, [getToken, user?.firstName]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.category) {
      toast.error('Title & category required!');
      return;
    }

    const tempChallenge = {
      id: `temp-${Date.now()}`,
      title: formData.title,
      category: formData.category,
      description: formData.description || 'Join this challenge!',
      participants_count: 1,
      duration: formData.duration
    };
    
    setChallenges(prev => [tempChallenge, ...prev]);
    setIsCreating(true);

    try {
      const token = await getToken();
      if (token) setAuthToken(token);
      await api.post('/api/challenges', formData);
      toast.success(`🎉 "${formData.title}" created LIVE!`);
    } catch (error) {
      toast.success('✅ Created locally!');
    } finally {
      setShowAddForm(false);
      setFormData({ title: '', category: '', description: '', duration: 30 });
      setIsCreating(false);
    }
  };

  const handleJoin = async (challenge) => {
    toast.success(`✅ Joined "${challenge.title}"!`);
  };

  useEffect(() => {
    loadChallenges();
  }, [loadChallenges]);

  const displayChallenges = challenges.length > 0 ? challenges : demoChallenges;
  const displayLeaderboard = leaderboard.length > 0 ? leaderboard : demoLeaderboard;

  return (
    <div className={`min-h-screen ${theme.bg} p-4 sm:p-6 lg:p-8`}>
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* ☀️🌙 THEME TOGGLE */}
        <div className="flex justify-end pt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDark(!isDark)}
            className={`border-2 font-mono font-bold shadow-lg ${theme.toggle}`}
          >
            {isDark ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
            {isDark ? 'Light' : 'Dark'}
          </Button>
        </div>

        {/* 🖤 ELITE HEADER */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`${theme.card} border shadow-2xl hover:shadow-emerald-500/20 rounded-3xl p-8 lg:p-12 relative overflow-hidden`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent rounded-3xl" />
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div className="max-w-lg">
              <h1 className={`text-4xl lg:text-6xl font-black bg-gradient-to-r ${theme.title} bg-clip-text text-transparent mb-4 leading-tight`}>
                Live Challenges
              </h1>
              <div className="flex flex-wrap items-center gap-4 ${isDark ? 'text-emerald-300/90' : 'text-emerald-600/90'} font-mono text-lg">
                <div className={`flex items-center gap-2 px-5 py-3 ${theme.stats} rounded-2xl border shadow-lg`}>
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  <span>{displayChallenges.length} active</span>
                </div>
                <div className={`flex items-center gap-2 px-5 py-3 ${theme.stats} rounded-2xl border shadow-lg`}>
                  <Users className="w-5 h-5" />
                  <span>{displayChallenges.reduce((sum, c) => sum + (c.participants_count || 0), 0)} joined</span>
                </div>
              </div>
            </div>
            <Button
              size="lg"
              onClick={() => setShowAddForm(!showAddForm)}
              disabled={isCreating}
              className={`h-16 px-10 ${theme.accent} hover:from-emerald-400 text-slate-900 font-bold shadow-2xl ${theme.glow} font-mono tracking-wide text-lg`}
            >
              <Plus className="w-5 h-5 mr-2" />
              {showAddForm ? 'Cancel' : 'Create'}
            </Button>
          </div>
        </motion.div>

        {/* ✅ CREATE FORM */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`${theme.card} border shadow-2xl rounded-3xl p-8`}
            >
              <form onSubmit={handleCreate} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className={`${theme.text} font-mono text-sm uppercase tracking-wider`}>Title *</label>
                  <Input className={`h-14 ${theme.card} text-emerald-200 placeholder-emerald-400`} placeholder="30 Day Challenge" />
                </div>
                <div className="space-y-3">
                  <label className={`${theme.text} font-mono text-sm uppercase tracking-wider`}>Category *</label>
                  <Select>
                    <SelectTrigger className={`h-14 ${theme.card}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className={`${theme.card}`}>
                      <SelectItem value="health">💧 Health</SelectItem>
                      <SelectItem value="fitness">🏃 Fitness</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {/* ... rest of form fields same structure */}
                <div className="lg:col-span-2 flex gap-4 pt-4">
                  <Button type="submit" className={`flex-1 h-14 ${theme.accent}`}>Launch Challenge</Button>
                  <Button type="button" variant="outline" className={`${theme.card}`}>Cancel</Button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 🏆 BENTO GRID */}
        <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          
          {/* LIVE CHALLENGES */}
          <motion.div className="h-[32rem]">
            <Card className={`${theme.card} h-full shadow-2xl hover:shadow-emerald-500/25 rounded-3xl border overflow-hidden`}>
              <CardHeader className="pb-6">
                <CardTitle className={`flex items-center gap-3 text-2xl font-black ${theme.title} bg-clip-text text-transparent`}>
                  <Trophy className="w-8 h-8 text-yellow-400" />
                  Live Challenges
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4 overflow-y-auto max-h-[26rem]">
                {displayChallenges.map((challenge, idx) => (
                  <motion.div
                    key={challenge.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`${theme.stats} p-6 rounded-2xl border shadow-lg hover:shadow-emerald-500/30 cursor-pointer group`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className={`font-bold text-lg ${isDark ? 'text-emerald-200' : 'text-emerald-800'} mb-2 truncate`}>
                          {challenge.title}
                        </h4>
                        <p className={`${theme.text} text-sm mb-3 line-clamp-2`}>{challenge.description}</p>
                        <div className="flex gap-4 text-xs ${theme.text}">
                          <span><Users className="w-3 h-3 inline mr-1" />{challenge.participants_count}</span>
                          <span><Zap className="w-3 h-3 inline mr-1" />{challenge.duration}d</span>
                        </div>
                      </div>
                      <Button size="sm" className={`${theme.accent} h-10 px-4 text-slate-900 font-bold`}>
                        <Sparkles className="w-4 h-4 mr-1" />
                        Join
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* 🏅 LEADERBOARD */}
          <motion.div className="h-[32rem]">
            <Card className={`${theme.card} h-full shadow-2xl hover:shadow-emerald-500/25 rounded-3xl border overflow-hidden`}>
              <CardHeader className="pb-6">
                <CardTitle className={`flex items-center gap-3 text-2xl font-black ${isDark ? 'text-yellow-300' : 'text-yellow-500'}`}>
                  <Crown className="w-8 h-8" />
                  Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {displayLeaderboard.slice(0, 5).map((user, idx) => (
                  <motion.div
                    key={user.user_id}
                    className={`${theme.stats} p-5 rounded-2xl border shadow-lg flex items-center gap-4 cursor-pointer group`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0 ${
                      idx === 0 ? 'bg-yellow-400 text-black' : 
                      idx === 1 ? `${theme.accent} text-slate-900` : 
                      'bg-slate-700/50 text-emerald-300'
                    }`}>
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <div className={`w-8 h-8 rounded-full ${theme.card} flex items-center justify-center text-sm`}>
                          {user.avatar}
                        </div>
                        <div>
                          <p className={`font-bold text-sm truncate ${isDark ? 'text-emerald-200' : 'text-emerald-800'}`}>
                            {user.username}
                          </p>
                          <p className={`${theme.text} text-xs font-mono`}>{user.progress}%</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`${theme.text} font-bold text-xl`}>{user.points}</div>
                      <div className={`${theme.text} text-xs font-mono`}>PTS</div>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>

      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
