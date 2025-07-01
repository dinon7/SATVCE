"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useQuiz } from "@/contexts/QuizContext"
import QuestionLayout from "@/components/quiz/QuestionLayout"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function Question1() {
  const router = useRouter()
  const { setAnswer, isAnswered, getAnswer } = useQuiz()
  const [subjects, setSubjects] = useState("")
  const [reason, setReason] = useState("")

  const currentAnswer = getAnswer(1)
  
  // Initialize form with existing answer if available
  useEffect(() => {
    if (currentAnswer?.answer && typeof currentAnswer.answer === 'object' && 'subjects' in currentAnswer.answer) {
      const answer = currentAnswer.answer as { subjects: string; reason: string }
      setSubjects(answer.subjects || "")
      setReason(answer.reason || "")
    }
  }, [currentAnswer])

  const isQuestionAnswered = subjects.trim() !== "" && reason.trim() !== ""

  const handleNext = () => {
    setAnswer({
      questionId: 1,
      answer: {
        subjects: subjects.trim(),
        reason: reason.trim(),
      },
    })
    router.push("/quiz/2")
  }

  return (
    <QuestionLayout
      questionId={1}
      title="What subjects do you currently enjoy the most and why?"
      onNext={handleNext}
      isAnswered={isQuestionAnswered}
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="subjects" className="text-base font-medium text-gray-900">
            Subjects you enjoy most
          </Label>
          <Input
            id="subjects"
            value={subjects}
            onChange={(e) => setSubjects(e.target.value)}
            placeholder="e.g., Science, Mathematics, English"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="reason" className="text-base font-medium text-gray-900">
            Why do you enjoy these subjects?
          </Label>
          <Textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g., I enjoy solving problems and understanding how things work"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px] resize-none"
            required
          />
        </div>
      </div>
    </QuestionLayout>
  )
} 