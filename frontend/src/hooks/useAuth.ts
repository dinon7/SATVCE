import { useUser, useAuth as useClerkAuth } from '@clerk/nextjs'
import { useState, useEffect } from 'react'

interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  isAdmin?: boolean
}

interface AuthContextType {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  getToken: () => Promise<string | null>
}

export function useAuth(): AuthContextType {
  const { user: clerkUser, isLoaded } = useUser()
  const { getToken } = useClerkAuth()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isLoaded) {
      if (clerkUser) {
        // Transform Clerk user to our User interface
        const transformedUser: User = {
          id: clerkUser.id,
          email: clerkUser.emailAddresses[0]?.emailAddress || '',
          firstName: clerkUser.firstName || undefined,
          lastName: clerkUser.lastName || undefined,
          isAdmin: clerkUser.publicMetadata?.isAdmin as boolean || false
        }
        setUser(transformedUser)
      } else {
        setUser(null)
      }
      setLoading(false)
    }
  }, [clerkUser, isLoaded])

  return {
    user,
    loading: !isLoaded || loading,
    isAuthenticated: !!user,
    getToken
  }
} 