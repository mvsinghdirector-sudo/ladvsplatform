import axios from 'axios'
import type { ApiResponse, DocumentUploadResponse } from '../types'

const docClient = axios.create({
  baseURL: import.meta.env.DEV ? '/app-api' : 'http://20.242.154.139',
})

docClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('ladvs_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

docClient.interceptors.response.use(
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

export const documentApi = {
  upload: async (
    applicationId: string,
    applicantId: string,
    documentType: string,
    file: File
  ) => {
    const formData = new FormData()
    formData.append('applicationId', applicationId)
    formData.append('applicantId', applicantId)
    formData.append('documentType', documentType)
    formData.append('file', file)

    const response = await docClient.post<ApiResponse<DocumentUploadResponse>>(
      '/api/v1/Documents/upload',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )
    return response.data
  },

  getByApplicationId: async (applicationId: string) => {
    const response = await docClient.get<ApiResponse<DocumentUploadResponse[]>>(
      `/api/v1/Documents/${applicationId}`
    )
    return response.data
  }
}