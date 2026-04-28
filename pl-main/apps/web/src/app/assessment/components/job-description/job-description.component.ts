import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface JobDescriptionInput {
  jobDescription: string;
  questionCount: number;
  sourceType: 'text' | 'url';
  sourceUrl?: string;
}

/**
 * Component for job description input and question count selection
 * Allows candidates to paste the job posting and select number of interview questions
 */
@Component({
  selector: 'app-job-description',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="job-description-container">
      <div class="form-group">
        <label class="form-label">
          <h3>Job Description</h3>
          <p class="help-text">Paste the job posting or provide a link</p>
        </label>

        <div class="mode-selector">
          <label class="mode-option">
            <input
              type="radio"
              name="inputMode"
              value="text"
              [(ngModel)]="inputMode"
              [disabled]="isLoading"
            />
            <span class="mode-label">Paste Text</span>
            <span class="mode-description">Manually paste job description</span>
          </label>
          <label class="mode-option">
            <input
              type="radio"
              name="inputMode"
              value="url"
              [(ngModel)]="inputMode"
              [disabled]="isLoading"
            />
            <span class="mode-label">Provide URL</span>
            <span class="mode-description">Extract from webpage</span>
          </label>
        </div>

        <div *ngIf="inputMode === 'text'" class="input-section">
          <textarea
            id="job-description-input"
            [(ngModel)]="jobDescription"
            (input)="onJobDescriptionChange()"
            class="form-control job-textarea"
            placeholder="Paste the job description/posting here..."
            rows="10"
            [disabled]="isLoading"
          ></textarea>

          <div class="input-stats">
            <span class="char-count">{{ jobDescription.length }} characters</span>
            <span *ngIf="jobDescription.length < 50" class="warning">
              ⚠️ Minimum 50 characters recommended
            </span>
            <span *ngIf="jobDescription.length >= 50" class="success">
              ✓ Job description ready
            </span>
          </div>
        </div>

        <div *ngIf="inputMode === 'url'" class="input-section">
          <input
            type="url"
            id="job-description-url"
            [(ngModel)]="jobDescriptionUrl"
            (input)="onUrlChange()"
            class="form-control"
            placeholder="https://example.com/job-posting"
            [disabled]="isLoading"
          />

          <div class="url-info">
            <span *ngIf="!jobDescriptionUrl" class="info-text">
              Enter a URL to fetch job description
            </span>
            <span *ngIf="jobDescriptionUrl && isValidUrl()" class="success">
              ✓ Valid URL
            </span>
            <span *ngIf="jobDescriptionUrl && !isValidUrl()" class="warning">
              ⚠️ Invalid URL format
            </span>
          </div>
        </div>
      </div>

      <div class="form-group">
        <label for="question-count" class="form-label">
          <h3>Interview Questions</h3>
          <p class="help-text">How many questions would you like to answer?</p>
        </label>

        <div class="question-count-selector">
          <input
            type="range"
            id="question-count"
            [(ngModel)]="questionCount"
            min="1"
            max="20"
            class="slider"
            [disabled]="isLoading"
          />
          <div class="count-display">
            <span class="count-value">{{ questionCount }}</span>
            <span class="count-label">questions</span>
          </div>
        </div>

        <div class="question-presets">
          <span class="preset-label">Quick presets:</span>
          <button
            *ngFor="let preset of [5, 10, 15]"
            (click)="setQuestionCount(preset)"
            [class.active]="questionCount === preset"
            class="preset-btn"
            [disabled]="isLoading"
          >
            {{ preset }}
          </button>
        </div>
      </div>

      <div class="button-group">
        <button
          (click)="onBack()"
          [disabled]="isLoading"
          class="btn btn-secondary"
        >
          Back: Edit Resume
        </button>
        <button
          (click)="onSubmit()"
          [disabled]="!isValid() || isLoading"
          class="btn btn-primary"
        >
          {{ isLoading ? 'Generating Questions...' : 'Generate Interview Questions' }}
        </button>
      </div>

      <div *ngIf="error" class="alert alert-danger" role="alert">
        {{ error }}
      </div>
    </div>
  `,
  styles: [`
    .job-description-container {
      padding: 2rem;
      background: #f8f9fa;
      border-radius: 8px;
      margin-bottom: 2rem;
    }

    .form-group {
      margin-bottom: 2rem;
    }

    .form-label {
      display: block;
      margin-bottom: 1rem;
      cursor: pointer;
    }

    .form-label h3 {
      margin: 0 0 0.5rem 0;
      font-size: 1.25rem;
      color: #333;
    }

    .help-text {
      margin: 0;
      font-size: 0.875rem;
      color: #666;
    }

    .mode-selector {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
      padding: 1rem;
      background: white;
      border: 2px solid #dee2e6;
      border-radius: 4px;
    }

    .mode-option {
      display: flex;
      flex: 1;
      align-items: flex-start;
      gap: 0.75rem;
      cursor: pointer;
      padding: 0.75rem;
      border-radius: 4px;
      transition: background-color 0.3s;
    }

    .mode-option input[type="radio"] {
      margin-top: 0.25rem;
      cursor: pointer;
      flex-shrink: 0;
    }

    .mode-option:hover {
      background-color: #f8f9fa;
    }

    .mode-option input[type="radio"]:checked {
      accent-color: #007bff;
    }

    .mode-label {
      display: block;
      font-weight: 500;
      color: #333;
      margin: 0;
    }

    .mode-description {
      display: block;
      font-size: 0.875rem;
      color: #666;
      margin: 0;
    }

    .input-section {
      margin-bottom: 0;
    }

    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #dee2e6;
      border-radius: 4px;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 0.875rem;
      resize: vertical;
      transition: border-color 0.3s;
    }

    .form-control:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
    }

    .form-control:disabled {
      background-color: #e9ecef;
      cursor: not-allowed;
    }

    .input-stats {
      display: flex;
      gap: 1rem;
      margin-top: 0.5rem;
      font-size: 0.875rem;
    }

    .url-info {
      display: flex;
      gap: 1rem;
      margin-top: 0.5rem;
      font-size: 0.875rem;
    }

    .info-text {
      color: #666;
    }

    .char-count {
      color: #666;
    }

    .warning {
      color: #dc3545;
      font-weight: 500;
    }

    .success {
      color: #28a745;
      font-weight: 500;
    }

    .question-count-selector {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      padding: 1rem;
      background: white;
      border: 2px solid #dee2e6;
      border-radius: 4px;
    }

    .slider {
      flex: 1;
      height: 6px;
      cursor: pointer;
    }

    .count-display {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      min-width: 120px;
      text-align: right;
    }

    .count-value {
      font-size: 1.5rem;
      font-weight: bold;
      color: #007bff;
    }

    .count-label {
      font-size: 0.875rem;
      color: #666;
    }

    .question-presets {
      margin-top: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .preset-label {
      font-size: 0.875rem;
      color: #666;
      margin-right: 0.5rem;
    }

    .preset-btn {
      padding: 0.5rem 1rem;
      border: 2px solid #dee2e6;
      background: white;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.3s;
    }

    .preset-btn:hover:not(:disabled) {
      border-color: #007bff;
      color: #007bff;
    }

    .preset-btn.active {
      background-color: #007bff;
      color: white;
      border-color: #007bff;
    }

    .preset-btn:disabled {
      background-color: #e9ecef;
      cursor: not-allowed;
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
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.3s;
      font-weight: 500;
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
  `],
})
export class JobDescriptionComponent {
  @Input() isLoading = false;
  @Input() error: string | null = null;
  @Output() jobDescriptionSubmitted = new EventEmitter<JobDescriptionInput>();
  @Output() goBack = new EventEmitter<void>();

  inputMode: 'text' | 'url' = 'text';
  jobDescription = '';
  jobDescriptionUrl = '';
  questionCount = 5;

  isValid(): boolean {
    if (this.inputMode === 'text') {
      return this.jobDescription.length >= 50 && this.questionCount >= 1 && this.questionCount <= 20;
    } else {
      return this.isValidUrl() && this.questionCount >= 1 && this.questionCount <= 20;
    }
  }

  isValidUrl(): boolean {
    if (!this.jobDescriptionUrl) {
      return false;
    }
    try {
      new URL(this.jobDescriptionUrl);
      return true;
    } catch {
      return false;
    }
  }

  onJobDescriptionChange(): void {
    // Character count updates automatically via ngModel
  }

  onUrlChange(): void {
    // URL validation happens in isValid()
  }

  setQuestionCount(count: number): void {
    this.questionCount = count;
  }

  onSubmit(): void {
    if (this.isValid()) {
      this.jobDescriptionSubmitted.emit({
        jobDescription: this.inputMode === 'text' ? this.jobDescription : '',
        questionCount: this.questionCount,
        sourceType: this.inputMode,
        sourceUrl: this.inputMode === 'url' ? this.jobDescriptionUrl : undefined,
      });
    }
  }

  onBack(): void {
    this.goBack.emit();
  }
}
