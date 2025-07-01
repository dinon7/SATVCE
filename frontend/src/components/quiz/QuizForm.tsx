'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
}

interface QuizFormProps {
  subjectId: string;
  questions: Question[];
}

export default function QuizForm({ subjectId, questions }: QuizFormProps) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Calculate score
      const score = questions.reduce((total, question) => {
        return total + (answers[question.id] === question.correctAnswer ? 1 : 0);
      }, 0);

      const response = await fetch('/api/quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subjectId,
          answers,
          score,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit quiz');
      }

      router.push('/quiz/results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <ErrorMessage message={error} />}
      
      {questions.map((question, index) => (
        <div key={question.id} className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">
            Question {index + 1}: {question.text}
          </h3>
          <div className="space-y-2">
            {question.options.map((option) => (
              <label
                key={option}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={answers[question.id] === option}
                  onChange={(e) =>
                    setAnswers((prev) => ({
                      ...prev,
                      [question.id]: e.target.value,
                    }))
                  }
                  className="form-radio text-blue-500"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </div>
      ))}

      <button
        type="submit"
        disabled={loading || Object.keys(answers).length !== questions.length}
        className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? <LoadingSpinner /> : 'Submit Quiz'}
      </button>
    </form>
  );
} 