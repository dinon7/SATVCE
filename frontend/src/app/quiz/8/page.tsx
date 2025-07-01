"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useQuiz } from "@/contexts/QuizContext"
import QuestionLayout from "@/components/quiz/QuestionLayout"
import { Slider } from "@/components/quiz/Slider"

export default function Question8() {
  const router = useRouter()
  const { setAnswer, getAnswer } = useQuiz()
  const [value, setValue] = useState<number>(5)

  const currentAnswer = getAnswer(8)
  
  // Initialize form with existing answer if available
  useEffect(() => {
    if (currentAnswer?.answer && typeof currentAnswer.answer === 'number') {
      setValue(currentAnswer.answer)
    }
  }, [currentAnswer])

  // Fix: Use local state to determine if question is answered
  // The question is always answered since there's a default value
  const isQuestionAnswered = true

  const handleNext = () => {
    setAnswer({
      questionId: 8,
      answer: value,
    })
    router.push("/quiz/9")
  }

  const stabilityDescriptions = {
    0: "Not important at all - I prefer flexibility and change",
    1: "Very low importance - I'm comfortable with uncertainty",
    2: "Low importance - I can adapt to changing circumstances",
    3: "Somewhat low - I prefer some stability but can handle change",
    4: "Moderately low - I value some security but not rigidly",
    5: "Neutral - I'm balanced between stability and flexibility",
    6: "Moderately high - I prefer stable employment",
    7: "High importance - I want reliable, long-term work",
    8: "Very high - I want long-term security",
    9: "Extremely high - Job security is my top priority",
    10: "Critical - I need maximum job stability and security"
  };

  return (
    <QuestionLayout
      questionId={8}
      title="How important is job stability to you?"
      description="0 = Not Important, 10 = Extremely Important"
      onNext={handleNext}
      isAnswered={isQuestionAnswered}
    >
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 font-medium">Not Important</span>
            <span className="text-sm text-gray-600 font-medium">Extremely Important</span>
          </div>
          
          <Slider
            value={value}
            onChange={(newValue: number) => setValue(newValue)}
            min={0}
            max={10}
            step={1}
            className="w-full"
          />

          <div className="text-center">
            <span className="text-3xl font-bold text-blue-600">
              {value}
            </span>
            <p className="text-lg font-medium text-gray-900 mt-2">
              {value === 0 ? "Not Important" : value === 10 ? "Extremely Important" : `${value}/10`}
            </p>
            <p className="text-sm text-gray-600 mt-1 italic">
              "{stabilityDescriptions[value as keyof typeof stabilityDescriptions]}"
            </p>
          </div>
        </div>

        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-800 mb-3 text-lg">What this tells us:</h3>
          <ul className="text-sm text-blue-700 space-y-2">
            <li className="flex items-start">
              <span className="text-blue-600 font-medium mr-2">•</span>
              <span><strong>Risk tolerance:</strong> Your comfort level with career uncertainty and change</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 font-medium mr-2">•</span>
              <span><strong>Career preferences:</strong> We'll suggest careers that match your stability needs</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 font-medium mr-2">•</span>
              <span><strong>Industry fit:</strong> Some industries offer more stability than others</span>
            </li>
          </ul>
        </div>
      </div>
    </QuestionLayout>
  )
} 