import { Component, input, output } from '@angular/core'
import {
  IonContent,
  IonButton,
  IonCard,
  IonCardContent,
  IonProgressBar
} from '@ionic/angular/standalone'
import { PageHeaderComponent } from '../components/page-header'
import { Question } from '../models/question'

@Component({
  selector: 'app-game-question',
  template: `
    <app-page-header [translucent]="true">
      Question {{ questionIndex() + 1 }} / {{ total() }}
    </app-page-header>
    <ion-content [fullscreen]="true" class="ion-padding">
      <app-page-header collapse="condense">
        Question {{ questionIndex() + 1 }} / {{ total() }}
      </app-page-header>

      <ion-progress-bar
        [value]="timerProgress()"
        [color]="
          timerProgress() > 0.4
            ? 'success'
            : timerProgress() > 0.2
              ? 'warning'
              : 'danger'
        "
        style="height:8px;margin-bottom:0.5rem"
      ></ion-progress-bar>
      <p
        style="text-align:right;color:var(--ion-color-medium);font-size:0.85rem;margin-bottom:1rem"
      >
        {{ timeLeft() }}s
      </p>

      <ion-card>
        <ion-card-content>
          <p
            style="font-size:1.3rem;font-weight:600;text-align:center;padding:1rem 0"
          >
            {{ question().text }}
          </p>
        </ion-card-content>
      </ion-card>

      <div
        style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-top:1rem"
      >
        @for (choice of question().choices; track $index; let idx = $index) {
          @if (isHost()) {
            <ion-card style="margin:0;opacity:0.8">
              <ion-card-content style="text-align:center;font-weight:600">
                {{ choice.text }}
              </ion-card-content>
            </ion-card>
          } @else {
            <ion-button
              expand="block"
              [color]="choiceColors[idx % 4]"
              [disabled]="hasAnswered()"
              (click)="answer.emit(idx)"
              style="height:80px;font-size:1rem"
            >
              {{ choice.text }}
            </ion-button>
          }
        }
      </div>

      @if (!isHost() && hasAnswered()) {
        <p
          style="text-align:center;margin-top:2rem;color:var(--ion-color-medium)"
        >
          Answer submitted! Waiting for results...
        </p>
      }

      @if (isHost()) {
        <p
          style="text-align:center;margin-top:1rem;color:var(--ion-color-medium)"
        >
          {{ answeredCount() }} / {{ playerCount() }} answered
        </p>
        <ion-button
          expand="block"
          style="margin-top:1rem"
          (click)="showResults.emit()"
        >
          Show Results
        </ion-button>
      }
    </ion-content>
  `,
  imports: [
    IonContent,
    IonButton,
    IonCard,
    IonCardContent,
    IonProgressBar,
    PageHeaderComponent
  ]
})
export class GameQuestionComponent {
  readonly question = input.required<Question>()
  readonly questionIndex = input.required<number>()
  readonly total = input.required<number>()
  readonly isHost = input.required<boolean>()
  readonly hasAnswered = input.required<boolean>()
  readonly timeLeft = input.required<number>()
  readonly timerProgress = input.required<number>()
  readonly answeredCount = input.required<number>()
  readonly playerCount = input.required<number>()
  readonly answer = output<number>()
  readonly showResults = output<void>()
  readonly choiceColors = ['primary', 'secondary', 'tertiary', 'warning']
}
