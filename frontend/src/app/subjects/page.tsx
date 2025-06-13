'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { animations } from '@/styles/animations'
import { OptimizedImage } from '@/components/ui/OptimizedImage'

// Define the subject data structure
interface Subject {
  id: string
  title: string
  description: string
  atar_scaling: number
  difficulty_rating: number
  related_careers: string[]
  popularity_score: number
  prerequisites: string[]
  recommended_subjects: string[]
}

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await fetch('/api/subjects')
        if (!response.ok) throw new Error('Failed to fetch subjects')
        const data = await response.json()
        setSubjects(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchSubjects()
  }, [])

  // Filter subjects based on search term
  const filteredSubjects = subjects.filter(subject =>
    subject.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="px-40 flex flex-1 justify-center py-5">
      <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
        {/* Page Header */}
        <div className="flex flex-wrap justify-between gap-3 p-4">
          <div className="flex min-w-72 flex-col gap-3">
            <p className="text-[#0d151c] tracking-light text-[32px] font-bold leading-tight">Subject Descriptions</p>
            <p className="text-[#49749c] text-sm font-normal leading-normal">
              Explore detailed information about each subject to make informed decisions.
            </p>
          </div>
          {/* Search Input */}
          <div className="flex items-center">
            <input
              type="text"
              placeholder="Search subjects..."
              className="px-4 py-2 border border-gray-300 rounded-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Subject Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSubjects.map((subject, index) => (
            <motion.div
              key={subject.id}
              className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
              initial="initial"
              animate="animate"
              variants={animations.fade.in}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={`/subjects/${subject.id}`}>
                <div className="relative h-48 bg-gray-100 rounded-t-lg">
                  <OptimizedImage
                    src={`/images/subjects/${subject.id}.jpg`}
                    alt={subject.title}
                    fill
                    quality={85}
                    className="object-cover rounded-t-lg"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {subject.title}
                  </h3>
                  <p className="text-gray-600">
                    {subject.description}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
} 