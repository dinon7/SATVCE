'use client';

import { QuizProvider } from '@/contexts/QuizContext';

export default function QuizLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QuizProvider>
      {children}
    </QuizProvider>
  );
} 