# Resume-to-Job Matching Algorithm

## Overview

This document explains the AI-powered candidate assessment matching algorithm used in the Profiler application.

---

## Process Flow

```
User Upload
    ↓
Resume Analysis (Extract skills, experience, education)
    ↓
Job Description Analysis (Extract requirements, skills, experience)
    ↓
Matching Algorithm
    ├─ Skill Match (70% weight)
    └─ Experience Match (30% weight)
    ↓
Overall Match Score (0-100%)
    ↓
Decision
    ├─ If > 80% → Save to MongoDB
    └─ If ≤ 80% → Keep in Memory Only
    ↓
Generate Interview Questions (OpenAI)
```

---

## Phase 1: Data Collection & Storage

### Resume Processing
- **Input**: User uploads .docx or .txt file
- **Extraction**: Text parsed to extract:
  - Skills (Angular, TypeScript, RxJS, etc.)
  - Years of experience
  - Education level
  - Certifications
  - Previous roles
  - Contact information
- **Storage**: Stored in component properties:
  - `resumeText` - Raw text
  - `extractedResume` - Parsed object

### Job Description Processing
- **Input**: User pastes job description text
- **Extraction**: Text parsed to extract:
  - Required skills
  - Nice-to-have skills
  - Experience level required
  - Responsibilities
  - Role level
- **Storage**: Stored in component properties:
  - `jobDescription` - Raw text
  - `extractedJobDescription` - Parsed object

---

## Phase 2: User Initiates Analysis

**User Action**: Clicks "Analyze & Match" button

**System Actions**:
1. Calls `runAnalysis()` method
2. Sends both `resumeText` and `jobDescription` to backend
3. Shows loading message: "Analyzing resume against job description..."

---

## Phase 3: Backend Matching Algorithm

### Step 1: Advanced Text Parsing

#### Resume Parsing
```typescript
parseResume(resumeText) {
  skills = extractSkills(text)           // 50+ known skills DB
  experience = extractYears(text)        // Pattern: "X years"
  education = extractDegrees(text)       // BS, MS, PhD patterns
  certifications = extractCerts(text)    // AWS, Azure, etc.
  roles = extractRoles(text)             // Job titles
}
```

#### Job Description Parsing
```typescript
parseJobDescription(jobDesc) {
  requiredSkills = extractSkills(text, strict=true)
  niceToHaveSkills = extractSkills(niceToHaveSection)
  yearsRequired = extractYears(text)
  responsibilities = extractResponsibilities(text)
}
```

### Step 2: Skill Matching (70% Weight)

**Algorithm**:
1. Extract all skills from job description
2. Compare against candidate's skills
3. Calculate match percentage for each skill

**Example**:
```
Job Requirements:      Candidate Skills:
- Angular (required)   - Angular ✅ (Advanced)
- TypeScript (req)     - TypeScript ✅ (Intermediate)
- RxJS (required)      - RxJS ⚠️ (Beginner)
- Node.js (preferred)  - Node.js ❌ (None)

Matched: 2/4 = 50% base score
```

**Final Skill Score Calculation**:
```
Skill Score = (Matched Skills / Total Required Skills) × 100
Skill Score = (2 / 4) × 100 = 50%
```

### Step 3: Experience Matching (30% Weight)

**Comparison**:
```
Resume Experience: 7 years
Job Requires: 5 years

Experience Match = min((7/5) × 100, 100) = 100%
```

### Step 4: Overall Match Score

**Formula**:
```
Overall Match = (Skill Score × 0.70) + (Experience Score × 0.30)
Overall Match = (50% × 0.70) + (100% × 0.30)
Overall Match = 35% + 30% = 65%
```

---

## Phase 4: Storage Decision

### Rule: Threshold-Based Storage

| Match Score | Action | Details |
|---|---|---|
| **> 80%** | Save to MongoDB | Excellent fit - store for future reference |
| **50-80%** | Keep in Memory | Good match - available during session |
| **< 50%** | Keep in Memory | Possible fit - available during session |

**Decision Logic**:
```typescript
if (matchPercentage > 80) {
  // Save to MongoDB with all data
  saveAssessmentToDatabase({
    resumeText,
    jobDescription,
    matchPercentage,
    assessmentId
  });
  console.log("✅ Saved to database");
} else {
  // Keep in memory only
  console.log("📋 Keeping in memory only");
}
```

---

## Phase 5: Question Generation

### OpenAI Integration

If match > 0%, the system generates tailored interview questions using OpenAI:

**Prompt Structure**:
```
You are an expert technical interviewer. Generate 5 interview questions:

CANDIDATE PROFILE:
- Skills: Angular, TypeScript, RxJS (Beginner)
- Experience: 7 years as Frontend Developer
- Education: BS Computer Science
- Previous Roles: Senior Frontend Dev, Frontend Lead

JOB DESCRIPTION:
[Full job description text]

Generate questions that:
1. Test critical missing skills (RxJS)
2. Validate claimed experience
3. Assess role fit
```

**Question Output Format**:
```json
{
  "question": "Describe your experience with RxJS Subjects",
  "difficulty": "Medium",
  "category": "Technical",
  "tested_skills": ["RxJS", "Reactive Programming"],
  "expected_answer_hints": "BehaviorSubject, ReplaySubject, use cases..."
}
```

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Angular)                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   User Upload Resume → onFileSelected()                     │
│         ↓                                                    │
│   Extract with Mammoth library                              │
│         ↓                                                    │
│   Store in resumeText + extractedResume                     │
│         ↓                                                    │
│   User Enters Job Description → onJobDescriptionSubmitted() │
│         ↓                                                    │
│   Parse with regex patterns                                 │
│         ↓                                                    │
│   Store in jobDescription + extractedJobDescription         │
│         ↓                                                    │
│   Click "Analyze & Match" → runAnalysis()                   │
│         ↓                                                    │
│   Send HTTP POST /assessments/create                        │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                    Backend (.NET 8)                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   AssessmentService.CreateAssessmentAsync()                 │
│         ↓                                                    │
│   Step 1: ResumeAnalysisService.AnalyzeResume()             │
│   → Extract skills, experience, education                   │
│         ↓                                                    │
│   Step 2: CandidateMatchService.CalculateMatch()            │
│   → Generate match score and skill gaps                     │
│         ↓                                                    │
│   Step 3: InterviewQuestionGeneratorService                 │
│   → Call OpenAI API to generate questions                   │
│         ↓                                                    │
│   Step 4: Save to Database or Memory                        │
│   → If match > 80%: Save to MongoDB                         │
│   → Else: Keep in memory                                    │
│         ↓                                                    │
│   Return Assessment object with results                     │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                   Frontend (Display)                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   Show Match Report                                         │
│   - Overall match percentage                                │
│   - Matched skills with scores                              │
│   - Missing/critical skills                                 │
│   - Recommendations                                         │
│         ↓                                                    │
│   Generate Interview Questions                              │
│   - Display 5-20 tailored questions                         │
│   - Categorized by difficulty                               │
│   - Show tested skills                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## Example Scenario

### Candidate Profile
```
Name: Silviya Paskaleva
Resume: "I have 7 years of experience as a Senior Frontend 
Developer. Expert in Angular, TypeScript, and RxJS. 
BS in Computer Science. AWS certified."

Skills Found:
- Angular (Advanced)
- TypeScript (Advanced)
- RxJS (Advanced)
- AWS (Intermediate)
- Git (Proficient)
```

### Job Description
```
Position: Senior Frontend Developer
Requirements:
- 5+ years frontend development
- Strong Angular and TypeScript skills
- Experience with RxJS and state management
- Node.js knowledge preferred
```

### Matching Results
```
Required Skills Analysis:
- Angular: ✅ Matched (Advanced vs Required Intermediate)
- TypeScript: ✅ Matched (Advanced vs Required Intermediate)
- RxJS: ✅ Matched (Advanced vs Required Intermediate)
- Node.js: ❌ Missing (Not mentioned vs Preferred)

Skill Score: (3/4) × 100 = 75%
Experience Score: min((7/5) × 100, 100) = 100%

Overall Match = (75% × 0.70) + (100% × 0.30) = 52.5% + 30% = 82.5%

Decision: > 80% → Save to MongoDB ✅
```

---

## Performance Metrics

| Operation | Time | Notes |
|---|---|---|
| Resume Extraction | 1-2s | Depends on file size |
| Parsing & Matching | <500ms | Regex-based, instant |
| Database Save | 1-2s | If > 80% match |
| Question Generation | 2-3s | OpenAI API call |
| **Total** | **5-8s** | End-to-end |

---

## Configuration

### Matching Weights
- **Skill Match**: 70%
- **Experience Match**: 30%

### Thresholds
- **Save Threshold**: 80%
- **Min Resume Length**: 50 characters
- **Max Resume Size**: 10MB

### Skill Database
Located in: `text-parser.util.ts` - KNOWN_SKILLS array
- 50+ technical skills
- Updated regularly

---

## Future Enhancements

1. **Machine Learning**: Replace regex with ML models
2. **Custom Weights**: Allow HR to adjust matching weights
3. **Skill Proficiency Levels**: Improve skill level detection
4. **Salary Range Matching**: Add compensation analysis
5. **Location Analysis**: Geographic fit scoring

---

**Last Updated**: March 27, 2026  
**Version**: 1.0.0
