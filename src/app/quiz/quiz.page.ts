import {
  Component,
  computed,
  effect,
  inject,
  input,
  model,
  output
} from '@angular/core'
import { rxResource } from '@angular/core/rxjs-interop'
import { form, Field, required, FieldTree } from '@angular/forms/signals'
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonTextarea,
  IonList,
  IonItem,
  IonInput,
  IonItemSliding,
  IonLabel,
  IonItemOptions,
  IonItemOption,
  IonIcon,
  IonButtons,
  IonButton,
  IonFab,
  IonFabButton,
  ModalController,
  ActionSheetController,
  PopoverController,
  IonPopover
} from '@ionic/angular/standalone'
import { TitleCasePipe } from '@angular/common'
import { QuizService } from '../services/quiz.service'

import { addIcons } from 'ionicons'
import {
  trashOutline,
  saveOutline,
  add,
  ellipsisVerticalOutline,
  createOutline,
  helpCircleOutline
} from 'ionicons/icons'
import { Router, RouterLink } from '@angular/router'
import { Quiz } from '../models/quiz'
import { CreateQuizModalComponent } from '../modals/create-quiz.modal'
import { PageHeaderComponent } from '../components/page-header'

@Component({
  selector: 'app-quiz-options-popover',
  template: `
    <ion-content class="ion-padding">
      <ion-list>
        <ion-item button (click)="delete()" color="danger">
          <ion-icon slot="start" name="trash-outline"></ion-icon>
          <ion-label>Delete</ion-label>
        </ion-item>
        <ion-item button (click)="edit()">
          <ion-icon slot="start" name="create-outline"></ion-icon>
          <ion-label>Edit</ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  `,
  imports: [IonContent, IonList, IonItem, IonIcon, IonLabel]
})
export class QuizOptionsPopoverComponent {
  popoverCtrl = inject(PopoverController)

  constructor() {
    addIcons({ createOutline, trashOutline })
  }

  delete() {
    this.popoverCtrl.dismiss({ action: 'delete' })
  }

  edit() {
    this.popoverCtrl.dismiss({ action: 'edit' })
  }
}

@Component({
  selector: 'app-quiz-page-toolbar',
  template: `
    <ion-toolbar>
      <ion-title>
        <ion-list lines="none">
          <ion-item>
            <ion-input
              aria-label="Title"
              [field]="quizForm().title"
              placeholder="Enter the quiz title here"
            ></ion-input>
          </ion-item>
        </ion-list>
      </ion-title>
      <ion-buttons slot="end">
        <ion-button
          id="open-options"
          color="medium"
          (click)="openOptions($event)"
        >
          <ion-icon name="ellipsis-vertical-outline"></ion-icon>
        </ion-button>

        @if (quizForm()().dirty()) {
          <ion-button form="quizForm" type="submit">
            Save <ion-icon slot="end" name="save-outline"></ion-icon>
          </ion-button>
        }
      </ion-buttons>
    </ion-toolbar>
  `,
  imports: [
    IonToolbar,
    IonTitle,
    IonList,
    IonItem,
    IonInput,
    IonButtons,
    IonButton,
    IonIcon,
    Field
  ]
})
export class QuizPageToolbarComponent {
  popoverCtrl = inject(PopoverController)
  quizForm = input.required<FieldTree<Quiz, string | number>>()

  delete = output<void>()
  edit = output<void>()

  constructor() {
    addIcons({ ellipsisVerticalOutline, trashOutline })
  }

  async openOptions(event: Event) {
    const popover = await this.popoverCtrl.create({
      component: QuizOptionsPopoverComponent,
      event,
      translucent: true
    })

    await popover.present()

    const { data } = await popover.onWillDismiss()

    if (data?.action === 'delete') {
      this.delete.emit()
    } else if (data?.action === 'edit') {
      this.edit.emit()
    }
  }
}

const CARD_GRADIENTS = [
  'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
  'linear-gradient(135deg, #6d28d9 0%, #ec4899 100%)',
  'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
  'linear-gradient(135deg, #5b21b6 0%, #a855f7 100%)',
  'linear-gradient(135deg, #7c3aed 0%, #db2777 100%)'
]

@Component({
  selector: 'app-quiz',
  template: `
    @let quiz = this.quiz();

    <app-page-header [translucent]="true">
      <app-quiz-page-toolbar
        [quizForm]="quizForm"
        (delete)="deleteQuiz()"
        (edit)="editQuiz()"
      />
    </app-page-header>

    <ion-content [fullscreen]="true" class="quiz-content">
      <app-page-header collapse="condense">
        <app-quiz-page-toolbar
          [quizForm]="quizForm"
          (delete)="deleteQuiz()"
          (edit)="editQuiz()"
        />
      </app-page-header>

      <!-- Hero banner -->
      <div class="quiz-hero" [style.background]="heroGradient()">
        <div class="hero-icon">📋</div>
        <h1 class="hero-title">{{ quiz.title | titlecase }}</h1>
        @if (quiz.description) {
          <p class="hero-desc">{{ quiz.description }}</p>
        }
        <span class="hero-badge">
          <ion-icon name="help-circle-outline"></ion-icon>
          {{ quiz.questions.length }}
          question{{ quiz.questions.length !== 1 ? 's' : '' }}
        </span>
      </div>

      <!-- Questions -->
      <div class="questions-section">
        <p class="section-label">Questions</p>

        @if (!quiz.questions.length) {
          <div class="empty-questions">
            <p>No questions yet — tap Edit to add some.</p>
          </div>
        }

        @for (question of quiz.questions; track question.id; let i = $index) {
          <div class="question-card">
            <div class="question-header">
              <span class="question-num">Q{{ i + 1 }}</span>
              <p class="question-text">{{ question.text }}</p>
            </div>
            <div class="choices-grid">
              @for (choice of question.choices; track $index) {
                <div class="choice">{{ choice.text }}</div>
              }
            </div>
          </div>
        }
      </div>
    </ion-content>
  `,
  styles: [
    `
      .quiz-content {
        --background: #f8f5ff;
      }

      /* Hero */
      .quiz-hero {
        padding: 2rem 1.5rem 2.5rem;
        text-align: center;
        border-radius: 0 0 28px 28px;
        margin-bottom: 1.25rem;
      }

      .hero-icon {
        width: 68px;
        height: 68px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2rem;
        margin: 0 auto 1rem;
      }

      .hero-title {
        margin: 0 0 0.4rem;
        font-size: 1.6rem;
        font-weight: 800;
        color: #fff;
      }

      .hero-desc {
        margin: 0 0 0.9rem;
        font-size: 0.9rem;
        color: rgba(255, 255, 255, 0.8);
      }

      .hero-badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 0.8rem;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.9);
        background: rgba(255, 255, 255, 0.2);
        padding: 4px 14px;
        border-radius: 100px;
      }

      /* Questions */
      .questions-section {
        padding: 0 1rem 5rem;
      }

      .section-label {
        margin: 0 0.25rem 0.75rem;
        font-size: 0.78rem;
        font-weight: 600;
        color: #9ca3af;
        text-transform: uppercase;
        letter-spacing: 0.8px;
      }

      .question-card {
        background: #fff;
        border-radius: 16px;
        padding: 1rem 1rem 0.75rem;
        margin-bottom: 0.75rem;
        box-shadow: 0 2px 12px rgba(124, 58, 237, 0.08);
      }

      .question-header {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        margin-bottom: 0.75rem;
      }

      .question-num {
        flex-shrink: 0;
        width: 32px;
        height: 32px;
        border-radius: 10px;
        background: linear-gradient(135deg, #7c3aed, #a855f7);
        color: #fff;
        font-size: 0.72rem;
        font-weight: 800;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .question-text {
        margin: 0;
        font-size: 0.95rem;
        font-weight: 600;
        color: #1a0f2e;
        line-height: 1.4;
        flex: 1;
        padding-top: 0.3rem;
      }

      .choices-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.5rem;
      }

      .choice {
        background: #f8f5ff;
        border: 1.5px solid #e9d8fd;
        border-radius: 10px;
        padding: 0.5rem 0.6rem;
        font-size: 0.82rem;
        color: #4b5563;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .empty-questions {
        text-align: center;
        padding: 2rem;
        color: #9ca3af;
        font-size: 0.9rem;
      }
    `
  ],
  imports: [
    IonContent,
    IonIcon,
    QuizPageToolbarComponent,
    PageHeaderComponent,
    TitleCasePipe
  ]
})
export class QuizPage {
  private readonly quizService = inject(QuizService)
  private readonly modalCtrl = inject(ModalController)
  private readonly actionSheetCtrl = inject(ActionSheetController)
  private readonly router = inject(Router)

  readonly quizId = input.required<string>()

  protected readonly quizResource = rxResource({
    stream: ({ params }) => this.quizService.getById(params.id),
    params: () => ({ id: this.quizId() }),
    defaultValue: {
      id: '',
      title: '',
      description: '',
      questions: []
    }
  })

  protected readonly quizForm = form(this.quizResource.value, (schemaPath) => {
    required(schemaPath.title, { message: 'Title is required' })
  })

  quiz = computed(() => this.quizResource.value())

  readonly heroGradient = computed(() => {
    const title = this.quiz().title ?? ''
    const index = title.charCodeAt(0) % CARD_GRADIENTS.length
    return CARD_GRADIENTS[index]
  })

  constructor() {
    addIcons({ trashOutline, saveOutline, add, helpCircleOutline })
  }

  async openCreateQuestionModal() {}

  async updateQuiz(event: Event) {
    event.preventDefault()
    const quizFormValue = this.quizForm().value()
    await this.quizService.setQuiz(quizFormValue)
    this.quizForm().reset()
  }

  async editQuiz() {
    const modalRef = await this.modalCtrl.create({
      component: CreateQuizModalComponent,
      componentProps: { quiz: this.quiz },
      cssClass: 'fullscreen-modal'
    })

    modalRef.present()
    const eventDetails = await modalRef.onDidDismiss()
    if (eventDetails.data) {
      this.quizService.setQuiz(eventDetails.data)
    }
  }

  async deleteQuiz() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Are you sure?',
      buttons: [
        {
          text: 'Yes',
          role: 'confirm'
        },
        {
          text: 'No',
          role: 'cancel'
        }
      ]
    })

    actionSheet.present()

    const { role } = await actionSheet.onWillDismiss()

    if (role === 'confirm') {
      await this.quizService.deleteQuiz(this.quizId())
      this.router.navigateByUrl('/')
    }
  }
}
