'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import GlobalLayout from '@/components/GlobalLayout'

interface Subject {
  id: string
  name: string
  description: string
  category: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  prerequisites: string[]
  careers: string[]
  units: {
    unit1: string
    unit2: string
    unit3: string
    unit4: string
  }
  assessment: {
    sacs: string[]
    exam: string
  }
  resources: {
    title: string
    description: string
    url: string
  }[]
}

export default function SubjectDetail() {
  const params = useParams()
  const [subject, setSubject] = useState<Subject | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSubject = async () => {
      try {
        const response = await fetch(`/api/subjects/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setSubject(data)
        }
      } catch (error) {
        console.error('Error fetching subject:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSubject()
  }, [params.id])

  if (loading) {
    return (
      <GlobalLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent" />
            <p className="mt-4 text-lg text-gray-600">Loading subject details...</p>
          </div>
        </div>
      </GlobalLayout>
    )
  }

  if (!subject) {
    return (
      <GlobalLayout>
        <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Subject not found</h2>
            <p className="mt-2 text-gray-600">
              The subject you're looking for doesn't exist or has been removed.
            </p>
            <Link
              href="/subjects"
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Back to Subjects
            </Link>
          </div>
        </div>
      </GlobalLayout>
    )
  }

  return (
    <GlobalLayout>
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/subjects"
            className="text-indigo-600 hover:text-indigo-500 font-medium"
          >
            ← Back to Subjects
          </Link>
          <div className="mt-4 flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{subject.name}</h1>
              <p className="mt-2 text-lg text-gray-600">{subject.description}</p>
            </div>
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
              subject.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
              subject.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {subject.difficulty}
            </span>
          </div>
        </div>

        {/* Units */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Units</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Unit 1</h3>
              <p className="text-gray-600">{subject.units.unit1}</p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Unit 2</h3>
              <p className="text-gray-600">{subject.units.unit2}</p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Unit 3</h3>
              <p className="text-gray-600">{subject.units.unit3}</p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Unit 4</h3>
              <p className="text-gray-600">{subject.units.unit4}</p>
            </div>
          </div>
        </div>

        {/* Assessment */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Assessment</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">School Assessed Coursework (SACs)</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                {subject.assessment.sacs.map((sac, index) => (
                  <li key={index}>{sac}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">End of Year Exam</h3>
              <p className="text-gray-600">{subject.assessment.exam}</p>
            </div>
          </div>
        </div>

        {/* Prerequisites */}
        {subject.prerequisites.length > 0 && (
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Prerequisites</h2>
            <div className="flex flex-wrap gap-2">
              {subject.prerequisites.map((prereq) => (
                <span
                  key={prereq}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
                >
                  {prereq}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Related Careers */}
        {subject.careers.length > 0 && (
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Related Careers</h2>
            <div className="flex flex-wrap gap-2">
              {subject.careers.map((career) => (
                <span
                  key={career}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
                >
                  {career}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Resources */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Study Resources</h2>
          <div className="space-y-4">
            {subject.resources.map((resource, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900">{resource.title}</h3>
                <p className="mt-1 text-gray-600">{resource.description}</p>
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center text-indigo-600 hover:text-indigo-500"
                >
                  Access Resource →
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </GlobalLayout>
  )
} 