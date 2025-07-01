"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useQuiz } from "@/contexts/QuizContext"
import QuestionLayout from "@/components/quiz/QuestionLayout"
import RankingQuestion from "@/components/quiz/RankingQuestion"
import { Slider } from "@/components/quiz/Slider"

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

export default function FollowUpF2() {
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
      
      // Get the second question (f2)
      const f2Question = questions.find((q: FollowUpQuestion) => q.id === 'f2')
      if (!f2Question) {
        throw new Error('Question f2 not found')
      }
      
      setQuestion(f2Question)
      
      // Initialize answer with default value
      if (f2Question.type === 'multiple_choice' && f2Question.options && f2Question.options.length > 0) {
        setAnswerValue(f2Question.options[0])
      } else if (f2Question.type === 'slider' && f2Question.min_value !== undefined && f2Question.max_value !== undefined) {
        setAnswerValue(Math.round((f2Question.min_value + f2Question.max_value) / 2))
      } else if (f2Question.type === 'text_input') {
        setAnswerValue('')
      } else if (f2Question.type === 'ranking' && f2Question.items) {
        setAnswerValue([...f2Question.items]) // Default order
      }
      
    } catch (error) {
      console.error("Error loading followup question:", error)
      // Fallback to default question if API fails
      setQuestion({
        id: "f2",
        text: "Have you done any work experience or part-time work?",
        type: "multiple_choice",
        options: [
          "Yes, in a field I'm interested in",
          "Yes, but not in my field of interest",
          "No, but I plan to",
          "No, and I don't plan to"
        ]
      })
      setAnswerValue("No, but I plan to")
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

      // Navigate to next followup question
      router.push("/quiz/followup/f3")
    } catch (error) {
      console.error("Error saving answer:", error)
      // On error, still go to next question
      router.push("/quiz/followup/f3")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePrevious = () => {
    router.push("/quiz/followup/f1")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Generating personalized followup questions...</p>
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
      questionId={2}
      title={question.text}
      description="Followup question 2 of 7"
      onNext={handleNext}
      isAnswered={isAnswered}
      totalQuestions={7}
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
                {answer || 5}
              </div>
            </div>
            
            <Slider
              value={answer || 5}
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
            <span>2 of 7</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(2 / 7) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Navigation info */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-start space-x-2">
            <div className="text-blue-600 text-sm mt-0.5">💡</div>
            <div className="text-sm text-blue-800">
              <strong>Personalized Question:</strong> This question was generated based on your initial quiz responses to provide more targeted career guidance.
              {isSubmitting ? (
                <span className="block mt-2">Saving your answer and preparing the next question...</span>
              ) : (
                <span className="block mt-2">Click "Next" to continue with the next followup question.</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </QuestionLayout>
  )
} 