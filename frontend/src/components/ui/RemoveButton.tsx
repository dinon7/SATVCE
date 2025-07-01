"use client"

import React, { useState } from 'react'
import { Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'

interface RemoveButtonProps {
  onRemove: () => Promise<void>
  itemName: string
  itemType: 'subject' | 'career'
  size?: 'sm' | 'default' | 'lg' | 'icon'
  variant?: 'icon' | 'button'
  className?: string
}

export default function RemoveButton({ 
  onRemove, 
  itemName, 
  itemType, 
  size = 'default',
  variant = 'icon',
  className = ""
}: RemoveButtonProps) {
  const [isRemoving, setIsRemoving] = useState(false)
  const { toast } = useToast()

  const handleRemove = async () => {
    // Prevent multiple clicks while removal is in progress
    if (isRemoving) return

    setIsRemoving(true)
    try {
      await onRemove()
      // The toast is already handled in the useSavedItems hook
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to remove ${itemType}. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setIsRemoving(false)
    }
  }

  if (variant === 'button') {
    return (
      <Button
        variant="outline"
        size={size}
        onClick={handleRemove}
        disabled={isRemoving}
        className={`text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 ${className}`}
      >
        {isRemoving ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
        ) : (
          <Trash2 size={size === 'sm' ? 14 : 16} />
        )}
        <span className="ml-2">Remove</span>
      </Button>
    )
  }

  // Icon variant
  return (
    <button
      onClick={handleRemove}
      disabled={isRemoving}
      className={`text-gray-400 hover:text-red-600 transition-colors p-1 rounded-full hover:bg-red-50 disabled:opacity-50 ${className}`}
      title={`Remove ${itemName}`}
    >
      {isRemoving ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
      ) : (
        <X size={16} />
      )}
    </button>
  )
}