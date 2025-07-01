'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { useUser, useAuth as useClerkAuth } from '@clerk/nextjs'

interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  isAdmin?: boolean
}

interface UserProfile {
  id: string
  email: string
  firstName?: string
  lastName?: string
  yearLevel?: number
  isAdmin?: boolean
  preferences?: {
    exportAsPdf: boolean
    notifications: boolean
    emailUpdates: boolean
    darkMode: boolean
  }
}

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  isAuthenticated: boolean
  getToken: () => Promise<string | null>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user: clerkUser, isLoaded } = useUser()
  const { getToken } = useClerkAuth()

  // Transform Clerk user to our User interface
  const user: User | null = clerkUser ? {
    id: clerkUser.id,
    email: clerkUser.emailAddresses[0]?.emailAddress || '',
    firstName: clerkUser.firstName || undefined,
    lastName: clerkUser.lastName || undefined,
    isAdmin: clerkUser.publicMetadata?.isAdmin as boolean || false
  } : null

  // For now, userProfile is the same as user
  // In a real app, you might fetch additional profile data from your backend
  const userProfile: UserProfile | null = user ? {
    ...user,
    yearLevel: 11, // Default value
    preferences: {
      exportAsPdf: false,
      notifications: true,
      emailUpdates: true,
      darkMode: false
    }
  } : null

  const value: AuthContextType = {
    user,
    userProfile,
    loading: !isLoaded,
    isAuthenticated: !!user,
    getToken
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 