'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  university: string;
  duration: string;
  atar_requirement: number;
  fees: { [key: string]: number };
  location: string;
  study_mode: string;
  prerequisites: string[];
  career_outcomes: string[];
}

interface UniversityInfo {
  university_rank: string;
  faculty_info: string;
  campus_facilities: string[];
  student_support: string[];
  international_rankings: {
    QS: string;
    'Times Higher Education': string;
  };
  research_opportunities: string[];
  student_life: {
    clubs: string[];
    events: string[];
    facilities: string[];
  };
}

interface CareerOutcomes {
  employment_rate: string;
  average_salary: string;
  top_employers: string[];
  career_paths: {
    role: string;
    salary_range: string;
    growth_rate: string;
  }[];
  internship_opportunities: string[];
  alumni_network: string;
}

interface AdmissionRequirements {
  atar_requirements: {
    minimum: string;
    guaranteed_entry: string;
    previous_year_cutoff: string;
  };
  subject_prerequisites: {
    subject: string;
    level: string;
    minimum_score: string;
  }[];
  additional_requirements: string[];
  international_requirements: {
    english_proficiency: string;
    academic_equivalency: string;
  };
  application_deadlines: {
    domestic: string;
    international: string;
  };
}

const CoursesPage = () => {
  const { user, getAuthToken } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'atar' | 'duration'>('atar');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [universityInfo, setUniversityInfo] = useState<UniversityInfo | null>(null);
  const [careerOutcomes, setCareerOutcomes] = useState<CareerOutcomes | null>(null);
  const [admissionRequirements, setAdmissionRequirements] = useState<AdmissionRequirements | null>(null);
  const [loadingUniversityInfo, setLoadingUniversityInfo] = useState(false);
  const [loadingCareerOutcomes, setLoadingCareerOutcomes] = useState(false);
  const [loadingAdmissionRequirements, setLoadingAdmissionRequirements] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const authToken = await getAuthToken();
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/courses`, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch courses');
        }
        const data = await response.json();
        setCourses(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [getAuthToken]);

  const fetchUniversityInfo = async (courseId: string) => {
    setLoadingUniversityInfo(true);
    try {
      const authToken = await getAuthToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/courses/fetch-university-info/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch university info');
      }
      const data = await response.json();
      setUniversityInfo(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingUniversityInfo(false);
    }
  };

  const fetchCareerOutcomes = async (courseId: string) => {
    setLoadingCareerOutcomes(true);
    try {
      const authToken = await getAuthToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/courses/fetch-career-outcomes/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch career outcomes');
      }
      const data = await response.json();
      setCareerOutcomes(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingCareerOutcomes(false);
    }
  };

  const fetchAdmissionRequirements = async (courseId: string) => {
    setLoadingAdmissionRequirements(true);
    try {
      const authToken = await getAuthToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/courses/fetch-admission-requirements/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch admission requirements');
      }
      const data = await response.json();
      setAdmissionRequirements(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingAdmissionRequirements(false);
    }
  };

  const handleCourseSelect = async (course: Course) => {
    setSelectedCourse(course);
    await Promise.all([
      fetchUniversityInfo(course.id),
      fetchCareerOutcomes(course.id),
      fetchAdmissionRequirements(course.id)
    ]);
  };

  const filteredCourses = courses
    .filter(course => 
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(course => !selectedCategory || course.category === selectedCategory)
    .sort((a, b) => {
      switch (sortBy) {
        case 'atar':
          return b.atar_requirement - a.atar_requirement;
        case 'duration':
          return a.duration.localeCompare(b.duration);
        default:
          return 0;
      }
    });

  const categories = Array.from(new Set(courses.map(course => course.category)));

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Course Explorer</h1>
      
      {/* Search and Filter Section */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Search courses..."
            className="flex-1 p-2 border rounded min-w-[200px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="p-2 border rounded"
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(e.target.value || null)}
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <select
            className="p-2 border rounded"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'atar' | 'duration')}
          >
            <option value="atar">Sort by ATAR</option>
            <option value="duration">Sort by Duration</option>
          </select>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Courses List */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCourses.map((course) => (
              <div 
                key={course.id} 
                className={`bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer ${
                  selectedCourse?.id === course.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => handleCourseSelect(course)}
              >
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-2">{course.title}</h2>
                  <p className="text-gray-600 mb-4">{course.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-semibold">University:</span>
                      <span>{course.university}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">ATAR Requirement:</span>
                      <span className="text-blue-600 font-medium">{course.atar_requirement}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Duration:</span>
                      <span>{course.duration}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed View */}
        <div className="lg:col-span-1">
          {selectedCourse && (
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
              <h2 className="text-2xl font-bold mb-4">{selectedCourse.title}</h2>
              
              {/* University Info Section */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">University Information</h3>
                {loadingUniversityInfo ? (
                  <div className="animate-pulse space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ) : universityInfo ? (
                  <div className="space-y-4">
                    <div>
                      <span className="font-medium">University Rank:</span> {universityInfo.university_rank}
                    </div>
                    <div>
                      <span className="font-medium">Faculty Info:</span> {universityInfo.faculty_info}
                    </div>
                    <div>
                      <span className="font-medium">Campus Facilities:</span>
                      <ul className="list-disc list-inside text-gray-600">
                        {universityInfo.campus_facilities.map((facility, index) => (
                          <li key={index}>{facility}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <span className="font-medium">Student Support:</span>
                      <ul className="list-disc list-inside text-gray-600">
                        {universityInfo.student_support.map((support, index) => (
                          <li key={index}>{support}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <span className="font-medium">International Rankings:</span>
                      <ul className="list-disc list-inside text-gray-600">
                        <li>QS: {universityInfo.international_rankings.QS}</li>
                        <li>Times Higher Education: {universityInfo.international_rankings['Times Higher Education']}</li>
                      </ul>
                    </div>
                    <div>
                      <span className="font-medium">Research Opportunities:</span>
                      <ul className="list-disc list-inside text-gray-600">
                        {universityInfo.research_opportunities.map((opportunity, index) => (
                          <li key={index}>{opportunity}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <span className="font-medium">Student Life:</span>
                      <div className="mt-2">
                        <h4 className="font-medium">Clubs:</h4>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {universityInfo.student_life.clubs.map((club, index) => (
                            <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                              {club}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="mt-2">
                        <h4 className="font-medium">Events:</h4>
                        <ul className="list-disc list-inside text-gray-600">
                          {universityInfo.student_life.events.map((event, index) => (
                            <li key={index}>{event}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="mt-2">
                        <h4 className="font-medium">Facilities:</h4>
                        <ul className="list-disc list-inside text-gray-600">
                          {universityInfo.student_life.facilities.map((facility, index) => (
                            <li key={index}>{facility}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">No university information available</p>
                )}
              </div>

              {/* Career Outcomes Section */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Career Outcomes</h3>
                {loadingCareerOutcomes ? (
                  <div className="animate-pulse space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ) : careerOutcomes ? (
                  <div className="space-y-4">
                    <div>
                      <span className="font-medium">Employment Rate:</span> {careerOutcomes.employment_rate}
                    </div>
                    <div>
                      <span className="font-medium">Average Salary:</span> {careerOutcomes.average_salary}
                    </div>
                    <div>
                      <span className="font-medium">Top Employers:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {careerOutcomes.top_employers.map((employer, index) => (
                          <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                            {employer}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Career Paths:</span>
                      <div className="mt-2 space-y-2">
                        {careerOutcomes.career_paths.map((path, index) => (
                          <div key={index} className="bg-gray-50 p-2 rounded">
                            <div className="font-medium">{path.role}</div>
                            <div className="text-sm text-gray-600">
                              Salary: {path.salary_range} | Growth: {path.growth_rate}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Internship Opportunities:</span>
                      <ul className="list-disc list-inside text-gray-600">
                        {careerOutcomes.internship_opportunities.map((opportunity, index) => (
                          <li key={index}>{opportunity}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <span className="font-medium">Alumni Network:</span> {careerOutcomes.alumni_network}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">No career outcomes available</p>
                )}
              </div>

              {/* Admission Requirements Section */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Admission Requirements</h3>
                {loadingAdmissionRequirements ? (
                  <div className="animate-pulse space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ) : admissionRequirements ? (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">ATAR Requirements</h4>
                      <div className="bg-gray-50 p-3 rounded">
                        <div>Minimum: {admissionRequirements.atar_requirements.minimum}</div>
                        <div>Guaranteed Entry: {admissionRequirements.atar_requirements.guaranteed_entry}</div>
                        <div>Previous Year Cutoff: {admissionRequirements.atar_requirements.previous_year_cutoff}</div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Subject Prerequisites</h4>
                      <div className="space-y-2">
                        {admissionRequirements.subject_prerequisites.map((prereq, index) => (
                          <div key={index} className="bg-gray-50 p-2 rounded">
                            <div className="font-medium">{prereq.subject}</div>
                            <div className="text-sm text-gray-600">
                              Level: {prereq.level} | Minimum Score: {prereq.minimum_score}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Additional Requirements</h4>
                      <ul className="list-disc list-inside text-gray-600">
                        {admissionRequirements.additional_requirements.map((req, index) => (
                          <li key={index}>{req}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">International Requirements</h4>
                      <div className="bg-gray-50 p-3 rounded">
                        <div>English Proficiency: {admissionRequirements.international_requirements.english_proficiency}</div>
                        <div>Academic Equivalency: {admissionRequirements.international_requirements.academic_equivalency}</div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Application Deadlines</h4>
                      <div className="bg-gray-50 p-3 rounded">
                        <div>Domestic: {admissionRequirements.application_deadlines.domestic}</div>
                        <div>International: {admissionRequirements.application_deadlines.international}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">No admission requirements available</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No courses found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default CoursesPage; 