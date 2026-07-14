import { AppShell } from '@/components/layout/AppShell'

export function TestTrackingPage() {
  return (
    <AppShell>
      <h1 className="text-xl font-semibold text-gray-900">Test Tracking</h1>
      <p className="mt-2 text-sm text-gray-500">
        Test attempt tracking and analytics are not part of this build — see the Dashboard for test status.
      </p>
    </AppShell>
  )
}
