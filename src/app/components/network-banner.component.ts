import { Component, effect, inject, signal } from '@angular/core'
import { IonIcon } from '@ionic/angular/standalone'
import { addIcons } from 'ionicons'
import { wifiOutline, cloudOfflineOutline } from 'ionicons/icons'
import { NetworkService } from '../services/network.service'

@Component({
  selector: 'app-network-banner',
  styles: [
    `
      @keyframes slideDown {
        from {
          transform: translateY(-100%);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }
    `
  ],
  template: `
    @if (!networkService.isOnline()) {
      <div
        style="
        position:fixed;top:0;left:0;right:0;z-index:9999;
        background:var(--ion-color-danger);color:white;
        padding:10px 16px;display:flex;align-items:center;
        justify-content:center;gap:8px;font-weight:600;font-size:0.9rem;
        box-shadow:0 2px 8px rgba(0,0,0,0.3);animation:slideDown 0.3s ease
      "
      >
        <ion-icon
          name="cloud-offline-outline"
          style="font-size:1.2rem"
        ></ion-icon>
        Connexion perdue — tentative de reconnexion...
      </div>
    }

    @if (showReconnected()) {
      <div
        style="
        position:fixed;top:0;left:0;right:0;z-index:9999;
        background:var(--ion-color-success);color:white;
        padding:10px 16px;display:flex;align-items:center;
        justify-content:center;gap:8px;font-weight:600;font-size:0.9rem;
        box-shadow:0 2px 8px rgba(0,0,0,0.3);animation:slideDown 0.3s ease
      "
      >
        <ion-icon name="wifi-outline" style="font-size:1.2rem"></ion-icon>
        Connexion rétablie ✓
      </div>
    }
  `,
  imports: [IonIcon]
})
export class NetworkBannerComponent {
  readonly networkService = inject(NetworkService)
  readonly showReconnected = signal(false)

  private wasOffline = false
  private hideTimer?: ReturnType<typeof setTimeout>

  constructor() {
    addIcons({ wifiOutline, cloudOfflineOutline })

    effect(() => {
      const online = this.networkService.isOnline()
      if (!online) {
        this.wasOffline = true
        this.showReconnected.set(false)
        clearTimeout(this.hideTimer)
      } else if (this.wasOffline) {
        this.wasOffline = false
        this.showReconnected.set(true)
        this.hideTimer = setTimeout(() => this.showReconnected.set(false), 3000)
      }
    })
  }
}
