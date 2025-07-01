"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useQuiz } from "@/contexts/QuizContext"
import QuestionLayout from "@/components/quiz/QuestionLayout"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import {
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical } from "lucide-react"

interface SortableItemProps {
  id: string
  children: React.ReactNode
}

function SortableItem({ id, children }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-move"
      {...attributes}
      {...listeners}
    >
      <GripVertical className="h-5 w-5 text-gray-400" />
      {children}
    </div>
  )
}

export default function Question3() {
  const router = useRouter()
  const { setAnswer, isAnswered, getAnswer } = useQuiz()
  
  const [items, setItems] = useState([
    { id: "passion", label: "Passion", description: "Doing what you love" },
    { id: "flexibility", label: "Flexibility", description: "Work schedule and location options" },
    { id: "job-security", label: "Job Security", description: "Stable employment" },
    { id: "work-life-balance", label: "Work-Life Balance", description: "Time for personal life" },
    { id: "salary", label: "Salary", description: "Financial compensation" },
  ])

  const currentAnswer = getAnswer(3)
  
  // Initialize form with existing answer if available
  useEffect(() => {
    if (currentAnswer?.answer && Array.isArray(currentAnswer.answer)) {
      // Reconstruct the order based on saved ranking
      const savedRanking = currentAnswer.answer as string[]
      const reorderedItems = savedRanking.map(id => 
        items.find(item => item.id === id)
      ).filter(Boolean) as typeof items
      setItems(reorderedItems)
    }
  }, [currentAnswer])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function handleDragEnd(event: any) {
    const { active, over } = event

    if (active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id)
        const newIndex = items.findIndex(item => item.id === over.id)

        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const isQuestionAnswered = items.length === 5

  const handleNext = () => {
    setAnswer({
      questionId: 3,
      answer: items.map(item => item.id),
    })
    router.push("/quiz/4")
  }

  return (
    <QuestionLayout
      questionId={3}
      title="Rank the following in order of importance to you in a career"
      description="Drag and drop to reorder. 1 = most important, 5 = least important"
      onNext={handleNext}
      isAnswered={isQuestionAnswered}
    >
      <div className="space-y-6">
        <div className="space-y-3">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={items.map(item => item.id)} strategy={verticalListSortingStrategy}>
              {items.map((item, index) => (
                <SortableItem key={item.id} id={item.id}>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{item.label}</div>
                        <div className="text-sm text-gray-600">{item.description}</div>
                      </div>
                    </div>
                  </div>
                </SortableItem>
              ))}
            </SortableContext>
          </DndContext>
        </div>

        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-800 mb-3 text-lg">What this tells us:</h3>
          <ul className="text-sm text-blue-700 space-y-2">
            <li className="flex items-start">
              <span className="text-blue-600 font-medium mr-2">•</span>
              <span><strong>Top priorities:</strong> These will heavily influence our career recommendations</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 font-medium mr-2">•</span>
              <span><strong>Lower priorities:</strong> These are still important but may be more flexible</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 font-medium mr-2">•</span>
              <span><strong>Balance:</strong> We'll help you find careers that match your top priorities</span>
            </li>
          </ul>
        </div>
      </div>
    </QuestionLayout>
  )
} 