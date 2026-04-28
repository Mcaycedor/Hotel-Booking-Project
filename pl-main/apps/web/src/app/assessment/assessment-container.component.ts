import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import {
    AssessmentService,
    CandidateResponse,
    InterviewQuestion,
    MatchReport,
} from '@gen/web-services';
import { InterviewQuestionsComponent } from './components/interview-questions/interview-questions.component';
import { JobDescriptionComponent } from './components/job-description/job-description.component';
import { MatchReportComponent } from './components/match-report/match-report.component';
import { ResumeInputComponent } from './components/resume-input/resume-input.component';

type Step = 'resume' | 'jobDescription' | 'questions' | 'results';

/**
 * Main assessment container component
 * Orchestrates the multi-step assessment workflow
 */
@Component({
  selector: 'app-assessment-container',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    ResumeInputComponent,
    JobDescriptionComponent,
    InterviewQuestionsComponent,
    MatchReportComponent,
  ],
  template: `
    <div class="assessment-page">
      <div class="assessment-header">
        <h1>Candidate Assessment & Interview Platform</h1>
        <p class="subtitle">AI-powered interview question generation and job match analysis</p>
      </div>

      <div class="assessment-content">
        <!-- Step 1: Resume Input -->
        <app-resume-input
          *ngIf="currentStep === 'resume'"
          [isLoading]="isLoading"
          [error]="error"
          (resumeSubmitted)="onResumeSubmitted($event)"
        ></app-resume-input>

        <!-- Step 2: Job Description -->
        <app-job-description
          *ngIf="currentStep === 'jobDescription'"
          [isLoading]="isLoading"
          [error]="error"
          (jobDescriptionSubmitted)="onJobDescriptionSubmitted($event)"
          (goBack)="goBack()"
        ></app-job-description>

        <!-- Step 3: Interview Questions -->
        <app-interview-questions
          *ngIf="currentStep === 'questions'"
          [questions]="interviewQuestions"
          [isSubmitting]="isLoading"
          [error]="error"
          (answersSubmitted)="onAnswersSubmitted($event)"
        ></app-interview-questions>

        <!-- Step 4: Results -->
        <app-match-report
          *ngIf="currentStep === 'results'"
          [report]="matchReport!"
        ></app-match-report>
      </div>

      <!-- Global Error Alert -->
      <div *ngIf="globalError" class="global-alert alert-danger" role="alert">
        <h4>{{ globalError.title }}</h4>
        <p>{{ globalError.message }}</p>
        <button (click)="dismissError()" class="dismiss-btn">Dismiss</button>
      </div>

      <!-- Loading Indicator -->
      <div *ngIf="isLoading" class="loading-overlay">
        <div class="spinner">
          <div class="spinner-border"></div>
          <p>{{ loadingMessage }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .assessment-page {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 2rem;
    }

    .assessment-header {
      text-align: center;
      color: white;
      margin-bottom: 3rem;
      animation: slideDown 0.6s ease;
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .assessment-header h1 {
      margin: 0 0 0.75rem 0;
      font-size: 2.5rem;
      font-weight: bold;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .subtitle {
      margin: 0;
      font-size: 1.125rem;
      opacity: 0.95;
    }

    .assessment-content {
      max-width: 900px;
      margin: 0 auto;
      animation: fadeIn 0.6s ease 0.2s both;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    .global-alert {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      max-width: 400px;
      z-index: 1000;
      animation: slideInRight 0.3s ease;
    }

    @keyframes slideInRight {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .alert-danger {
      background-color: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }

    .global-alert h4 {
      margin: 0 0 0.5rem 0;
      font-size: 1rem;
    }

    .global-alert p {
      margin: 0 0 1rem 0;
      font-size: 0.875rem;
    }

    .dismiss-btn {
      padding: 0.5rem 1rem;
      background-color: #721c24;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.875rem;
      font-weight: 500;
      width: 100%;
    }

    .dismiss-btn:hover {
      background-color: #5a131b;
    }

    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 999;
    }

    .spinner {
      text-align: center;
      color: white;
    }

    .spinner-border {
      width: 50px;
      height: 50px;
      border: 4px solid rgba(255, 255, 255, 0.3);
      border-top: 4px solid white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .spinner p {
      margin: 1rem 0 0 0;
      font-size: 1.125rem;
    }
  `],
})
export class AssessmentContainerComponent implements OnInit {
  currentStep: Step = 'resume';
  isLoading = false;
  loadingMessage = '';
  error: string | null = null;
  globalError: { title: string; message: string } | null = null;

  resumeText = '';
  jobDescription = '';
  questionCount = 5;
  interviewQuestions: InterviewQuestion[] = [];
  matchReport: MatchReport | null = null;
  assessmentId: string | null = null;

  constructor(private assessmentService: AssessmentService) {}

  ngOnInit(): void {
    // Initialize assessment
  }

  async onResumeSubmitted(resume: string): Promise<void> {
    this.resumeText = resume;
    this.error = null;
    this.currentStep = 'jobDescription';
  }

  async onJobDescriptionSubmitted(data: {
    jobDescription: string;
    questionCount: number;
  }): Promise<void> {
    this.jobDescription = data.jobDescription;
    this.questionCount = data.questionCount;
    this.error = null;

    this.isLoading = true;
    this.loadingMessage = 'Analyzing resume and generating interview questions...';

    try {
      const response = await this.assessmentService
        .createAssessment(this.resumeText, this.jobDescription, this.questionCount)
        .toPromise();

      if (!response) {
        throw new Error('Failed to create assessment');
      }

      this.assessmentId = response.assessmentId;

      // Fetch the full assessment details
      const assessment = await this.assessmentService
        .getAssessment(this.assessmentId)
        .toPromise();

      if (!assessment) {
        throw new Error('Failed to load assessment');
      }

      this.interviewQuestions = assessment.interviewQuestions || [];
      this.matchReport = assessment.initialMatchReport || null;

      this.currentStep = 'questions';
    } catch (err: any) {
      this.error = err?.error?.error || err?.message || 'Failed to create assessment';
      this.globalError = {
        title: 'Assessment Creation Failed',
        message: this.error || 'An unknown error occurred',
      };
    } finally {
      this.isLoading = false;
    }
  }

  async onAnswersSubmitted(responses: CandidateResponse[]): Promise<void> {
    if (!this.assessmentId) {
      throw new Error('Assessment ID not found');
    }

    this.isLoading = true;
    this.loadingMessage = 'Submitting your answers...';

    try {
      await this.assessmentService
        .submitResponses(this.assessmentId, responses)
        .toPromise();

      // Fetch updated assessment with results
      const assessment = await this.assessmentService
        .getAssessment(this.assessmentId)
        .toPromise();

      if (assessment && assessment.initialMatchReport) {
        this.matchReport = assessment.initialMatchReport;
      }

      this.currentStep = 'results';
    } catch (err: any) {
      this.error = err?.error?.error || err?.message || 'Failed to submit responses';
      this.globalError = {
        title: 'Submission Failed',
        message: this.error || 'An unknown error occurred',
      };
    } finally {
      this.isLoading = false;
    }
  }

  goBack(): void {
    this.currentStep = 'resume';
    this.error = null;
  }

  dismissError(): void {
    this.globalError = null;
  }
}
