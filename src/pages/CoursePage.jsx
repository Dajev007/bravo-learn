import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { ArrowLeft, Lock, CheckCircle2, Circle, Play } from 'lucide-react'

export default function CoursePage() {
  const { courseId } = useParams()
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [units, setUnits] = useState([])
  const [lessons, setLessons] = useState({})
  const [progress, setProgress] = useState({})
  const [enrolled, setEnrolled] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCourseData()
  }, [courseId, profile])

  const fetchCourseData = async () => {
    try {
      // Fetch course
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single()

      if (courseError) throw courseError
      setCourse(courseData)

      // Fetch units
      const { data: unitsData, error: unitsError } = await supabase
        .from('units')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index')

      if (unitsError) throw unitsError
      setUnits(unitsData || [])

      // Fetch lessons for each unit
      const lessonsMap = {}
      for (const unit of unitsData || []) {
        const { data: lessonsData, error: lessonsError } = await supabase
          .from('lessons')
          .select('*')
          .eq('unit_id', unit.id)
          .order('order_index')

        if (lessonsError) throw lessonsError
        lessonsMap[unit.id] = lessonsData || []
      }
      setLessons(lessonsMap)

      // Fetch user progress if logged in
      if (profile) {
        const { data: enrollmentData } = await supabase
          .from('course_enrollments')
          .select('*')
          .eq('user_id', profile.id)
          .eq('course_id', courseId)
          .single()

        setEnrolled(!!enrollmentData)

        const { data: progressData } = await supabase
          .from('lesson_progress')
          .select('*')
          .eq('user_id', profile.id)

        const progressMap = {}
        progressData?.forEach(p => {
          progressMap[p.lesson_id] = p
        })
        setProgress(progressMap)
      }
    } catch (error) {
      console.error('Error fetching course data:', error)
    } finally {
      setLoading(false)
    }
  }

  const enrollInCourse = async () => {
    if (!profile) {
      navigate('/login')
      return
    }

    try {
      const { error } = await supabase
        .from('course_enrollments')
        .insert({
          user_id: profile.id,
          course_id: courseId,
        })

      if (error) throw error
      setEnrolled(true)
    } catch (error) {
      console.error('Error enrolling:', error)
    }
  }

  const getLessonStatus = (lesson, index, unitLessons) => {
    if (!profile) return 'locked'

    const lessonProgress = progress[lesson.id]
    if (lessonProgress?.status === 'completed') return 'completed'
    if (lessonProgress?.status === 'in_progress') return 'in_progress'

    // First lesson is always unlocked if enrolled
    if (index === 0 && enrolled) return 'unlocked'

    // Check if previous lesson is completed
    if (index > 0) {
      const prevLesson = unitLessons[index - 1]
      const prevProgress = progress[prevLesson.id]
      if (prevProgress?.status === 'completed') return 'unlocked'
    }

    return 'locked'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!course) {
    return <div className="min-h-screen flex items-center justify-center">Course not found</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link to="/dashboard" className="inline-flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Link>
        </div>
      </header>

      {/* Course Header */}
      <div
        className="py-12"
        style={{ background: `linear-gradient(135deg, ${course.color}20 0%, ${course.color}40 100%)` }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-start space-x-6">
            <div
              className="w-24 h-24 rounded-2xl flex items-center justify-center text-5xl"
              style={{ backgroundColor: `${course.color}40` }}
            >
              {course.language === 'python' && '🐍'}
              {course.language === 'javascript' && '⚡'}
            </div>
            <div className="flex-grow">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{course.title}</h1>
              <p className="text-xl text-gray-700 mb-4">{course.description}</p>
              <span
                className="px-4 py-2 rounded-full text-sm font-semibold"
                style={{
                  backgroundColor: `${course.color}30`,
                  color: course.color
                }}
              >
                {course.difficulty}
              </span>
            </div>
          </div>

          {!enrolled && profile && (
            <button
              onClick={enrollInCourse}
              className="btn-primary mt-6"
            >
              Enroll in Course
            </button>
          )}

          {!profile && (
            <Link to="/login" className="btn-primary mt-6 inline-block">
              Sign in to Start Learning
            </Link>
          )}
        </div>
      </div>

      {/* Units and Lessons */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {units.map((unit, unitIndex) => (
            <div key={unit.id} className="card">
              <div className="mb-6">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-2xl font-bold text-gray-400">Unit {unitIndex + 1}</span>
                  <h2 className="text-2xl font-bold text-gray-900">{unit.title}</h2>
                </div>
                {unit.description && (
                  <p className="text-gray-600">{unit.description}</p>
                )}
              </div>

              <div className="space-y-3">
                {(lessons[unit.id] || []).map((lesson, lessonIndex) => {
                  const status = getLessonStatus(lesson, lessonIndex, lessons[unit.id])
                  const isLocked = status === 'locked'
                  const isCompleted = status === 'completed'

                  return (
                    <div
                      key={lesson.id}
                      className={`lesson-card ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => !isLocked && navigate(`/lesson/${lesson.id}`)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            isCompleted ? 'bg-green-100' : isLocked ? 'bg-gray-100' : 'bg-primary-100'
                          }`}>
                            {isLocked && <Lock className="w-6 h-6 text-gray-400" />}
                            {isCompleted && <CheckCircle2 className="w-6 h-6 text-green-600" />}
                            {!isLocked && !isCompleted && <Play className="w-6 h-6 text-primary-600" />}
                          </div>

                          <div>
                            <h3 className="font-bold text-gray-900">{lesson.title}</h3>
                            <p className="text-sm text-gray-600">{lesson.description}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          <span className="text-sm font-semibold text-gray-600">
                            +{lesson.xp_reward} XP
                          </span>
                          {isCompleted && (
                            <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                              Completed
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
