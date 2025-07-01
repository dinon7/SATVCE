"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useQuiz } from "@/contexts/QuizContext"
import QuestionLayout from "@/components/quiz/QuestionLayout"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Users, GraduationCap, UserCheck, Briefcase, Globe, Smartphone, User } from "lucide-react"

const influencerOptions = [
  { id: "parents", label: "Parents", icon: Users, description: "My family's advice and guidance" },
  { id: "teachers", label: "Teachers", icon: GraduationCap, description: "My school teachers and mentors" },
  { id: "peers", label: "Peers", icon: UserCheck, description: "My friends and classmates" },
  { id: "career-advisor", label: "Career Advisor", icon: Briefcase, description: "Professional career guidance" },
  { id: "online-resources", label: "Online Resources", icon: Globe, description: "Websites, articles, and research" },
  { id: "social-media", label: "Social Media / Influencers", icon: Smartphone, description: "Online content creators and platforms" },
  { id: "yourself", label: "Yourself", icon: User, description: "My own research and intuition" },
]

export default function Question16() {
  const router = useRouter()
  const { setAnswer, isAnswered, getAnswer } = useQuiz()
  const [selectedInfluencer, setSelectedInfluencer] = useState<string>("")

  const currentAnswer = getAnswer(16)
  
  // Initialize form with existing answer if available
  useEffect(() => {
    if (currentAnswer?.answer && typeof currentAnswer.answer === 'string') {
      setSelectedInfluencer(currentAnswer.answer)
    }
  }, [currentAnswer])

  const isQuestionAnswered = selectedInfluencer !== ""

  const handleNext = () => {
    setAnswer({
      questionId: 16,
      answer: selectedInfluencer,
    })
    router.push("/quiz/17")
  }

  return (
    <QuestionLayout
      questionId={16}
      title="Who influences your subject/career decisions the most?"
      description="Choose the option that best describes your situation"
      onNext={handleNext}
      isAnswered={isQuestionAnswered}
    >
      <div className="space-y-6">
        <RadioGroup
          value={selectedInfluencer}
          onValueChange={setSelectedInfluencer}
          className="space-y-4"
        >
          {influencerOptions.map((option) => {
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
              <span><strong>Decision-making style:</strong> How you approach important choices</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 font-medium mr-2">•</span>
              <span><strong>Support network:</strong> Who you rely on for guidance</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 font-medium mr-2">•</span>
              <span><strong>Information sources:</strong> Where you get your career information</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 font-medium mr-2">•</span>
              <span><strong>Independence level:</strong> How much you trust your own judgment</span>
            </li>
          </ul>
        </div>
      </div>
    </QuestionLayout>
  )
} 