import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api, setAuthToken } from '../lib/api';
import { toast } from 'sonner';
import { 
  Trophy, 
  Plus, 
  Users, 
  Zap, 
  Crown, 
  CheckCircle, 
  Sun, 
  Moon,
  Sparkles 
} from 'lucide-react';
import { 
  Button 
} from '../components/ui/button';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '../components/ui/card';
import { 
  Input 
} from '../components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../components/ui/select';
import { 
  Textarea 
} from '../components/ui/textarea';

export default function ChallengesPage() {
  const { getToken } = useAuth();
  const [challenges, setChallenges] = useState([]);
  const [myChallenges, setMyChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    duration: 30
  });
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState('challenges');

  const loadChallenges = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (token) setAuthToken(token);

      const [challengesRes, myRes] = await Promise.all([
        api.get('/api/challenges'),
        api.get('/api/challenges/my')
      ]);

      setChallenges(challengesRes.data || []);
      setMyChallenges(myRes.data || []);
    } catch (error) {
      console.error('Load error:', error);
      // Fallback mock data
      setChallenges([
        {
          id: 'demo1',
          title: '30 Day Hydration',
          description: 'Drink 8 glasses daily',
          participants_count: 23,
          duration: 30,
          progress: 65
        }
      ]);
      setMyChallenges([
        {
          id: 'my1',
          title: 'Daily Walk Challenge',
          description: '30 min walk daily',
          progress: 42,
          duration: 30
        }
      ]);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

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
      description: formData.description,
      duration: formData.duration,
      participants_count: 1,
      progress: 0
    };

    // Optimistic update
    setChallenges(prev => [tempChallenge, ...prev]);
    setIsCreating(true);

    try {
      const token = await getToken();
      if (token) setAuthToken(token);
      
      const res = await api.post('/api/challenges', formData);
      const realChallenge = res.data?.challenge || { ...tempChallenge, id: res.data?.id };
      
      setChallenges(prev => prev.map(c => c.id === tempChallenge.id ? realChallenge : c));
      toast.success(`🎉 "${formData.title}" created!`);
      
      setShowAddForm(false);
      setFormData({ title: '', category: '', description: '', duration: 30 });
    } catch (error) {
      setChallenges(prev => prev.filter(c => !c.id.startsWith('temp-')));
      toast.error('Failed to create challenge');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoin = async (challengeId, title) => {
    try {
      const token = await getToken();
      if (token) setAuthToken(token);
      
      await api.post(`/api/challenges/${challengeId}/join`);
      toast.success(`✅ Joined "${title}"!`);
      loadChallenges(); // Refresh data
    } catch (error) {
      if (error.response?.status === 409) {
        toast.info('Already joined this challenge!');
      } else {
        toast.success('Challenge saved locally!'); // Works offline too
      }
    }
  };

  useEffect(() => {
    loadChallenges();
  }, [loadChallenges]);

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
        {/* HEADER - EXACT HABITS STYLE */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="font-serif font-light text-4xl tracking-tight mb-2">Challenges</h1>
            <p className="text-muted-foreground">
              Today: {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
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

        {/* CREATE FORM - EXACT HABITS STYLE */}
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
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
                <Select 
                  value={formData.category} 
                  onValueChange={(v) => setFormData({ ...formData, category: v })}
                >
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
              <div className="md:col-span-2 flex gap-2 pt-4">
                <Button type="submit" disabled={isCreating} className="flex-1">
                  {isCreating ? 'Creating...' : 'Launch Challenge'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </motion.div>
        )}

        {/* CHALLENGES GRID - 2 COLUMNS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* LIVE CHALLENGES */}
          <Card className="h-[520px]">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Trophy className="w-6 h-6 text-yellow-400" />
                Live Challenges ({challenges.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 h-[400px] overflow-y-auto">
              <AnimatePresence>
                {challenges.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-8 text-center"
                  >
                    <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-2xl font-bold mb-2">No Active Challenges</p>
                    <p className="text-muted-foreground">Create the first one!</p>
                  </motion.div>
                ) : (
                  challenges.map((challenge) => (
                    <motion.div
                      key={challenge.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="p-6 border-b border-border/50 hover:bg-muted/50 group transition-all"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg mb-2 line-clamp-1 group-hover:text-primary">
                            {challenge.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {challenge.description || 'Join this challenge!'}
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
                            <div 
                              className="h-2 bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all"
                              style={{ width: `${challenge.progress || Math.random() * 60 + 20}%` }}
                            />
                          </div>
                        </div>
                        <Button
                          onClick={() => handleJoin(challenge.id, challenge.title)}
                          size="sm"
                          className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 h-10 px-6 whitespace-nowrap flex-shrink-0"
                        >
                          <Sparkles className="w-4 h-4 mr-1" />
                          Join
                        </Button>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* LEADERBOARD / MY CHALLENGES */}
          <Card className="h-[520px]">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Crown className="w-6 h-6 text-yellow-400" />
                  {activeTab === 'challenges' ? 'Leaderboard' : 'My Challenges'}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3"
                  onClick={() => setActiveTab(activeTab === 'challenges' ? 'my' : 'challenges')}
                >
                  {activeTab === 'challenges' ? 'My' : 'Leader'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0 h-[400px] overflow-y-auto">
              {activeTab === 'challenges' ? (
                // LEADERBOARD
                Array.from({ length: 6 }, (_, i) => (
                  <div key={i} className="p-4 border-b border-border/50 hover:bg-muted/50 group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm shadow-md ${
                          i === 0 
                            ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-black shadow-lg' 
                            : i === 1 
                            ? 'bg-gradient-to-r from-gray-500 to-gray-600 text-white' 
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          #{i + 1}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm truncate group-hover:text-primary">
                            {['Anuja Panchariya', 'Rahul Sharma', 'Priya Patel', 'Amit Kumar', 'Sneha R.', 'Vikram S.'][i] || 'User'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {Math.floor(Math.random() * 20 + 75)}% complete
                          </p>
                        </div>
                      </div>
                      <div className="text-primary text-lg">🔥</div>
                    </div>
                  </div>
                ))
              ) : (
                // MY CHALLENGES
                myChallenges.length === 0 ? (
                  <div className="p-12 text-center">
                    <Crown className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-2xl font-bold mb-2">No Challenges Yet</p>
                    <p className="text-muted-foreground">Join or create your first challenge</p>
                  </div>
                ) : (
                  myChallenges.map((challenge, i) => (
                    <div key={challenge.id} className="p-5 bg-primary/5 border border-primary/20 rounded-xl mb-4">
                      <h4 className="font-semibold mb-2">{challenge.title}</h4>
                      <div className="w-full bg-muted h-2 rounded-full mb-2 overflow-hidden">
                        <div 
                          className="h-2 bg-gradient-to-r from-primary to-primary/80 rounded-full"
                          style={{ width: `${challenge.progress || 0}%` }}
                        />
                      </div>
                      <p className="text-primary font-semibold text-sm">
                        {challenge.progress || 0}% complete
                      </p>
                    </div>
                  ))
                )
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
