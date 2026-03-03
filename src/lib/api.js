export const API_URL = 'https://healthy-habits-be-1.onrender.com/api'

export const apiFetch = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`
  const config = {
    headers: { 
      'Content-Type': 'application/json', 
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
