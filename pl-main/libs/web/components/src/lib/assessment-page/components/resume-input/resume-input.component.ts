import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, NgZone, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { extractTextFromFile, getFileTypeLabel } from '@app/web-data-access';

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
      <div class="header-section">
        <div class="form-group">
          <label for="resume-input" class="form-label">
            <h3>Candidate Resume</h3>
            <p class="help-text">Paste your complete resume text below</p>
          </label>
        </div>
        
        <div class="upload-section">
          <input
            #fileInput
            type="file"
            accept=".docx,.txt"
            (change)="onFileSelected($event)"
            class="file-input"
            [disabled]="isLoading"
          />
          <button
            (click)="fileInput.click()"
            [disabled]="isLoading"
            class="btn btn-upload"
            title="Upload resume (Word or Text file)"
          >
            📤 Upload Resume
          </button>
          <span *ngIf="uploadStatus" class="upload-status" [class.uploading]="isUploading" [class.success]="uploadSuccess" [class.error]="uploadError">
            {{ uploadStatus }}
          </span>
          <div *ngIf="isUploading" class="progress-container">
            <div class="progress-bar" [style.width.%]="uploadProgress"></div>
            <span class="progress-text">{{ uploadProgress }}%</span>
          </div>
        </div>
      </div>
        
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

    .header-section {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 2rem;
      margin-bottom: 1.5rem;
    }

    .form-group {
      flex: 1;
      margin-bottom: 0;
    }

    .upload-section {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.5rem;
    }

    .file-input {
      display: none;
    }

    .btn-upload {
      background-color: #ff6b6b;
      color: white;
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 4px;
      font-size: 0.95rem;
      cursor: pointer;
      transition: all 0.3s;
      font-weight: 500;
      white-space: nowrap;
    }

    .btn-upload:hover:not(:disabled) {
      background-color: #ee5a52;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(255, 107, 107, 0.3);
    }

    .btn-upload:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }

    .upload-status {
      font-size: 0.8rem;
      min-height: 1.2rem;
      display: flex;
      align-items: center;
    }

    .upload-status.uploading {
      color: #007bff;
      font-weight: 500;
      animation: pulse 1.5s ease-in-out infinite;
    }

    .upload-status.success {
      color: #28a745;
      font-weight: 500;
    }

    .upload-status.error {
      color: #dc3545;
      font-weight: 500;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    .progress-container {
      width: 180px;
      height: 6px;
      background-color: #e9ecef;
      border-radius: 3px;
      overflow: hidden;
      position: relative;
      margin-top: 0.3rem;
    }

    .progress-bar {
      height: 100%;
      background: linear-gradient(90deg, #007bff, #0056b3);
      transition: width 0.3s ease;
      border-radius: 3px;
    }

    .progress-text {
      position: absolute;
      right: 2px;
      top: -18px;
      font-size: 0.7rem;
      color: #007bff;
      font-weight: 600;
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
  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;

  resumeText = '';
  isUploading = false;
  uploadStatus = '';
  uploadSuccess = false;
  uploadError = false;
  uploadProgress = 0;

  constructor(private ngZone: NgZone, private cdr: ChangeDetectorRef) {}

  isValid(): boolean {
    return this.resumeText.length >= 50;
  }

  onResumeChange(): void {
    // Character count updates automatically via ngModel
    // Clear success messages if user edits text
    if (this.uploadStatus && this.uploadSuccess) {
      this.uploadStatus = '';
      this.uploadSuccess = false;
    }
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    console.log('File selected:', file.name, 'Size:', file.size);

    this.ngZone.run(() => {
      this.isUploading = true;
      this.uploadProgress = 0;
      this.uploadStatus = `📂 Processing ${getFileTypeLabel(file)}...`;
      this.uploadSuccess = false;
      this.uploadError = false;
    });

    try {
      console.log('Starting extraction...');
      const extractedText = await extractTextFromFile(file, (progress: number) => {
        console.log('Progress:', progress);
        this.ngZone.run(() => {
          this.uploadProgress = progress;
        });
      });
      
      console.log('Extraction complete. Text length:', extractedText?.length);

      if (!extractedText || extractedText.trim().length === 0) {
        throw new Error('No text could be extracted from the file');
      }

      this.ngZone.run(() => {
        this.resumeText = extractedText;
        this.uploadStatus = `✓ ${getFileTypeLabel(file)} loaded successfully (${extractedText.length} characters)`;
        this.uploadSuccess = true;
        this.cdr.detectChanges();
        console.log('Upload success');
      });
      
      // Clear status after 3 seconds
      setTimeout(() => {
        if (this.uploadSuccess && !this.uploadError) {
          this.ngZone.run(() => {
            this.uploadStatus = '';
          });
        }
      }, 3000);
    } catch (error) {
      console.error('Upload error:', error);
      this.ngZone.run(() => {
        this.uploadStatus = `✗ Error: ${error instanceof Error ? error.message : 'Failed to load file'}`;
        this.uploadError = true;
        this.uploadSuccess = false;
      });
    } finally {
      this.ngZone.run(() => {
        this.isUploading = false;
        this.uploadProgress = 0;
      });
      // Reset file input
      if (this.fileInput) {
        this.fileInput.nativeElement.value = '';
      }
    }
  }

  onSubmit(): void {
    if (this.isValid()) {
      this.resumeSubmitted.emit(this.resumeText);
    }
  }

  onClear(): void {
    this.resumeText = '';
    this.uploadStatus = '';
    this.uploadSuccess = false;
    this.uploadError = false;
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }
}
