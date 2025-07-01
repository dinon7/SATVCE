"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import GlobalLayout from "@/components/GlobalLayout"
import { useQuizResults } from "@/hooks/useQuizResults"
import { Button } from "@/components/ui/button"
import { Loader2, AlertCircle, Download, RefreshCw, ThumbsUp, ThumbsDown, Save, Home } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { useCareerRecommendations } from '@/hooks/useCareerRecommendations'
import { useQuiz } from '@/contexts/QuizContext'
import { apiClient } from "@/lib/api"
import { CareerRecommendation, CareerReport, SubjectRecommendation } from "@/types/career"

export default function QuizResultsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { answers } = useQuiz()

  const { loading, error, recommendations, fetchRecommendations } = useCareerRecommendations()
  const [careers, setCareers] = useState<CareerRecommendation[]>([])
  const [isSaving, setIsSaving] = useState<{ [key: string]: boolean }>({})
  const [isDownloading, setIsDownloading] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const [report, setReport] = useState<CareerReport | null>(null)
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)

  useEffect(() => {
    // Only fetch recommendations if we have answers and haven't fetched yet
    if (answers.length > 0 && recommendations.length === 0 && !loading && !error) {
      fetchRecommendations({ answers })
    }
  }, [answers, fetchRecommendations, recommendations.length, loading, error])

  useEffect(() => {
    if (recommendations.length > 0) {
      setCareers(recommendations)
    }
  }, [recommendations])

  // Load saved preferences on mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const preferences = await apiClient.getCareerPreferences();
        setCareers(prevCareers =>
          prevCareers.map(career => ({
            ...career,
            isInterested: preferences.find(p => p.career_title === career.title)?.is_interested
          }))
        );
      } catch (error) {
        console.error('Failed to load preferences:', error);
        toast({
          title: "Error",
          description: "Failed to load your saved preferences.",
          variant: "destructive",
        });
      }
    };

    if (recommendations.length > 0) {
      loadPreferences();
    }
  }, [recommendations, toast]);

  const handleInterestToggle = async (careerTitle: string, isInterested: boolean) => {
    // Don't allow multiple simultaneous saves for the same career
    if (isSaving[careerTitle]) return;

    try {
      setIsSaving(prev => ({ ...prev, [careerTitle]: true }));

      // Update local state optimistically
      setCareers(prevCareers =>
        prevCareers.map(career =>
          career.title === careerTitle
            ? { ...career, isInterested }
            : career
        )
      );

      // Save to backend
      await apiClient.saveCareerPreference(careerTitle, isInterested);

      toast({
        title: "Preference Saved",
        description: `Marked ${careerTitle} as ${isInterested ? 'interested' : 'not interested'}.`,
      });
    } catch (error) {
      // Revert local state on error
      setCareers(prevCareers =>
        prevCareers.map(career =>
          career.title === careerTitle
            ? { ...career, isInterested: !isInterested }
            : career
        )
      );

      toast({
        title: "Error",
        description: "Failed to save preference. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(prev => ({ ...prev, [careerTitle]: false }));
    }
  };

  const handleSavePreferences = async () => {
    try {
      const interestedCareers = careers.filter(career => career.isInterested)
      // TODO: Implement API call to save preferences
      toast({
        title: "Preferences Saved",
        description: "Your career preferences have been saved successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleGenerateReport = async () => {
    try {
      setIsGeneratingReport(true);
      const selectedCareers = recommendations
        .filter(career => career.isInterested)
        .map(career => career.title);
      
      if (selectedCareers.length === 0) {
        toast({
          title: "No careers selected",
          description: "Please select at least one career to generate a report.",
          variant: "destructive",
        });
        return;
      }

      const reportData = await apiClient.getCareerReport(selectedCareers);
      setReport(reportData);
      setShowReport(true);
    } catch (error) {
      console.error("Error generating report:", error);
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleDownloadReport = async () => {
    try {
      setIsDownloading(true);

      // Get the selected careers (those marked as interested)
      const selectedCareers = careers
        .filter(career => career.isInterested)
        .map(career => career.title);

      if (selectedCareers.length === 0) {
        toast({
          title: "No Careers Selected",
          description: "Please mark at least one career as interested to generate a report.",
          variant: "destructive",
        });
        return;
      }

      // Download the PDF from the correct endpoint
      const pdfResponse = await fetch('/api/reports/career/pdf', {
        method: 'GET',
        headers: {
          'Accept': 'application/pdf',
        },
      });

      if (!pdfResponse.ok) {
        throw new Error('Failed to generate PDF');
      }

      const blob = await pdfResponse.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `career_report_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Report Downloaded",
        description: "Your career report has been downloaded successfully.",
      });
    } catch (error) {
      console.error('Error downloading report:', error);
      toast({
        title: "Error",
        description: "Failed to download the report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const renderRecommendationCard = (career: CareerRecommendation) => {
    const isSavingCareer = isSaving[career.title];

    return (
      <motion.div
        key={career.title}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="p-6 mb-6 hover:shadow-lg transition-shadow">
          <div className="space-y-6">
            {/* Header Section */}
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-gray-900">{career.title}</h3>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-sm">
                    {Math.round(career.confidence * 100)}% Match
                  </Badge>
                  <Progress value={career.confidence} className="w-32" />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleInterestToggle(career.title, true)}
                  className="flex items-center gap-2"
                  disabled={isSavingCareer}
                >
                  {isSavingCareer ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ThumbsUp className="h-4 w-4" />
                  )}
                  Interested
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleInterestToggle(career.title, false)}
                  className="flex items-center gap-2"
                  disabled={isSavingCareer}
                >
                  {isSavingCareer ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ThumbsDown className="h-4 w-4" />
                  )}
                  Not Interested
                </Button>
              </div>
            </div>

            {/* Description */}
            <div className="prose max-w-none">
              <p className="text-gray-600">{career.description}</p>
            </div>

            {/* Career Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Required Skills */}
              <div className="space-y-3">
                <h4 className="text-lg font-semibold text-gray-900">Required Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {career.requiredSkills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-sm">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Education Requirements */}
              <div className="space-y-3">
                <h4 className="text-lg font-semibold text-gray-900">Education Requirements</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  {career.educationRequirements.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </div>

              {/* Job Outlook */}
              <div className="space-y-3">
                <h4 className="text-lg font-semibold text-gray-900">Job Outlook</h4>
                <p className="text-gray-600">{career.jobOutlook}</p>
              </div>

              {/* Salary Range */}
              <div className="space-y-3">
                <h4 className="text-lg font-semibold text-gray-900">Salary Range</h4>
                <p className="text-gray-600">{career.salaryRange}</p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    )
  }

  if (loading) {
    return (
      <GlobalLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-blue-600" />
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-gray-900">Generating Your Career Report</h2>
              <p className="text-gray-600">We're analyzing your answers to provide personalized career recommendations...</p>
            </div>
          </div>
        </div>
      </GlobalLayout>
    )
  }

  if (error) {
    return (
      <GlobalLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4 max-w-md">
            <AlertCircle className="w-12 h-12 mx-auto text-red-600" />
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-gray-900">Something Went Wrong</h2>
              <p className="text-gray-600">{error}</p>
            </div>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => router.push("/quiz/1")}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Retake Quiz
              </Button>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </GlobalLayout>
    )
  }

  if (!recommendations.length) {
    return (
      <GlobalLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <AlertCircle className="w-12 h-12 mx-auto text-yellow-600" />
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-gray-900">No Results Found</h2>
              <p className="text-gray-600">Please complete the quiz to get your career recommendations.</p>
            </div>
            <Button onClick={() => router.push("/quiz/1")}>
              Start Quiz
            </Button>
          </div>
        </div>
      </GlobalLayout>
    )
  }

  return (
    <GlobalLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Your Career Recommendations</h1>
            <p className="text-gray-600 mt-2">
              Based on your quiz answers, we've identified these potential career paths for you.
            </p>
          </div>
          <div className="flex gap-4">
            <Button
              onClick={handleGenerateReport}
              disabled={isGeneratingReport || careers.length === 0}
              className="flex items-center gap-2"
            >
              {isGeneratingReport ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              View Full Report
            </Button>
            <Button
              onClick={handleDownloadReport}
              disabled={isDownloading || careers.length === 0}
              className="flex items-center gap-2"
            >
              {isDownloading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Download Report
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </div>
        </div>

        {/* Career Recommendations */}
        <div className="space-y-6">
          {careers.map((career) => renderRecommendationCard(career))}
        </div>

        {/* Full Report Modal */}
        {showReport && report && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b flex justify-between items-center">
                <h2 className="text-2xl font-bold">Your Career Report</h2>
                <div className="text-sm text-gray-500">
                  Generated on {new Date(report.generated_at).toLocaleDateString()}
                </div>
              </div>
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
                <div className="space-y-8">
                  {/* Career Recommendations */}
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Career Recommendations</h3>
                    <div className="space-y-4">
                      {report.recommendations?.map((career) => (
                        <Card key={career.title} className="p-4">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="text-lg font-semibold">{career.title}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary" className="text-sm">
                                  {Math.round(career.confidence * 100)}% Match
                                </Badge>
                                <Progress value={career.confidence} className="w-32" />
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant={career.isInterested ? "default" : "outline"}
                                size="sm"
                                onClick={() => handleInterestToggle(career.title, true)}
                                disabled={isSaving[career.title]}
                                className="flex items-center gap-2"
                              >
                                {isSaving[career.title] ? (
                                  <span className="animate-spin">⟳</span>
                                ) : (
                                  <span>👍</span>
                                )}
                                Interested
                              </Button>
                              <Button
                                variant={career.isInterested === false ? "destructive" : "outline"}
                                size="sm"
                                onClick={() => handleInterestToggle(career.title, false)}
                                disabled={isSaving[career.title]}
                                className="flex items-center gap-2"
                              >
                                {isSaving[career.title] ? (
                                  <span className="animate-spin">⟳</span>
                                ) : (
                                  <span>👎</span>
                                )}
                                Not Interested
                              </Button>
                            </div>
                          </div>
                          <p className="text-gray-600 mb-4">{career.description}</p>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h5 className="font-medium mb-2">Required Skills</h5>
                              <div className="flex flex-wrap gap-2">
                                {career.requiredSkills.map((skill, index) => (
                                  <Badge key={index} variant="secondary" className="text-sm">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div>
                              <h5 className="font-medium mb-2">Education Requirements</h5>
                              <ul className="list-disc list-inside text-gray-600">
                                {career.educationRequirements.map((req, index) => (
                                  <li key={index}>{req}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Subject Recommendations */}
                  {report.subject_recommendations && (
                    <div>
                      <h3 className="text-xl font-semibold mb-4">Recommended Subjects</h3>
                      <div className="space-y-4">
                        {report.subject_recommendations.map((subject) => (
                          <Card key={subject.subjectCode} className="p-4">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h4 className="text-lg font-semibold">{subject.subjectName}</h4>
                                <p className="text-sm text-gray-500">{subject.subjectCode}</p>
                              </div>
                              <div className="flex gap-4">
                                <div className="text-center">
                                  <div className="text-sm text-gray-500">Scaling Score</div>
                                  <div className="text-lg font-semibold">
                                    {(subject.scalingScore * 100).toFixed(0)}%
                                  </div>
                                </div>
                                <div className="text-center">
                                  <div className="text-sm text-gray-500">Difficulty</div>
                                  <div className="text-lg font-semibold">
                                    {subject.difficultyRating}/5
                                  </div>
                                </div>
                                <div className="text-center">
                                  <div className="text-sm text-gray-500">Popularity</div>
                                  <div className="text-lg font-semibold">
                                    {subject.popularityIndex}/100
                                  </div>
                                </div>
                              </div>
                            </div>
                            <p className="text-gray-600 mb-4">{subject.subjectDescription}</p>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h5 className="font-medium mb-2">Study Tips</h5>
                                <ul className="list-disc list-inside text-gray-600">
                                  {subject.studyTips.map((tip, index) => (
                                    <li key={index}>{tip}</li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <h5 className="font-medium mb-2">Prerequisites</h5>
                                <ul className="list-disc list-inside text-gray-600">
                                  {subject.prerequisites.map((prereq, index) => (
                                    <li key={index}>{prereq}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                            <div className="mt-4">
                              <h5 className="font-medium mb-2">Job Market Data</h5>
                              <div className="grid grid-cols-3 gap-4">
                                <div>
                                  <div className="text-sm text-gray-500">Median Salary</div>
                                  <div className="text-lg font-semibold">
                                    ${subject.jobMarketData.salaryMedian.toLocaleString()}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-sm text-gray-500">Demand Trend</div>
                                  <div className="text-lg font-semibold">
                                    {subject.jobMarketData.demandTrend}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-sm text-gray-500">Industry Tags</div>
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    {subject.jobMarketData.industryTags.map((tag, index) => (
                                      <Badge key={index} variant="outline" className="text-sm">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Study Resources */}
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Study Resources</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {report.study_resources.map((resource, index) => (
                        <Card key={index} className="p-4">
                          <h4 className="text-lg font-semibold mb-2">Resource {index + 1}</h4>
                          <p className="text-gray-600">{resource}</p>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t flex justify-end gap-4">
                <Button variant="outline" onClick={handleDownloadReport}>
                  <span className="mr-2">⬇️</span>
                  Download Report
                </Button>
                <Button onClick={() => setShowReport(false)}>Close</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </GlobalLayout>
  )
} 