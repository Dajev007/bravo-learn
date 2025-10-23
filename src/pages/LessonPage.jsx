import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { ArrowLeft, ArrowRight, CheckCircle2, XCircle, Lightbulb } from 'lucide-react'
import ExerciseCard from '../components/lesson/ExerciseCard'

export default function LessonPage() {
  const { lessonId } = useParams()
  const { profile, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [lesson, setLesson] = useState(null)
  const [exercises, setExercises] = useState([])
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState({})
  const [feedback, setFeedback] = useState({})
  const [showExplanation, setShowExplanation] = useState(false)
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState(false)

  useEffect(() => {
    fetchLessonData()
  }, [lessonId])

  const fetchLessonData = async () => {
    try {
      // Fetch lesson
      const { data: lessonData, error: lessonError } = await supabase
        .from('lessons')
        .select('*, units(*, courses(*))')
        .eq('id', lessonId)
        .single()

      if (lessonError) throw lessonError
      setLesson(lessonData)

      // Fetch exercises
      const { data: exercisesData, error: exercisesError } = await supabase
        .from('exercises')
        .select('*')
        .eq('lesson_id', lessonId)
        .order('order_index')

      if (exercisesError) throw exercisesError
      setExercises(exercisesData || [])
    } catch (error) {
      console.error('Error fetching lesson data:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkAnswer = (exerciseId, userAnswer) => {
    const exercise = exercises.find(e => e.id === exerciseId)
    if (!exercise) return false

    const correctAnswer = exercise.correct_answer
    let isCorrect = false

    // Handle different answer types
    if (typeof correctAnswer === 'string') {
      isCorrect = userAnswer?.toString().trim() === correctAnswer.trim()
    } else if (Array.isArray(correctAnswer)) {
      isCorrect = JSON.stringify(userAnswer) === JSON.stringify(correctAnswer)
    } else if (typeof correctAnswer === 'object') {
      // For fill-in-the-blank with multiple answers
      isCorrect = Object.keys(correctAnswer).every(
        key => userAnswer[key]?.trim().toLowerCase() === correctAnswer[key].toLowerCase()
      )
    }

    return isCorrect
  }

  const handleAnswer = async (exerciseId, answer) => {
    setUserAnswers({ ...userAnswers, [exerciseId]: answer })
  }

  const handleCheck = async () => {
    const exercise = exercises[currentExerciseIndex]
    const userAnswer = userAnswers[exercise.id]
    const isCorrect = checkAnswer(exercise.id, userAnswer)

    setFeedback({ ...feedback, [exercise.id]: isCorrect })
    setShowExplanation(true)

    // Record attempt
    if (profile) {
      await supabase.from('exercise_attempts').insert({
        user_id: profile.id,
        exercise_id: exercise.id,
        user_answer: userAnswer,
        is_correct: isCorrect,
      })
    }
  }

  const handleNext = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1)
      setShowExplanation(false)
    } else {
      completeLesson()
    }
  }

  const completeLesson = async () => {
    if (!profile) {
      navigate('/login')
      return
    }

    setCompleting(true)

    try {
      // Calculate score
      const correctAnswers = Object.keys(feedback).filter(id => feedback[id]).length
      const totalExercises = exercises.length
      const score = Math.round((correctAnswers / totalExercises) * 100)

      // Update or create lesson progress
      const { error: progressError } = await supabase
        .from('lesson_progress')
        .upsert({
          user_id: profile.id,
          lesson_id: lessonId,
          status: 'completed',
          score: score,
          completed_at: new Date().toISOString(),
        })

      if (progressError) throw progressError

      // Update user XP and streak
      const newXp = profile.xp + lesson.xp_reward
      const newLevel = Math.floor(Math.sqrt(newXp / 100)) + 1

      await supabase
        .from('profiles')
        .update({
          xp: newXp,
          level: newLevel,
        })
        .eq('id', profile.id)

      // Update streak
      await supabase.rpc('update_streak', { user_uuid: profile.id })

      await refreshProfile()

      // Show completion modal
      alert(`Lesson completed! You earned ${lesson.xp_reward} XP! Score: ${score}%`)

      // Navigate back to course
      navigate(`/course/${lesson.units.course_id}`)
    } catch (error) {
      console.error('Error completing lesson:', error)
    } finally {
      setCompleting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!lesson || exercises.length === 0) {
    return <div className="min-h-screen flex items-center justify-center">Lesson not found</div>
  }

  const currentExercise = exercises[currentExerciseIndex]
  const progress = ((currentExerciseIndex + 1) / exercises.length) * 100
  const hasAnswered = userAnswers[currentExercise.id] !== undefined
  const isCorrect = feedback[currentExercise.id]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Progress Bar */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => navigate(`/course/${lesson.units.course_id}`)}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <span className="text-sm font-semibold text-gray-600">
              {currentExerciseIndex + 1} / {exercises.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-primary-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Exercise Content */}
      <div className="flex-grow flex items-center justify-center py-8">
        <div className="max-w-4xl w-full px-4">
          <div className="card">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{currentExercise.question}</h2>
              {currentExercise.instructions && (
                <p className="text-gray-600">{currentExercise.instructions}</p>
              )}
            </div>

            <ExerciseCard
              exercise={currentExercise}
              userAnswer={userAnswers[currentExercise.id]}
              onAnswer={(answer) => handleAnswer(currentExercise.id, answer)}
              disabled={showExplanation}
            />

            {/* Feedback */}
            {showExplanation && (
              <div className={`mt-6 p-4 rounded-lg ${isCorrect ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'}`}>
                <div className="flex items-start space-x-3">
                  {isCorrect ? (
                    <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                  )}
                  <div>
                    <h3 className={`font-bold mb-2 ${isCorrect ? 'text-green-900' : 'text-red-900'}`}>
                      {isCorrect ? 'Correct!' : 'Not quite right'}
                    </h3>
                    <p className={isCorrect ? 'text-green-800' : 'text-red-800'}>
                      {currentExercise.explanation}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Hints */}
            {!showExplanation && currentExercise.hints && (
              <div className="mt-6">
                <details className="group">
                  <summary className="flex items-center space-x-2 cursor-pointer text-primary-600 hover:text-primary-700">
                    <Lightbulb className="w-5 h-5" />
                    <span className="font-semibold">Show hint</span>
                  </summary>
                  <div className="mt-3 p-4 bg-blue-50 rounded-lg">
                    <p className="text-blue-900">{currentExercise.hints[0]}</p>
                  </div>
                </details>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-8 flex justify-between items-center">
              <button
                onClick={() => setCurrentExerciseIndex(Math.max(0, currentExerciseIndex - 1))}
                disabled={currentExerciseIndex === 0}
                className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {!showExplanation ? (
                <button
                  onClick={handleCheck}
                  disabled={!hasAnswered}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Check Answer
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  disabled={completing}
                  className="btn-primary flex items-center space-x-2"
                >
                  <span>{currentExerciseIndex === exercises.length - 1 ? 'Complete Lesson' : 'Next'}</span>
                  {currentExerciseIndex < exercises.length - 1 && <ArrowRight className="w-5 h-5" />}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
