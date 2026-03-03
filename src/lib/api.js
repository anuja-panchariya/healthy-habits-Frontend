// src/lib/api.js - FULL FEATURES + setAuthToken SUPPORT
let authToken = null

export const API_URL = 'https://healthy-habits-be-1.onrender.com/api'

// ✅ setAuthToken FUNCTION (Aapke saare pages ke liye!)
export const setAuthToken = (token) => {
  authToken = token
}

// ✅ apiFetch - Uses token if available
export const apiFetch = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`
  const config = {
    headers: { 
      'Content-Type': 'application/json',
      ...(authToken && { Authorization: `Bearer ${authToken}` }),
      ...options.headers 
    },
    ...options
  }
  
  const response = await fetch(url, config)
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`API ${response.status}: ${errorText}`)
  }
  return response.json()
}

// ✅ Backward compatibility - Aapke purane axios-style calls ke liye
export const api = {
  get: (url) => apiFetch(url),
  post: (url, data) => apiFetch(url, { method: 'POST', body: JSON.stringify(data) }),
  delete: (url) => apiFetch(url, { method: 'DELETE' })
}
