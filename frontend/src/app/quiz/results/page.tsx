'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import GlobalLayout from '@/components/GlobalLayout';

interface CareerRecommendation {
  title: string
  description: string
  subjects: string[]
  confidence: number
}

interface QuizResults {
  recommendations: CareerRecommendation[]
  study_resources: string[]
}

export default function QuizResultsPage() {
  const searchParams = useSearchParams()
  const [recommendedSubjects, setRecommendedSubjects] = useState<string[]>([])
  const [recommendedCareers, setRecommendedCareers] = useState<string[]>([])

  useEffect(() => {
    // Read recommendations from query parameters
    const subjectsParam = searchParams.get('subjects')
    const careersParam = searchParams.get('careers')

    if (subjectsParam) {
      setRecommendedSubjects(subjectsParam.split(',').map(item => item.trim()).filter(item => item.length > 0))
    }

    if (careersParam) {
      setRecommendedCareers(careersParam.split(',').map(item => item.trim()).filter(item => item.length > 0))
    }

    // TODO: Implement fetching from Firestore for detailed information if needed
    // This would involve fetching descriptions, images, detailed scores, reviews, etc.

  }, [searchParams]) // Rerun effect when query params change

  // Helper function to render subject/career cards
  const renderRecommendationCard = (item: string, type: 'subject' | 'career') => {
      // Placeholder image - replace with dynamic image URL if available later
      const placeholderImage = type === 'subject' 
        ? "https://lh3.googleusercontent.com/aida-public/AB6AXuBczoMPJOhbISjqzD8N2tuWMeYOay6QdP3FDN6-pSj_TfnQ5fJdzW3I7TLepPhjnlV0ZlUO88PP_pp4T4kXF2Ev3fwEYQ_QqeGs6DCsn-iERICbgpf7tV-UtGDsPbxV7FeQTT5tzOsZq5eg41jST9FesPgd4eQzaypGP__u37_T_-d2GTuxHqrtNmNJqUF065m-gXE_3ZIqhaDCWtVQomConogvApfrs_WQRgaB_KMy8f6KZU7O6Gh7VRn9TkHh4lMv3FT42AGd0wqe" // Chemistry image from design
        : "https://lh3.googleusercontent.com/aida-public/AB6AXuA3j0MdK0JFmMYzcL65l2Ym9nl5enZ4uuwDaFfEv5L8kilxuaTZBZohyR3DhaA__l2zbJ18BBlAtwhqrS83nMuJJkmYpY_0e6a_hb6LA5IksUYsU1Ci2Q0VIATg0cloVMg0DKX3PkzL7tVkF5PmDZr7xd6j9k1vlWvg-umG4tUbfhtySRm1mfFvzDmaeyzBJ6rjG3VH2uApCa5JiKc1hId-j7vlU4riGbqotj3WtlEkD5fNX6KZo4y4Y7YnEbUwIFxmI-OtsFf5myDl-vW7oczd634QeYWZFCtLtPhSkWYBUnXOi"; // Physics image from design
      
      // Placeholder description and related tags - replace with dynamic data later
      const placeholderDescription = `This is a placeholder description for ${item}. Detailed information would be fetched here.`;
      const placeholderTags = [`Tag1 for ${item}`, `Tag2 for ${item}`];
      
      // Placeholder scoring and review data - replace with dynamic data later
      const placeholderScalingScore = Math.floor(Math.random() * 31) + 70; // Random score between 70 and 100
      const placeholderReviews = Math.floor(Math.random() * 101) + 50; // Random reviews between 50 and 150
      const placeholderRating = (Math.random() * (5 - 3.5) + 3.5).toFixed(1); // Random rating between 3.5 and 5
      
      const renderStars = (rating: number) => {
          const stars = [];
          for (let i = 0; i < 5; i++) {
              if (i < Math.floor(rating)) {
                  stars.push(
                      <div key={i} className="text-[#0b80ee]" data-icon="Star" data-size="18px" data-weight="fill">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18px" height="18px" fill="currentColor" viewBox="0 0 256 256">
                              <path d="M234.5,114.38l-45.1,39.36,13.51,58.6a16,16,0,0,1-23.84,17.34l-51.11-31-51,31a16,16,0,0,1-23.84-17.34L66.61,153.8,21.5,114.38a16,16,0,0,1,9.11-28.06l59.46-5.15,23.21-55.36a15.95,15.95,0,0,1,29.44,0h0L166,81.17l59.44,5.15a16,16,0,0,1,9.11,28.06Z"></path>
                          </svg>
                      </div>
                  );
              } else if (i === Math.floor(rating) && rating % 1 !== 0) {
                   // Simple half-star representation - can be improved with a dedicated half-star icon
                   stars.push(
                       <div key={i} className="text-[#0b80ee]" data-icon="StarHalf" data-size="18px" data-weight="fill">
                           <svg xmlns="http://www.w3.org/2000/svg" width="18px" height="18px" fill="currentColor" viewBox="0 0 256 256"><path d="M128,216a7.92,7.92,0,0,1-3.94-1.08l-51-31L60.17,212.34A16,16,0,0,1,36.33,195l13.51-58.6L4.7,114.38a16,16,0,0,1,9.11-28.09l59.46-5.15L96.53,25.81h0a15.95,15.95,0,0,1,29.44,0L149.2,81.14l59.46,5.15a16,16,0,0,1,9.11,28.09L202.38,136,151.31,167.05a8,8,0,0,1-3.93,1.07ZM128,180.81V40l23.2,55.29a16,16,0,0,1,13.35,9.75L224,102.26l-45.07,39.33a16,16,0,0,0-5.08,15.71l13.5,58.6L128,180.81Z"></path></svg>
                       </div>
                   );
              }
              else {
                   stars.push(
                       <div key={i} className="text-[#0b80ee]" data-icon="Star" data-size="18px" data-weight="regular">
                           <svg xmlns="http://www.w3.org/2000/svg" width="18px" height="18px" fill="currentColor" viewBox="0 0 256 256"><path d="M239.2,97.29a16,16,0,0,0-13.81-11L166,81.17,142.72,25.81h0a15.95,15.95,0,0,0-29.44,0L90.07,81.17,30.61,86.32a16,16,0,0,0-9.11,28.06L66.61,153.8,53.09,212.34a16,16,0,0,0,23.84,17.34l51-31,51.11,31a16,16,0,0,0,23.84-17.34l-13.51-58.6,45.1-39.36A16,16,0,0,0,239.2,97.29Zm-15.22,5-45.1,39.36a16,16,0,0,0-5.08,15.71L187.35,216v0l-51.07-31a15.9,15.9,0,0,0-16.54,0l-51,31h0L82.2,157.4a16,16,0,0,0-5.08-15.71L32,102.35a.37.37,0,0,1,0-.09l59.44-5.14a16,16,0,0,0,13.35-9.75L128,32.08l23.2,55.29a16,16,0,0,0,13.35,9.75L224,102.26S224,102.32,224,102.33Z"></path></svg>
                       </div>
                   );
              }
          }
          return stars;
      };

      const renderReviewBreakdown = (percentage: number) => (
          <div className="flex h-2 flex-1 overflow-hidden rounded-full bg-[#cedce8]">
              <div className="rounded-full bg-[#0b80ee]" style={{ width: `${percentage}%` }}></div>
          </div>
      );

      // Placeholder percentages for reviews - replace with dynamic data later
      const placeholderReviewPercentages = [40, 30, 15, 10, 5]; // For a 5-star rating system example

      return (
          <div key={item} className="p-4">
              <div className="flex items-stretch justify-between gap-4 rounded-xl">
                  <div className="flex flex-[2_2_0px] flex-col gap-4">
                      <div className="flex flex-col gap-1">
                          <p className="text-[#49749c] text-sm font-normal leading-normal">{type === 'subject' ? 'Recommended Subject' : 'Recommended Career'}</p> {/* Indicate if Subject or Career */}
                          <p className="text-[#0d151c] text-base font-bold leading-tight">{item}</p> {/* Display the actual subject/career name */}
                          <p className="text-[#49749c] text-sm font-normal leading-normal">{placeholderDescription}</p>
                      </div>
                      <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-8 px-4 flex-row-reverse bg-[#e7edf4] text-[#0d151c] pr-2 gap-1 text-sm font-medium leading-normal w-fit">
                          <div className="text-[#0d151c]" data-icon="Heart" data-size="18px" data-weight="regular">
                              <svg xmlns="http://www.w3.org/2000/svg" width="18px" height="18px" fill="currentColor" viewBox="0 0 256 256"><path d="M178,32c-20.65,0-38.73,8.88-50,23.89C116.73,40.88,98.65,32,78,32A62.07,62.07,0,0,0,16,94c0,70,103.79,126.66,108.21,129a8,8,0,0,0,7.58,0C136.21,220.66,240,164,240,94A62.07,62.07,0,0,0,178,32ZM128,206.8C109.74,196.16,32,147.69,32,94A46.06,46.06,0,0,1,78,48c19.45,0,35.78,10.36,42.6,27a8,8,0,0,0,14.8,0c6.82-16.67,23.15-27,42.6-27a46.06,46.06,0,0,1,46,46C224,147.61,146.24,196.15,128,206.8Z"></path></svg>
                          </div>
                          <span className="truncate">Save to Preferences</span>
                      </button>
                  </div>
                  <div className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-xl flex-1" style={{ backgroundImage: `url("${placeholderImage}")` }}></div>
              </div>
              {/* Related Tags */}
              <div className="flex gap-3 p-3 flex-wrap pr-4">
                  {placeholderTags.map(tag => (
                       <div key={tag} className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full bg-[#e7edf4] pl-4 pr-4">
                          <p className="text-[#0d151c] text-sm font-medium leading-normal">{tag}</p>
                      </div>
                  ))}
              </div>
              {/* Scaling Score */}
              <div className="flex flex-col gap-3 p-4">
                  <div className="flex gap-6 justify-between">
                      <p className="text-[#0d151c] text-base font-medium leading-normal">Scaling Score</p>
                      <p className="text-[#0d151c] text-sm font-normal leading-normal">{placeholderScalingScore}%</p>
                  </div>
                  <div className="rounded bg-[#cedce8]"><div className="h-2 rounded bg-[#0b80ee]" style={{ width: `${placeholderScalingScore}%` }}></div></div>
              </div>
              {/* Review Breakdown */}
              <div className="flex flex-wrap gap-x-8 gap-y-6 p-4">
                  <div className="flex flex-col gap-2">
                      <p className="text-[#0d151c] text-4xl font-black leading-tight tracking-[-0.033em]">{placeholderRating}</p>
                      <div className="flex gap-0.5">
                          {renderStars(parseFloat(placeholderRating))}
                      </div>
                      <p className="text-[#0d151c] text-base font-normal leading-normal">{placeholderReviews} reviews</p>
                  </div>
                  <div className="grid min-w-[200px] max-w-[400px] flex-1 grid-cols-[20px_1fr_40px] items-center gap-y-3">
                      {[5, 4, 3, 2, 1].map((star, index) => (
                          <>
                              <p key={`star-${star}-label`} className="text-[#0d151c] text-sm font-normal leading-normal">{star}</p>
                              {renderReviewBreakdown(placeholderReviewPercentages[index])} {/* Using placeholder percentages */} 
                              <p key={`star-${star}-percent`} className="text-[#49749c] text-sm font-normal leading-normal text-right">{placeholderReviewPercentages[index]}%</p> {/* Using placeholder percentages */} 
                          </>
                      ))}
                  </div>
              </div>
          </div>
      );
  };

  return (
    <GlobalLayout>
      <div className="px-40 flex flex-1 justify-center py-5">
        <div className="layout-content-container flex flex-col max-w-[960px] flex-1">

          <div className="flex flex-wrap justify-between gap-3 p-4">
            <p className="text-[#0d151c] tracking-light text-[32px] font-bold leading-tight min-w-72">Your AI-Powered Career Report</p>
            <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-8 px-4 bg-[#e7edf4] text-[#0d151c] text-sm font-medium leading-normal">
              <span className="truncate">Download</span>
            </button>
          </div>

          {recommendedSubjects.length > 0 && (
              <div className="mt-6">
                  <h3 className="text-xl font-bold text-gray-900 px-4 mb-4">Recommended Subjects</h3>
                  {recommendedSubjects.map(subject => renderRecommendationCard(subject, 'subject'))}
              </div>
          )}

          {recommendedCareers.length > 0 && (
              <div className="mt-6">
                   <h3 className="text-xl font-bold text-gray-900 px-4 mb-4">Recommended Careers</h3>
                  {recommendedCareers.map(career => renderRecommendationCard(career, 'career'))}
              </div>
          )}

          {recommendedSubjects.length === 0 && recommendedCareers.length === 0 && (
              <div className="p-4 text-center text-gray-600">
                  No recommendations available yet. Please complete the quiz.
              </div>
          )}

        </div>
      </div>
    </GlobalLayout>
  );
} 