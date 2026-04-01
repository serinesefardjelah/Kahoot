import { Component, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'
import { AuthService } from 'src/app/services/auth.service'
import { IonButton, IonContent, IonInput } from '@ionic/angular/standalone'
import { RouterLink } from '@angular/router'

@Component({
  selector: 'app-password-retrieve',
  template: `
    <ion-content [fullscreen]="true" class="retrieve-content">
      <div class="hero">
        <div class="blob blob-1"></div>
        <div class="hero-text">
          <span class="hero-emoji">🔑</span>
          <h1 class="hero-title">Reset</h1>
          <p class="hero-sub">We'll send you a link</p>
        </div>
      </div>

      <div class="form-card">
        <h2 class="form-title">Forgot password?</h2>
        <p class="form-sub">
          Enter your email and we'll send you a reset link.
        </p>

        <form [formGroup]="passwordRetrieveForm" (ngSubmit)="onSubmit()">
          <div class="input-group">
            <label class="input-label">Email</label>
            <ion-input
              formControlName="email"
              fill="outline"
              placeholder="user@gmail.com"
              type="email"
              [errorText]="invalidEmailText"
              class="styled-input"
            ></ion-input>
          </div>

          <ion-button expand="block" type="submit" class="send-btn">
            Send Reset Link
          </ion-button>
        </form>

        <p class="switch-text">
          Remembered? <a routerLink="/login">Back to Sign in</a>
        </p>
      </div>
    </ion-content>
  `,
  styles: [
    `
      .retrieve-content {
        --background: #f8f5ff;
      }

      .hero {
        background: linear-gradient(150deg, #7c3aed 0%, #a855f7 100%);
        padding: 3.5rem 2rem 5rem;
        position: relative;
        overflow: hidden;
      }

      .blob {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.08);
      }

      .blob-1 {
        width: 200px;
        height: 200px;
        top: -60px;
        right: -60px;
      }

      .hero-text {
        position: relative;
        text-align: center;
      }

      .hero-emoji {
        font-size: 3rem;
        display: block;
        margin-bottom: 0.4rem;
      }

      .hero-title {
        margin: 0;
        font-size: 2.4rem;
        font-weight: 900;
        color: #ffffff;
      }

      .hero-sub {
        margin: 0.3rem 0 0;
        color: rgba(255, 255, 255, 0.7);
        font-size: 0.95rem;
      }

      .form-card {
        background: #ffffff;
        border-radius: 28px 28px 0 0;
        margin-top: -2rem;
        padding: 2rem 1.5rem 2.5rem;
        min-height: 55vh;
        box-shadow: 0 -4px 30px rgba(124, 58, 237, 0.12);
      }

      .form-title {
        margin: 0 0 0.25rem;
        font-size: 1.5rem;
        font-weight: 800;
        color: #1a0f2e;
      }
      .form-sub {
        margin: 0 0 1.75rem;
        color: #9ca3af;
        font-size: 0.875rem;
      }

      .input-group {
        margin-bottom: 1rem;
      }

      .input-label {
        display: block;
        font-size: 0.8rem;
        font-weight: 600;
        color: #4b5563;
        margin-bottom: 0.35rem;
      }

      .styled-input {
        --border-radius: 12px;
        --border-color: #e5e7eb;
        --highlight-color-focused: #7c3aed;
        --color: #1a0f2e;
        --placeholder-color: #d1d5db;
        --background: #fafafa;
      }

      .send-btn {
        --background: linear-gradient(135deg, #7c3aed, #a855f7);
        --border-radius: 14px;
        --box-shadow: 0 6px 20px rgba(124, 58, 237, 0.35);
        height: 52px;
        font-weight: 700;
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
    `
  ],
  imports: [
    IonButton,
    IonContent,
    IonInput,
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ]
})
export class PasswordRetrievePage {
  private readonly fb = inject(FormBuilder)
  private readonly authService = inject(AuthService)

  invalidEmailText = 'Not a valid email'

  passwordRetrieveForm = this.fb.group({
    email: ['', Validators.email]
  })

  onSubmit() {
    this.authService.sendResetPasswordLink(
      this.passwordRetrieveForm.value.email!
    )
  }
}
