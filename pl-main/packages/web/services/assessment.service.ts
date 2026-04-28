import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface ResumeAnalysisRequest {
  resumeText: string;
  jobDescription: string;
  questionCount: number;
}

export interface InterviewQuestion {
  id: string;
  question: string;
  difficulty: string;
  category: string;
  testedSkills: string[];
  hints: string[];
}

export interface CandidateResponse {
  id: string;
  questionId: string;
  candidateAnswer: string;
  submittedAt: Date;
}

export interface SkillMatch {
  skillName: string;
  requiredProficiency: string;
  candidateProficiency: string;
  matchScore: number;
  gapAnalysis: string;
}

export interface Recommendation {
  description: string;
  priority: string;
  estimatedEffort: string;
  resources: string[];
}

export interface MatchReport {
  assessmentId: string;
  overallMatchPercentage: number;
  overallMatchScore: number;
  hiringRecommendation: string;
  skillMatches: SkillMatch[];
  criticalMissingSkills: string[];
  niceTohaveSkills: string[];
  additionalSkills: string[];
  summaryAssessment: string;
  recommendations: Recommendation[];
}

export interface Assessment {
  id: string;
  candidateName: string;
  candidateEmail: string;
  resumeText: string;
  jobDescription: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  submittedAt?: Date;
  interviewQuestions: InterviewQuestion[];
  candidateResponses: CandidateResponse[];
  initialMatchReport?: MatchReport;
}

export interface CreateAssessmentResponse {
  assessmentId: string;
  candidateName: string;
  initialMatchPercentage: number;
  questionCount: number;
}

export interface SubmitResponsesResponse {
  assessmentId: string;
  status: string;
  submittedAt: Date;
}

/**
 * Mock Angular service for assessment API
 * Returns dummy data for testing and development
 */
@Injectable({
  providedIn: 'root',
})
export class AssessmentService {
  private currentAssessment$ = new BehaviorSubject<Assessment | null>(null);
  private assessmentError$ = new BehaviorSubject<string | null>(null);

  constructor() {}

  /**
   * Creates a new assessment (mock)
   */
  createAssessment(
    resumeText: string,
    jobDescription: string,
    questionCount: number = 5
  ): Observable<CreateAssessmentResponse> {
    return of({
      assessmentId: 'mock-' + Date.now(),
      candidateName: 'John Doe',
      initialMatchPercentage: 75,
      questionCount,
    }).pipe(delay(2000)); // Simulate API delay
  }

  /**
   * Retrieves a full assessment (mock)
   */
  getAssessment(assessmentId: string): Observable<Assessment> {
    const mockQuestions: InterviewQuestion[] = [
      {
        id: '1',
        question: 'What is your experience with Angular and TypeScript?',
        difficulty: 'Medium',
        category: 'Technical',
        testedSkills: ['Angular', 'TypeScript'],
        hints: ['Talk about specific projects', 'Mention component lifecycle'],
      },
      {
        id: '2',
        question: 'Describe your experience with state management in frontend applications.',
        difficulty: 'Hard',
        category: 'Architecture',
        testedSkills: ['RxJS', 'State Management'],
        hints: ['Mention RxJS Subjects', 'Talk about BehaviorSubject'],
      },
      {
        id: '3',
        question: 'How do you approach debugging a complex memory leak in a web application?',
        difficulty: 'Hard',
        category: 'Problem Solving',
        testedSkills: ['Debugging', 'Performance'],
        hints: ['Use browser dev tools', 'Talk about profiling'],
      },
      {
        id: '4',
        question: 'What is your experience with REST APIs and HTTP?',
        difficulty: 'Easy',
        category: 'Backend Integration',
        testedSkills: ['REST API', 'HTTP'],
        hints: ['Discuss different HTTP methods', 'Talk about status codes'],
      },
      {
        id: '5',
        question: 'Tell us about a challenging project you worked on and how you overcame it.',
        difficulty: 'Medium',
        category: 'Soft Skills',
        testedSkills: ['Problem Solving', 'Communication'],
        hints: ['Give specific examples', 'Explain your role clearly'],
      },
    ];

    const mockSkillMatches: SkillMatch[] = [
      {
        skillName: 'Angular',
        requiredProficiency: 'Intermediate',
        candidateProficiency: 'Advanced',
        matchScore: 95,
        gapAnalysis: 'Excellent match - exceeds requirements',
      },
      {
        skillName: 'TypeScript',
        requiredProficiency: 'Intermediate',
        candidateProficiency: 'Intermediate',
        matchScore: 85,
        gapAnalysis: 'Good match - meets requirements',
      },
      {
        skillName: 'RxJS',
        requiredProficiency: 'Intermediate',
        candidateProficiency: 'Beginner',
        matchScore: 60,
        gapAnalysis: 'Needs improvement - basic knowledge only',
      },
      {
        skillName: 'Node.js',
        requiredProficiency: 'Beginner',
        candidateProficiency: 'None',
        matchScore: 0,
        gapAnalysis: 'Critical gap - not mentioned in candidate profile',
      },
    ];

    const mockRecommendations: Recommendation[] = [
      {
        description: 'Complete an advanced RxJS course',
        priority: 'High',
        estimatedEffort: '40 hours',
        resources: ['RxJS Official Documentation', 'Udemy Advanced RxJS Course'],
      },
      {
        description: 'Learn Node.js fundamentals',
        priority: 'High',
        estimatedEffort: '60 hours',
        resources: ['Node.js Documentation', 'freeCodeCamp Node.js Course'],
      },
      {
        description: 'Practice system design patterns',
        priority: 'Medium',
        estimatedEffort: '30 hours',
        resources: ['System Design Interview Book', 'Tech Interview Handbook'],
      },
    ];

    const mockMatchReport: MatchReport = {
      assessmentId,
      overallMatchPercentage: 72,
      overallMatchScore: 72,
      hiringRecommendation: 'Strong Candidate',
      skillMatches: mockSkillMatches,
      criticalMissingSkills: ['Node.js', 'Database Design'],
      niceTohaveSkills: ['Docker', 'Kubernetes'],
      additionalSkills: ['AWS', 'Git'],
      summaryAssessment:
        'The candidate demonstrates strong Angular and TypeScript expertise with solid problem-solving skills. While there are gaps in backend technologies, the core frontend competencies are excellent.',
      recommendations: mockRecommendations,
    };

    return of({
      id: assessmentId,
      candidateName: 'John Doe',
      candidateEmail: 'john.doe@example.com',
      resumeText: 'Mock resume text',
      jobDescription: 'Mock job description',
      status: 'Completed',
      createdAt: new Date(),
      updatedAt: new Date(),
      submittedAt: new Date(),
      interviewQuestions: mockQuestions,
      candidateResponses: [],
      initialMatchReport: mockMatchReport,
    }).pipe(delay(1000));
  }

  /**
   * Submits candidate responses (mock)
   */
  submitResponses(
    assessmentId: string,
    responses: CandidateResponse[]
  ): Observable<SubmitResponsesResponse> {
    return of({
      assessmentId,
      status: 'Submitted',
      submittedAt: new Date(),
    }).pipe(delay(1500));
  }

  /**
   * Retrieves assessment history (mock)
   */
  getAssessmentHistory(candidateEmail: string): Observable<any> {
    return of([]).pipe(delay(500));
  }

  /**
   * Sets the current assessment
   */
  setCurrentAssessment(assessment: Assessment | null): void {
    this.currentAssessment$.next(assessment);
  }

  /**
   * Gets the current assessment observable
   */
  getCurrentAssessment(): Observable<Assessment | null> {
    return this.currentAssessment$.asObservable();
  }

  /**
   * Sets assessment error
   */
  setError(error: string | null): void {
    this.assessmentError$.next(error);
  }

  /**
   * Gets assessment error observable
   */
  getError(): Observable<string | null> {
    return this.assessmentError$.asObservable();
  }
}
