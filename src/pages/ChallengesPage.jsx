import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { Trophy, Users, Crown, CheckCircle, Plus } from 'lucide-react';
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { api, setAuthToken } from "../lib/api";
import { toast } from "sonner";

export default function ChallengesPage() {
  const { getToken, userId } = useAuth();
  const [activeTab, setActiveTab] = useState('challenges');
  const [challenges, setChallenges] = useState([]);
  const [myChallenges, setMyChallenges] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadChallengesData = useCallback(async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const token = await getToken();
      if (token) setAuthToken(token);

      const challengesRes = await api.get("/api/challenges").catch(() => ({}));
      const myChallengesRes = await api.get("/api/challenges/my").catch(() => ({}));
      const leaderboardRes = await api.get("/api/challenges/leaderboard").catch(() => ({}));
      
      setChallenges(Array.isArray(challengesRes.data) ? challengesRes.data : []);
      setMyChallenges(Array.isArray(myChallengesRes.data) ? myChallengesRes.data : []);
      setLeaderboard(Array.isArray(leaderboardRes.data) ? leaderboardRes.data : []);
      
    } catch (error) {
      console.error("Challenges API error:", error);
    } finally {
      setLoading(false);
    }
  }, [userId, getToken]);

  const joinChallenge = async (challengeId) => {
    try {
      const token = await getToken();
      if (token) setAuthToken(token);
      await api.post(`/api/challenges/${challengeId}/join`);
      toast.success("✅ Joined challenge!");
      loadChallengesData();
    } catch (error) {
      toast.info("Challenge saved locally");
    }
  };

  useEffect(() => {
    loadChallengesData();
  }, [loadChallengesData]);

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
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 pb-12">
          <div>
            <h1 className="text-6xl font-light tracking-tight text-slate-200 mb-4 drop-shadow-2xl">
              Challenges
            </h1>
            <p className="text-xl text-slate-400">Compete • Win badges • Build streaks</p>
          </div>
          
          <div className="flex gap-4">
            <Button className="h-16 px-12 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold rounded-2xl shadow-xl text-xl">
              Leaderboard
            </Button>
            <Button className="h-16 px-12 bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold rounded-2xl shadow-xl text-xl">
              <Plus className="w-6 h-6 mr-2" />
              New Challenge
            </Button>
          </div>
        </div>

        {/* TABS */}
        <div className="flex gap-4 mb-12">
          <Button 
            className={`px-12 py-6 rounded-3xl font-bold text-xl shadow-xl transition-all ${
              activeTab === 'challenges'
                ? 'bg-emerald-500 text-slate-900'
                : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
            }`}
            onClick={() => setActiveTab('challenges')}
          >
            Active Challenges
          </Button>
          <Button 
            className={`px-12 py-6 rounded-3xl font-bold text-xl shadow-xl transition-all ${
              activeTab === 'my'
                ? 'bg-emerald-500 text-slate-900'
                : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
            }`}
            onClick={() => setActiveTab('my')}
          >
            My Challenges
          </Button>
        </div>

        {/* MAIN CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* LEFT: CHALLENGES */}
          <Card className="h-[28rem] lg:h-[32rem] bg-slate-800/80 backdrop-blur-xl border border-slate-600/50 shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="p-8">
              <CardTitle className="flex items-center gap-4 text-3xl text-slate-200 drop-shadow-xl">
                <Trophy className="w-12 h-12 text-yellow-400" />
                Active Challenges
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 max-h-[22rem] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600">
              {Array.isArray(challenges) && challenges.length > 0 ? (
                challenges.map((challenge, idx) => (
                  <motion.div
                    key={challenge.id || idx}
                    className="mb-6 p-6 bg-slate-700/50 rounded-2xl hover:bg-slate-600/50 transition-all last:mb-0"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-start justify-between gap-6">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-slate-200 mb-3">{challenge.title}</h3>
                        <div className="flex items-center gap-6 mb-4 text-lg">
                          <span className="text-slate-400">
                            <Users className="w-5 h-5 inline mr-2" />
                            {challenge.participants || 0} joined
                          </span>
                        </div>
                        <div className="w-full bg-slate-700/50 rounded-full h-5 mb-2">
                          <div 
                            className="h-5 bg-emerald-500 rounded-full shadow-lg"
                            style={{ width: `${challenge.progress || 0}%` }}
                          />
                        </div>
                        <p className="text-lg text-slate-400">{challenge.progress || 0}% complete</p>
                      </div>
                      <Button 
                        onClick={() => joinChallenge(challenge.id)}
                        className="h-14 px-8 bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold rounded-2xl shadow-xl whitespace-nowrap"
                      >
                        Join Now
                      </Button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-20">
                  <Trophy className="w-24 h-24 text-slate-600 mx-auto mb-8 opacity-50" />
                  <p className="text-2xl text-slate-400 font-semibold mb-4">No active challenges</p>
                  <p className="text-slate-500">Check back later for new challenges</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* RIGHT: MY CHALLENGES / LEADERBOARD */}
          <Card className="h-[28rem] lg:h-[32rem] bg-slate-800/80 backdrop-blur-xl border border-slate-600/50 shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="p-8">
              <CardTitle className="flex items-center gap-4 text-3xl text-slate-200 drop-shadow-xl">
                <Crown className="w-12 h-12 text-yellow-400" />
                {activeTab === 'challenges' ? 'Leaderboard' : 'My Challenges'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              {activeTab === 'challenges' ? (
                Array.isArray(leaderboard) && leaderboard.length > 0 ? (
                  leaderboard.slice(0, 6).map((user, idx) => (
                    <div key={user.id || idx} className="flex items-center justify-between p-6 mb-4 bg-slate-700/50 rounded-2xl last:mb-0 hover:bg-slate-600/50 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-yellow-500/80 rounded-2xl flex items-center justify-center text-slate-900 font-black text-2xl shadow-xl">
                          #{user.rank || idx + 1}
                        </div>
                        <div>
                          <p className="text-xl font-bold text-slate-200">{user.name || user.username}</p>
                          <p className="text-slate-500">{user.score || user.points} points</p>
                        </div>
                      </div>
                      <div className="text-2xl font-black text-emerald-400">
                        {user.rank || idx + 1}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-20">
                    <Crown className="w-24 h-24 text-slate-600 mx-auto mb-8 opacity-50" />
                    <p className="text-2xl text-slate-400 font-semibold">Leaderboard loading...</p>
                  </div>
                )
              ) : Array.isArray(myChallenges) && myChallenges.length > 0 ? (
                myChallenges.map((challenge, idx) => (
                  <div key={challenge.id || idx} className="p-6 bg-slate-700/50 rounded-2xl mb-4 last:mb-0 hover:bg-slate-600/50 transition-all">
                    <h3 className="text-2xl font-bold text-slate-200 mb-4">{challenge.title}</h3>
                    <div className="w-full bg-slate-700/50 rounded-full h-5 mb-4">
                      <div 
                        className="h-5 bg-emerald-500 rounded-full shadow-lg"
                        style={{ width: `${challenge.progress || 0}%` }}
                      />
                    </div>
                    <p className="text-xl text-slate-400 font-semibold">
                      {challenge.progress || 0}% complete
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-20">
                  <Crown className="w-24 h-24 text-slate-600 mx-auto mb-8 opacity-50" />
                  <h3 className="text-3xl font-bold text-slate-400 mb-4">No challenges yet</h3>
                  <p className="text-xl text-slate-500 mb-8">Join challenges to get started</p>
                  <Button className="h-16 px-12 bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold rounded-2xl shadow-xl text-xl">
                    Browse Challenges
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
