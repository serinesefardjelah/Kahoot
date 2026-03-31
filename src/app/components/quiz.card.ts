import { Component, inject, input, computed } from '@angular/core'
import {
  IonCard,
  IonButton,
  IonIcon
} from '@ionic/angular/standalone'
import { Quiz } from '../models/quiz'
import { RouterLink, Router } from '@angular/router'
import { TitleCasePipe } from '@angular/common'
import { playCircle, helpCircleOutline } from 'ionicons/icons'
import { addIcons } from 'ionicons'
import { GameService } from '../services/game.service'
import { AuthService } from '../services/auth.service'
import { firstValueFrom } from 'rxjs'

const CARD_GRADIENTS = [
  'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
  'linear-gradient(135deg, #6d28d9 0%, #ec4899 100%)',
  'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
  'linear-gradient(135deg, #5b21b6 0%, #a855f7 100%)',
  'linear-gradient(135deg, #7c3aed 0%, #db2777 100%)',
]

@Component({
  selector: 'app-quiz-card',
  template: `
    @let quiz = this.quiz();
    <div class="quiz-card" [style.background]="gradient()" [routerLink]="'/quiz/' + quiz.id">
      <div class="card-body">
        <div class="card-icon">📋</div>
        <div class="card-content">
          <h3 class="card-title">{{ quiz.title | titlecase }}</h3>
          <p class="card-desc" *ngIf="quiz.description">{{ quiz.description }}</p>
          <span class="card-count">
            <ion-icon name="help-circle-outline"></ion-icon>
            {{ quiz.questionsCount }} questions
          </span>
        </div>
      </div>
      <button class="play-btn" (click)="createGame($event)">
        <ion-icon name="play-circle"></ion-icon>
      </button>
    </div>
  `,
  styles: [`
    .quiz-card {
      border-radius: 20px;
      padding: 1.25rem;
      cursor: pointer;
      position: relative;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: 0 6px 24px rgba(124, 58, 237, 0.25);
      margin-bottom: 0;
      min-height: 100px;
    }

    .card-body {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex: 1;
      min-width: 0;
    }

    .card-icon {
      font-size: 2rem;
      flex-shrink: 0;
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255,255,255,0.2);
      border-radius: 14px;
    }

    .card-content {
      flex: 1;
      min-width: 0;
    }

    .card-title {
      margin: 0 0 0.2rem;
      font-size: 1rem;
      font-weight: 800;
      color: #ffffff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .card-desc {
      margin: 0 0 0.35rem;
      font-size: 0.78rem;
      color: rgba(255,255,255,0.75);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .card-count {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      font-size: 0.75rem;
      font-weight: 600;
      color: rgba(255,255,255,0.8);
      background: rgba(255,255,255,0.18);
      padding: 2px 8px;
      border-radius: 100px;
    }

    .card-count ion-icon {
      font-size: 0.8rem;
    }

    .play-btn {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: rgba(255,255,255,0.25);
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      flex-shrink: 0;
      font-size: 1.5rem;
      color: white;
      transition: background 0.2s, transform 0.15s;
    }

    .play-btn:active {
      background: rgba(255,255,255,0.4);
      transform: scale(0.92);
    }
  `],
  imports: [
    IonCard, IonButton, IonIcon,
    RouterLink, TitleCasePipe
  ]
})
export class QuizCardComponent {
  readonly quiz = input.required<Quiz>()

  private readonly gameService = inject(GameService)
  private readonly authService = inject(AuthService)
  private readonly router = inject(Router)

  readonly gradient = computed(() => {
    const title = this.quiz().title ?? ''
    const index = title.charCodeAt(0) % CARD_GRADIENTS.length
    return CARD_GRADIENTS[index]
  })

  constructor() {
    addIcons({ playCircle, helpCircleOutline })
  }

  async createGame(event: MouseEvent) {
    event.stopPropagation()
    event.preventDefault()
    const user = await firstValueFrom(this.authService.getConnectedUser())
    if (!user) return
    const gameId = await this.gameService.createGame(this.quiz(), user)
    this.router.navigateByUrl(`/game/${gameId}`)
  }
}
