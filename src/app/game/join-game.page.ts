import { Component, inject, OnDestroy, signal, ViewChild, ElementRef } from '@angular/core'
import { FormBuilder, ReactiveFormsModule, Validators, ReactiveFormsModule } from '@angular/forms'
import { Router, ActivatedRoute } from '@angular/router'
import { Component, inject,  } from '@angular/core'
import { firstValueFrom } from 'rxjs'
import {
  IonContent,
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
    <app-page-header [translucent]="true">Join a Game</app-page-header>

    <ion-content [fullscreen]="true" class="join-content">
      <app-page-header collapse="condense">Join a Game</app-page-header>

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
  styles: [
    `
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
      .join-hero {
        text-align: center;
      }

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
      .code-area-wrap {
        position: relative;
      }

      .code-boxes {
        display: flex;
        gap: 0.75rem;
        pointer-events: none;
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
        transition:
          border-color 0.2s,
          background 0.2s,
          transform 0.15s;
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

      /* Hidden real input — covers the code boxes, no pointer-events:none so mobile backspace works */
      .hidden-input {
        position: absolute;
        inset: 0;
        opacity: 0;
        border: none;
        outline: none;
        cursor: text;
        z-index: 1;
        font-size: 16px; /* prevents iOS auto-zoom on focus */
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
    `
  ],
  imports: [
    IonContent,
    IonButton,
    IonSpinner,
    IonText,
    PageHeaderComponent,
    ReactiveFormsModule,
    IonIcon
  ]
})
export class JoinGamePage implements OnDestroy {
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

  ngOnDestroy() {
    this.stopScan()
  }

  onCodeInput(event: CustomEvent) {
    this.code = (event.detail.value ?? '').toUpperCase()
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
    const filtered = input.value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 4)
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
      if (!user) {
        this.router.navigateByUrl('/login')
        return
      }

      const users = await firstValueFrom(this.userService.getAll())
      const alias =
        users.find((u) => u.uid === user.uid)?.alias ??
        user.email ??
        'Anonymous'

      const games = await firstValueFrom(
        this.gameService.getByEntryCode(this.code)
      )
      if (!games.length) {
        this.errorMessage = 'No game found with this code.'
        return
      }

      await this.gameService.joinGame(games[0].id, { uid: user.uid, alias })
      this.router.navigateByUrl(`/game/${games[0].id}`)
      ;(
        await this.toastController.create({
          message: 'Joined!',
          duration: 1500,
          color: 'success'
        })
      ).present()
    } catch (e) {
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
