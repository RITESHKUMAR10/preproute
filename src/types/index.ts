export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface User {
  id: string
  userId?: string
  name?: string
  role?: string
  [key: string]: unknown
}

export interface LoginPayload {
  userId: string
  password: string
}

export interface LoginResponseData {
  token: string
  user: User
}

export interface Subject {
  id: string
  name: string
}

export interface Topic {
  id: string
  name: string
  subject_id: string
}

export interface SubTopic {
  id: string
  name: string
  topic_id: string
}

export type Difficulty = 'easy' | 'medium' | 'difficult'

export type TestType = 'chapterwise' | 'pyq' | 'mocktest'

export type TestStatus = 'draft' | 'live' | 'unpublished' | 'scheduled' | 'expired'

export interface Test {
  id: string
  name: string
  type: TestType
  subject: string
  topics: string[]
  sub_topics?: string[]
  correct_marks: number
  wrong_marks: number
  unattempt_marks: number
  difficulty: Difficulty
  total_time: number
  total_marks: number
  total_questions: number
  questions?: string[]
  status: TestStatus
  created_at?: string
  live_until?: string | null
  scheduled_at?: string | null
}

export interface CreateTestPayload {
  name: string
  type: TestType
  subject: string
  topics: string[]
  sub_topics: string[]
  correct_marks: number
  wrong_marks: number
  unattempt_marks: number
  difficulty: Difficulty
  total_time: number
  total_marks: number
  total_questions: number
  status: TestStatus
}

export type UpdateTestPayload = Partial<CreateTestPayload> & {
  questions?: string[]
  live_until?: string | null
  scheduled_at?: string | null
}

export type CorrectOption = 'option1' | 'option2' | 'option3' | 'option4'

export interface Question {
  id: string
  type: 'mcq'
  question: string
  subject: string
  option1: string
  option2: string
  option3: string
  option4: string
  correct_option: CorrectOption
  explanation?: string
  difficulty?: Difficulty
  topic?: string
  sub_topic?: string
  media_url?: string
  test_id: string
}

export type CreateQuestionPayload = Omit<Question, 'id'>

export interface BulkCreateQuestionsPayload {
  questions: CreateQuestionPayload[]
}
