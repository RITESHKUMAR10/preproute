import { apiClient } from '@/api/client'
import type { ApiResponse, Subject, SubTopic, Topic } from '@/types'

export async function getSubjects() {
  const { data } = await apiClient.get<ApiResponse<Subject[]>>('/subjects')
  return data.data
}

export async function getTopicsBySubject(subjectId: string) {
  const { data } = await apiClient.get<ApiResponse<Topic[]>>(`/topics/subject/${subjectId}`)
  return data.data
}

export async function getSubTopicsByTopic(topicId: string) {
  const { data } = await apiClient.get<ApiResponse<SubTopic[]>>(`/sub-topics/topic/${topicId}`)
  return data.data
}

export async function getSubTopicsByTopics(topicIds: string[]) {
  const { data } = await apiClient.post<ApiResponse<SubTopic[]>>('/sub-topics/multi-topics', {
    topicIds,
  })
  return data.data
}
