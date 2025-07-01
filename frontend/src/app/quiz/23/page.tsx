"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useQuiz } from "@/contexts/QuizContext"
import QuestionLayout from "@/components/quiz/QuestionLayout"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Building2 } from "lucide-react"

const industryOptions = [
  { id: "tech", label: "Tech", description: "Technology, software, and digital innovation" },
  { id: "healthcare", label: "Healthcare", description: "Medicine, nursing, and health services" },
  { id: "education", label: "Education", description: "Teaching, training, and learning" },
  { id: "business-finance", label: "Business/Finance", description: "Corporate, banking, and financial services" },
  { id: "arts-media", label: "Arts & Media", description: "Creative arts, entertainment, and media" },
  { id: "construction-trades", label: "Construction/Trades", description: "Building, manufacturing, and skilled trades" },
  { id: "science-research", label: "Science & Research", description: "Scientific research and development" },
]

export default function Question23() {
  const router = useRouter()
  const { setAnswer, isAnswered, getAnswer } = useQuiz()
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([])
  const [otherIndustry, setOtherIndustry] = useState("")

  const currentAnswer = getAnswer(23)
  
  // Initialize form with existing answer if available
  useEffect(() => {
    if (currentAnswer?.answer && typeof currentAnswer.answer === 'object' && 'selected' in currentAnswer.answer) {
      const answer = currentAnswer.answer as { selected: string[]; other: string }
      setSelectedIndustries(answer.selected || [])
      setOtherIndustry(answer.other || "")
    }
  }, [currentAnswer])

  const handleIndustryToggle = (industryId: string) => {
    setSelectedIndustries(prev => 
      prev.includes(industryId) 
        ? prev.filter(id => id !== industryId)
        : [...prev, industryId]
    )
  }

  const isQuestionAnswered = selectedIndustries.length > 0 || otherIndustry.trim() !== ""

  const handleNext = () => {
    setAnswer({
      questionId: 23,
      answer: {
        selected: selectedIndustries,
        other: otherIndustry.trim(),
      },
    })
    router.push("/quiz/24")
  }

  return (
    <QuestionLayout
      questionId={23}
      title="Are there specific industries that fascinate you?"
      description="Select all industries that interest you"
      onNext={handleNext}
      isAnswered={isQuestionAnswered}
    >
      <div className="space-y-6">
        <div className="space-y-4">
          {industryOptions.map((industry) => (
            <div key={industry.id} className="flex items-center space-x-3">
              <Checkbox
                id={industry.id}
                checked={selectedIndustries.includes(industry.id)}
                onCheckedChange={() => handleIndustryToggle(industry.id)}
                className="h-5 w-5"
              />
              <Label
                htmlFor={industry.id}
                className="text-base font-medium text-gray-900 cursor-pointer flex-1"
              >
                <div className="font-semibold">{industry.label}</div>
                <div className="text-sm text-gray-600 font-normal">{industry.description}</div>
              </Label>
            </div>
          ))}
          
          <div className="space-y-3 pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="other"
                checked={otherIndustry.trim() !== ""}
                onCheckedChange={(checked) => {
                  if (!checked) setOtherIndustry("")
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
              value={otherIndustry}
              onChange={(e) => setOtherIndustry(e.target.value)}
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
              <span><strong>Industry interests:</strong> Sectors that capture your attention</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 font-medium mr-2">•</span>
              <span><strong>Career focus:</strong> We'll prioritize careers in these industries</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 font-medium mr-2">•</span>
              <span><strong>Market awareness:</strong> Your understanding of different sectors</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 font-medium mr-2">•</span>
              <span><strong>Growth potential:</strong> Industries you see as promising</span>
            </li>
          </ul>
        </div>
      </div>
    </QuestionLayout>
  )
} 