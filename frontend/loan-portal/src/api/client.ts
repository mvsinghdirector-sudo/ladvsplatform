import axios from 'axios'

const API_BASE_URL = import.meta.env.DEV ? '/auth-api' : 'http://20.84.30.112'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Auto-attach JWT token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('ladvs_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ladvs_token')
      localStorage.removeItem('ladvs_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default apiClient