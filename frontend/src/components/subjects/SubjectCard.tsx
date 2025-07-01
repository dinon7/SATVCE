"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Subject {
  id: string;
  name: string;
  description: string;
  difficulty: number;
  tags: string[];
}

interface SubjectCardProps {
  subject: Subject;
}

const SubjectCard: React.FC<SubjectCardProps> = ({ subject }) => {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>{subject.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-4">{subject.description}</p>
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium">Difficulty: {subject.difficulty}/5</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-auto">
          {subject.tags?.map(tag => (
            <Badge key={tag} variant="secondary">{tag}</Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SubjectCard; 