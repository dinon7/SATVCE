import React from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/quiz/Slider"

interface DynamicQuestionProps {
  question: {
    id: string
    text: string
    type: string
    options?: string[]
    min_value?: number
    max_value?: number
  }
  answer: any
  onAnswer: (answer: any) => void
}

const DynamicQuestion: React.FC<DynamicQuestionProps> = ({ question, answer, onAnswer }) => {
  if (!question) return null

  switch (question.type) {
    case "multiple_choice":
      if (question.options && question.options.length > 0) {
        // Render as radio group (single select)
        return (
          <RadioGroup value={answer || ""} onValueChange={onAnswer} className="space-y-4">
            {question.options.map((option) => (
              <div key={option} className="flex items-center space-x-3">
                <RadioGroupItem value={option} id={option} className="h-5 w-5" />
                <Label htmlFor={option} className="text-base font-medium text-gray-900 cursor-pointer flex-1">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )
      }
      return null
    case "checkbox":
      if (question.options && question.options.length > 0) {
        // Render as checkbox group (multi-select)
        const selected = Array.isArray(answer) ? answer : []
        const handleToggle = (option: string) => {
          if (selected.includes(option)) {
            onAnswer(selected.filter((s) => s !== option))
          } else {
            onAnswer([...selected, option])
          }
        }
        return (
          <div className="space-y-3">
            {question.options.map((option) => (
              <div key={option} className="flex items-center space-x-3">
                <Checkbox
                  id={option}
                  checked={selected.includes(option)}
                  onCheckedChange={() => handleToggle(option)}
                  className="h-5 w-5"
                />
                <Label htmlFor={option} className="text-base font-medium text-gray-900 cursor-pointer flex-1">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        )
      }
      return null
    case "slider":
      return (
        <div className="py-6">
          <Slider
            min={question.min_value || 0}
            max={question.max_value || 10}
            value={typeof answer === "number" ? answer : (question.min_value || 0)}
            onValueChange={onAnswer}
          />
        </div>
      )
    case "text":
    case "short_answer":
      return (
        <Textarea
          value={answer || ""}
          onChange={(e) => onAnswer(e.target.value)}
          placeholder="Type your answer here..."
          className="min-h-[100px] px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          maxLength={500}
        />
      )
    default:
      return <div>Unsupported question type: {question.type}</div>
  }
}

export default DynamicQuestion 