import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Users, Crown, Flame, Zap, CheckCircle, Plus 
} from 'lucide-react';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { api, setAuthToken } from '../lib/api';
import { toast } from 'sonner';

export default function ChallengesPage() {
  const { getToken, userId } = useAuth();
  const [challenges, setChallenges] = useState([]);
  const [myChallenges, setMyChallenges] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // 🚀 SAFE LOAD DATA (Fixed map error)
  const loadChallengesData = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (token) setAuthToken(token);

      // Mock data - NO API calls until backend ready
      const mockChallenges = [
        { id: 1, title: '30 Day Water Challenge', participants: 1245, progress: 67, reward: '💧 Hydration Master' },
        { id: 2, title: '7 Day Meditation Streak', participants: 892, progress: 45, reward: '🧘‍♀️ Zen Master' },
        { id: 3, title: '21 Day Fitness Challenge', participants: 2345, progress: 78, reward: '🏋️ Fitness Pro' }
      ];
      
      const mockMyChallenges = [
        { id: 1, title: '30 Day Water Challenge', progress: 12, daysLeft: 18, streak: 5 }
      ];
      
      const mockLeaderboard = [
        { name: 'Anuja Panchariya', score: 245, rank: 1 },
        { name: 'Rahul Sharma', score: 198, rank: 2 },
        { name: 'Priya Patel', score: 167, rank: 3 }
      ];

      setChallenges(mockChallenges);
      setMyChallenges(mockMyChallenges);
      setLeaderboard(mockLeaderboard);
      
    } catch (error) {
      console.error('Challenges error:', error);
      toast.info("Using demo challenges 😊");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    loadChallengesData();
  }, [loadChallengesData]);

  if (loading) {
    return (
      <motion.div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} 
            className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-500 rounded-full mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading challenges...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8">
      
      <div className="max-w-7xl mx-auto space-y-8">
        {/* HEADER */}
        <motion.div initial={{ y: -20 }} animate={{ y: 0 }} 
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pb-16 lg:pb-0">
          <div>
            <h1 className="font-serif font-light text-5xl lg:text-6xl tracking-tight bg-gradient-to-r from-gray-900 to-emerald-600 bg-clip-text text-transparent mb-2">
              Challenges
            </h1>
            <p className="text-xl text-gray-600">Compete • Win • Build streaks</p>
          </div>
          <Button className="h-14 px-8 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 shadow-xl text-lg font-semibold">
            <Crown className="w-5 h-5 mr-2" />
            Leaderboard
          </Button>
        </motion.div>

        {/* CHALLENGES GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* ACTIVE CHALLENGES */}
          <Card className="h-[32rem] shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-2xl text-gray-900">
                <Trophy className="w-8 h-8 text-yellow-500" />
                Active Challenges
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 max-h-[26rem] overflow-y-auto space-y-4">
              {Array.isArray(challenges) && challenges.map((challenge) => (
                <motion.div key={challenge.id} whileHover={{ scale: 1.02 }} 
                  className="p-6 rounded-3xl bg-gradient-to-r from-emerald-50 to-emerald-100/30 border-2 border-emerald-200 hover:shadow-xl transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{challenge.title}</h3>
                      <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white mb-3">
                        {challenge.reward}
                      </Badge>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div className="h-3 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full" 
                          style={{ width: `${challenge.progress}%` }} />
                      </div>
                      <p className="text-sm text-gray-600 mt-2">{challenge.progress}% complete</p>
                    </div>
                    <Button size="sm" className="ml-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg">
                      Join
                    </Button>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>

          {/* MY CHALLENGES */}
          <Card className="h-[32rem] shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-2xl text-gray-900">
                <Flame className="w-8 h-8 text-orange-500" />
                My Challenges
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 max-h-[26rem] overflow-y-auto space-y-4">
              {Array.isArray(myChallenges) && myChallenges.map((challenge) => (
                <motion.div key={challenge.id} whileHover={{ scale: 1.02 }} 
                  className="p-6 rounded-3xl bg-gradient-to-r from-orange-50 to-orange-100/30 border-2 border-orange-200 hover:shadow-xl transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-gray-900 mb-2">{challenge.title}</h4>
                      <div className="text-sm text-gray-600 mb-3">
                        Streak: {challenge.streak} days • {challenge.daysLeft} days left
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div className="h-3 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full" 
                          style={{ width: `${challenge.progress || 0}%` }} />
                      </div>
                    </div>
                    <Button size="sm" className="ml-4 bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg">
                      Log Today
                    </Button>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
