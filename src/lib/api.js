import axios from 'axios'

const API_URL = process.env.REACT_APP_BACKEND_URL

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
})

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common['Authorization']
  }
}

export default api
