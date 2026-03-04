let authToken = null

export const API_URL = import.meta.env.VITE_API_URL || 'https://healthy-habits-be-1.onrender.com'

export const setAuthToken = (token) => {
  authToken = token
  if (token) {
    localStorage.setItem('authToken', token)
  } else {
    localStorage.removeItem('authToken')
  }
}

// 🔄 Get token from storage if not set
export const getAuthToken = () => {
  if (authToken) return authToken
  const stored = localStorage.getItem('authToken')
  if (stored) {
    authToken = stored
    return stored
  }
  return null
}

export const apiFetch = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`
  
  const config = {
    headers: { 
      'Content-Type': 'application/json',
    },
    ...options
  }
  
  // Add auth header
  const token = getAuthToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  
  try {
    console.log(`🌐 API ${options.method || 'GET'}: ${url}`)
    const response = await fetch(url, config)
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      console.error(`API Error ${response.status}: ${errorText}`)
      
      // Common errors - Graceful handling
      if (response.status === 401) {
        localStorage.removeItem('authToken')
        throw new Error('Session expired - Please login again')
      }
      if (response.status === 404) {
        return { data: [] } // Empty data for missing endpoints
      }
      throw new Error(`API ${response.status}: ${errorText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Network/API error:', error)
    return { data: [], error: error.message } // Safe fallback
  }
}

export const api = {
  get: (url) => apiFetch(url),
  post: (url, data) => apiFetch(url, { method: 'POST', body: JSON.stringify(data) }),
  put: (url, data) => apiFetch(url, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (url) => apiFetch(url, { method: 'DELETE' }),
  patch: (url, data) => apiFetch(url, { method: 'PATCH', body: JSON.stringify(data) })
}

// 🔄 Auto token restore on app start
if (typeof window !== 'undefined') {
  const storedToken = localStorage.getItem('authToken')
  if (storedToken) {
    setAuthToken(storedToken)
  }
}

export default api
