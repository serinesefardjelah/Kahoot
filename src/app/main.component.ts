import { Component } from '@angular/core'
import {
  IonIcon,
  IonTabBar,
  IonTabButton,
  IonTabs,
  IonLabel
} from '@ionic/angular/standalone'
import { addIcons } from 'ionicons'
import { gameControllerOutline, playCircle } from 'ionicons/icons'

@Component({
  selector: 'app-main',
  template: `
    <ion-tabs>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="quizzes">
          <ion-icon name="play-circle"></ion-icon>
          <ion-label>My Quizzes</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="join-game">
          <ion-icon name="game-controller-outline"></ion-icon>
          <ion-label>Join Game</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  `,
  styles: [
    `
      ion-tab-bar {
        --background: #160a30;
        border-top: 1px solid rgba(192, 132, 252, 0.12);
        padding-bottom: env(safe-area-inset-bottom);
        height: 60px;
      }

      ion-tab-button {
        --color: rgba(192, 132, 252, 0.45);
        --color-selected: #a855f7;
      }

      ion-label {
        font-size: 0.75rem;
        font-weight: 600;
      }
    `
  ],
  imports: [IonIcon, IonTabBar, IonTabButton, IonTabs, IonLabel]
})
export class MainComponent {
  constructor() {
    addIcons({ gameControllerOutline, playCircle })
  }
}
