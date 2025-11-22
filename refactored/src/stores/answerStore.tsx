'use client'

import { createContext, useContext, useState, ReactNode, useMemo } from 'react'
import { QUESTION_LENGTH } from '@/constants/question'
import { USER_LENGTH } from '@/constants/user'
import type { Answer } from '@/types/answer'
import type { ArtistMember } from '@/types/answer'
import type { Member } from '@/services/members'

interface AnswerStoreContextType {
  answers: Map<string, Answer>
  updateAnswer: (id: string, artistMember: ArtistMember | Member | null) => void
  resetAnswers: () => void
  getAnswer: (id: string) => Answer | undefined
  getAllAnswers: () => Answer[]
  getAllSingleAnswers: () => Answer[]
}

const AnswerStoreContext = createContext<
  AnswerStoreContextType | undefined
>(undefined)

const generateAnswerIds = () => {
  const ids: string[] = []
  for (let i = 0; i < USER_LENGTH; i++) {
    for (let j = 0; j < QUESTION_LENGTH; j++) {
      ids.push(`multi-u${i}-${j}`)
    }
  }
  return ids
}

const generateSingleAnswerIds = () => {
  const ids: string[] = []
  for (let i = 0; i < QUESTION_LENGTH; i++) {
    ids.push(`single-${i}`)
  }
  return ids
}

const initializeAnswers = (): Map<string, Answer> => {
  const answersMap = new Map<string, Answer>()

  // Multi-user answers
  const multiIds = generateAnswerIds()
  multiIds.forEach((id) => {
    answersMap.set(id, { id, artistMember: null })
  })

  // Single answers
  const singleIds = generateSingleAnswerIds()
  singleIds.forEach((id) => {
    answersMap.set(id, { id, artistMember: null })
  })

  return answersMap
}

export const AnswerStoreProvider = ({
  children,
}: {
  children: ReactNode
}) => {
  const [answers, setAnswers] = useState<Map<string, Answer>>(
    initializeAnswers(),
  )

  const updateAnswer = (
    id: string,
    artistMember: ArtistMember | Member | null,
  ) => {
    setAnswers((prev) => {
      const newMap = new Map(prev)
      const existing = newMap.get(id) || { id, artistMember: null }
      newMap.set(id, { ...existing, artistMember })
      return newMap
    })
  }

  const resetAnswers = () => {
    setAnswers(initializeAnswers())
  }

  const getAnswer = (id: string) => {
    return answers.get(id)
  }

  const getAllAnswers = () => {
    const multiIds = generateAnswerIds()
    return multiIds.map((id) => answers.get(id) || { id, artistMember: null })
  }

  const getAllSingleAnswers = () => {
    const singleIds = generateSingleAnswerIds()
    return singleIds.map(
      (id) => answers.get(id) || { id, artistMember: null },
    )
  }

  const value = useMemo(
    () => ({
      answers,
      updateAnswer,
      resetAnswers,
      getAnswer,
      getAllAnswers,
      getAllSingleAnswers,
    }),
    [answers],
  )

  return (
    <AnswerStoreContext.Provider value={value}>
      {children}
    </AnswerStoreContext.Provider>
  )
}

export const useAnswerStore = () => {
  const context = useContext(AnswerStoreContext)
  if (!context) {
    throw new Error('useAnswerStore must be used within AnswerStoreProvider')
  }
  return context
}

