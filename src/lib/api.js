
export const API_URL = 'https://healthy-habits-be-1.onrender.com/api'

export const apiFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token')
  
  const url = `${API_URL}${endpoint}`
  const config = {
    headers: { 
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers 
    },
    ...options
  }
  
  try {
    const response = await fetch(url, config)
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `API Error: ${response.status}`)
    }
    return response.json()
  } catch (error) {
    throw new Error(`Network Error: ${error.message}`)
  }
}

// ✅ BUILD ERROR FIXES - YE SAB EXPORT HAIN
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token)
  } else {
    localStorage.removeItem('token')
    sessionStorage.removeItem('token')
  }
}

export const clearAuthToken = () => {
  localStorage.removeItem('token')
  sessionStorage.removeItem('token')
}

// Individual API methods
export const login = (credentials) => 
  apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(credentials) })

export const register = (userData) => 
  apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(userData) })

export const getHabits = () => apiFetch('/habits')
export const createHabit = (habitData) => 
  apiFetch('/habits', { method: 'POST', body: JSON.stringify(habitData) })
export const updateHabit = (id, habitData) => 
  apiFetch(`/habits/${id}`, { method: 'PUT', body: JSON.stringify(habitData) })
export const deleteHabit = (id) => 
  apiFetch(`/habits/${id}`, { method: 'DELETE' })
export const getStats = () => apiFetch('/stats')

export const getChallenges = () => apiFetch('/challenges')
export const createChallenge = (data) => apiFetch('/challenges', { 
  method: 'POST', 
  body: JSON.stringify(data) 
})
export const joinChallenge = (id) => apiFetch(`/challenges/${id}/join`, { 
  method: 'POST' 
})
export const getLeaderboard = (id) => apiFetch(`/challenges/${id}/leaderboard`)

export const api = {
  fetch: apiFetch,
  login, register, getHabits, createHabit, updateHabit, deleteHabit, getStats,
  getChallenges, createChallenge, joinChallenge, getLeaderboard,  // ← ADD THESE
  setAuthToken, clearAuthToken
}

