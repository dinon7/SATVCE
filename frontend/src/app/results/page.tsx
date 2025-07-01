'use client'

import { useState, useEffect } from 'react'
import { useUser, useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { ErrorMessage } from '@/components/ErrorMessage'
import { motion } from 'framer-motion'
import { 
  Sparkles, 
  BookOpen, 
  TrendingUp, 
  CheckCircle,
  ArrowRight
} from 'lucide-react'

export default function ResultsPage() {
  const { user, isLoaded } = useUser()
  const { getToken } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<any>(null)
  const [isGenerating, setIsGenerating] = useState(false)

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
      setError('Failed to load results')
      setLoading(false)
    }
  }

  const generateResultsFromAnswers = async (token: string | null) => {
    try {
      setIsGenerating(true)
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
      setError('Failed to generate results')
    } finally {
      setLoading(false)
      setIsGenerating(false)
    }
  }

  const startCareerSwipe = () => {
    // Redirect to dedicated career matching page
    router.push('/career-matching')
  }

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col items-center justify-center text-center p-4">
        <LoadingSpinner />
        {isGenerating && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold text-gray-700">Just a moment...</h2>
            <p className="text-gray-500 mt-2">
              Our AI is analyzing your answers to craft your personalized career recommendations.
            </p>
          </div>
        )}
      </div>
    )
  }

  if (error) {
    return <ErrorMessage message={error} />
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">No Results Available</h1>
          <p className="text-gray-600 mb-6">Please complete the quiz first to see your results.</p>
          <button
            onClick={() => router.push('/quiz')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Take the Quiz
          </button>
        </div>
      </div>
    )
  }

  // Show initial results with career swipe option
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex justify-center mb-4">
            <Sparkles className="w-12 h-12 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Your Career Guidance Results
          </h1>
          <p className="text-gray-600">
            Based on your quiz answers, we've generated personalized recommendations
          </p>
        </motion.div>
        
        <div className="space-y-6">
          {/* Recommended Subjects */}
          {results.recommendations?.recommended_subjects && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white p-6 rounded-xl shadow-lg"
            >
              <div className="flex items-center space-x-3 mb-4">
                <BookOpen className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-blue-600">Recommended VCE Subjects</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {results.recommendations.recommended_subjects.map((subject: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    <span className="text-gray-700 font-medium">{subject}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
          
          {/* Career Matching Section */}
          {results.recommendations?.potential_careers && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white p-6 rounded-xl shadow-lg"
            >
              <div className="flex items-center space-x-3 mb-4">
                <TrendingUp className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-semibold text-green-600">Career Recommendations</h2>
              </div>
              <p className="text-gray-600 mb-6">
                We've found {results.recommendations.potential_careers.length} career paths that match your interests. 
                Try our interactive career matching to discover which ones resonate with you!
              </p>
              
              <button
                onClick={startCareerSwipe}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <div className="flex items-center justify-center space-x-3">
                  <Sparkles className="w-5 h-5" />
                  <span>Start Career Matching</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              </button>
            </motion.div>
          )}
          
          {/* Study Resources */}
          {results.recommendations?.study_resources && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white p-6 rounded-xl shadow-lg"
            >
              <h2 className="text-xl font-semibold mb-3 text-purple-600">Recommended Study Resources</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {results.recommendations.study_resources.map((resource: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2 p-3 bg-purple-50 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-purple-600" />
                    <span className="text-gray-700">{resource}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
          
          {/* Reasoning */}
          {results.recommendations?.reasoning && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white p-6 rounded-xl shadow-lg"
            >
              <h2 className="text-xl font-semibold mb-3 text-orange-600">Analysis & Reasoning</h2>
              <p className="text-gray-700 leading-relaxed">{results.recommendations.reasoning}</p>
            </motion.div>
          )}
          
          {/* Confidence Score */}
          {results.recommendations?.confidence_score && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white p-6 rounded-xl shadow-lg"
            >
              <h2 className="text-xl font-semibold mb-3 text-indigo-600">Recommendation Confidence</h2>
              <div className="flex items-center space-x-4">
                <div className="flex-1 bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-1000" 
                    style={{ width: `${results.recommendations.confidence_score * 100}%` }}
                  ></div>
                </div>
                <span className="text-lg font-bold text-indigo-600">
                  {Math.round(results.recommendations.confidence_score * 100)}%
                </span>
              </div>
            </motion.div>
          )}
        </div>
        
        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-center"
        >
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
          >
            Go to Dashboard
          </button>
        </motion.div>
      </div>
    </div>
  )
} 