import { Component, inject, input } from '@angular/core'
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonButton,
  IonIcon
} from '@ionic/angular/standalone'
import { Quiz } from '../models/quiz'
import { RouterLink, Router } from '@angular/router'
import { TitleCasePipe } from '@angular/common'
import { playOutline } from 'ionicons/icons'
import { addIcons } from 'ionicons'
import { GameService } from '../services/game.service'
import { AuthService } from '../services/auth.service'
import { firstValueFrom } from 'rxjs'

@Component({
  selector: 'app-quiz-card',
  template: `
    @let quiz = this.quiz();
    <ion-card [routerLink]="'/quiz/' + quiz.id">
      <ion-card-header>
        <ion-card-title>
          {{ quiz.title | titlecase }}
          <ion-button class="ion-float-right" (click)="createGame($event)">
            <ion-icon slot="icon-only" name="play-outline"></ion-icon>
          </ion-button>
        </ion-card-title>
        <ion-card-subtitle>
          Questions: {{ quiz.questionsCount }}
        </ion-card-subtitle>
      </ion-card-header>

      <ion-card-content>
        {{ quiz.description }}
      </ion-card-content>
    </ion-card>
  `,
  imports: [
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonButton,
    IonIcon,
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
    addIcons({ playOutline })
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
