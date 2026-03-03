import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Users, Crown, Flame, Zap, CheckCircle, Plus, Sun, Moon, 
  Share2, Loader2, Target, TrendingUp 
} from 'lucide-react';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Switch } from '../components/ui/switch';
import { api, setAuthToken } from '../lib/api';
import { toast } from 'sonner';

export default function ChallengesPage() {
  const { getToken, userId } = useAuth();
  const [isDark, setIsDark] = useState(false);
  const [challenges, setChallenges] = useState([]);
  const [myChallenges, setMyChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);

  // 🎯 THEME TOGGLE
  useEffect(() => {
    const saved = localStorage.getItem('darkMode') === 'true';
    setIsDark(saved);
    document.documentElement.classList.toggle('dark', saved);
  }, []);

  const toggleDarkMode = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    localStorage.setItem('darkMode', newDark);
    document.documentElement.classList.toggle('dark', newDark);
  };

  // 🚀 LOAD CHALLENGES DATA
  const loadChallengesData = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getToken();
      setAuthToken(token);

      const [challengesRes, myChallengesRes, leaderboardRes] = await Promise.allSettled([
        api.get('/api/challenges'),
        api.get('/api/challenges/my'),
        api.get('/api/challenges/leaderboard')
      ]);

      setChallenges(challengesRes.status === "fulfilled" ? (challengesRes.value.data || challengesRes.value || []) : []);
      setMyChallenges(myChallengesRes.status === "fulfilled" ? (myChallengesRes.value.data || myChallengesRes.value || []) : []);
      setLeaderboard(leaderboardRes.status === "fulfilled" ? (leaderboardRes.value.data || leaderboardRes.value || []) : []);

    } catch (error) {
      console.error('Challenges load error:', error);
      // Mock data fallback
      setChallenges([
        { id: 1, title: '30 Day Water Challenge', participants: 1245, progress: 67, reward: '💧 Hydration Master', color: 'from-blue-500 to-cyan-500' },
        { id: 2, title: '7 Day Meditation Streak', participants: 892, progress: 45, reward: '🧘‍♀️ Zen Master', color: 'from-purple-500 to-pink-500' },
        { id: 3, title: '21 Day Fitness Challenge', participants: 2345, progress: 78, reward: '🏋️ Fitness Pro', color: 'from-emerald-500 to-green-600' }
      ]);
      setMyChallenges([
        { id: 1, title: '30 Day Water Challenge', progress: 12, daysLeft: 18, streak: 5, completed: false }
      ]);
      setLeaderboard([
        { name: 'Anuja Panchariya', score: 245, rank: 1 },
        { name: 'Rahul Sharma', score: 198, rank: 2 },
        { name: 'Priya Patel', score: 167, rank: 3 }
      ]);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    if (userId) {
      loadChallengesData();
    }
  }, [userId, loadChallengesData]);

  // 🎯 JOIN CHALLENGE
  const joinChallenge = async (challengeId) => {
    try {
      const token = await getToken();
      setAuthToken(token);
      await api.post(`/api/challenges/${challengeId}/join`);
      toast.success('✅ Joined challenge!');
      loadChallengesData();
    } catch (error) {
      toast.error('Failed to join challenge');
    }
  };

  // 🏆 LOG CHALLENGE PROGRESS
  const logChallengeProgress = async (challengeId) => {
    try {
      const token = await getToken();
      setAuthToken(token);
      await api.post(`/api/challenges/${challengeId}/progress`);
      toast.success('✅ Progress logged!');
      loadChallengesData();
    } catch (error) {
      toast.error('Failed to log progress');
    }
  };

  if (loading) {
    return (
      <motion.div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="text-center">
          <motion.div 
            animate={{ rotate: 360 }} 
            transition={{ duration: 1, repeat: Infinity }}
            className="w-16 h-16 border-4 border-emerald-200 dark:border-slate-500 border-t-emerald-500 dark:border-t-slate-300 rounded-full mx-auto mb-4" 
          />
          <p className="text-gray-600 dark:text-slate-300 text-lg">Loading challenges...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 sm:p-6 lg:p-8 transition-all duration-300"
    >
      <div className="max-w-7xl mx-auto space-y-8 relative">
        
        {/* 🌙 THEME TOGGLE */}
        <motion.div 
          className="absolute top-6 right-6 z-50 flex items-center gap-2 p-3 rounded-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-emerald-200 dark:border-slate-600 shadow-xl hover:shadow-2xl"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <Sun className={`w-5 h-5 ${isDark ? 'text-slate-500' : 'text-emerald-500'}`} />
          <Switch checked={isDark} onCheckedChange={toggleDarkMode} />
          <Moon className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-slate-500'}`} />
        </motion.div>

        {/* ✨ HEADER */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6"
        >
          <div>
            <h1 className="font-serif font-light text-5xl lg:text-6xl tracking-tight bg-gradient-to-r from-gray-900 dark:from-slate-100 to-emerald-600 dark:to-emerald-400 bg-clip-text text-transparent mb-2">
              Challenges
            </h1>
            <p className="text-xl text-gray-600 dark:text-slate-300">
              Compete with friends • Win rewards • Build streaks
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button className="h-14 px-8 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 dark:from-emerald-600 dark:to-emerald-500 shadow-xl text-lg font-semibold text-white">
              <Crown className="w-5 h-5 mr-2" />
              Leaderboard
            </Button>
            <Button 
              onClick={() => setShowCreateDialog(true)}
              className="h-14 px-8 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 shadow-xl text-lg font-semibold text-white"
            >
              <Plus className="w-5 h-5 mr-2" />
              New Challenge
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* 🏆 ACTIVE CHALLENGES */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-2xl dark:shadow-3xl border-0 h-[32rem] overflow-hidden">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-2xl text-gray-900 dark:text-white">
                  <Trophy className="w-8 h-8 text-yellow-500" />
                  Active Challenges
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[26rem] overflow-y-auto space-y-4 p-6">
                  {challenges.map((challenge) => (
                    <motion.div
                      key={challenge.id}
                      whileHover={{ scale: 1.02 }}
                      className="group bg-gradient-to-r from-emerald-50/50 to-emerald-100/30 dark:from-slate-700/50 dark:to-slate-600/20 p-6 rounded-3xl border-2 border-emerald-200 dark:border-slate-500 hover:border-emerald-300 dark:hover:border-slate-400 transition-all backdrop-blur-sm"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 truncate">{challenge.title}</h3>
                          <div className="flex items-center gap-4 mb-3">
                            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-lg">
                              {challenge.reward}
                            </Badge>
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
                              <Users className="w-4 h-4" />
                              {challenge.participants.toLocaleString()} joined
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3">
                            <div 
                              className="h-3 bg-gradient-to-r from-emerald-500 to-green-600 dark:from-emerald-400 dark:to-emerald-300 rounded-full shadow-lg"
                              style={{ width: `${challenge.progress}%` }}
                            />
                          </div>
                          <p className="text-sm text-gray-600 dark:text-slate-400 mt-2">{challenge.progress}% complete</p>
                        </div>
                        <div className="flex flex-col gap-2 ml-4 flex-shrink-0">
                          <Button
                            onClick={() => joinChallenge(challenge.id)}
                            size="sm"
                            className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 dark:from-emerald-600 dark:to-emerald-500 text-white shadow-lg px-6 py-2 rounded-xl"
                          >
                            Join Now
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-emerald-300 dark:border-slate-500 hover:bg-emerald-50 dark:hover:bg-slate-700 text-emerald-600 dark:text-emerald-400 px-6 py-2 rounded-xl"
                          >
                            View
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {challenges.length === 0 && (
                    <div className="text-center py-12">
                      <Trophy className="w-16 h-16 text-gray-300 dark:text-slate-600 mx-auto mb-4 opacity-40" />
                      <h3 className="text-xl font-bold text-gray-700 dark:text-slate-200 mb-2">No challenges yet</h3>
                      <p className="text-gray-500 dark:text-slate-400 mb-6">Be the first to create one!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 📊 MY CHALLENGES */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-2xl dark:shadow-3xl border-0 h-[32rem] overflow-hidden">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-2xl text-gray-900 dark:text-white">
                  <Flame className="w-8 h-8 text-orange-500" />
                  My Challenges
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[26rem] overflow-y-auto space-y-4 p-6">
                  {myChallenges.map((challenge) => (
                    <motion.div
                      key={challenge.id}
                      whileHover={{ scale: 1.02 }}
                      className="group bg-gradient-to-r from-orange-50/50 to-orange-100/30 dark:from-slate-700/50 dark:to-slate-600/20 p-6 rounded-3xl border-2 border-orange-200 dark:border-slate-500 hover:border-orange-300 transition-all backdrop-blur-sm"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{challenge.title}</h4>
                          <div className="flex items-center gap-4 mb-3 text-sm">
                            <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                              <TrendingUp className="w-4 h-4" />
                              Streak: {challenge.streak} days
                            </div>
                            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                              <Target className="w-4 h-4" />
                              {challenge.daysLeft} days left
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3 mb-3">
                            <div 
                              className="h-3 bg-gradient-to-r from-emerald-500 to-green-600 dark:from-emerald-400 dark:to-emerald-300 rounded-full shadow-lg"
                              style={{ width: `${(challenge.progress || 0)}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 ml-4 flex-shrink-0">
                          <Button
                            onClick={() => logChallengeProgress(challenge.id)}
                            size="sm"
                            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 shadow-lg px-6 py-2 rounded-xl text-white"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Log Today
                          </Button>
                          <Button size="sm" variant="ghost" className="text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white">
                            Share
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {myChallenges.length === 0 && (
                    <div className="text-center py-12">
                      <Flame className="w-16 h-16 text-gray-300 dark:text-slate-600 mx-auto mb-4 opacity-40" />
                      <h3 className="text-xl font-bold text-gray-700 dark:text-slate-200 mb-2">No challenges joined</h3>
                      <p className="text-gray-500 dark:text-slate-400 mb-6">Join challenges to start competing!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* 🏅 LEADERBOARD */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          <Card className="lg:col-span-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-2xl dark:shadow-3xl border-0">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-2xl text-gray-900 dark:text-white">
                <Crown className="w-8 h-8 text-yellow-500" />
                Global Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {leaderboard.slice(0, 10).map((user, idx) => (
                  <motion.div
                    key={user.name}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-gray-50 to-emerald-50/30 dark:from-slate-700/50 dark:to-slate-600/20 border border-emerald-200 dark:border-slate-500 hover:shadow-md transition-all"
                  >
                    <div className="w-10 h-10 bg-gradient-to-r from-emerald-400 to-green-500 rounded-2xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      #{user.rank}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white truncate">{user.name}</p>
                      <p className="text-sm text-gray-600 dark:text-slate-400">{user.score} points</p>
                    </div>
                    <Badge className="bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg">
                      Top {user.rank}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 📱 QUICK ACTIONS */}
          <Card className="bg-gradient-to-br from-emerald-50/50 to-green-50/30 dark:from-slate-700/50 dark:to-slate-600/20 shadow-2xl dark:shadow-3xl border-0 backdrop-blur-sm h-fit">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl text-gray-900 dark:text-white">
                <Zap className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-6">
              <Button className="w-full h-12 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 dark:from-emerald-600 dark:to-emerald-500 shadow-xl text-white">
                <Share2 className="w-5 h-5 mr-2" />
                Invite Friends
              </Button>
              <Button className="w-full h-12 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 shadow-xl text-white">
                <Trophy className="w-5 h-5 mr-2" />
                View Rewards
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* ✅ CREATE CHALLENGE MODAL */}
        <AnimatePresence>
          {showCreateDialog && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-emerald-200 dark:border-slate-600"
              >
                <div className="p-8">
                  <h2 className="text-3xl font-serif font-light bg-gradient-to-r from-gray-900 dark:from-slate-100 to-emerald-600 dark:to-emerald-400 bg-clip-text text-transparent mb-8 text-center">
                    Create New Challenge
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input 
                      placeholder="Challenge Name (e.g. 30 Day Pushups)" 
                      className="w-full p-4 border-2 border-emerald-200 dark:border-slate-500 rounded-2xl text-lg bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                    />
                    <input 
                      placeholder="Duration (days)" 
                      type="number"
                      className="w-full p-4 border-2 border-emerald-200 dark:border-slate-500 rounded-2xl text-lg bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <select className="w-full p-4 border-2 border-emerald-200 dark:border-slate-500 rounded-2xl text-lg bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm text-gray-900 dark:text-white">
                      <option>fitness</option>
                      <option>hydration</option>
                      <option>mindfulness</option>
                    </select>
                    <input 
                      placeholder="Reward Badge (e.g. 💪 Fitness Beast)"
                      className="w-full p-4 border-2 border-emerald-200 dark:border-slate-500 rounded-2xl text-lg bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex gap-4 mt-8 pt-6 border-t border-emerald-200 dark:border-slate-600">
                    <Button className="flex-1 h-14 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 shadow-xl font-semibold text-lg text-white">
                      Create Challenge
                    </Button>
                    <Button 
                      onClick={() => setShowCreateDialog(false)}
                      className="h-14 px-12 rounded-2xl border-2 border-emerald-300 dark:border-slate-500 hover:bg-emerald-50 dark:hover:bg-slate-700 font-semibold text-lg text-gray-700 dark:text-slate-200"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
