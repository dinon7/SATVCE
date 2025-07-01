"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useQuiz } from "@/contexts/QuizContext"
import QuestionLayout from "@/components/quiz/QuestionLayout"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const environmentOptions = [
  { id: "office", label: "Office", description: "Traditional office setting" },
  { id: "outdoors", label: "Outdoors", description: "Open air and natural settings" },
  { id: "scientific-lab", label: "Scientific lab", description: "Laboratory environment" },
  { id: "remote", label: "Remote/work from home", description: "Flexible location work" },
  { id: "physical", label: "Physical/manual settings", description: "Hands-on work environments" },
  { id: "creative-studio", label: "Creative studio", description: "Artistic and design spaces" },
]

export default function Question7() {
  const router = useRouter()
  const { setAnswer, isAnswered, getAnswer } = useQuiz()
  const [selectedEnvironments, setSelectedEnvironments] = useState<string[]>([])
  const [otherEnvironment, setOtherEnvironment] = useState("")

  const currentAnswer = getAnswer(7)
  
  // Initialize form with existing answer if available
  useEffect(() => {
    if (currentAnswer?.answer && typeof currentAnswer.answer === 'object' && 'selected' in currentAnswer.answer) {
      const answer = currentAnswer.answer as { selected: string[]; other: string }
      setSelectedEnvironments(answer.selected || [])
      setOtherEnvironment(answer.other || "")
    }
  }, [currentAnswer])

  const handleEnvironmentToggle = (environmentId: string) => {
    setSelectedEnvironments(prev => 
      prev.includes(environmentId) 
        ? prev.filter(id => id !== environmentId)
        : [...prev, environmentId]
    )
  }

  const isQuestionAnswered = selectedEnvironments.length > 0 || otherEnvironment.trim() !== ""

  const handleNext = () => {
    setAnswer({
      questionId: 7,
      answer: {
        selected: selectedEnvironments,
        other: otherEnvironment.trim(),
      },
    })
    router.push("/quiz/8")
  }

  return (
    <QuestionLayout
      questionId={7}
      title="What is your ideal work environment?"
      description="Select all that apply"
      onNext={handleNext}
      isAnswered={isQuestionAnswered}
    >
      <div className="space-y-6">
        <div className="space-y-4">
          {environmentOptions.map((environment) => (
            <label key={environment.id} className="flex items-center space-x-3 cursor-pointer">
              <Checkbox
                checked={selectedEnvironments.includes(environment.id)}
                onCheckedChange={() => handleEnvironmentToggle(environment.id)}
                className="h-5 w-5"
              />
              <span className="flex-1">
                <div className="font-semibold">{environment.label}</div>
                <div className="text-sm text-gray-600 font-normal">{environment.description}</div>
              </span>
            </label>
          ))}
          
          <div className="space-y-3 pt-4 border-t border-gray-200">
            <label className="flex items-center space-x-3 cursor-pointer">
              <Checkbox
                checked={otherEnvironment.trim() !== ""}
                onCheckedChange={(checked: boolean) => {
                  if (!checked) setOtherEnvironment("")
                }}
                className="h-5 w-5"
              />
              <span className="text-base font-medium text-gray-900">Other:</span>
            </label>
            <Input
              value={otherEnvironment}
              onChange={(e) => setOtherEnvironment(e.target.value)}
              placeholder="Please specify..."
              className="ml-8 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-800 mb-3 text-lg">What this tells us:</h3>
          <ul className="text-sm text-blue-700 space-y-2">
            <li className="flex items-start">
              <span className="text-blue-600 font-medium mr-2">•</span>
              <span><strong>Workplace preferences:</strong> Your ideal physical and social work setting</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 font-medium mr-2">•</span>
              <span><strong>Career compatibility:</strong> We'll match you with careers that offer these environments</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 font-medium mr-2">•</span>
              <span><strong>Job satisfaction:</strong> Work environments that match your preferences lead to higher satisfaction</span>
            </li>
          </ul>
        </div>
      </div>
    </QuestionLayout>
  )
} 