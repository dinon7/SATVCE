"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useQuiz } from "@/contexts/QuizContext"
import QuestionLayout from "@/components/quiz/QuestionLayout"
import { Textarea } from "@/components/ui/textarea"
import { Globe } from "lucide-react"

export default function Question19() {
  const router = useRouter()
  const { setAnswer, isAnswered, getAnswer } = useQuiz()
  const [problemToSolve, setProblemToSolve] = useState("")

  const currentAnswer = getAnswer(19)
  
  // Initialize form with existing answer if available
  useEffect(() => {
    if (currentAnswer?.answer && typeof currentAnswer.answer === 'string') {
      setProblemToSolve(currentAnswer.answer)
    }
  }, [currentAnswer])

  const isQuestionAnswered = problemToSolve.trim() !== ""

  const handleNext = () => {
    setAnswer({
      questionId: 19,
      answer: problemToSolve.trim(),
    })
    router.push("/quiz/20")
  }

  return (
    <QuestionLayout
      questionId={19}
      title="If you could solve one global or local problem, what would it be?"
      description="Describe a problem you're passionate about solving"
      onNext={handleNext}
      isAnswered={isQuestionAnswered}
    >
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <Globe className="h-6 w-6 text-blue-600 mt-1" />
            <div className="flex-1">
              <Textarea
                value={problemToSolve}
                onChange={(e) => setProblemToSolve(e.target.value)}
                placeholder="e.g., Improving education access in low-income communities, Reducing plastic waste, Mental health awareness, Local homelessness..."
                className="min-h-[120px] px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                maxLength={500}
              />
              <div className="text-sm text-gray-500 mt-2 text-right">
                {problemToSolve.length}/500 characters
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-800 mb-3 text-lg">What this tells us:</h3>
          <ul className="text-sm text-blue-700 space-y-2">
            <li className="flex items-start">
              <span className="text-blue-600 font-medium mr-2">•</span>
              <span><strong>Values:</strong> What matters most to you in the world</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 font-medium mr-2">•</span>
              <span><strong>Passion areas:</strong> Issues that motivate and inspire you</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 font-medium mr-2">•</span>
              <span><strong>Career alignment:</strong> We'll suggest careers that address these problems</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 font-medium mr-2">•</span>
              <span><strong>Impact focus:</strong> How you want to make a difference</span>
            </li>
          </ul>
        </div>

        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-start space-x-2">
            <div className="text-green-600 text-sm mt-0.5">💡</div>
            <div className="text-sm text-green-800">
              <strong>Tip:</strong> This question helps us understand your values and the kind of impact you want to make. 
              Don't worry about the scale - local problems are just as important as global ones!
            </div>
          </div>
        </div>
      </div>
    </QuestionLayout>
  )
} 