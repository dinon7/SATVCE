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

export default function FollowUpF5() {
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
      
      // Get the fifth question (f5)
      const f5Question = questions.find((q: FollowUpQuestion) => q.id === 'f5')
      if (!f5Question) {
        throw new Error('Question f5 not found')
      }
      
      setQuestion(f5Question)
      
      // Initialize answer with default value
      if (f5Question.type === 'multiple_choice' && f5Question.options && f5Question.options.length > 0) {
        setAnswerValue(f5Question.options[0])
      } else if (f5Question.type === 'slider' && f5Question.min_value !== undefined && f5Question.max_value !== undefined) {
        setAnswerValue(Math.round((f5Question.min_value + f5Question.max_value) / 2))
      } else if (f5Question.type === 'text_input') {
        setAnswerValue('')
      } else if (f5Question.type === 'ranking' && f5Question.items) {
        setAnswerValue([...f5Question.items]) // Default order
      }
      
    } catch (error) {
      console.error("Error loading followup question:", error)
      // Fallback to default question if API fails
      setQuestion({
        id: "f5",
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
      router.push("/quiz/followup/f6")
    } catch (error) {
      console.error("Error saving answer:", error)
      // On error, still go to next question
      router.push("/quiz/followup/f6")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePrevious = () => {
    router.push("/quiz/followup/f4")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading followup question...</p>
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
      questionId={5}
      title={question.text}
      description="Followup question 5 of 7"
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
            <span>5 of 7</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(5 / 7) * 100}%` }}
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
            {isSubmitting ? "Processing..." : "5 of 7"}
          </div>
        </div>
      </div>
    </QuestionLayout>
  )
} 