import { Component, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'
import {
  IonButton,
  IonContent,
  IonInput,
  IonIcon
} from '@ionic/angular/standalone'
import { AuthService } from 'src/app/services/auth.service'
import { Router, RouterLink } from '@angular/router'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { filter } from 'rxjs'
import { addIcons } from 'ionicons'
import { logoGoogle, sparkles } from 'ionicons/icons'

addIcons({ logoGoogle, sparkles })

@Component({
  selector: 'app-login',
  template: `
    <ion-content [fullscreen]="true">
      <div class="auth-bg">
        <div class="auth-wrapper">
          <div class="brand">
            <div class="brand-icon">⚡</div>
            <h1 class="brand-name">Kahoot</h1>
            <p class="brand-tagline">Challenge your knowledge</p>
          </div>

          <div class="auth-card">
            <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
              <ion-input
                formControlName="identifier"
                fill="outline"
                label="Email or Alias"
                labelPlacement="floating"
                placeholder="user@gmail.com"
                class="styled-input"
              ></ion-input>

              <ion-input
                type="password"
                formControlName="password"
                fill="outline"
                label="Password"
                labelPlacement="floating"
                class="styled-input"
              ></ion-input>

              <div class="link-row">
                <a routerLink="/password-retrieve">Forgot password?</a>
              </div>

              <ion-button expand="block" type="submit" class="main-btn">
                Sign In
              </ion-button>
            </form>

            <div class="divider"><span>or continue with</span></div>

            <ion-button
              expand="block"
              fill="outline"
              class="google-btn"
              (click)="loginWithGoogle()"
            >
              <ion-icon name="logo-google" slot="start"></ion-icon>
              Google
            </ion-button>

            <p class="auth-switch">
              No account? <a routerLink="/register">Sign up</a>
            </p>
          </div>
        </div>
      </div>
    </ion-content>
  `,
  styles: [
    `
      ion-content {
        --background: linear-gradient(
          160deg,
          #0d0621 0%,
          #190d3a 60%,
          #2d1060 100%
        );
      }

      .auth-bg {
        min-height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2.5rem 1.25rem;
      }

      .auth-wrapper {
        width: 100%;
        max-width: 400px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2rem;
      }

      .brand {
        text-align: center;
      }

      .brand-icon {
        font-size: 3.5rem;
        display: block;
        margin-bottom: 0.5rem;
      }

      .brand-name {
        margin: 0;
        font-size: 2.6rem;
        font-weight: 800;
        background: linear-gradient(135deg, #e879f9, #7c3aed);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        letter-spacing: -0.5px;
      }

      .brand-tagline {
        margin: 0.35rem 0 0;
        color: rgba(237, 233, 255, 0.5);
        font-size: 0.95rem;
      }

      .auth-card {
        width: 100%;
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid rgba(192, 132, 252, 0.2);
        border-radius: 24px;
        padding: 2rem 1.5rem 1.75rem;
        backdrop-filter: blur(20px);
      }

      .styled-input {
        --border-radius: 12px;
        --border-color: rgba(192, 132, 252, 0.3);
        --highlight-color-focused: #7c3aed;
        --color: #ede9ff;
        --placeholder-color: rgba(237, 233, 255, 0.35);
        margin-bottom: 1rem;
      }

      .link-row {
        text-align: right;
        margin-bottom: 1.25rem;
        font-size: 0.85rem;
      }

      .link-row a {
        color: #a855f7;
        text-decoration: none;
      }

      .main-btn {
        --background: linear-gradient(135deg, #7c3aed, #a855f7);
        --background-activated: linear-gradient(135deg, #6d33d1, #944cd9);
        --border-radius: 14px;
        --box-shadow: 0 6px 24px rgba(124, 58, 237, 0.5);
        height: 52px;
        font-weight: 700;
        font-size: 1rem;
      }

      .divider {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin: 1.5rem 0;
        color: rgba(237, 233, 255, 0.35);
        font-size: 0.8rem;
      }

      .divider::before,
      .divider::after {
        content: '';
        flex: 1;
        height: 1px;
        background: rgba(192, 132, 252, 0.15);
      }

      .google-btn {
        --border-radius: 14px;
        --border-color: rgba(192, 132, 252, 0.25);
        --color: rgba(237, 233, 255, 0.85);
        height: 52px;
        font-weight: 500;
        font-size: 0.95rem;
      }

      .auth-switch {
        text-align: center;
        margin: 1.5rem 0 0;
        color: rgba(237, 233, 255, 0.5);
        font-size: 0.9rem;
      }

      .auth-switch a {
        color: #a855f7;
        font-weight: 600;
        text-decoration: none;
      }
    `
  ],
  imports: [
    IonButton,
    IonContent,
    IonInput,
    IonIcon,
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ]
})
export class LoginPage {
  private readonly fb = inject(FormBuilder)
  private readonly authService = inject(AuthService)
  private readonly router = inject(Router)

  constructor() {
    this.authService
      .getConnectedUser()
      .pipe(
        filter((u) => !!u),
        takeUntilDestroyed()
      )
      .subscribe(() => this.router.navigateByUrl('/'))
  }

  loginForm = this.fb.group({
    identifier: ['', Validators.required],
    password: ['', Validators.minLength(6)]
  })

  onSubmit() {
    const { identifier, password } = this.loginForm.value
    this.authService.login(identifier!, password!)
  }

  loginWithGoogle() {
    this.authService.signInWithGoogle()
  }
}
