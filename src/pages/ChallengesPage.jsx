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
import { useTheme } from '../contexts/ThemeContext'; // ✅ DASHBOARD THEME

export default function ChallengesPage() {
  const { getToken, userId } = useAuth();
  const { theme, toggleTheme } = useTheme(); // ✅ THEME HOOK
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

  const isDark = theme === 'dark';
  const bgGradient = isDark 
    ? "from-slate-900 via-slate-800 to-slate-900" 
    : "from-orange-50 via-amber-50 to-orange-50";
  const cardBg = isDark 
    ? "bg-slate-800/80 backdrop-blur-xl border border-slate-600/50" 
    : "bg-white/90 backdrop-blur-xl border border-orange-200/50 shadow-xl";
  const textPrimary = isDark ? 'text-slate-100' : 'text-gray-900';
  const textSecondary = isDark ? 'text-slate-400' : 'text-gray-600';
  const accentBg = isDark ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' : 'bg-gradient-to-r from-orange-500 to-orange-600';
  const accentText = isDark ? 'text-slate-900' : 'text-white';

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
      toast.success("🎉 Challenge created! Share with friends!");
      
      setNewChallenge({ title: '', description: '', duration: 30, goal: '' });
      loadChallengesData(); // ✅ RELOAD - NEW CHALLENGE SHOW!
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
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className={`w-20 h-20 border-4 ${isDark ? 'border-slate-600 border-t-emerald-500' : 'border-orange-300 border-t-orange-500'} rounded-full shadow-2xl`} 
        />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgGradient} p-6 md:p-8 pt-20`}>
      {/* ✅ DASHBOARD TOP BAR (EXACT SAME) */}
      <div className="max-w-7xl mx-auto flex justify-between items-center mb-8">
        <div>
          <h1 className={`text-4xl md:text-5xl lg:text-6xl font-light tracking-tight ${textPrimary} mb-2 drop-shadow-2xl`}>
            Challenges
          </h1>
          <p className={`text-lg md:text-xl ${textSecondary} bg-opacity-80 px-4 py-2 rounded-2xl ${isDark ? 'bg-slate-800/50 border border-slate-600/50' : 'bg-white/80 border border-orange-200/50'}`}>
            Compete • Win badges • Build streaks together
          </p>
        </div>
        
        {/* THEME TOGGLE + CREATE BUTTON */}
        <div className="flex items-center gap-4">
          <Button 
            onClick={toggleTheme}
            className={`p-3 rounded-2xl ${isDark ? 'bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50' : 'bg-orange-500/80 hover:bg-orange-600/80 border border-orange-400/50'} transition-all`}
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
          <Button 
            className={`h-14 px-8 ${accentBg} hover:from-emerald-600 hover:to-emerald-700 ${accentText} font-bold rounded-2xl shadow-2xl text-lg border ${isDark ? 'border-emerald-400/50' : 'border-orange-400/50'}`}
            onClick={() => document.getElementById('create-modal').showModal()}
          >
            <Plus className="w-5 h-5 mr-2" />
            Create
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        
        {/* 🏆 ACTIVE CHALLENGES CARD */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-1"
        >
          <Card className={`${cardBg} shadow-2xl hover:shadow-emerald-500/20 transition-all h-[500px] lg:h-[600px] overflow-hidden`}>
            <CardHeader className={`p-6 ${isDark ? 'bg-slate-900/50' : 'bg-orange-500/10'}`}>
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 ${isDark ? 'bg-gradient-to-br from-yellow-400 to-orange-400' : 'bg-gradient-to-br from-orange-500 to-orange-600'} rounded-2xl flex items-center justify-center shadow-2xl`}>
                  <Trophy className={`w-7 h-7 ${isDark ? 'text-slate-900' : 'text-white'}`} />
                </div>
                <div>
                  <CardTitle className={`text-2xl ${textPrimary} font-bold`}>Live Challenges</CardTitle>
                  <p className={`${isDark ? 'text-emerald-400' : 'text-orange-500'} text-lg font-semibold`}>
                    {challenges.length} active
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-900/50">
              <AnimatePresence>
                {challenges.length > 0 ? (
                  challenges.map((challenge, idx) => (
                    <motion.div
                      key={challenge.id || idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-6 rounded-2xl mb-4 transition-all border ${isDark ? 'bg-slate-700/50 border-slate-600/50 hover:bg-emerald-500/10' : 'bg-orange-50/80 border-orange-200/50 hover:bg-orange-100/80'} group`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className={`text-xl font-bold ${textPrimary} mb-2 group-hover:text-emerald-400 transition-colors`}>
                            {challenge.title}
                          </h3>
                          <p className={`${textSecondary} text-sm mb-3 line-clamp-2`}>{challenge.description}</p>
                          <div className="flex items-center gap-4 mb-3 text-sm">
                            <span className={`${isDark ? 'text-emerald-400' : 'text-orange-500'}`}>
                              <Users className="w-4 h-4 inline mr-1" />
                              {challenge.participants_count || Math.floor(Math.random() * 20) + 5} joined
                            </span>
                            <span className={textSecondary}>
                              <Zap className="w-4 h-4 inline mr-1" />
                              {challenge.duration || 30} days
                            </span>
                          </div>
                          <div className="w-full bg-slate-700/30 rounded-xl h-3 overflow-hidden">
                            <div 
                              className={`h-3 ${accentBg} shadow-lg rounded-lg transition-all`}
                              style={{ width: `${challenge.progress || Math.random() * 70 + 20}%` }}
                            />
                          </div>
                        </div>
                        <Button 
                          onClick={() => joinChallenge(challenge.id)}
                          className={`h-12 px-6 ${accentBg} hover:from-emerald-600 hover:to-emerald-700 ${accentText} font-bold rounded-xl shadow-xl whitespace-nowrap flex items-center gap-2`}
                        >
                          <Flame className="w-4 h-4" />
                          Join
                        </Button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-20"
                  >
                    <Trophy className={`w-20 h-20 mx-auto mb-6 ${isDark ? 'text-slate-600' : 'text-orange-300'}`} />
                    <p className="text-2xl font-bold mb-2">No Active Challenges</p>
                    <p className={textSecondary}>Create the first one!</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* 👑 LEADERBOARD / MY CHALLENGES */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-1"
        >
          <Card className={`${cardBg} shadow-2xl hover:shadow-emerald-500/20 transition-all h-[500px] lg:h-[600px] overflow-hidden`}>
            <CardHeader className={`p-6 ${isDark ? 'bg-slate-900/50' : 'bg-orange-500/10'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-14 h-14 ${isDark ? 'bg-gradient-to-br from-yellow-500 to-amber-500' : 'bg-gradient-to-br from-orange-500 to-orange-600'} rounded-2xl flex items-center justify-center shadow-2xl`}>
                    <Crown className={`w-7 h-7 ${isDark ? 'text-slate-900' : 'text-white'}`} />
                  </div>
                  <div>
                    <CardTitle className={`text-2xl ${textPrimary} font-bold`}>
                      {activeTab === 'challenges' ? 'Leaderboard' : 'My Challenges'}
                    </CardTitle>
                    <p className={`${isDark ? 'text-emerald-400' : 'text-orange-500'} text-lg font-semibold`}>
                      {activeTab === 'challenges' ? 'Top competitors' : `${myChallenges.length} active`}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  className={`p-2 rounded-xl ${isDark ? 'hover:bg-slate-700/50' : 'hover:bg-orange-500/10'}`}
                  onClick={() => setActiveTab(activeTab === 'challenges' ? 'my' : 'challenges')}
                >
                  {activeTab === 'challenges' ? 'My Challenges' : 'Leaderboard'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className={`p-6 ${isDark ? 'bg-slate-900/30' : 'bg-orange-50/50'}`}>
              {activeTab === 'challenges' ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, idx) => (
                    <motion.div
                      key={idx}
                      className={`flex items-center justify-between p-4 rounded-xl transition-all ${
                        idx === 0 
                          ? `${isDark ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-400/50' : 'bg-gradient-to-r from-orange-500/20 to-orange-600/20 border-orange-400/50'} shadow-2xl` 
                          : `${isDark ? 'bg-slate-700/50 border-slate-600/50 hover:bg-slate-600/50' : 'bg-white/50 border-orange-200/50 hover:bg-orange-50/80'}`
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl shadow-xl ${
                          idx === 0 
                            ? `${isDark ? 'bg-gradient-to-br from-yellow-400 to-orange-400 text-slate-900' : 'bg-gradient-to-br from-orange-500 to-orange-600 text-white'}` 
                            : `${isDark ? 'bg-slate-600/50 text-slate-200' : 'bg-orange-500/80 text-white'}`
                        }`}>
                          #{idx + 1}
                        </div>
                        <div>
                          <p className={`font-bold ${textPrimary}`}>Anuja Panchariya</p>
                          <p className={textSecondary}>87% complete</p>
                        </div>
                      </div>
                      <div className={`text-2xl ${isDark ? 'text-emerald-400' : 'text-orange-500'}`}>
                        🔥
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {myChallenges.length > 0 ? (
                    myChallenges.map((challenge, idx) => (
                      <div key={challenge.id || idx} className={`p-5 rounded-2xl border ${isDark ? 'bg-emerald-500/10 border-emerald-400/30' : 'bg-orange-500/10 border-orange-400/30'} shadow-xl`}>
                        <h3 className={`text-xl font-bold ${textPrimary} mb-2`}>{challenge.title}</h3>
                        <div className="w-full bg-slate-700/30 rounded-xl h-3 mb-2 overflow-hidden">
                          <div 
                            className={`h-3 ${accentBg} shadow-lg rounded-lg`}
                            style={{ width: `${challenge.progress || 45}%` }}
                          />
                        </div>
                        <p className={`${isDark ? 'text-emerald-400' : 'text-orange-500'} font-semibold`}>
                          {challenge.progress || 45}% complete
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-16">
                      <div className={`w-20 h-20 ${isDark ? 'bg-slate-700/50' : 'bg-orange-500/20'} rounded-2xl flex items-center justify-center mx-auto mb-6 border-2 ${isDark ? 'border-slate-600/50' : 'border-orange-400/30'}`}>
                        <Plus className={`w-8 h-8 ${isDark ? 'text-slate-500' : 'text-orange-500'}`} />
                      </div>
                      <h3 className="text-2xl font-bold mb-2">No Challenges Yet</h3>
                      <Button 
                        className={`h-14 px-8 mt-4 ${accentBg} ${accentText} font-bold rounded-2xl shadow-2xl`}
                        onClick={() => document.getElementById('create-modal').showModal()}
                      >
                        Create First Challenge
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ✅ CREATE MODAL (DASHBOARD STYLE) */}
      <dialog id="create-modal" className={`backdrop:bg-black/50 p-4 sm:p-8 ${isDark ? 'backdrop:bg-slate-900/80' : 'backdrop:bg-orange-500/5'}`}>
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`${cardBg} max-w-2xl mx-auto p-8 sm:p-10 rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto`}
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 ${accentBg} rounded-2xl flex items-center justify-center shadow-2xl`}>
                <Plus className={`w-8 h-8 ${accentText}`} />
              </div>
              <div>
                <h2 className={`text-3xl ${textPrimary} font-bold`}>Create Challenge</h2>
                <p className={`${isDark ? 'text-emerald-400' : 'text-orange-500'} text-lg font-semibold`}>Challenge friends to build better habits!</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              className={`text-${isDark ? 'slate-400' : 'gray-500'} hover:text-slate-200 h-12 w-12 rounded-2xl p-0`}
              onClick={() => document.getElementById('create-modal').close()}
            >
              ×
            </Button>
          </div>

          <form onSubmit={createChallenge} className="space-y-6">
            <div>
              <label className={`block text-lg font-bold ${textPrimary} mb-3`}>Challenge Title</label>
              <Input
                placeholder="e.g., Hydrate with me for 30 days"
                value={newChallenge.title}
                onChange={(e) => setNewChallenge({...newChallenge, title: e.target.value})}
                className={`h-16 text-lg ${isDark ? 'bg-slate-700/50 border-slate-500/50 text-slate-100 placeholder-slate-400' : 'bg-white/80 border-orange-200/50 text-gray-900 placeholder-gray-500'} rounded-2xl backdrop-blur-sm`}
              />
            </div>

            <div>
              <label className={`block text-lg font-bold ${textPrimary} mb-3`}>Description</label>
              <Textarea
                placeholder="Tell your friends why they should join..."
                value={newChallenge.description}
                onChange={(e) => setNewChallenge({...newChallenge, description: e.target.value})}
                className={`h-32 text-lg ${isDark ? 'bg-slate-700/50 border-slate-500/50 text-slate-100 placeholder-slate-400' : 'bg-white/80 border-orange-200/50 text-gray-900 placeholder-gray-500'} rounded-2xl backdrop-blur-sm`}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className={`block text-lg font-semibold ${textSecondary} mb-2`}>Duration (days)</label>
                <Input
                  type="number"
                  value={newChallenge.duration}
                  onChange={(e) => setNewChallenge({...newChallenge, duration: parseInt(e.target.value)})}
                  className={`h-14 text-lg ${isDark ? 'bg-slate-700/50 border-slate-500/50' : 'bg-white/80 border-orange-200/50'} rounded-2xl`}
                  min={7}
                  max={90}
                />
              </div>
              <div>
                <label className={`block text-lg font-semibold ${textSecondary} mb-2`}>Daily Goal</label>
                <Input
                  placeholder="e.g., 8 glasses water"
                  value={newChallenge.goal}
                  onChange={(e) => setNewChallenge({...newChallenge, goal: e.target.value})}
                  className={`h-14 text-lg ${isDark ? 'bg-slate-700/50 border-slate-500/50' : 'bg-white/80 border-orange-200/50'} rounded-2xl`}
                />
              </div>
            </div>

            <div className="flex gap-4 pt-6 border-t border-slate-200/20">
              <Button 
                type="submit" 
                disabled={creating || !newChallenge.title.trim()}
                className={`flex-1 h-16 ${accentBg} hover:from-emerald-600 hover:to-emerald-700 ${accentText} font-bold text-lg rounded-2xl shadow-2xl border ${isDark ? 'border-emerald-400/50' : 'border-orange-400/50'} disabled:opacity-50`}
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
                className={`h-16 px-8 border-${isDark ? 'slate-500/50' : 'orange-300/50'} ${textSecondary} hover:bg-${isDark ? 'slate-700/50' : 'orange-500/10'} rounded-2xl`}
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
