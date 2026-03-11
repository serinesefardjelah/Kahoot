import { Component, inject, input, OnInit } from '@angular/core'
import { rxResource, toSignal } from '@angular/core/rxjs-interop'
import {
  IonContent,
  IonButton,
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
  IonSpinner
} from '@ionic/angular/standalone'
import { PageHeaderComponent } from '../components/page-header'
import { GameService } from '../services/game.service'
import { AuthService } from '../services/auth.service'
import { Router } from '@angular/router'

@Component({
  selector: 'app-game',
  template: `
    <app-page-header [translucent]="true">Game Lobby</app-page-header>

    <ion-content [fullscreen]="true" class="ion-padding">
      <app-page-header collapse="condense">Game Lobby</app-page-header>

      @let game = gameResource.value();
      @let players = playersResource.value();

      @if (game) {
        <!-- Entry code display -->
        <div style="text-align: center; margin: 2rem 0;">
          <p style="font-size: 1rem; color: var(--ion-color-medium)">
            Share this code with players
          </p>
          <h1
            style="font-size: 4rem; font-weight: bold; letter-spacing: 0.5rem; color: var(--ion-color-primary)"
          >
            {{ game.entryCode }}
          </h1>
        </div>

        <!-- Players list -->
        <p style="font-weight: 600; margin-bottom: 0.5rem;">
          Players joined ({{ players?.length ?? 0 }})
        </p>
        <ion-list>
          @for (player of players; track player.uid) {
            <ion-item>
              <ion-label>{{ player.alias }}</ion-label>
              <ion-badge slot="end" color="success">Ready</ion-badge>
            </ion-item>
          } @empty {
            <ion-item>
              <ion-label color="medium">
                No players yet — waiting for players to join...
              </ion-label>
            </ion-item>
          }
        </ion-list>

        <!-- Start button (only shown to the host) -->
        @if (isHost()) {
          <ion-button
            expand="block"
            style="margin-top: 2rem"
            [disabled]="!players?.length"
            (click)="startGame()"
          >
            Start Game
          </ion-button>
        } @else {
          <p
            style="text-align:center; color: var(--ion-color-medium); margin-top: 2rem"
          >
            Waiting for the host to start the game...
          </p>
        }
      } @else {
        <div style="display:flex; justify-content:center; margin-top: 4rem">
          <ion-spinner></ion-spinner>
        </div>
      }
    </ion-content>
  `,
  imports: [
    IonContent,
    IonButton,
    IonList,
    IonItem,
    IonLabel,
    IonBadge,
    IonSpinner,
    PageHeaderComponent
  ]
})
export class GamePage {
  private readonly gameService = inject(GameService)
  private readonly authService = inject(AuthService)
  private readonly router = inject(Router)

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

  isHost() {
    const game = this.gameResource.value() as any
    return game?.hostId === this.connectedUser()?.uid
  }

  async startGame() {
    await this.gameService.startGame(this.gameId())
    // TODO: navigate to in-game question page
  }
}
