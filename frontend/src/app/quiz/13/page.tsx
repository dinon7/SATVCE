"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useQuiz } from "@/contexts/QuizContext"
import QuestionLayout from "@/components/quiz/QuestionLayout"
import { Textarea } from "@/components/ui/textarea"
import { Sparkles } from "lucide-react"

export default function Question13() {
  const router = useRouter()
  const { setAnswer, isAnswered, getAnswer } = useQuiz()
  const [dreamJob, setDreamJob] = useState("")

  const currentAnswer = getAnswer(13)
  
  // Initialize form with existing answer if available
  useEffect(() => {
    if (currentAnswer?.answer && typeof currentAnswer.answer === 'string') {
      setDreamJob(currentAnswer.answer)
    }
  }, [currentAnswer])

  const isQuestionAnswered = dreamJob.trim() !== ""

  const handleNext = () => {
    setAnswer({
      questionId: 13,
      answer: dreamJob.trim(),
    })
    router.push("/quiz/14")
  }

  return (
    <QuestionLayout
      questionId={13}
      title="What is your dream job (if any)?"
      description="Describe your ideal career, even if it seems far-fetched"
      onNext={handleNext}
      isAnswered={isQuestionAnswered}
    >
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <Sparkles className="h-6 w-6 text-blue-600 mt-1" />
            <div className="flex-1">
              <Textarea
                value={dreamJob}
                onChange={(e) => setDreamJob(e.target.value)}
                placeholder="e.g., Creative director at a game design company, Marine biologist, Software engineer at a tech startup..."
                className="min-h-[120px] px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                maxLength={500}
              />
              <div className="text-sm text-gray-500 mt-2 text-right">
                {dreamJob.length}/500 characters
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-800 mb-3 text-lg">What this tells us:</h3>
          <ul className="text-sm text-blue-700 space-y-2">
            <li className="flex items-start">
              <span className="text-blue-600 font-medium mr-2">•</span>
              <span><strong>Aspirations:</strong> Your highest career goals and ambitions</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 font-medium mr-2">•</span>
              <span><strong>Interests:</strong> What truly excites and motivates you</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 font-medium mr-2">•</span>
              <span><strong>Career direction:</strong> We'll suggest pathways that align with your dreams</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 font-medium mr-2">•</span>
              <span><strong>Motivation factors:</strong> What drives you in your career choices</span>
            </li>
          </ul>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <div className="flex items-start space-x-2">
            <div className="text-yellow-600 text-sm mt-0.5">💡</div>
            <div className="text-sm text-yellow-800">
              <strong>Tip:</strong> Don't worry if your dream job seems unrealistic right now. 
              Many successful careers start with big dreams that evolve over time!
            </div>
          </div>
        </div>
      </div>
    </QuestionLayout>
  )
} 