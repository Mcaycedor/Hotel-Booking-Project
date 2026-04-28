import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {
    AssessmentService,
    CandidateResponse,
    InterviewQuestion,
    MatchReport,
    parseJobDescription,
    parseResume,
} from '@app/web-data-access';
import { firstValueFrom } from 'rxjs';
import { InterviewQuestionsComponent } from './components/interview-questions/interview-questions.component';
import { JobDescriptionComponent } from './components/job-description/job-description.component';
import { MatchReportComponent } from './components/match-report/match-report.component';
import { ResumeInputComponent } from './components/resume-input/resume-input.component';

type Step = 'resume' | 'resumeReview' | 'jobDescription' | 'jobDescriptionReview' | 'matchResults' | 'questions' | 'results';

/**
 * Main assessment page component
 * Orchestrates the multi-step assessment workflow
 */
@Component({
  selector: 'app-assessment-page',
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

        <!-- Step 1b: Resume Review - Show Extracted Data -->
        <div *ngIf="currentStep === 'resumeReview'" class="data-review-container">
          <div class="review-header">
            <h2>✓ Resume Extracted & Analyzed</h2>
            <p>Review your extracted resume information below</p>
          </div>
          
          <div class="data-review-card">
            <div class="card-section">
              <h3>Candidate Information</h3>
              <div class="data-grid">
                <div class="data-item">
                  <span class="label">Name:</span>
                  <span class="value">{{ extractedResume?.name }}</span>
                </div>
                <div class="data-item">
                  <span class="label">Email:</span>
                  <span class="value">{{ extractedResume?.email }}</span>
                </div>
                <div class="data-item">
                  <span class="label">Years of Experience:</span>
                  <span class="value">{{ extractedResume?.yearsOfExperience }} years</span>
                </div>
                <div class="data-item">
                  <span class="label">Education:</span>
                  <span class="value">{{ extractedResume?.education }}</span>
                </div>
              </div>
            </div>

            <div class="card-section">
              <h3>Technical Skills</h3>
              <div class="skills-list">
                <span class="skill-tag" *ngFor="let skill of extractedResume?.skills">{{ skill }}</span>
              </div>
            </div>

            <div class="card-section">
              <h3>Previous Roles</h3>
              <div class="roles-list">
                <div class="role-item" *ngFor="let role of extractedResume?.previousRoles">
                  <span class="role-badge">📌</span>
                  <span class="role-text">{{ role }}</span>
                </div>
              </div>
            </div>

            <div class="card-section">
              <h3>Certifications</h3>
              <div class="certs-list">
                <div class="cert-item" *ngFor="let cert of extractedResume?.certifications">
                  <span class="cert-badge">🏆</span>
                  <span class="cert-text">{{ cert }}</span>
                </div>
              </div>
            </div>

            <div class="card-section">
              <h3>Professional Summary</h3>
              <p class="summary-text">{{ extractedResume?.summary }}</p>
            </div>
          </div>

          <div class="button-group">
            <button
              (click)="goBack()"
              [disabled]="isLoading"
              class="btn btn-secondary"
            >
              ← Edit Resume
            </button>
            <button
              (click)="currentStep = 'jobDescription'"
              [disabled]="isLoading"
              class="btn btn-primary btn-lg"
            >
              → Next: Add Job Description
            </button>
          </div>
        </div>

        <!-- Step 2: Job Description Input -->
        <app-job-description
          *ngIf="currentStep === 'jobDescription'"
          [isLoading]="isLoading"
          [error]="error"
          (jobDescriptionSubmitted)="onJobDescriptionSubmitted($event)"
          (goBack)="goBack()"
        ></app-job-description>

        <!-- Step 2b: Job Description Review - Show Extracted Data -->
        <div *ngIf="currentStep === 'jobDescriptionReview'" class="data-review-container">
          <div class="review-header">
            <h2>✓ Job Description Extracted & Analyzed</h2>
            <p>Review the job description requirements below</p>
          </div>
          
          <div class="data-review-card">
            <div class="card-section">
              <h3>Position Details</h3>
              <div class="data-grid">
                <div class="data-item">
                  <span class="label">Job Title:</span>
                  <span class="value">{{ extractedJobDescription?.jobTitle }}</span>
                </div>
                <div class="data-item">
                  <span class="label">Company:</span>
                  <span class="value">{{ extractedJobDescription?.company }}</span>
                </div>
                <div class="data-item">
                  <span class="label">Years Required:</span>
                  <span class="value">{{ extractedJobDescription?.yearsRequired }} years</span>
                </div>
                <div class="data-item">
                  <span class="label">Questions to Generate:</span>
                  <span class="value">{{ questionCount }}</span>
                </div>
              </div>
            </div>

            <div class="card-section">
              <h3>Required Skills</h3>
              <div class="skills-list">
                <span class="skill-tag required-tag" *ngFor="let skill of extractedJobDescription?.requiredSkills">{{ skill }}</span>
              </div>
            </div>

            <div class="card-section">
              <h3>Nice-to-Have Skills</h3>
              <div class="skills-list">
                <span class="skill-tag nice-tag" *ngFor="let skill of extractedJobDescription?.niceToHaveSkills">{{ skill }}</span>
              </div>
            </div>

            <div class="card-section">
              <h3>Key Responsibilities</h3>
              <div class="responsibilities-list">
                <div class="resp-item" *ngFor="let resp of extractedJobDescription?.responsibilities_list">
                  <span class="resp-bullet">•</span>
                  <span class="resp-text">{{ resp }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="button-group">
            <button
              (click)="goBack()"
              [disabled]="isLoading"
              class="btn btn-secondary"
            >
              ← Edit Job Description
            </button>
            <button
              (click)="runAnalysis()"
              [disabled]="isLoading"
              class="btn btn-primary btn-lg"
            >
              {{ isLoading ? 'Analyzing...' : '🔍 Analyze & Match' }}
            </button>
          </div>
        </div>

        <!-- Step 3: Match Results -->
        <div *ngIf="currentStep === 'matchResults'" class="analysis-complete">
          <div class="success-box">
            <h2>✓ Analysis Complete!</h2>
            <p>Your resume has been matched against the job description.</p>
            
            <!-- Match Percentage Display -->
            <div class="match-percentage-container">
              <div class="circular-progress">
                <svg class="progress-ring" width="120" height="120">
                  <circle class="progress-ring-bg" cx="60" cy="60" r="54" />
                  <circle 
                    class="progress-ring-fill" 
                    cx="60" 
                    cy="60" 
                    r="54"
                    [style.strokeDasharray]="'339.29'"
                    [style.strokeDashoffset]="'339.29 - (339.29 * initialMatchPercentage!) / 100'"
                  />
                </svg>
                <div class="percentage-text">
                  <span class="percentage-number">{{ initialMatchPercentage }}%</span>
                  <span class="percentage-label">Match</span>
                </div>
              </div>
              
              <div class="match-status" [ngClass]="'status-' + getMatchStatus(initialMatchPercentage!)">
                <h4>{{ getMatchLabel(initialMatchPercentage!) }}</h4>
                <p>{{ getMatchDescription(initialMatchPercentage!) }}</p>
              </div>
            </div>
            
            <div class="analysis-details">
              <div class="detail-item">
                <span class="label">Candidate:</span>
                <span class="value">{{ extractedResume?.name }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Position:</span>
                <span class="value">{{ extractedJobDescription?.jobTitle }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Questions to Generate:</span>
                <span class="value">{{ questionCount }}</span>
              </div>
            </div>
          </div>
          <div class="button-group">
            <button
              (click)="goBack()"
              [disabled]="isLoading"
              class="btn btn-secondary"
            >
              ← Back to Job Description
            </button>
            <button
              (click)="generateQuestions()"
              [disabled]="isLoading"
              class="btn btn-primary btn-lg"
            >
              {{ isLoading ? 'Generating Questions...' : '❓ Generate Interview Questions' }}
            </button>
          </div>
        </div>

        <!-- Step 4: Interview Questions -->
        <app-interview-questions
          *ngIf="currentStep === 'questions'"
          [questions]="interviewQuestions"
          [isSubmitting]="isLoading"
          [error]="error"
          (answersSubmitted)="onAnswersSubmitted($event)"
        ></app-interview-questions>

        <!-- Step 5: Results -->
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

    .analysis-complete {
      padding: 2rem;
      background: #f8f9fa;
      border-radius: 8px;
      margin-bottom: 2rem;
    }

    .success-box {
      background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
      border: 2px solid #28a745;
      border-radius: 8px;
      padding: 2rem;
      margin-bottom: 2rem;
      text-align: center;
    }

    .success-box h2 {
      margin: 0 0 0.5rem 0;
      color: #155724;
      font-size: 1.75rem;
    }

    .success-box p {
      margin: 0 0 1.5rem 0;
      color: #155724;
      font-size: 1.1rem;
    }

    .analysis-details {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      justify-content: center;
      margin-top: 1rem;
    }

    .detail-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }

    .detail-item .label {
      font-weight: 600;
      color: #155724;
      font-size: 0.9rem;
    }

    .detail-item .value {
      background: white;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      color: #333;
      font-weight: 500;
    }

    .button-group {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 600;
      text-decoration: none;
      display: inline-block;
      transition: all 0.3s;
      font-size: 1rem;
    }

    .btn-primary {
      background-color: #667eea;
      color: white;

      &:hover:not(:disabled) {
        background-color: #5568d3;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }

    .btn-lg {
      padding: 1rem 2rem;
      font-size: 1.1rem;
    }

    .btn-secondary {
      background-color: #6c757d;
      color: white;

      &:hover:not(:disabled) {
        background-color: #5a6268;
        transform: translateY(-2px);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }

    .match-percentage-container {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 2rem;
      margin: 2rem 0;
      flex-wrap: wrap;
    }

    .circular-progress {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .progress-ring {
      transform: rotate(-90deg);
    }

    .progress-ring-bg {
      fill: none;
      stroke: rgba(255, 255, 255, 0.3);
      stroke-width: 6;
    }

    .progress-ring-fill {
      fill: none;
      stroke: #28a745;
      stroke-width: 6;
      stroke-linecap: round;
      transition: stroke-dashoffset 0.5s ease;
    }

    .percentage-text {
      position: absolute;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .percentage-number {
      font-size: 2.5rem;
      font-weight: bold;
      color: #155724;
    }

    .percentage-label {
      font-size: 0.9rem;
      color: #155724;
      font-weight: 600;
      margin-top: 0.25rem;
    }

    .match-status {
      flex: 1;
      min-width: 250px;
      padding: 1.5rem;
      border-radius: 8px;
      text-align: center;
      border-left: 4px solid;
    }

    .match-status h4 {
      margin: 0 0 0.5rem 0;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .match-status p {
      margin: 0;
      font-size: 0.95rem;
      line-height: 1.5;
    }

    .status-excellent {
      background-color: #d4edda;
      color: #155724;
      border-left-color: #28a745;
    }

    .status-good {
      background-color: #cfe2ff;
      color: #084298;
      border-left-color: #0d6efd;
    }

    .status-fair {
      background-color: #fff3cd;
      color: #664d03;
      border-left-color: #ffc107;
    }

    .status-low {
      background-color: #f8d7da;
      color: #721c24;
      border-left-color: #dc3545;
    }

    /* Data Review Styles */
    .data-review-container {
      padding: 2rem;
      background: #f8f9fa;
      border-radius: 8px;
      margin-bottom: 2rem;
    }

    .review-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .review-header h2 {
      margin: 0 0 0.5rem 0;
      color: #155724;
      font-size: 1.75rem;
    }

    .review-header p {
      margin: 0;
      color: #666;
      font-size: 1rem;
    }

    .data-review-card {
      background: white;
      border-radius: 8px;
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .card-section {
      margin-bottom: 2rem;
    }

    .card-section:last-child {
      margin-bottom: 0;
    }

    .card-section h3 {
      margin: 0 0 1rem 0;
      color: #333;
      font-size: 1.25rem;
      border-bottom: 2px solid #667eea;
      padding-bottom: 0.5rem;
    }

    .data-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
    }

    .data-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      padding: 0.75rem;
      background: #f8f9fa;
      border-radius: 4px;
      border-left: 3px solid #667eea;
    }

    .data-item .label {
      font-size: 0.85rem;
      font-weight: 600;
      color: #666;
      text-transform: uppercase;
    }

    .data-item .value {
      font-size: 1rem;
      color: #333;
      font-weight: 500;
    }

    .skills-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .skill-tag {
      display: inline-block;
      padding: 0.5rem 1rem;
      background: #e7f5ff;
      border: 1px solid #0d6efd;
      border-radius: 20px;
      color: #0d6efd;
      font-size: 0.9rem;
      font-weight: 500;
    }

    .skill-tag.required-tag {
      background: #d1e7dd;
      border-color: #198754;
      color: #198754;
    }

    .skill-tag.nice-tag {
      background: #fff3cd;
      border-color: #ffc107;
      color: #664d03;
    }

    .roles-list,
    .certs-list,
    .responsibilities-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .role-item,
    .cert-item,
    .resp-item {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 0.75rem;
      background: #f8f9fa;
      border-radius: 4px;
    }

    .role-badge,
    .cert-badge,
    .resp-bullet {
      flex-shrink: 0;
      font-size: 1.2rem;
    }

    .role-text,
    .cert-text,
    .resp-text {
      color: #333;
      font-size: 0.95rem;
      line-height: 1.4;
    }

    .summary-text {
      line-height: 1.6;
      color: #555;
      margin: 0;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 4px;
      border-left: 3px solid #667eea;
    }
  `],
})

export class AssessmentPageComponent implements OnInit {
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
  isAnalyzed = false;
  initialMatchPercentage: number | null = null;
  
  // Extracted data
  extractedResume: any = null;
  extractedJobDescription: any = null;

  constructor(private assessmentService: AssessmentService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    // Initialize assessment
  }

  async onResumeSubmitted(resume: string): Promise<void> {
    this.resumeText = resume;
    this.error = null;
    
    // Parse the actual resume text to extract real data
    try {
      this.extractedResume = parseResume(this.resumeText);
    } catch (err) {
      console.error('Error parsing resume:', err);
      this.extractedResume = parseResume(''); // fallback to empty parse
    }
    
    this.currentStep = 'resumeReview';
    this.cdr.detectChanges();  // Force UI update
  }

  async onJobDescriptionSubmitted(data: {
    jobDescription: string;
    questionCount: number;
  }): Promise<void> {
    this.jobDescription = data.jobDescription;
    this.questionCount = data.questionCount;
    this.error = null;

    // Parse the actual job description text to extract real data
    try {
      const parsed = parseJobDescription(this.jobDescription);
      this.extractedJobDescription = {
        jobTitle: parsed.jobTitle,
        company: parsed.company,
        requiredSkills: parsed.requiredSkills,
        yearsRequired: parsed.yearsRequired,
        niceToHaveSkills: parsed.niceToHaveSkills,
        responsibilities: parsed.responsibilities,
        responsibilities_list: parsed.responsibilities
      };
    } catch (err) {
      console.error('Error parsing job description:', err);
      const empty = parseJobDescription(''); // fallback to empty parse
      this.extractedJobDescription = {
        jobTitle: empty.jobTitle,
        company: empty.company,
        requiredSkills: empty.requiredSkills,
        yearsRequired: empty.yearsRequired,
        niceToHaveSkills: empty.niceToHaveSkills,
        responsibilities: empty.responsibilities,
        responsibilities_list: empty.responsibilities
      };
    }
    
    this.currentStep = 'jobDescriptionReview';
    this.cdr.detectChanges();  // Force UI update
  }

  async runAnalysis(): Promise<void> {
    this.error = null;
    this.isLoading = true;
    this.loadingMessage = 'Analyzing resume against job description...';
    
    const startTime = performance.now();
    console.log('⏱️ Starting analysis...');

    try {
      console.log('📊 Calling createAssessment()...');
      const stepStart1 = performance.now();
      
      const response = await firstValueFrom(
        this.assessmentService.createAssessment(
          this.resumeText,
          this.jobDescription,
          this.questionCount
        )
      );
      
      const stepEnd1 = performance.now();
      console.log(`✅ createAssessment completed in ${(stepEnd1 - stepStart1).toFixed(0)}ms`);

      if (!response) {
        throw new Error('Failed to create assessment');
      }

      this.assessmentId = response.assessmentId;
      this.initialMatchPercentage = response.initialMatchPercentage;
      this.isAnalyzed = true;
      
      console.log(`📈 Match: ${this.initialMatchPercentage}%`);

      // If match > 80%, save to MongoDB database
      if (this.initialMatchPercentage > 80) {
        this.loadingMessage = 'Match excellence detected! Saving to database...';
        try {
          console.log('💾 Calling saveAssessmentToDatabase()...');
          const stepStart2 = performance.now();
          
          const saveResponse = await firstValueFrom(
            this.assessmentService.saveAssessmentToDatabase({
              resumeText: this.resumeText,
              jobDescription: this.jobDescription,
              extractedResume: this.extractedResume,
              extractedJobDescription: this.extractedJobDescription,
              matchPercentage: this.initialMatchPercentage,
              assessmentId: this.assessmentId,
            })
          );
          
          const stepEnd2 = performance.now();
          console.log(`✅ Saved to database in ${(stepEnd2 - stepStart2).toFixed(0)}ms: ${saveResponse.message}`);
        } catch (dbErr: any) {
          console.warn('⚠️ Database save failed, keeping in memory:', dbErr);
          // Data remains in memory even if database save fails
        }
      } else {
        // Keep in memory only (below 80% threshold)
        console.log('📋 Keeping in memory only (Match: ' + this.initialMatchPercentage + '% < 80%)');
      }

      console.log('🔄 Moving to matchResults step...');
      this.currentStep = 'matchResults';
      this.cdr.detectChanges();  // Force UI update
      console.log('✅ currentStep updated to:', this.currentStep);

    } catch (err: any) {
      console.error('❌ Analysis failed:', err);
      this.error = err?.error?.error || err?.message || 'Failed to run analysis';
      this.globalError = {
        title: 'Analysis Failed',
        message: this.error || 'An unknown error occurred',
      };
    } finally {
      const endTime = performance.now();
      console.log(`⏱️ Analysis completed in ${(endTime - startTime).toFixed(0)}ms total`);
      this.isLoading = false;
      this.cdr.detectChanges();  // Force spinner to hide immediately
    }
  }

  async generateQuestions(): Promise<void> {
    if (!this.assessmentId) {
      throw new Error('Assessment ID not found');
    }

    this.error = null;
    this.isLoading = true;
    this.loadingMessage = 'Step 2/2: Generating interview questions...';

    try {
      // Fetch the full assessment details with generated questions
      const assessment = await firstValueFrom(
        this.assessmentService.getAssessment(this.assessmentId)
      );

      if (!assessment) {
        throw new Error('Failed to load assessment');
      }

      this.interviewQuestions = assessment.interviewQuestions || [];
      this.matchReport = assessment.initialMatchReport || null;

      this.currentStep = 'questions';
      this.cdr.detectChanges();  // Force UI update
    } catch (err: any) {
      this.error = err?.error?.error || err?.message || 'Failed to generate questions';
      this.globalError = {
        title: 'Question Generation Failed',
        message: this.error || 'An unknown error occurred',
      };
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();  // Force spinner to hide immediately
    }
  }

  async onAnswersSubmitted(responses: CandidateResponse[]): Promise<void> {
    if (!this.assessmentId) {
      throw new Error('Assessment ID not found');
    }

    this.isLoading = true;
    this.loadingMessage = 'Submitting your answers...';

    try {
      await firstValueFrom(
        this.assessmentService.submitResponses(this.assessmentId, responses)
      );

      // Fetch updated assessment with results
      const assessment = await firstValueFrom(
        this.assessmentService.getAssessment(this.assessmentId)
      );

      if (assessment && assessment.initialMatchReport) {
        this.matchReport = assessment.initialMatchReport;
      }

      this.currentStep = 'results';
      this.cdr.detectChanges();  // Force UI update
    } catch (err: any) {
      this.error = err?.error?.error || err?.message || 'Failed to submit responses';
      this.globalError = {
        title: 'Submission Failed',
        message: this.error || 'An unknown error occurred',
      };
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();  // Force spinner to hide immediately
    }
  }

  goBack(): void {
    if (this.currentStep === 'resumeReview') {
      this.currentStep = 'resume';
      this.extractedResume = null;
      this.error = null;
    } else if (this.currentStep === 'jobDescriptionReview') {
      this.currentStep = 'jobDescription';
      this.extractedJobDescription = null;
      this.error = null;
    } else if (this.currentStep === 'matchResults' && this.isAnalyzed) {
      this.currentStep = 'jobDescriptionReview';
      this.error = null;
    } else if (this.currentStep === 'questions' && this.isAnalyzed) {
      this.currentStep = 'matchResults';
      this.error = null;
    } else {
      this.currentStep = 'resume';
      this.extractedResume = null;
      this.extractedJobDescription = null;
      this.error = null;
      this.isAnalyzed = false;
      this.assessmentId = null;
    }
    this.cdr.detectChanges();  // Force UI update after navigation
  }

  dismissError(): void {
    this.globalError = null;
  }

  getMatchStatus(percentage: number): string {
    if (percentage >= 80) return 'excellent';
    if (percentage >= 60) return 'good';
    if (percentage >= 40) return 'fair';
    return 'low';
  }

  getMatchLabel(percentage: number): string {
    if (percentage >= 80) return '🌟 Excellent Match';
    if (percentage >= 60) return '👍 Good Match';
    if (percentage >= 40) return '📊 Fair Match';
    return '⚠️ Low Match';
  }

  getMatchDescription(percentage: number): string {
    if (percentage >= 80) return 'Your profile is an excellent fit for this role. You meet most of the key requirements.';
    if (percentage >= 60) return 'Your profile shows a good fit with several key skills aligned. Some gaps may require learning.';
    if (percentage >= 40) return 'Your profile has some relevant skills. There are notable gaps that would need addressing.';
    return 'Your profile shows limited alignment with this role. Consider upskilling in key areas.';
  }
}
