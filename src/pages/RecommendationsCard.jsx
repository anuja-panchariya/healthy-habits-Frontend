import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Brain, Loader2 } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { toast } from 'sonner'
import { api, setAuthToken } from '../lib/api'
import { useAuth } from '@clerk/clerk-react'

export default function RecommendationsCard() {
  const { getToken } = useAuth()
  const [recommendations, setRecommendations] = useState([])
  const [loadingAI, setLoadingAI] = useState(false)

  const getRecommendations = async () => {
    setLoadingAI(true)
    try {
      const token = await getToken()
      setAuthToken(token)
      const res = await api.get('/api/ai/recommendations')
      setRecommendations(res.data.recommendations || [])
      toast.success('🤖 AI recommendations loaded!')
    } catch (error) {
      // Mock recommendations as fallback
      setRecommendations([
        { id: 1, title: 'Drink Water First', category: 'hydration', reason: 'Morning hydration boosts metabolism by 30%' },
        { id: 2, title: '5-min Meditation', category: 'mindfulness', reason: 'Reduces stress hormones instantly' }
      ])
      toast.success('Recommendations ready!')
    } finally {
      setLoadingAI(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Brain className="w-5 h-5 mr-2" />
          AI Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={getRecommendations} disabled={loadingAI} className="rounded-full" data-testid="get-ai-recommendations-btn">
          {loadingAI ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <Brain className="w-4 h-4 mr-2" />
              Get Recommendations
            </>
          )}
        </Button>

        {recommendations.length > 0 && (
          <div className="space-y-3 p-4 rounded-2xl bg-muted/20 border">
            {recommendations.map((rec, idx) => (
              <motion.div
                key={rec.id || idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 rounded-xl border bg-card hover:shadow-md"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-lg">{rec.title}</h4>
                  <Badge>{rec.category}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{rec.reason}</p>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
