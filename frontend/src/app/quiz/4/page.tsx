"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useQuiz } from "@/contexts/QuizContext"
import QuestionLayout from "@/components/quiz/QuestionLayout"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const taskOptions = [
  { id: "puzzles", label: "Solving puzzles and logical problems" },
  { id: "helping", label: "Helping others or providing support" },
  { id: "designing", label: "Designing, drawing, or creating things" },
  { id: "writing", label: "Writing, reading, or storytelling" },
  { id: "numbers", label: "Working with numbers or spreadsheets" },
  { id: "organising", label: "Organising events or managing tasks" },
  { id: "building", label: "Building or fixing mechanical things" },
  { id: "technology", label: "Using or making technology" },
]

export default function Question4() {
  const router = useRouter()
  const { setAnswer, isAnswered, getAnswer } = useQuiz()
  const [selectedTasks, setSelectedTasks] = useState<string[]>([])
  const [otherTask, setOtherTask] = useState("")

  const currentAnswer = getAnswer(4)
  
  // Initialize form with existing answer if available
  useEffect(() => {
    if (currentAnswer?.answer && typeof currentAnswer.answer === 'object' && 'selected' in currentAnswer.answer) {
      const answer = currentAnswer.answer as { selected: string[]; other: string }
      setSelectedTasks(answer.selected || [])
      setOtherTask(answer.other || "")
    }
  }, [currentAnswer])

  const handleTaskToggle = (taskId: string) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    )
  }

  const isQuestionAnswered = selectedTasks.length > 0 || otherTask.trim() !== ""

  const handleNext = () => {
    setAnswer({
      questionId: 4,
      answer: {
        selected: selectedTasks,
        other: otherTask.trim(),
      },
    })
    router.push("/quiz/5")
  }

  return (
    <QuestionLayout
      questionId={4}
      title="Which of the following tasks do you enjoy?"
      description="Select all that apply"
      onNext={handleNext}
      isAnswered={isQuestionAnswered}
    >
      <div className="space-y-6">
        <div className="space-y-4">
          {taskOptions.map((task) => (
            <div key={task.id} className="flex items-center space-x-3">
              <Checkbox
                id={task.id}
                checked={selectedTasks.includes(task.id)}
                onCheckedChange={() => handleTaskToggle(task.id)}
                className="h-5 w-5"
              />
              <Label
                htmlFor={task.id}
                className="text-base font-medium text-gray-900 cursor-pointer flex-1"
              >
                {task.label}
              </Label>
            </div>
          ))}
          
          <div className="space-y-3 pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="other"
                checked={otherTask.trim() !== ""}
                onCheckedChange={(checked) => {
                  if (!checked) setOtherTask("")
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
              value={otherTask}
              onChange={(e) => setOtherTask(e.target.value)}
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
              <span><strong>Task preferences:</strong> These indicate your natural strengths and interests</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 font-medium mr-2">•</span>
              <span><strong>Career alignment:</strong> We'll match you with careers that involve these activities</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 font-medium mr-2">•</span>
              <span><strong>Work satisfaction:</strong> Jobs that include these tasks are likely to be more enjoyable for you</span>
            </li>
          </ul>
        </div>
      </div>
    </QuestionLayout>
  )
} 