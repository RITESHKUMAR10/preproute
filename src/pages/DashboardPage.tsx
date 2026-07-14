import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { deleteTest, getTests } from '@/api/tests'
import { AppShell } from '@/components/layout/AppShell'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import type { Test, TestStatus } from '@/types'

const statusTone: Record<string, 'green' | 'gray' | 'amber' | 'red'> = {
  live: 'green',
  draft: 'gray',
  scheduled: 'amber',
  unpublished: 'gray',
  expired: 'red',
}

function formatDate(value?: string) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })
}

export function DashboardPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const { data: tests = [], isLoading, isError } = useQuery({
    queryKey: ['tests'],
    queryFn: getTests,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteTest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tests'] })
    },
  })

  const filteredTests = useMemo(() => {
    return tests.filter((test) => {
      const matchesSearch =
        !search ||
        test.name?.toLowerCase().includes(search.toLowerCase()) ||
        test.subject?.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = !statusFilter || (test.status ?? 'draft') === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [tests, search, statusFilter])

  const handleDelete = (test: Test) => {
    if (window.confirm(`Delete "${test.name}"? This cannot be undone.`)) {
      deleteMutation.mutate(test.id)
    }
  }

  const editPath = (test: Test) => `/tests/${test.id}/edit`
  const previewPath = (test: Test) => `/tests/${test.id}/preview`

  return (
    <AppShell>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">All tests created on the platform</p>
        </div>
        <Button onClick={() => navigate('/tests/new')}>+ Create New Test</Button>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="w-full max-w-xs">
          <Input
            placeholder="Search by test name or subject"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full max-w-[180px]">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            placeholder="All statuses"
            options={[
              { value: 'draft', label: 'Draft' },
              { value: 'live', label: 'Live' },
              { value: 'scheduled', label: 'Scheduled' },
              { value: 'unpublished', label: 'Unpublished' },
              { value: 'expired', label: 'Expired' },
            ]}
          />
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-100 bg-gray-50 text-xs font-medium uppercase text-gray-400">
            <tr>
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Subject</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Created</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-gray-400">
                  Loading tests…
                </td>
              </tr>
            )}
            {isError && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-red-500">
                  Failed to load tests. Please try again.
                </td>
              </tr>
            )}
            {!isLoading && !isError && filteredTests.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-gray-400">
                  No tests found. Create your first test to get started.
                </td>
              </tr>
            )}
            {filteredTests.map((test) => {
              const status: TestStatus = test.status ?? 'draft'
              return (
                <tr key={test.id} className="hover:bg-gray-50/60">
                  <td className="px-5 py-4 font-medium text-gray-900">{test.name}</td>
                  <td className="px-5 py-4 text-gray-500">{test.subject}</td>
                  <td className="px-5 py-4">
                    <Badge tone={statusTone[status ?? 'draft'] ?? 'gray'}>{status ?? 'draft'}</Badge>
                  </td>
                  <td className="px-5 py-4 text-gray-500">{formatDate(test.created_at)}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-3 text-sm">
                      <Link to={previewPath(test)} className="text-brand-600 hover:underline">
                        View
                      </Link>
                      <Link to={editPath(test)} className="text-brand-600 hover:underline">
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(test)}
                        className="text-red-500 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </AppShell>
  )
}
