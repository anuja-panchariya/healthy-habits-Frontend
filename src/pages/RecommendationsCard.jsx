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
    setRecommendations([]) // Clear previous
    
    try {
      const token = await getToken()
      setAuthToken(token)
      const res = await api.get('/api/ai/recommendations')
      
      if (res.data.recommendations?.length > 0) {
        setRecommendations(res.data.recommendations)
        toast.success(`🤖 ${res.data.habitsCount || 0} habits analyzed!`)
      } else {
        toast.warning('No new recommendations available')
      }
    } catch (error) {
      console.error('AI Error:', error)
      toast.error('AI service temporarily unavailable')
    } finally {
      setLoadingAI(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Brain className="w-5 h-5 mr-2 text-purple-500" />
          AI Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={getRecommendations} disabled={loadingAI} className="w-full rounded-xl">
          {loadingAI ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing habits...
            </>
          ) : (
            <>
              <Brain className="w-4 h-4 mr-2" />
              Get AI Recommendations
            </>
          )}
        </Button>

        {recommendations.length > 0 && (
          <div className="space-y-3">
            {recommendations.map((rec, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl border bg-gradient-to-r from-purple-50 to-pink-50 hover:shadow-lg transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-lg">{rec.title}</h4>
                  <Badge variant="outline">{rec.category}</Badge>
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
