import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import LoginPage from './components/auth/LoginPage'
import SignUpPage from './components/auth/SignUpPage'
import Dashboard from './pages/Dashboard'
import CoursePage from './pages/CoursePage'
import LessonPage from './pages/LessonPage'
import ProfilePage from './pages/ProfilePage'
import DebugPage from './pages/DebugPage'
import SimpleDebug from './pages/SimpleDebug'
import InstallPWAPrompt from './components/layout/InstallPWAPrompt'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/debug" element={<DebugPage />} />
          <Route path="/simple-debug" element={<SimpleDebug />} />
          <Route path="/course/:courseId" element={<CoursePage />} />
          <Route
            path="/lesson/:lessonId"
            element={
              <ProtectedRoute>
                <LessonPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        <InstallPWAPrompt />
      </Router>
    </AuthProvider>
  )
}

export default App
