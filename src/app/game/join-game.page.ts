import { Component, inject } from '@angular/core'
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'
import { Router } from '@angular/router'
import { ActivatedRoute } from '@angular/router'
import { firstValueFrom } from 'rxjs'
import {
  IonContent,
  IonInput,
  IonButton,
  IonSpinner,
  IonText,
  ToastController
} from '@ionic/angular/standalone'
import { PageHeaderComponent } from '../components/page-header'
import { GameService } from '../services/game.service'
import { AuthService } from '../services/auth.service'
import { UserService } from '../services/user.service'

@Component({
  selector: 'app-join-game',
  template: `
    <app-page-header [translucent]="true">Join Game</app-page-header>

    <ion-content [fullscreen]="true" class="join-content">
      <app-page-header collapse="condense">Join Game</app-page-header>

      <div class="join-container">
        <div class="join-hero">
          <div class="hero-icon">🎮</div>
          <h2 class="hero-title">Enter the code</h2>
          <p class="hero-sub">Ask the host for their 4-character game code</p>
        </div>

        <div class="code-card">
          <ion-input
            fill="outline"
            label="Game Code"
            labelPlacement="floating"
            placeholder="AB12"
            [maxlength]="4"
            class="code-input"
            (ionInput)="onCodeInput($event)"
            [value]="code"
          ></ion-input>

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
      </div>
    </ion-content>
  `,
  styles: [
    `
      .join-content {
        --background: linear-gradient(
          160deg,
          #0d0621 0%,
          #190d3a 60%,
          #2d1060 100%
        );
      }

      .join-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 70%;
        padding: 2rem 1.25rem;
        gap: 2rem;
      }

      .join-hero {
        text-align: center;
      }

      .hero-icon {
        font-size: 3.5rem;
        margin-bottom: 0.75rem;
      }

      .hero-title {
        margin: 0 0 0.5rem;
        font-size: 1.75rem;
        font-weight: 800;
        background: linear-gradient(135deg, #e879f9, #7c3aed);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .hero-sub {
        margin: 0;
        color: rgba(237, 233, 255, 0.5);
        font-size: 0.9rem;
      }

      .code-card {
        width: 100%;
        max-width: 340px;
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid rgba(192, 132, 252, 0.2);
        border-radius: 24px;
        padding: 2rem 1.5rem;
        backdrop-filter: blur(20px);
      }

      .code-input {
        --border-radius: 12px;
        --border-color: rgba(192, 132, 252, 0.3);
        --highlight-color-focused: #7c3aed;
        --color: #ede9ff;
        --placeholder-color: rgba(237, 233, 255, 0.35);
        font-size: 1.5rem;
        text-align: center;
        letter-spacing: 0.5rem;
        text-transform: uppercase;
        margin-bottom: 1rem;
      }

      .error-msg {
        margin: 0 0 1rem;
        text-align: center;
        font-size: 0.875rem;
      }

      .join-btn {
        --background: linear-gradient(135deg, #7c3aed, #a855f7);
        --background-activated: linear-gradient(135deg, #6d33d1, #944cd9);
        --border-radius: 14px;
        --box-shadow: 0 6px 24px rgba(124, 58, 237, 0.5);
        height: 52px;
        font-weight: 700;
        font-size: 1rem;
      }
    `
  ],
  imports: [
    IonContent,
    IonInput,
    IonButton,
    IonSpinner,
    IonText,
    PageHeaderComponent,
    ReactiveFormsModule
  ]
})
export class JoinGamePage {
  private readonly gameService = inject(GameService)
  private readonly authService = inject(AuthService)
  private readonly userService = inject(UserService)
  private readonly router = inject(Router)
  private readonly toastController = inject(ToastController)

  code = ''
  loading = false
  errorMessage = ''

  onCodeInput(event: CustomEvent) {
    this.code = (event.detail.value ?? '').toUpperCase()
    this.errorMessage = ''
  }

  async joinGame() {
    if (this.code.length < 4) return

    this.loading = true
    this.errorMessage = ''

    try {
      const user = await firstValueFrom(this.authService.getConnectedUser())
      if (!user) {
        this.router.navigateByUrl('/login')
        return
      }

      const users = await firstValueFrom(this.userService.getAll())
      const userWithAlias = users.find((u) => u.uid === user.uid)
      const alias = userWithAlias?.alias ?? user.email ?? 'Anonymous'

      const games = await firstValueFrom(
        this.gameService.getByEntryCode(this.code)
      )

      if (!games.length) {
        this.errorMessage =
          'No game found with this code. Please check and try again.'
        return
      }

      const game = games[0]
      await this.gameService.joinGame(game.id, { uid: user.uid, alias })
      this.router.navigateByUrl(`/game/${game.id}`)

      const toast = await this.toastController.create({
        message: `Joined game successfully!`,
        duration: 1500,
        color: 'success'
      })
      toast.present()
    } catch (error) {
      console.error(error)
      this.errorMessage = 'Something went wrong. Please try again.'
    } finally {
      this.loading = false
    }
  }

  private readonly route = inject(ActivatedRoute)

  constructor() {
    this.route.queryParams.subscribe((params) => {
      if (params['code']) {
        this.code = params['code'].toUpperCase()
      }
    })
  }
}
