import { apiClient } from '@/api/client'
import type { ApiResponse, LoginPayload, LoginResponseData } from '@/types'

export async function login(payload: LoginPayload) {
  const { data } = await apiClient.post<ApiResponse<LoginResponseData>>('/auth/login', payload)
  return data.data
}
