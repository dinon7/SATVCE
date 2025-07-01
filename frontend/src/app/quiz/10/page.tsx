"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useQuiz } from "@/contexts/QuizContext"
import QuestionLayout from "@/components/quiz/QuestionLayout"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const academicOptions = [
  { id: "english", label: "English", description: "Literature, writing, and communication" },
  { id: "mathematics", label: "Mathematics", description: "Numbers, calculations, and problem-solving" },
  { id: "science", label: "Science", description: "Biology, chemistry, physics, and research" },
  { id: "history", label: "History / Humanities", description: "Social studies, culture, and analysis" },
  { id: "languages", label: "Languages", description: "Foreign languages and linguistics" },
  { id: "technology", label: "Technology", description: "Computing, programming, and digital skills" },
  { id: "business", label: "Business / Commerce", description: "Economics, management, and finance" },
  { id: "physical-education", label: "Physical Education", description: "Sports, fitness, and health" },
]

export default function Question10() {
  const router = useRouter()
  const { setAnswer, isAnswered, getAnswer } = useQuiz()
  const [selectedAreas, setSelectedAreas] = useState<string[]>([])
  const [otherArea, setOtherArea] = useState("")

  const currentAnswer = getAnswer(10)
  
  // Initialize form with existing answer if available
  useEffect(() => {
    if (currentAnswer?.answer && typeof currentAnswer.answer === 'object' && 'selected' in currentAnswer.answer) {
      const answer = currentAnswer.answer as { selected: string[]; other: string }
      setSelectedAreas(answer.selected || [])
      setOtherArea(answer.other || "")
    }
  }, [currentAnswer])

  const handleAreaToggle = (areaId: string) => {
    setSelectedAreas(prev => 
      prev.includes(areaId) 
        ? prev.filter(id => id !== areaId)
        : [...prev, areaId]
    )
  }

  const isQuestionAnswered = selectedAreas.length > 0 || otherArea.trim() !== ""

  const handleNext = () => {
    setAnswer({
      questionId: 10,
      answer: {
        selected: selectedAreas,
        other: otherArea.trim(),
      },
    })
    router.push("/quiz/11")
  }

  return (
    <QuestionLayout
      questionId={10}
      title="What are your strongest academic areas?"
      description="Select all that apply"
      onNext={handleNext}
      isAnswered={isQuestionAnswered}
    >
      <div className="space-y-6">
        <div className="space-y-4">
          {academicOptions.map((area) => (
            <div key={area.id} className="flex items-center space-x-3">
              <Checkbox
                id={area.id}
                checked={selectedAreas.includes(area.id)}
                onCheckedChange={() => handleAreaToggle(area.id)}
                className="h-5 w-5"
              />
              <Label
                htmlFor={area.id}
                className="text-base font-medium text-gray-900 cursor-pointer flex-1"
              >
                <div className="font-semibold">{area.label}</div>
                <div className="text-sm text-gray-600 font-normal">{area.description}</div>
              </Label>
            </div>
          ))}
          
          <div className="space-y-3 pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="other"
                checked={otherArea.trim() !== ""}
                onCheckedChange={(checked) => {
                  if (!checked) setOtherArea("")
                }}
                className="h-5 w-5"
              />
              <Label
                htmlFor="other"
                className="text-base font-medium text-gray-900 cursor-pointer"
              >
                Other:
              </Label>
            </div>
            <Input
              value={otherArea}
              onChange={(e) => setOtherArea(e.target.value)}
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
              <span><strong>Academic strengths:</strong> Your natural abilities and areas of excellence</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 font-medium mr-2">•</span>
              <span><strong>Subject alignment:</strong> We'll recommend VCE subjects that build on your strengths</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 font-medium mr-2">•</span>
              <span><strong>Career pathways:</strong> Careers that utilize your strongest academic areas</span>
            </li>
          </ul>
        </div>
      </div>
    </QuestionLayout>
  )
} 