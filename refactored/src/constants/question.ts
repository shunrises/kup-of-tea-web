export const QUESTION_ITEMS = [
  '최애',
  '차애',
  '친구',
  '애인',
  '결혼',
  '이혼',
  '성격',
  '육아',
  '이상형',
] as const

export const QUESTION_LENGTH = QUESTION_ITEMS.length

export type QuestionItem = (typeof QUESTION_ITEMS)[number]
