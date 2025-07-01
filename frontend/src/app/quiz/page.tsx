'use client';

// // import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export default function QuizPage() {
  const router = useRouter();

  const handleStartQuiz = () => {
    router.push('/quiz/1');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <motion.div
        className="max-w-2xl mx-auto p-8 bg-white rounded-lg shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-6 text-gray-900">
            VCE Career Guidance Quiz
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            Welcome to your personalized career guidance journey! This quiz will help us understand your interests, 
            strengths, and goals to provide you with tailored career recommendations.
          </p>

          <div className="bg-blue-50 p-6 rounded-lg mb-8">
            <h2 className="text-xl font-semibold mb-4 text-blue-900">What to expect:</h2>
            <ul className="text-left space-y-2 text-blue-800">
              <li>• 25 questions about your interests and preferences</li>
              <li>• Takes approximately 10-15 minutes to complete</li>
              <li>• Your answers help us match you with suitable careers</li>
              <li>• You can save your progress and return later</li>
            </ul>
          </div>

          <div className="space-y-4">
            <Button 
              onClick={handleStartQuiz}
              className="w-full py-3 text-lg"
            >
              Start Quiz
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => router.push('/')}
              className="w-full py-3 text-lg"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 