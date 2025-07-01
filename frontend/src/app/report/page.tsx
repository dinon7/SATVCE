"use client"

import { useState, useEffect } from 'react'
import { useUser, useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  BookOpen, 
  Briefcase, 
  TrendingUp, 
  Star,
  Heart,
  CheckCircle,
  Sparkles,
  Calendar,
  DollarSign,
  Users,
  MapPin,
  GraduationCap
} from 'lucide-react'
import { Career } from '@/components/career/CareerCard'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function ReportPage() {
  const { user, isLoaded } = useUser()
  const { getToken } = useAuth()
  const router = useRouter()
  const [selectedCareers, setSelectedCareers] = useState<Career[]>([])
  const [quizResults, setQuizResults] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isLoaded) return

    if (!user) {
      router.push('/sign-in')
      return
    }

    const loadReportData = async () => {
      try {
        // Load selected careers from localStorage
        const selectedCareersStr = localStorage.getItem('selectedCareers')
        if (selectedCareersStr) {
          const careers = JSON.parse(selectedCareersStr)
          setSelectedCareers(careers)
        }

        // Load quiz results from localStorage
        const quizResultsStr = localStorage.getItem('quizResults')
        if (quizResultsStr) {
          const results = JSON.parse(quizResultsStr)
          setQuizResults(results)
        }
      } catch (error) {
        console.error('Failed to load report data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadReportData()
  }, [user, isLoaded, router])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex justify-center mb-4">
            <Sparkles className="w-12 h-12 text-purple-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Your Career Guidance Report
          </h1>
          <p className="text-gray-600 mb-6">
            Comprehensive analysis of your career interests and recommendations
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Selected Careers Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <Heart className="w-6 h-6 text-red-500" />
                  <h2 className="text-2xl font-bold">Your Selected Careers</h2>
                  <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                    {selectedCareers.length} selected
                  </span>
                </div>

                {selectedCareers.length > 0 ? (
                  <div className="space-y-4">
                    {selectedCareers.map((career, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-green-800 mb-2">{career.title}</h3>
                            <p className="text-green-700 leading-relaxed">{career.description}</p>
                          </div>
                          <div className="flex items-center space-x-1 bg-green-100 px-3 py-1 rounded-full">
                            <Star className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-bold text-green-700">
                              {Math.round(career.confidence_score * 100)}% Match
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                              <DollarSign className="w-4 h-4 text-green-600" />
                              <span className="text-sm font-medium">{career.salary_range}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <TrendingUp className="w-4 h-4 text-green-600" />
                              <span className="text-sm font-medium">{career.job_outlook}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Users className="w-4 h-4 text-green-600" />
                              <span className="text-sm font-medium">{career.work_environment}</span>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <h4 className="text-sm font-semibold text-green-800 mb-2">Required Skills</h4>
                              <div className="flex flex-wrap gap-1">
                                {career.required_skills.slice(0, 3).map((skill, skillIndex) => (
                                  <span
                                    key={skillIndex}
                                    className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold text-green-800 mb-2">Industry</h4>
                              <div className="flex flex-wrap gap-1">
                                {career.industry_tags.slice(0, 2).map((tag, tagIndex) => (
                                  <span
                                    key={tagIndex}
                                    className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-green-200">
                          <h4 className="text-sm font-semibold text-green-800 mb-2">Relevant VCE Subjects</h4>
                          <div className="flex flex-wrap gap-2">
                            {career.vce_subjects.map((subject, subjectIndex) => (
                              <span
                                key={subjectIndex}
                                className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full"
                              >
                                {subject}
                              </span>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No careers selected yet</p>
                    <Button onClick={() => router.push('/quiz')}>
                      Take Career Quiz
                    </Button>
                  </div>
                )}
              </Card>
            </motion.div>

            {/* Recommended Subjects Section */}
            {quizResults?.recommendations?.recommended_subjects && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                    <h2 className="text-2xl font-bold">Recommended VCE Subjects</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {quizResults.recommendations.recommended_subjects.map((subject: string, index: number) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 * index }}
                        className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200"
                      >
                        <CheckCircle className="w-5 h-5 text-blue-600" />
                        <span className="font-medium text-blue-800">{subject}</span>
                      </motion.div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Analysis & Reasoning */}
            {quizResults?.recommendations?.reasoning && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="p-6">
                  <h2 className="text-2xl font-bold mb-4">Analysis & Reasoning</h2>
                  <p className="text-gray-700 leading-relaxed text-lg">
                    {quizResults.recommendations.reasoning}
                  </p>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Summary Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Summary</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Careers Selected</span>
                    <span className="font-bold text-green-600">{selectedCareers.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Subjects Recommended</span>
                    <span className="font-bold text-blue-600">
                      {quizResults?.recommendations?.recommended_subjects?.length || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Quiz Confidence</span>
                    <span className="font-bold text-purple-600">
                      {quizResults?.recommendations?.confidence_score 
                        ? `${Math.round(quizResults.recommendations.confidence_score * 100)}%`
                        : 'N/A'
                      }
                    </span>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Study Resources */}
            {quizResults?.recommendations?.study_resources && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Study Resources</h3>
                  <div className="space-y-3">
                    {quizResults.recommendations.study_resources.map((resource: string, index: number) => (
                      <div key={index} className="flex items-center space-x-2 p-2 bg-purple-50 rounded-lg">
                        <CheckCircle className="w-4 h-4 text-purple-600" />
                        <span className="text-sm text-purple-700">{resource}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Report Meta */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Report Details</h3>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>Generated: {new Date().toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <GraduationCap className="w-4 h-4" />
                    <span>VCE Career Guidance</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4" />
                    <span>Australia</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
} 