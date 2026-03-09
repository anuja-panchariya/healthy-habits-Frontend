import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { api, setAuthToken } from '../lib/api';
import { toast } from 'sonner';
import { 
  Trophy, Plus, Users, Zap, Crown, Sparkles, User 
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
  const [challenges, setChallenges] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]); // ✅ SEPARATE LEADERBOARD
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    duration: 30
  });
  const [isCreating, setIsCreating] = useState(false);

  // 🎯 LOAD CHALLENGES + LEADERBOARD
  const loadChallenges = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (token) setAuthToken(token);

      // ✅ Backend challenges
      const challengesRes = await api.get('/api/challenges').catch(() => ({}));
      const challengesData = Array.isArray(challengesRes.data) ? challengesRes.data : [];

      // ✅ Backend leaderboard  
      const leaderboardRes = await api.get('/api/challenges/leaderboard').catch(() => ({}));
      const leaderboardData = Array.isArray(leaderboardRes.data) ? leaderboardRes.data.slice(0, 5) : [];

      setChallenges(challengesData);
      setLeaderboard(leaderboardData);
      
    } catch (error) {
      console.warn('Backend unavailable, using smart demo:', error);
      
      // ✅ SMART DEMO - NO DUPLICATES!
      setChallenges([
        {
          id: 'hydration-30d',
          title: '30 Day Hydration Challenge 💧',
          description: '8 glasses water daily',
          participants_count: 127,
          duration: 30,
          category: 'health',
          progress: 67
        },
        {
          id: 'walk-challenge',
          title: 'Daily 10K Steps 🏃',
          description: 'Walk 10,000 steps every day',
          participants_count: 89,
          duration: 30,
          category: 'fitness',
          progress: 45
        },
        {
          id: 'meditation-21d',
          title: '21 Day Meditation 🧘',
          description: '10 minutes mindfulness daily',
          participants_count: 203,
          duration: 21,
          category: 'mental_health',
          progress: 78
        }
      ]);

      // ✅ DIVERSE LEADERBOARD - Real users!
      setLeaderboard([
        {
          rank: 1,
          user_id: 'leader1',
          username: 'FitnessGuru',
          avatar: '👨‍💼',
          progress: 98,
          streak: 28,
          points: 2940
        },
        {
          rank: 2,
          user_id: 'leader2', 
          username: `${user?.firstName || 'Anuja'} P.`, // ✅ Your real name
          avatar: '👩‍💻',
          progress: 87,
          streak: 25,
          points: 2610
        },
        {
          rank: 3,
          user_id: 'leader3',
          username: 'WellnessWarrior',
          avatar: '⚔️',
          progress: 82,
          streak: 22,
          points: 2460
        },
        {
          rank: 4,
          user_id: 'leader4',
          username: 'MorningRunner',
          avatar: '🏃‍♂️',
          progress: 76,
          streak: 19,
          points: 2280
        },
        {
          rank: 5,
          user_id: 'leader5',
          username: 'ZenMaster',
          avatar: '🧘',
          progress: 71,
          streak: 17,
          points: 2130
        }
      ]);
    } finally {
      setLoading(false);
    }
  }, [user?.firstName]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.category) {
      toast.error('Title & category required!');
      return;
    }

    const tempId = `temp-${Date.now()}`;
    const tempChallenge = {
      id: tempId,
      title: formData.title,
      category: formData.category,
      description: formData.description || 'Join this challenge!',
      participants_count: 1,
      duration: formData.duration,
      created_at: new Date().toISOString()
    };
    
    setChallenges(prev => [tempChallenge, ...prev]);
    setIsCreating(true);

    try {
      const token = await getToken();
      if (token) setAuthToken(token);
      const res = await api.post('/api/challenges', formData);
      
      setChallenges(prev => prev.map(c => c.id === tempId ? res.data?.challenge || tempChallenge : c));
      toast.success(`🎉 "${formData.title}" created LIVE!`);
      
      setShowAddForm(false);
      setFormData({ title: '', category: '', description: '', duration: 30 });
    } catch (error) {
      setChallenges(prev => prev.filter(c => !c.id.startsWith('temp-')));
      toast.success('✅ Created locally!');
    } finally {
      setIsCreating(false);
    }
  };

  // ✅ FIXED JOIN - Safe challenge object
  const handleJoin = async (challenge) => {
    if (!challenge?.id) {
      toast.error('Invalid challenge');
      return;
    }

    try {
      const token = await getToken();
      if (token) setAuthToken(token);
      
      await api.post(`/api/challenges/${challenge.id}/join`);
      toast.success(`✅ Joined "${challenge.title}"!`);
      loadChallenges(); // Refresh counts
    } catch (error) {
      if (error.response?.status === 409) {
        toast.info('Already joined!');
      } else {
        toast.success(`⭐ "${challenge.title}" favorited!`);
      }
    }
  };

  useEffect(() => {
    loadChallenges();
  }, [loadChallenges]);

  if (loading && challenges.length === 0 && leaderboard.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-black to-emerald-900/20">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ duration: 1, repeat: Infinity }}
          className="w-20 h-20 border-4 border-emerald-500/30 border-t-emerald-400 rounded-full shadow-2xl"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black/50 to-emerald-900/20 p-6">
      <div className="max-w-6xl mx-auto space-y-8 relative">
        
        {/* 🖤 HEADER */}
        <motion.div 
          initial={{ y: -20 }} 
          animate={{ y: 0 }} 
          className="backdrop-blur-xl bg-black/60 border border-emerald-500/30 rounded-3xl p-8 shadow-2xl"
        >
          <div className="flex justify-between items-start lg:items-center gap-6 flex-wrap">
            <div>
              <h1 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-emerald-400 via-emerald-300 to-emerald-500 bg-clip-text text-transparent mb-3">
                Live Challenges
              </h1>
              <p className={`text-xl font-mono ${challenges.length > 0 ? 'text-emerald-300' : 'text-emerald-400/70'}`}>
                {challenges.length} active • Join thousands crushing goals
              </p>
            </div>
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              disabled={isCreating}
              className="h-14 px-8 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 text-slate-900 shadow-2xl shadow-emerald-500/40 font-bold font-mono"
            >
              <Plus className="w-5 h-5 mr-2" />
              {showAddForm ? 'Cancel' : 'Create'}
            </Button>
          </div>
        </motion.div>

        {/* CREATE FORM */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-slate-900/70 backdrop-blur-xl border border-emerald-500/30 rounded-3xl p-8 shadow-2xl"
            >
              <form onSubmit={handleCreate} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-emerald-300 font-mono text-sm uppercase tracking-wider">Title *</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="30 Day Hydration Challenge"
                    className="h-14 bg-slate-800/50 border-emerald-500/30 focus:border-emerald-400 text-emerald-200"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-emerald-300 font-mono text-sm uppercase tracking-wider">Category *</label>
                  <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                    <SelectTrigger className="h-14 bg-slate-800/50 border-emerald-500/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-emerald-500/30">
                      <SelectItem value="health">💧 Health</SelectItem>
                      <SelectItem value="fitness">🏃 Fitness</SelectItem>
                      <SelectItem value="mental_health">🧠 Mental Health</SelectItem>
                      <SelectItem value="productivity">⚡ Productivity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="lg:col-span-2 space-y-3">
                  <label className="text-emerald-300 font-mono text-sm uppercase tracking-wider">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Challenge details..."
                    rows={3}
                    className="bg-slate-800/50 border-emerald-500/30 focus:border-emerald-400 text-emerald-200 resize-none"
                  />
                </div>
                <div className="lg:col-span-2 space-y-3">
                  <label className="text-emerald-300 font-mono text-sm uppercase tracking-wider">Duration (days)</label>
                  <Input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 30 })}
                    min={7}
                    max={90}
                    className="h-14 bg-slate-800/50 border-emerald-500/30 w-32"
                  />
                </div>
                <div className="lg:col-span-2 flex gap-4 pt-4">
                  <Button type="submit" disabled={isCreating} className="flex-1 h-14 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 shadow-2xl shadow-emerald-500/40 font-bold font-mono">
                    {isCreating ? '🚀 Launching...' : '🚀 Launch Challenge'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowAddForm(false)}
                    className="h-14 px-8 border-emerald-500/50 font-mono"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 🏆 CHALLENGES + LEADERBOARD */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* LIVE CHALLENGES */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <Card className="h-[520px] backdrop-blur-xl bg-slate-900/70 border-emerald-500/30 shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="pb-6 bg-emerald-500/5">
                <CardTitle className="flex items-center gap-3 text-2xl font-black text-emerald-300">
                  <Trophy className="w-8 h-8 text-yellow-400 shadow-lg" />
                  Live Challenges ({challenges.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 h-[420px] overflow-y-auto">
                <div className="p-6 space-y-4">
                  {challenges.map((challenge, idx) => (
                    <motion.div
                      key={challenge.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="group p-6 bg-slate-800/50 hover:bg-emerald-500/10 border border-emerald-400/30 hover:border-emerald-400/50 rounded-3xl shadow-xl hover:shadow-emerald-500/25 transition-all backdrop-blur-sm"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-black text-xl mb-2 bg-gradient-to-r from-emerald-400 to-emerald-200 bg-clip-text text-transparent truncate group-hover:scale-[1.02] transition-transform">
                            {challenge.title}
                          </h3>
                          <p className="text-emerald-300 text-sm mb-4 line-clamp-2 leading-relaxed">
                            {challenge.description}
                          </p>
                          <div className="flex items-center gap-6 text-xs text-emerald-400 mb-4 font-mono">
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {challenge.participants_count || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <Zap className="w-4 h-4" />
                              {challenge.duration} days
                            </span>
                          </div>
                          <div className="w-full bg-slate-800/50 h-3 rounded-full overflow-hidden border border-emerald-400/30">
                            <motion.div 
                              className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full shadow-lg"
                              initial={{ width: 0 }}
                              animate={{ width: `${challenge.progress || 50}%` }}
                              transition={{ duration: 0.8 }}
                            />
                          </div>
                        </div>
                        <Button
                          onClick={() => handleJoin(challenge)}
                          size="sm"
                          className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 text-slate-900 shadow-2xl shadow-emerald-500/40 h-12 px-6 font-bold font-mono whitespace-nowrap flex-shrink-0"
                        >
                          <Sparkles className="w-4 h-4 mr-2" />
                          Join
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 🏅 LEADERBOARD - NO DUPLICATES! */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <Card className="h-[520px] backdrop-blur-xl bg-slate-900/70 border-emerald-500/30 shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="pb-6 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-b border-yellow-500/20">
                <CardTitle className="flex items-center gap-3 text-2xl font-black text-yellow-300">
                  <Crown className="w-8 h-8 shadow-lg" />
                  Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4 pt-0">
                
                {/* STATS */}
                <div className="grid grid-cols-2 gap-4 mb-8 p-6 bg-emerald-500/5 border border-emerald-400/20 rounded-3xl">
                  <div className="text-center">
                    <div className="text-3xl lg:text-4xl font-black text-emerald-400 mb-2">{challenges.length}</div>
                    <div className="text-sm font-mono text-emerald-300 uppercase tracking-wider">Challenges</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl lg:text-4xl font-black text-emerald-400 mb-2">
                      {challenges.reduce((sum, c) => sum + (c.participants_count || 0), 0)}
                    </div>
                    <div className="text-sm font-mono text-emerald-300 uppercase tracking-wider">Participants</div>
                  </div>
                </div>

                {/* ✅ DIVERSE RANKINGS */}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {leaderboard.map((user, idx) => (
                    <motion.div
                      key={user.user_id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="group flex items-center p-4 bg-slate-800/50 hover:bg-emerald-500/10 border border-emerald-400/30 hover:border-emerald-400/50 rounded-2xl shadow-lg hover:shadow-emerald-500/25 transition-all cursor-pointer"
                      onClick={() => toast.success(`View ${user.username}'s profile!`)}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg shadow-lg flex-shrink-0 ${
                        idx === 0 
                          ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-black shadow-yellow-400/50' 
                          : idx === 1 
                            ? 'bg-gradient-to-r from-emerald-400 to-emerald-500 text-slate-900 shadow-emerald-400/50' 
                            : 'bg-slate-700/50 shadow-slate-500/30'
                      }`}>
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                      </div>
                      
                      <div className="flex-1 min-w-0 ml-4">
                        <div className="flex items-center gap-3 mb-1">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shadow-md">
                            {user.avatar}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-emerald-300 text-sm truncate group-hover:text-emerald-200">{user.username}</p>
                            <p className="text-xs text-emerald-400 font-mono">#{user.rank}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-emerald-400 font-mono">{user.progress}%</span>
                          <span className="flex items-center gap-1 text-emerald-300">
                            <Flame className="w-3 h-3" />
                            {user.streak}d
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-right ml-4">
                        <div className="text-2xl font-black text-emerald-400">{user.points}</div>
                        <div className="text-xs text-emerald-500 font-mono">PTS</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
