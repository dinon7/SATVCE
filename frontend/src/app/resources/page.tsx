'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import GlobalLayout from '@/components/GlobalLayout'
import TagFilter from '@/components/ui/TagFilter'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { ErrorMessage } from '@/components/ErrorMessage'

interface Resource {
  id: string
  title: string
  description: string
  url: string
  type: string
  tags: string[]
}

export default function ResourcesPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in')
    }
  }, [isLoaded, user, router])

  useEffect(() => {
    const fetchResources = async () => {
      if (!user) return

      try {
        setLoading(true)
        const response = await fetch('/api/resources')
        
        if (!response.ok) {
          throw new Error('Failed to fetch resources')
        }

        const data = await response.json()
        setResources(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch resources')
      } finally {
        setLoading(false)
      }
    }

    fetchResources()
  }, [user])

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const filteredResources = resources.filter(resource => {
    if (selectedTags.length === 0) return true
    return selectedTags.some(tag => resource.tags?.includes(tag))
  })

  if (!isLoaded) {
    return <div>Loading...</div>
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return <ErrorMessage message={error} />
  }

  return (
    <GlobalLayout>
      <div className="px-40 flex flex-1 justify-center py-5">
        <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
          {/* Page Header */}
          <div className="flex flex-wrap justify-between gap-3 p-4">
            <p className="text-[#101518] tracking-light text-[32px] font-bold leading-tight min-w-72">Resources</p>
          </div>

          {/* Tag Filter */}
          <div className="px-4 pb-4">
            <TagFilter
              selectedTags={selectedTags}
              onTagToggle={handleTagToggle}
            />
          </div>

          {/* Resources List */}
          <div className="space-y-4 px-4">
            {filteredResources.length > 0 ? (
              filteredResources.map((resource) => (
                <div key={resource.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {resource.title}
                      </h3>
                      <p className="text-gray-600 mb-3">
                        {resource.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {resource.tags?.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        View Resource →
                      </a>
                    </div>
                    <span className="ml-4 px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                      {resource.type}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  {selectedTags.length > 0 
                    ? 'No resources match the selected tags.'
                    : 'No resources available.'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </GlobalLayout>
  )
} 