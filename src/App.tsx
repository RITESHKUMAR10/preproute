import { Navigate, Route, Routes } from 'react-router-dom'
import { AddQuestionsPage } from '@/pages/AddQuestionsPage'
import { CreateEditTestPage } from '@/pages/CreateEditTestPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { LoginPage } from '@/pages/LoginPage'
import { PreviewPublishPage } from '@/pages/PreviewPublishPage'
import { TestTrackingPage } from '@/pages/TestTrackingPage'
import { ProtectedRoute } from '@/routes/ProtectedRoute'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tests/new"
        element={
          <ProtectedRoute>
            <CreateEditTestPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tests/:id/edit"
        element={
          <ProtectedRoute>
            <CreateEditTestPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tests/:id/questions"
        element={
          <ProtectedRoute>
            <AddQuestionsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tests/:id/preview"
        element={
          <ProtectedRoute>
            <PreviewPublishPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tracking"
        element={
          <ProtectedRoute>
            <TestTrackingPage />
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
