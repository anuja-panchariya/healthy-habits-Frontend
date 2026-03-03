// src/lib/api.js - FIXED NO DOUBLE /api/api/
let authToken = null

export const API_URL = 'https://healthy-habits-be-1.onrender.com'  // ✅ FIXED: No /api here!

export const setAuthToken = (token) => {
  authToken = token
}

export const apiFetch = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`  // ✅ /habits → /api/habits (backend handles)
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

export const api = {
  get: (url) => apiFetch(url),
  post: (url, data) => apiFetch(url, { method: 'POST', body: JSON.stringify(data) }),
  delete: (url) => apiFetch(url, { method: 'DELETE' })
}
