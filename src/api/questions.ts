import { apiClient } from '@/api/client'
import type { ApiResponse, BulkCreateQuestionsPayload, Question } from '@/types'

export async function bulkCreateQuestions(payload: BulkCreateQuestionsPayload) {
  const { data } = await apiClient.post<ApiResponse<Question[]>>('/questions/bulk', payload)
  return data.data
}

export async function fetchQuestionsBulk(questionIds: string[]) {
  const { data } = await apiClient.post<ApiResponse<Question[]>>('/questions/fetchBulk', {
    question_ids: questionIds,
  })
  return data.data
}
