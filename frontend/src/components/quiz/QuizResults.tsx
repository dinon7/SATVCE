'use client';

import { useState, useEffect } from 'react';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';

interface QuizResult {
  id: string;
  score: number;
  answers: Record<string, string>;
  created_at: string;
  subject: {
    id: string;
    name: string;
    description: string;
  };
}

export default function QuizResults() {
  const [results, setResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await fetch('/api/quiz/results');

        if (!response.ok) {
          throw new Error('Failed to fetch quiz results');
        }

        const data = await response.json();
        setResults(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (results.length === 0) {
    return (
      <div className="text-center text-gray-500">
        No quiz results yet. Take a quiz to see your results!
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {results.map((result) => (
        <div key={result.id} className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-semibold">{result.subject.name}</h3>
              <p className="text-gray-600">{result.subject.description}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-500">
                {result.score}%
              </div>
              <div className="text-sm text-gray-500">
                {new Date(result.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
          <div className="border-t pt-4">
            <h4 className="font-semibold mb-2">Your Answers:</h4>
            <div className="space-y-2">
              {Object.entries(result.answers).map(([questionId, answer]) => (
                <div key={questionId} className="text-sm">
                  <span className="font-medium">Q: </span>
                  {answer}
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 