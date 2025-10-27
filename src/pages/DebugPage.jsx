import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { useParams } from 'react-router-dom'

export default function DebugPage() {
  const { profile, user } = useAuth()
  const [debug, setDebug] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkEverything()
  }, [profile])

  const checkEverything = async () => {
    const debugInfo = {}

    // Check user
    debugInfo.user = user ? {
      id: user.id,
      email: user.email
    } : null

    // Check profile
    debugInfo.profile = profile ? {
      id: profile.id,
      username: profile.username,
      xp: profile.xp,
      level: profile.level
    } : null

    // Check courses
    try {
      const { data: courses, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .limit(5)

      debugInfo.courses = courses || []
      debugInfo.coursesError = coursesError?.message
    } catch (e) {
      debugInfo.coursesError = e.message
    }

    // Check enrollments
    if (profile) {
      try {
        const { data: enrollments, error: enrollError } = await supabase
          .from('course_enrollments')
          .select('*')
          .eq('user_id', profile.id)

        debugInfo.enrollments = enrollments || []
        debugInfo.enrollError = enrollError?.message
      } catch (e) {
        debugInfo.enrollError = e.message
      }
    }

    // Check lesson progress
    if (profile) {
      try {
        const { data: progress, error: progressError } = await supabase
          .from('lesson_progress')
          .select('*')
          .eq('user_id', profile.id)

        debugInfo.lessonProgress = progress || []
        debugInfo.progressError = progressError?.message
      } catch (e) {
        debugInfo.progressError = e.message
      }
    }

    setDebug(debugInfo)
    setLoading(false)
  }

  if (loading) {
    return <div className="p-8">Loading debug info...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🔍 Debug Information</h1>

        {/* User Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-4">
          <h2 className="text-xl font-bold mb-3">User Authentication</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(debug.user, null, 2)}
          </pre>
        </div>

        {/* Profile Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-4">
          <h2 className="text-xl font-bold mb-3">Profile</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(debug.profile, null, 2)}
          </pre>
        </div>

        {/* Courses */}
        <div className="bg-white rounded-lg shadow p-6 mb-4">
          <h2 className="text-xl font-bold mb-3">Courses (First 5)</h2>
          {debug.coursesError && (
            <div className="bg-red-100 text-red-700 p-3 rounded mb-3">
              Error: {debug.coursesError}
            </div>
          )}
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(debug.courses, null, 2)}
          </pre>
        </div>

        {/* Enrollments */}
        {profile && (
          <div className="bg-white rounded-lg shadow p-6 mb-4">
            <h2 className="text-xl font-bold mb-3">Your Enrollments</h2>
            {debug.enrollError && (
              <div className="bg-red-100 text-red-700 p-3 rounded mb-3">
                Error: {debug.enrollError}
              </div>
            )}
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(debug.enrollments, null, 2)}
            </pre>
          </div>
        )}

        {/* Lesson Progress */}
        {profile && (
          <div className="bg-white rounded-lg shadow p-6 mb-4">
            <h2 className="text-xl font-bold mb-3">Your Lesson Progress</h2>
            {debug.progressError && (
              <div className="bg-red-100 text-red-700 p-3 rounded mb-3">
                Error: {debug.progressError}
              </div>
            )}
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(debug.lessonProgress, null, 2)}
            </pre>
          </div>
        )}

        {/* Database Setup Status */}
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-3 text-yellow-800">⚠️ Database Setup</h2>
          {debug.courses?.length === 0 && !debug.coursesError && (
            <div className="text-yellow-700">
              <p className="font-bold mb-2">No courses found in database!</p>
              <p className="mb-3">You need to run the database migrations:</p>
              <ol className="list-decimal ml-6 space-y-2">
                <li>Go to your Supabase dashboard: <a href="https://supabase.com/dashboard/project/zjzessykqaohzajemqyk" className="text-blue-600 underline" target="_blank">Open Dashboard</a></li>
                <li>Click "SQL Editor" in the left sidebar</li>
                <li>Run <code className="bg-yellow-100 px-2 py-1">supabase/migrations/001_initial_schema.sql</code></li>
                <li>Run <code className="bg-yellow-100 px-2 py-1">supabase/migrations/002_seed_data.sql</code></li>
                <li>Refresh this page</li>
              </ol>
            </div>
          )}
          {debug.coursesError && (
            <div className="text-red-700">
              <p className="font-bold mb-2">Database Error!</p>
              <p className="mb-3">Error: {debug.coursesError}</p>
              <p>Make sure you've run the database migrations in Supabase.</p>
            </div>
          )}
          {debug.courses?.length > 0 && (
            <div className="text-green-700">
              <p className="font-bold">✅ Database is set up correctly!</p>
              <p>Found {debug.courses.length} courses.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
