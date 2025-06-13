'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

// Define types client-side if backend schemas are not directly accessible
interface SuggestionResult {
  subject: string;
  relatedUniversityCourses: string[];
  requiredPrerequisites: string[];
  jobRoles: string[];
  salaryRange: string;
  industryGrowth: string;
  studyPathways: string[];
  aiReasoning?: string;
}

interface ClientSuggestionResponse {
    id: string;
    userId: string;
    suggestions: SuggestionResult[];
    createdAt: string;
}

interface ClientResourceResponse {
    id: string;
    title: string;
    url: string;
    description: string;
    tags: string[];
    createdBy: string;
    createdAt: string;
}


const SuggestionsAndResourcesPage = () => {
  const { user, loading: authLoading, getAuthToken } = useAuth();
  const router = useRouter();
  const [suggestions, setSuggestions] = useState<ClientSuggestionResponse | null>(null);
  const [resources, setResources] = useState<ClientResourceResponse[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);
  const [loadingResources, setLoadingResources] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  // Fetch Suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!user) return; // Don't fetch if not authenticated
      
      try {
        const authToken = await getAuthToken();
        if (!authToken) {
          setError('Authentication required');
          setLoadingSuggestions(false);
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/suggestions`, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            setError('Authentication required. Please log in.');
          } else {
            setError(`Error fetching suggestions: ${response.statusText}`);
          }
          setLoadingSuggestions(false);
          return;
        }

        const data: ClientSuggestionResponse = await response.json();
        setSuggestions(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoadingSuggestions(false);
      }
    };

    fetchSuggestions();
  }, [user, getAuthToken]); // Add dependencies

  // Fetch Resources
  useEffect(() => {
    const fetchResources = async () => {
      setLoadingResources(true);
      setError(null); // Clear previous errors
      try {
        const url = selectedTag 
          ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/resources?tag=${selectedTag}`
          : `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/resources`;
          
        const response = await fetch(url);

        if (!response.ok) {
             setError(`Error fetching resources: ${response.statusText}`);
             setLoadingResources(false);
             return;
        }

        const data: ClientResourceResponse[] = await response.json();
        setResources(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoadingResources(false);
      }
    };

    fetchResources();
  }, [selectedTag]); // Rerun when selectedTag changes

  if (authLoading) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Suggestions & Resources</h1>

      {/* Suggestions Section */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Further Suggestions</h2>
        {loadingSuggestions && <p>Loading suggestions...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}
        {suggestions && suggestions.suggestions.length > 0 ? (
          <div>
            {suggestions.suggestions.map((suggestion, index) => (
              <div key={index} className="bg-white p-4 shadow rounded mb-4">
                <h3 className="text-lg font-bold">{suggestion.subject}</h3>
                <p><strong>Related University Courses:</strong> {suggestion.relatedUniversityCourses.join(', ')}</p>
                <p><strong>Required Prerequisites:</strong> {suggestion.requiredPrerequisites.join(', ')}</p>
                <p><strong>Job Roles:</strong> {suggestion.jobRoles.join(', ')}</p>
                <p><strong>Salary Range:</strong> {suggestion.salaryRange}</p>
                <p><strong>Industry Growth:</strong> {suggestion.industryGrowth}</p>
                <p><strong>Study Pathways:</strong> {suggestion.studyPathways.join(', ')}</p>
                {suggestion.aiReasoning && <p><strong>AI Reasoning:</strong> {suggestion.aiReasoning}</p>}
              </div>
            ))}
          </div>
        ) : (!loadingSuggestions && !error && <p>No suggestions available yet.</p>)}
      </section>

      {/* Resources Section */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Educational Resources</h2>
        
        {/* Tag Filter */}
        <div className="mb-4">
            <strong>Filter by Tag:</strong>
            <button 
                className={`ml-2 px-3 py-1 rounded ${selectedTag === null ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                onClick={() => setSelectedTag(null)}
            >
                All
            </button>
            {/* TODO: Fetch available tags from backend or define a list */}
            {['study skills', 'careers', 'exam prep', 'uni admissions', 'university', 'prerequisites', 'atar', 'planning', 'vcaa'].map(tag => (
                 <button 
                    key={tag}
                    className={`ml-2 px-3 py-1 rounded ${selectedTag === tag ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    onClick={() => setSelectedTag(tag)}
                >
                    {tag}
                </button>
            ))}
        </div>

        {loadingResources && <p>Loading resources...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}
        {resources.length > 0 ? (
          <div>
            {resources.map((resource) => (
              <div key={resource.id} className="bg-white p-4 shadow rounded mb-4">
                <h3 className="text-lg font-bold">{resource.title}</h3>
                <p>{resource.description}</p>
                <p><a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{resource.url}</a></p>
                <p><strong>Tags:</strong> {resource.tags.join(', ')}</p>
              </div>
            ))}
          </div>
        ) : (!loadingResources && !error && <p>No resources available yet.</p>)}
      </section>
    </div>
  );
};

export default SuggestionsAndResourcesPage; 