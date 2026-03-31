import { Component, inject } from '@angular/core'
import { rxResource } from '@angular/core/rxjs-interop'
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
import { add } from 'ionicons/icons'
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
          <div class="empty-art">
            <div class="empty-circle c1"></div>
            <div class="empty-circle c2"></div>
            <div class="empty-circle c3"></div>
            <span class="empty-emoji">📝</span>
          </div>
          <h3 class="empty-title">No quizzes yet</h3>
          <p class="empty-sub">Tap the + button to create your first quiz</p>
        </div>
      } @else {
        <div class="list-header">
          <p class="list-count">{{ quizzes!.length }} quiz{{ quizzes!.length > 1 ? 'zes' : '' }}</p>
        </div>
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
  styles: [`
    .list-content {
      --background: #f8f5ff;
    }

    .list-header {
      padding: 1rem 1.25rem 0.25rem;
    }

    .list-count {
      margin: 0;
      font-size: 0.8rem;
      font-weight: 600;
      color: #9ca3af;
      text-transform: uppercase;
      letter-spacing: 0.8px;
    }

    .quiz-grid {
      padding: 0.5rem 0.75rem 5rem;
    }

    ion-col {
      padding: 0.4rem;
    }

    /* Empty state */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 65vh;
      text-align: center;
      padding: 2rem;
    }

    .empty-art {
      position: relative;
      width: 120px;
      height: 120px;
      margin-bottom: 1.5rem;
    }

    .empty-circle {
      position: absolute;
      border-radius: 50%;
      opacity: 0.2;
    }

    .c1 { width: 120px; height: 120px; background: #7c3aed; top: 0; left: 0; }
    .c2 { width: 80px; height: 80px; background: #a855f7; top: 20px; left: 20px; }
    .c3 { width: 50px; height: 50px; background: #ec4899; top: 35px; left: 35px; }

    .empty-emoji {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 2.5rem;
    }

    .empty-title {
      margin: 0 0 0.5rem;
      font-size: 1.2rem;
      font-weight: 800;
      color: #1a0f2e;
    }

    .empty-sub {
      margin: 0;
      font-size: 0.9rem;
      color: #9ca3af;
      max-width: 220px;
    }

    ion-fab-button {
      --background: linear-gradient(135deg, #7c3aed, #a855f7);
      --box-shadow: 0 6px 20px rgba(124, 58, 237, 0.45);
      margin-bottom: env(safe-area-inset-bottom);
    }
  `],
  imports: [
    IonContent, IonGrid, IonRow, IonCol,
    QuizCardComponent, IonFab, IonFabButton, IonIcon,
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
    addIcons({ add })
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
