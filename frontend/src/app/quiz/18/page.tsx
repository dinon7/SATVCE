"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useQuiz } from "@/contexts/QuizContext"
import QuestionLayout from "@/components/quiz/QuestionLayout"
import { Slider } from "@/components/ui/slider"
import { Heart, AlertCircle } from "lucide-react"

const comfortLabels = {
  0: "Not comfortable at all",
  1: "Very uncomfortable",
  2: "Quite uncomfortable",
  3: "Somewhat uncomfortable",
  4: "Slightly uncomfortable",
  5: "Neutral",
  6: "Somewhat comfortable",
  7: "Quite comfortable",
  8: "Very comfortable",
  9: "Extremely comfortable",
  10: "Completely comfortable"
}

export default function Question18() {
  const router = useRouter()
  const { setAnswer, isAnswered, getAnswer } = useQuiz()
  const [comfortLevel, setComfortLevel] = useState<number>(5)

  const currentAnswer = getAnswer(18)
  
  // Initialize form with existing answer if available
  useEffect(() => {
    if (currentAnswer?.answer && typeof currentAnswer.answer === 'number') {
      setComfortLevel(currentAnswer.answer)
    }
  }, [currentAnswer])

  const isQuestionAnswered = true // Always answered with default value

  const handleNext = () => {
    setAnswer({
      questionId: 18,
      answer: comfortLevel,
    })
    router.push("/quiz/19")
  }

  return (
    <QuestionLayout
      questionId={18}
      title="How comfortable are you with uncertainty about your future career?"
      description="Rate your comfort level from 0 to 10"
      onNext={handleNext}
      isAnswered={isQuestionAnswered}
    >
      <div className="space-y-6">
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <Heart className="h-6 w-6 text-blue-600" />
            <div className="flex-1">
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-blue-600 mb-2">{comfortLevel}</div>
                <div className="text-lg font-medium text-gray-900">
                  {comfortLabels[comfortLevel as keyof typeof comfortLabels]}
                </div>
              </div>
              
              <Slider
                value={[comfortLevel]}
                onValueChange={(value) => setComfortLevel(value[0])}
                max={10}
                min={0}
                step={1}
                className="w-full"
              />
              
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>0 - Not comfortable at all</span>
                <span>10 - Very comfortable</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-800 mb-3 text-lg">What this tells us:</h3>
          <ul className="text-sm text-blue-700 space-y-2">
            <li className="flex items-start">
              <span className="text-blue-600 font-medium mr-2">•</span>
              <span><strong>Risk tolerance:</strong> How you handle career uncertainty and change</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 font-medium mr-2">•</span>
              <span><strong>Planning style:</strong> Whether you prefer detailed plans or flexible approaches</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 font-medium mr-2">•</span>
              <span><strong>Stress management:</strong> How you cope with career-related anxiety</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 font-medium mr-2">•</span>
              <span><strong>Career approach:</strong> Whether you prefer stability or exploration</span>
            </li>
          </ul>
        </div>

        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div className="text-sm text-green-800">
              <strong>Both approaches are valid!</strong> Some people thrive with clear plans, 
              while others prefer to stay open to opportunities. We'll suggest careers that match your comfort level.
            </div>
          </div>
        </div>
      </div>
    </QuestionLayout>
  )
} 