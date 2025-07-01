"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useTags } from '@/hooks/useTags'
import { LoadingSpinner } from '@/components/LoadingSpinner'

interface Tag {
  id: string
  name: string
  count: number
}

interface TagFilterProps {
  selectedTags: string[]
  onTagToggle: (tag: string) => void
  className?: string
}

export default function TagFilter({ selectedTags, onTagToggle, className = "" }: TagFilterProps) {
  const { tags, loading, error } = useTags()

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-4 ${className}`}>
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className={`text-center text-red-500 p-4 ${className}`}>
        Error loading tags: {error}
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Filter by Tags</h3>
        {selectedTags.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => selectedTags.forEach(tag => onTagToggle(tag))}
          >
            Clear All
          </Button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Badge
            key={tag.id}
            variant={selectedTags.includes(tag.name) ? "default" : "outline"}
            className={`cursor-pointer transition-colors ${
              selectedTags.includes(tag.name)
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-primary/10'
            }`}
            onClick={() => onTagToggle(tag.name)}
          >
            {tag.name}
            {tag.count > 0 && (
              <span className="ml-1 text-xs opacity-75">({tag.count})</span>
            )}
          </Badge>
        ))}
      </div>
      
      {tags.length === 0 && (
        <p className="text-center text-muted-foreground py-4">
          No tags available
        </p>
      )}
    </div>
  )
} 