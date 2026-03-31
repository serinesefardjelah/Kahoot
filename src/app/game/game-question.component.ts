import { Component, input, output } from '@angular/core'
import {
  IonContent,
  IonButton,
  IonCard,
  IonCardContent,
  IonProgressBar,
  IonList,
  IonItem,
  IonLabel,
  IonBadge
} from '@ionic/angular/standalone'
import { PageHeaderComponent } from '../components/page-header'
import { Question } from '../models/question'
import { GameAnswer } from '../models/game'

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
          <ion-card>
            <ion-card-content>
              @if (question().imageUrl) {
                <img
                  [src]="question().imageUrl"
                  alt="Question image"
                  style="width:100%;max-height:220px;object-fit:cover;border-radius:10px;margin-bottom:1rem"
                />
              }
              <p
                style="font-size:1.3rem;font-weight:600;text-align:center;padding:1rem 0"
              >
                {{ question().text }}
              </p>
            </ion-card-content>
          </ion-card>
          <p
            style="font-size:1.3rem;font-weight:600;text-align:center;padding:1rem 0"
          >
            {{ question().text }}
          </p>
        </ion-card-content>
      </ion-card>

      @if (isHost()) {
        <!-- HOST: live bar chart per choice -->
        <div
          style="display:flex;flex-direction:column;gap:0.75rem;margin-top:1rem"
        >
          @for (choice of question().choices; track $index; let idx = $index) {
            @let count = countForChoice(idx);
            @let pct =
              answers().length > 0 ? (count / answers().length) * 100 : 0;
            @let whoAnswered = whoChose(idx);
            <div>
              <div
                style="display:flex;justify-content:space-between;margin-bottom:4px"
              >
                <span style="font-weight:600">{{ choice.text }}</span>
                <span style="color:var(--ion-color-medium)"
                  >{{ count }} / {{ answers().length }}</span
                >
              </div>
              <div
                style="background:var(--ion-color-light);border-radius:8px;overflow:hidden;height:36px;position:relative"
              >
                <div
                  [style.width.%]="pct"
                  [style.background]="choiceBgColors[idx % 4]"
                  style="height:100%;border-radius:8px;transition:width 0.4s ease;display:flex;align-items:center;padding-left:8px;overflow:hidden"
                >
                  @for (alias of whoAnswered; track alias) {
                    <ion-badge
                      style="margin-right:4px;font-size:0.65rem"
                      color="light"
                      >{{ alias }}</ion-badge
                    >
                  }
                </div>
              </div>
            </div>
          }
        </div>
        <p
          style="text-align:center;margin-top:1rem;color:var(--ion-color-medium)"
        >
          {{ answers().length }} / {{ playerCount() }} answered
        </p>
        <ion-button
          expand="block"
          style="margin-top:1rem"
          (click)="showResults.emit()"
        >
          Show Results
        </ion-button>
      } @else {
        <!-- PLAYER: choice buttons with opacity dimming -->
        <div
          style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-top:1rem"
        >
          @for (choice of question().choices; track $index; let idx = $index) {
            <ion-button
              expand="block"
              [color]="choiceColors[idx % 4]"
              [disabled]="hasAnswered() || timeLeft() === 0"
              (click)="answer.emit(idx)"
              [style.opacity]="
                hasAnswered() && selectedChoice() !== idx ? 0.3 : 1
              "
              [style.transition]="'opacity 0.3s ease'"
              style="height:80px;font-size:1rem"
            >
              {{ choice.text }}
            </ion-button>
          }
        </div>

        @if (hasAnswered()) {
          <p
            style="text-align:center;margin-top:2rem;color:var(--ion-color-medium)"
          >
            Answer submitted! Waiting for results...
          </p>
        } @else if (timeLeft() === 0) {
          <p
            style="text-align:center;margin-top:2rem;color:var(--ion-color-danger)"
          >
            Time's up! Waiting for results...
          </p>
        }
      }
    </ion-content>
  `,
  imports: [
    IonContent,
    IonButton,
    IonCard,
    IonCardContent,
    IonProgressBar,
    IonList,
    IonItem,
    IonLabel,
    IonBadge,
    PageHeaderComponent
  ]
})
export class GameQuestionComponent {
  readonly question = input.required<Question>()
  readonly questionIndex = input.required<number>()
  readonly total = input.required<number>()
  readonly isHost = input.required<boolean>()
  readonly hasAnswered = input.required<boolean>()
  readonly selectedChoice = input<number | null>(null)
  readonly timeLeft = input.required<number>()
  readonly timerProgress = input.required<number>()
  readonly answers = input.required<GameAnswer[]>()
  readonly playerCount = input.required<number>()
  readonly players = input.required<{ uid: string; alias: string }[]>()

  readonly answer = output<number>()
  readonly showResults = output<void>()

  readonly choiceColors = ['primary', 'secondary', 'tertiary', 'warning']
  readonly choiceBgColors = [
    'var(--ion-color-primary)',
    'var(--ion-color-secondary)',
    'var(--ion-color-tertiary)',
    'var(--ion-color-warning)'
  ]

  countForChoice(choiceIndex: number): number {
    return this.answers().filter((a) => a.choiceIndex === choiceIndex).length
  }

  whoChose(choiceIndex: number): string[] {
    const answerers = this.answers()
      .filter((a) => a.choiceIndex === choiceIndex)
      .map((a) => a.userId)
    return this.players()
      .filter((p) => answerers.includes(p.uid))
      .map((p) => p.alias)
  }
}
