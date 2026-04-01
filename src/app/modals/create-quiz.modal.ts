import { Component, inject, input, linkedSignal, signal } from '@angular/core'
import {
  applyEach,
  Field,
  form,
  required,
  SchemaPathTree
} from '@angular/forms/signals'
import { StorageService } from '../services/storage.service'
import {
  IonSpinner,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonContent,
  IonItem,
  IonInput,
  IonTextarea,
  ModalController,
  IonRadio,
  IonRadioGroup,
  IonIcon
} from '@ionic/angular/standalone'
import { Quiz } from '../models/quiz'
import { Question } from '../models/question'
import { addIcons } from 'ionicons'
import { imageOutline, removeOutline } from 'ionicons/icons'
import { QuizService } from '../services/quiz.service'

function QuestionSchema(question: SchemaPathTree<Question>) {
  required(question.text, { message: 'Question text is required' })
}

@Component({
  selector: 'app-create-quiz-modal',
  template: `
    <ion-header>
      <ion-toolbar class="modal-toolbar">
        <ion-buttons slot="start">
          <ion-button class="cancel-btn" (click)="cancel()">Cancel</ion-button>
        </ion-buttons>
        <ion-buttons slot="end">
          <ion-button
            class="confirm-btn"
            type="submit"
            form="createQuizForm"
            [disabled]="quizForm().invalid()"
          >
            Confirm
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="modal-content">
      <form id="createQuizForm" (submit)="confirm($event)">
        <!-- Quiz meta -->
        <div class="quiz-meta">
          <ion-input
            class="title-input"
            [field]="quizForm.title"
            placeholder="Quiz title…"
          ></ion-input>
          <ion-textarea
            class="desc-input"
            [field]="quizForm.description"
            placeholder="Description (optional)"
            [autoGrow]="true"
          ></ion-textarea>
        </div>

        <!-- Questions -->
        <div class="questions-list">
          @for (question of quizForm.questions; track $index; let qi = $index) {
            <div class="question-card">
              <!-- Question header row -->
              <div class="q-top">
                <div class="q-badge">Q{{ qi + 1 }}</div>
                <ion-input
                  class="q-text-input"
                  [field]="question.text"
                  placeholder="Type your question here…"
                ></ion-input>
                <button
                  class="q-remove-btn"
                  type="button"
                  (click)="removeQuestion(question().value().id)"
                >
                  ✕
                </button>
              </div>

              <!-- Image upload -->
              <div class="q-image-area">
                @if (question().value().imageUrl) {
                  <div class="img-preview-wrap">
                    <img
                      [src]="question().value().imageUrl"
                      class="img-preview"
                      alt="Question image"
                    />
                    <button
                      class="img-remove-btn"
                      type="button"
                      (click)="removeQuestionImage(question().value().id)"
                    >
                      ✕
                    </button>
                  </div>
                }
                @if (uploadingMap()[question().value().id]) {
                  <div class="uploading-row">
                    <ion-spinner
                      name="crescent"
                      style="width:14px;height:14px"
                    ></ion-spinner>
                    Uploading…
                  </div>
                } @else {
                  <label class="img-upload-label">
                    <ion-icon name="image-outline"></ion-icon>
                    {{
                      question().value().imageUrl ? 'Change image' : 'Add image'
                    }}
                    <input
                      type="file"
                      accept="image/*"
                      style="display:none"
                      (change)="onImageSelected(question().value().id, $event)"
                    />
                  </label>
                }
              </div>

              <!-- Divider -->
              <div class="q-divider"></div>

              <!-- Choices — ion-radio MUST be inside ion-item for radio-group to work -->
              <ion-radio-group
                [value]="question.correctChoiceIndex().value()"
                (ionChange)="
                  onCorrectChoiceChange(question().value().id, $event)
                "
              >
                <div class="choices-list">
                  @for (
                    choice of question.choices;
                    track $index;
                    let ci = $index;
                    let first = $first
                  ) {
                    <ion-item
                      lines="none"
                      class="choice-item"
                      [class.is-correct]="
                        question.correctChoiceIndex().value() === ci
                      "
                    >
                      <div
                        class="choice-letter"
                        [class]="'letter-' + (ci % 4)"
                        slot="start"
                      >
                        {{ choiceLetters[ci] }}
                      </div>
                      <ion-input
                        class="choice-input"
                        [field]="choice.text"
                        placeholder="Choice {{ ci + 1 }}"
                      ></ion-input>
                      <ion-radio
                        slot="end"
                        [value]="ci"
                        class="choice-radio"
                      ></ion-radio>
                      @if (!first) {
                        <button
                          class="choice-del-btn"
                          type="button"
                          slot="end"
                          (click)="removeChoice(question().value().id, ci)"
                        >
                          ✕
                        </button>
                      } @else {
                        <span slot="end" style="width:20px"></span>
                      }
                    </ion-item>
                  }
                </div>
              </ion-radio-group>

              <button
                class="add-choice-btn"
                type="button"
                (click)="addChoice(question().value().id)"
              >
                + Add choice
              </button>
            </div>
          }
        </div>

        <div class="add-q-wrap">
          <ion-button
            expand="block"
            class="add-q-btn"
            type="button"
            (click)="addQuestion()"
          >
            + Add Question
          </ion-button>
        </div>
      </form>
    </ion-content>
  `,
  styles: [
    `
      .modal-toolbar {
        --background: #ffffff;
        --border-color: rgba(124, 58, 237, 0.1);
      }

      .cancel-btn {
        --color: #9ca3af;
        font-weight: 500;
      }

      .confirm-btn {
        --background: linear-gradient(135deg, #7c3aed, #a855f7);
        --border-radius: 10px;
        --color: #ffffff;
        font-weight: 700;
        font-size: 0.9rem;
      }

      .modal-content {
        --background: #f8f5ff;
      }

      .quiz-meta {
        background: #ffffff;
        margin: 1rem;
        border-radius: 18px;
        padding: 1rem 1.25rem;
        box-shadow: 0 2px 12px rgba(124, 58, 237, 0.08);
      }

      .title-input {
        --color: #1a0f2e;
        --placeholder-color: #c4b5fd;
        font-size: 1.2rem;
        font-weight: 800;
        margin-bottom: 0.5rem;
      }

      .desc-input {
        --color: #4b5563;
        --placeholder-color: #d1d5db;
        font-size: 0.9rem;
      }

      .questions-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding: 0 1rem;
      }

      .question-card {
        background: #ffffff;
        border-radius: 20px;
        padding: 1.25rem;
        box-shadow: 0 2px 16px rgba(124, 58, 237, 0.1);
        border-left: 4px solid #7c3aed;
      }

      .q-top {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        margin-bottom: 1rem;
      }

      .q-badge {
        flex-shrink: 0;
        width: 36px;
        height: 36px;
        border-radius: 10px;
        background: linear-gradient(135deg, #7c3aed, #a855f7);
        color: white;
        font-size: 0.75rem;
        font-weight: 800;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-top: 4px;
      }

      .q-text-input {
        flex: 1;
        --color: #1a0f2e;
        --placeholder-color: #c4b5fd;
        font-size: 1rem;
        font-weight: 600;
      }

      .q-remove-btn {
        flex-shrink: 0;
        width: 28px;
        height: 28px;
        border-radius: 8px;
        border: none;
        background: #fee2e2;
        color: #ef4444;
        font-size: 0.8rem;
        font-weight: 700;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-top: 4px;
      }

      .q-image-area {
        margin-bottom: 1rem;
      }

      .img-preview-wrap {
        position: relative;
        margin-bottom: 0.5rem;
      }

      .img-preview {
        width: 100%;
        max-height: 160px;
        object-fit: cover;
        border-radius: 12px;
      }

      .img-remove-btn {
        position: absolute;
        top: 6px;
        right: 6px;
        width: 26px;
        height: 26px;
        border-radius: 50%;
        border: none;
        background: rgba(0, 0, 0, 0.55);
        color: white;
        font-size: 0.75rem;
        cursor: pointer;
      }

      .uploading-row {
        display: flex;
        align-items: center;
        gap: 6px;
        color: #9ca3af;
        font-size: 0.82rem;
      }

      .img-upload-label {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        color: #7c3aed;
        font-size: 0.85rem;
        font-weight: 600;
        cursor: pointer;
      }

      .q-divider {
        height: 1px;
        background: #f3eeff;
        margin-bottom: 0.75rem;
      }

      .choices-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin-bottom: 0.75rem;
      }

      /* ion-item wrapper for choices */
      .choice-item {
        --background: #fafafa;
        --inner-padding-end: 4px;
        --padding-start: 4px;
        --min-height: 48px;
        border: 1.5px solid #f3f4f6;
        border-radius: 12px;
        transition:
          border-color 0.2s,
          background 0.2s;
      }

      .choice-item.is-correct {
        --background: #f0fdf4;
        border-color: #86efac;
      }

      .choice-letter {
        width: 28px;
        height: 28px;
        border-radius: 8px;
        font-size: 0.78rem;
        font-weight: 800;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        margin-right: 4px;
      }

      .letter-0 {
        background: #7c3aed;
      }
      .letter-1 {
        background: #a855f7;
      }
      .letter-2 {
        background: #ec4899;
      }
      .letter-3 {
        background: #f59e0b;
      }

      .choice-input {
        --color: #1a0f2e;
        --placeholder-color: #d1d5db;
        font-size: 0.9rem;
      }

      .choice-radio {
        --color: #d1d5db;
        --color-checked: #10b981;
      }

      .choice-del-btn {
        width: 22px;
        height: 22px;
        border-radius: 6px;
        border: none;
        background: #fee2e2;
        color: #ef4444;
        font-size: 0.7rem;
        font-weight: 700;
        cursor: pointer;
        margin-left: 4px;
      }

      .add-choice-btn {
        width: 100%;
        padding: 0.6rem;
        border: 1.5px dashed #c4b5fd;
        border-radius: 12px;
        background: transparent;
        color: #7c3aed;
        font-size: 0.85rem;
        font-weight: 700;
        cursor: pointer;
      }

      .add-q-wrap {
        padding: 1rem 1rem 2.5rem;
      }

      .add-q-btn {
        --background: linear-gradient(135deg, #7c3aed, #a855f7);
        --border-radius: 14px;
        --box-shadow: 0 6px 20px rgba(124, 58, 237, 0.3);
        height: 52px;
        font-weight: 700;
      }
    `
  ],
  imports: [
    IonHeader,
    IonToolbar,
    IonButtons,
    IonButton,
    IonContent,
    IonItem,
    IonInput,
    IonTextarea,
    Field,
    IonRadio,
    IonRadioGroup,
    IonIcon,
    IonSpinner
  ]
})
export class CreateQuizModalComponent {
  private readonly modalCtrl = inject(ModalController)
  private readonly quizService = inject(QuizService)
  private readonly storageService = inject(StorageService)

  readonly choiceLetters = ['A', 'B', 'C', 'D', 'E', 'F']
  readonly uploadingMap = signal<Record<string, boolean>>({})

  constructor() {
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
      questions: q.questions.map((question) =>
        question.id === questionId
          ? { ...question, choices: [...question.choices, { text: '' }] }
          : question
      )
    }))
    this.quizForm().markAsDirty()
  }

  removeChoice(questionId: string, choiceIndex: number) {
    this._quiz.update((q) => ({
      ...q,
      questions: q.questions.map((question) => {
        if (question.id !== questionId) return question
        return {
          ...question,
          choices: question.choices.filter((_, i) => i !== choiceIndex),
          correctChoiceIndex:
            question.correctChoiceIndex === choiceIndex
              ? 0
              : question.correctChoiceIndex
        }
      })
    }))
    this.quizForm().markAsDirty()
  }

  onCorrectChoiceChange(questionId: string, event: CustomEvent) {
    this._quiz.update((q) => ({
      ...q,
      questions: q.questions.map((question) =>
        question.id === questionId
          ? { ...question, correctChoiceIndex: event.detail.value }
          : question
      )
    }))
    this.quizForm().markAsDirty()
  }

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
      alert(err.message)
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

  cancel() {
    this.modalCtrl.dismiss()
  }

  confirm(event: Event) {
    event.preventDefault()
    if (this.quizForm().invalid()) return
    const value = this.quizForm().value()
    // Filter out empty choices before saving
    const cleaned = {
      ...value,
      questions: value.questions.map((q: any) => ({
        ...q,
        choices: q.choices.filter((c: any) => c.text?.trim())
      }))
    }
    this.modalCtrl.dismiss(cleaned)
  }
}
