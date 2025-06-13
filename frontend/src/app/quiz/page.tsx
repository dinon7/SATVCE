'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

const questions = [
  {
    id: 1,
    question: 'What is your favorite subject?',
    options: ['Math', 'Science', 'History', 'Literature'],
  },
  {
    id: 2,
    question: 'What is your preferred learning style?',
    options: ['Visual', 'Auditory', 'Reading/Writing', 'Kinesthetic'],
  },
  // Add more questions as needed
]

export default function QuizPage() {
  const router = useRouter()
  const { user, updateUserProfile } = useAuth()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAnswer = (answer: string) => {
    setAnswers({ ...answers, [currentQuestion]: answer })
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      handleSubmit()
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)

    try {
      await updateUserProfile({ hasCompletedQuiz: true, quizAnswers: answers })
      router.push('/dashboard')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to submit quiz')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    router.push('/login')
    return null
  }

  const question = questions[currentQuestion]

  return (
    <div className="flex flex-1 justify-center items-center p-5">
      <div className="flex flex-col w-full max-w-[512px] py-5 max-w-[960px] flex-1">
        <h2 className="text-[#101518] tracking-light text-[28px] font-bold leading-tight px-4 text-center pb-3 pt-5">
          Quiz
        </h2>

        {error && (
          <div className="mx-4 mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-4 px-4 py-3 mx-auto">
          <p className="text-[#101518] text-base font-medium leading-normal">
            {question.question}
          </p>
          {question.options.map((option) => (
            <button
              key={option}
              onClick={() => handleAnswer(option)}
              className={`flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 flex-1 ${
                answers[currentQuestion] === option ? 'bg-[#0b80ee] text-white' : 'bg-[#eaedf1] text-[#101518]'
              } text-sm font-bold leading-normal tracking-[0.015em] w-full`}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="flex px-4 py-3 max-w-[480px] mx-auto">
          <button
            onClick={handleNext}
            disabled={loading || !answers[currentQuestion]}
            className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 flex-1 bg-[#0b80ee] text-white text-sm font-bold leading-normal tracking-[0.015em] w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="truncate">
              {loading ? 'Submitting...' : currentQuestion < questions.length - 1 ? 'Next' : 'Submit'}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
} 