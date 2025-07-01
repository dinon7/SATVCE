"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useQuiz } from "@/contexts/QuizContext"
import QuestionLayout from "@/components/quiz/QuestionLayout"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Heart, Shield, Clock } from "lucide-react"

const attitudeOptions = [
  { 
    id: "passion", 
    label: "I want to do what I love, no matter the risk", 
    icon: Heart, 
    description: "Following your passion is the most important thing" 
  },
  { 
    id: "stability", 
    label: "I want something stable with a good income", 
    icon: Shield, 
    description: "Security and financial stability are priorities" 
  },
  { 
    id: "flexibility", 
    label: "I want flexibility and work-life balance", 
    icon: Clock, 
    description: "Having time for life outside of work is key" 
  },
]

export default function Question12() {
  const router = useRouter()
  const { setAnswer, isAnswered, getAnswer } = useQuiz()
  const [selectedAttitude, setSelectedAttitude] = useState<string>("")

  const currentAnswer = getAnswer(12)
  
  // Initialize form with existing answer if available
  useEffect(() => {
    if (currentAnswer?.answer && typeof currentAnswer.answer === 'string') {
      setSelectedAttitude(currentAnswer.answer)
    }
  }, [currentAnswer])

  const isQuestionAnswered = selectedAttitude !== ""

  const handleNext = () => {
    setAnswer({
      questionId: 12,
      answer: selectedAttitude,
    })
    router.push("/quiz/13")
  }

  return (
    <QuestionLayout
      questionId={12}
      title="Which of these best reflects your attitude towards your future?"
      description="Choose the statement that resonates most with you"
      onNext={handleNext}
      isAnswered={isQuestionAnswered}
    >
      <div className="space-y-6">
        <RadioGroup
          value={selectedAttitude}
          onValueChange={setSelectedAttitude}
          className="space-y-4"
        >
          {attitudeOptions.map((option) => {
            const IconComponent = option.icon
            return (
              <div key={option.id} className="flex items-start space-x-3">
                <RadioGroupItem value={option.id} id={option.id} className="h-5 w-5 mt-1" />
                <Label
                  htmlFor={option.id}
                  className="text-base font-medium text-gray-900 cursor-pointer flex-1 flex items-start space-x-3"
                >
                  <IconComponent className="h-5 w-5 text-blue-600 mt-0.5" />
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
              <span><strong>Core values:</strong> What matters most to you in your career journey</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 font-medium mr-2">•</span>
              <span><strong>Risk tolerance:</strong> Your comfort level with career uncertainty</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 font-medium mr-2">•</span>
              <span><strong>Life priorities:</strong> How you balance work with other life aspects</span>
            </li>
          </ul>
        </div>
      </div>
    </QuestionLayout>
  )
} 