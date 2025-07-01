import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { useToast } from '@/components/ui/use-toast'
import { enhancedApi } from '@/lib/enhanced-api'

interface SavedItems {
  subjects: string[]
  careers: string[]
}

interface UseSavedItemsReturn {
  savedItems: SavedItems
  loading: boolean
  error: string | null
  removeSubject: (subject: string) => Promise<void>
  removeCareer: (career: string) => Promise<void>
  refetch: () => Promise<void>
  fallback: boolean
}

// Fallback data for when backend is unavailable
const fallbackSavedItems: SavedItems = {
  subjects: [],
  careers: []
}

export function useSavedItems(): UseSavedItemsReturn {
  const [savedItems, setSavedItems] = useState<SavedItems>(fallbackSavedItems)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fallback, setFallback] = useState(false)
  const { getToken } = useAuth()
  const { toast } = useToast()

  const fetchSavedItems = async () => {
    try {
      setLoading(true)
      setError(null)
      setFallback(false)
      
      const response = await enhancedApi.get<SavedItems>(
        '/api/v1/saved-items',
        fallbackSavedItems,
        'saved-items'
      )

      if (response.data) {
        setSavedItems(response.data)
        setFallback(response.fallback)
        
        if (response.fallback) {
          toast({
            title: "Offline Mode",
            description: "Using cached data - backend unavailable",
            variant: "default",
          })
        }
      } else if (response.error) {
        setError(response.error)
        setFallback(true)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch saved items'
      setError(errorMessage)
      setFallback(true)
      console.error('Error fetching saved items:', err)
    } finally {
      setLoading(false)
    }
  }

  const removeSubject = async (subject: string) => {
    try {
      const response = await enhancedApi.delete<{ success: boolean }>(
        `/api/v1/saved-items/subjects/${encodeURIComponent(subject)}`
      )

      if (response.data?.success || response.fallback) {
        // Update local state
        setSavedItems(prev => ({
          ...prev,
          subjects: prev.subjects.filter(s => s !== subject)
        }))

        toast({
          title: "Subject Removed",
          description: `${subject} has been removed from your saved subjects.`,
        })

        if (response.fallback) {
          toast({
            title: "Offline Mode",
            description: "Changes will be synced when backend is available",
            variant: "default",
          })
        }
      } else {
        throw new Error(response.error || 'Failed to remove subject')
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to remove subject',
        variant: "destructive",
      })
    }
  }

  const removeCareer = async (career: string) => {
    try {
      const response = await enhancedApi.delete<{ success: boolean }>(
        `/api/v1/saved-items/careers/${encodeURIComponent(career)}`
      )

      if (response.data?.success || response.fallback) {
        // Update local state
        setSavedItems(prev => ({
          ...prev,
          careers: prev.careers.filter(c => c !== career)
        }))

        toast({
          title: "Career Removed",
          description: `${career} has been removed from your saved careers.`,
        })

        if (response.fallback) {
          toast({
            title: "Offline Mode",
            description: "Changes will be synced when backend is available",
            variant: "default",
          })
        }
      } else {
        throw new Error(response.error || 'Failed to remove career')
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to remove career',
        variant: "destructive",
      })
    }
  }

  const refetch = async () => {
    await fetchSavedItems()
  }

  useEffect(() => {
    fetchSavedItems()
  }, [])

  return {
    savedItems,
    loading,
    error,
    removeSubject,
    removeCareer,
    refetch,
    fallback
  }
} 