# Candidate Assessment Feature - Backend Scaffold (Step 3)

## ✅ Completed Tasks

### Task 1.1: Create DTOs & Data Models

#### Created 5 DTO Files:
1. **ResumeAnalysisRequest.cs**
   - Request DTO for resume analysis
   - Contains raw resume text input
   - Web + Mobile consume this

2. **ResumeData.cs**
   - Parsed resume data model
   - Contains: name, skills, experience, education, certifications
   - Returned by ResumeAnalysisService
   - Used by downstream services

3. **InterviewQuestion.cs**
   - Complete interview question model
   - Includes: question text, difficulty, category, tested skills, hints
   - QuestionGenerationRequest DTO
   - QuestionGenerationResponse DTO

4. **MatchReport.cs**
   - Detailed match analysis report
   - Contains: overall score, skill matches, gaps, recommendations
   - SkillMatch entity model
   - Recommendation model
   - MatchAnalysisRequest/Response DTOs

5. **Assessment.cs**
   - Complete assessment record
   - Contains: candidate info, resume, job description, questions, responses, results
   - CandidateResponse model
   - CreateAssessmentRequest/Response DTOs
   - AssessmentHistoryRequest/Response DTOs

**Total DTO Files:** 5
**Total Classes:** 21 data models & DTOs

### Task 1.2: Create Entity Framework Core Entities & DbContext

#### Created 4 Entity Files:
1. **AssessmentEntity.cs**
   - Maps to PostgreSQL `assessments` table
   - Primary key: Guid (Id)
   - Fields: candidate name, job title, resume, job description, status, scores, match report
   - Navigation: relationships to questions and responses

2. **InterviewQuestionEntity.cs**
   - Maps to PostgreSQL `interview_questions` table
   - Foreign key to Assessment
   - Fields: question text, difficulty, category, tested skills, hints, sequence
   - Navigation: relationship to responses

3. **CandidateResponseEntity.cs**
   - Maps to PostgreSQL `candidate_responses` table
   - Foreign keys to Assessment and InterviewQuestion
   - Fields: answer text, time spent, submission timestamp
   - Navigation: relationships to assessment and question

4. **ApplicationDbContext.cs**
   - Entity Framework Core DbContext for PostgreSQL
   - Configures all model relationships
   - Sets up cascade deletes
   - Creates indexes on frequently-queried columns
   - Includes validation rules and constraints

**Database Features:**
- ✅ UUID primary keys (GUID)
- ✅ Timestamp tracking (CreatedAt, UpdatedAt, CompletedAt)
- ✅ Foreign key relationships with cascade delete
- ✅ Indexes on candidate name, status, dates for query performance
- ✅ JSON columns for complex data (resume data, match report)
- ✅ Not-null constraints on required fields
- ✅ Max length constraints on text fields

## Folder Structure Created

```
libs/api/services-lib/
├── Dtos/
│   ├── ResumeAnalysisRequest.cs
│   ├── ResumeData.cs
│   ├── InterviewQuestion.cs
│   ├── MatchReport.cs
│   └── Assessment.cs
├── Data/
│   ├── ApplicationDbContext.cs
│   └── Entities/
│       ├── AssessmentEntity.cs
│       ├── InterviewQuestionEntity.cs
│       └── CandidateResponseEntity.cs
└── [Services to be implemented in Step 4]

libs/api/services-lib-test/
└── [Test files to be added in Step 7]
```

## Next: Step 4 - Implement Backend Services

The following services will be created in Step 4:

1. **ResumeAnalysisService.cs**
   - Implement: `AnalyzeResume(resumeText: string): ResumeData`
   - Parse resume text and extract: name, skills, experience, education, certifications

2. **InterviewQuestionGeneratorService.cs**
   - Implement: `GenerateQuestions(resumeData: ResumeData, jobDesc: string): List<InterviewQuestion>`
   - Call OpenAI API to generate interview questions
   - Handle: API errors, token limits, response parsing

3. **CandidateMatchService.cs**
   - Implement: `CalculateMatch(resumeData: ResumeData, jobDesc: string): MatchReport`
   - Perform skill matching using cosine similarity or NLP
   - Generate: match scores, gap analysis, recommendations

4. **AssessmentService.cs** (Database operations)
   - Implement: CRUD operations via ApplicationDbContext
   - Methods: CreateAssessment, GetAssessment, SaveResults, GetHistory

## Connection String Configuration

Add to `appsettings.json`:

```json
"ConnectionStrings": {
  "DefaultConnection": "Host=localhost;Port=5432;Database=candidate_assessment;Username=postgres;Password=your_password"
}
```

## Entity Framework Migrations (Will do in Step 4)

```bash
# Create migration
dotnet ef migrations add AddCandidateAssessmentEntities -p apps/api-app -s apps/api-app

# Apply migration to PostgreSQL
dotnet ef database update -p apps/api-app -s apps/api-app
```

## PostgreSQL Tables That Will Be Created

From the DbContext configuration:

1. **assessments**
   - id (UUID, PK)
   - candidate_name (VARCHAR 255)
   - job_title (VARCHAR 255)
   - resume_text (TEXT)
   - job_description (TEXT)
   - resume_data_json (TEXT/JSONB)
   - status (VARCHAR 50, default: 'Draft')
   - overall_match_score (INT, nullable)
   - overall_match_percentage (INT, nullable)
   - match_report_json (TEXT/JSONB, nullable)
   - created_at (TIMESTAMP, auto)
   - updated_at (TIMESTAMP, auto)
   - completed_at (TIMESTAMP, nullable)

2. **interview_questions**
   - id (UUID, PK)
   - assessment_id (UUID, FK)
   - question (TEXT)
   - difficulty (VARCHAR 50)
   - category (VARCHAR 100)
   - tested_skills_json (TEXT/JSONB)
   - expected_answer_hints (TEXT, nullable)
   - sequence_number (INT)
   - created_at (TIMESTAMP, auto)

3. **candidate_responses**
   - id (UUID, PK)
   - assessment_id (UUID, FK)
   - interview_question_id (UUID, FK)
   - answer (TEXT)
   - time_spent_seconds (INT)
   - submitted_at (TIMESTAMP, auto)

## Status

✅ **STEP 3 COMPLETE**

All DTOs and Entity Framework entities are scaffolded and ready.
- 5 DTO files created
- 4 Entity files created
- DbContext with relationships configured
- Database schema defined

→ Ready for **STEP 4: Implement Backend Services**
