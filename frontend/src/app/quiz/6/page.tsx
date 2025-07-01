"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useQuiz } from "@/contexts/QuizContext"
import QuestionLayout from "@/components/quiz/QuestionLayout"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Clock, Sun, Coffee, Moon, Zap } from "lucide-react"

const timeOptions = [
  { id: "morning", label: "Morning", icon: Sun, description: "Early hours, fresh start" },
  { id: "midday", label: "Midday", icon: Coffee, description: "Middle of the day" },
  { id: "afternoon", label: "Afternoon", icon: Clock, description: "Later in the day" },
  { id: "evening", label: "Evening", icon: Zap, description: "End of day" },
  { id: "late-night", label: "Late Night", icon: Moon, description: "Late hours" },
]

export default function Question6() {
  const router = useRouter()
  const { setAnswer, isAnswered, getAnswer } = useQuiz()
  const [selectedTime, setSelectedTime] = useState<string>("")

  const currentAnswer = getAnswer(6)
  
  // Initialize form with existing answer if available
  useEffect(() => {
    if (currentAnswer?.answer && typeof currentAnswer.answer === 'string') {
      setSelectedTime(currentAnswer.answer)
    }
  }, [currentAnswer])

  const isQuestionAnswered = selectedTime !== ""

  const handleNext = () => {
    setAnswer({
      questionId: 6,
      answer: selectedTime,
    })
    router.push("/quiz/7")
  }

  return (
    <QuestionLayout
      questionId={6}
      title="When are you most focused or productive?"
      description="Choose the time period when you feel most alert and productive"
      onNext={handleNext}
      isAnswered={isQuestionAnswered}
    >
      <div className="space-y-6">
        <RadioGroup
          value={selectedTime}
          onValueChange={setSelectedTime}
          className="space-y-4"
        >
          {timeOptions.map((option) => {
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
              <span><strong>Productivity patterns:</strong> Your natural energy cycles and peak performance times</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 font-medium mr-2">•</span>
              <span><strong>Work schedule preferences:</strong> Careers that align with your natural rhythm</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 font-medium mr-2">•</span>
              <span><strong>Job satisfaction:</strong> Work schedules that match your productivity peaks</span>
            </li>
          </ul>
        </div>
      </div>
    </QuestionLayout>
  )
} 