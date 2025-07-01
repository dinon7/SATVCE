"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useQuiz } from "@/contexts/QuizContext"
import QuestionLayout from "@/components/quiz/QuestionLayout"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Building2, X, HelpCircle } from "lucide-react"

const businessOptions = [
  { id: "yes", label: "Yes", icon: Building2, description: "I definitely want to start my own business or freelance" },
  { id: "no", label: "No", icon: X, description: "I prefer working for established companies" },
  { id: "maybe", label: "Maybe", icon: HelpCircle, description: "I'm open to it if the opportunity arises" },
]

export default function Question22() {
  const router = useRouter()
  const { setAnswer, isAnswered, getAnswer } = useQuiz()
  const [selectedOption, setSelectedOption] = useState<string>("")

  const currentAnswer = getAnswer(22)
  
  // Initialize form with existing answer if available
  useEffect(() => {
    if (currentAnswer?.answer && typeof currentAnswer.answer === 'string') {
      setSelectedOption(currentAnswer.answer)
    }
  }, [currentAnswer])

  const isQuestionAnswered = selectedOption !== ""

  const handleNext = () => {
    setAnswer({
      questionId: 22,
      answer: selectedOption,
    })
    router.push("/quiz/23")
  }

  return (
    <QuestionLayout
      questionId={22}
      title="Do you see yourself starting a business or freelancing someday?"
      description="Choose the option that best reflects your thoughts"
      onNext={handleNext}
      isAnswered={isQuestionAnswered}
    >
      <div className="space-y-6">
        <RadioGroup
          value={selectedOption}
          onValueChange={setSelectedOption}
          className="space-y-4"
        >
          {businessOptions.map((option) => {
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
              <span><strong>Entrepreneurial spirit:</strong> Your comfort level with business ownership</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 font-medium mr-2">•</span>
              <span><strong>Risk tolerance:</strong> How you feel about business uncertainty</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 font-medium mr-2">•</span>
              <span><strong>Career flexibility:</strong> Your openness to different work arrangements</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 font-medium mr-2">•</span>
              <span><strong>Independence level:</strong> How much you want to be your own boss</span>
            </li>
          </ul>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <div className="flex items-start space-x-2">
            <div className="text-yellow-600 text-sm mt-0.5">💡</div>
            <div className="text-sm text-yellow-800">
              <strong>Remember:</strong> This is just about your current thinking. Many people change their minds 
              as they gain experience and confidence. There's no right or wrong answer!
            </div>
          </div>
        </div>
      </div>
    </QuestionLayout>
  )
} 