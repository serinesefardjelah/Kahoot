import {
  Component,
  computed,
  inject,
  input,
  OnDestroy,
  OnInit,
  signal,
  effect
} from '@angular/core'
import { rxResource, toSignal } from '@angular/core/rxjs-interop'
import { IonContent, IonSpinner } from '@ionic/angular/standalone'
import { GameService } from '../services/game.service'
import { AuthService } from '../services/auth.service'
import { Router } from '@angular/router'
import { interval, Subscription } from 'rxjs'
import { GameLobbyComponent } from './game-lobby.component'
import { GameQuestionComponent } from './game-question.component'
import { GameResultsComponent } from './game-results.component'
import { GameScoreboardComponent } from './game-scoreboard.component'
import { QuizService } from '../services/quiz.service'

const QUESTION_TIME_SEC = 20

@Component({
  selector: 'app-game',
  template: `
    @let game = gameResource.value();
    @let players = playersResource.value() ?? [];

    @if (!game) {
      <ion-content
        class="ion-padding"
        style="display:flex;justify-content:center;padding-top:4rem"
      >
        <ion-spinner></ion-spinner>
      </ion-content>
    }

    @if (game && game.status === 'waiting') {
      <app-game-lobby
        [entryCode]="game.entryCode"
        [players]="players"
        [isHost]="isHost()"
        (startGame)="startGame()"
      />
    }

    @if (
      game &&
      game.status === 'in-progress' &&
      game.currentQuestionStatus === 'question' &&
      currentQuestion()
    ) {
      <app-game-question
        [question]="currentQuestion()!"
        [questionIndex]="game.currentQuestionIndex"
        [total]="questionsResource.value()?.length ?? 0"
        [isHost]="isHost()"
        [hasAnswered]="hasAnswered()"
        [selectedChoice]="selectedChoice()"
        [timeLeft]="timeLeft()"
        [timerProgress]="timerProgress()"
        [answers]="answersResource.value() ?? []"
        [playerCount]="players.length"
        [players]="players"
        (answer)="submitAnswer($event)"
        (showResults)="showResults()"
      />
    }

    @if (
      game &&
      game.status === 'in-progress' &&
      game.currentQuestionStatus === 'results' &&
      currentQuestion()
    ) {
      <app-game-results
        [question]="currentQuestion()!"
        [answers]="answersResource.value() ?? []"
        [isHost]="isHost()"
        (showScoreboard)="showScoreboard()"
      />
    }

    @if (
      game &&
      game.status === 'in-progress' &&
      game.currentQuestionStatus === 'scoreboard'
    ) {
      <app-game-scoreboard
        [scores]="scores()"
        [isHost]="isHost()"
        [isFinal]="false"
        [currentUserId]="connectedUser()?.uid ?? null"
        [nextLabel]="
          game.currentQuestionIndex + 1 >=
          (questionsResource.value()?.length ?? 0)
            ? 'End Game'
            : 'Next Question'
        "
        (next)="nextQuestion()"
      />
    }

    @if (game && game.status === 'finished') {
      <app-game-scoreboard
        [scores]="scores()"
        [isHost]="isHost()"
        [isFinal]="true"
        [currentUserId]="connectedUser()?.uid ?? null"
        (next)="goHome()"
      />
    }
  `,
  imports: [
    IonContent,
    IonSpinner,
    GameLobbyComponent,
    GameQuestionComponent,
    GameResultsComponent,
    GameScoreboardComponent
  ]
})
export class GamePage implements OnInit, OnDestroy {
  private readonly gameService = inject(GameService)
  private readonly authService = inject(AuthService)
  private readonly router = inject(Router)
  private readonly quizService = inject(QuizService)

  readonly gameId = input.required<string>()
  readonly connectedUser = toSignal(this.authService.getConnectedUser())

  readonly gameResource = rxResource({
    stream: ({ params }) => this.gameService.getById(params.id),
    params: () => ({ id: this.gameId() })
  })

  readonly playersResource = rxResource({
    stream: ({ params }) => this.gameService.getPlayers(params.id),
    params: () => ({ id: this.gameId() })
  })

  readonly answersResource = rxResource({
    stream: ({ params }) =>
      this.gameService.getAnswersForQuestion(params.id, params.qIdx),
    params: () => ({
      id: this.gameId(),
      qIdx: this.gameResource.value()?.currentQuestionIndex ?? 0
    })
  })

  readonly questionsResource = rxResource({
    stream: ({ params }) => this.quizService.getQuestions(params.quizId),
    params: () => ({ quizId: this.gameResource.value()?.quiz?.id ?? '' })
  })

  constructor() {
    effect(() => {
      const game = this.gameResource.value()
      if (!game) return

      const shouldLoad =
        game.status === 'finished' ||
        (game.status === 'in-progress' &&
          game.currentQuestionStatus === 'scoreboard')

      if (shouldLoad && this.scores().length === 0) {
        this.gameService
          .computeScores(this.gameId(), game.quiz.id)
          .then((s) => this.scores.set(s))
      }
    })
  }

  readonly timeLeft = signal(QUESTION_TIME_SEC)
  readonly timerProgress = computed(() => this.timeLeft() / QUESTION_TIME_SEC)
  readonly scores = signal<{ uid: string; alias: string; score: number }[]>([])
  readonly selectedChoice = signal<number | null>(null)

  private timerSub?: Subscription

  ngOnInit() {
    this.timerSub = interval(1000).subscribe(() => {
      const game = this.gameResource.value()
      if (
        game?.status === 'in-progress' &&
        game.currentQuestionStatus === 'question'
      ) {
        const elapsed = Math.floor((Date.now() - game.questionStartedAt) / 1000)
        this.timeLeft.set(Math.max(0, QUESTION_TIME_SEC - elapsed))
      }
    })
  }

  ngOnDestroy() {
    this.timerSub?.unsubscribe()
  }

  isHost(): boolean {
    return this.gameResource.value()?.hostId === this.connectedUser()?.uid
  }

  currentQuestion() {
    const game = this.gameResource.value()
    const questions = this.questionsResource.value()
    if (!game || !questions?.length) return undefined
    return questions[game.currentQuestionIndex]
  }

  hasAnswered(): boolean {
    const uid = this.connectedUser()?.uid
    const qIdx = this.gameResource.value()?.currentQuestionIndex ?? 0
    return (this.answersResource.value() ?? []).some(
      (a) => a.userId === uid && a.questionIndex === qIdx
    )
  }

  async startGame() {
    await this.gameService.startGame(this.gameId())
  }

  // async showResults() {
  //   await this.gameService.showResults(this.gameId())
  //   const game = this.gameResource.value()!
  //   this.gameService
  //     .computeScores(this.gameId(), game.quiz.id)
  //     .then((s) => this.scores.set(s))
  // }

  async showResults() {
    await this.gameService.showResults(this.gameId())
    // scores are now computed reactively via the effect above
  }

  async showScoreboard() {
    await this.gameService.showScoreboard(this.gameId())
  }

  async nextQuestion() {
    const game = this.gameResource.value()!
    const totalQuestions = this.questionsResource.value()?.length ?? 0
    this.timeLeft.set(QUESTION_TIME_SEC)
    this.selectedChoice.set(null)
    await this.gameService.nextQuestion(
      this.gameId(),
      game.currentQuestionIndex,
      totalQuestions // ← was game.quiz.questions.length
    )
  }

  async submitAnswer(choiceIndex: number) {
    const user = this.connectedUser()
    const game = this.gameResource.value()
    if (!user || !game) return
    this.selectedChoice.set(choiceIndex)
    await this.gameService.submitAnswer(
      this.gameId(),
      user.uid,
      game.currentQuestionIndex,
      choiceIndex,
      game.questionStartedAt
    )
  }

  goHome() {
    this.router.navigateByUrl('/quizzes')
  }
}
