import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

/**
 * Component for resume input with validation and preview
 * Allows candidates to paste or upload their resume text
 */
@Component({
  selector: 'app-resume-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="resume-input-container">
      <div class="form-group">
        <label for="resume-input" class="form-label">
          <h3>Candidate Resume</h3>
          <p class="help-text">Paste your complete resume text below</p>
        </label>
        
        <textarea
          id="resume-input"
          [(ngModel)]="resumeText"
          (input)="onResumeChange()"
          class="form-control resume-textarea"
          placeholder="Paste your resume here (minimum 50 characters)..."
          rows="12"
          [disabled]="isLoading"
        ></textarea>

        <div class="input-stats">
          <span class="char-count">{{ resumeText.length }} characters</span>
          <span *ngIf="resumeText.length < 50" class="warning">
            ⚠️ Minimum 50 characters required
          </span>
          <span *ngIf="resumeText.length >= 50" class="success">
            ✓ Ready to analyze
          </span>
        </div>
      </div>

      <div class="button-group">
        <button
          (click)="onSubmit()"
          [disabled]="!isValid() || isLoading"
          class="btn btn-primary"
        >
          {{ isLoading ? 'Analyzing...' : 'Next: Job Description' }}
        </button>
        <button
          (click)="onClear()"
          [disabled]="isLoading"
          class="btn btn-secondary"
        >
          Clear
        </button>
      </div>

      <div *ngIf="error" class="alert alert-danger" role="alert">
        {{ error }}
      </div>
    </div>
  `,
  styles: [`
    .resume-input-container {
      padding: 2rem;
      background: #f8f9fa;
      border-radius: 8px;
      margin-bottom: 2rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
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

    .button-group {
      display: flex;
      gap: 1rem;
      margin-top: 1.5rem;
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
export class ResumeInputComponent {
  @Input() isLoading = false;
  @Input() error: string | null = null;
  @Output() resumeSubmitted = new EventEmitter<string>();

  resumeText = '';

  isValid(): boolean {
    return this.resumeText.length >= 50;
  }

  onResumeChange(): void {
    // Character count updates automatically via ngModel
  }

  onSubmit(): void {
    if (this.isValid()) {
      this.resumeSubmitted.emit(this.resumeText);
    }
  }

  onClear(): void {
    this.resumeText = '';
  }
}
