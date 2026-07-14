import { useQuery } from '@tanstack/react-query'
import { getSubjects, getSubTopicsByTopic, getSubTopicsByTopics, getTopicsBySubject } from '@/api/taxonomy'

export function useSubjects() {
  return useQuery({ queryKey: ['subjects'], queryFn: getSubjects })
}

export function useTopicsBySubject(subjectId?: string) {
  return useQuery({
    queryKey: ['topics', subjectId],
    queryFn: () => getTopicsBySubject(subjectId as string),
    enabled: Boolean(subjectId),
  })
}

export function useSubTopicsByTopics(topicIds: string[]) {
  return useQuery({
    queryKey: ['sub-topics', ...topicIds],
    queryFn: () => getSubTopicsByTopics(topicIds),
    enabled: topicIds.length > 0,
  })
}

export function useSubTopicsByTopic(topicId?: string) {
  return useQuery({
    queryKey: ['sub-topics-single', topicId],
    queryFn: () => getSubTopicsByTopic(topicId as string),
    enabled: Boolean(topicId),
  })
}
