"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import CareerCard, { Career } from './CareerCard'
import { Button } from '@/components/ui/button'
import { 
  Heart, 
  X, 
  ArrowRight, 
  CheckCircle,
  TrendingUp,
  Users
} from 'lucide-react'

interface CareerSwipeProps {
  careers: Career[]
  onComplete: (selectedCareers: Career[], rejectedCareers: Career[]) => void
}

export default function CareerSwipe({ careers, onComplete }: CareerSwipeProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedCareers, setSelectedCareers] = useState<Career[]>([])
  const [rejectedCareers, setRejectedCareers] = useState<Career[]>([])
  const [isComplete, setIsComplete] = useState(false)
  const [showProgress, setShowProgress] = useState(false)

  const currentCareer = careers[currentIndex]
  const progress = (currentIndex / careers.length) * 100

  const handleSwipe = (direction: 'left' | 'right') => {
    if (!currentCareer) return

    if (direction === 'right') {
      setSelectedCareers(prev => [...prev, currentCareer])
    } else {
      setRejectedCareers(prev => [...prev, currentCareer])
    }

    // Move to next career
    if (currentIndex < careers.length - 1) {
      setCurrentIndex(prev => prev + 1)
    } else {
      // All careers have been swiped
      setIsComplete(true)
      onComplete(selectedCareers, rejectedCareers)
    }
  }

  const handleSkip = () => {
    handleSwipe('left')
  }

  const handleLike = () => {
    handleSwipe('right')
  }

  useEffect(() => {
    // Show progress after first swipe
    if (currentIndex > 0) {
      setShowProgress(true)
    }
  }, [currentIndex])

  if (isComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-6 max-w-sm mx-auto"
      >
        <div className="flex justify-center">
          <CheckCircle className="w-16 h-16 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">
          Career Matching Complete!
        </h2>
        <p className="text-gray-600">
          You've reviewed {careers.length} career options and selected {selectedCareers.length} that interest you.
        </p>
        
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Heart className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Liked</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{selectedCareers.length}</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <X className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-800">Passed</span>
            </div>
            <p className="text-2xl font-bold text-gray-600">{rejectedCareers.length}</p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">Progress</span>
            </div>
            <p className="text-2xl font-bold text-purple-600">{Math.round(progress)}%</p>
          </div>
        </div>

        <Button
          onClick={() => window.location.href = '/dashboard'}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
        >
          View Your Dashboard
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </motion.div>
    )
  }

  return (
    <div className="relative w-full max-w-sm mx-auto">
      {/* Progress Bar */}
      {showProgress && (
        <div className="absolute top-0 left-0 right-0 z-20 px-4 pt-2">
          <div className="w-full bg-gray-200/70 rounded-full h-1.5">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-1.5 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
            />
          </div>
        </div>
      )}

      {/* Career Cards Stack - Constrained height */}
      <div className="relative h-[500px] flex items-center justify-center pt-8">
        <AnimatePresence>
          {careers.map((career, index) => {
            const isActive = index === currentIndex
            const isNext = index === currentIndex + 1
            
            if (index < currentIndex) return null

            return (
              <motion.div
                key={career.title}
                className={`absolute inset-0 ${isActive ? 'z-10' : 'z-0'}`}
                initial={isActive ? { 
                  opacity: 0, 
                  scale: 0.8, 
                  rotateY: -15 
                } : { 
                  opacity: 0.7, 
                  scale: 0.9, 
                  y: 20 
                }}
                animate={isActive ? { 
                  opacity: 1, 
                  scale: 1, 
                  rotateY: 0 
                } : { 
                  opacity: 0.7, 
                  scale: 0.9, 
                  y: 20 
                }}
                exit={{ 
                  opacity: 0, 
                  scale: 0.8, 
                  x: index < currentIndex ? -300 : 300,
                  rotate: index < currentIndex ? -15 : 15
                }}
                transition={{ 
                  type: 'spring', 
                  stiffness: 300, 
                  damping: 30 
                }}
              >
                <CareerCard
                  career={career}
                  onSwipe={handleSwipe}
                  isActive={isActive}
                />
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Action Buttons - Fixed at bottom */}
      <div className="flex justify-center items-center space-x-6 mt-6">
        <Button
          onClick={handleSkip}
          variant="outline"
          size="lg"
          className="w-16 h-16 rounded-full border-2 border-red-300 hover:border-red-500 hover:bg-red-50"
        >
          <X className="w-8 h-8 text-red-500" />
        </Button>

        <Button
          onClick={handleLike}
          size="lg"
          className="w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
        >
          <Heart className="w-8 h-8 text-white" />
        </Button>
      </div>

      {/* Instructions */}
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-500">
          Swipe right to like • Swipe left to pass • Or use the buttons below
        </p>
      </div>
    </div>
  )
} 