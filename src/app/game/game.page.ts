import {
  Component,
  computed,
  inject,
  input,
  OnDestroy,
  OnInit,
  signal
} from '@angular/core'
import { rxResource, toSignal } from '@angular/core/rxjs-interop'
import { IonContent, IonSpinner } from '@ionic/angular/standalone'
import { GameService } from '../services/game.service'
import { AuthService } from '../services/auth.service'
import { QuizService } from '../services/quiz.service'
import { Router } from '@angular/router'
import { interval, Subscription } from 'rxjs'
import { GameLobbyComponent } from './game-lobby.component'
import { GameQuestionComponent } from './game-question.component'
import { GameResultsComponent } from './game-results.component'
import { GameScoreboardComponent } from './game-scoreboard.component'

const QUESTION_TIME_SEC = 20

@Component({
  selector: 'app-game',
  template: `
    @let game = gameResource.value();
    @let players = playersResource.value() ?? [];
    @let questions = questionsResource.value() ?? [];

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
        [total]="questions.length"
        [isHost]="isHost()"
        [hasAnswered]="hasAnswered()"
        [timeLeft]="timeLeft()"
        [timerProgress]="timerProgress()"
        [answeredCount]="answersResource.value()?.length ?? 0"
        [playerCount]="players.length"
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
        [nextLabel]="
          game.currentQuestionIndex + 1 >= questions.length
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
  private readonly quizService = inject(QuizService)
  private readonly router = inject(Router)

  readonly gameId = input.required<string>()
  readonly connectedUser = toSignal(this.authService.getConnectedUser())

  readonly gameResource = rxResource({
    stream: ({ params }) => this.gameService.getById(params.id),
    params: () => ({ id: this.gameId() })
  })

  // Load questions from the quiz subcollection, not from the game doc
  readonly questionsResource = rxResource({
    stream: ({ params }) => this.quizService.getQuestions(params.quizId),
    params: () => ({ quizId: this.gameResource.value()?.quiz?.id ?? '' })
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

  readonly timeLeft = signal(QUESTION_TIME_SEC)
  readonly timerProgress = computed(() => this.timeLeft() / QUESTION_TIME_SEC)
  readonly scores = signal<{ uid: string; alias: string; score: number }[]>([])

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
    const questions = this.questionsResource.value()
    const game = this.gameResource.value()
    if (!questions?.length || !game) return undefined
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

  async showResults() {
    await this.gameService.showResults(this.gameId())
    const quizId = this.gameResource.value()?.quiz?.id ?? ''
    this.gameService
      .computeScores(this.gameId(), quizId)
      .then((s) => this.scores.set(s))
  }

  async showScoreboard() {
    await this.gameService.showScoreboard(this.gameId())
  }

  async nextQuestion() {
    const game = this.gameResource.value()!
    const questions = this.questionsResource.value() ?? []
    this.timeLeft.set(QUESTION_TIME_SEC)
    await this.gameService.nextQuestion(
      this.gameId(),
      game.currentQuestionIndex,
      questions.length
    )
  }

  async submitAnswer(choiceIndex: number) {
    const user = this.connectedUser()
    const game = this.gameResource.value()
    if (!user || !game) return
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
