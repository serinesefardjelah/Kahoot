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
  where
} from '@angular/fire/firestore'
import { Observable } from 'rxjs'
import { Game, GameStatus } from '../models/game'
import { Quiz } from '../models/quiz'
import { AuthService } from './auth.service'
import { User } from '@angular/fire/auth'

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private readonly firestore = inject(Firestore)
  private readonly authService = inject(AuthService)

  /**
   * Called when admin clicks ▶ on a quiz card.
   * Creates a new game doc in /games and returns the generated gameId.
   */
  async createGame(quiz: Quiz, host: User): Promise<string> {
    const gamesCollection = collection(this.firestore, 'games')
    const gameRef = doc(gamesCollection)

    const game: Omit<Game, 'id' | 'players'> & { hostId: string } = {
      quiz,
      hostId: host.uid,
      entryCode: this.generateEntryCode(),
      status: 'waiting',
      createdAt: new Date(),
      currentQuestionIndex: 0,
      currentQuestionStatus: 'in-progress'
    }

    await setDoc(gameRef, game)
    return gameRef.id
  }

  /**
   * Get a single game by id, updates in real-time via Firestore.
   */
  getById(gameId: string): Observable<Game> {
    const gameDoc = doc(this.firestore, `games/${gameId}`)
    return docData(gameDoc, { idField: 'id' }) as Observable<Game>
  }

  /**
   * Find a waiting game by its entry code.
   */
  getByEntryCode(entryCode: string): Observable<Game[]> {
    const gamesCollection = collection(this.firestore, 'games')
    const q = query(
      gamesCollection,
      where('entryCode', '==', entryCode.toUpperCase()),
      where('status', '==', 'waiting')
    )
    return collectionData(q, { idField: 'id' }) as Observable<Game[]>
  }

  /**
   * Add a player to the game's players subcollection.
   */
  async joinGame(
    gameId: string,
    player: { uid: string; alias: string }
  ): Promise<void> {
    const playerRef = doc(
      this.firestore,
      `games/${gameId}/players/${player.uid}`
    )
    await setDoc(playerRef, { uid: player.uid, alias: player.alias })
  }

  /**
   * Get all players in a game, real-time.
   */
  getPlayers(gameId: string): Observable<{ uid: string; alias: string }[]> {
    const playersCollection = collection(
      this.firestore,
      `games/${gameId}/players`
    )
    return collectionData(playersCollection, { idField: 'uid' }) as Observable<
      { uid: string; alias: string }[]
    >
  }

  /**
   * Host starts the game.
   */
  startGame(gameId: string): Promise<void> {
    const gameDoc = doc(this.firestore, `games/${gameId}`)
    return updateDoc(gameDoc, { status: 'in-progress' satisfies GameStatus })
  }

  /**
   * Host advances to the next question.
   */
  nextQuestion(gameId: string, currentIndex: number): Promise<void> {
    const gameDoc = doc(this.firestore, `games/${gameId}`)
    return updateDoc(gameDoc, {
      currentQuestionIndex: currentIndex + 1,
      currentQuestionStatus: 'in-progress'
    })
  }

  /**
   * Host ends the game.
   */
  endGame(gameId: string): Promise<void> {
    const gameDoc = doc(this.firestore, `games/${gameId}`)
    return updateDoc(gameDoc, { status: 'finished' satisfies GameStatus })
  }

  /**
   * Submit a player's answer for a question.
   */
  async submitAnswer(
    gameId: string,
    userId: string,
    questionIndex: number,
    choiceIndex: number
  ): Promise<void> {
    const answerId = `${userId}_${questionIndex}`
    const answerRef = doc(this.firestore, `games/${gameId}/answers/${answerId}`)
    await setDoc(answerRef, {
      userId,
      questionIndex,
      choiceIndex,
      answeredAt: new Date()
    })
  }

  /**
   * Generates a random 4-character uppercase entry code e.g. "AB12"
   */
  private generateEntryCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    return Array.from({ length: 4 }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join('')
  }
}
