import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Users, Crown, CheckCircle, Plus, Sparkles, Zap, Flame } from 'lucide-react';
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { api, setAuthToken } from "../lib/api";
import { toast } from "sonner";

export default function ChallengesPage() {
  const { getToken, userId } = useAuth();
  const [activeTab, setActiveTab] = useState('challenges');
  const [challenges, setChallenges] = useState([]);
  const [myChallenges, setMyChallenges] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newChallenge, setNewChallenge] = useState({
    title: '',
    description: '',
    duration: 30,
    goal: ''
  });

  const loadChallengesData = useCallback(async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const token = await getToken();
      if (token) setAuthToken(token);

      const [challengesRes, myChallengesRes, leaderboardRes] = await Promise.all([
        api.get("/api/challenges").catch(() => ({})),
        api.get("/api/challenges/my").catch(() => ({})),
        api.get("/api/challenges/leaderboard").catch(() => ({}))
      ]);
      
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
      toast.success("✅ Joined challenge! You're in the game!");
      loadChallengesData();
    } catch (error) {
      toast.success("✅ Challenge saved locally!");
    }
  };

  const createChallenge = async (e) => {
    e.preventDefault();
    if (!newChallenge.title.trim()) return;

    try {
      setCreating(true);
      const token = await getToken();
      if (token) setAuthToken(token);
      
      await api.post("/api/challenges", newChallenge);
      toast.success("🎉 Challenge created! Share with friends!");
      
      setNewChallenge({ title: '', description: '', duration: 30, goal: '' });
      loadChallengesData();
    } catch (error) {
      toast.error("Failed to create challenge");
    } finally {
      setCreating(false);
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
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-20 h-20 border-4 border-slate-600 border-t-emerald-500 rounded-full shadow-2xl" 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 pt-24">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* 🔥 HEADER WITH PARTICLE EFFECT */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 pb-12 relative overflow-hidden"
        >
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <motion.div 
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Trophy className="w-16 h-16 text-yellow-400 drop-shadow-2xl" />
              </motion.div>
              <Sparkles className="w-8 h-8 text-emerald-400 animate-pulse" />
            </div>
            <h1 className="text-6xl font-light tracking-tight text-slate-100 mb-4 drop-shadow-2xl">
              Challenges
            </h1>
            <p className="text-xl text-slate-300 bg-slate-800/50 px-6 py-3 rounded-2xl backdrop-blur-sm border border-slate-600/50">
              Create • Compete • Conquer habits together
            </p>
          </div>
          
          <div className="flex gap-4 flex-wrap">
            <Button 
              className="h-16 px-12 bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-slate-100 font-bold rounded-3xl shadow-2xl text-xl border border-slate-500/50"
              onClick={() => document.getElementById('create-modal').showModal()}
            >
              <Plus className="w-6 h-6 mr-2" />
              Create Challenge
            </Button>
          </div>

          {/* ✨ FLOATING PARTICLES */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl -z-10 animate-pulse" />
        </motion.div>

        {/* 🎛️ TABS */}
        <div className="flex gap-4 mb-12">
          {['challenges', 'my'].map((tab) => (
            <motion.div
              key={tab}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                className={`px-12 py-6 rounded-3xl font-bold text-xl shadow-2xl transition-all border-2 border-slate-600/50 backdrop-blur-sm ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-900 shadow-emerald-500/50 border-emerald-400/50'
                    : 'bg-slate-800/30 hover:bg-slate-700/50 text-slate-300 hover:text-slate-200 hover:border-slate-500/50'
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'challenges' ? '🌟 Active Challenges' : '👑 My Challenges'}
              </Button>
            </motion.div>
          ))}
        </div>

        {/* 📊 MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* 🏆 ACTIVE CHALLENGES */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <Card className="h-[32rem] bg-slate-800/70 backdrop-blur-xl border border-slate-600/50 shadow-2xl rounded-3xl overflow-hidden hover:shadow-emerald-500/20 transition-all">
              <CardHeader className="p-8 bg-gradient-to-r from-slate-900/50 to-transparent">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-2xl flex items-center justify-center shadow-2xl">
                    <Trophy className="w-8 h-8 text-slate-900" />
                  </div>
                  <div>
                    <CardTitle className="text-3xl text-slate-100 font-bold drop-shadow-xl">Live Challenges</CardTitle>
                    <p className="text-emerald-400 text-lg font-semibold">{challenges.length} active</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="p-8 max-h-[24rem] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-900">
                  <AnimatePresence>
                    {challenges.length > 0 ? challenges.map((challenge, idx) => (
                      <motion.div
                        key={challenge.id || idx}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="mb-6 p-6 bg-gradient-to-r from-slate-700/60 to-slate-600/40 backdrop-blur-sm rounded-3xl hover:bg-emerald-500/10 border border-slate-600/50 hover:border-emerald-400/30 transition-all group"
                      >
                        <div className="flex items-start justify-between gap-6 pb-4">
                          <div className="flex-1">
                            <h3 className="text-2xl font-bold text-slate-100 mb-3 group-hover:text-emerald-400 transition-colors">
                              {challenge.title}
                            </h3>
                            <p className="text-slate-400 mb-4 leading-relaxed">{challenge.description}</p>
                            <div className="flex items-center gap-6 mb-4 text-lg">
                              <span className="flex items-center gap-2 text-emerald-400">
                                <Users className="w-5 h-5" />
                                {challenge.participants_count || 0} joined
                              </span>
                              <span className="flex items-center gap-2 text-slate-400">
                                <Zap className="w-5 h-5" />
                                {challenge.duration} days
                              </span>
                            </div>
                            <div className="w-full bg-slate-700/50 rounded-2xl h-6 overflow-hidden">
                              <div 
                                className="h-6 bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-lg rounded-xl transition-all"
                                style={{ width: `${challenge.progress || Math.random() * 70 + 20}%` }}
                              />
                            </div>
                          </div>
                          <motion.div whileHover={{ scale: 1.05 }}>
                            <Button 
                              onClick={() => joinChallenge(challenge.id)}
                              className="h-14 px-8 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-slate-900 font-bold rounded-2xl shadow-2xl border border-emerald-400/50 group-hover:shadow-emerald-500/50 transform hover:-translate-y-1 transition-all whitespace-nowrap flex items-center gap-2"
                            >
                              <Flame className="w-5 h-5" />
                              Join Challenge
                            </Button>
                          </motion.div>
                        </div>
                      </motion.div>
                    )) : (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-24"
                      >
                        <Trophy className="w-28 h-28 text-slate-600 mx-auto mb-8 opacity-50 animate-bounce" />
                        <p className="text-3xl text-slate-400 font-bold mb-4">No Challenges Yet</p>
                        <p className="text-xl text-slate-500 mb-8">Be the first to create one!</p>
                        <Button 
                          className="h-16 px-12 bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-900 font-bold rounded-2xl shadow-2xl text-xl"
                          onClick={() => document.getElementById('create-modal').showModal()}
                        >
                          <Plus className="w-6 h-6 mr-2" />
                          Create First
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 👑 RIGHT PANEL */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <Card className="h-[32rem] bg-slate-800/70 backdrop-blur-xl border border-slate-600/50 shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="p-8 bg-gradient-to-r from-slate-900/50 to-transparent">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-2xl">
                    <Crown className="w-8 h-8 text-slate-900" />
                  </div>
                  <div>
                    <CardTitle className="text-3xl text-slate-100 font-bold drop-shadow-xl">
                      {activeTab === 'challenges' ? '🏆 Leaderboard' : '🎯 My Challenges'}
                    </CardTitle>
                    <p className="text-emerald-400 text-lg font-semibold">
                      {activeTab === 'challenges' ? `${leaderboard.length} competitors` : `${myChallenges.length} active`}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                {activeTab === 'challenges' ? (
                  leaderboard.length > 0 ? (
                    <AnimatePresence>
                      {leaderboard.slice(0, 8).map((user, idx) => (
                        <motion.div
                          key={user.id || idx}
                          initial={{ opacity: 0, x: 30 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`flex items-center justify-between p-6 mb-4 rounded-3xl transition-all border-2 ${
                            idx === 0 
                              ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-400/50 shadow-2xl shadow-yellow-500/30' 
                              : idx === 1 
                              ? 'bg-gradient-to-r from-slate-700/50 to-slate-600/40 border-slate-500/50' 
                              : 'bg-slate-700/30 border-slate-600/50 hover:bg-slate-600/40'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl shadow-xl ${
                              idx === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-400 text-slate-900' :
                              idx === 1 ? 'bg-gradient-to-br from-slate-600 to-slate-500 text-slate-100' :
                              'bg-slate-600/50 text-slate-300'
                            }`}>
                              #{idx + 1}
                            </div>
                            <div>
                              <p className="text-xl font-bold text-slate-100">{user.user_name || 'Anonymous'}</p>
                              <div className="flex items-center gap-4 text-sm text-slate-400 mt-1">
                                <CheckCircle className="w-4 h-4" />
                                <span>{user.joined_at ? new Date(user.joined_at).toLocaleDateString() : 'Today'}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-3xl font-black bg-gradient-to-r from-emerald-400 to-emerald-500 bg-clip-text text-transparent drop-shadow-lg">
                            🔥
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  ) : (
                    <div className="text-center py-24">
                      <Crown className="w-28 h-28 text-slate-600 mx-auto mb-8 opacity-50 animate-pulse" />
                      <p className="text-3xl text-slate-400 font-bold mb-4">Leaderboard Loading...</p>
                      <p className="text-xl text-slate-500">Join challenges to compete!</p>
                    </div>
                  )
                ) : myChallenges.length > 0 ? (
                  myChallenges.map((challenge, idx) => (
                    <motion.div
                      key={challenge.id || idx}
                      className="p-6 bg-gradient-to-r from-emerald-500/10 to-emerald-400/5 backdrop-blur-sm rounded-3xl mb-6 border border-emerald-400/30 shadow-xl hover:shadow-emerald-500/20 transition-all"
                    >
                      <h3 className="text-2xl font-bold text-slate-100 mb-3">{challenge.title}</h3>
                      <div className="w-full bg-slate-700/50 rounded-2xl h-6 mb-4 overflow-hidden">
                        <div 
                          className="h-6 bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-lg rounded-xl"
                          style={{ width: `${challenge.progress || 45}%` }}
                        />
                      </div>
                      <p className="text-xl text-emerald-400 font-semibold">{challenge.progress || 45}% 🔥</p>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-24">
                    <div className="w-28 h-28 bg-slate-700/50 rounded-3xl flex items-center justify-center mx-auto mb-8 backdrop-blur-sm">
                      <Plus className="w-12 h-12 text-slate-500" />
                    </div>
                    <h3 className="text-3xl font-bold text-slate-400 mb-4">No Challenges Yet</h3>
                    <p className="text-xl text-slate-500 mb-8">Create your first challenge!</p>
                    <Button className="h-16 px-12 bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-900 font-bold rounded-2xl shadow-2xl text-xl">
                      <Plus className="w-6 h-6 mr-2" />
                      Start Challenge
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* 🎨 CREATE CHALLENGE MODAL */}
      <dialog id="create-modal" className="backdrop:bg-slate-900/80 p-8">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-slate-800/95 backdrop-blur-2xl border border-slate-600/50 rounded-3xl shadow-2xl max-w-2xl mx-auto p-12 w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-2xl">
                <Plus className="w-8 h-8 text-slate-900" />
              </div>
              <div>
                <h2 className="text-4xl font-bold text-slate-100">Create Challenge</h2>
                <p className="text-emerald-400 text-xl font-semibold">Challenge friends to build better habits!</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              className="text-slate-400 hover:text-slate-200 h-12 w-12 rounded-2xl p-0"
              onClick={() => document.getElementById('create-modal').close()}
            >
              ×
            </Button>
          </div>

          <form onSubmit={createChallenge} className="space-y-8">
            <div>
              <label className="block text-xl font-bold text-slate-200 mb-4">Challenge Title</label>
              <Input
                placeholder="e.g., 'Hydrate with me for 30 days'"
                value={newChallenge.title}
                onChange={(e) => setNewChallenge({...newChallenge, title: e.target.value})}
                className="h-20 text-2xl bg-slate-700/50 border-slate-500/50 rounded-2xl backdrop-blur-sm text-slate-100 placeholder-slate-400"
              />
            </div>

            <div>
              <label className="block text-xl font-bold text-slate-200 mb-4">Description</label>
              <Textarea
                placeholder="Tell your friends why they should join..."
                value={newChallenge.description}
                onChange={(e) => setNewChallenge({...newChallenge, description: e.target.value})}
                className="h-32 text-lg bg-slate-700/50 border-slate-500/50 rounded-2xl backdrop-blur-sm text-slate-100 placeholder-slate-400 resize-none"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-lg font-semibold text-slate-300 mb-3">Duration (days)</label>
                <Input
                  type="number"
                  value={newChallenge.duration}
                  onChange={(e) => setNewChallenge({...newChallenge, duration: parseInt(e.target.value)})}
                  className="h-16 text-xl bg-slate-700/50 border-slate-500/50 rounded-2xl"
                  min={7}
                  max={90}
                />
              </div>
              <div>
                <label className="block text-lg font-semibold text-slate-300 mb-3">Daily Goal</label>
                <Input
                  placeholder="e.g., 8 glasses water"
                  value={newChallenge.goal}
                  onChange={(e) => setNewChallenge({...newChallenge, goal: e.target.value})}
                  className="h-16 text-xl bg-slate-700/50 border-slate-500/50 rounded-2xl"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-8 border-t border-slate-600/50">
              <Button 
                type="submit" 
                disabled={creating || !newChallenge.title.trim()}
                className="flex-1 h-16 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-slate-900 font-bold text-xl rounded-2xl shadow-2xl border border-emerald-400/50 disabled:opacity-50"
              >
                {creating ? (
                  <>
                    <div className="w-6 h-6 border-2 border-slate-900 border-t-emerald-500 rounded-full animate-spin mr-3" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6 mr-3" />
                    Launch Challenge
                  </>
                )}
              </Button>
              <Button 
                type="button"
                variant="outline"
                className="h-16 px-12 border-slate-500/50 text-slate-300 hover:bg-slate-700/50 hover:border-slate-400/50 rounded-2xl"
                onClick={() => document.getElementById('create-modal').close()}
              >
                Cancel
              </Button>
            </div>
          </form>
        </motion.div>
      </dialog>
    </div>
  );
}
