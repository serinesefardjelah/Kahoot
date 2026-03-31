import { Component, inject, input, output, signal } from '@angular/core'
import {
  IonContent,
  IonButton,
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
  IonIcon,
  ToastController
} from '@ionic/angular/standalone'
import { PageHeaderComponent } from '../components/page-header'
import { GamePlayer } from '../models/game'
import { addIcons } from 'ionicons'
import { copyOutline, qrCodeOutline, closeOutline } from 'ionicons/icons'

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

        <!-- Entry code with copy button -->
        <div
          style="display:flex;align-items:center;justify-content:center;gap:1rem"
        >
          <h1
            style="font-size:4rem;font-weight:bold;letter-spacing:0.5rem;color:var(--ion-color-primary);margin:0;cursor:pointer"
            (click)="copyCode()"
          >
            {{ entryCode() }}
          </h1>
          <ion-button
            fill="clear"
            (click)="copyCode()"
            style="margin-top:0.5rem"
          >
            <ion-icon name="copy-outline" style="font-size:1.5rem"></ion-icon>
          </ion-button>
        </div>

        <p
          style="color:var(--ion-color-medium);font-size:0.8rem;margin-top:0.25rem"
        >
          tap code to copy
        </p>

        <!-- QR Code toggle button -->
        <ion-button
          fill="outline"
          size="small"
          style="margin-top:1rem"
          (click)="showQr.set(!showQr())"
        >
          <ion-icon
            [name]="showQr() ? 'close-outline' : 'qr-code-outline'"
            slot="start"
          ></ion-icon>
          {{ showQr() ? 'Hide QR Code' : 'Show QR Code' }}
        </ion-button>

        <!-- QR Code display -->
        @if (showQr()) {
          <div
            style="margin-top:1.5rem;display:flex;flex-direction:column;align-items:center;gap:0.5rem"
          >
            <img
              [src]="qrUrl()"
              alt="QR Code to join game"
              style="width:200px;height:200px;border-radius:12px;border:3px solid var(--ion-color-primary)"
            />
            <p style="color:var(--ion-color-medium);font-size:0.8rem">
              Scan to join directly
            </p>
          </div>
        }
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
    IonIcon,
    PageHeaderComponent
  ]
})
export class GameLobbyComponent {
  readonly entryCode = input.required<string>()
  readonly players = input.required<GamePlayer[]>()
  readonly isHost = input.required<boolean>()
  readonly startGame = output<void>()

  readonly showQr = signal(false)

  private readonly toastCtrl = inject(ToastController)
  readonly gameId = input.required<string>()

  constructor() {
    addIcons({ copyOutline, qrCodeOutline, closeOutline })
  }

  // QR points to the join-game page of your deployed app
  // Players scan it, land on /join-game, and type the code
  // OR we can encode the code directly in the URL if join-game supports it

  qrUrl() {
    const joinUrl = `https://kahoot-aaa4f.web.app/game/${this.gameId()}`
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(joinUrl)}`
  }

  async copyCode() {
    await navigator.clipboard.writeText(this.entryCode())
    const toast = await this.toastCtrl.create({
      message: '✓ Code copied to clipboard!',
      duration: 1500,
      color: 'success',
      position: 'top'
    })
    toast.present()
  }
}
