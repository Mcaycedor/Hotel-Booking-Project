import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CandidateResponse, InterviewQuestion } from '@app/web-data-access';

/**
 * Component for displaying interview questions and collecting candidate responses
 */
@Component({
  selector: 'app-interview-questions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="questions-container">
      <div class="progress-bar">
        <div class="progress-fill" [style.width.%]="progressPercentage"></div>
      </div>
      <div class="progress-text">
        Question {{ currentQuestionIndex + 1 }} of {{ questions.length }}
      </div>

      <div class="question-card">
        <div class="question-meta">
          <span class="difficulty" [class]="'difficulty-' + (currentQuestion.difficulty || '').toLowerCase()">
            {{ currentQuestion.difficulty }}
          </span>
          <span class="category">{{ currentQuestion.category }}</span>
        </div>

        <h2 class="question-text">{{ currentQuestion.question }}</h2>

        <div *ngIf="currentQuestion.testedSkills && currentQuestion.testedSkills.length > 0" class="tested-skills">
          <h4>Skills Tested:</h4>
          <div class="skill-tags">
            <span *ngFor="let skill of currentQuestion.testedSkills" class="skill-tag">
              {{ skill }}
            </span>
          </div>
        </div>

        <div *ngIf="currentQuestion.hints && currentQuestion.hints.length > 0" class="hints">
          <details>
            <summary class="hints-summary">💡 View Hints</summary>
            <ul class="hints-list">
              <li *ngFor="let hint of currentQuestion.hints">{{ hint }}</li>
            </ul>
          </details>
        </div>

        <div class="response-input">
          <label for="response-textarea" class="response-label">Your Answer:</label>
          <textarea
            id="response-textarea"
            [(ngModel)]="currentResponse"
            (keydown.ctrl.enter)="nextQuestion()"
            class="response-textarea"
            placeholder="Type your answer here... (Ctrl+Enter to continue)"
            rows="8"
            [disabled]="isSubmitting"
          ></textarea>
          <div class="char-count">{{ currentResponse.length }} characters</div>
        </div>
      </div>

      <div class="button-group">
        <button
          (click)="previousQuestion()"
          [disabled]="currentQuestionIndex === 0 || isSubmitting"
          class="btn btn-secondary"
        >
          ← Previous
        </button>

        <button
          (click)="nextQuestion()"
          [disabled]="isSubmitting || (currentQuestionIndex === questions.length - 1 && !currentResponse.trim())"
          class="btn btn-primary"
        >
          {{ currentQuestionIndex === questions.length - 1 ? 'Submit Answers' : 'Next →' }}
        </button>
      </div>

      <div *ngIf="error" class="alert alert-danger" role="alert">
        {{ error }}
      </div>

      <div class="answer-summary">
        <h4>Answer Progress</h4>
        <div class="answer-list">
          <div
            *ngFor="let question of questions; let i = index"
            [class.answered]="responses[i]?.candidateAnswer"
            class="answer-item"
            (click)="jumpToQuestion(i)"
          >
            <span class="answer-number">{{ i + 1 }}</span>
            <span *ngIf="responses[i]?.candidateAnswer" class="answer-status">✓</span>
            <span *ngIf="!responses[i]?.candidateAnswer" class="answer-status">○</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .questions-container {
      padding: 2rem;
      background: #f8f9fa;
      border-radius: 8px;
      margin-bottom: 2rem;
    }

    .progress-bar {
      height: 8px;
      background-color: #e9ecef;
      border-radius: 4px;
      margin-bottom: 0.5rem;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #007bff, #0056b3);
      transition: width 0.3s ease;
    }

    .progress-text {
      text-align: center;
      font-size: 0.875rem;
      color: #666;
      margin-bottom: 1.5rem;
    }

    .question-card {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      margin-bottom: 2rem;
    }

    .question-meta {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
      flex-wrap: wrap;
    }

    .difficulty {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .difficulty-easy {
      background-color: #d4edda;
      color: #155724;
    }

    .difficulty-medium {
      background-color: #fff3cd;
      color: #856404;
    }

    .difficulty-hard {
      background-color: #f8d7da;
      color: #721c24;
    }

    .category {
      padding: 0.25rem 0.75rem;
      background-color: #e7f3ff;
      color: #0056b3;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .question-text {
      margin: 1rem 0;
      font-size: 1.25rem;
      color: #333;
      line-height: 1.6;
    }

    .tested-skills {
      margin: 1.5rem 0;
    }

    .tested-skills h4 {
      margin: 0 0 0.75rem 0;
      font-size: 0.875rem;
      color: #666;
      text-transform: uppercase;
    }

    .skill-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .skill-tag {
      display: inline-block;
      padding: 0.5rem 1rem;
      background-color: #e7f3ff;
      color: #0056b3;
      border-radius: 4px;
      font-size: 0.875rem;
    }

    .hints {
      margin: 1.5rem 0;
    }

    .hints-summary {
      cursor: pointer;
      color: #0056b3;
      font-weight: 500;
      padding: 0.5rem;
      user-select: none;
    }

    .hints-summary:hover {
      text-decoration: underline;
    }

    .hints-list {
      margin: 0.75rem 0 0 0;
      padding-left: 1.5rem;
      background-color: #f0f7ff;
      padding: 1rem;
      border-left: 3px solid #0056b3;
      border-radius: 4px;
    }

    .hints-list li {
      margin-bottom: 0.5rem;
      color: #333;
    }

    .response-input {
      margin-top: 2rem;
    }

    .response-label {
      display: block;
      margin-bottom: 0.75rem;
      font-weight: 600;
      color: #333;
    }

    .response-textarea {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #dee2e6;
      border-radius: 4px;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 0.875rem;
      resize: vertical;
      transition: border-color 0.3s;
    }

    .response-textarea:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
    }

    .response-textarea:disabled {
      background-color: #e9ecef;
      cursor: not-allowed;
    }

    .char-count {
      margin-top: 0.5rem;
      font-size: 0.875rem;
      color: #666;
    }

    .button-group {
      display: flex;
      gap: 1rem;
      margin-top: 2rem;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.3s;
      font-weight: 500;
      font-size: 1rem;
    }

    .btn-primary {
      background-color: #007bff;
      color: white;
      flex: 1;
    }

    .btn-primary:hover:not(:disabled) {
      background-color: #0056b3;
    }

    .btn-primary:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }

    .btn-secondary {
      background-color: #6c757d;
      color: white;
    }

    .btn-secondary:hover:not(:disabled) {
      background-color: #545b62;
    }

    .btn-secondary:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }

    .alert {
      padding: 1rem;
      border-radius: 4px;
      margin-top: 1rem;
    }

    .alert-danger {
      background-color: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }

    .answer-summary {
      margin-top: 2rem;
      padding: 1rem;
      background: white;
      border-radius: 8px;
    }

    .answer-summary h4 {
      margin: 0 0 1rem 0;
      font-size: 0.875rem;
      text-transform: uppercase;
      color: #666;
    }

    .answer-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .answer-item {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.5rem 0.75rem;
      background-color: #e9ecef;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.3s;
      font-size: 0.875rem;
      font-weight: 600;
    }

    .answer-item:hover {
      background-color: #dee2e6;
    }

    .answer-item.answered {
      background-color: #d4edda;
      color: #155724;
    }

    .answer-number {
      display: inline-block;
      width: 20px;
      text-align: center;
    }

    .answer-status {
      font-weight: bold;
    }
  `],
})
export class InterviewQuestionsComponent implements OnInit {
  @Input() questions: InterviewQuestion[] = [];
  @Input() isSubmitting = false;
  @Input() error: string | null = null;
  @Output() answersSubmitted = new EventEmitter<CandidateResponse[]>();

  currentQuestionIndex = 0;
  currentResponse = '';
  responses: CandidateResponse[] = [];

  ngOnInit(): void {
    this.initializeResponses();
  }

  get currentQuestion(): InterviewQuestion {
    return this.questions[this.currentQuestionIndex] || {};
  }

  get progressPercentage(): number {
    if (this.questions.length === 0) return 0;
    return ((this.currentQuestionIndex + 1) / this.questions.length) * 100;
  }

  private initializeResponses(): void {
    this.responses = this.questions.map((q, index) => ({
      id: `response-${index}`,
      questionId: q.id,
      candidateAnswer: '',
      submittedAt: new Date(),
    }));
  }

  jumpToQuestion(index: number): void {
    if (index >= 0 && index < this.questions.length) {
      this.saveCurrentResponse();
      this.currentQuestionIndex = index;
      this.currentResponse = this.responses[index]?.candidateAnswer || '';
    }
  }

  previousQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.saveCurrentResponse();
      this.currentQuestionIndex--;
      this.currentResponse = this.responses[this.currentQuestionIndex]?.candidateAnswer || '';
    }
  }

  nextQuestion(): void {
    this.saveCurrentResponse();

    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
      this.currentResponse = this.responses[this.currentQuestionIndex]?.candidateAnswer || '';
    } else {
      // Submit all answers
      this.answersSubmitted.emit(this.responses);
    }
  }

  private saveCurrentResponse(): void {
    if (this.currentQuestionIndex >= 0 && this.currentQuestionIndex < this.responses.length) {
      this.responses[this.currentQuestionIndex].candidateAnswer = this.currentResponse;
    }
  }
}
