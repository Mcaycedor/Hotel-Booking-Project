import { Observable } from 'rxjs';

/**
 * Request to create a new assessment.
 */
export interface ResumeAnalysisRequest {
  resumeText: string;
  jobDescription: string;
  questionCount: number;
}

/**
 * Interview question for an assessment.
 */
export interface InterviewQuestion {
  id: string;
  question: string;
  difficulty: string;
  category: string;
  testedSkills: string[];
  hints: string[];
}

/**
 * Candidate response to an interview question.
 */
export interface CandidateResponse {
  id: string;
  questionId: string;
  candidateAnswer: string;
  submittedAt: Date;
}

/**
 * Skill match analysis.
 */
export interface SkillMatch {
  skillName: string;
  requiredProficiency: string;
  candidateProficiency: string;
  matchScore: number;
  gapAnalysis: string;
}

/**
 * Skill development recommendation.
 */
export interface Recommendation {
  description: string;
  priority: string;
  estimatedEffort: string;
  resources: string[];
}

/**
 * Overall match report for an assessment.
 */
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

/**
 * Complete assessment with all data.
 */
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

/**
 * Response from creating an assessment.
 */
export interface CreateAssessmentResponse {
  assessmentId: string;
  candidateName: string;
  initialMatchPercentage: number;
  questionCount: number;
}

/**
 * Response from submitting assessment responses.
 */
export interface SubmitResponsesResponse {
  assessmentId: string;
  status: string;
  submittedAt: Date;
}

/**
 * Interface for assessment service.
 */
export interface IAssessmentService {
  /**
   * Creates a new assessment.
   */
  createAssessment(
    resumeText: string,
    jobDescription: string,
    questionCount?: number
  ): Observable<CreateAssessmentResponse>;

  /**
   * Gets an assessment by ID.
   */
  getAssessment(assessmentId: string): Observable<Assessment>;

  /**
   * Submits candidate responses to interview questions.
   */
  submitResponses(
    assessmentId: string,
    responses: CandidateResponse[]
  ): Observable<SubmitResponsesResponse>;

  /**
   * Gets assessment history for a candidate.
   */
  getAssessmentHistory(candidateEmail: string): Observable<Assessment[]>;

  /**
   * Saves assessment to MongoDB database (only when match > 80%).
   */
  saveAssessmentToDatabase(assessmentData: {
    resumeText: string;
    jobDescription: string;
    extractedResume: any;
    extractedJobDescription: any;
    matchPercentage: number;
    assessmentId: string;
  }): Observable<{ success: boolean; message: string; id: string }>;
}
