import { useState, useEffect } from 'react'
import { useQuiz } from '@/contexts/QuizContext'

interface CareerRecommendation {
  title: string
  description: string
  requiredSkills: string[]
  jobOutlook: string
  salaryRange: string
  educationRequirements: string[]
  confidence: number
  isInterested?: boolean
}

interface QuizResults {
  recommendations: CareerRecommendation[]
  study_resources: string[]
}

export function useQuizResults() {
  const [results, setResults] = useState<QuizResults | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { getAnswers } = useQuiz()

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Get all quiz answers
        const answers = getAnswers()

        // Call the API to get results
        const response = await fetch('/api/quiz/results', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ answers }),
        })

        if (!response.ok) {
          throw new Error('Failed to fetch quiz results')
        }

        const data = await response.json()
        setResults(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching results')
      } finally {
        setIsLoading(false)
      }
    }

    fetchResults()
  }, [getAnswers])

  return {
    results,
    isLoading,
    error,
  }
} 