import { Component, inject, input, output, signal } from '@angular/core'
import {
  IonContent,
  IonButton,
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

      <!-- Code banner -->
      <div class="code-banner">
        <p class="banner-label">Game Code</p>
        <div class="code-row" (click)="copyCode()">
          @for (char of entryCode().split(''); track $index) {
            <div class="code-char">{{ char }}</div>
          }
          <ion-icon name="copy-outline" class="copy-icon"></ion-icon>
        </div>
        <p class="banner-hint">Tap to copy · Share with players</p>

        <ion-button
          fill="clear"
          size="small"
          class="qr-toggle"
          (click)="showQr.set(!showQr())"
        >
          <ion-icon
            [name]="showQr() ? 'close-outline' : 'qr-code-outline'"
            slot="start"
          ></ion-icon>
          {{ showQr() ? 'Hide QR' : 'Show QR Code' }}
        </ion-button>

        @if (showQr()) {
          <div class="qr-wrap">
            <img [src]="qrUrl()" alt="QR Code" class="qr-img" />
          </div>
        }
      </div>

      <!-- Players -->
      <div class="players-section">
        <div class="section-header">
          <span class="section-title">
            <ion-icon name="person-outline"></ion-icon>
            Players
          </span>
          <span class="player-count">{{ players().length }}</span>
        </div>

        @if (!players().length) {
          <div class="waiting-empty">
            <div class="dots"><span></span><span></span><span></span></div>
            <p>Waiting for players to join…</p>
          </div>
        } @else {
          <div class="players-grid">
            @for (player of players(); track player.uid) {
              <div class="player-chip">
                <div class="player-avatar">
                  {{ player.alias[0].toUpperCase() }}
                </div>
                <span class="player-name">{{ player.alias }}</span>
              </div>
            }
          </div>
        }
      </div>

      <!-- CTA -->
      <div class="cta-area">
        @if (isHost()) {
          <ion-button
            expand="block"
            class="start-btn"
            [disabled]="!players().length"
            (click)="startGame.emit()"
          >
            Start Game 🚀
          </ion-button>
          @if (!players().length) {
            <p class="cta-hint">Waiting for at least 1 player…</p>
          }
        } @else {
          <div class="waiting-host">
            <div class="pulse-ring"></div>
            <p>Waiting for the host to start…</p>
          </div>
        }
      </div>
    </ion-content>
  `,
  styles: [
    `
      .lobby-content {
        --background: #f8f5ff;
      }

      /* Code banner */
      .code-banner {
        background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
        margin: 0.75rem 1rem;
        border-radius: 22px;
        padding: 1.5rem;
        text-align: center;
        box-shadow: 0 8px 28px rgba(124, 58, 237, 0.3);
      }

      .banner-label {
        margin: 0 0 0.75rem;
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 1.5px;
        color: rgba(255, 255, 255, 0.7);
      }

      .code-row {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        cursor: pointer;
        margin-bottom: 0.5rem;
      }

      .code-char {
        width: 52px;
        height: 60px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2rem;
        font-weight: 900;
        color: #ffffff;
      }

      .copy-icon {
        font-size: 1.2rem;
        color: rgba(255, 255, 255, 0.7);
        margin-left: 0.25rem;
      }

      .banner-hint {
        margin: 0 0 0.75rem;
        font-size: 0.75rem;
        color: rgba(255, 255, 255, 0.6);
      }

      .qr-toggle {
        --color: rgba(255, 255, 255, 0.85);
        font-size: 0.85rem;
      }

      .qr-wrap {
        margin-top: 1rem;
      }

      .qr-img {
        width: 160px;
        height: 160px;
        border-radius: 12px;
        border: 3px solid rgba(255, 255, 255, 0.4);
      }

      /* Players */
      .players-section {
        margin: 0 1rem;
        background: #ffffff;
        border-radius: 18px;
        padding: 1.25rem;
        box-shadow: 0 2px 12px rgba(124, 58, 237, 0.08);
      }

      .section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 1rem;
      }

      .section-title {
        font-size: 0.8rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.8px;
        color: #7c3aed;
        display: flex;
        align-items: center;
        gap: 0.35rem;
      }

      .player-count {
        background: #f3eeff;
        color: #7c3aed;
        font-size: 0.8rem;
        font-weight: 700;
        padding: 2px 10px;
        border-radius: 100px;
      }

      .waiting-empty {
        text-align: center;
        padding: 1rem 0;
        color: #9ca3af;
        font-size: 0.875rem;
      }

      .dots {
        display: flex;
        justify-content: center;
        gap: 6px;
        margin-bottom: 0.75rem;
      }

      .dots span {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #c4b5fd;
        animation: bounce 1.2s ease-in-out infinite;
      }

      .dots span:nth-child(2) {
        animation-delay: 0.2s;
      }
      .dots span:nth-child(3) {
        animation-delay: 0.4s;
      }

      @keyframes bounce {
        0%,
        100% {
          transform: translateY(0);
          opacity: 0.4;
        }
        50% {
          transform: translateY(-6px);
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
        background: #f8f5ff;
        border: 1px solid #e9d5ff;
        border-radius: 100px;
        padding: 0.3rem 0.8rem 0.3rem 0.35rem;
      }

      .player-avatar {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: linear-gradient(135deg, #7c3aed, #a855f7);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.8rem;
        font-weight: 800;
        color: white;
        flex-shrink: 0;
      }

      .player-name {
        font-size: 0.875rem;
        font-weight: 600;
        color: #4b5563;
      }

      /* CTA */
      .cta-area {
        padding: 1rem 1rem 2rem;
      }

      .start-btn {
        --background: linear-gradient(135deg, #7c3aed, #a855f7);
        --background-activated: linear-gradient(135deg, #6d33d1, #944cd9);
        --border-radius: 16px;
        --box-shadow: 0 6px 20px rgba(124, 58, 237, 0.35);
        height: 56px;
        font-weight: 700;
        font-size: 1.05rem;
      }

      .cta-hint {
        text-align: center;
        margin: 0.75rem 0 0;
        color: #9ca3af;
        font-size: 0.82rem;
      }

      .waiting-host {
        position: relative;
        text-align: center;
        padding: 1.5rem 0;
        color: #9ca3af;
        font-size: 0.9rem;
      }

      .pulse-ring {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        border: 3px solid #c4b5fd;
        margin: 0 auto 1rem;
        animation: pulse-ring 1.5s ease-in-out infinite;
      }

      @keyframes pulse-ring {
        0%,
        100% {
          transform: scale(1);
          opacity: 0.5;
        }
        50% {
          transform: scale(1.2);
          opacity: 1;
        }
      }
    `
  ],
  imports: [IonContent, IonButton, IonIcon, PageHeaderComponent]
})
export class GameLobbyComponent {
  readonly entryCode = input.required<string>()
  readonly players = input.required<GamePlayer[]>()
  readonly isHost = input.required<boolean>()
  readonly startGame = output<void>()
  readonly showQr = signal(false)
  readonly gameId = input.required<string>()

  private readonly toastCtrl = inject(ToastController)

  constructor() {
    addIcons({ copyOutline, qrCodeOutline, closeOutline, personOutline })
  }

  qrUrl() {
    const joinUrl = `https://kahoot-aaa4f.web.app/game/${this.gameId()}`
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(joinUrl)}`
  }

  async copyCode() {
    await navigator.clipboard.writeText(this.entryCode())
    ;(
      await this.toastCtrl.create({
        message: '✓ Code copied!',
        duration: 1500,
        color: 'success',
        position: 'top'
      })
    ).present()
  }
}
