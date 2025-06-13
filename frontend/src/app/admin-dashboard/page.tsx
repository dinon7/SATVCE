'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface User {
  uid: string
  name: string
  email: string
  hasCompletedQuiz: boolean
  quizAnswers: Record<number, string>
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const { user, userProfile } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    if (!userProfile?.isAdmin) {
      router.push('/dashboard')
      return
    }

    const fetchUsers = async () => {
      try {
        const token = await user.getIdToken()
        const response = await fetch('/api/admin/users', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (!response.ok) {
          throw new Error('Failed to fetch users')
        }
        const data = await response.json()
        setUsers(data)
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to fetch users')
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [user, userProfile, router])

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <div className="flex flex-1 justify-center items-center p-5">
      <div className="flex flex-col w-full max-w-[512px] py-5 max-w-[960px] flex-1">
        <h2 className="text-[#101518] tracking-light text-[28px] font-bold leading-tight px-4 text-center pb-3 pt-5">
          Admin Dashboard
        </h2>

        <div className="flex flex-col gap-4 px-4 py-3 mx-auto">
          {users.map((user) => (
            <div key={user.uid} className="border rounded-lg p-4">
              <p className="text-[#101518] text-base font-medium leading-normal">
                Name: {user.name}
              </p>
              <p className="text-[#101518] text-base font-medium leading-normal">
                Email: {user.email}
              </p>
              <p className="text-[#101518] text-base font-medium leading-normal">
                Quiz Completed: {user.hasCompletedQuiz ? 'Yes' : 'No'}
              </p>
              <button
                onClick={() => router.push(`/admin/users/${user.uid}`)}
                className="mt-2 flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 flex-1 bg-[#0b80ee] text-white text-sm font-bold leading-normal tracking-[0.015em] w-full"
              >
                <span className="truncate">View Details</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 