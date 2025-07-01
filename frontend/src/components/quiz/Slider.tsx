"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"
import { cn } from "@/lib/utils"

export interface SliderProps {
  min: number
  max: number
  step?: number
  value: number
  onChange: (value: number) => void
  labels?: string[]
  className?: string
}

export function Slider({
  min,
  max,
  step = 1,
  value,
  onChange,
  labels,
  className,
}: SliderProps) {
  return (
    <div className="space-y-4">
      <SliderPrimitive.Root
        className={cn(
          "relative flex w-full touch-none select-none items-center",
          className
        )}
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={([newValue]: number[]) => onChange(newValue)}
      >
        {/*
          Use a clearly visible track color for both light and dark mode.
          Place bg-gray-300 and dark:bg-gray-700 at the end to override any theme classes.
        */}
        <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary bg-gray-300 dark:bg-gray-700">
          {/*
            Use a visible accent color for the range (filled part of the track).
            Place bg-blue-500 at the end to override any theme classes.
          */}
          <SliderPrimitive.Range className="absolute h-full bg-primary bg-blue-500" />
        </SliderPrimitive.Track>
        {/*
          Make the thumb clearly visible: blue background, white border, and focus ring for accessibility.
          Place bg-blue-500 and border-white at the end to override any theme classes.
        */}
        <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-500 border-white" />
      </SliderPrimitive.Root>
      {labels && (
        <div className="flex justify-between text-sm text-muted-foreground">
          {labels.map((label, index) => (
            <span key={index}>{label}</span>
          ))}
        </div>
      )}
      <div className="text-center text-sm font-medium">
        Current value: {value}
      </div>
    </div>
  )
} 