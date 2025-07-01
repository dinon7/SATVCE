"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useQuiz } from "@/contexts/QuizContext"
import QuestionLayout from "@/components/quiz/QuestionLayout"
import { Slider } from "@/components/ui/slider"
import { BookOpen, HelpCircle } from "lucide-react"

const knowledgeLabels = {
  0: "No knowledge",
  1: "Very limited",
  2: "Basic awareness",
  3: "Some understanding",
  4: "Moderate knowledge",
  5: "Good understanding",
  6: "Well informed",
  7: "Very knowledgeable",
  8: "Expert level",
  9: "Highly expert",
  10: "Complete expert"
}

export default function Question17() {
  const router = useRouter()
  const { setAnswer, isAnswered, getAnswer } = useQuiz()
  const [knowledgeLevel, setKnowledgeLevel] = useState<number>(5)

  const currentAnswer = getAnswer(17)
  
  // Initialize form with existing answer if available
  useEffect(() => {
    if (currentAnswer?.answer && typeof currentAnswer.answer === 'number') {
      setKnowledgeLevel(currentAnswer.answer)
    }
  }, [currentAnswer])

  const isQuestionAnswered = true // Always answered with default value

  const handleNext = () => {
    setAnswer({
      questionId: 17,
      answer: knowledgeLevel,
    })
    router.push("/quiz/18")
  }

  return (
    <QuestionLayout
      questionId={17}
      title="How much do you know about university prerequisites or job requirements?"
      description="Rate your knowledge level from 0 to 10"
      onNext={handleNext}
      isAnswered={isQuestionAnswered}
    >
      <div className="space-y-6">
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <BookOpen className="h-6 w-6 text-blue-600" />
            <div className="flex-1">
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-blue-600 mb-2">{knowledgeLevel}</div>
                <div className="text-lg font-medium text-gray-900">
                  {knowledgeLabels[knowledgeLevel as keyof typeof knowledgeLabels]}
                </div>
              </div>
              
              <Slider
                value={[knowledgeLevel]}
                onValueChange={(value) => setKnowledgeLevel(value[0])}
                max={10}
                min={0}
                step={1}
                className="w-full"
              />
              
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>0 - No knowledge</span>
                <span>10 - Expert-level</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-800 mb-3 text-lg">What this tells us:</h3>
          <ul className="text-sm text-blue-700 space-y-2">
            <li className="flex items-start">
              <span className="text-blue-600 font-medium mr-2">•</span>
              <span><strong>Information needs:</strong> How much guidance you need about requirements</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 font-medium mr-2">•</span>
              <span><strong>Research level:</strong> How much you've already explored career pathways</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 font-medium mr-2">•</span>
              <span><strong>Support requirements:</strong> Whether you need basic info or advanced guidance</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 font-medium mr-2">•</span>
              <span><strong>Confidence level:</strong> How comfortable you are with the application process</span>
            </li>
          </ul>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <div className="flex items-start space-x-2">
            <HelpCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <strong>Don't worry if your score is low!</strong> Many students find prerequisites confusing. 
              We'll provide clear guidance on what you need for your chosen career paths.
            </div>
          </div>
        </div>
      </div>
    </QuestionLayout>
  )
} 