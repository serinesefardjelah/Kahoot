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
import {
  copyOutline,
  qrCodeOutline,
  closeOutline,
  personOutline
} from 'ionicons/icons'

@Component({
  selector: 'app-game-lobby',
  template: `
    <app-page-header [translucent]="true">Game Lobby</app-page-header>
    <ion-content [fullscreen]="true" class="lobby-content">
      <app-page-header collapse="condense">Game Lobby</app-page-header>

      <div class="lobby-container">
        <!-- Code section -->
        <div class="code-section">
          <p class="code-label">Share this code</p>
          <div class="code-display" (click)="copyCode()">
            <span class="code-text">{{ entryCode() }}</span>
            <ion-icon name="copy-outline" class="copy-icon"></ion-icon>
          </div>
          <p class="code-hint">Tap to copy</p>

          <ion-button
            fill="outline"
            size="small"
            class="qr-btn"
            (click)="showQr.set(!showQr())"
          >
            <ion-icon
              [name]="showQr() ? 'close-outline' : 'qr-code-outline'"
              slot="start"
            ></ion-icon>
            {{ showQr() ? 'Hide QR' : 'Show QR' }}
          </ion-button>

          @if (showQr()) {
            <div class="qr-container">
              <img [src]="qrUrl()" alt="QR Code" class="qr-image" />
              <p class="qr-hint">Scan to join</p>
            </div>
          }
        </div>

        <!-- Players section -->
        <div class="players-section">
          <p class="players-label">
            <ion-icon name="person-outline"></ion-icon>
            Players ({{ players().length }})
          </p>

          @if (!players().length) {
            <div class="waiting-msg">
              <span class="waiting-dots">···</span>
              <p>Waiting for players to join</p>
            </div>
          } @else {
            <div class="players-grid">
              @for (player of players(); track player.uid) {
                <div class="player-chip">
                  <span class="player-avatar">{{
                    player.alias[0].toUpperCase()
                  }}</span>
                  <span class="player-name">{{ player.alias }}</span>
                </div>
              }
            </div>
          }
        </div>

        <!-- Action -->
        @if (isHost()) {
          <ion-button
            expand="block"
            class="start-btn"
            [disabled]="!players().length"
            (click)="startGame.emit()"
          >
            Start Game 🚀
          </ion-button>
        } @else {
          <div class="waiting-host">
            <p>Waiting for host to start...</p>
          </div>
        }
      </div>
    </ion-content>
  `,
  styles: [
    `
      .lobby-content {
        --background: linear-gradient(
          160deg,
          #0d0621 0%,
          #190d3a 60%,
          #2d1060 100%
        );
      }

      .lobby-container {
        display: flex;
        flex-direction: column;
        gap: 1.75rem;
        padding: 1rem 1.25rem 2rem;
      }

      /* Code section */
      .code-section {
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid rgba(192, 132, 252, 0.2);
        border-radius: 20px;
        padding: 1.5rem;
        text-align: center;
        backdrop-filter: blur(16px);
      }

      .code-label {
        margin: 0 0 0.75rem;
        color: rgba(237, 233, 255, 0.5);
        font-size: 0.85rem;
        text-transform: uppercase;
        letter-spacing: 1px;
      }

      .code-display {
        display: inline-flex;
        align-items: center;
        gap: 0.75rem;
        cursor: pointer;
        padding: 0.5rem 1rem;
        border-radius: 12px;
        transition: background 0.2s;
      }

      .code-display:active {
        background: rgba(124, 58, 237, 0.15);
      }

      .code-text {
        font-size: 3.5rem;
        font-weight: 900;
        letter-spacing: 0.6rem;
        background: linear-gradient(135deg, #e879f9, #7c3aed);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .copy-icon {
        font-size: 1.4rem;
        color: rgba(192, 132, 252, 0.6);
      }

      .code-hint {
        margin: 0.25rem 0 1rem;
        color: rgba(237, 233, 255, 0.35);
        font-size: 0.75rem;
      }

      .qr-btn {
        --border-color: rgba(192, 132, 252, 0.25);
        --color: rgba(237, 233, 255, 0.7);
        --border-radius: 10px;
      }

      .qr-container {
        margin-top: 1.25rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
      }

      .qr-image {
        width: 180px;
        height: 180px;
        border-radius: 14px;
        border: 3px solid rgba(124, 58, 237, 0.5);
      }

      .qr-hint {
        margin: 0;
        color: rgba(237, 233, 255, 0.4);
        font-size: 0.75rem;
      }

      /* Players section */
      .players-section {
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(192, 132, 252, 0.12);
        border-radius: 20px;
        padding: 1.25rem;
      }

      .players-label {
        margin: 0 0 1rem;
        font-size: 0.85rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 1px;
        color: rgba(192, 132, 252, 0.7);
        display: flex;
        align-items: center;
        gap: 0.4rem;
      }

      .waiting-msg {
        text-align: center;
        color: rgba(237, 233, 255, 0.4);
        padding: 1rem 0;
        font-size: 0.9rem;
      }

      .waiting-dots {
        font-size: 1.5rem;
        display: block;
        margin-bottom: 0.5rem;
        animation: pulse 1.5s ease-in-out infinite;
      }

      @keyframes pulse {
        0%,
        100% {
          opacity: 0.3;
        }
        50% {
          opacity: 1;
        }
      }

      .players-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 0.6rem;
      }

      .player-chip {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        background: rgba(124, 58, 237, 0.2);
        border: 1px solid rgba(168, 85, 247, 0.3);
        border-radius: 100px;
        padding: 0.35rem 0.75rem 0.35rem 0.35rem;
      }

      .player-avatar {
        width: 26px;
        height: 26px;
        border-radius: 50%;
        background: linear-gradient(135deg, #7c3aed, #ec4899);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.8rem;
        font-weight: 700;
        color: white;
        flex-shrink: 0;
      }

      .player-name {
        font-size: 0.875rem;
        font-weight: 500;
        color: rgba(237, 233, 255, 0.85);
      }

      /* Action buttons */
      .start-btn {
        --background: linear-gradient(135deg, #7c3aed, #a855f7);
        --background-activated: linear-gradient(135deg, #6d33d1, #944cd9);
        --border-radius: 14px;
        --box-shadow: 0 6px 24px rgba(124, 58, 237, 0.5);
        height: 56px;
        font-weight: 700;
        font-size: 1.05rem;
      }

      .waiting-host {
        text-align: center;
        color: rgba(237, 233, 255, 0.45);
        font-size: 0.9rem;
        padding: 1rem 0;
      }
    `
  ],
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
    addIcons({ copyOutline, qrCodeOutline, closeOutline, personOutline })
  }

  qrUrl() {
    const joinUrl = `https://kahoot-aaa4f.web.app/game/${this.gameId()}`
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(joinUrl)}`
  }

  async copyCode() {
    await navigator.clipboard.writeText(this.entryCode())
    const toast = await this.toastCtrl.create({
      message: '✓ Code copied!',
      duration: 1500,
      color: 'success',
      position: 'top'
    })
    toast.present()
  }
}
