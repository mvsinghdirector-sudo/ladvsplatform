import axios from 'axios'
import type { ApiResponse, ApplicationResponse, CreateApplicationRequest } from '../types'

const appClient = axios.create({
  baseURL: import.meta.env.DEV ? '/app-api' : 'http://20.242.154.139',
  headers: { 'Content-Type': 'application/json' }
})

appClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('ladvs_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

appClient.interceptors.response.use(
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

export const applicationApi = {
  create: async (data: CreateApplicationRequest) => {
    const response = await appClient.post<ApiResponse<ApplicationResponse>>(
      '/api/v1/Applications',
      data
    )
    return response.data
  },

  getById: async (id: number) => {
    const response = await appClient.get<ApiResponse<ApplicationResponse>>(
      `/api/v1/Applications/${id}`
    )
    return response.data
  },

  getAll: async () => {
    const response = await appClient.get<ApiResponse<ApplicationResponse[]>>(
      '/api/v1/Applications'
    )
    return response.data
  }
}