import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { bulkCreateQuestions, fetchQuestionsBulk } from '@/api/questions'
import { getTestById, updateTest } from '@/api/tests'
import { AppShell } from '@/components/layout/AppShell'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { useSubjects, useSubTopicsByTopic, useTopicsBySubject } from '@/hooks/useTaxonomy'
import type { CorrectOption, CreateQuestionPayload, Difficulty } from '@/types'

type QuestionDraft = CreateQuestionPayload & { localId: string }

function emptyQuestion(testId: string): QuestionDraft {
  return {
    localId: crypto.randomUUID(),
    type: 'mcq',
    question: '',
    subject: '',
    option1: '',
    option2: '',
    option3: '',
    option4: '',
    correct_option: 'option1',
    explanation: '',
    difficulty: undefined,
    topic: undefined,
    sub_topic: undefined,
    media_url: undefined,
    test_id: testId,
  }
}

function isQuestionFilled(q: QuestionDraft) {
  return Boolean(
    q.question.trim() && q.option1.trim() && q.option2.trim() && q.option3.trim() && q.option4.trim(),
  )
}

const difficultyOptions = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'difficult', label: 'Difficult' },
]

export function AddQuestionsPage() {
  const { id } = useParams<{ id: string }>()
  const testId = id as string
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: test, isLoading: isLoadingTest } = useQuery({
    queryKey: ['test', testId],
    queryFn: () => getTestById(testId),
  })

  const { data: existingQuestions } = useQuery({
    queryKey: ['questions', testId, test?.questions],
    queryFn: () => fetchQuestionsBulk(test?.questions ?? []),
    enabled: Boolean(test?.questions && test.questions.length > 0),
  })

  const [questions, setQuestions] = useState<QuestionDraft[]>([emptyQuestion(testId)])
  const [activeIndex, setActiveIndex] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (existingQuestions && existingQuestions.length > 0) {
      setQuestions(
        existingQuestions.map((q) => ({
          ...q,
          localId: q.id,
        })),
      )
    }
  }, [existingQuestions])

  const activeQuestion = questions[activeIndex]

  // GET /tests/:id resolves `subject` to its display name, but the topics
  // endpoint needs the subject's id — look it up from the subjects list.
  const { data: subjects = [] } = useSubjects()
  const subjectId = subjects.find((s) => s.name === test?.subject)?.id
  const { data: topics = [] } = useTopicsBySubject(subjectId)
  const { data: subTopics = [] } = useSubTopicsByTopic(activeQuestion?.topic)
  const topicOptions = topics.map((t) => ({ value: t.id, label: t.name }))
  const subTopicOptions = subTopics.map((st) => ({ value: st.id, label: st.name }))

  const updateActive = (patch: Partial<QuestionDraft>) => {
    setQuestions((prev) => prev.map((q, i) => (i === activeIndex ? { ...q, ...patch } : q)))
  }

  const addQuestion = () => {
    setQuestions((prev) => [...prev, emptyQuestion(testId)])
    setActiveIndex(questions.length)
  }

  const deleteActive = () => {
    if (questions.length === 1) {
      setQuestions([emptyQuestion(testId)])
      return
    }
    setQuestions((prev) => prev.filter((_, i) => i !== activeIndex))
    setActiveIndex((i) => Math.max(0, i - 1))
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      const filled = questions.filter(isQuestionFilled)
      if (filled.length === 0) {
        throw new Error('Add at least one complete question before continuing.')
      }
      const created = await bulkCreateQuestions({
        questions: filled.map(({ localId: _localId, ...rest }) => ({
          ...rest,
          subject: test?.subject ?? rest.subject,
        })),
      })
      await updateTest(testId, {
        questions: created.map((q) => q.id),
        total_questions: created.length,
      })
      return created
    },
    onSuccess: () => {
      setError(null)
      queryClient.invalidateQueries({ queryKey: ['test', testId] })
      queryClient.invalidateQueries({ queryKey: ['tests'] })
      navigate(`/tests/${testId}/preview`)
    },
    onError: (err: Error) => {
      setError(err.message || 'Something went wrong while saving questions.')
    },
  })

  if (isLoadingTest || !test) {
    return (
      <AppShell>
        <p className="text-sm text-gray-400">Loading test…</p>
      </AppShell>
    )
  }

  const filledCount = questions.filter(isQuestionFilled).length

  return (
    <AppShell>
      <div className="flex gap-6">
        <aside className="w-56 shrink-0">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-900">Question creation</p>
          </div>
          <p className="mt-1 text-xs text-gray-400">Total Questions: {questions.length}</p>

          <div className="mt-4 flex flex-col gap-2">
            {questions.map((q, i) => (
              <button
                key={q.localId}
                type="button"
                onClick={() => setActiveIndex(i)}
                className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left text-sm ${
                  i === activeIndex
                    ? 'border-brand-300 bg-brand-50 text-brand-700'
                    : 'border-gray-100 bg-white text-gray-500 hover:bg-gray-50'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span
                    className={`size-2 rounded-full ${
                      isQuestionFilled(q) ? 'bg-emerald-500' : 'bg-gray-300'
                    }`}
                  />
                  Question {i + 1}
                </span>
              </button>
            ))}
          </div>

          <Button variant="secondary" className="mt-3 w-full" type="button" onClick={addQuestion}>
            + Add Question
          </Button>
        </aside>

        <div className="flex-1">
          <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <Badge tone="brand">{test.type}</Badge>
                <span className="text-sm font-semibold text-gray-900">{test.name}</span>
                <Badge tone="green">{test.difficulty}</Badge>
              </div>
              <p className="mt-1 text-xs text-gray-400">
                {filledCount} / {questions.length} questions complete
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span>{test.total_time} Min</span>
              <span>{test.total_questions} Q's</span>
              <span>{test.total_marks} Marks</span>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-900">Question {activeIndex + 1}</p>
              <button type="button" onClick={deleteActive} className="text-xs font-medium text-red-500">
                Delete Question
              </button>
            </div>

            <div className="mt-3">
              <Textarea
                placeholder="Type here"
                value={activeQuestion.question}
                onChange={(e) => updateActive({ question: e.target.value })}
              />
            </div>

            <p className="mt-5 text-sm font-medium text-gray-700">Type the options below</p>
            <div className="mt-2 flex flex-col gap-3">
              {(['option1', 'option2', 'option3', 'option4'] as const).map((optKey, idx) => (
                <div key={optKey} className="flex items-center gap-3">
                  <button
                    type="button"
                    aria-label={`Mark option ${idx + 1} as correct`}
                    onClick={() => updateActive({ correct_option: optKey as CorrectOption })}
                    className={`flex size-4 shrink-0 items-center justify-center rounded-full border-2 ${
                      activeQuestion.correct_option === optKey ? 'border-brand-600' : 'border-gray-300'
                    }`}
                  >
                    {activeQuestion.correct_option === optKey && (
                      <span className="size-2 rounded-full bg-brand-600" />
                    )}
                  </button>
                  <input
                    value={activeQuestion[optKey]}
                    onChange={(e) => updateActive({ [optKey]: e.target.value } as Partial<QuestionDraft>)}
                    placeholder="Type Option here"
                    className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  />
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-gray-400">Select the bullet next to the correct option.</p>

            <div className="mt-5">
              <Textarea
                label="Add Solution"
                placeholder="Type here"
                value={activeQuestion.explanation}
                onChange={(e) => updateActive({ explanation: e.target.value })}
              />
            </div>

            <p className="mt-6 text-sm font-semibold text-gray-900">Question Settings</p>
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Select
                label="Level of Difficulty"
                options={difficultyOptions}
                value={activeQuestion.difficulty ?? ''}
                onChange={(e) => updateActive({ difficulty: e.target.value as Difficulty })}
              />
              <Select
                label="Topic"
                options={topicOptions}
                value={activeQuestion.topic ?? ''}
                onChange={(e) => updateActive({ topic: e.target.value, sub_topic: undefined })}
              />
              <Select
                label="Sub-topic"
                options={subTopicOptions}
                value={activeQuestion.sub_topic ?? ''}
                disabled={!activeQuestion.topic}
                onChange={(e) => updateActive({ sub_topic: e.target.value })}
              />
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div className="flex gap-2 text-sm text-gray-400">
                <button
                  type="button"
                  disabled={activeIndex === 0}
                  onClick={() => setActiveIndex((i) => Math.max(0, i - 1))}
                  className="rounded-md border border-gray-200 px-3 py-1.5 disabled:opacity-40"
                >
                  ←
                </button>
                <button
                  type="button"
                  disabled={activeIndex === questions.length - 1}
                  onClick={() => setActiveIndex((i) => Math.min(questions.length - 1, i + 1))}
                  className="rounded-md border border-gray-200 px-3 py-1.5 disabled:opacity-40"
                >
                  →
                </button>
              </div>
            </div>
          </div>

          {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

          <div className="mt-5 flex items-center justify-between">
            <Button variant="danger" type="button" onClick={() => navigate('/dashboard')}>
              Exit Test Creation
            </Button>
            <Button type="button" isLoading={saveMutation.isPending} onClick={() => saveMutation.mutate()}>
              Next
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
