import { ComponentFixture, TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'
import { of } from 'rxjs'

import { QuizPage } from './quiz.page'
import { QuizService } from '../services/quiz.service'
import { AuthService } from '../services/auth.service'
import {
  ModalController,
  ActionSheetController,
  PopoverController
} from '@ionic/angular/standalone'

const mockQuizService = {
  getById: () => of({ id: '1', title: 'Test', description: '', questions: [] }),
  setQuiz: jasmine.createSpy('setQuiz'),
  deleteQuiz: jasmine.createSpy('deleteQuiz')
}

const mockAuthService = {
  getConnectedUser: () => of(null),
  logout: jasmine.createSpy('logout')
}

describe('QuizPage', () => {
  let component: QuizPage
  let fixture: ComponentFixture<QuizPage>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuizPage],
      providers: [
        provideRouter([]),
        { provide: QuizService, useValue: mockQuizService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: ModalController, useValue: { create: jasmine.createSpy() } },
        {
          provide: ActionSheetController,
          useValue: { create: jasmine.createSpy() }
        },
        {
          provide: PopoverController,
          useValue: { create: jasmine.createSpy() }
        }
      ]
    }).compileComponents()

    fixture = TestBed.createComponent(QuizPage)
    fixture.componentRef.setInput('quizId', 'test-id')
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
