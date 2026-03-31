import { Component, inject, input, linkedSignal, signal } from '@angular/core'
import {
  applyEach,
  Field,
  form,
  required,
  SchemaPathTree,
  validate
} from '@angular/forms/signals'
import { StorageService } from '../services/storage.service'
import { IonSpinner } from '@ionic/angular/standalone'
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonItem,
  IonInput,
  IonList,
  IonTextarea,
  ModalController,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonRadio,
  IonRadioGroup,
  IonLabel,
  IonIcon
} from '@ionic/angular/standalone'
import { Quiz } from '../models/quiz'
import { Choice } from '../models/choice'
import { Question } from '../models/question'
import { addIcons } from 'ionicons'
import { imageOutline, removeOutline } from 'ionicons/icons'
import { QuizService } from '../services/quiz.service'

function ChoiceSchema(choice: SchemaPathTree<Choice>) {
  required(choice.text, { message: 'Choice text is required' })
}

function QuestionSchema(question: SchemaPathTree<Question>) {
  required(question.text, { message: 'Question text is required' })
  validate(question.correctChoiceIndex, ({ value, valueOf }) => {
    if (!valueOf(question.choices)[value()]) {
      return {
        kind: 'no-correct-choice',
        message: 'At least one choice must be marked as correct'
      }
    }
    return null
  })
  applyEach(question.choices, ChoiceSchema)
}

@Component({
  selector: 'app-create-quiz-modal',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button
            data-testid="cancel-create-quiz-button"
            color="medium"
            (click)="cancel()"
          >
            Cancel
          </ion-button>
        </ion-buttons>
        <ion-title>
          <ion-input
            aria-label="Enter the quiz title"
            [field]="quizForm.title"
            placeholder="Guess the capital city"
          ></ion-input>
        </ion-title>
        <ion-buttons slot="end">
          <ion-button
            data-testid="confirm-create-quiz-button"
            type="submit"
            form="createQuizForm"
            [strong]="true"
            [disabled]="quizForm().invalid()"
          >
            Confirm
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding" [fullscreen]="true">
      <form id="createQuizForm" (submit)="confirm($event)">
        <ion-list>
          <ion-item>
            <ion-textarea
              labelPlacement="stacked"
              label="Enter the quiz description"
              [field]="quizForm.description"
              placeholder="Guess the capital city of various countries around the world."
            ></ion-textarea>
          </ion-item>
        </ion-list>
        <ion-grid>
          <ion-row>
            @for (question of quizForm.questions; track $index) {
              <ion-col size="12">
                <ion-card>
                  <ion-button
                    fill="clear"
                    color="medium"
                    class="ion-float-end"
                    (click)="removeQuestion(question().value().id)"
                  >
                    <ion-icon name="remove-outline"></ion-icon>
                  </ion-button>
                  <ion-card-header>
                    <ion-card-title>
                      <ion-input
                        aria-label="Enter the question text"
                        [field]="question.text"
                        placeholder="Question"
                      ></ion-input>
                    </ion-card-title>
                  </ion-card-header>
                  <ion-card-content>
                    <!-- Question image upload -->
                    <div style="margin-bottom:1rem">
                      @if (question().value().imageUrl) {
                        <div style="position:relative;margin-bottom:0.5rem">
                          <img
                            [src]="question().value().imageUrl"
                            alt="Question image"
                            style="width:100%;max-height:180px;object-fit:cover;border-radius:10px;border:1px solid var(--ion-color-light-shade)"
                          />
                          <ion-button
                            fill="clear"
                            color="danger"
                            size="small"
                            style="position:absolute;top:4px;right:4px;--background:rgba(0,0,0,0.5);border-radius:50%"
                            (click)="removeQuestionImage(question().value().id)"
                          >
                            <ion-icon name="remove-outline"></ion-icon>
                          </ion-button>
                        </div>
                      }

                      @if (uploadingMap()[question().value().id]) {
                        <div
                          style="display:flex;align-items:center;gap:8px;color:var(--ion-color-medium);font-size:0.85rem;margin:8px 0"
                        >
                          <ion-spinner
                            name="crescent"
                            style="width:16px;height:16px"
                          ></ion-spinner>
                          Uploading image...
                        </div>
                      } @else {
                        <label
                          style="display:flex;align-items:center;gap:8px;cursor:pointer;color:var(--ion-color-primary);font-size:0.9rem;padding:8px 0"
                        >
                          <ion-icon name="image-outline"></ion-icon>
                          {{
                            question().value().imageUrl
                              ? 'Change image'
                              : 'Add image (max 2MB)'
                          }}
                          <input
                            type="file"
                            accept="image/*"
                            style="display:none"
                            (change)="
                              onImageSelected(question().value().id, $event)
                            "
                          />
                        </label>
                      }
                    </div>
                    <ion-radio-group
                      [value]="question.correctChoiceIndex().value()"
                      (ionChange)="
                        onCorrectChoiceChange(question().value().id, $event)
                      "
                    >
                      <ion-list lines="none">
                        <ion-item>
                          <ion-label>Choices</ion-label>
                          <ion-label slot="end">Correct</ion-label>
                        </ion-item>
                        @for (
                          choice of question.choices;
                          track $index;
                          let first = $first;
                          let idx = $index
                        ) {
                          <ion-item>
                            <ion-input
                              aria-label="Enter the choice text"
                              [field]="choice.text"
                              placeholder="Choice"
                            ></ion-input>
                            <ion-radio slot="end" [value]="idx"></ion-radio>
                            @if (!first) {
                              <ion-button
                                fill="clear"
                                slot="end"
                                color="medium"
                                (click)="
                                  removeChoice(question().value().id, idx)
                                "
                              >
                                <ion-icon name="remove-outline"></ion-icon>
                              </ion-button>
                            } @else {
                              <span slot="end" style="width: 2rem;"></span>
                            }
                          </ion-item>
                        }
                      </ion-list>
                    </ion-radio-group>
                    <ion-button
                      (click)="addChoice(question().value().id)"
                      expand="full"
                      >Add choice</ion-button
                    >
                  </ion-card-content>
                </ion-card>
              </ion-col>
            }
          </ion-row>
        </ion-grid>
        <ion-button (click)="addQuestion()" expand="full">
          Add question
        </ion-button>
      </form>
    </ion-content>
  `,

  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonItem,
    IonInput,
    Field,
    IonList,
    IonTextarea,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonRadio,
    IonRadioGroup,
    IonLabel,
    IonIcon,
    IonSpinner
  ]
})
export class CreateQuizModalComponent {
  private readonly modalCtrl = inject(ModalController)
  private readonly quizService = inject(QuizService)

  constructor() {
    addIcons({ removeOutline })
    addIcons({ removeOutline, imageOutline })
  }

  quiz = input<Quiz>()

  _quiz = linkedSignal(() => this.quiz() ?? this.quizService.generateQuiz())

  quizForm = form(this._quiz, (schemaPath) => {
    required(schemaPath.title, { message: 'Title is required' })
    applyEach(schemaPath.questions, QuestionSchema)
  })

  addQuestion() {
    const newQuestionId = this.quizService.generateQuestionId(this._quiz().id)
    const newQuestion: Question = {
      id: newQuestionId,
      text: '',
      choices: [{ text: '' }],
      correctChoiceIndex: 0
    }
    this._quiz.update((q) => ({
      ...q,
      questions: [...q.questions, newQuestion]
    }))
    this.quizForm().markAsDirty()
  }

  removeQuestion(questionId: string) {
    this._quiz.update((q) => ({
      ...q,
      questions: q.questions.filter((question) => question.id !== questionId)
    }))
    this.quizForm().markAsDirty()
  }

  addChoice(questionId: string) {
    this._quiz.update((q) => ({
      ...q,
      questions: q.questions.map((question) => {
        if (question.id === questionId) {
          return {
            ...question,
            choices: [...question.choices, { text: '' }]
          }
        }
        return question
      })
    }))
    this.quizForm().markAsDirty()
  }

  removeChoice(questionId: string, choiceIndex: number) {
    this._quiz.update((q) => ({
      ...q,
      questions: q.questions.map((question) => {
        if (question.id === questionId) {
          const updatedChoices = question.choices.filter(
            (_, i) => i !== choiceIndex
          )
          return {
            ...question,
            choices: updatedChoices,
            correctChoiceIndex:
              question.correctChoiceIndex === choiceIndex
                ? 0
                : question.correctChoiceIndex
          }
        }
        return question
      })
    }))
    this.quizForm().markAsDirty()
  }

  cancel() {
    this.modalCtrl.dismiss()
  }

  confirm(event: Event) {
    event.preventDefault()
    if (this.quizForm().invalid()) {
      return
    }
    const quizFormValue = this.quizForm().value()

    this.modalCtrl.dismiss(quizFormValue)
  }
  onCorrectChoiceChange(questionId: string, event: CustomEvent) {
    this._quiz.update((q) => ({
      ...q,
      questions: q.questions.map((question) => {
        if (question.id === questionId) {
          return {
            ...question,
            correctChoiceIndex: event.detail.value
          }
        }
        return question
      })
    }))
    this.quizForm().markAsDirty()
  }

  private readonly storageService = inject(StorageService)

  // track upload state per question id
  readonly uploadingMap = signal<Record<string, boolean>>({})

  async onImageSelected(questionId: string, event: Event) {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    if (!file) return

    this.uploadingMap.update((m) => ({ ...m, [questionId]: true }))
    try {
      const url = await this.storageService.uploadQuestionImage(
        this._quiz().id,
        questionId,
        file
      )
      this._quiz.update((q) => ({
        ...q,
        questions: q.questions.map((question) =>
          question.id === questionId ? { ...question, imageUrl: url } : question
        )
      }))
      this.quizForm().markAsDirty()
    } catch (err: any) {
      alert(err.message) // replace with a toast if you prefer
    } finally {
      this.uploadingMap.update((m) => ({ ...m, [questionId]: false }))
    }
  }

  removeQuestionImage(questionId: string) {
    this._quiz.update((q) => ({
      ...q,
      questions: q.questions.map((question) =>
        question.id === questionId ? { ...question, imageUrl: null } : question
      )
    }))
    this.quizForm().markAsDirty()
  }
}
