"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useQuiz } from "@/contexts/QuizContext"

interface QuestionLayoutProps {
  children: React.ReactNode
  questionId: number
  title: string
  description?: string
  onNext: () => void
  isAnswered: boolean
  totalQuestions?: number
}

export default function QuestionLayout({
  children,
  questionId,
  title,
  description,
  onNext,
  isAnswered,
  totalQuestions,
}: QuestionLayoutProps) {
  const router = useRouter()
  const { currentQuestion } = useQuiz()

  // Use browser history for correct navigation in all quiz/followup flows
  const handleBack = () => {
    router.back()
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="text-gray-600 hover:text-primary"
        >
          ← Back
        </Button>
        <div className="text-sm text-gray-500">
          Question {questionId} of {totalQuestions ?? 25}
        </div>
      </div>

      <div className="space-y-4">
        <h1 className="text-2xl font-bold">{title}</h1>
        {description && (
          <p className="text-gray-600">{description}</p>
        )}
      </div>

      <div className="space-y-6">
        {children}
      </div>

      <div className="flex justify-end">
        <Button
          onClick={onNext}
          disabled={!isAnswered}
        >
          {questionId === (totalQuestions ?? 25) ? "Finish" : "Next"}
        </Button>
      </div>
    </div>
  )
} 