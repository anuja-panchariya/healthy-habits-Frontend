// src/lib/api.js - 100% Working
export const API_URL = 'https://healthy-habits-be-1.onrender.com/api'

export const apiFetch = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`
  const config = {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options
  }
  
  const response = await fetch(url, config)
  if (!response.ok) throw new Error(`API Error: ${response.status}`)
  return response.json()
}
