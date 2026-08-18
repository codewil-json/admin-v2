import axios from 'axios'

const api = axios.create({
  baseURL: process.env.VUE_APP_API_URL || 'https://api.codewil.site/',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use((config) => {
  try {
    const stored = localStorage.getItem('user')
    const parsed = stored ? JSON.parse(stored) : null

    if (parsed && parsed.token) {
      config.headers.Authorization = `Bearer ${parsed.token}`
    }
  } catch (error) {
    console.error('Failed to read auth data', error)
  }

  return config
})

export default api
