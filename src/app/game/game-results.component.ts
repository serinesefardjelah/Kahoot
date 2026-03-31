import { Component, input, output } from '@angular/core'
import {
  IonContent,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
  IonIcon
} from '@ionic/angular/standalone'
import { PageHeaderComponent } from '../components/page-header'
import { Question } from '../models/question'
import { GameAnswer } from '../models/game'
import { addIcons } from 'ionicons'
import { checkmarkCircle, closeCircle, trophyOutline } from 'ionicons/icons'

@Component({
  selector: 'app-game-results',
  template: `
    <app-page-header [translucent]="true">Results</app-page-header>
    <ion-content [fullscreen]="true" class="ion-padding">
      <app-page-header collapse="condense">Results</app-page-header>

      <!-- ✅ Correct answer banner -->
      <ion-card color="success" style="margin-bottom:1rem">
        <ion-card-content
          style="text-align:center;font-weight:700;font-size:1.1rem;padding:1rem"
        >
          ✅ {{ question().choices[question().correctChoiceIndex].text }}
        </ion-card-content>
      </ion-card>

      <!-- Player's own result -->
      @if (!isHost() && selectedChoice() !== null) {
        <ion-card
          [color]="
            selectedChoice() === question().correctChoiceIndex
              ? 'success'
              : 'danger'
          "
          style="margin-bottom:1rem"
        >
          <ion-card-content style="text-align:center;padding:0.75rem">
            @if (selectedChoice() === question().correctChoiceIndex) {
              <p style="margin:0;font-weight:600">
                🎉 Correct! +{{ pointsEarned() }} pts
              </p>
            } @else {
              <p style="margin:0;font-weight:600">
                ❌ Wrong — you answered:
                {{ question().choices[selectedChoice()!].text }}
              </p>
            }
          </ion-card-content>
        </ion-card>
      }

      <!-- Vote bars -->
      <ion-card style="margin-bottom:1rem">
        <ion-card-header>
          <ion-card-title style="font-size:1rem">Answers</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <div style="display:flex;flex-direction:column;gap:0.6rem">
            @for (
              choice of question().choices;
              track $index;
              let idx = $index
            ) {
              @let count = countForChoice(idx);
              @let total = answers().length;
              @let pct = total > 0 ? (count / total) * 100 : 0;
              @let isCorrect = idx === question().correctChoiceIndex;
              @let isMyChoice = idx === selectedChoice();
              <div>
                <div
                  style="display:flex;justify-content:space-between;margin-bottom:3px;align-items:center"
                >
                  <span
                    style="font-weight:500;display:flex;align-items:center;gap:6px"
                  >
                    @if (isCorrect) {
                      <ion-icon
                        name="checkmark-circle"
                        color="success"
                      ></ion-icon>
                    }
                    @if (!isCorrect && isMyChoice) {
                      <ion-icon name="close-circle" color="danger"></ion-icon>
                    }
                    {{ choice.text }}
                    @if (isMyChoice) {
                      <ion-badge color="primary" style="font-size:0.65rem"
                        >you</ion-badge
                      >
                    }
                  </span>
                  <span style="color:var(--ion-color-medium);font-size:0.85rem"
                    >{{ count }} votes</span
                  >
                </div>
                <div
                  style="background:var(--ion-color-light);border-radius:8px;overflow:hidden;height:28px"
                >
                  <div
                    [style.width.%]="pct"
                    [style.background]="
                      isCorrect
                        ? 'var(--ion-color-success)'
                        : isMyChoice
                          ? 'var(--ion-color-danger)'
                          : 'var(--ion-color-medium)'
                    "
                    style="height:100%;border-radius:8px;transition:width 0.6s ease"
                  ></div>
                </div>
              </div>
            }
          </div>
        </ion-card-content>
      </ion-card>

      <!-- Scoreboard -->
      <ion-card style="margin-bottom:1.5rem">
        <ion-card-header>
          <ion-card-title
            style="font-size:1rem;display:flex;align-items:center;gap:6px"
          >
            <ion-icon name="trophy-outline" color="warning"></ion-icon>
            Scoreboard
          </ion-card-title>
        </ion-card-header>
        <ion-card-content style="padding:0">
          <ion-list lines="full" style="margin:0">
            @for (entry of scores(); track entry.uid; let i = $index) {
              <ion-item
                [color]="
                  i === 0
                    ? 'warning'
                    : entry.uid === currentUserId()
                      ? 'light'
                      : ''
                "
              >
                <ion-label>
                  <strong>{{ i + 1 }}. {{ entry.alias }}</strong>
                  @if (entry.uid === currentUserId()) {
                    <span
                      style="color:var(--ion-color-primary);font-size:0.8rem"
                    >
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
        </ion-card-content>
      </ion-card>

      <!-- Actions -->
      @if (isHost()) {
        <ion-button expand="block" (click)="next.emit()">
          {{ nextLabel() }}
        </ion-button>
      } @else {
        <p
          style="text-align:center;color:var(--ion-color-medium);margin-top:1rem"
        >
          Waiting for host...
        </p>
      }
    </ion-content>
  `,
  imports: [
    IonContent,
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonList,
    IonItem,
    IonLabel,
    IonBadge,
    IonIcon,
    PageHeaderComponent
  ]
})
export class GameResultsComponent {
  readonly question = input.required<Question>()
  readonly answers = input.required<GameAnswer[]>()
  readonly isHost = input.required<boolean>()
  readonly selectedChoice = input<number | null>(null)
  readonly scores =
    input.required<{ uid: string; alias: string; score: number }[]>()
  readonly currentUserId = input<string | null>(null)
  readonly nextLabel = input<string>('Next Question')

  readonly next = output<void>() // ← replaces showScoreboard

  constructor() {
    addIcons({ checkmarkCircle, closeCircle, trophyOutline })
  }

  countForChoice(choiceIndex: number): number {
    return this.answers().filter((a) => a.choiceIndex === choiceIndex).length
  }

  pointsEarned(): number {
    const myAnswer = this.answers().find(
      (a) => a.userId === this.currentUserId()
    )
    if (!myAnswer) return 0
    const speedBonus = Math.max(
      0,
      1000 - Math.floor((myAnswer.timeMs ?? 0) / 20)
    )
    return 1000 + speedBonus
  }
}
