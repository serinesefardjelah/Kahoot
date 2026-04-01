import { Component, inject, OnDestroy, signal } from '@angular/core'
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
import { closeOutline, qrCodeOutline } from 'ionicons/icons'
import { addIcons } from 'ionicons'
import { Html5Qrcode } from 'html5-qrcode'
@Component({
  selector: 'app-join-game',
  template: `
    <app-page-header [translucent]="true">Join Game</app-page-header>

    <ion-content [fullscreen]="true" class="ion-padding">
      <app-page-header collapse="condense">Join Game</app-page-header>

      <div
        style="display:flex;flex-direction:column;align-items:center;gap:1.5rem;padding-top:1rem"
      >
        <p style="color:var(--ion-color-medium);text-align:center;margin:0">
          Enter the 4-character code shared by the host
        </p>

        <ion-button
          fill="outline"
          style="width:100%;max-width:300px"
          (click)="scanQrCode()"
        >
          <ion-icon
            slot="start"
            [name]="isScanning() ? 'close-outline' : 'qr-code-outline'"
          ></ion-icon>
          {{ isScanning() ? 'Stop Scann' : 'Scan QR Code' }}
        </ion-button>

        @if (isScanning()) {
          <div
            style="
          width: calc(100vw - 32px);
          max-width: 500px;
          position: relative;
          border-radius: 12px;
          overflow: hidden;
          background: #000;
          aspect-ratio: 1;
        "
          >
            <video
              id="qr-video"
              playsinline
              muted
              style="width:100%;height:100%;object-fit:cover;display:block"
            ></video>
            <canvas id="qr-canvas" style="display:none"></canvas>
            <div
              style="
            position:absolute;
            top:50%;left:50%;
            transform:translate(-50%,-50%);
            width:60%;height:60%;
            border:3px solid var(--ion-color-primary);
            border-radius:12px;
            box-shadow:0 0 0 9999px rgba(0,0,0,0.5)
          "
            ></div>
            <p
              style="
            position:absolute;bottom:12px;
            width:100%;text-align:center;
            color:white;font-size:0.85rem;margin:0
          "
            >
              Point at the QR code
            </p>
          </div>
        }

        <ion-input
          fill="outline"
          label="Entry Code"
          labelPlacement="floating"
          placeholder="AB12"
          [maxlength]="4"
          style="width:100%;max-width:300px;font-size:2rem;text-align:center;letter-spacing:0.5rem;text-transform:uppercase"
          (ionInput)="onCodeInput($event)"
          [value]="code"
        ></ion-input>

        @if (errorMessage) {
          <ion-text color="danger">
            <p style="margin:0;text-align:center">{{ errorMessage }}</p>
          </ion-text>
        }

        <ion-button
          expand="block"
          style="width:100%;max-width:300px"
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
export class JoinGamePage implements OnDestroy {
  private readonly gameService = inject(GameService)
  private readonly authService = inject(AuthService)
  private readonly userService = inject(UserService)
  private readonly router = inject(Router)
  private readonly toastController = inject(ToastController)

  code = ''
  loading = false
  errorMessage = ''

  ngOnDestroy() {
    this.stopScan()
  }

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
    addIcons({ qrCodeOutline, closeOutline })

    this.route.queryParams.subscribe((params) => {
      if (params['code']) {
        this.code = params['code'].toUpperCase()
      }
    })
  }
  readonly isScanning = signal(false)
  private videoStream?: MediaStream
  private scanInterval?: ReturnType<typeof setInterval>
  private jsQR?: any

  async scanQrCode() {
    if (this.isScanning()) {
      this.stopScan()
      return
    }

    this.isScanning.set(true)
    await new Promise((resolve) => setTimeout(resolve, 100))

    try {
      this.videoStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })

      const video = document.getElementById('qr-video') as HTMLVideoElement
      video.srcObject = this.videoStream
      await video.play()

      // Dynamically import jsQR for decoding
      const jsQRModule = await import('jsqr')
      this.jsQR = jsQRModule.default

      const canvas = document.getElementById('qr-canvas') as HTMLCanvasElement
      const ctx = canvas.getContext('2d')!

      this.scanInterval = setInterval(() => {
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const code = this.jsQR(
            imageData.data,
            imageData.width,
            imageData.height
          )
          if (code) {
            this.stopScan()
            this.handleScannedValue(code.data)
          }
        }
      }, 200)
    } catch (err) {
      console.error(err)
      this.isScanning.set(false)
      this.errorMessage =
        'Could not access camera. Please allow camera permission.'
    }
  }

  handleScannedValue(raw: string) {
    const match = raw.match(/\/game\/([a-zA-Z0-9]+)/)
    if (match) {
      this.router.navigateByUrl(`/game/${match[1]}`)
      return
    }
    const codeMatch = raw.match(/[A-Z0-9]{4}/)
    if (codeMatch) {
      this.code = codeMatch[0]
    }
  }

  stopScan() {
    clearInterval(this.scanInterval)
    this.videoStream?.getTracks().forEach((t) => t.stop())
    this.videoStream = undefined
    this.isScanning.set(false)
  }
}
