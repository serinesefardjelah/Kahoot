import { Component, inject, ViewChild, ElementRef } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { Router, ActivatedRoute } from '@angular/router'
import { firstValueFrom } from 'rxjs'
import {
  IonContent, IonButton, IonSpinner, IonText, ToastController
} from '@ionic/angular/standalone'
import { PageHeaderComponent } from '../components/page-header'
import { GameService } from '../services/game.service'
import { AuthService } from '../services/auth.service'
import { UserService } from '../services/user.service'

@Component({
  selector: 'app-join-game',
  template: `
    <app-page-header [translucent]="true">Join a Game</app-page-header>

    <ion-content [fullscreen]="true" class="join-content">
      <app-page-header collapse="condense">Join a Game</app-page-header>

      <div class="join-container">

        <div class="join-hero">
          <div class="hero-badge">🎮</div>
          <h2 class="hero-title">Enter the code</h2>
          <p class="hero-sub">Ask the host for their 4-character code</p>
        </div>

        <!-- 4 boxes — tap to open keyboard -->
        <div class="code-boxes" (click)="focusInput()">
          @for (i of [0,1,2,3]; track i) {
            <div class="code-box"
              [class.filled]="code.length > i"
              [class.active]="code.length === i">
              {{ code[i] ?? '' }}
            </div>
          }
        </div>

        <!-- Hidden real input that captures keyboard -->
        <input
          #codeInput
          class="hidden-input"
          [value]="code"
          (input)="onInput($event)"
          (keydown)="onKeydown($event)"
          maxlength="4"
          autocomplete="off"
          autocorrect="off"
          autocapitalize="characters"
          spellcheck="false"
          inputmode="text"
          type="text"
        />

        <p class="tap-hint">Tap the boxes to type</p>

        @if (errorMessage) {
          <ion-text color="danger">
            <p class="error-msg">{{ errorMessage }}</p>
          </ion-text>
        }

        <ion-button
          expand="block"
          class="join-btn"
          [disabled]="code.length < 4 || loading"
          (click)="joinGame()"
        >
          @if (loading) {
            <ion-spinner slot="start" name="crescent"></ion-spinner>
            &nbsp; Joining...
          } @else {
            Join Game
          }
        </ion-button>

      </div>
    </ion-content>
  `,
  styles: [`
    .join-content {
      --background: #f8f5ff;
    }

    .join-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 80%;
      padding: 2rem 1.5rem;
      gap: 1.75rem;
    }

    /* Hero */
    .join-hero { text-align: center; }

    .hero-badge {
      width: 72px;
      height: 72px;
      background: linear-gradient(135deg, #7c3aed, #a855f7);
      border-radius: 22px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      margin: 0 auto 1rem;
      box-shadow: 0 8px 24px rgba(124, 58, 237, 0.3);
    }

    .hero-title {
      margin: 0 0 0.4rem;
      font-size: 1.6rem;
      font-weight: 800;
      color: #1a0f2e;
    }

    .hero-sub {
      margin: 0;
      color: #9ca3af;
      font-size: 0.875rem;
    }

    /* 4 code boxes */
    .code-boxes {
      display: flex;
      gap: 0.75rem;
      cursor: text;
    }

    .code-box {
      width: 64px;
      height: 72px;
      border: 2px solid #e5e7eb;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      font-weight: 900;
      color: #7c3aed;
      background: #ffffff;
      transition: border-color 0.2s, background 0.2s, transform 0.15s;
      box-shadow: 0 2px 8px rgba(124, 58, 237, 0.06);
    }

    .code-box.filled {
      border-color: #7c3aed;
      background: #f3eeff;
    }

    .code-box.active {
      border-color: #a855f7;
      box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.15);
      transform: scale(1.05);
    }

    /* Hidden real input */
    .hidden-input {
      position: absolute;
      opacity: 0;
      width: 1px;
      height: 1px;
      pointer-events: none;
      border: none;
      outline: none;
    }

    .tap-hint {
      margin: -0.75rem 0 0;
      font-size: 0.78rem;
      color: #c4b5fd;
    }

    .error-msg {
      margin: 0;
      text-align: center;
      font-size: 0.875rem;
    }

    .join-btn {
      --background: linear-gradient(135deg, #7c3aed, #a855f7);
      --background-activated: linear-gradient(135deg, #6d33d1, #944cd9);
      --border-radius: 14px;
      --box-shadow: 0 6px 20px rgba(124, 58, 237, 0.35);
      height: 52px;
      font-weight: 700;
      width: 100%;
      max-width: 320px;
    }
  `],
  imports: [
    IonContent, IonButton, IonSpinner, IonText,
    PageHeaderComponent, ReactiveFormsModule
  ]
})
export class JoinGamePage {
  @ViewChild('codeInput') codeInputRef!: ElementRef<HTMLInputElement>

  private readonly gameService = inject(GameService)
  private readonly authService = inject(AuthService)
  private readonly userService = inject(UserService)
  private readonly router = inject(Router)
  private readonly toastController = inject(ToastController)
  private readonly route = inject(ActivatedRoute)

  code = ''
  loading = false
  errorMessage = ''

  constructor() {
    this.route.queryParams.subscribe((params) => {
      if (params['code']) this.code = params['code'].toUpperCase()
    })
  }

  focusInput() {
    this.codeInputRef?.nativeElement.focus()
  }

  onInput(event: Event) {
    const input = event.target as HTMLInputElement
    // Keep only A-Z letters and 0-9 digits, uppercase, max 4
    const filtered = input.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4)
    this.code = filtered
    input.value = filtered
    this.errorMessage = ''
  }

  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && this.code.length === 4) {
      this.joinGame()
    }
  }

  async joinGame() {
    if (this.code.length < 4) return
    this.loading = true
    this.errorMessage = ''
    try {
      const user = await firstValueFrom(this.authService.getConnectedUser())
      if (!user) { this.router.navigateByUrl('/login'); return }

      const users = await firstValueFrom(this.userService.getAll())
      const alias = users.find((u) => u.uid === user.uid)?.alias ?? user.email ?? 'Anonymous'

      const games = await firstValueFrom(this.gameService.getByEntryCode(this.code))
      if (!games.length) {
        this.errorMessage = 'No game found with this code.'
        return
      }

      await this.gameService.joinGame(games[0].id, { uid: user.uid, alias })
      this.router.navigateByUrl(`/game/${games[0].id}`)
      ;(await this.toastController.create({ message: 'Joined!', duration: 1500, color: 'success' })).present()
    } catch (e) {
      this.errorMessage = 'Something went wrong. Please try again.'
    } finally {
      this.loading = false
    }
  }
}
