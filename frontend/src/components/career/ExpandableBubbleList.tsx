"use client"

import { useState } from 'react'

interface ExpandableBubbleListProps {
  items: string[]
  limit?: number
  bubbleClassName?: string
  moreButtonClassName?: string
}

export default function ExpandableBubbleList({
  items,
  limit = 3,
  bubbleClassName = "px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full",
  moreButtonClassName = "px-2 py-1 bg-gray-200 text-gray-800 text-xs rounded-full cursor-pointer hover:bg-gray-300",
}: ExpandableBubbleListProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Do not render anything if items is not an array or is empty
  if (!Array.isArray(items) || items.length === 0) {
    return null
  }

  const remainingCount = items.length - limit

  const handleToggle = () => {
    setIsExpanded(!isExpanded)
  }

  const displayedItems = isExpanded ? items : items.slice(0, limit)

  return (
    <div className="flex flex-wrap gap-1 items-center">
      {displayedItems.map((item, index) => (
        <span key={index} className={bubbleClassName}>
          {item}
        </span>
      ))}
      {!isExpanded && items.length > limit && (
        <button onClick={handleToggle} className={moreButtonClassName}>
          +{remainingCount} {remainingCount === 1 ? 'more' : 'more'}
        </button>
      )}
      {isExpanded && items.length > limit && (
        <button onClick={handleToggle} className={moreButtonClassName}>
          Show less
        </button>
      )}
    </div>
  )
} 