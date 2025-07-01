"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useQuiz } from "@/contexts/QuizContext"
import QuestionLayout from "@/components/quiz/QuestionLayout"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const motivationOptions = [
  { id: "passion", label: "Passion", description: "Doing what you love and find meaningful" },
  { id: "stability", label: "Stability", description: "Having secure and predictable employment" },
  { id: "salary", label: "Salary", description: "Earning a good income" },
  { id: "freedom", label: "Freedom", description: "Having flexibility and independence" },
]

export default function Question5() {
  const router = useRouter()
  const { setAnswer, isAnswered, getAnswer } = useQuiz()
  const [selectedMotivation, setSelectedMotivation] = useState<string>("")
  const [otherMotivation, setOtherMotivation] = useState("")

  const currentAnswer = getAnswer(5)
  
  // Initialize form with existing answer if available
  useEffect(() => {
    if (currentAnswer?.answer && typeof currentAnswer.answer === 'object' && 'selected' in currentAnswer.answer) {
      const answer = currentAnswer.answer as { selected: string; other: string }
      setSelectedMotivation(answer.selected || "")
      setOtherMotivation(answer.other || "")
    }
  }, [currentAnswer])

  const isQuestionAnswered = selectedMotivation !== "" && (selectedMotivation !== "other" || otherMotivation.trim() !== "")

  const handleNext = () => {
    setAnswer({
      questionId: 5,
      answer: {
        selected: selectedMotivation,
        other: otherMotivation.trim(),
      },
    })
    router.push("/quiz/6")
  }

  return (
    <QuestionLayout
      questionId={5}
      title="What motivates you most when planning your future?"
      description="Choose the option that best describes your primary motivation"
      onNext={handleNext}
      isAnswered={isQuestionAnswered}
    >
      <div className="space-y-6">
        <RadioGroup
          value={selectedMotivation}
          onValueChange={setSelectedMotivation}
          className="space-y-4"
        >
          {motivationOptions.map((option) => (
            <div key={option.id} className="flex items-center space-x-3">
              <RadioGroupItem value={option.id} id={option.id} className="h-5 w-5" />
              <Label
                htmlFor={option.id}
                className="text-base font-medium text-gray-900 cursor-pointer flex-1"
              >
                <div className="font-semibold">{option.label}</div>
                <div className="text-sm text-gray-600 font-normal">{option.description}</div>
              </Label>
            </div>
          ))}
          
          <div className="space-y-3 pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="other" id="other" className="h-5 w-5" />
              <Label
                htmlFor="other"
                className="text-base font-medium text-gray-900 cursor-pointer"
              >
                Other:
              </Label>
            </div>
            <Input
              value={otherMotivation}
              onChange={(e) => setOtherMotivation(e.target.value)}
              placeholder="Please specify your motivation..."
              className="ml-8 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={selectedMotivation !== "other"}
            />
          </div>
        </RadioGroup>

        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-800 mb-3 text-lg">What this tells us:</h3>
          <ul className="text-sm text-blue-700 space-y-2">
            <li className="flex items-start">
              <span className="text-blue-600 font-medium mr-2">•</span>
              <span><strong>Core motivation:</strong> This drives your career decisions and satisfaction</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 font-medium mr-2">•</span>
              <span><strong>Career fit:</strong> We'll prioritize careers that align with your primary motivation</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 font-medium mr-2">•</span>
              <span><strong>Long-term satisfaction:</strong> Understanding your motivation helps ensure career longevity</span>
            </li>
          </ul>
        </div>
      </div>
    </QuestionLayout>
  )
} 