import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { enhancedApi } from '@/lib/enhanced-api'

interface Tag {
  id: string
  name: string
  count: number
}

interface UseTagsReturn {
  tags: Tag[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  fallback: boolean
}

// Fallback tags for when backend is unavailable
const fallbackTags: Tag[] = [
  { id: '1', name: 'study skills', count: 0 },
  { id: '2', name: 'vcaa', count: 0 },
  { id: '3', name: 'planning', count: 0 },
  { id: '4', name: 'careers', count: 0 },
  { id: '5', name: 'university', count: 0 },
  { id: '6', name: 'atar', count: 0 }
]

export function useTags(): UseTagsReturn {
  const [tags, setTags] = useState<Tag[]>(fallbackTags)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fallback, setFallback] = useState(false)
  const { getToken } = useAuth()

  const fetchTags = async () => {
    try {
      setLoading(true)
      setError(null)
      setFallback(false)
      
      const response = await enhancedApi.get<Tag[]>(
        '/api/v1/resources/tags',
        fallbackTags,
        'resource-tags'
      )

      if (response.data) {
        setTags(response.data)
        setFallback(response.fallback)
        
        if (response.fallback) {
          console.warn('Using fallback tags - backend unavailable')
        }
      } else if (response.error) {
        setError(response.error)
        setFallback(true)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch tags'
      setError(errorMessage)
      setFallback(true)
      console.error('Error fetching tags:', err)
    } finally {
      setLoading(false)
    }
  }

  const refetch = async () => {
    await fetchTags()
  }

  useEffect(() => {
    fetchTags()
  }, [])

  return {
    tags,
    loading,
    error,
    refetch,
    fallback
  }
} 