"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useQuiz } from "@/contexts/QuizContext"
import QuestionLayout from "@/components/quiz/QuestionLayout"
import { Slider } from "@/components/quiz/Slider"

export default function Question2() {
  const router = useRouter()
  const { setAnswer, getAnswer } = useQuiz()
  const [value, setValue] = useState<number>(3)

  const currentAnswer = getAnswer(2)
  
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
      questionId: 2,
      answer: value,
    })
    router.push("/quiz/3")
  }

  const confidenceLabels = {
    1: "Not confident at all",
    2: "Somewhat unsure", 
    3: "Neutral",
    4: "Somewhat confident",
    5: "Very confident"
  };

  const confidenceDescriptions = {
    1: "I have some interests, but nothing I feel sure about yet.",
    2: "I have some ideas but I'm still exploring different options.",
    3: "I have a few ideas but I'm still considering different paths.",
    4: "I have a good idea of what I want to do.",
    5: "I know exactly what I want to do after school."
  };

  return (
    <QuestionLayout
      questionId={2}
      title="How confident are you about what you want to do after school?"
      description="1 = Not confident at all, 5 = Very confident"
      onNext={handleNext}
      isAnswered={isQuestionAnswered}
    >
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 font-medium">Not confident at all</span>
            <span className="text-sm text-gray-600 font-medium">Very confident</span>
          </div>
          
          <Slider
            value={value}
            onChange={(newValue: number) => setValue(newValue)}
            min={1}
            max={5}
            step={1}
            className="w-full"
          />

          <div className="text-center">
            <span className="text-3xl font-bold text-blue-600">
              {value}
            </span>
            <p className="text-lg font-medium text-gray-900 mt-2">
              {confidenceLabels[value as keyof typeof confidenceLabels]}
            </p>
            <p className="text-sm text-gray-600 mt-1 italic">
              "{confidenceDescriptions[value as keyof typeof confidenceDescriptions]}"
            </p>
          </div>
        </div>

        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-800 mb-3 text-lg">What this tells us:</h3>
          <ul className="text-sm text-blue-700 space-y-2">
            <li className="flex items-start">
              <span className="text-blue-600 font-medium mr-2">•</span>
              <span><strong>1-2:</strong> You're still exploring your options and interests - this is completely normal!</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 font-medium mr-2">•</span>
              <span><strong>3:</strong> You have some ideas but are still considering different paths</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 font-medium mr-2">•</span>
              <span><strong>4-5:</strong> You have a clear direction for your future career</span>
            </li>
          </ul>
        </div>
      </div>
    </QuestionLayout>
  )
} 