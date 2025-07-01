"use client"

import React, { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'

interface RankingItemProps {
  id: string
  children: React.ReactNode
  index: number
}

function RankingItem({ id, children, index }: RankingItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center p-3 border rounded-lg transition-all duration-200 ${
        isDragging
          ? 'bg-blue-50 border-blue-300 shadow-lg scale-105'
          : 'bg-white border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">
        {index + 1}
      </div>
      <div className="flex-1 text-gray-700">{children}</div>
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <GripVertical size={16} />
      </div>
    </div>
  )
}

interface RankingQuestionProps {
  items: string[]
  value: string[]
  onChange: (value: string[]) => void
  disabled?: boolean
}

export default function RankingQuestion({ items, value, onChange, disabled = false }: RankingQuestionProps) {
  const [rankedItems, setRankedItems] = useState<string[]>(value.length > 0 ? value : items)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      setRankedItems((items) => {
        const oldIndex = items.indexOf(active.id as string)
        const newIndex = items.indexOf(over?.id as string)

        const newItems = arrayMove(items, oldIndex, newIndex)
        onChange(newItems)
        return newItems
      })
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 mb-4">
        Drag and drop to rank these items by importance (most important at the top):
      </p>
      
      {disabled ? (
        <div className="space-y-2">
          {rankedItems.map((item, index) => (
            <div
              key={item}
              className="flex items-center p-3 border rounded-lg bg-gray-50 border-gray-200"
            >
              <div className="w-8 h-8 bg-gray-400 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">
                {index + 1}
              </div>
              <div className="flex-1 text-gray-700">{item}</div>
            </div>
          ))}
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={rankedItems} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {rankedItems.map((item, index) => (
                <RankingItem key={item} id={item} index={index}>
                  {item}
                </RankingItem>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <div className="text-xs text-gray-500 mt-4">
        {disabled ? "Ranking is disabled" : "💡 Drag the grip handle to reorder items. The top item is most important."}
      </div>
    </div>
  )
} 