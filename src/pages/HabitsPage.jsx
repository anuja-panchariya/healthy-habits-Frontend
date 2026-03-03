import React, { useState } from 'react'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { toast } from 'sonner'

export default function HabitsPage() {
  const [habits, setHabits] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [category, setCategory] = useState('fitness')

  const createHabit = () => {
    if (!name.trim()) return toast.error('Name required!')
    
    const newHabit = {
      id: Date.now(),
      name: name.trim(),
      category,
      goal: 8,
      logs: []
    }
    
    setHabits([newHabit, ...habits])
    setName('')
    setShowForm(false)
    toast.success('✅ Habit created!')
  }

  const logHabit = (id) => {
    setHabits(habits.map(h => 
      h.id === id 
        ? { ...h, logs: [...h.logs, new Date().toDateString()] }
        : h
    ))
    toast.success('✅ Logged!')
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      padding: '2rem', 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', gap: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '2rem', borderBottom: '1px solid #e5e7eb' }}>
          <div>
            <h1 style={{ fontSize: '3rem', fontWeight: 300, margin: 0 }}>Your Habits</h1>
            <p style={{ color: '#6b7280', fontSize: '1.25rem', marginTop: '0.5rem' }}>
              {habits.length} active habits
            </p>
          </div>
          <Button 
            onClick={() => setShowForm(true)}
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              color: 'white',
              padding: '1rem 2rem',
              borderRadius: '1rem',
              fontSize: '1.1rem',
              fontWeight: 500,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
            }}
          >
            + New Habit
          </Button>
        </div>

        {habits.length === 0 ? (
          <Card style={{ 
            border: 'none', 
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            borderRadius: '1.5rem',
            maxWidth: '500px',
            margin: '0 auto'
          }}>
            <CardContent style={{ padding: '4rem 2rem', textAlign: 'center' }}>
              <div style={{
                width: '80px', height: '80px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                borderRadius: '1.5rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 2rem',
                fontSize: '2rem'
              }}>
                🎯
              </div>
              <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                No habits yet
              </h2>
              <p style={{ color: '#6b7280', fontSize: '1.1rem', marginBottom: '2rem' }}>
                Start building better habits today!
              </p>
              <Button 
                onClick={() => setShowForm(true)}
                style={{
                  padding: '1rem 3rem',
                  fontSize: '1.1rem',
                  borderRadius: '1rem',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  color: 'white',
                  border: 'none',
                  fontWeight: 500,
                  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
                }}
              >
                Create First Habit
              </Button>
            </CardContent>
          </Card>
        ) : (
          habits.map(habit => {
            const progress = Math.min((habit.logs.length / habit.goal) * 100, 100)
            return (
              <Card key={habit.id} style={{ 
                border: 'none', 
                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
                borderRadius: '1.5rem',
                marginBottom: '1.5rem'
              }}>
                <CardContent style={{ padding: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                      <div style={{
                        width: '64px', height: '64px',
                        background: habit.category === 'fitness' ? 
                          'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 
                          'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                        borderRadius: '1rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.5rem',
                        color: 'white',
                        flexShrink: 0
                      }}>
                        {habit.category === 'fitness' ? '🏃' : '💧'}
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1.75rem', fontWeight: 'bold', margin: 0, marginBottom: '0.5rem' }}>
                          {habit.name}
                        </h3>
                        <Badge style={{
                          background: '#dbeafe',
                          color: '#1e40af',
                          padding: '0.5rem 1rem',
                          borderRadius: '9999px',
                          fontSize: '0.875rem',
                          fontWeight: 500
                        }}>
                          {habit.category}
                        </Badge>
                      </div>
                    </div>
                    <Button 
                      onClick={() => logHabit(habit.id)}
                      style={{
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: 'white',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '0.75rem',
                        fontWeight: 500,
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                      }}
                    >
                      Log Today
                    </Button>
                  </div>
                  
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ 
                      width: '100%', 
                      height: '12px', 
                      background: '#e5e7eb', 
                      borderRadius: '9999px',
                      overflow: 'hidden'
                    }}>
                      <div style={{ 
                        height: '100%', 
                        background: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)',
                        borderRadius: '9999px',
                        width: `${progress}%`,
                        transition: 'width 0.5s ease'
                      }} />
                    </div>
                  </div>
                  
                  <div style={{ textAlign: 'center', padding: '1rem', background: '#d1fae5', borderRadius: '1rem' }}>
                    <p style={{ margin: 0, fontWeight: 500, color: '#065f46' }}>
                      {habit.logs.length}/{habit.goal} • Goal: {habit.goal} daily
                    </p>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}

        {showForm && (
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'white',
            padding: '2rem',
            borderRadius: '1.5rem',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            maxWidth: '500px',
            width: '90vw',
            zIndex: 1000
          }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
              Create New Habit
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g., Drink 8 glasses of water"
                style={{ padding: '1rem', fontSize: '1.1rem', borderRadius: '0.75rem', border: '1px solid #d1d5db' }}
              />
              <select 
                value={category} 
                onChange={e => setCategory(e.target.value)}
                style={{ padding: '1rem', fontSize: '1.1rem', borderRadius: '0.75rem', border: '1px solid #d1d5db' }}
              >
                <option value="fitness">Fitness 🏃</option>
                <option value="hydration">Hydration 💧</option>
                <option value="nutrition">Nutrition 🍎</option>
              </select>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <Button 
                  onClick={createHabit}
                  style={{
                    flex: 1,
                    padding: '1rem',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.75rem',
                    fontSize: '1.1rem',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  Create Habit
                </Button>
                <Button 
                  onClick={() => setShowForm(false)}
                  style={{
                    padding: '1rem 2rem',
                    background: 'transparent',
                    color: '#6b7280',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.75rem',
                    fontSize: '1.1rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
