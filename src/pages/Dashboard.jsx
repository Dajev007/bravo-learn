import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { BookOpen, Trophy, Flame, Star, ChevronRight } from 'lucide-react'

export default function Dashboard() {
  const { profile } = useAuth()
  const [courses, setCourses] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [profile])

  const fetchData = async () => {
    try {
      // Fetch all published courses
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .eq('is_published', true)
        .order('order_index')

      if (coursesError) throw coursesError
      setCourses(coursesData || [])

      // Fetch user enrollments if logged in
      if (profile) {
        const { data: enrollmentsData, error: enrollmentsError } = await supabase
          .from('course_enrollments')
          .select('*')
          .eq('user_id', profile.id)

        if (enrollmentsError) throw enrollmentsError
        setEnrollments(enrollmentsData || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const isEnrolled = (courseId) => {
    return enrollments.some(e => e.course_id === courseId)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BookOpen className="w-8 h-8 text-primary-600" />
              <h1 className="text-2xl font-bold text-gray-900">BravoLearn</h1>
            </div>
            {profile && (
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Flame className="w-5 h-5 text-orange-500" />
                  <span className="font-bold text-gray-900">{profile.streak_count}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className="font-bold text-gray-900">{profile.xp} XP</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Trophy className="w-5 h-5 text-primary-600" />
                  <span className="font-bold text-gray-900">Lvl {profile.level}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {profile ? `Welcome back, ${profile.display_name}!` : 'Welcome to BravoLearn!'}
          </h2>
          <p className="text-gray-600">
            {profile
              ? 'Continue your coding journey where you left off'
              : 'Start learning programming languages in a fun, interactive way'
            }
          </p>
        </div>

        {/* Courses Grid */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Available Courses</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Link
                key={course.id}
                to={`/course/${course.id}`}
                className="card group hover:scale-105 transition-transform"
              >
                <div
                  className="w-16 h-16 rounded-xl mb-4 flex items-center justify-center text-3xl"
                  style={{ backgroundColor: `${course.color}20` }}
                >
                  {course.language === 'python' && '🐍'}
                  {course.language === 'javascript' && '⚡'}
                  {course.language === 'java' && '☕'}
                  {course.language === 'ruby' && '💎'}
                </div>

                <h4 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h4>
                <p className="text-gray-600 mb-4 flex-grow">{course.description}</p>

                <div className="flex items-center justify-between">
                  <span
                    className="px-3 py-1 rounded-full text-sm font-semibold"
                    style={{
                      backgroundColor: `${course.color}20`,
                      color: course.color
                    }}
                  >
                    {course.difficulty}
                  </span>

                  <div className="flex items-center text-primary-600 group-hover:translate-x-1 transition-transform">
                    {isEnrolled(course.id) ? 'Continue' : 'Start'}
                    <ChevronRight className="w-5 h-5 ml-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* CTA for non-logged in users */}
        {!profile && (
          <div className="mt-12 bg-gradient-to-r from-primary-500 to-secondary-600 rounded-2xl p-8 text-center text-white">
            <h3 className="text-2xl font-bold mb-2">Ready to start learning?</h3>
            <p className="mb-6">Sign up now to track your progress and earn rewards!</p>
            <Link to="/signup" className="inline-block bg-white text-primary-600 font-bold py-3 px-8 rounded-xl hover:shadow-lg transition-shadow">
              Get Started Free
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
