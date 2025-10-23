import { useState, useEffect } from 'react'
import { Code } from 'lucide-react'

export default function ExerciseCard({ exercise, userAnswer, onAnswer, disabled }) {
  const [localAnswer, setLocalAnswer] = useState(userAnswer || '')

  useEffect(() => {
    setLocalAnswer(userAnswer || '')
  }, [userAnswer, exercise.id])

  const handleInputChange = (value) => {
    setLocalAnswer(value)
    onAnswer(value)
  }

  // Multiple Choice
  if (exercise.type === 'multiple_choice') {
    const options = JSON.parse(exercise.options || '[]')

    return (
      <div className="space-y-3">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => !disabled && handleInputChange(option)}
            disabled={disabled}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
              localAnswer === option
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-primary-300 bg-white'
            } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                localAnswer === option ? 'border-primary-500' : 'border-gray-300'
              }`}>
                {localAnswer === option && (
                  <div className="w-3 h-3 rounded-full bg-primary-500" />
                )}
              </div>
              <span className="font-medium text-gray-900">{option}</span>
            </div>
          </button>
        ))}
      </div>
    )
  }

  // Fill in the Blank
  if (exercise.type === 'fill_blank') {
    // Check if it's a multi-blank question (correct_answer is an object)
    const isMultiBlank = typeof exercise.correct_answer === 'object' && !Array.isArray(exercise.correct_answer)

    if (isMultiBlank) {
      const blanks = Object.keys(JSON.parse(JSON.stringify(exercise.correct_answer)))
      const answers = typeof localAnswer === 'object' ? localAnswer : {}

      return (
        <div className="space-y-4">
          {exercise.code_snippet && (
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
              <pre>{exercise.code_snippet}</pre>
            </div>
          )}
          <div className="space-y-3">
            {blanks.map((blank, index) => (
              <div key={blank}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Blank {index + 1}
                </label>
                <input
                  type="text"
                  value={answers[blank] || ''}
                  onChange={(e) => {
                    const newAnswers = { ...answers, [blank]: e.target.value }
                    setLocalAnswer(newAnswers)
                    onAnswer(newAnswers)
                  }}
                  disabled={disabled}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono"
                  placeholder="Type your answer..."
                />
              </div>
            ))}
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {exercise.code_snippet && (
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
            <pre>{exercise.code_snippet}</pre>
          </div>
        )}
        <input
          type="text"
          value={localAnswer}
          onChange={(e) => handleInputChange(e.target.value)}
          disabled={disabled}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono"
          placeholder="Type your answer..."
        />
      </div>
    )
  }

  // Code Completion
  if (exercise.type === 'code_completion') {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2 text-gray-600 mb-2">
          <Code className="w-5 h-5" />
          <span className="text-sm font-medium">Write your code below</span>
        </div>
        <textarea
          value={localAnswer}
          onChange={(e) => handleInputChange(e.target.value)}
          disabled={disabled}
          rows={6}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
          placeholder="# Write your Python code here..."
        />
      </div>
    )
  }

  // Code Output
  if (exercise.type === 'code_output') {
    const options = JSON.parse(exercise.options || '[]')

    return (
      <div className="space-y-4">
        <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
          <pre>{exercise.code_snippet}</pre>
        </div>
        <p className="text-gray-700 font-medium">What will this code output?</p>
        <div className="space-y-3">
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => !disabled && handleInputChange(option)}
              disabled={disabled}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all font-mono ${
                localAnswer === option
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-primary-300 bg-white'
              } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  localAnswer === option ? 'border-primary-500' : 'border-gray-300'
                }`}>
                  {localAnswer === option && (
                    <div className="w-3 h-3 rounded-full bg-primary-500" />
                  )}
                </div>
                <span className="text-gray-900">{option}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // Drag and Drop (simplified as click to select for now)
  if (exercise.type === 'drag_drop') {
    const options = JSON.parse(exercise.options || '[]')

    return (
      <div className="space-y-4">
        <p className="text-gray-700 font-medium">Select the items in the correct order:</p>
        <div className="grid grid-cols-2 gap-3">
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => !disabled && handleInputChange(option)}
              disabled={disabled}
              className={`p-4 rounded-xl border-2 transition-all ${
                localAnswer === option
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-primary-300 bg-white'
              } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    )
  }

  // Default fallback
  return (
    <div className="text-gray-600">
      <p>Exercise type: {exercise.type}</p>
      <p>This exercise type is not yet implemented.</p>
    </div>
  )
}
