import { Component, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'
import { AuthService } from 'src/app/services/auth.service'
import { IonButton, IonContent, IonInput } from '@ionic/angular/standalone'
import { RouterLink } from '@angular/router'

@Component({
  selector: 'app-password-retrieve',
  template: `
    <ion-content [fullscreen]="true">
      <div class="auth-bg">
        <div class="auth-wrapper">
          <div class="brand">
            <div class="brand-icon">🔑</div>
            <h1 class="brand-name">Reset Password</h1>
            <p class="brand-tagline">We'll send you a reset link</p>
          </div>

          <div class="auth-card">
            <form [formGroup]="passwordRetrieveForm" (ngSubmit)="onSubmit()">
              <ion-input
                formControlName="email"
                fill="outline"
                label="Email"
                labelPlacement="floating"
                placeholder="user@gmail.com"
                type="email"
                [errorText]="invalidEmailText"
                class="styled-input"
              ></ion-input>

              <ion-button expand="block" type="submit" class="main-btn">
                Send Reset Link
              </ion-button>
            </form>

            <p class="auth-switch">
              Remembered? <a routerLink="/login">Back to Sign in</a>
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
        font-size: 3rem;
        display: block;
        margin-bottom: 0.5rem;
      }

      .brand-name {
        margin: 0;
        font-size: 2rem;
        font-weight: 800;
        background: linear-gradient(135deg, #e879f9, #7c3aed);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
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

      .main-btn {
        --background: linear-gradient(135deg, #7c3aed, #a855f7);
        --background-activated: linear-gradient(135deg, #6d33d1, #944cd9);
        --border-radius: 14px;
        --box-shadow: 0 6px 24px rgba(124, 58, 237, 0.5);
        height: 52px;
        font-weight: 700;
        font-size: 1rem;
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
