"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { CareerCard } from '@/components/CareerCard'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { ErrorMessage } from '@/components/ErrorMessage'
import { api } from '@/lib/api'

interface Career {
  id: string
  title: string
  description: string
  avg_salary: number
  industry: string
  required_skills: string[]
}

export default function CareersPage() {
  const [careers, setCareers] = useState<Career[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { getToken } = useAuth()

  useEffect(() => {
    const fetchCareers = async () => {
      try {
        setLoading(true)
        const token = await getToken()
        const response = await api<Career[]>('/api/v1/careers', { requiresAuth: true }, token || undefined)
        setCareers(response)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An unknown error occurred'
        setError(`Failed to fetch careers: ${message}`)
      } finally {
        setLoading(false)
      }
    }

    fetchCareers()
  }, [getToken])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <ErrorMessage message={error} />
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">Explore Careers</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {careers.map(career => (
            <CareerCard key={career.id} career={career} />
          ))}
        </div>
      </div>
    </div>
  )
}