"use client"

import { useAuth } from "@/hooks/useAuth"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { 
  BookOpen, 
  Briefcase, 
  FileText, 
  RefreshCw, 
  Settings, 
  TrendingUp,
  Clock,
  Star,
  Heart,
  CheckCircle,
  Sparkles
} from "lucide-react"
import { Career } from "@/components/career/CareerCard"

interface DashboardStats {
  quizCompleted: boolean
  subjectsExplored: number
  careersDiscovered: number
  selectedCareers: number
  recentActivity: {
    type: 'quiz' | 'career' | 'subject'
    title: string
    timestamp: string
  }[]
  topCareers: {
    title: string
    match: number
  }[]
}

export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    quizCompleted: false,
    subjectsExplored: 0,
    careersDiscovered: 0,
    selectedCareers: 0,
    recentActivity: [],
    topCareers: []
  })
  const [selectedCareers, setSelectedCareers] = useState<Career[]>([])
  const [quizResults, setQuizResults] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadDashboardData = async () => {
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

        // Update stats based on loaded data
        setStats({
          quizCompleted: !!quizResultsStr,
          subjectsExplored: quizResults?.recommendations?.recommended_subjects?.length || 0,
          careersDiscovered: quizResults?.recommendations?.potential_careers?.length || 0,
          selectedCareers: selectedCareers.length,
          recentActivity: [
            { type: 'quiz' as const, title: 'Completed Career Quiz', timestamp: new Date().toISOString() },
            ...(selectedCareers.length > 0 ? [{ type: 'career' as const, title: `Selected ${selectedCareers.length} careers`, timestamp: new Date().toISOString() }] : [])
          ],
          topCareers: selectedCareers.slice(0, 3).map(career => ({
            title: career.title,
            match: Math.round(career.confidence_score * 100)
          }))
        })
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'quiz':
        return <RefreshCw className="w-4 h-4" />
      case 'career':
        return <Briefcase className="w-4 h-4" />
      case 'subject':
        return <BookOpen className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-3xl font-bold">Welcome back!</h1>
          <p className="text-gray-600 mt-2">
            {user?.email}
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/quiz">
            <Button variant="ghost">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retake Quiz
            </Button>
          </Link>
          <Link href="/preferences">
            <Button>
              <Settings className="w-4 h-4 mr-2" />
              Update Preferences
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Progress Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Your Progress</h2>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm text-gray-600">Quiz Completion</p>
                  <span className="text-sm font-medium">{stats.quizCompleted ? '100%' : '0%'}</span>
                </div>
                <Progress value={stats.quizCompleted ? 100 : 0} className="h-2" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Subjects Explored</p>
                  <p className="text-2xl font-bold">{stats.subjectsExplored}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Careers Discovered</p>
                  <p className="text-2xl font-bold">{stats.careersDiscovered}</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Selected Careers Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Heart className="w-5 h-5 text-red-500" />
              <h2 className="text-xl font-semibold">Selected Careers</h2>
            </div>
            <div className="space-y-3">
              {selectedCareers.length > 0 ? (
                selectedCareers.slice(0, 3).map((career, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-sm">{career.title}</span>
                    </div>
                    <span className="text-xs text-green-600 font-medium">
                      {Math.round(career.confidence_score * 100)}% match
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <Sparkles className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No careers selected yet</p>
                  <Link href="/quiz">
                    <Button variant="outline" size="sm" className="mt-2">
                      Take Quiz
                    </Button>
                  </Link>
                </div>
              )}
              {selectedCareers.length > 3 && (
                <p className="text-xs text-gray-500 text-center">
                  +{selectedCareers.length - 3} more careers
                </p>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Quick Actions Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link href="/quiz" className="block">
                <Button variant="ghost" className="w-full justify-start">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Take Career Quiz
                </Button>
              </Link>
              <Link href="/report" className="block">
                <Button variant="ghost" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  View Full Report
                </Button>
              </Link>
              <Link href="/careers" className="block">
                <Button variant="ghost" className="w-full justify-start">
                  <Briefcase className="w-4 h-4 mr-2" />
                  Explore Careers
                </Button>
              </Link>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Selected Careers Detail Section */}
      {selectedCareers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Your Selected Careers</h2>
              <span className="text-sm text-gray-500">
                {selectedCareers.length} career{selectedCareers.length !== 1 ? 's' : ''} selected
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedCareers.map((career, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index }}
                  className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-green-800">{career.title}</h3>
                    <div className="flex items-center space-x-1 bg-green-100 px-2 py-1 rounded-full">
                      <Star className="w-3 h-3 text-green-600" />
                      <span className="text-xs font-medium text-green-700">
                        {Math.round(career.confidence_score * 100)}%
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-green-700 mb-3 line-clamp-2">
                    {career.description}
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-3 h-3 text-green-600" />
                      <span className="text-xs text-green-600">{career.salary_range}</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {career.industry_tags.slice(0, 2).map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Recent Activity Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {stats.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  <p className="text-xs text-gray-500">{formatTimestamp(activity.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  )
} 