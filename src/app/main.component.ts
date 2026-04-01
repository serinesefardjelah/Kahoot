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
        --background: #ffffff;
        border-top: 1px solid rgba(124, 58, 237, 0.08);
        box-shadow: 0 -4px 20px rgba(124, 58, 237, 0.06);
        padding-bottom: env(safe-area-inset-bottom);
        height: 62px;
      }

      ion-tab-button {
        --color: #c4b5fd;
        --color-selected: #7c3aed;
      }

      ion-label {
        font-size: 0.72rem;
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
