import { Component, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms'
import { AuthService } from 'src/app/services/auth.service'
import { IonButton, IonContent, IonInput, IonIcon } from '@ionic/angular/standalone'
import { RouterLink } from '@angular/router'

@Component({
  selector: 'app-register',
  template: `
    <ion-content [fullscreen]="true" class="register-content">

      <div class="hero">
        <div class="blob blob-1"></div>
        <div class="blob blob-2"></div>
        <div class="hero-text">
          <span class="hero-emoji">✨</span>
          <h1 class="hero-title">Join us</h1>
          <p class="hero-sub">Create your free account</p>
        </div>
      </div>

      <div class="form-card">
        <h2 class="form-title">Create account</h2>
        <p class="form-sub">Fill in the details below</p>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
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

          <div class="input-group">
            <label class="input-label">Alias (display name)</label>
            <ion-input
              formControlName="alias"
              fill="outline"
              placeholder="YourNickname"
              type="text"
              [errorText]="invalidAliasText"
              class="styled-input"
            ></ion-input>
          </div>

          <div class="input-group">
            <label class="input-label">Password</label>
            <ion-input
              formControlName="password"
              fill="outline"
              placeholder="Min. 6 characters"
              type="password"
              [errorText]="invalidPasswordText"
              class="styled-input"
            ></ion-input>
          </div>

          <div class="input-group">
            <label class="input-label">Confirm Password</label>
            <ion-input
              formControlName="passwordConfirm"
              fill="outline"
              placeholder="••••••••"
              type="password"
              errorText="Does not match password"
              class="styled-input"
            ></ion-input>
          </div>

          <ion-button
            expand="block"
            type="submit"
            [disabled]="registerForm.invalid"
            class="register-btn"
          >
            Create Account
          </ion-button>
        </form>

        <p class="switch-text">
          Already have an account? <a routerLink="/login">Sign in</a>
        </p>
      </div>

    </ion-content>
  `,
  styles: [`
    .register-content {
      --background: #f8f5ff;
    }

    .hero {
      background: linear-gradient(150deg, #6d28d9 0%, #7c3aed 50%, #ec4899 100%);
      padding: 3rem 2rem 4.5rem;
      position: relative;
      overflow: hidden;
    }

    .blob {
      position: absolute;
      border-radius: 50%;
      background: rgba(255,255,255,0.07);
    }

    .blob-1 { width: 180px; height: 180px; top: -50px; right: -50px; }
    .blob-2 { width: 120px; height: 120px; bottom: -20px; left: -20px; }

    .hero-text {
      position: relative;
      text-align: center;
    }

    .hero-emoji { font-size: 2.8rem; display: block; margin-bottom: 0.4rem; }

    .hero-title {
      margin: 0;
      font-size: 2.4rem;
      font-weight: 900;
      color: #ffffff;
    }

    .hero-sub {
      margin: 0.3rem 0 0;
      color: rgba(255,255,255,0.7);
      font-size: 0.95rem;
    }

    .form-card {
      background: #ffffff;
      border-radius: 28px 28px 0 0;
      margin-top: -2rem;
      padding: 2rem 1.5rem 2.5rem;
      min-height: 65vh;
      box-shadow: 0 -4px 30px rgba(124, 58, 237, 0.12);
    }

    .form-title {
      margin: 0 0 0.25rem;
      font-size: 1.4rem;
      font-weight: 800;
      color: #1a0f2e;
    }

    .form-sub {
      margin: 0 0 1.5rem;
      color: #9ca3af;
      font-size: 0.875rem;
    }

    .input-group {
      margin-bottom: 0.875rem;
    }

    .input-label {
      display: block;
      font-size: 0.8rem;
      font-weight: 600;
      color: #4b5563;
      margin-bottom: 0.3rem;
    }

    .styled-input {
      --border-radius: 12px;
      --border-color: #e5e7eb;
      --highlight-color-focused: #7c3aed;
      --color: #1a0f2e;
      --placeholder-color: #d1d5db;
      --background: #fafafa;
    }

    .register-btn {
      --background: linear-gradient(135deg, #7c3aed, #a855f7);
      --background-activated: linear-gradient(135deg, #6d33d1, #944cd9);
      --border-radius: 14px;
      --box-shadow: 0 6px 20px rgba(124, 58, 237, 0.35);
      height: 52px;
      font-weight: 700;
      margin-top: 0.75rem;
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
export class RegisterPage {
  private readonly fb = inject(FormBuilder)
  private readonly authService = inject(AuthService)

  invalidEmailText = 'Not a valid email'
  invalidAliasText = 'Alias is required'
  invalidPasswordText = 'Password should have at least 6 characters'

  registerForm = this.fb.group({
    email: ['', [Validators.email, Validators.required]],
    alias: ['', [Validators.required]],
    password: ['', Validators.minLength(6)],
    passwordConfirm: ['', passwordConfirmMatchPasswordValidator()]
  })

  onSubmit() {
    const { email, password, alias } = this.registerForm.value
    this.authService.register(email!, password!, alias!)
  }
}

export function passwordConfirmMatchPasswordValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const controls = control.parent?.controls as { [key: string]: AbstractControl | null }
    const password = controls ? controls['password']?.value : null
    const passwordConfirm = control?.value
    return passwordConfirm === password ? null : { passwordConfirmMissmatch: true }
  }
}
