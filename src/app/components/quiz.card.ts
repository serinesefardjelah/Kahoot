import { Component, inject, input } from '@angular/core'
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonButton,
  IonIcon,
  IonBadge
} from '@ionic/angular/standalone'
import { Quiz } from '../models/quiz'
import { RouterLink, Router } from '@angular/router'
import { TitleCasePipe } from '@angular/common'
import { playCircle, helpCircleOutline } from 'ionicons/icons'
import { addIcons } from 'ionicons'
import { GameService } from '../services/game.service'
import { AuthService } from '../services/auth.service'
import { firstValueFrom } from 'rxjs'

@Component({
  selector: 'app-quiz-card',
  template: `
    @let quiz = this.quiz();
    <ion-card class="quiz-card" [routerLink]="'/quiz/' + quiz.id">
      <div class="card-accent"></div>
      <ion-card-header>
        <div class="card-top">
          <div class="card-info">
            <ion-card-title class="card-title">
              {{ quiz.title | titlecase }}
            </ion-card-title>
            <ion-card-subtitle class="card-subtitle">
              <ion-icon
                name="help-circle-outline"
                style="vertical-align:middle;margin-right:4px"
              ></ion-icon>
              {{ quiz.questionsCount }} questions
            </ion-card-subtitle>
          </div>
          <ion-button
            class="play-btn"
            (click)="createGame($event)"
            shape="round"
            fill="solid"
          >
            <ion-icon slot="icon-only" name="play-circle"></ion-icon>
          </ion-button>
        </div>
      </ion-card-header>

      @if (quiz.description) {
        <ion-card-content class="card-desc">
          {{ quiz.description }}
        </ion-card-content>
      }
    </ion-card>
  `,
  styles: [
    `
      .quiz-card {
        border-radius: 18px;
        overflow: hidden;
        margin: 0;
        position: relative;
        border: 1px solid rgba(192, 132, 252, 0.15);
        box-shadow: 0 4px 20px rgba(124, 58, 237, 0.15);
        cursor: pointer;
      }

      .card-accent {
        height: 4px;
        background: linear-gradient(90deg, #7c3aed, #ec4899);
      }

      .card-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;
      }

      .card-info {
        flex: 1;
        min-width: 0;
      }

      .card-title {
        font-size: 1rem;
        font-weight: 700;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .card-subtitle {
        font-size: 0.8rem;
        margin-top: 0.2rem;
        color: var(--ion-color-medium);
      }

      .play-btn {
        --background: linear-gradient(135deg, #7c3aed, #a855f7);
        --border-radius: 50%;
        --box-shadow: 0 4px 14px rgba(124, 58, 237, 0.45);
        width: 44px;
        height: 44px;
        flex-shrink: 0;
        font-size: 1.4rem;
      }

      .card-desc {
        font-size: 0.875rem;
        color: var(--ion-color-medium);
        padding-top: 0;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    `
  ],
  imports: [
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonButton,
    IonIcon,
    IonBadge,
    RouterLink,
    TitleCasePipe
  ]
})
export class QuizCardComponent {
  readonly quiz = input.required<Quiz>()

  private readonly gameService = inject(GameService)
  private readonly authService = inject(AuthService)
  private readonly router = inject(Router)

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
