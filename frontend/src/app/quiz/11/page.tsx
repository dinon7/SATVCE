"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useQuiz } from "@/contexts/QuizContext"
import QuestionLayout from "@/components/quiz/QuestionLayout"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { User, Users, Settings } from "lucide-react"

const workPreferenceOptions = [
  { id: "independently", label: "Independently", icon: User, description: "I prefer to work on my own" },
  { id: "team", label: "In a team", icon: Users, description: "I enjoy collaborating with others" },
  { id: "depends", label: "Depends on the task", icon: Settings, description: "I adapt based on what needs to be done" },
]

export default function Question11() {
  const router = useRouter()
  const { setAnswer, isAnswered, getAnswer } = useQuiz()
  const [selectedPreference, setSelectedPreference] = useState<string>("")

  const currentAnswer = getAnswer(11)
  
  // Initialize form with existing answer if available
  useEffect(() => {
    if (currentAnswer?.answer && typeof currentAnswer.answer === 'string') {
      setSelectedPreference(currentAnswer.answer)
    }
  }, [currentAnswer])

  const isQuestionAnswered = selectedPreference !== ""

  const handleNext = () => {
    setAnswer({
      questionId: 11,
      answer: selectedPreference,
    })
    router.push("/quiz/12")
  }

  return (
    <QuestionLayout
      questionId={11}
      title="Do you prefer working alone or in teams?"
      description="Choose the option that best describes your work style"
      onNext={handleNext}
      isAnswered={isQuestionAnswered}
    >
      <div className="space-y-6">
        <RadioGroup
          value={selectedPreference}
          onValueChange={setSelectedPreference}
          className="space-y-4"
        >
          {workPreferenceOptions.map((option) => {
            const IconComponent = option.icon
            return (
              <div key={option.id} className="flex items-center space-x-3">
                <RadioGroupItem value={option.id} id={option.id} className="h-5 w-5" />
                <Label
                  htmlFor={option.id}
                  className="text-base font-medium text-gray-900 cursor-pointer flex-1 flex items-center space-x-3"
                >
                  <IconComponent className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-semibold">{option.label}</div>
                    <div className="text-sm text-gray-600 font-normal">{option.description}</div>
                  </div>
                </Label>
              </div>
            )
          })}
        </RadioGroup>

        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-800 mb-3 text-lg">What this tells us:</h3>
          <ul className="text-sm text-blue-700 space-y-2">
            <li className="flex items-start">
              <span className="text-blue-600 font-medium mr-2">•</span>
              <span><strong>Work style:</strong> Your preferred approach to completing tasks</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 font-medium mr-2">•</span>
              <span><strong>Career fit:</strong> We'll suggest careers that match your work style</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 font-medium mr-2">•</span>
              <span><strong>Job satisfaction:</strong> Work environments that align with your preference</span>
            </li>
          </ul>
        </div>
      </div>
    </QuestionLayout>
  )
} 