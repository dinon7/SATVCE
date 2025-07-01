"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useQuiz } from "@/contexts/QuizContext"
import QuestionLayout from "@/components/quiz/QuestionLayout"
import { Textarea } from "@/components/ui/textarea"
import { Activity } from "lucide-react"

export default function Question21() {
  const router = useRouter()
  const { setAnswer, isAnswered, getAnswer } = useQuiz()
  const [activities, setActivities] = useState("")

  const currentAnswer = getAnswer(21)
  
  // Initialize form with existing answer if available
  useEffect(() => {
    if (currentAnswer?.answer && typeof currentAnswer.answer === 'string') {
      setActivities(currentAnswer.answer)
    }
  }, [currentAnswer])

  const isQuestionAnswered = activities.trim() !== ""

  const handleNext = () => {
    setAnswer({
      questionId: 21,
      answer: activities.trim(),
    })
    router.push("/quiz/22")
  }

  return (
    <QuestionLayout
      questionId={21}
      title="What are your main hobbies, extracurriculars or part-time jobs?"
      description="Tell us about your activities outside of school"
      onNext={handleNext}
      isAnswered={isQuestionAnswered}
    >
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <Activity className="h-6 w-6 text-blue-600 mt-1" />
            <div className="flex-1">
              <Textarea
                value={activities}
                onChange={(e) => setActivities(e.target.value)}
                placeholder="e.g., Volunteering, photography, tutoring younger students, soccer team, part-time retail job, coding club..."
                className="min-h-[120px] px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                maxLength={500}
              />
              <div className="text-sm text-gray-500 mt-2 text-right">
                {activities.length}/500 characters
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-800 mb-3 text-lg">What this tells us:</h3>
          <ul className="text-sm text-blue-700 space-y-2">
            <li className="flex items-start">
              <span className="text-blue-600 font-medium mr-2">•</span>
              <span><strong>Interests:</strong> What you enjoy doing in your free time</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 font-medium mr-2">•</span>
              <span><strong>Skills development:</strong> Abilities you're building through activities</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 font-medium mr-2">•</span>
              <span><strong>Work experience:</strong> Any job experience you already have</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 font-medium mr-2">•</span>
              <span><strong>Leadership:</strong> Roles where you take initiative or responsibility</span>
            </li>
          </ul>
        </div>

        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-start space-x-2">
            <div className="text-green-600 text-sm mt-0.5">💡</div>
            <div className="text-sm text-green-800">
              <strong>Include everything!</strong> Even small activities like reading, gaming, or helping family 
              can reveal important skills and interests that translate to careers.
            </div>
          </div>
        </div>
      </div>
    </QuestionLayout>
  )
} 