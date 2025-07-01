"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useQuiz } from "@/contexts/QuizContext"
import QuestionLayout from "@/components/quiz/QuestionLayout"
import { Slider } from "@/components/quiz/Slider"
import RankingQuestion from "@/components/quiz/RankingQuestion"

interface FollowUpQuestion {
  id: string
  text: string
  type: string
  options?: string[]
  min_value?: number
  max_value?: number
  placeholder?: string
  items?: string[]
}

export default function FollowUpF7() {
  const router = useRouter()
  const { setAnswer, getAnswer, getAnswers } = useQuiz()
  const [question, setQuestion] = useState<FollowUpQuestion | null>(null)
  const [answer, setAnswerValue] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load followup question on component mount
  useEffect(() => {
    loadFollowUpQuestion()
  }, [])

  const loadFollowUpQuestion = async () => {
    try {
      setIsLoading(true)
      
      // Get initial answers from quiz context
      const initialAnswers = getAnswers()
      const answersForBackend: Record<string, any> = {}
      initialAnswers.forEach(answer => {
        answersForBackend[answer.questionId.toString()] = answer.answer
      })

      // Call frontend API to generate followup questions
      const response = await fetch('/api/quiz/generate-followup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          initial_answers: answersForBackend
        }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const questions = await response.json()
      
      // Get the seventh question (f7)
      const f7Question = questions.find((q: FollowUpQuestion) => q.id === 'f7')
      if (!f7Question) {
        throw new Error('Question f7 not found')
      }
      
      setQuestion(f7Question)
      
      // Initialize answer with default value
      if (f7Question.type === 'multiple_choice' && f7Question.options && f7Question.options.length > 0) {
        setAnswerValue(f7Question.options[0])
      } else if (f7Question.type === 'slider' && f7Question.min_value !== undefined && f7Question.max_value !== undefined) {
        setAnswerValue(Math.round((f7Question.min_value + f7Question.max_value) / 2))
      } else if (f7Question.type === 'text_input') {
        setAnswerValue('')
      } else if (f7Question.type === 'ranking' && f7Question.items) {
        setAnswerValue([...f7Question.items]) // Default order
      }
      
    } catch (error) {
      console.error("Error loading followup question:", error)
      // Fallback to default question if API fails
      setQuestion({
        id: "f7",
        text: "How important is it for you to work with cutting-edge technology?",
        type: "slider",
        min_value: 1,
        max_value: 10
      })
      setAnswerValue(5)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAnswerChange = (newAnswer: any) => {
    setAnswerValue(newAnswer)
  }

  const handleNext = async () => {
    if (!question || answer === null) return
    
    setIsSubmitting(true)
    
    try {
      // Save the answer to quiz context
      setAnswer({
        questionId: parseInt(question.id.replace('f', '')),
        answer: answer,
      })

      // Get all answers (initial + followup)
      const allAnswers = getAnswers()
      const initialAnswers: Record<string, any> = {}
      const followupAnswers: Record<string, any> = {}
      
      allAnswers.forEach(answer => {
        if (answer.questionId.toString().startsWith('f')) {
          followupAnswers[answer.questionId.toString()] = answer.answer
        } else {
          initialAnswers[answer.questionId.toString()] = answer.answer
        }
      })

      // Submit complete quiz using frontend API
      const response = await fetch('/api/quiz/submit-complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          initial_answers: initialAnswers,
          followup_answers: followupAnswers
        }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const results = await response.json()
      
      // Store the results in localStorage for the results page
      if (results.recommendations) {
        localStorage.setItem('quizResults', JSON.stringify(results))
      }
      
      // Navigate to results page
      router.push("/results")
    } catch (error) {
      console.error("Error submitting complete quiz:", error)
      // On error, still go to results - the results page will handle generating results from answers
      router.push("/results")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePrevious = () => {
    router.push("/quiz/followup/f6")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading final followup question...</p>
        </div>
      </div>
    )
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Unable to load followup question.</p>
          <button
            onClick={() => router.push("/results")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Results
          </button>
        </div>
      </div>
    )
  }

  const isAnswered = answer !== null && answer !== ''

  return (
    <QuestionLayout
      questionId={7}
      title={question.text}
      description="Final followup question 7 of 7"
      onNext={handleNext}
      isAnswered={isAnswered}
    >
      <div className="space-y-6">
        {/* Multiple Choice Question */}
        {question.type === "multiple_choice" && question.options && (
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <label
                key={index}
                className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                  answer === option
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={answer === option}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  className="sr-only"
                />
                <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                  answer === option
                    ? "border-blue-500 bg-blue-500"
                    : "border-gray-300"
                }`}>
                  {answer === option && (
                    <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                  )}
                </div>
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        )}

        {/* Slider Question */}
        {question.type === "slider" && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {typeof answer === 'number' ? answer : 5}
              </div>
            </div>
            
            <Slider
              value={typeof answer === 'number' ? answer : 5}
              onChange={(value: number) => handleAnswerChange(value)}
              max={question.max_value || 10}
              min={question.min_value || 0}
              step={1}
              className="w-full"
            />
            
            <div className="flex justify-between text-sm text-gray-500">
              <span>{question.min_value || 0}</span>
              <span>{question.max_value || 10}</span>
            </div>
          </div>
        )}

        {/* Text Input Question */}
        {question.type === "text_input" && (
          <div className="space-y-4">
            <textarea
              value={answer || ''}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder={question.placeholder || "Enter your answer..."}
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={4}
            />
          </div>
        )}

        {/* Ranking Question */}
        {question.type === "ranking" && question.items && (
          <RankingQuestion
            items={question.items}
            value={answer || question.items}
            onChange={(value) => handleAnswerChange(value)}
            disabled={isSubmitting}
          />
        )}

        {/* Progress indicator */}
        <div className="bg-gray-100 rounded-lg p-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Followup Questions Progress</span>
            <span>7 of 7</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(7 / 7) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between">
          <button
            onClick={handlePrevious}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Previous
          </button>
          
          <div className="text-sm text-gray-500">
            {isSubmitting ? "Generating results..." : "7 of 7"}
          </div>
        </div>

        {/* Final submission message */}
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-start space-x-2">
            <div className="text-green-600 text-sm mt-0.5">🎯</div>
            <div className="text-sm text-green-800">
              <strong>Final Question!</strong> This is your last followup question. 
              {isSubmitting ? (
                <span className="block mt-2">Analyzing all your responses and generating personalized career recommendations...</span>
              ) : (
                <span className="block mt-2">Click "Next" to see your personalized career recommendations based on all your answers.</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </QuestionLayout>
  )
} 