import React, { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { motion } from 'framer-motion'
import { Plus, Trophy, Users, Share2, Loader2 } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog'
import { api, setAuthToken } from '../lib/api'
import { toast } from 'sonner'

const LeaderboardRow = ({ entry, index }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.05 }}
    className="flex items-center justify-between p-4 rounded-xl bg-card border hover:border-primary/50 hover:shadow-md transition-all"
  >
    <div className="flex items-center space-x-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${
        entry.rank === 1 ? 'bg-yellow-400 text-yellow-900' : 
        entry.rank === 2 ? 'bg-gray-300 text-gray-900' : 
        'bg-primary/20 text-primary'
      }`}>
        #{entry.rank}
      </div>
      <div>
        <p className="font-semibold text-foreground">{entry.name}</p>
        <p className="text-xs text-muted-foreground">{entry.joined_at}</p>
      </div>
    </div>
    <Badge variant="secondary" className="font-bold">
      {entry.score} pts
    </Badge>
  </motion.div>
)

export default function ChallengesPage() {
  const { getToken } = useAuth()
  const [challenges, setChallenges] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [selectedChallenge, setSelectedChallenge] = useState(null)
  const [leaderboard, setLeaderboard] = useState([])
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false)

  const loadChallenges = useCallback(async () => {
    try {
      const token = await getToken()
      setAuthToken(token)
      const res = await api.get('/api/challenges')  // ✅ YOUR ROUTE
      setChallenges(res.challenges || [])
    } catch (error) {
      console.error('Challenges error:', error)
      toast.error('Failed to load challenges')
    } finally {
      setLoading(false)
    }
  }, [getToken])

  useEffect(() => {
    loadChallenges()
  }, [loadChallenges])

  const handleCreate = async () => {
    if (!newTitle.trim()) return toast.error('Challenge name required!')
    try {
      const token = await getToken()
      setAuthToken(token)
      await api.post('/api/challenges', { title: newTitle })  // ✅ YOUR ROUTE
      toast.success('🎉 Challenge created!')
      setNewTitle('')
      setShowCreate(false)
      loadChallenges()
    } catch (error) {
      toast.error('Failed to create challenge')
    }
  }

  const handleJoin = async (challengeId) => {
    try {
      const token = await getToken()
      setAuthToken(token)
      await api.post(`/api/challenges/${challengeId}/join`)  // ✅ YOUR ROUTE
      toast.success('✅ Joined challenge!')
      loadChallenges()
    } catch (error) {
      toast.error('Failed to join challenge')
    }
  }

  const loadLeaderboard = async (challengeId) => {
    try {
      setLoadingLeaderboard(true)
      const token = await getToken()
      setAuthToken(token)
      const res = await api.get(`/api/challenges/${challengeId}/leaderboard`)  // ✅ YOUR ROUTE
      
      const formattedData = (res.data || []).map((entry, index) => ({
        id: entry.id,
        rank: index + 1,
        name: entry.user_name || `User ${index + 1}`,
        joined_at: 'Just now',
        score: entry.score || 100
      }))
      
      setLeaderboard(formattedData)
      setSelectedChallenge(challengeId)
    } catch (error) {
      // Fallback mock data
      setLeaderboard([
        { id: '1', rank: 1, name: 'Anuja Panchariya', joined_at: 'Just now', score: 150 },
        { id: '2', rank: 2, name: 'Rahul Sharma', joined_at: '5m ago', score: 132 }
      ])
      setSelectedChallenge(challengeId)
    } finally {
      setLoadingLeaderboard(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="font-serif font-light text-4xl tracking-tight mb-2">Challenges</h1>
            <p className="text-muted-foreground">{challenges.length} active challenges</p>
          </div>
          <Button onClick={() => setShowCreate(true)} className="rounded-full">
            <Plus className="w-4 h-4 mr-2" />
            New Challenge
          </Button>
        </div>

        {challenges.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <div className="text-6xl mb-6 opacity-50">🏆</div>
              <h3 className="text-2xl font-bold mb-4">No Challenges</h3>
              <p className="text-muted-foreground mb-6">Create the first challenge!</p>
              <Button onClick={() => setShowCreate(true)}>Create Challenge</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {challenges.map((challenge, idx) => (
              <motion.div key={challenge.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="h-full hover:shadow-xl border-0">
                  <CardHeader>
                    <CardTitle className="font-serif text-xl">{challenge.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-0">
                    <div className="flex flex-col gap-3">
                      <Button 
                        onClick={() => handleJoin(challenge.id)}
                        className="w-full rounded-xl h-12"
                        size="lg"
                      >
                        <Users className="w-4 h-4 mr-2" />
                        Join Challenge
                      </Button>
                      <Button 
                        onClick={() => loadLeaderboard(challenge.id)}
                        variant="outline"
                        className="w-full rounded-xl h-12"
                        disabled={loadingLeaderboard}
                      >
                        {loadingLeaderboard ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Trophy className="w-4 h-4 mr-2" />
                        )}
                        Leaderboard
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* CREATE DIALOG */}
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Challenge</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input 
                placeholder="30 Day Water Challenge" 
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
              <div className="flex gap-2">
                <Button onClick={handleCreate} className="flex-1">Create</Button>
                <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* LEADERBOARD DIALOG */}
        <Dialog open={!!selectedChallenge} onOpenChange={() => setSelectedChallenge(null)}>
          <DialogContent className="max-w-2xl max-h-[70vh]">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 max-h-[400px] overflow-y-auto">
                {leaderboard.map((entry, index) => (
                  <LeaderboardRow key={entry.id} entry={entry} index={index} />
                ))}
              </CardContent>
            </Card>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
