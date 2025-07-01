"use client"

import React, { createContext, useContext, useState } from "react"

export interface QuizQuestion {
  id: string;
  text: string;
  type: string;
  options?: string[];
  min_value?: number;
  max_value?: number;
  next?: string;
}

export interface QuizAnswer {
  questionId: number
  answer: string | number | string[] | { [key: string]: number } | {
    selected: string[]
    other: string
  } | {
    subjects: string
    reason: string
  } | {
    ranking: string[]
  } | {
    selected: string[]
    other?: string
  } | {
    selected: string
    other: string
  }
}

export interface QuizState {
  currentQuestion: number
  jobStabilityImportance?: number
  idealCareerDescription?: string
  strongestAcademicAreas: string[]
  workPreference: string
  futureAttitude: string
  dreamJob: string
  careersToAvoid: string
  vceSubjects: {
    selected: string[]
    other: string
  }
  decisionInfluences: {
    selected: string[]
    other: string
  }
  prerequisitesKnowledge: number
  uncertaintyComfort: number
  completed: boolean
  problemToSolve?: string
  descriptiveWords?: string
  activities?: string
  entrepreneurialInterest?: string
  industryInterests?: {
    selected: string[]
    other: string
  }
  learningMethod?: string
  passionSalaryBalance?: number
  // Add other quiz state properties as needed
}

interface QuizContextType {
  answers: QuizAnswer[]
  quizState: QuizState
  currentQuestion: number
  setAnswer: (answer: QuizAnswer) => void
  setCurrentQuestion: (question: number) => void
  isAnswered: (questionId: number) => boolean
  getAnswer: (questionId: number) => QuizAnswer | undefined
  getAnswers: () => QuizAnswer[]
  updateQuizState: (newState: Partial<QuizState>) => Promise<void>
  clearQuizData: () => void
}

const QuizContext = createContext<QuizContextType | undefined>(undefined)

export function QuizProvider({ children }: { children: React.ReactNode }) {
  const [answers, setAnswers] = useState<QuizAnswer[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(1)
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestion: 1,
    strongestAcademicAreas: [],
    workPreference: "",
    futureAttitude: "",
    dreamJob: "",
    careersToAvoid: "",
    vceSubjects: {
      selected: [],
      other: ""
    },
    decisionInfluences: {
      selected: [],
      other: ""
    },
    prerequisitesKnowledge: 0,
    uncertaintyComfort: 0,
    completed: false
  })

  const setAnswer = (answer: QuizAnswer) => {
    setAnswers((prev) => {
      const existingIndex = prev.findIndex((a) => a.questionId === answer.questionId)
      let newAnswers
      if (existingIndex >= 0) {
        newAnswers = [...prev]
        newAnswers[existingIndex] = answer
      } else {
        newAnswers = [...prev, answer]
      }
      
      return newAnswers
    })
  }

  const isAnswered = (questionId: number) => {
    return answers.some((answer) => answer.questionId === questionId)
  }

  const getAnswer = (questionId: number) => {
    return answers.find((answer) => answer.questionId === questionId)
  }

  const getAnswers = () => {
    return answers
  }

  const updateQuizState = async (newState: Partial<QuizState>) => {
    setQuizState((prev) => ({
      ...prev,
      ...newState,
    }))
  }

  const clearQuizData = () => {
    setAnswers([])
    setCurrentQuestion(1)
    setQuizState({
      currentQuestion: 1,
      strongestAcademicAreas: [],
      workPreference: "",
      futureAttitude: "",
      dreamJob: "",
      careersToAvoid: "",
      vceSubjects: {
        selected: [],
        other: ""
      },
      decisionInfluences: {
        selected: [],
        other: ""
      },
      prerequisitesKnowledge: 0,
      uncertaintyComfort: 0,
      completed: false
    })
  }

  return (
    <QuizContext.Provider
      value={{
        answers,
        quizState,
        currentQuestion,
        setAnswer,
        setCurrentQuestion,
        isAnswered,
        getAnswer,
        getAnswers,
        updateQuizState,
        clearQuizData,
      }}
    >
      {children}
    </QuizContext.Provider>
  )
}

export function useQuiz() {
  const context = useContext(QuizContext)
  if (context === undefined) {
    throw new Error("useQuiz must be used within a QuizProvider")
  }
  return context
} 