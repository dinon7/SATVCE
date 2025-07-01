"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useQuiz } from "@/contexts/QuizContext"
import QuestionLayout from "@/components/quiz/QuestionLayout"
import { Input } from "@/components/ui/input"
import { Users } from "lucide-react"

export default function Question20() {
  const router = useRouter()
  const { setAnswer, isAnswered, getAnswer } = useQuiz()
  const [threeWords, setThreeWords] = useState("")

  const currentAnswer = getAnswer(20)
  
  // Initialize form with existing answer if available
  useEffect(() => {
    if (currentAnswer?.answer && typeof currentAnswer.answer === 'string') {
      setThreeWords(currentAnswer.answer)
    }
  }, [currentAnswer])

  const isQuestionAnswered = threeWords.trim() !== ""

  const handleNext = () => {
    setAnswer({
      questionId: 20,
      answer: threeWords.trim(),
    })
    router.push("/quiz/21")
  }

  return (
    <QuestionLayout
      questionId={20}
      title="What three words would your friends use to describe you?"
      description="Think about how others see your personality and strengths"
      onNext={handleNext}
      isAnswered={isQuestionAnswered}
    >
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Users className="h-6 w-6 text-blue-600" />
            <div className="flex-1">
              <Input
                value={threeWords}
                onChange={(e) => setThreeWords(e.target.value)}
                placeholder="e.g., Driven, creative, helpful"
                className="px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={100}
              />
              <div className="text-sm text-gray-500 mt-2 text-right">
                {threeWords.length}/100 characters
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-800 mb-3 text-lg">What this tells us:</h3>
          <ul className="text-sm text-blue-700 space-y-2">
            <li className="flex items-start">
              <span className="text-blue-600 font-medium mr-2">•</span>
              <span><strong>Self-awareness:</strong> How you think others perceive you</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 font-medium mr-2">•</span>
              <span><strong>Personality traits:</strong> Your key characteristics and strengths</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 font-medium mr-2">•</span>
              <span><strong>Social perception:</strong> How you present yourself to others</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 font-medium mr-2">•</span>
              <span><strong>Career fit:</strong> We'll suggest careers that match your personality</span>
            </li>
          </ul>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <div className="flex items-start space-x-2">
            <div className="text-yellow-600 text-sm mt-0.5">💭</div>
            <div className="text-sm text-yellow-800">
              <strong>Think about:</strong> What do people often compliment you on? 
              What do they come to you for help with? These clues can help you identify your key traits.
            </div>
          </div>
        </div>
      </div>
    </QuestionLayout>
  )
} 