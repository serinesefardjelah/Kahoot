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
import { trophyOutline, sadOutline, ribbonOutline } from 'ionicons/icons'

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
        @let myScore = getMyScore();
        @let isWinner =
          myScore !== null &&
          scores().length > 0 &&
          myScore.score === scores()[0].score;

        <div style="text-align:center;margin:1.5rem 0">
          @if (isHost()) {
            <ion-icon
              name="trophy-outline"
              style="font-size:4rem;color:var(--ion-color-warning)"
            ></ion-icon>
            <h2>Game Over!</h2>
          } @else if (isWinner) {
            <ion-icon
              name="trophy-outline"
              style="font-size:4rem;color:var(--ion-color-warning)"
            ></ion-icon>
            <h2 style="color:var(--ion-color-warning)">Congratulations!</h2>
            <p style="color:var(--ion-color-medium)">
              You won with {{ myScore!.score }} pts
            </p>
          } @else {
            <ion-icon
              name="ribbon-outline"
              style="font-size:4rem;color:var(--ion-color-medium)"
            ></ion-icon>
            <h2>Game Over!</h2>
            @if (myScore) {
              <p style="color:var(--ion-color-medium)">
                You finished #{{ myRank() }} with {{ myScore.score }} pts
              </p>
            }
          }
        </div>
      }

      <ion-list>
        @for (entry of scores(); track entry.uid; let i = $index) {
          <ion-item
            [color]="
              i === 0 ? 'warning' : entry.uid === currentUserId() ? 'light' : ''
            "
          >
            <ion-label>
              <strong>{{ i + 1 }}. {{ entry.alias }}</strong>
              @if (entry.uid === currentUserId()) {
                <span style="color:var(--ion-color-primary);font-size:0.8rem">
                  (you)</span
                >
              }
            </ion-label>
            <ion-badge slot="end" [color]="i === 0 ? 'dark' : 'primary'">
              {{ entry.score }} pts
            </ion-badge>
          </ion-item>
        }
      </ion-list>

      @if (isHost() || isFinal()) {
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
  readonly currentUserId = input<string | null>(null)
  readonly next = output<void>()

  constructor() {
    addIcons({ trophyOutline, sadOutline, ribbonOutline })
  }

  getMyScore(): { uid: string; alias: string; score: number } | null {
    if (!this.currentUserId()) return null
    return this.scores().find((s) => s.uid === this.currentUserId()) ?? null
  }

  myRank(): number {
    if (!this.currentUserId()) return 0
    return this.scores().findIndex((s) => s.uid === this.currentUserId()) + 1
  }
}
