import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { useParams, useNavigate } from 'react-router-dom'

export default function SimpleDebug() {
  const { profile, user } = useAuth()
  const [info, setInfo] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    checkEnrollment()
  }, [profile])

  const checkEnrollment = async () => {
    if (!profile) {
      setInfo({ error: 'Not logged in' })
      return
    }

    const courseId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' // Python Fundamentals

    try {
      // Check enrollment
      const { data: enrollment, error: enrollError } = await supabase
        .from('course_enrollments')
        .select('*')
        .eq('user_id', profile.id)
        .eq('course_id', courseId)
        .single()

      // Check lessons
      const { data: lessons, error: lessonsError } = await supabase
        .from('lessons')
        .select('*, units(*)')
        .limit(5)

      // Check progress
      const { data: progress, error: progressError } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('user_id', profile.id)

      setInfo({
        userId: profile.id,
        enrolled: !!enrollment,
        enrollment: enrollment,
        enrollError: enrollError?.message,
        lessons: lessons,
        lessonsError: lessonsError?.message,
        progress: progress,
        progressError: progressError?.message
      })
    } catch (e) {
      setInfo({ error: e.message })
    }
  }

  const forceEnroll = async () => {
    const courseId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'

    try {
      const { data, error } = await supabase
        .from('course_enrollments')
        .insert({
          user_id: profile.id,
          course_id: courseId,
        })
        .select()

      alert('Enrolled! Refresh the page.')
      checkEnrollment()
    } catch (e) {
      alert('Error: ' + e.message)
    }
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">🔍 Debug - Not Logged In</h1>
          <button onClick={() => navigate('/login')} className="btn-primary">
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  if (!info) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-4">
        <h1 className="text-3xl font-bold mb-6">🔍 Simple Debug</h1>

        {/* Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-3">Status</h2>
          <div className="space-y-2">
            <p><strong>User ID:</strong> {info.userId}</p>
            <p><strong>Enrolled:</strong> {info.enrolled ? '✅ YES' : '❌ NO'}</p>
            {info.enrollError && (
              <p className="text-red-600"><strong>Enroll Error:</strong> {info.enrollError}</p>
            )}
          </div>
        </div>

        {/* Enrollment Details */}
        {info.enrollment && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-3">Enrollment Details</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(info.enrollment, null, 2)}
            </pre>
          </div>
        )}

        {/* Lessons */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-3">First 5 Lessons</h2>
          {info.lessonsError && (
            <p className="text-red-600 mb-3">Error: {info.lessonsError}</p>
          )}
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm max-h-96">
            {JSON.stringify(info.lessons, null, 2)}
          </pre>
        </div>

        {/* Progress */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-3">Your Progress</h2>
          {info.progressError && (
            <p className="text-red-600 mb-3">Error: {info.progressError}</p>
          )}
          {info.progress?.length === 0 ? (
            <p className="text-gray-600">No progress yet - start a lesson!</p>
          ) : (
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(info.progress, null, 2)}
            </pre>
          )}
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-3">Actions</h2>
          <div className="space-x-3">
            {!info.enrolled && (
              <button onClick={forceEnroll} className="btn-primary">
                Force Enroll in Python Course
              </button>
            )}
            <button onClick={() => navigate('/course/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')} className="btn-secondary">
              Go to Python Course
            </button>
            <button onClick={checkEnrollment} className="btn-outline">
              Refresh Data
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
