import { Component, input, output } from '@angular/core'
import {
  IonContent,
  IonButton,
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
  IonIcon
} from '@ionic/angular/standalone'
import { PageHeaderComponent } from '../components/page-header'
import { addIcons } from 'ionicons'
import { trophyOutline } from 'ionicons/icons'

@Component({
  selector: 'app-game-scoreboard',
  template: `
    <app-page-header [translucent]="true">
      {{ isFinal() ? 'Final Scoreboard' : 'Scoreboard' }}
    </app-page-header>
    <ion-content [fullscreen]="true" class="ion-padding">
      <app-page-header collapse="condense">
        {{ isFinal() ? 'Final Scoreboard' : 'Scoreboard' }}
      </app-page-header>

      @if (isFinal()) {
        <div style="text-align:center;margin:2rem 0">
          <ion-icon
            name="trophy-outline"
            style="font-size:5rem;color:var(--ion-color-warning)"
          >
          </ion-icon>
          <h2>Game Over!</h2>
        </div>
      }

      <ion-list>
        @for (entry of scores(); track entry.uid; let i = $index) {
          <ion-item [color]="i === 0 ? 'warning' : ''">
            <ion-label
              ><strong>{{ i + 1 }}. {{ entry.alias }}</strong></ion-label
            >
            <ion-badge slot="end" [color]="i === 0 ? 'dark' : 'primary'">
              {{ entry.score }} pts
            </ion-badge>
          </ion-item>
        }
      </ion-list>

      @if (isHost()) {
        <ion-button
          expand="block"
          style="margin-top:2rem"
          (click)="next.emit()"
        >
          {{ isFinal() ? 'Back to Home' : nextLabel() }}
        </ion-button>
      } @else {
        <p
          style="text-align:center;color:var(--ion-color-medium);margin-top:2rem"
        >
          Waiting for host...
        </p>
      }
    </ion-content>
  `,
  imports: [
    IonContent,
    IonButton,
    IonList,
    IonItem,
    IonLabel,
    IonBadge,
    IonIcon,
    PageHeaderComponent
  ]
})
export class GameScoreboardComponent {
  readonly scores =
    input.required<{ uid: string; alias: string; score: number }[]>()
  readonly isHost = input.required<boolean>()
  readonly isFinal = input<boolean>(false)
  readonly nextLabel = input<string>('Next Question')
  readonly next = output<void>()

  constructor() {
    addIcons({ trophyOutline })
  }
}
