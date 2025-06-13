'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function CompleteProfilePage() {
  const router = useRouter()
  const { user, updateUserProfile } = useAuth()
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await updateUserProfile({ name })
      router.push('/dashboard')
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
          Complete Your Profile
        </h2>

        {error && (
          <div className="mx-4 mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3 mx-auto">
            <label className="flex flex-col min-w-40 flex-1">
              <p className="text-[#101518] text-base font-medium leading-normal pb-2">Name</p>
              <input
                type="text"
                placeholder="Enter your name"
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#101518] focus:outline-0 focus:ring-0 border border-[#d4dce2] bg-gray-50 focus:border-[#d4dce2] h-14 placeholder:text-[#5c748a] p-[15px] text-base font-normal leading-normal"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </label>
          </div>

          <div className="flex px-4 py-3 max-w-[480px] mx-auto">
            <button
              type="submit"
              disabled={loading}
              className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 flex-1 bg-[#0b80ee] text-white text-sm font-bold leading-normal tracking-[0.015em] w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="truncate">{loading ? 'Updating...' : 'Complete Profile'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 