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
import {
  IonButton,
  IonContent,
  IonInput,
  IonIcon
} from '@ionic/angular/standalone'
import { RouterLink } from '@angular/router'
import { addIcons } from 'ionicons'
import { arrowBackOutline } from 'ionicons/icons'

addIcons({ arrowBackOutline })

@Component({
  selector: 'app-register',
  template: `
    <ion-content [fullscreen]="true">
      <div class="auth-bg">
        <div class="auth-wrapper">
          <div class="brand">
            <div class="brand-icon">⚡</div>
            <h1 class="brand-name">Create account</h1>
            <p class="brand-tagline">Join the fun</p>
          </div>

          <div class="auth-card">
            <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
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

              <ion-input
                formControlName="alias"
                fill="outline"
                label="Alias"
                labelPlacement="floating"
                placeholder="Your display name"
                type="text"
                [errorText]="invalidAliasText"
                class="styled-input"
              ></ion-input>

              <ion-input
                formControlName="password"
                fill="outline"
                label="Password"
                labelPlacement="floating"
                type="password"
                minlength="6"
                [errorText]="invalidPasswordText"
                class="styled-input"
              ></ion-input>

              <ion-input
                formControlName="passwordConfirm"
                fill="outline"
                label="Confirm Password"
                labelPlacement="floating"
                type="password"
                errorText="Does not match password"
                class="styled-input"
              ></ion-input>

              <ion-button
                expand="block"
                type="submit"
                [disabled]="registerForm.invalid"
                class="main-btn"
              >
                Create Account
              </ion-button>
            </form>

            <p class="auth-switch">
              Already have an account? <a routerLink="/login">Sign in</a>
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
        margin-top: 0.5rem;
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
    const controls = control.parent?.controls as {
      [key: string]: AbstractControl | null
    }

    const password = controls ? controls['password']?.value : null
    const passwordConfirm = control?.value

    return passwordConfirm === password
      ? null
      : { passwordConfirmMissmatch: true }
  }
}
