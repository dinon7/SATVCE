'use client'

import { useState, useEffect } from 'react'
import { useUser, useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { ErrorMessage } from '@/components/ErrorMessage'
import CareerSwipe from '@/components/career/CareerSwipe'
import { Career } from '@/components/career/CareerCard'
import { motion } from 'framer-motion'
import { 
  Sparkles, 
  ArrowLeft,
  Heart,
  X,
  CheckCircle,
  TrendingUp
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function CareerMatchingPage() {
  const { user, isLoaded } = useUser()
  const { getToken } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<any>(null)
  const [selectedCareers, setSelectedCareers] = useState<Career[]>([])
  const [rejectedCareers, setRejectedCareers] = useState<Career[]>([])

  useEffect(() => {
    if (isLoaded) {
      fetchResults()
    }
  }, [isLoaded])

  const fetchResults = async () => {
    try {
      setLoading(true)
      
      // Try to get results from localStorage first
      const storedResults = localStorage.getItem('quizResults')
      if (storedResults) {
        const parsedResults = JSON.parse(storedResults)
        setResults(parsedResults)
        setLoading(false)
        return
      }

      // If no stored results, try to fetch from API
      const token = await getToken()
      if (!token) {
        setError('Authentication required')
        setLoading(false)
        return
      }

      // Try to generate results from stored answers
      await generateResultsFromAnswers(token)
    } catch (err) {
      console.error('Error fetching results:', err)
      setError('Failed to load career recommendations')
      setLoading(false)
    }
  }

  const generateResultsFromAnswers = async (token: string | null) => {
    try {
      // Get stored quiz answers
      const storedAnswers = localStorage.getItem('quizAnswers')
      if (!storedAnswers) {
        setError('No quiz answers found. Please complete the quiz first.')
        setLoading(false)
        return
      }

      const answers = JSON.parse(storedAnswers)
      
      // Call API to generate results
      const response = await fetch('/api/quiz/generate-results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(answers)
      })

      if (!response.ok) {
        throw new Error('Failed to generate results')
      }

      const generatedResults = await response.json()
      setResults(generatedResults)
      
      // Store results in localStorage
      localStorage.setItem('quizResults', JSON.stringify(generatedResults))
    } catch (err) {
      console.error('Error generating results:', err)
      setError('Failed to generate career recommendations')
    } finally {
      setLoading(false)
    }
  }

  const handleCareerSwipeComplete = (selected: Career[], rejected: Career[]) => {
    setSelectedCareers(selected)
    setRejectedCareers(rejected)
    saveCareerSelections(selected, rejected)
  }

  const saveCareerSelections = async (selected: Career[], rejected: Career[]) => {
    try {
      const token = await getToken()
      if (!token) return

      // Save selected careers to user preferences
      const response = await fetch('/api/career/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          selected_careers: selected.map(career => ({
            title: career.title,
            is_interested: true
          })),
          rejected_careers: rejected.map(career => ({
            title: career.title,
            is_interested: false
          }))
        })
      })

      if (response.ok) {
        console.log('Career selections saved successfully')
      }
    } catch (err) {
      console.error('Error saving career selections:', err)
    }
  }

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <ErrorMessage message={error} />
          <Button 
            onClick={() => router.push('/quiz')}
            className="mt-4"
          >
            Take the Quiz
          </Button>
        </div>
      </div>
    )
  }

  if (!results || !results.recommendations?.potential_careers) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">No Career Recommendations Available</h1>
          <p className="text-gray-600 mb-6">Please complete the quiz first to see your career recommendations.</p>
          <Button
            onClick={() => router.push('/quiz')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Take the Quiz
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col">
      {/* Header - Fixed at top */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.push('/results')}
                className="text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Results
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Career Matching</h1>
                <p className="text-sm text-gray-600">
                  {results.recommendations.potential_careers.length} careers to review
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Heart className="w-4 h-4 text-red-500" />
                <span>{selectedCareers.length} liked</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <X className="w-4 h-4 text-gray-500" />
                <span>{rejectedCareers.length} passed</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Scrollable with proper constraints */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 overflow-hidden">
        <div className="w-full max-w-md mx-auto">
          {/* Instructions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6"
          >
            <div className="flex justify-center mb-3">
              <Sparkles className="w-8 h-8 text-purple-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Discover Your Perfect Career Match
            </h2>
            <p className="text-sm text-gray-600">
              Swipe right to like • Swipe left to pass
            </p>
          </motion.div>

          {/* Career Swipe Component - Constrained to viewport */}
          <div className="relative w-full max-w-sm mx-auto">
            <CareerSwipe
              careers={results.recommendations.potential_careers}
              onComplete={handleCareerSwipeComplete}
            />
          </div>
        </div>
      </main>

      {/* Footer - Fixed at bottom */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200 sticky bottom-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span>Based on your quiz answers</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-blue-600" />
              <span>AI-powered recommendations</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
} 