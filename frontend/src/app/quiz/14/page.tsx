"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useQuiz } from "@/contexts/QuizContext"
import QuestionLayout from "@/components/quiz/QuestionLayout"
import { Textarea } from "@/components/ui/textarea"
import { XCircle } from "lucide-react"

export default function Question14() {
  const router = useRouter()
  const { setAnswer, isAnswered, getAnswer } = useQuiz()
  const [avoidedCareers, setAvoidedCareers] = useState("")

  const currentAnswer = getAnswer(14)
  
  // Initialize form with existing answer if available
  useEffect(() => {
    if (currentAnswer?.answer && typeof currentAnswer.answer === 'string') {
      setAvoidedCareers(currentAnswer.answer)
    }
  }, [currentAnswer])

  const isQuestionAnswered = true // This question is optional

  const handleNext = () => {
    setAnswer({
      questionId: 14,
      answer: avoidedCareers.trim(),
    })
    router.push("/quiz/15")
  }

  return (
    <QuestionLayout
      questionId={14}
      title="Are there any careers or industries you're sure you don't want to explore?"
      description="This helps us avoid suggesting careers that don't interest you"
      onNext={handleNext}
      isAnswered={isQuestionAnswered}
    >
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <XCircle className="h-6 w-6 text-red-600 mt-1" />
            <div className="flex-1">
              <Textarea
                value={avoidedCareers}
                onChange={(e) => setAvoidedCareers(e.target.value)}
                placeholder="e.g., Healthcare (anything involving blood), Sales, Accounting, Construction..."
                className="min-h-[120px] px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                maxLength={500}
              />
              <div className="text-sm text-gray-500 mt-2 text-right">
                {avoidedCareers.length}/500 characters
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-800 mb-3 text-lg">What this tells us:</h3>
          <ul className="text-sm text-blue-700 space-y-2">
            <li className="flex items-start">
              <span className="text-blue-600 font-medium mr-2">•</span>
              <span><strong>Dislikes:</strong> Areas that don't align with your interests or values</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 font-medium mr-2">•</span>
              <span><strong>Boundaries:</strong> What you're not willing to compromise on</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 font-medium mr-2">•</span>
              <span><strong>Filtering:</strong> We'll exclude these areas from your recommendations</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 font-medium mr-2">•</span>
              <span><strong>Self-awareness:</strong> Understanding what doesn't work for you</span>
            </li>
          </ul>
        </div>

        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-start space-x-2">
            <div className="text-green-600 text-sm mt-0.5">✅</div>
            <div className="text-sm text-green-800">
              <strong>Note:</strong> This question is optional. If you're open to exploring all career paths, 
              you can leave this blank and we'll provide a broader range of suggestions.
            </div>
          </div>
        </div>
      </div>
    </QuestionLayout>
  )
} 