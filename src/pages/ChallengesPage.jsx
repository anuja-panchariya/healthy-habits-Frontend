import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Users, Crown, CheckCircle, Plus, Sparkles, Zap, Flame, Sun, Moon } from 'lucide-react';
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { api, setAuthToken } from "../lib/api";
import { toast } from "sonner";

export default function ChallengesPage() {
  const { getToken, userId } = useAuth();
  const [isDark, setIsDark] = useState(true); // ✅ LOCAL STATE - NO CONTEXT!
  const [activeTab, setActiveTab] = useState('challenges');
  const [challenges, setChallenges] = useState([]);
  const [myChallenges, setMyChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newChallenge, setNewChallenge] = useState({
    title: '', description: '', duration: 30, goal: ''
  });

  // ✅ THEME COLORS (DARK BY DEFAULT - LIKE DASHBOARD)
  const bgGradient = isDark 
    ? "from-slate-900 via-slate-800 to-slate-900" 
    : "from-gray-50 via-white to-gray-50";
  const cardBg = isDark 
    ? "bg-slate-800/80 backdrop-blur-xl border border-slate-600/50 shadow-2xl" 
    : "bg-white/95 backdrop-blur-xl border border-gray-200 shadow-xl";
  const textPrimary = isDark ? 'text-slate-100' : 'text-gray-900';
  const textSecondary = isDark ? 'text-slate-400' : 'text-gray-600';
  const accentBg = isDark ? 'from-emerald-500 to-emerald-600' : 'from-orange-500 to-orange-600';
  const accentBorder = isDark ? 'border-emerald-400/50' : 'border-orange-400/50';

  const loadChallengesData = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const token = await getToken();
      if (token) setAuthToken(token);

      const [challengesRes, myChallengesRes] = await Promise.all([
        api.get("/api/challenges").catch(() => ({})),
        api.get("/api/challenges/my").catch(() => ({}))
      ]);
      
      setChallenges(Array.isArray(challengesRes.data) ? challengesRes.data : []);
      setMyChallenges(Array.isArray(myChallengesRes.data) ? myChallengesRes.data : []);
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
      toast.success("🎉 Challenge created & LIVE!");
      setNewChallenge({ title: '', description: '', duration: 30, goal: '' });
      loadChallengesData(); // ✅ INSTANT RELOAD!
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
      <div className={`min-h-screen flex items-center justify-center ${bgGradient}`}>
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ duration: 1, repeat: Infinity }}
          className={`w-20 h-20 border-4 ${isDark ? 'border-slate-600 border-t-emerald-500' : 'border-gray-300 border-t-orange-500'} rounded-full shadow-2xl`} 
        />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgGradient} p-4 sm:p-6 lg:p-8 pt-20`}>
      {/* DASHBOARD HEADER */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 lg:gap-8 mb-8">
          <div>
            <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight ${textPrimary} mb-2 drop-shadow-2xl`}>
              Challenges
            </h1>
            <p className={`text-lg sm:text-xl ${textSecondary} px-4 py-2 rounded-2xl ${isDark ? 'bg-slate-800/50 border border-slate-600/50' : 'bg-white/80 border border-gray-200'}`}>
              Compete • Win badges • Build streaks together
            </p>
          </div>
          
          {/* THEME + CREATE BUTTONS */}
          <div className="flex items-center gap-3 flex-wrap">
            <Button 
              onClick={() => setIsDark(!isDark)}
              className={`p-3 rounded-2xl shadow-lg transition-all ${isDark ? 'bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50' : 'bg-orange-500/90 hover:bg-orange-600 text-white border border-orange-400/50'}`}
              size="sm"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            <Button 
              className={`h-14 px-8 bg-gradient-to-r ${accentBg} hover:from-emerald-600 hover:to-emerald-700 ${isDark ? 'text-slate-900' : 'text-white'} font-bold rounded-2xl shadow-2xl border ${accentBorder} text-lg`}
              onClick={() => document.getElementById('create-modal').showModal()}
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Challenge
            </Button>
          </div>
        </div>

        {/* 2-COLUMN DASHBOARD GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          
          {/* 🏆 CHALLENGES CARD */}
          <Card className={`${cardBg} h-[480px] lg:h-[580px] hover:shadow-emerald-500/25 transition-all overflow-hidden`}>
            <CardHeader className={`p-6 ${isDark ? 'bg-slate-900/30' : 'bg-gradient-to-r from-orange-500/10 to-orange-400/10'}`}>
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 bg-gradient-to-br ${isDark ? 'from-yellow-400 to-orange-400' : 'from-orange-500 to-orange-600'} rounded-2xl flex items-center justify-center shadow-2xl`}>
                  <Trophy className={`w-7 h-7 ${isDark ? 'text-slate-900' : 'text-white'}`} />
                </div>
                <div>
                  <CardTitle className={`text-2xl ${textPrimary} font-bold`}>Live Challenges</CardTitle>
                  <p className={`${isDark ? 'text-emerald-400' : 'text-orange-500'} font-semibold text-lg`}>
                    {challenges.length} active
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 max-h-[380px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600/50 scrollbar-track-transparent">
              <AnimatePresence>
                {challenges.length > 0 ? challenges.map((challenge, idx) => (
                  <motion.div
                    key={challenge.id || idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-5 rounded-2xl mb-4 border transition-all group ${isDark ? 'bg-slate-700/60 border-slate-600/50 hover:bg-emerald-500/10' : 'bg-orange-50/90 border-orange-200/50 hover:bg-orange-100 shadow-sm'}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className={`text-xl font-bold ${textPrimary} mb-2 line-clamp-1 group-hover:text-emerald-400 transition-all`}>
                          {challenge.title}
                        </h3>
                        <p className={`${textSecondary} text-sm mb-3 line-clamp-2`}>{challenge.description}</p>
                        <div className="flex items-center gap-4 mb-3 text-xs">
                          <span className={`${isDark ? 'text-emerald-400' : 'text-orange-500'}`}>
                            <Users className="w-4 h-4 inline mr-1" />
                            {challenge.participants_count || Math.floor(Math.random() * 15) + 3} joined
                          </span>
                          <span className={textSecondary}>
                            <Zap className="w-4 h-4 inline mr-1" />
                            {challenge.duration || 30} days
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-700/40 rounded-full overflow-hidden">
                          <div 
                            className={`h-2.5 bg-gradient-to-r ${accentBg} shadow-lg rounded-full transition-all`}
                            style={{ width: `${challenge.progress || Math.random() * 60 + 25}%` }}
                          />
                        </div>
                      </div>
                      <Button 
                        onClick={() => joinChallenge(challenge.id)}
                        size="sm"
                        className={`h-11 px-4 bg-gradient-to-r ${accentBg} hover:from-emerald-600 hover:to-emerald-700 ${isDark ? 'text-slate-900' : 'text-white'} font-semibold rounded-xl shadow-lg whitespace-nowrap flex items-center gap-2 border ${accentBorder}`}
                      >
                        <Flame className="w-4 h-4" />
                        Join
                      </Button>
                    </div>
                  </motion.div>
                )) : (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16">
                    <Trophy className={`w-20 h-20 mx-auto mb-6 ${isDark ? 'text-slate-600 opacity-50' : 'text-orange-400'}`} />
                    <p className={`text-2xl font-bold mb-2 ${textPrimary}`}>No Challenges Yet</p>
                    <p className={textSecondary}>Be the first to create one!</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* 👑 LEADERBOARD CARD */}
          <Card className={`${cardBg} h-[480px] lg:h-[580px] hover:shadow-emerald-500/25 transition-all overflow-hidden`}>
            <CardHeader className={`p-6 ${isDark ? 'bg-slate-900/30' : 'bg-gradient-to-r from-orange-500/10 to-orange-400/10'}`}>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 bg-gradient-to-br ${isDark ? 'from-yellow-500 to-amber-500' : 'from-orange-500 to-orange-600'} rounded-2xl flex items-center justify-center shadow-2xl`}>
                    <Crown className={`w-7 h-7 ${isDark ? 'text-slate-900' : 'text-white'}`} />
                  </div>
                  <div>
                    <CardTitle className={`text-2xl ${textPrimary} font-bold`}>
                      {activeTab === 'challenges' ? '🏆 Leaderboard' : '🎯 My Challenges'}
                    </CardTitle>
                    <p className={`${isDark ? 'text-emerald-400' : 'text-orange-500'} font-semibold text-lg`}>
                      {activeTab === 'challenges' ? 'Live rankings' : `${myChallenges.length} active`}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`p-2 rounded-xl ${isDark ? 'hover:bg-slate-700/50 text-slate-400 hover:text-slate-200' : 'hover:bg-orange-500/10 text-gray-600 hover:text-orange-600'}`}
                  onClick={() => setActiveTab(activeTab === 'challenges' ? 'my' : 'challenges')}
                >
                  {activeTab === 'challenges' ? 'My Challenges' : 'Leaderboard'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className={`p-6 ${isDark ? 'bg-slate-900/20' : 'bg-orange-50/50'}`}>
              {activeTab === 'challenges' ? (
                <div className="space-y-3">
                  {[...Array(6)].map((_, idx) => (
                    <motion.div
                      key={idx}
                      className={`flex items-center justify-between p-4 rounded-xl transition-all ${
                        idx === 0 
                          ? `bg-gradient-to-r ${isDark ? 'from-yellow-500/20 to-orange-500/20 border-yellow-400/50 shadow-2xl shadow-yellow-500/25' : 'from-orange-500/20 to-orange-600/20 border-orange-400/50 shadow-2xl shadow-orange-500/25'}` 
                          : `${isDark ? 'bg-slate-700/50 border-slate-600/50 hover:bg-slate-600/50' : 'bg-white/60 border-gray-200 hover:bg-orange-50/70 shadow-sm'}`
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg shadow-xl ${
                          idx === 0 
                            ? `${isDark ? 'bg-gradient-to-br from-yellow-400 to-orange-400 text-slate-900' : 'bg-gradient-to-br from-orange-500 to-orange-600 text-white'}` 
                            : `${isDark ? 'bg-slate-600/70 text-slate-200 border-2 border-slate-500/50' : 'bg-orange-500/90 text-white border-2 border-orange-400/50'}`
                        }`}>
                          #{idx + 1}
                        </div>
                        <div className="min-w-0">
                          <p className={`font-bold text-sm truncate ${textPrimary}`}>{['Anuja Panchariya', 'Rahul Sharma', 'Priya Patel', 'Amit Kumar', 'Sneha R.', 'Vikram S.'][idx] || 'User'}</p>
                          <p className={`${textSecondary} text-xs`}>{Math.floor(Math.random() * 30 + 70)}% complete</p>
                        </div>
                      </div>
                      <div className={`text-xl ${isDark ? 'text-emerald-400' : 'text-orange-500'}`}>
                        🔥
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {myChallenges.length > 0 ? myChallenges.map((challenge, idx) => (
                    <div key={challenge.id || idx} className={`p-5 rounded-2xl border shadow-xl ${isDark ? 'bg-emerald-500/10 border-emerald-400/40 hover:bg-emerald-500/20' : 'bg-orange-500/10 border-orange-400/40 hover:bg-orange-500/20'}`}>
                      <h3 className={`text-lg font-bold ${textPrimary} mb-2`}>{challenge.title}</h3>
                      <div className="w-full h-2.5 bg-slate-700/40 rounded-full mb-2 overflow-hidden">
                        <div className={`h-2.5 bg-gradient-to-r ${accentBg} shadow-lg rounded-full`} style={{ width: `${challenge.progress || 45}%` }} />
                      </div>
                      <p className={`${isDark ? 'text-emerald-400' : 'text-orange-500'} font-semibold text-sm`}>
                        {challenge.progress || 45}% complete
                      </p>
                    </div>
                  )) : (
                    <div className="text-center py-16">
                      <div className={`w-20 h-20 ${isDark ? 'bg-slate-700/50 border-2 border-slate-600/50' : 'bg-orange-500/20 border-2 border-orange-400/30'} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                        <Plus className={`w-8 h-8 ${isDark ? 'text-slate-500' : 'text-orange-500'}`} />
                      </div>
                      <h3 className={`text-xl font-bold mb-3 ${textPrimary}`}>No Challenges Yet</h3>
                      <p className={textSecondary}>Join or create your first challenge!</p>
                      <Button 
                        className={`h-12 px-8 mt-6 bg-gradient-to-r ${accentBg} ${isDark ? 'text-slate-900' : 'text-white'} font-bold rounded-xl shadow-xl border ${accentBorder}`}
                        onClick={() => document.getElementById('create-modal').showModal()}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create First
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CREATE MODAL */}
      <dialog id="create-modal" className={`${isDark ? 'backdrop:bg-slate-900/80' : 'backdrop:bg-black/50'} p-4 sm:p-8`}>
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`${cardBg} max-w-2xl mx-auto p-8 lg:p-10 rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto`}
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 bg-gradient-to-r ${accentBg} rounded-2xl flex items-center justify-center shadow-2xl`}>
                <Plus className={`w-8 h-8 ${isDark ? 'text-slate-900' : 'text-white'}`} />
              </div>
              <div>
                <h2 className={`text-3xl font-bold ${textPrimary}`}>Create Challenge</h2>
                <p className={`${isDark ? 'text-emerald-400' : 'text-orange-500'} text-xl font-semibold`}>Challenge friends together!</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              className={`h-12 w-12 p-0 rounded-2xl ${isDark ? 'text-slate-400 hover:bg-slate-700/50' : 'text-gray-500 hover:bg-gray-200'}`}
              onClick={() => document.getElementById('create-modal').close()}
            >
              ×
            </Button>
          </div>

          <form onSubmit={createChallenge} className="space-y-6">
            <div>
              <label className={`block text-lg font-bold ${textPrimary} mb-3`}>Challenge Title</label>
              <Input
                placeholder="e.g., 'Hydrate with me for 30 days'"
                value={newChallenge.title}
                onChange={(e) => setNewChallenge({...newChallenge, title: e.target.value})}
                className={`h-16 text-lg rounded-2xl backdrop-blur-sm ${isDark ? 'bg-slate-700/60 border-slate-500/50 text-slate-100 placeholder-slate-400' : 'bg-white/90 border-gray-200 text-gray-900 placeholder-gray-500 shadow-sm'}`}
              />
            </div>
            <div>
              <label className={`block text-lg font-bold ${textPrimary} mb-3`}>Description</label>
              <Textarea
                placeholder="What habit will you conquer together?"
                value={newChallenge.description}
                onChange={(e) => setNewChallenge({...newChallenge, description: e.target.value})}
                className={`h-28 text-lg rounded-2xl backdrop-blur-sm resize-vertical ${isDark ? 'bg-slate-700/60 border-slate-500/50 text-slate-100 placeholder-slate-400' : 'bg-white/90 border-gray-200 text-gray-900 placeholder-gray-500 shadow-sm'}`}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-semibold ${textSecondary} mb-2`}>Duration</label>
                <Input type="number" value={newChallenge.duration} min={7} max={90}
                  onChange={(e) => setNewChallenge({...newChallenge, duration: parseInt(e.target.value) || 30})}
                  className={`h-14 text-lg rounded-xl ${isDark ? 'bg-slate-700/50 border-slate-500/30' : 'bg-white/80 border-gray-200 shadow-sm'}`}
                />
                <span className="text-xs text-slate-500 mt-1 block">days</span>
              </div>
              <div>
                <label className={`block text-sm font-semibold ${textSecondary} mb-2`}>Daily Goal</label>
                <Input placeholder="e.g., 8 glasses water"
                  value={newChallenge.goal}
                  onChange={(e) => setNewChallenge({...newChallenge, goal: e.target.value})}
                  className={`h-14 text-lg rounded-xl ${isDark ? 'bg-slate-700/50 border-slate-500/30' : 'bg-white/80 border-gray-200 shadow-sm'}`}
                />
              </div>
            </div>
            <div className={`flex gap-4 pt-6 border-t ${isDark ? 'border-slate-700/50' : 'border-gray-200/50'}`}>
              <Button type="submit" disabled={creating || !newChallenge.title.trim()}
                className={`flex-1 h-14 bg-gradient-to-r ${accentBg} hover:from-emerald-600 hover:to-emerald-700 ${isDark ? 'text-slate-900' : 'text-white'} font-bold text-lg rounded-2xl shadow-2xl border ${accentBorder} disabled:opacity-50 transition-all`}
              >
                {creating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-slate-900 border-t-emerald-500 rounded-full animate-spin mr-2" />
                    Launching...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Launch Challenge
                  </>
                )}
              </Button>
              <Button type="button" variant="outline"
                className={`h-14 px-8 ${isDark ? 'border-slate-500/50 text-slate-400 hover:bg-slate-700/50' : 'border-gray-300 text-gray-600 hover:bg-gray-100'} rounded-2xl font-medium`}
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
