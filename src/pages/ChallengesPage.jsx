import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Users, Crown, Flame, Zap, CheckCircle, Plus, Sun, Moon, Target, TrendingUp 
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Switch } from '../components/ui/switch';
import { toast } from 'sonner';

export default function ChallengesPage() {
  const { userId } = useAuth();
  const [isDark, setIsDark] = useState(false);
  const [challenges, setChallenges] = useState([]);
  const [myChallenges, setMyChallenges] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [userChallenges, setUserChallenges] = useState(new Set());

  // 🎯 DARK MODE - localStorage sync
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

  // 🚀 MOCK DATA + localStorage (NO API calls!)
  const loadChallengesData = useCallback(() => {
    try {
      setLoading(true);
      
      // Load from localStorage or use defaults
      const savedChallenges = JSON.parse(localStorage.getItem('challenges') || '[]');
      const savedMyChallenges = JSON.parse(localStorage.getItem('myChallenges') || '[]');
      const savedLeaderboard = JSON.parse(localStorage.getItem('leaderboard') || '[]');
      const savedUserChallenges = new Set(JSON.parse(localStorage.getItem('userChallenges') || '[]'));

      // Default mock data
      const defaultChallenges = [
        { id: 1, title: '30 Day Water Challenge 💧', participants: 1245, progress: 67, reward: 'Hydration Master' },
        { id: 2, title: '7 Day Meditation 🧘‍♀️', participants: 892, progress: 45, reward: 'Zen Master' },
        { id: 3, title: '21 Day Fitness 🏋️', participants: 2345, progress: 78, reward: 'Fitness Pro' },
        { id: 4, title: '14 Day Reading 📚', participants: 567, progress: 32, reward: 'Bookworm' }
      ];

      const defaultMyChallenges = [
        { id: 1, title: '30 Day Water Challenge 💧', progress: 12, daysLeft: 18, streak: 5 }
      ];

      const defaultLeaderboard = [
        { name: 'Anuja Panchariya', score: 245, rank: 1 },
        { name: 'Rahul Sharma', score: 198, rank: 2 },
        { name: 'Priya Patel', score: 167, rank: 3 },
        { name: 'Amit Kumar', score: 156, rank: 4 }
      ];

      setChallenges(savedChallenges.length ? savedChallenges : defaultChallenges);
      setMyChallenges(savedMyChallenges.length ? savedMyChallenges : defaultMyChallenges);
      setLeaderboard(savedLeaderboard.length ? savedLeaderboard : defaultLeaderboard);
      setUserChallenges(savedUserChallenges);
      
    } catch (error) {
      console.error('Challenges load error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 🎯 JOIN CHALLENGE (localStorage)
  const joinChallenge = (challengeId) => {
    if (userChallenges.has(challengeId)) {
      toast.info('Already joined this challenge! ✨');
      return;
    }

    const newUserChallenges = new Set(userChallenges);
    newUserChallenges.add(challengeId);
    setUserChallenges(newUserChallenges);
    localStorage.setItem('userChallenges', JSON.stringify(Array.from(newUserChallenges)));

    // Add to my challenges
    const challenge = challenges.find(c => c.id === challengeId);
    if (challenge) {
      const newMyChallenge = {
        id: challengeId,
        title: challenge.title,
        progress: 0,
        daysLeft: 30,
        streak: 1
      };
      setMyChallenges(prev => [newMyChallenge, ...prev]);
      localStorage.setItem('myChallenges', JSON.stringify([newMyChallenge, ...myChallenges]));
    }

    toast.success('✅ Joined challenge! Start logging progress!');
  };

  // 🏆 LOG PROGRESS (localStorage)
  const logChallengeProgress = (challengeId) => {
    setMyChallenges(prev => prev.map(challenge => 
      challenge.id === challengeId
        ? { ...challenge, progress: Math.min(100, challenge.progress + 10), streak: challenge.streak + 1 }
        : challenge
    ));
    localStorage.setItem('myChallenges', JSON.stringify(myChallenges.map(challenge => 
      challenge.id === challengeId
        ? { ...challenge, progress: Math.min(100, challenge.progress + 10), streak: challenge.streak + 1 }
        : challenge
    )));
    toast.success('✅ Progress logged! Great job!');
  };

  useEffect(() => {
    loadChallengesData();
  }, [loadChallengesData]);

  if (loading) {
    return (
      <motion.div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="text-center">
          <motion.div 
            animate={{ rotate: 360 }} 
            transition={{ duration: 1, repeat: Infinity }}
            className="w-16 h-16 border-4 border-emerald-200 dark:border-emerald-400/50 border-t-emerald-500 dark:border-t-emerald-400 rounded-full mx-auto mb-4" 
          />
          <p className="text-slate-600 dark:text-slate-300 text-lg">Loading challenges...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 sm:p-6 lg:p-8 transition-all duration-500"
    >
      <div className="max-w-7xl mx-auto space-y-8 relative">
        
        {/* 🌙 THEME TOGGLE */}
        <motion.div 
          className="absolute top-6 right-6 z-50 flex items-center gap-2 p-3 rounded-2xl bg-white/90 dark:bg-slate-800/95 backdrop-blur-xl shadow-2xl border border-emerald-200/50 dark:border-slate-600/70 hover:shadow-3xl transition-all"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <Sun className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-emerald-500'}`} />
          <Switch checked={isDark} onCheckedChange={toggleDarkMode} />
          <Moon className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-slate-400'}`} />
        </motion.div>

        {/* ✨ HEADER */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pt-20 lg:pt-24 pb-8"
        >
          <div>
            <h1 className="font-serif font-light text-5xl lg:text-6xl tracking-tight bg-gradient-to-r from-slate-900 dark:from-slate-100 to-emerald-600 dark:to-emerald-400 bg-clip-text text-transparent drop-shadow-lg mb-3">
              Challenges
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 font-semibold">
              Compete • Win badges • Build streaks 🔥
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button className="h-14 px-8 rounded-2xl bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 shadow-xl text-lg font-semibold text-slate-900 border border-yellow-300/50">
              <Crown className="w-5 h-5 mr-2" />
              Leaderboard
            </Button>
            <Button 
              onClick={() => setShowCreateDialog(true)}
              className="h-14 px-8 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 shadow-xl text-lg font-semibold text-slate-900 dark:text-slate-50 border border-emerald-300/50"
            >
              <Plus className="w-5 h-5 mr-2" />
              New Challenge
            </Button>
          </div>
        </motion.div>

        {/* 📊 MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* 🏆 ACTIVE CHALLENGES */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <Card className="h-[36rem] lg:h-[40rem] bg-white/90 dark:bg-slate-800/95 backdrop-blur-xl shadow-2xl dark:shadow-slate-900/60 border-0 overflow-hidden">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-4 text-3xl font-bold text-slate-900 dark:text-slate-100">
                  <Trophy className="w-10 h-10 text-yellow-500 drop-shadow-lg" />
                  Active Challenges
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[30rem] overflow-y-auto space-y-6 p-8 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent">
                  {Array.isArray(challenges) && challenges.map((challenge) => (
                    <motion.div
                      key={challenge.id}
                      whileHover={{ scale: 1.02 }}
                      className="group bg-white/80 dark:bg-slate-800/70 backdrop-blur-xl p-8 rounded-3xl border-2 border-emerald-200/50 dark:border-slate-700/70 hover:border-emerald-400/70 dark:hover:border-emerald-400 hover:shadow-2xl transition-all duration-300"
                    >
                      <div className="flex items-start justify-between gap-6">
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {challenge.title}
                          </h3>
                          <Badge className="text-lg px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 font-bold shadow-lg mb-6">
                            {challenge.reward}
                          </Badge>
                          <div className="flex items-center gap-6 mb-4 text-sm">
                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                              <Users className="w-5 h-5" />
                              {challenge.participants.toLocaleString()} joined
                            </div>
                          </div>
                          <div className="w-full bg-slate-200/50 dark:bg-slate-700/70 rounded-2xl h-4 shadow-inner mb-3">
                            <div 
                              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 dark:from-emerald-400 dark:to-emerald-500 rounded-2xl shadow-lg"
                              style={{ width: `${challenge.progress}%` }}
                            />
                          </div>
                          <p className="text-xl font-semibold text-slate-700 dark:text-slate-300">
                            {challenge.progress}% community progress
                          </p>
                        </div>
                        <div className="flex flex-col gap-3 ml-6 flex-shrink-0">
                          <Button
                            onClick={() => joinChallenge(challenge.id)}
                            size="lg"
                            className="h-14 px-8 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 dark:from-emerald-400 dark:to-emerald-500 shadow-2xl text-lg font-bold text-slate-900 dark:text-slate-50 border border-emerald-300/50"
                          >
                            {userChallenges.has(challenge.id) ? 'Joined ✅' : 'Join Now'}
                          </Button>
                          <Button 
                            variant="outline"
                            size="lg"
                            className="h-14 px-8 rounded-2xl border-2 border-slate-300/50 dark:border-slate-500/70 hover:bg-slate-100 dark:hover:bg-slate-700/50 text-lg font-semibold"
                          >
                            Details
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 🔥 MY CHALLENGES */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <Card className="h-[36rem] lg:h-[40rem] bg-white/90 dark:bg-slate-800/95 backdrop-blur-xl shadow-2xl dark:shadow-slate-900/60 border-0 overflow-hidden">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-4 text-3xl font-bold text-slate-900 dark:text-slate-100">
                  <Flame className="w-10 h-10 text-orange-500 drop-shadow-lg animate-pulse" />
                  My Challenges
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[30rem] overflow-y-auto space-y-6 p-8 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent">
                  {Array.isArray(myChallenges) && myChallenges.length > 0 ? (
                    myChallenges.map((challenge) => (
                      <motion.div
                        key={challenge.id}
                        whileHover={{ scale: 1.02 }}
                        className="group bg-gradient-to-r from-orange-50/80 to-orange-100/50 dark:from-slate-800/70 dark:to-slate-700/40 p-8 rounded-3xl border-2 border-orange-200/70 dark:border-orange-400/50 hover:shadow-2xl transition-all duration-300"
                      >
                        <div className="flex items-start justify-between gap-6">
                          <div className="flex-1">
                            <h4 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4 group-hover:text-orange-600 dark:group-hover:text-orange-400">
                              {challenge.title}
                            </h4>
                            <div className="flex items-center gap-6 mb-6 text-lg">
                              <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 font-semibold">
                                <TrendingUp className="w-6 h-6" />
                                Streak: {challenge.streak} days
                              </div>
                              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold">
                                <Target className="w-6 h-6" />
                                {challenge.daysLeft} days left
                              </div>
                            </div>
                            <div className="w-full bg-slate-200/50 dark:bg-slate-700/70 rounded-2xl h-5 shadow-inner mb-4">
                              <div 
                                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 dark:from-emerald-400 dark:to-emerald-500 rounded-2xl shadow-lg"
                                style={{ width: `${challenge.progress}%` }}
                              />
                            </div>
                          </div>
                          <Button
                            onClick={() => logChallengeProgress(challenge.id)}
                            size="lg"
                            className="h-14 px-8 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 shadow-2xl text-lg font-bold text-slate-900 dark:text-slate-50 border border-orange-400/50"
                          >
                            <CheckCircle className="w-5 h-5 mr-2" />
                            Log Today
                          </Button>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center py-16">
                      <Flame className="w-24 h-24 text-slate-300 dark:text-slate-600 mx-auto mb-8 opacity-50" />
                      <h3 className="text-3xl font-bold text-slate-700 dark:text-slate-200 mb-4">No challenges yet</h3>
                      <p className="text-xl text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
                        Join challenges to compete with friends and win badges!
                      </p>
                      <div className="space-y-3">
                        <Button className="h-14 px-12 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 shadow-xl text-xl font-bold">
                          <Trophy className="w-6 h-6 mr-2" />
                          Browse Challenges
                        </Button>
                      </div>
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
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          <Card className="lg:col-span-2 h-96 bg-white/90 dark:bg-slate-800/95 backdrop-blur-xl shadow-2xl dark:shadow-slate-900/60 border-0">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-4 text-3xl font-bold text-slate-900 dark:text-slate-100">
                <Crown className="w-12 h-12 text-yellow-500 drop-shadow-2xl" />
                Global Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-4">
                {Array.isArray(leaderboard) && leaderboard.slice(0, 8).map((user) => (
                  <motion.div
                    key={user.name}
                    className="flex items-center gap-6 p-6 rounded-3xl bg-gradient-to-r from-slate-50/80 to-emerald-50/50 dark:from-slate-800/70 dark:to-slate-700/40 border-2 border-slate-200/50 dark:border-slate-600/70 hover:shadow-xl transition-all hover:border-emerald-400/70 dark:hover:border-emerald-400"
                  >
                    <div className="w-14 h-14 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-3xl flex items-center justify-center text-slate-900 font-black text-2xl shadow-2xl flex-shrink-0">
                      #{user.rank}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xl font-bold text-slate-900 dark:text-slate-100 truncate">{user.name}</p>
                      <p className="text-lg text-slate-600 dark:text-slate-400">{user.score} points</p>
                    </div>
                    <Badge className="text-xl px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-900 font-bold shadow-lg h-fit">
                      Top {user.rank}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* ⚡ QUICK ACTIONS */}
          <Card className="h-96 bg-gradient-to-br from-emerald-500/10 to-emerald-400/10 dark:from-slate-800/60 dark:to-slate-700/40 shadow-2xl dark:shadow-slate-900/60 border border-emerald-200/30 dark:border-slate-700/60 backdrop-blur-xl">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-4 text-2xl font-bold text-slate-900 dark:text-slate-100">
                <Zap className="w-10 h-10 text-emerald-500 dark:text-emerald-400 animate-pulse" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <motion.div whileHover={{ scale: 1.02 }}>
                <Button className="w-full h-16 rounded-3xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 shadow-2xl text-xl font-bold text-slate-900 dark:text-slate-50 border border-emerald-300/50">
                  <Users className="w-6 h-6 mr-3" />
                  Invite Friends
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }}>
                <Button className="w-full h-16 rounded-3xl bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 shadow-2xl text-xl font-bold text-slate-50">
                  <Trophy className="w-6 h-6 mr-3" />
                  View Rewards
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }}>
                <Button className="w-full h-16 rounded-3xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 shadow-2xl text-xl font-bold text-slate-900 dark:text-slate-50 border border-orange-400/50">
                  <Share2 className="w-6 h-6 mr-3" />
                  Share Progress
                </Button>
              </motion.div>
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
              className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-2xl rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-emerald-200/50 dark:border-slate-700"
              >
                <div className="p-10">
                  <h2 className="text-5xl font-serif font-light bg-gradient-to-r from-slate-900 dark:from-slate-100 to-emerald-600 dark:to-emerald-400 bg-clip-text text-transparent mb-10 text-center drop-shadow-2xl">
                    Create Challenge
                  </h2>
                  {/* Form content here */}
                  <div className="flex gap-6 pt-8 border-t border-slate-200 dark:border-slate-700">
                    <Button className="flex-1 h-20 rounded-3xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 shadow-2xl text-2xl font-bold text-slate-900 dark:text-slate-50">
                      Create Challenge
                    </Button>
                    <Button 
                      onClick={() => setShowCreateDialog(false)}
                      className="h-20 px-16 rounded-3xl border-2 border-slate-300 dark:border-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-xl text-2xl font-bold text-slate-700 dark:text-slate-300"
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
