import { Quiz } from './quiz'

export type GameStatus = 'waiting' | 'in-progress' | 'finished'
export type QuestionStatus = 'question' | 'results' | 'scoreboard'

export interface GamePlayer {
  uid: string
  alias: string
}

export interface GameAnswer {
  userId: string
  questionIndex: number
  choiceIndex: number
  answeredAt: Date
  timeMs: number
}

export interface Game {
  id: string
  quiz: Quiz
  hostId: string
  createdAt: Date
  status: GameStatus
  entryCode: string
  currentQuestionIndex: number
  currentQuestionStatus: QuestionStatus
  questionStartedAt: number
}
