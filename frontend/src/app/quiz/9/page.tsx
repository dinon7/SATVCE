"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useQuiz } from "@/contexts/QuizContext"
import QuestionLayout from "@/components/quiz/QuestionLayout"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function Question9() {
  const router = useRouter()
  const { setAnswer, isAnswered, getAnswer } = useQuiz()
  const [idealCareer, setIdealCareer] = useState("")

  const currentAnswer = getAnswer(9)
  
  // Initialize form with existing answer if available
  useEffect(() => {
    if (currentAnswer?.answer && typeof currentAnswer.answer === 'string') {
      setIdealCareer(currentAnswer.answer)
    }
  }, [currentAnswer])

  const isQuestionAnswered = idealCareer.trim() !== ""

  const handleNext = () => {
    setAnswer({
      questionId: 9,
      answer: idealCareer.trim(),
    })
    router.push("/quiz/10")
  }

  return (
    <QuestionLayout
      questionId={9}
      title="Describe your ideal career in one sentence"
      description="Be as specific or general as you'd like"
      onNext={handleNext}
      isAnswered={isQuestionAnswered}
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="ideal-career" className="text-base font-medium text-gray-900">
            Your ideal career
          </Label>
          <Input
            id="ideal-career"
            value={idealCareer}
            onChange={(e) => setIdealCareer(e.target.value)}
            placeholder="e.g., Something that lets me work on tech projects and help people"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            maxLength={200}
            required
          />
          <div className="text-sm text-gray-500 text-right">
            {idealCareer.length}/200 characters
          </div>
        </div>

        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-800 mb-3 text-lg">What this tells us:</h3>
          <ul className="text-sm text-blue-700 space-y-2">
            <li className="flex items-start">
              <span className="text-blue-600 font-medium mr-2">•</span>
              <span><strong>Career vision:</strong> Your personal definition of an ideal job</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 font-medium mr-2">•</span>
              <span><strong>Values alignment:</strong> What matters most to you in a career</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 font-medium mr-2">•</span>
              <span><strong>Goal setting:</strong> We'll use this to guide your career recommendations</span>
            </li>
          </ul>
        </div>
      </div>
    </QuestionLayout>
  )
} 