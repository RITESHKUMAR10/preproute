import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { fetchQuestionsBulk } from '@/api/questions'
import { getTestById, updateTest } from '@/api/tests'
import { AppShell } from '@/components/layout/AppShell'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { RadioGroup } from '@/components/ui/RadioGroup'
import { Tabs } from '@/components/ui/Tabs'

type LiveUntilOption = 'always' | '1w' | '2w' | '3w' | '1m' | 'custom'

const liveUntilOptions: { value: LiveUntilOption; label: string }[] = [
  { value: 'always', label: 'Always Available' },
  { value: '1w', label: '1 Week' },
  { value: '2w', label: '2 Weeks' },
  { value: '3w', label: '3 Weeks' },
  { value: '1m', label: '1 Month' },
  { value: 'custom', label: 'Custom Duration' },
]

const durationDays: Partial<Record<LiveUntilOption, number>> = {
  '1w': 7,
  '2w': 14,
  '3w': 21,
  '1m': 30,
}

const optionLabel = (opt: 'option1' | 'option2' | 'option3' | 'option4') =>
  ({ option1: 'A', option2: 'B', option3: 'C', option4: 'D' })[opt]

export function PreviewPublishPage() {
  const { id } = useParams<{ id: string }>()
  const testId = id as string
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: test, isLoading: isLoadingTest } = useQuery({
    queryKey: ['test', testId],
    queryFn: () => getTestById(testId),
  })

  const { data: questions = [], isLoading: isLoadingQuestions } = useQuery({
    queryKey: ['questions', testId, test?.questions],
    queryFn: () => fetchQuestionsBulk(test?.questions ?? []),
    enabled: Boolean(test?.questions && test.questions.length > 0),
  })

  const [publishMode, setPublishMode] = useState<'now' | 'schedule'>('now')
  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduleTime, setScheduleTime] = useState('')
  const [liveUntil, setLiveUntil] = useState<LiveUntilOption>('always')
  const [endDate, setEndDate] = useState('')
  const [endTime, setEndTime] = useState('')
  const [published, setPublished] = useState(false)

  const computedLiveUntil = useMemo(() => {
    if (liveUntil === 'always') return null
    if (liveUntil === 'custom') {
      if (!endDate) return null
      return new Date(`${endDate}T${endTime || '23:59'}`).toISOString()
    }
    const days = durationDays[liveUntil] ?? 0
    const base = new Date()
    base.setDate(base.getDate() + days)
    return base.toISOString()
  }, [liveUntil, endDate, endTime])

  const publishMutation = useMutation({
    mutationFn: () =>
      updateTest(testId, {
        status: publishMode === 'schedule' && scheduleDate ? 'scheduled' : 'live',
        live_until: computedLiveUntil,
        scheduled_at:
          publishMode === 'schedule' && scheduleDate
            ? new Date(`${scheduleDate}T${scheduleTime || '00:00'}`).toISOString()
            : null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tests'] })
      queryClient.invalidateQueries({ queryKey: ['test', testId] })
      setPublished(true)
      setTimeout(() => navigate('/dashboard'), 1500)
    },
  })

  if (isLoadingTest || !test) {
    return (
      <AppShell>
        <p className="text-sm text-gray-400">Loading test…</p>
      </AppShell>
    )
  }

  const allQuestionsDone = questions.length > 0 && questions.length >= test.total_questions

  return (
    <AppShell>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">Test Creation</p>
          <h1 className="mt-1 text-xl font-semibold text-gray-900">Test created</h1>
        </div>
        <Badge tone={allQuestionsDone ? 'green' : 'amber'}>
          {questions.length} / {test.total_questions} Questions done
        </Badge>
      </div>

      {published && (
        <div className="mt-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          Test published successfully! Redirecting to dashboard…
        </div>
      )}

      <Card className="mt-4 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge tone="brand">{test.type}</Badge>
            <span className="text-sm font-semibold text-gray-900">{test.name}</span>
            <Badge tone="green">{test.difficulty}</Badge>
          </div>
          <Link to={`/tests/${testId}/edit`} className="text-sm text-brand-600 hover:underline">
            Edit test
          </Link>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-8 gap-y-2 text-sm text-gray-500">
          <span>Subject: {test.subject}</span>
          <span className="flex items-center gap-1">
            Topic:{' '}
            {test.topics?.map((t) => (
              <Badge key={t} tone="amber">
                {t}
              </Badge>
            ))}
          </span>
        </div>
        <div className="mt-3 flex items-center gap-6 text-sm text-gray-500">
          <span>{test.total_time} Min</span>
          <span>{test.total_questions} Q's</span>
          <span>{test.total_marks} Marks</span>
        </div>
      </Card>

      <Card className="mt-4 p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-900">Questions</p>
          <Link to={`/tests/${testId}/questions`} className="text-sm text-brand-600 hover:underline">
            Edit questions
          </Link>
        </div>
        {isLoadingQuestions && <p className="mt-3 text-sm text-gray-400">Loading questions…</p>}
        <div className="mt-3 flex flex-col gap-4">
          {questions.map((q, i) => (
            <div key={q.id} className="rounded-lg border border-gray-100 p-4">
              <p className="text-sm font-medium text-gray-900">
                {i + 1}. {q.question}
              </p>
              <div className="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                {(['option1', 'option2', 'option3', 'option4'] as const).map((opt) => (
                  <span
                    key={opt}
                    className={`rounded-md px-2.5 py-1.5 text-xs ${
                      q.correct_option === opt
                        ? 'bg-emerald-50 font-medium text-emerald-700'
                        : 'bg-gray-50 text-gray-500'
                    }`}
                  >
                    {optionLabel(opt)}. {q[opt]}
                  </span>
                ))}
              </div>
            </div>
          ))}
          {!isLoadingQuestions && questions.length === 0 && (
            <p className="text-sm text-gray-400">No questions added yet.</p>
          )}
        </div>
      </Card>

      <Card className="mt-4 p-5">
        <Tabs
          options={[
            { value: 'now', label: 'Publish Now' },
            { value: 'schedule', label: 'Schedule Publish' },
          ]}
          value={publishMode}
          onChange={(v) => setPublishMode(v as 'now' | 'schedule')}
        />

        {publishMode === 'schedule' && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700">Select Date and Time</p>
            <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input type="date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} />
              <Input type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} />
            </div>
          </div>
        )}

        <div className="mt-6">
          <p className="text-sm font-medium text-gray-700">Live Until</p>
          <p className="text-xs text-gray-400">Choose how long this test should remain available on the platform.</p>
          <div className="mt-3">
            <RadioGroup
              name="liveUntil"
              options={liveUntilOptions}
              value={liveUntil}
              onChange={(v) => setLiveUntil(v as LiveUntilOption)}
            />
          </div>
          {liveUntil === 'custom' && (
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
          )}
        </div>

        {publishMutation.isError && (
          <p className="mt-4 text-sm text-red-500">Failed to publish test. Please try again.</p>
        )}

        <div className="mt-6 flex items-center justify-end gap-3">
          <Button variant="secondary" type="button" onClick={() => navigate('/dashboard')}>
            Cancel
          </Button>
          <Button
            type="button"
            isLoading={publishMutation.isPending}
            disabled={questions.length === 0}
            onClick={() => publishMutation.mutate()}
          >
            Confirm
          </Button>
        </div>
      </Card>
    </AppShell>
  )
}
