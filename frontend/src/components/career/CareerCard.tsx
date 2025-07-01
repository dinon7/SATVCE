"use client"

import { useState } from 'react'
import { motion, PanInfo } from 'framer-motion'
import { 
  Briefcase, 
  DollarSign, 
  TrendingUp, 
  Users, 
  MapPin, 
  GraduationCap,
  Star,
  X,
  Heart
} from 'lucide-react'
import ExpandableBubbleList from './ExpandableBubbleList'

export interface Career {
  title: string
  description: string
  salary_range: string
  job_outlook: string
  required_skills: string[]
  education_requirements: string[]
  industry_tags: string[]
  work_environment: string
  confidence_score: number
  vce_subjects: string[]
}

interface CareerCardProps {
  career: Career
  onSwipe: (direction: 'left' | 'right') => void
  isActive: boolean
}

export default function CareerCard({ career, onSwipe, isActive }: CareerCardProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragEnd = (event: any, info: PanInfo) => {
    setIsDragging(false)
    
    if (info.offset.x > 100) {
      onSwipe('right')
    } else if (info.offset.x < -100) {
      onSwipe('left')
    }
  }

  const getOutlookColor = (outlook: string) => {
    if (outlook.toLowerCase().includes('excellent')) return 'text-green-600'
    if (outlook.toLowerCase().includes('good')) return 'text-blue-600'
    if (outlook.toLowerCase().includes('fair')) return 'text-yellow-600'
    return 'text-gray-600'
  }

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600'
    if (score >= 0.6) return 'text-blue-600'
    return 'text-yellow-600'
  }

  return (
    <motion.div
      className={`relative w-full max-w-sm mx-auto bg-white rounded-2xl shadow-xl overflow-hidden cursor-grab ${
        isActive ? 'z-10' : 'z-0'
      }`}
      style={{ height: '450px' }}
      drag={isActive ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.8}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={handleDragEnd}
      whileHover={{ scale: isActive ? 1.02 : 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {/* Header with confidence score */}
      <div className="relative h-32 bg-gradient-to-br from-blue-500 to-purple-600 p-4">
        <div className="absolute top-3 right-3 flex items-center space-x-1 bg-white/20 backdrop-blur-sm rounded-full px-2 py-1">
          <Star className="w-3 h-3 text-yellow-300" />
          <span className="text-white text-xs font-medium">
            {Math.round(career.confidence_score * 100)}% Match
          </span>
        </div>
        
        <div className="absolute bottom-3 left-3 right-3">
          <h2 className="text-lg font-bold text-white mb-1 line-clamp-1">{career.title}</h2>
          <div className="flex items-center space-x-2 text-white/90">
            <Briefcase className="w-3 h-3" />
            <span className="text-xs">{career.work_environment}</span>
          </div>
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="p-4 h-[318px] overflow-y-auto">
        {/* Description */}
        <p className="text-gray-700 leading-relaxed text-sm mb-4 line-clamp-3">{career.description}</p>

        {/* Key Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-3 h-3 text-green-600 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-500">Salary</p>
              <p className="text-xs font-medium line-clamp-1">{career.salary_range}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-3 h-3 text-blue-600 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-500">Outlook</p>
              <p className={`text-xs font-medium line-clamp-1 ${getOutlookColor(career.job_outlook)}`}>
                {career.job_outlook.split(' - ')[0]}
              </p>
            </div>
          </div>
        </div>

        {/* Required Skills */}
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-gray-800 mb-2">Key Skills</h3>
          <ExpandableBubbleList 
            items={career.required_skills}
            bubbleClassName="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
            limit={3}
          />
        </div>

        {/* VCE Subjects */}
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-gray-800 mb-2">VCE Subjects</h3>
          <ExpandableBubbleList 
            items={career.vce_subjects}
            bubbleClassName="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
            limit={3}
          />
        </div>

        {/* Industry Tags */}
        <div>
          <h3 className="text-xs font-semibold text-gray-800 mb-2">Industry</h3>
          <ExpandableBubbleList
            items={career.industry_tags}
            bubbleClassName="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
            limit={2}
          />
        </div>
      </div>

      {/* Swipe Indicators */}
      {isActive && (
        <>
          {/* Left Swipe (Reject) */}
          <motion.div
            className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-red-500 text-white rounded-full p-2 opacity-0"
            animate={{
              opacity: isDragging ? 1 : 0,
              scale: isDragging ? 1.1 : 1
            }}
          >
            <X className="w-4 h-4" />
          </motion.div>

          {/* Right Swipe (Like) */}
          <motion.div
            className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-green-500 text-white rounded-full p-2 opacity-0"
            animate={{
              opacity: isDragging ? 1 : 0,
              scale: isDragging ? 1.1 : 1
            }}
          >
            <Heart className="w-4 h-4" />
          </motion.div>
        </>
      )}

      {/* Instructions */}
      {isActive && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-center">
          <p className="text-xs text-gray-500 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-full">
            Swipe right to like • Swipe left to pass
          </p>
        </div>
      )}
    </motion.div>
  )
} 