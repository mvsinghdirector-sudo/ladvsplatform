import { apiClient } from './client'
import type { ApiResponse, LoginRequest, LoginResponse, RegisterRequest } from '../types'

export const applicantApi = {
  login: async (data: LoginRequest) => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      '/api/v1/applicants/login',
      data
    )
    return response.data
  },

  register: async (data: RegisterRequest) => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      '/api/v1/applicants/register',
      data
    )
    return response.data
  },
}
