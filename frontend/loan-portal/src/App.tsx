import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './lib/AuthContext'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import ApplyPage from './pages/application/ApplyPage'
import ApplicationDetailPage from './pages/application/ApplicationDetailPage'
import ApplicationsPage from './pages/application/ApplicationsPage'
import DocumentsPage from './pages/DocumentsPage'
import ProfilePage from './pages/ProfilePage'
import NotificationsPage from './pages/NotificationsPage'
import HelpPage from './pages/HelpPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
})

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected */}
      <Route path="/dashboard" element={
        <ProtectedRoute><DashboardPage /></ProtectedRoute>
      } />

      {/* Placeholder routes — pages to be built */}
      <Route path="/applications"      element={<ProtectedRoute><ApplicationsPage /></ProtectedRoute>} />
      <Route path="/applications/:id"  element={<ProtectedRoute><ApplicationDetailPage /></ProtectedRoute>} />
      <Route path="/apply"             element={<ProtectedRoute><ApplyPage /></ProtectedRoute>} />
      <Route path="/documents"        element={<ProtectedRoute><DocumentsPage /></ProtectedRoute>} />
      <Route path="/profile"          element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/notifications"    element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
      <Route path="/help"             element={<ProtectedRoute><HelpPage /></ProtectedRoute>} />

      {/* Default */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
          <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
