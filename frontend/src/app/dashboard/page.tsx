'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function DashboardPage() {
  const router = useRouter()
  const { user, userProfile, updateUserProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(userProfile?.name || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSave = async () => {
    setLoading(true)
    setError(null)

    try {
      await updateUserProfile({ name })
      setIsEditing(false)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    router.push('/login')
    return null
  }

  return (
    <div className="flex flex-1 justify-center items-center p-5">
      <div className="flex flex-col w-full max-w-[512px] py-5 max-w-[960px] flex-1">
        <h2 className="text-[#101518] tracking-light text-[28px] font-bold leading-tight px-4 text-center pb-3 pt-5">
          Dashboard
        </h2>

        {error && (
          <div className="mx-4 mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-4 px-4 py-3 mx-auto">
          <p className="text-[#101518] text-base font-medium leading-normal">
            Welcome, {isEditing ? (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#101518] focus:outline-0 focus:ring-0 border border-[#d4dce2] bg-gray-50 focus:border-[#d4dce2] h-14 placeholder:text-[#5c748a] p-[15px] text-base font-normal leading-normal"
              />
            ) : (
              userProfile?.name
            )}
          </p>
          <p className="text-[#101518] text-base font-medium leading-normal">
            Email: {user.email}
          </p>
          <p className="text-[#101518] text-base font-medium leading-normal">
            Quiz Completed: {userProfile?.hasCompletedQuiz ? 'Yes' : 'No'}
          </p>
        </div>

        <div className="flex px-4 py-3 max-w-[480px] mx-auto">
          {isEditing ? (
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 flex-1 bg-[#0b80ee] text-white text-sm font-bold leading-normal tracking-[0.015em] w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="truncate">{loading ? 'Saving...' : 'Save'}</span>
            </button>
          ) : (
            <button
              onClick={handleEdit}
              className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 flex-1 bg-[#eaedf1] text-[#101518] text-sm font-bold leading-normal tracking-[0.015em] w-full"
            >
              <span className="truncate">Edit Profile</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
} 