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
  ToastController,
  IonIcon
} from '@ionic/angular/standalone'
import { PageHeaderComponent } from '../components/page-header'
import { GameService } from '../services/game.service'
import { AuthService } from '../services/auth.service'
import { UserService } from '../services/user.service'
import { qrCodeOutline } from 'ionicons/icons'
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning'
import { addIcons } from 'ionicons'

@Component({
  selector: 'app-join-game',
  template: `
    <app-page-header [translucent]="true">Join Game</app-page-header>

    <ion-content [fullscreen]="true" class="ion-padding">
      <app-page-header collapse="condense">Join Game</app-page-header>

      <div
        style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 60%; gap: 1.5rem;"
      >
        <p
          style="color: var(--ion-color-medium); text-align: center; margin: 0"
        >
          Enter the 4-character code shared by the host
        </p>

        <ion-button
          fill="outline"
          style="width:100%;max-width:300px"
          (click)="scanQrCode()"
        >
          <ion-icon slot="start" name="qr-code-outline"></ion-icon>
          Scan QR Code
        </ion-button>
        <ion-input
          fill="outline"
          label="Entry Code"
          labelPlacement="floating"
          placeholder="AB12"
          [maxlength]="4"
          style="width: 100%; max-width: 300px; font-size: 2rem; text-align: center; letter-spacing: 0.5rem; text-transform: uppercase;"
          (ionInput)="onCodeInput($event)"
          [value]="code"
        ></ion-input>

        @if (errorMessage) {
          <ion-text color="danger">
            <p style="margin: 0; text-align: center">{{ errorMessage }}</p>
          </ion-text>
        }

        <ion-button
          expand="block"
          style="width: 100%; max-width: 300px"
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
  imports: [
    IonContent,
    IonInput,
    IonButton,
    IonSpinner,
    IonText,
    PageHeaderComponent,
    ReactiveFormsModule,
    IonIcon
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
      // 1. Get the connected user
      const user = await firstValueFrom(this.authService.getConnectedUser())
      if (!user) {
        this.router.navigateByUrl('/login')
        return
      }

      // 2. Get the user's alias from Firestore
      const users = await firstValueFrom(this.userService.getAll())
      const userWithAlias = users.find((u) => u.uid === user.uid)
      const alias = userWithAlias?.alias ?? user.email ?? 'Anonymous'

      // 3. Find the game by entry code
      const games = await firstValueFrom(
        this.gameService.getByEntryCode(this.code)
      )

      if (!games.length) {
        this.errorMessage =
          'No game found with this code. Please check and try again.'
        return
      }

      const game = games[0]

      // 4. Add the player to the game
      await this.gameService.joinGame(game.id, { uid: user.uid, alias })

      // 5. Navigate to the game lobby
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
    // Auto-fill code if coming from QR scan
    addIcons({ qrCodeOutline })

    this.route.queryParams.subscribe((params) => {
      if (params['code']) {
        this.code = params['code'].toUpperCase()
      }
    })
  }
  async scanQrCode() {
    try {
      const { barcodes } = await BarcodeScanner.scan({
        formats: [{ format: 'QR_CODE' } as any]
      })

      if (!barcodes.length) return

      const raw = barcodes[0].rawValue // e.g. "https://kahoot-aaa4f.web.app/game/Ehi0PKPpJQGZlGd3xFYO"
      if (!raw) return
      // Extract the gameId from the URL
      const match = raw.match(/\/game\/([a-zA-Z0-9]+)/)
      if (match) {
        // Navigate directly to game page — auto-join effect will handle registration
        this.router.navigateByUrl(`/game/${match[1]}`)
        return
      }

      // Fallback: try to extract a 4-char entry code
      const codeMatch = raw.match(/[A-Z0-9]{4}/)
      if (codeMatch) {
        this.code = codeMatch[0]
      }
    } catch (err) {
      console.error('Scan failed', err)
      this.errorMessage =
        'Scan failed. Please try again or enter the code manually.'
    }
  }
}
