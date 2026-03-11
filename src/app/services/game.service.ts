import { inject, Injectable } from '@angular/core'
import {
  Firestore,
  collection,
  doc,
  setDoc,
  docData,
  collectionData,
  updateDoc,
  query,
  where,
  getDocs
} from '@angular/fire/firestore'
import { Observable } from 'rxjs'
import { Game, GameAnswer, GamePlayer } from '../models/game'
import { Quiz } from '../models/quiz'
import { Question } from '../models/question'
import { User } from '@angular/fire/auth'

@Injectable({ providedIn: 'root' })
export class GameService {
  private readonly firestore = inject(Firestore)

  async createGame(quiz: Quiz, host: User): Promise<string> {
    const gameRef = doc(collection(this.firestore, 'games'))
    await setDoc(gameRef, {
      // store only quiz metadata, NOT questions (they live in subcollection)
      quiz: { id: quiz.id, title: quiz.title, description: quiz.description },
      hostId: host.uid,
      entryCode: this.generateEntryCode(),
      status: 'waiting',
      createdAt: new Date(),
      currentQuestionIndex: 0,
      currentQuestionStatus: 'question',
      questionStartedAt: Date.now()
    })
    return gameRef.id
  }

  getById(gameId: string): Observable<Game> {
    return docData(doc(this.firestore, `games/${gameId}`), {
      idField: 'id'
    }) as Observable<Game>
  }

  getByEntryCode(entryCode: string): Observable<Game[]> {
    const q = query(
      collection(this.firestore, 'games'),
      where('entryCode', '==', entryCode.toUpperCase()),
      where('status', '==', 'waiting')
    )
    return collectionData(q, { idField: 'id' }) as Observable<Game[]>
  }

  async joinGame(gameId: string, player: GamePlayer): Promise<void> {
    await setDoc(
      doc(this.firestore, `games/${gameId}/players/${player.uid}`),
      player
    )
  }

  getPlayers(gameId: string): Observable<GamePlayer[]> {
    return collectionData(
      collection(this.firestore, `games/${gameId}/players`),
      { idField: 'uid' }
    ) as Observable<GamePlayer[]>
  }

  getAnswersForQuestion(
    gameId: string,
    questionIndex: number
  ): Observable<GameAnswer[]> {
    const q = query(
      collection(this.firestore, `games/${gameId}/answers`),
      where('questionIndex', '==', questionIndex)
    )
    return collectionData(q) as Observable<GameAnswer[]>
  }

  startGame(gameId: string): Promise<void> {
    return updateDoc(doc(this.firestore, `games/${gameId}`), {
      status: 'in-progress',
      currentQuestionIndex: 0,
      currentQuestionStatus: 'question',
      questionStartedAt: Date.now()
    })
  }

  showResults(gameId: string): Promise<void> {
    return updateDoc(doc(this.firestore, `games/${gameId}`), {
      currentQuestionStatus: 'results'
    })
  }

  showScoreboard(gameId: string): Promise<void> {
    return updateDoc(doc(this.firestore, `games/${gameId}`), {
      currentQuestionStatus: 'scoreboard'
    })
  }

  async nextQuestion(
    gameId: string,
    currentIndex: number,
    totalQuestions: number
  ): Promise<void> {
    const isLast = currentIndex + 1 >= totalQuestions
    await updateDoc(
      doc(this.firestore, `games/${gameId}`),
      isLast
        ? { status: 'finished' }
        : {
            currentQuestionIndex: currentIndex + 1,
            currentQuestionStatus: 'question',
            questionStartedAt: Date.now()
          }
    )
  }

  async submitAnswer(
    gameId: string,
    userId: string,
    questionIndex: number,
    choiceIndex: number,
    questionStartedAt: number
  ): Promise<void> {
    const timeMs = Date.now() - questionStartedAt
    await setDoc(
      doc(this.firestore, `games/${gameId}/answers/${userId}_${questionIndex}`),
      { userId, questionIndex, choiceIndex, answeredAt: new Date(), timeMs }
    )
  }

  async computeScores(
    gameId: string,
    quizId: string
  ): Promise<{ uid: string; alias: string; score: number }[]> {
    const [playersSnap, answersSnap, questionsSnap] = await Promise.all([
      getDocs(collection(this.firestore, `games/${gameId}/players`)),
      getDocs(collection(this.firestore, `games/${gameId}/answers`)),
      getDocs(collection(this.firestore, `quizzes/${quizId}/questions`))
    ])

    const players = playersSnap.docs.map((d) => d.data() as GamePlayer)
    const answers = answersSnap.docs.map((d) => d.data() as GameAnswer)
    const questions = questionsSnap.docs.map((d) => d.data() as Question)

    return players
      .map((player) => {
        const score = answers
          .filter((a) => a.userId === player.uid)
          .reduce((total, answer) => {
            const question = questions[answer.questionIndex]
            if (!question) return total
            if (answer.choiceIndex !== question.correctChoiceIndex) return total
            const speedBonus = Math.max(
              0,
              1000 - Math.floor(answer.timeMs / 20)
            )
            return total + 1000 + speedBonus
          }, 0)
        return { uid: player.uid, alias: player.alias, score }
      })
      .sort((a, b) => b.score - a.score)
  }

  private generateEntryCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    return Array.from({ length: 4 }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join('')
  }
}
