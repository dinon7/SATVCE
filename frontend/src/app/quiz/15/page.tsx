"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useQuiz } from "@/contexts/QuizContext"
import QuestionLayout from "@/components/quiz/QuestionLayout"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronDown, ChevronRight, BookOpen } from "lucide-react"

const vceSubjects = {
  "Arts": [
    "Art Creative Practice",
    "Art Making and Exhibiting",
    "Dance",
    "Drama",
    "Media",
    "Music Composition",
    "Music Contemporary Performance",
    "Music Inquiry",
    "Music Repertoire Performance",
    "Theatre Studies",
    "Visual Communication Design"
  ],
  "Business and Economics": [
    "Accounting",
    "Business Management",
    "Economics",
    "Industry and Enterprise",
    "Legal Studies"
  ],
  "English": [
    "English",
    "English as an Additional Language",
    "English Language",
    "Literature"
  ],
  "Health and Physical Education": [
    "Health and Human Development",
    "Outdoor and Environmental Studies",
    "Physical Education"
  ],
  "Humanities": [
    "Classical Studies",
    "Geography",
    "Ancient History",
    "Australian History",
    "History: Revolutions",
    "Philosophy",
    "Australian Politics",
    "Global Politics",
    "Religion and Society",
    "Sociology",
    "Texts and Traditions"
  ],
  "Languages": [
    "Aboriginal Languages",
    "Arabic",
    "Armenian",
    "Auslan",
    "Bengali",
    "Bosnian",
    "Chin Hakha",
    "Chinese First Language",
    "Chinese Language, Culture and Society",
    "Chinese Second Language Advanced",
    "Chinese Second Language",
    "Classical Greek",
    "Classical Hebrew",
    "Croatian",
    "Dutch",
    "Filipino",
    "French",
    "German",
    "Greek",
    "Hebrew",
    "Hindi",
    "Hungarian",
    "Indigenous Languages",
    "Indonesian First Language",
    "Indonesian Second Language",
    "Italian",
    "Japanese First Language",
    "Japanese Second Language",
    "Karen",
    "Khmer",
    "Korean First Language",
    "Korean Second Language",
    "Latin",
    "Macedonian",
    "Persian",
    "Polish",
    "Portuguese",
    "Punjabi",
    "Romanian",
    "Russian",
    "Serbian",
    "Sinhala",
    "Spanish",
    "Swedish",
    "Tamil",
    "Turkish",
    "Vietnamese First Language",
    "Vietnamese Second Language",
    "Yiddish"
  ],
  "Mathematics": [
    "Foundation Mathematics",
    "General Mathematics",
    "Mathematical Methods",
    "Specialist Mathematics"
  ],
  "Sciences": [
    "Biology",
    "Chemistry",
    "Environmental Science",
    "Physics",
    "Psychology"
  ],
  "Technologies": [
    "Agricultural & Horticultural Studies",
    "Algorithmics (HESS)",
    "Applied Computing: Data Analytics",
    "Applied Computing: Software Development",
    "Food Studies",
    "Product Design and Technologies",
    "Systems Engineering"
  ],
  "Other": [
    "Extended Investigation"
  ],
  "VCE VET Subjects": [
    "VCE VET Business",
    "VCE VET Community Services",
    "VCE VET Creative and Digital Media",
    "VCE VET Dance",
    "VCE VET Engineering Studies",
    "VCE VET Equine Studies",
    "VCE VET Furnishing",
    "VCE VET Health Services",
    "VCE VET Hospitality",
    "VCE VET Hospitality (Cookery)",
    "VCE VET Information Technology",
    "VCE VET Integrated Technologies",
    "VCE VET Laboratory Skills",
    "VCE VET Music Performance",
    "VCE VET Music Sound Production",
    "VCE VET Sport and Recreation"
  ]
}

export default function Question15() {
  const router = useRouter()
  const { setAnswer, isAnswered, getAnswer } = useQuiz()
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])
  const [otherSubject, setOtherSubject] = useState("")
  const [expandedCategories, setExpandedCategories] = useState<string[]>([])

  const currentAnswer = getAnswer(15)
  
  // Initialize form with existing answer if available
  useEffect(() => {
    if (currentAnswer?.answer && typeof currentAnswer.answer === 'object' && 'selected' in currentAnswer.answer) {
      const answer = currentAnswer.answer as { selected: string[]; other: string }
      setSelectedSubjects(answer.selected || [])
      setOtherSubject(answer.other || "")
    }
  }, [currentAnswer])

  const handleSubjectToggle = (subject: string) => {
    setSelectedSubjects(prev => 
      prev.includes(subject) 
        ? prev.filter(s => s !== subject)
        : [...prev, subject]
    )
  }

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  const isQuestionAnswered = selectedSubjects.length > 0 || otherSubject.trim() !== ""

  const handleNext = () => {
    setAnswer({
      questionId: 15,
      answer: {
        selected: selectedSubjects,
        other: otherSubject.trim(),
      },
    })
    router.push("/quiz/16")
  }

  return (
    <QuestionLayout
      questionId={15}
      title="Which subjects are you currently considering for VCE?"
      description="Select all subjects you're thinking about taking"
      onNext={handleNext}
      isAnswered={isQuestionAnswered}
    >
      <div className="space-y-6">
        <div className="space-y-4">
          {Object.entries(vceSubjects).map(([category, subjects]) => (
            <div key={category} className="border border-gray-200 rounded-lg">
              <button
                type="button"
                onClick={() => toggleCategory(category)}
                className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 rounded-t-lg border-b border-gray-200"
              >
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold text-gray-900">{category}</span>
                  <span className="text-sm text-gray-500">({subjects.length})</span>
                </div>
                {expandedCategories.includes(category) ? (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-500" />
                )}
              </button>
              
              {expandedCategories.includes(category) && (
                <div className="p-4 space-y-3">
                  {subjects.map((subject) => (
                    <div key={subject} className="flex items-center space-x-3">
                      <Checkbox
                        id={subject}
                        checked={selectedSubjects.includes(subject)}
                        onCheckedChange={() => handleSubjectToggle(subject)}
                        className="h-4 w-4"
                      />
                      <Label
                        htmlFor={subject}
                        className="text-sm font-medium text-gray-900 cursor-pointer flex-1"
                      >
                        {subject}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          
          <div className="space-y-3 pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="other"
                checked={otherSubject.trim() !== ""}
                onCheckedChange={(checked) => {
                  if (!checked) setOtherSubject("")
                }}
                className="h-4 w-4"
              />
              <Label
                htmlFor="other"
                className="text-sm font-medium text-gray-900 cursor-pointer"
              >
                Other:
              </Label>
            </div>
            <Input
              value={otherSubject}
              onChange={(e) => setOtherSubject(e.target.value)}
              placeholder="Please specify..."
              className="ml-7 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-800 mb-3 text-lg">What this tells us:</h3>
          <ul className="text-sm text-blue-700 space-y-2">
            <li className="flex items-start">
              <span className="text-blue-600 font-medium mr-2">•</span>
              <span><strong>Academic interests:</strong> Your current subject preferences and strengths</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 font-medium mr-2">•</span>
              <span><strong>Career alignment:</strong> We'll suggest careers that build on your chosen subjects</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 font-medium mr-2">•</span>
              <span><strong>Subject combinations:</strong> How your VCE choices work together</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 font-medium mr-2">•</span>
              <span><strong>Prerequisites:</strong> What you need for specific university courses</span>
            </li>
          </ul>
        </div>

        {selectedSubjects.length > 0 && (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="text-sm text-green-800">
              <strong>Selected:</strong> {selectedSubjects.join(", ")}
            </div>
          </div>
        )}
      </div>
    </QuestionLayout>
  )
} 