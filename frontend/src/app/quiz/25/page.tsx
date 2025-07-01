"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useQuiz } from "@/contexts/QuizContext"
import QuestionLayout from "@/components/quiz/QuestionLayout"
import { Slider } from "@/components/quiz/Slider"
import { Heart, DollarSign } from "lucide-react"

const preferenceLabels = {
  0: "All Passion",
  1: "Mostly Passion",
  2: "Strongly Passion",
  3: "Leaning Passion",
  4: "Slightly Passion",
  5: "Perfect Balance",
  6: "Slightly Salary",
  7: "Leaning Salary",
  8: "Strongly Salary",
  9: "Mostly Salary",
  10: "All Salary"
}

export default function Question25() {
  const router = useRouter()
  const { setAnswer, isAnswered, getAnswer } = useQuiz()
  const [preferenceLevel, setPreferenceLevel] = useState<number>(5)

  const currentAnswer = getAnswer(25)
  
  // Initialize form with existing answer if available
  useEffect(() => {
    if (currentAnswer?.answer && typeof currentAnswer.answer === 'number') {
      setPreferenceLevel(currentAnswer.answer)
    }
  }, [currentAnswer])

  const isQuestionAnswered = true // Always answered with default value

  const handleNext = () => {
    setAnswer({
      questionId: 25,
      answer: preferenceLevel,
    })
    router.push("/quiz/followup/f1")
  }

  return (
    <QuestionLayout
      questionId={25}
      title="Do you care more about doing what you love or earning a high salary?"
      description="Rate your preference from 0 to 10"
      onNext={handleNext}
      isAnswered={isQuestionAnswered}
    >
      <div className="space-y-6">
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Heart className="h-6 w-6 text-red-500" />
              <span className="text-sm font-medium text-gray-700">Passion</span>
            </div>
            <div className="flex-1">
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-blue-600 mb-2">{preferenceLevel}</div>
                <div className="text-lg font-medium text-gray-900">
                  {preferenceLabels[preferenceLevel as keyof typeof preferenceLabels]}
                </div>
              </div>
              
              <Slider
                value={preferenceLevel}
                onChange={(value: number) => setPreferenceLevel(value)}
                max={10}
                min={0}
                step={1}
                className="w-full"
              />
              
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>0 - All Passion</span>
                <span>10 - All Salary</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Salary</span>
              <DollarSign className="h-6 w-6 text-green-500" />
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-800 mb-3 text-lg">What this tells us:</h3>
          <ul className="text-sm text-blue-700 space-y-2">
            <li className="flex items-start">
              <span className="text-blue-600 font-medium mr-2">•</span>
              <span><strong>Career priorities:</strong> What matters most to you in a job</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 font-medium mr-2">•</span>
              <span><strong>Motivation factors:</strong> What drives your career decisions</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 font-medium mr-2">•</span>
              <span><strong>Job satisfaction:</strong> What will make you happy in your career</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 font-medium mr-2">•</span>
              <span><strong>Career recommendations:</strong> We'll suggest careers that match your priorities</span>
            </li>
          </ul>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="flex items-start space-x-2">
            <div className="text-purple-600 text-sm mt-0.5">🎯</div>
            <div className="text-sm text-purple-800">
              <strong>Great job!</strong> You've completed the initial 25 questions. 
              Now we'll ask you 7 personalized followup questions to provide even better career recommendations.
            </div>
          </div>
        </div>
      </div>
    </QuestionLayout>
  )
} 