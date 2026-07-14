import { apiClient } from '@/api/client'
import type { ApiResponse, CreateTestPayload, Test, UpdateTestPayload } from '@/types'

export async function getTests() {
  const { data } = await apiClient.get<ApiResponse<Test[]>>('/tests')
  return data.data
}

export async function getTestById(id: string) {
  const { data } = await apiClient.get<ApiResponse<Test>>(`/tests/${id}`)
  return data.data
}

export async function createTest(payload: CreateTestPayload) {
  const { data } = await apiClient.post<ApiResponse<Test>>('/tests', payload)
  return data.data
}

export async function updateTest(id: string, payload: UpdateTestPayload) {
  const { data } = await apiClient.put<ApiResponse<Test>>(`/tests/${id}`, payload)
  return data.data
}

export async function deleteTest(id: string) {
  const { data } = await apiClient.delete<ApiResponse<unknown>>(`/tests/${id}`)
  return data.data
}
