import { Component, inject, signal } from '@angular/core'
import { rxResource, toSignal } from '@angular/core/rxjs-interop'
import {
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonFab,
  IonFabButton,
  IonIcon,
  ModalController
} from '@ionic/angular/standalone'
import { QuizService } from '../services/quiz.service'
import { QuizCardComponent } from '../components/quiz.card'
import { addIcons } from 'ionicons'
import { add, gridOutline } from 'ionicons/icons'
import { CreateQuizModalComponent } from '../modals/create-quiz.modal'
import { PageHeaderComponent } from '../components/page-header'

@Component({
  selector: 'app-quiz-list',
  template: `
    <app-page-header [translucent]="true">My Quizzes</app-page-header>

    <ion-content [fullscreen]="true" class="list-content">
      <app-page-header collapse="condense">My Quizzes</app-page-header>

      @let quizzes = this.quizzes.value();

      @if (!quizzes?.length) {
        <div class="empty-state">
          <div class="empty-icon">📝</div>
          <p class="empty-title">No quizzes yet</p>
          <p class="empty-sub">Tap + to create your first quiz</p>
        </div>
      } @else {
        <ion-grid class="quiz-grid">
          <ion-row>
            @for (quiz of quizzes; track quiz.id) {
              <ion-col size="12">
                <app-quiz-card [quiz]="quiz" />
              </ion-col>
            }
          </ion-row>
        </ion-grid>
      }
    </ion-content>

    <ion-fab slot="fixed" horizontal="end" vertical="bottom">
      <ion-fab-button (click)="openCreateQuizModal()">
        <ion-icon name="add"></ion-icon>
      </ion-fab-button>
    </ion-fab>
  `,
  styles: [
    `
      .list-content {
        --padding-top: 0.5rem;
      }

      .quiz-grid {
        padding: 0.75rem 0.75rem 5rem;
      }

      ion-col {
        padding: 0.4rem;
      }

      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 60vh;
        text-align: center;
        padding: 2rem;
      }

      .empty-icon {
        font-size: 4rem;
        margin-bottom: 1rem;
      }

      .empty-title {
        font-size: 1.2rem;
        font-weight: 700;
        margin: 0 0 0.5rem;
        color: var(--ion-text-color);
      }

      .empty-sub {
        font-size: 0.9rem;
        color: var(--ion-color-medium);
        margin: 0;
      }

      ion-fab-button {
        --background: linear-gradient(135deg, #7c3aed, #a855f7);
        --box-shadow: 0 6px 20px rgba(124, 58, 237, 0.5);
        margin-bottom: env(safe-area-inset-bottom);
      }
    `
  ],
  imports: [
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    QuizCardComponent,
    IonFab,
    IonFabButton,
    IonIcon,
    PageHeaderComponent
  ]
})
export class QuizListPage {
  private readonly quizService = inject(QuizService)
  private readonly modalCtrl = inject(ModalController)

  protected readonly quizzes = rxResource({
    stream: () => this.quizService.getAll()
  })

  constructor() {
    addIcons({ add, gridOutline })
  }

  async openCreateQuizModal() {
    const modalRef = await this.modalCtrl.create({
      component: CreateQuizModalComponent,
      cssClass: 'fullscreen-modal'
    })

    modalRef.present()
    const eventDetails = await modalRef.onDidDismiss()
    if (eventDetails.data) {
      this.quizService.setQuiz(eventDetails.data)
    }
  }
}
