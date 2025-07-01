"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useQuiz } from "@/contexts/QuizContext"
import QuestionLayout from "@/components/quiz/QuestionLayout"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Eye, Headphones, BookOpen, Hand } from "lucide-react"

const learningOptions = [
  { id: "visual", label: "Visual (images, diagrams)", icon: Eye, description: "I learn best through pictures, charts, and visual aids" },
  { id: "auditory", label: "Auditory (lectures, audio)", icon: Headphones, description: "I learn best by listening and discussing" },
  { id: "reading-writing", label: "Reading/writing", icon: BookOpen, description: "I learn best through text and taking notes" },
  { id: "kinesthetic", label: "Kinesthetic (hands-on)", icon: Hand, description: "I learn best by doing and experiencing" },
]

export default function Question24() {
  const router = useRouter()
  const { setAnswer, isAnswered, getAnswer } = useQuiz()
  const [selectedMethod, setSelectedMethod] = useState<string>("")

  const currentAnswer = getAnswer(24)
  
  // Initialize form with existing answer if available
  useEffect(() => {
    if (currentAnswer?.answer && typeof currentAnswer.answer === 'string') {
      setSelectedMethod(currentAnswer.answer)
    }
  }, [currentAnswer])

  const isQuestionAnswered = selectedMethod !== ""

  const handleNext = () => {
    setAnswer({
      questionId: 24,
      answer: selectedMethod,
    })
    router.push("/quiz/25")
  }

  return (
    <QuestionLayout
      questionId={24}
      title="What is your preferred method of learning?"
      description="Choose the learning style that works best for you"
      onNext={handleNext}
      isAnswered={isQuestionAnswered}
    >
      <div className="space-y-6">
        <RadioGroup
          value={selectedMethod}
          onValueChange={setSelectedMethod}
          className="space-y-4"
        >
          {learningOptions.map((option) => {
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
              <span><strong>Learning style:</strong> How you prefer to acquire new skills</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 font-medium mr-2">•</span>
              <span><strong>Training preferences:</strong> What kind of learning environments suit you</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 font-medium mr-2">•</span>
              <span><strong>Career development:</strong> How you'll approach ongoing learning</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 font-medium mr-2">•</span>
              <span><strong>Work environment:</strong> Jobs that match your learning style</span>
            </li>
          </ul>
        </div>

        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-start space-x-2">
            <div className="text-green-600 text-sm mt-0.5">💡</div>
            <div className="text-sm text-green-800">
              <strong>Most people use multiple styles!</strong> You might prefer one method but still use others. 
              This just helps us understand your primary learning preference.
            </div>
          </div>
        </div>
      </div>
    </QuestionLayout>
  )
} 