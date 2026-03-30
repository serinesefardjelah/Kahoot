import { inject, Injectable } from '@angular/core'
import {
  Auth,
  User,
  user,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithCredential
} from '@angular/fire/auth'
import { Router } from '@angular/router'
import { Observable } from 'rxjs'
import { FirebaseAuthentication } from '@capacitor-firebase/authentication'
import { UserService } from './user.service'
import { ToastController } from '@ionic/angular/standalone'

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth)
  private router = inject(Router)
  private userService = inject(UserService)
  private toastController = inject(ToastController)

  getConnectedUser(): Observable<User | null> {
    return user(this.auth)
  }

  async register(
    email: string,
    password: string,
    alias: string
  ): Promise<void> {
    let toast: HTMLIonToastElement | undefined
    try {
      const userCred = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      )
      await this.userService.create({ alias, ...userCred.user })
      await sendEmailVerification(userCred.user)
      await this.logout()
      toast = await this.toastController.create({
        message: 'Account created! Please verify your email before logging in.',
        duration: 4000,
        color: 'success'
      })
    } catch (error: any) {
      console.error(error)
      toast = await this.toastController.create({
        message: this.getRegisterErrorMessage(error?.code),
        duration: 3000,
        color: 'danger'
      })
    } finally {
      await toast?.present()
    }
  }

  private getRegisterErrorMessage(code: string): string {
    switch (code) {
      case 'auth/email-already-in-use':
        return 'This email is already associated with an account.'
      case 'auth/invalid-email':
        return 'Invalid email address.'
      case 'auth/weak-password':
        return 'Password is too weak. Use at least 6 characters.'
      case 'auth/operation-not-allowed':
        return 'Email/password registration is not enabled.'
      default:
        return 'Something went wrong. Please try again.'
    }
  }

  async login(identifier: string, password: string): Promise<void> {
    let toast: HTMLIonToastElement | undefined
    try {
      let email = identifier
      if (!identifier.includes('@')) {
        const found = await this.userService.getByAlias(identifier)
        if (!found) {
          toast = await this.toastController.create({
            message: 'No account found with this alias',
            duration: 3000,
            color: 'danger'
          })
          await toast.present()
          return
        }
        email = found.email
      }
      await signInWithEmailAndPassword(this.auth, email, password)
      this.router.navigateByUrl('/')
      toast = await this.toastController.create({
        message: 'Login successful',
        duration: 1500,
        color: 'success'
      })
    } catch (error: any) {
      console.error(error)
      toast = await this.toastController.create({
        message: this.getLoginErrorMessage(error?.code),
        duration: 3000,
        color: 'danger'
      })
    } finally {
      await toast?.present()
    }
  }

  private getLoginErrorMessage(code: string): string {
    switch (code) {
      case 'auth/invalid-email':
        return 'Invalid email address.'
      case 'auth/invalid-credential':
        return 'Incorrect email or password.'
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.'
      case 'auth/user-disabled':
        return 'This account has been disabled.'
      default:
        return 'Something went wrong. Please try again.'
    }
  }

  async signInWithGoogle(): Promise<void> {
    let toast: HTMLIonToastElement | undefined
    try {
      const result = await FirebaseAuthentication.signInWithGoogle()
      const credential = GoogleAuthProvider.credential(
        result.credential?.idToken
      )
      await signInWithCredential(this.auth, credential)
      const uid = result.user?.uid
      if (uid) {
        const existing = await this.userService.getByUid(uid)
        if (!existing) {
          const alias =
            result.user?.displayName?.replace(/\s+/g, '').toLowerCase() ??
            `user_${uid.slice(0, 6)}`
          await this.userService.createFromGoogle(
            uid,
            alias,
            result.user?.email ?? ''
          )
        }
      }
      this.router.navigateByUrl('/')
    } catch (error: any) {
      console.error(error)
      const message =
        error?.code === 'auth/cancelled-popup-request' ||
        error?.message?.includes('cancelled')
          ? 'Google sign-in was cancelled.'
          : 'Google sign-in failed. Please try again.'
      toast = await this.toastController.create({
        message,
        duration: 3000,
        color: 'danger'
      })
      await toast.present()
    }
  }

  async logout(): Promise<void> {
    await signOut(this.auth)
    this.router.navigateByUrl('/')
  }

  async sendResetPasswordLink(email: string): Promise<void> {
    let toast: HTMLIonToastElement | undefined
    try {
      await sendPasswordResetEmail(this.auth, email)
      toast = await this.toastController.create({
        message: 'Password reset email sent. Check your inbox.',
        duration: 4000,
        color: 'success'
      })
    } catch (error: any) {
      console.error(error)
      const message =
        error?.code === 'auth/invalid-email'
          ? 'Invalid email address.'
          : error?.code === 'auth/user-not-found'
            ? 'No account found with this email.'
            : 'Something went wrong. Please try again.'
      toast = await this.toastController.create({
        message,
        duration: 3000,
        color: 'danger'
      })
    } finally {
      await toast?.present()
    }
  }
}
