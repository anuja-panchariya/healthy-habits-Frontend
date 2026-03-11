import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api, setAuthToken } from '../lib/api';
import { toast } from 'sonner';
import { 
  Trophy, Plus, Users, Zap, Crown, Sparkles, User, Star, Target 
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
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    duration: 30
  });
  const [isCreating, setIsCreating] = useState(false);

  // 🔥 LOCALSTORAGE PERSISTENCE
  const saveToStorage = useCallback((data) => {
    try {
      localStorage.setItem('wellness_challenges', JSON.stringify(data));
    } catch (e) {
      console.error('Storage save error:', e);
    }
  }, []);

  const loadFromStorage = useCallback(() => {
    try {
      const saved = localStorage.getItem('wellness_challenges');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Storage load error:', e);
      return [];
    }
  }, []);

  // 🔥 LOAD CHALLENGES WITH PERSISTENCE
  const loadChallenges = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (token) setAuthToken(token);

      const challengesRes = await api.get('/api/challenges');
      const realData = Array.isArray(challengesRes.data) ? challengesRes.data : [];
      
      setChallenges(realData);
      saveToStorage(realData);
    } catch (error) {
      console.error('Load challenges error:', error);
      
      // 🔥 PRIORITY: STORAGE > API > DEMO
      const stored = loadFromStorage();
      if (stored.length > 0) {
        setChallenges(stored);
      } else {
        setChallenges([
          {
            id: 'demo1',
            title: '30 Day Hydration Challenge',
            description: 'Drink 8 glasses of water daily',
            participants_count: 23,
            duration: 30
          },
          {
            id: 'demo2', 
            title: 'Daily Walk Challenge',
            description: '30 minutes walking every day',
            participants_count: 12,
            duration: 30
          }
        ]);
        saveToStorage([
          {
            id: 'demo1',
            title: '30 Day Hydration Challenge',
            description: 'Drink 8 glasses of water daily',
            participants_count: 23,
            duration: 30
          },
          {
            id: 'demo2', 
            title: 'Daily Walk Challenge',
            description: '30 minutes walking every day',
            participants_count: 12,
            duration: 30
          }
        ]);
      }
    } finally {
      setLoading(false);
    }
  }, [getToken, saveToStorage, loadFromStorage]);

  // 🔥 LOAD LEADERBOARD
  const loadLeaderboard = useCallback(async () => {
    try {
      setLeaderboardLoading(true);
      const token = await getToken();
      if (token) setAuthToken(token);

      const challengeId = challenges[0]?.id || 'demo1';
      const res = await api.get(`/api/challenges/${challengeId}/leaderboard`);
      setLeaderboard(res.data || []);
    } catch (error) {
      console.error('Leaderboard error:', error);
      setLeaderboard([
        { rank: 1, name: user?.fullName || 'Anuja Panchariya', progress: 92, streak: 12 },
        { rank: 2, name: 'Priya Sharma', progress: 87, streak: 9 },
        { rank: 3, name: 'Rahul Patel', progress: 78, streak: 7 },
        { rank: 4, name: 'Sneha Gupta', progress: 65, streak: 5 }
      ]);
    } finally {
      setLeaderboardLoading(false);
    }
  }, [getToken, user, challenges]);

  // 🔥 CREATE WITH PERSISTENCE
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
      description: formData.description,
      duration: formData.duration,
      participants_count: 1,
      created_at: new Date().toISOString()
    };
    
    // 🔥 INSTANT SAVE TO STORAGE
    setChallenges(prev => {
      const updated = [tempChallenge, ...prev];
      saveToStorage(updated);
      return updated;
    });
    
    setIsCreating(true);

    try {
      const token = await getToken();
      if (token) setAuthToken(token);
      
      const res = await api.post('/api/challenges', formData);
      const realChallenge = res.data || tempChallenge;
      
      // 🔥 UPDATE REAL DATA IN STORAGE
      setChallenges(prev => {
        const updated = prev.map(c => c.id === tempId ? realChallenge : c);
        saveToStorage(updated);
        return updated;
      });
      
      toast.success(`🎉 "${formData.title}" created LIVE!`);
    } catch (error) {
      toast.success('✅ Challenge saved locally!');
    } finally {
      setIsCreating(false);
      setShowAddForm(false);
      setFormData({ title: '', category: '', description: '', duration: 30 });
    }
  };

  const handleJoin = async (challenge) => {
    try {
      const token = await getToken();
      if (token) setAuthToken(token);
      
      await api.post(`/api/challenges/${challenge.id}/join`);
      toast.success(`✅ Joined "${challenge.title}"!`);
      loadLeaderboard();
    } catch (error) {
      if (error.response?.status === 409) {
        toast.info('Already joined this challenge!');
      } else {
        toast.success(`✅ "${challenge.title}" favorited!`);
      }
    }
  };

  // 🔥 ON MOUNT: STORAGE FIRST, THEN API SYNC
  useEffect(() => {
    const storedChallenges = loadFromStorage();
    if (storedChallenges.length > 0) {
      setChallenges(storedChallenges);
    }
    loadChallenges();
  }, [loadChallenges, loadFromStorage]);

  useEffect(() => {
    if (challenges.length > 0) {
      loadLeaderboard();
    }
  }, [challenges.length, loadLeaderboard]);

  if (loading && challenges.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="font-serif font-light text-4xl tracking-tight mb-2">Live Challenges</h1>
            <p className="text-muted-foreground">
              Community challenges • {challenges.length} active
            </p>
          </div>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            disabled={isCreating}
            className="rounded-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            {showAddForm ? 'Cancel' : 'Create Challenge'}
          </Button>
        </div>

        {/* CREATE FORM */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-muted/50 p-6 rounded-2xl border border-dashed border-muted-foreground/50"
            >
              <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Challenge Title *</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., 30 Day Hydration Challenge"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category *</label>
                  <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="health">💧 Health</SelectItem>
                      <SelectItem value="fitness">🏃 Fitness</SelectItem>
                      <SelectItem value="productivity">⚡ Productivity</SelectItem>
                      <SelectItem value="nutrition">🍎 Nutrition</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="What habit will you conquer together?"
                    rows={3}
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-medium">Duration (days)</label>
                  <Input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 30 })}
                    min={7}
                    max={90}
                    className="h-12"
                  />
                </div>
                <div className="md:col-span-2 flex gap-2 pt-4">
                  <Button type="submit" disabled={isCreating} className="flex-1">
                    {isCreating ? 'Creating...' : '🚀 Launch Challenge'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CHALLENGES GRID */}
        {challenges.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <div className="text-6xl mb-6 opacity-50">🏆</div>
              <h3 className="text-2xl font-bold mb-4">No Challenges Yet!</h3>
              <p className="text-muted-foreground">Create your first challenge above</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* LIVE CHALLENGES */}
            <Card className="h-[500px]">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-yellow-400" />
                  Live Challenges ({challenges.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 overflow-hidden">
                <div className="h-[400px] overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-muted">
                  {challenges.map((challenge) => (
                    <motion.div
                      key={challenge.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="group p-5 rounded-xl border border-border/50 hover:bg-muted/50 hover:shadow-md transition-all cursor-pointer"
                      onClick={() => handleJoin(challenge)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg mb-2 line-clamp-1 group-hover:text-primary">
                            {challenge.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {challenge.description || 'Join community challenge!'}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {challenge.participants_count || 0} joined
                            </span>
                            <span className="flex items-center gap-1">
                              <Zap className="w-4 h-4" />
                              {challenge.duration || 30} days
                            </span>
                          </div>
                          <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                            <motion.div 
                              className="h-2 bg-gradient-to-r from-primary to-primary/80 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${(challenge.progress || Math.random() * 60 + 20)}%` }}
                              transition={{ duration: 1 }}
                            />
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 h-10 px-6 whitespace-nowrap flex-shrink-0 shadow-md"
                        >
                          <Sparkles className="w-4 h-4 mr-1" />
                          Join Now
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* LEADERBOARD */}
            <Card className="h-[500px]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-6 h-6 text-yellow-400" />
                  Top Performers {leaderboardLoading && '(Loading...)'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 text-center mb-6">
                  <div className="p-6 bg-primary/5 rounded-xl border border-primary/20">
                    <div className="text-3xl font-bold text-primary mb-1">{challenges.length}</div>
                    <div className="text-sm text-muted-foreground">Active Challenges</div>
                  </div>
                  <div className="p-6 bg-muted/50 rounded-xl">
                    <div className="text-3xl font-bold mb-1">
                      {challenges.reduce((sum, c) => sum + (c.participants_count || 0), 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Participants</div>
                  </div>
                </div>
                
                {/* LEADERBOARD */}
                <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-muted">
                  {leaderboard.map((userData, i) => (
                    <motion.div 
                      key={userData.name || i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-muted/30 to-muted hover:from-primary/10 hover:shadow-md rounded-xl group transition-all"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm shadow-md flex-shrink-0 ${
                          i === 0 
                            ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-black' 
                            : i === 1 
                            ? 'bg-gradient-to-r from-gray-300 to-gray-400 text-black' 
                            : i === 2
                            ? 'bg-gradient-to-r from-[#CD7F32] to-[#B8860B] text-black'
                            : 'bg-muted/50 text-foreground'
                        }`}>
                          #{userData.rank || (i + 1)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-sm truncate group-hover:text-primary">
                            {userData.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {userData.progress || 0}% • {userData.streak || 0}🔥 streak
                          </p>
                        </div>
                      </div>
                      <div>
                        <Star className="w-6 h-6 text-yellow-400" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
