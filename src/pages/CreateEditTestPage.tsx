import { useEffect, useMemo } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { z } from 'zod'
import { createTest, getTestById, updateTest } from '@/api/tests'
import { AppShell } from '@/components/layout/AppShell'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { MultiSelect } from '@/components/ui/MultiSelect'
import { NumberStepper } from '@/components/ui/NumberStepper'
import { RadioGroup } from '@/components/ui/RadioGroup'
import { Select } from '@/components/ui/Select'
import { Tabs } from '@/components/ui/Tabs'
import { useSubjects, useSubTopicsByTopics, useTopicsBySubject } from '@/hooks/useTaxonomy'
import type { TestType } from '@/types'

const testSchema = z.object({
  type: z.enum(['chapterwise', 'pyq', 'mocktest']),
  name: z.string().min(1, 'Test name is required'),
  subject: z.string().min(1, 'Subject is required'),
  topics: z.array(z.string()).min(1, 'Select at least one topic'),
  sub_topics: z.array(z.string()),
  total_time: z.number().min(1, 'Enter a valid duration'),
  difficulty: z.enum(['easy', 'medium', 'difficult']),
  wrong_marks: z.number(),
  unattempt_marks: z.number(),
  correct_marks: z.number(),
  total_questions: z.number().min(1, 'Enter number of questions'),
})

type TestFormValues = z.infer<typeof testSchema>

const testTypeTabs = [
  { value: 'chapterwise', label: 'Chapterwise' },
  { value: 'pyq', label: 'PYQ' },
  { value: 'mocktest', label: 'Mock Test' },
]

const difficultyOptions = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'difficult', label: 'Difficult' },
]

export function CreateEditTestPage() {
  const { id } = useParams<{ id: string }>()
  const isEditing = Boolean(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: existingTest, isLoading: isLoadingTest } = useQuery({
    queryKey: ['test', id],
    queryFn: () => getTestById(id as string),
    enabled: isEditing,
  })

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<TestFormValues>({
    resolver: zodResolver(testSchema),
    defaultValues: {
      type: 'chapterwise',
      name: '',
      subject: '',
      topics: [],
      sub_topics: [],
      total_time: 60,
      difficulty: 'easy',
      wrong_marks: -1,
      unattempt_marks: 0,
      correct_marks: 5,
      total_questions: 50,
    },
  })

  useEffect(() => {
    if (existingTest) {
      reset({
        type: existingTest.type ?? 'chapterwise',
        name: existingTest.name ?? '',
        subject: existingTest.subject ?? '',
        topics: existingTest.topics ?? [],
        sub_topics: existingTest.sub_topics ?? [],
        total_time: existingTest.total_time ?? 60,
        difficulty: existingTest.difficulty ?? 'easy',
        wrong_marks: existingTest.wrong_marks ?? -1,
        unattempt_marks: existingTest.unattempt_marks ?? 0,
        correct_marks: existingTest.correct_marks ?? 5,
        total_questions: existingTest.total_questions ?? 50,
      })
    }
  }, [existingTest, reset])

  const testType = watch('type')
  const subjectId = watch('subject')
  const selectedTopics = watch('topics')
  const correctMarks = watch('correct_marks')
  const totalQuestions = watch('total_questions')
  const totalMarks = useMemo(
    () => (Number(correctMarks) || 0) * (Number(totalQuestions) || 0),
    [correctMarks, totalQuestions],
  )

  const { data: subjects = [] } = useSubjects()
  const { data: topics = [] } = useTopicsBySubject(subjectId)
  const { data: subTopics = [] } = useSubTopicsByTopics(selectedTopics)

  const subjectOptions = subjects.map((s) => ({ value: s.id, label: s.name }))
  const topicOptions = topics.map((t) => ({ value: t.id, label: t.name }))
  const subTopicOptions = subTopics.map((st) => ({ value: st.id, label: st.name }))

  const saveMutation = useMutation({
    mutationFn: async (values: TestFormValues) => {
      const payload = {
        ...values,
        status: 'draft' as const,
        total_marks: values.correct_marks * values.total_questions,
      }
      if (isEditing && id) {
        return updateTest(id, payload)
      }
      return createTest(payload)
    },
    onSuccess: (test) => {
      queryClient.invalidateQueries({ queryKey: ['tests'] })
      navigate(`/tests/${test.id}/questions`)
    },
  })

  const onSubmit = (values: TestFormValues) => {
    saveMutation.mutate(values)
  }

  if (isEditing && isLoadingTest) {
    return (
      <AppShell>
        <p className="text-sm text-gray-400">Loading test…</p>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <nav className="text-sm text-gray-400">
        Test Creation <span className="mx-1">/</span>{' '}
        <span className="text-gray-600">{isEditing ? 'Edit Test' : 'Create Test'}</span>{' '}
        <span className="mx-1">/</span> <span className="text-gray-600 capitalize">{testType}</span>
      </nav>

      <div className="mt-4">
        <Controller
          control={control}
          name="type"
          render={({ field }) => (
            <Tabs options={testTypeTabs} value={field.value} onChange={(v) => field.onChange(v as TestType)} />
          )}
        />
      </div>

      <form
        onSubmit={handleSubmit((values) => onSubmit(values))}
        className="mt-6 grid max-w-4xl grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2"
        noValidate
      >
        <Controller
          control={control}
          name="subject"
          render={({ field }) => (
            <Select
              id="subject"
              label="Subject"
              options={subjectOptions}
              error={errors.subject?.message}
              value={field.value}
              onChange={(e) => {
                field.onChange(e.target.value)
                setValue('topics', [])
                setValue('sub_topics', [])
              }}
            />
          )}
        />

        <Input
          id="name"
          label="Name of Test"
          placeholder="Enter name of Test"
          error={errors.name?.message}
          {...register('name')}
        />

        <Controller
          control={control}
          name="topics"
          render={({ field }) => (
            <MultiSelect
              label="Topic"
              options={topicOptions}
              value={field.value}
              disabled={!subjectId}
              error={errors.topics?.message}
              onChange={(next) => {
                field.onChange(next)
                setValue('sub_topics', [])
              }}
            />
          )}
        />

        <Controller
          control={control}
          name="sub_topics"
          render={({ field }) => (
            <MultiSelect
              label="Sub Topic"
              options={subTopicOptions}
              value={field.value}
              disabled={selectedTopics.length === 0}
              onChange={field.onChange}
            />
          )}
        />

        <Input
          id="total_time"
          label="Duration (Minutes)"
          type="number"
          placeholder="Enter the time"
          error={errors.total_time?.message}
          {...register('total_time', { valueAsNumber: true })}
        />

        <Controller
          control={control}
          name="difficulty"
          render={({ field }) => (
            <RadioGroup
              label="Test Difficulty Level"
              name="difficulty"
              options={difficultyOptions}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />

        <div className="sm:col-span-2">
          <span className="text-sm font-medium text-gray-700">Marking Scheme:</span>
          <div className="mt-2 grid grid-cols-2 gap-4 sm:grid-cols-5">
            <Controller
              control={control}
              name="wrong_marks"
              render={({ field }) => (
                <NumberStepper label="Wrong Answer" value={field.value} onChange={field.onChange} />
              )}
            />
            <Controller
              control={control}
              name="unattempt_marks"
              render={({ field }) => (
                <NumberStepper label="Unattempted" value={field.value} onChange={field.onChange} />
              )}
            />
            <Controller
              control={control}
              name="correct_marks"
              render={({ field }) => (
                <NumberStepper label="Correct Answer" value={field.value} onChange={field.onChange} />
              )}
            />
            <Input
              id="total_questions"
              label="No of Questions"
              type="number"
              placeholder="Ex:250 Marks"
              error={errors.total_questions?.message}
              {...register('total_questions', { valueAsNumber: true })}
            />
            <Input id="total_marks" label="Total Marks" value={totalMarks} disabled placeholder="Ex:250 Marks" />
          </div>
        </div>

        <div className="sm:col-span-2 mt-4 flex items-center justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => navigate('/dashboard')}>
            Cancel
          </Button>
          <Button type="submit" isLoading={saveMutation.isPending}>
            {isEditing ? 'Save' : 'Next'}
          </Button>
        </div>
      </form>
    </AppShell>
  )
}
