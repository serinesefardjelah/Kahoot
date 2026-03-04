import { Component } from '@angular/core'
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent
} from '@ionic/angular/standalone'
import { PageHeaderComponent } from '../components/page-header'

@Component({
  selector: 'app-join-game',
  template: `
    <app-page-header [translucent]="true"> Join Game </app-page-header>

    <ion-content [fullscreen]="true">
      <app-page-header collapse="condense"> Join Game </app-page-header>

      <div id="container"></div>
    </ion-content>
  `,
  styles: [``],
  imports: [IonContent, PageHeaderComponent]
})
export class JoinGamePage {}
