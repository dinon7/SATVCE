'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function ResultsPage() {
  const router = useRouter()
  const { user, userProfile } = useAuth()
  const [recommendations, setRecommendations] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    if (!userProfile?.hasCompletedQuiz) {
      router.push('/quiz')
      return
    }

    // Generate recommendations based on quiz answers
    const generateRecommendations = () => {
      const answers = userProfile.quizAnswers
      const recs: string[] = []

      if (answers[0] === 'Math') {
        recs.push('Consider a career in Engineering or Data Science.')
      } else if (answers[0] === 'Science') {
        recs.push('Consider a career in Medicine or Research.')
      } else if (answers[0] === 'History') {
        recs.push('Consider a career in Law or Education.')
      } else if (answers[0] === 'Literature') {
        recs.push('Consider a career in Writing or Publishing.')
      }

      if (answers[1] === 'Visual') {
        recs.push('You might enjoy careers in Design or Architecture.')
      } else if (answers[1] === 'Auditory') {
        recs.push('You might enjoy careers in Music or Broadcasting.')
      } else if (answers[1] === 'Reading/Writing') {
        recs.push('You might enjoy careers in Journalism or Editing.')
      } else if (answers[1] === 'Kinesthetic') {
        recs.push('You might enjoy careers in Sports or Physical Therapy.')
      }

      setRecommendations(recs)
      setLoading(false)
    }

    generateRecommendations()
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
          Your Results
        </h2>

        <div className="flex flex-col gap-4 px-4 py-3 mx-auto">
          {recommendations.map((rec, index) => (
            <p key={index} className="text-[#101518] text-base font-medium leading-normal">
              {rec}
            </p>
          ))}
        </div>

        <div className="flex px-4 py-3 max-w-[480px] mx-auto">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 flex-1 bg-[#0b80ee] text-white text-sm font-bold leading-normal tracking-[0.015em] w-full"
          >
            <span className="truncate">Go to Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  )
} 