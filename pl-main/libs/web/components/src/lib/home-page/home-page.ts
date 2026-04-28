import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, AuthUser } from '@app/web-data-access';
import { Observable } from 'rxjs';

@Component({
  selector: 'csa-home-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {
  currentUser$!: Observable<AuthUser | null>;
  
  // Form state
  resumeFile = signal<File | null>(null);
  jobDescription = signal<string>('');
  resumeText = signal<string>('');
  isSubmitting = signal<boolean>(false);
  showQuickStart = signal<boolean>(true);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.currentUser$ = this.authService.getCurrentUser();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth']);
  }

  onResumeFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.resumeFile.set(file);
      
      // Check file size (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        console.error('File is too large. Maximum size is 10MB.');
        this.resumeFile.set(null);
        this.resumeText.set('');
        return;
      }
      
      // Read file content
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          this.resumeText.set(e.target.result as string);
        }
      };
      reader.onerror = () => {
        console.error('Error reading file');
        this.resumeFile.set(null);
        this.resumeText.set('');
      };
      reader.readAsText(file);
    }
  }

  startAssessment(): void {
    if (this.resumeText() && this.jobDescription()) {
      this.isSubmitting.set(true);
      
      // Store data in session/service before navigation
      // This allows passing large data without URL length limits
      setTimeout(() => {
        this.router.navigate(['/assessment'], {
          state: {
            resume: this.resumeText(),
            jobDescription: this.jobDescription(),
          },
        });
      }, 100);
    }
  }

  clearForm(): void {
    this.resumeFile.set(null);
    this.jobDescription.set('');
    this.resumeText.set('');
  }
}
