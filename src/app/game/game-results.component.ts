import { Component, input, output } from '@angular/core'
import {
  IonContent,
  IonButton,
  IonCard,
  IonCardContent
} from '@ionic/angular/standalone'
import { PageHeaderComponent } from '../components/page-header'
import { Question } from '../models/question'
import { GameAnswer } from '../models/game'

@Component({
  selector: 'app-game-results',
  template: `
    <app-page-header [translucent]="true">Results</app-page-header>
    <ion-content [fullscreen]="true" class="ion-padding">
      <app-page-header collapse="condense">Results</app-page-header>

      <ion-card color="success" style="margin-bottom:1.5rem">
        <ion-card-content
          style="text-align:center;font-weight:700;font-size:1.1rem"
        >
          Correct answer:
          {{ question().choices[question().correctChoiceIndex].text }}
        </ion-card-content>
      </ion-card>

      <div
        style="display:flex;flex-direction:column;gap:0.75rem;margin-bottom:2rem"
      >
        @for (choice of question().choices; track $index; let idx = $index) {
          @let count = countForChoice(idx);
          @let total = answers().length;
          @let pct = total > 0 ? (count / total) * 100 : 0;
          @let isCorrect = idx === question().correctChoiceIndex;
          @let isSelected = idx === selectedChoice();

          <div>
            <div
              style="display:flex;justify-content:space-between;margin-bottom:4px"
            >
              <span style="font-weight:500">
                {{ choice.text }}
                @if (isSelected && !isCorrect) {
                  <span style="color:var(--ion-color-danger);font-size:0.8rem">
                    ← your answer</span
                  >
                }
                @if (isSelected && isCorrect) {
                  <span style="color:var(--ion-color-success);font-size:0.8rem">
                    ← your answer ✓</span
                  >
                }
              </span>
              <span>{{ count }} votes</span>
            </div>
            <div
              style="background:var(--ion-color-light);border-radius:8px;overflow:hidden;height:32px"
            >
              <div
                [style.width.%]="pct"
                [style.background]="
                  isCorrect
                    ? 'var(--ion-color-success)'
                    : isSelected
                      ? 'var(--ion-color-danger)'
                      : 'var(--ion-color-medium)'
                "
                style="height:100%;border-radius:8px;transition:width 0.6s ease"
              ></div>
            </div>
          </div>
        }
      </div>

      @if (isHost()) {
        <ion-button expand="block" (click)="showScoreboard.emit()">
          Show Scoreboard
        </ion-button>
      } @else {
        <p style="text-align:center;color:var(--ion-color-medium)">
          Waiting for host...
        </p>
      }
    </ion-content>
  `,
  imports: [IonContent, IonButton, IonCard, IonCardContent, PageHeaderComponent]
})
export class GameResultsComponent {
  readonly question = input.required<Question>()
  readonly answers = input.required<GameAnswer[]>()
  readonly isHost = input.required<boolean>()
  readonly showScoreboard = output<void>()
  readonly selectedChoice = input<number | null>(null)

  countForChoice(choiceIndex: number): number {
    return this.answers().filter((a) => a.choiceIndex === choiceIndex).length
  }
}
