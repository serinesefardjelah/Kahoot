import { Component, input, output } from '@angular/core'
import {
  IonContent,
  IonButton,
  IonList,
  IonItem,
  IonLabel,
  IonBadge
} from '@ionic/angular/standalone'
import { PageHeaderComponent } from '../components/page-header'
import { GamePlayer } from '../models/game'

@Component({
  selector: 'app-game-lobby',
  template: `
    <app-page-header [translucent]="true">Game Lobby</app-page-header>
    <ion-content [fullscreen]="true" class="ion-padding">
      <app-page-header collapse="condense">Game Lobby</app-page-header>

      <div style="text-align:center;margin:2rem 0">
        <p style="color:var(--ion-color-medium)">
          Share this code with players
        </p>
        <h1
          style="font-size:4rem;font-weight:bold;letter-spacing:0.5rem;color:var(--ion-color-primary)"
        >
          {{ entryCode() }}
        </h1>
      </div>

      <p style="font-weight:600">Players joined ({{ players().length }})</p>
      <ion-list>
        @for (player of players(); track player.uid) {
          <ion-item>
            <ion-label>{{ player.alias }}</ion-label>
            <ion-badge slot="end" color="success">Ready</ion-badge>
          </ion-item>
        } @empty {
          <ion-item>
            <ion-label color="medium">Waiting for players to join...</ion-label>
          </ion-item>
        }
      </ion-list>

      @if (isHost()) {
        <ion-button
          expand="block"
          style="margin-top:2rem"
          [disabled]="!players().length"
          (click)="startGame.emit()"
        >
          Start Game
        </ion-button>
      } @else {
        <p
          style="text-align:center;color:var(--ion-color-medium);margin-top:2rem"
        >
          Waiting for the host to start...
        </p>
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
    PageHeaderComponent
  ]
})
export class GameLobbyComponent {
  readonly entryCode = input.required<string>()
  readonly players = input.required<GamePlayer[]>()
  readonly isHost = input.required<boolean>()
  readonly startGame = output<void>()
}
