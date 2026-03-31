import { Component, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'
import { IonButton, IonContent, IonInput, IonIcon } from '@ionic/angular/standalone'
import { AuthService } from 'src/app/services/auth.service'
import { Router, RouterLink } from '@angular/router'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { filter } from 'rxjs'
import { addIcons } from 'ionicons'
import { logoGoogle } from 'ionicons/icons'

addIcons({ logoGoogle })

@Component({
  selector: 'app-login',
  template: `
    <ion-content [fullscreen]="true" class="login-content">
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
                placeholder="••••••••"
                class="styled-input"
              ></ion-input>

              <div class="forgot-row">
                <a routerLink="/password-retrieve">Forgot password?</a>
              </div>

              <ion-button expand="block" type="submit" class="sign-in-btn">
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

            <p class="switch-text">
              No account? <a routerLink="/register">Sign up free</a>
            </p>
          </div>

        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    .login-content {
      --background: linear-gradient(160deg, #f0e9ff 0%, #f8f5ff 60%, #fdf4ff 100%);
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
      font-weight: 900;
      background: linear-gradient(135deg, #7c3aed, #a855f7);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      letter-spacing: -0.5px;
    }

    .brand-tagline {
      margin: 0.35rem 0 0;
      color: #9ca3af;
      font-size: 0.95rem;
    }

    .auth-card {
      width: 100%;
      background: #ffffff;
      border: 1px solid rgba(124, 58, 237, 0.12);
      border-radius: 24px;
      padding: 2rem 1.5rem 1.75rem;
      box-shadow: 0 8px 40px rgba(124, 58, 237, 0.1);
    }

    .styled-input {
      --border-radius: 12px;
      --border-color: #e5e7eb;
      --highlight-color-focused: #7c3aed;
      --color: #1a0f2e;
      --placeholder-color: #d1d5db;
      --background: #fafafa;
      margin-bottom: 1rem;
    }

    .forgot-row {
      text-align: right;
      margin-bottom: 1.25rem;
      font-size: 0.82rem;
    }

    .forgot-row a {
      color: #7c3aed;
      font-weight: 600;
      text-decoration: none;
    }

    .sign-in-btn {
      --background: linear-gradient(135deg, #7c3aed, #a855f7);
      --background-activated: linear-gradient(135deg, #6d33d1, #944cd9);
      --border-radius: 14px;
      --box-shadow: 0 6px 20px rgba(124, 58, 237, 0.35);
      height: 52px;
      font-weight: 700;
      font-size: 1rem;
    }

    .divider {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin: 1.5rem 0;
      color: #d1d5db;
      font-size: 0.8rem;
    }

    .divider::before,
    .divider::after {
      content: '';
      flex: 1;
      height: 1px;
      background: #e5e7eb;
    }

    .google-btn {
      --border-radius: 14px;
      --border-color: #e5e7eb;
      --color: #374151;
      height: 52px;
      font-weight: 500;
      font-size: 0.95rem;
    }

    .switch-text {
      text-align: center;
      margin: 1.5rem 0 0;
      color: #9ca3af;
      font-size: 0.9rem;
    }

    .switch-text a {
      color: #7c3aed;
      font-weight: 700;
      text-decoration: none;
    }
  `],
  imports: [
    IonButton, IonContent, IonInput, IonIcon,
    CommonModule, ReactiveFormsModule, RouterLink
  ]
})
export class LoginPage {
  private readonly fb = inject(FormBuilder)
  private readonly authService = inject(AuthService)
  private readonly router = inject(Router)

  constructor() {
    this.authService
      .getConnectedUser()
      .pipe(filter((u) => !!u), takeUntilDestroyed())
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
