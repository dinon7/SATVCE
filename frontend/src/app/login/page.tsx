'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { auth } from '@/lib/firebase'

export default function LoginPage() {
  const router = useRouter()
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const userCredential = await signIn(email, password)
      const token = await userCredential.user.getIdToken()

      // Check if user has completed the quiz
      const response = await fetch('/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch user profile')
      }

      const profile = await response.json()
      
      // Redirect based on quiz completion
      if (profile.hasCompletedQuiz) {
        router.push('/dashboard')
      } else {
        router.push('/quiz')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-1 justify-center items-center p-5">
      <div className="flex flex-col w-full max-w-[512px] py-5 max-w-[960px] flex-1">
        <h2 className="text-[#101518] tracking-light text-[28px] font-bold leading-tight px-4 text-center pb-3 pt-5">
          Welcome back
        </h2>

        {error && (
          <div className="mx-4 mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3 mx-auto">
            <label className="flex flex-col min-w-40 flex-1">
              <p className="text-[#101518] text-base font-medium leading-normal pb-2">Email</p>
              <input
                type="email"
                placeholder="Enter your email"
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#101518] focus:outline-0 focus:ring-0 border border-[#d4dce2] bg-gray-50 focus:border-[#d4dce2] h-14 placeholder:text-[#5c748a] p-[15px] text-base font-normal leading-normal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
          </div>

          <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3 mx-auto">
            <label className="flex flex-col min-w-40 flex-1">
              <p className="text-[#101518] text-base font-medium leading-normal pb-2">Password</p>
              <input
                type="password"
                placeholder="Enter your password"
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#101518] focus:outline-0 focus:ring-0 border border-[#d4dce2] bg-gray-50 focus:border-[#d4dce2] h-14 placeholder:text-[#5c748a] p-[15px] text-base font-normal leading-normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              <span className="truncate">{loading ? 'Logging in...' : 'Login'}</span>
            </button>
          </div>
        </form>

        <div className="flex flex-col gap-2 px-4 py-3 max-w-[480px] mx-auto">
          <Link href="/forgot-password" className="text-[#0b80ee] text-sm hover:underline">
            Forgot your password?
          </Link>
          <Link href="/register" className="flex-1">
            <button
              className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 flex-1 bg-[#eaedf1] text-[#101518] text-sm font-bold leading-normal tracking-[0.015em] w-full"
            >
              <span className="truncate">Don't have an account? Sign Up</span>
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}