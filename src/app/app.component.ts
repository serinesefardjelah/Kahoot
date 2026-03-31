import { Component } from '@angular/core'
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone'
import { NetworkBannerComponent } from './components/network-banner.component'

@Component({
  selector: 'app-root',
  template: ` <ion-app>
    <app-network-banner />

    <ion-router-outlet></ion-router-outlet>
  </ion-app>`,
  imports: [IonApp, IonRouterOutlet, NetworkBannerComponent]
})
export class AppComponent {
  constructor() {}
}
