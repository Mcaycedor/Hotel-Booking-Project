# Candidate Assessment App - Build Workflow

## Complete Rebuild from Scratch (7 Steps)

Use these prompts in order to recreate the entire assessment platform from zero:

### **Step 1️⃣: Brainstorm Feature** (`1-brainstorm-feature`)
**Agent:** platform-architect | **Repeatable:** YES (for each new feature)

**Purpose:** Define the feature requirements and architecture approach
- Inputs: feature name, delivery channels, business goal
- Outputs: feature purpose, service breakdown, API needs, web needs, mobile needs, test approach

**Example Input:**
```
Feature: Candidate Assessment & Interview Preparation
Channels: Web, iOS, Android
Goal: Help candidates practice interviews and self-assess job fit
```

**Handoff to:** Step 2

---

### **Step 2️⃣: Write Plan** (`2-write-plan`)
**Agent:** platform-architect | **Repeatable:** YES (after each brainstorm)

**Purpose:** Turn design decisions into concrete actionable implementation plan
- Inputs: feature summary (from Step 1), monorepo structure, delivery channels
- Outputs: ordered tasks, exact file paths, dependencies, test plan, risks

**Produces:** Ordered task list for backend/web/mobile agents

**Handoff to:** Step 3 (can split work here)

---

### **Step 3️⃣: Implement Backend** (`3-implement-feature-backend`)
**Agent:** backend-agent | **Repeatable:** YES (for each domain/service)

**Purpose:** Build backend services, DTOs, and API endpoints
- Inputs: feature name, implementation plan (from Step 2), API contracts
- Creates:
  - Domain services in `libs/api/services-lib/` (ResumeAnalysisService, InterviewQuestionGeneratorService, CandidateMatchService, AssessmentService)
  - DTOs (AssessmentDto, ResumeDto, JobDescriptionDto, InterviewQuestionDto, MatchResultDto)
  - Endpoints in `apps/api-app/Program.cs` (POST /api/assessments, GET /api/assessments/{id}/questions, etc.)
  - Backend unit tests in `libs/api/services-lib-test/`

**Outputs:**
- Files created/updated (service classes, DTOs, endpoints)
- Validation rules and error handling
- Test count and coverage
- API contracts ready for web/mobile consumption

**⚠️ If Build Fails:** Use `3a-configure-di-container` prompt to resolve dependency injection errors

**Note:** Steps 3, 4, 5 can run IN PARALLEL once this step completes endpoints

**Handoff to:** Steps 4 & 5 (web and mobile teams)

---

### **Step 4️⃣: Implement Web** (`4-implement-feature-web`)
**Agent:** web-agent | **Repeatable:** YES (for each web feature/page)

**Purpose:** Build Angular web UI consuming backend APIs
- **Requirement:** Backend endpoints from Step 3 must exist
- Inputs: feature name, implementation plan, backend contract DTOs
- Creates:
  - Pages/components in `apps/web/src/app/assessment/` (resume-input, job-description, interview-questions, match-report, assessment-container)
  - Reusable components in `libs/web/components/`
  - Data-access services in `packages/web/services/` (HTTP clients)
  - State management in `packages/web/store/` (if needed)
  - Web tests in `apps/web/` (Jest)
  - Routes in Angular routing configuration

**Outputs:**
- Components created (count, purpose)
- Routes added (/assessment, /assessment/questions, /assessment/results)
- Data-access services and state changes
- Tests added and assumptions documented

**Note:** Can run in parallel with Step 5 (mobile)

**Handoff to:** Step 6

---

### **Step 5️⃣: Implement Mobile** (`5-implement-feature-mobile`)
**Agent:** mobile-agent | **Repeatable:** YES (for each mobile feature/screen)

**Purpose:** Build Flutter mobile UI consuming backend APIs
- **Requirement:** Backend endpoints from Step 3 must exist
- Inputs: feature name, implementation plan, backend contract DTOs
- Creates:
  - Screens in `apps/mobile/lib/screens/assessment/` (home_screen, resume_screen, job_description_screen, questions_screen, results_screen)
  - Shared models in `libs/mobile/models/` (AssessmentModel, ResumeModel, JobDescriptionModel, InterviewQuestionModel)
  - API client in `packages/mobile/api_client/` (HTTP wrapper, models, providers)
  - Navigation/routing in `apps/mobile/lib/`
  - Mobile tests (widget tests, viewmodel tests)

**Outputs:**
- Screens created (count, purpose)
- Navigation flow
- State/viewmodel changes
- API client integration
- Tests added and assumptions documented

**Note:** Can run in parallel with Step 4 (web)

**Handoff to:** Step 6

---

### **Step 6️⃣: Add Tests** (`6-add-tests`)
**Agent:** test-agent | **Repeatable:** YES (after features complete)

**Purpose:** Create comprehensive test coverage
- **Requirement:** Steps 3, 4, 5 must be completed
- Inputs: feature name, summary of all changes (backend/web/mobile)
- Creates:
  - Backend unit tests (service logic in `libs/api/services-lib-test/`)
  - Backend integration tests (database, service interactions)
  - API contract tests (request/response validation)
  - Web component tests (Angular components in `apps/web/`)
  - Web e2e scenarios (Cypress workflows)
  - Mobile widget tests
  - Mobile integration tests

**Outputs:**
- Test files created (locations and count)
- Coverage summary
- Identified gaps and risks
- Merge recommendation

**Dependency:** All implementation must be complete

**Handoff to:** Step 7

---

### **Step 7️⃣: Review Changes** (`7-review-change`)
**Agent:** review-agent | **Repeatable:** YES (before any merge)

**Purpose:** Validate implementation quality and readiness
- **Requirement:** All tests must pass
- Inputs: change summary, impacted files, test results, deployment impact
- Reviews:
  - Architecture alignment (matches agents' allowed paths)
  - Code quality and maintainability
  - Security concerns
  - Test coverage completeness
  - Deployment readiness

**Outputs:**
- Critical issues (block merge)
- Major issues (fix before merge)
- Minor issues (nice to have)
- Merge recommendation (approve/block)
- Release recommendation (approve/block)

**Final Handoff:** Approved by review-agent → Ready to merge

---

## How to Use This Workflow

### **For Initial Build (Assessment App from Scratch):**
```
Execute in ORDER:
1. 1-brainstorm-feature (define assessment app)
2. 2-write-plan (create task list)
3. 3-implement-feature-backend (build services)
   ↓ (wait for completion)
4. 4-implement-feature-web (build UI) [parallel with 5]
5. 5-implement-feature-mobile (build mobile) [parallel with 4]
   ↓ (wait for both to complete)
6. 6-add-tests (add all tests)
   ↓ (wait for tests to pass)
7. 7-review-change (final review)
   ↓
Merge to main
```

### **For Adding New Features to Existing Assessment App:**
```
Same sequence 1-7 for each new feature:
- New skill assessment domain
- Integration with external job boards
- Interview practice videos
- Peer review system

1. Brainstorm new feature
2. Write plan for new feature
3. Backend services for new feature
4. Web pages for new feature [parallel with 5]
5. Mobile screens for new feature [parallel with 4]
6. Add tests for new feature
7. Review new feature
```

### **For Bug Fixes or Refactoring:**
```
Usually skip 1-2, go straight to:
3. Implement backend fix
4. Implement web fix (if affected) [parallel with 5]
5. Implement mobile fix (if affected) [parallel with 4]
6. Add tests for the fix
7. Review the fix
```

---

## Parallel Work Architecture

**After Step 2 (plan is written):**
- Step 3 (Backend) runs first → produces API contracts
- Steps 4 & 5 (Web + Mobile) can start immediately after Step 3 completes
- Steps 4 & 5 run **in parallel** (mocked backend or contracts-first development)

**Sequential Dependencies:**
- Step 1 → Step 2 (must be sequential)
- Step 2 → Step 3 (must start backend first)
- Step 3 → Steps 4 & 5 (backend endpoints must exist)
- Steps 4 & 5 → Step 6 (all features must complete)
- Step 6 → Step 7 (all tests must pass)

---

## Optional: Release Check (Not Repeatable)

**When:** Before production releases (NOT for every feature)

**Prompt:** `release-check.v1` (no number - optional)

**Purpose:** Validate production readiness
- Container readiness
- Environment variable setup
- Secrets management
- Database migrations
- Deployment pipeline validation

---

## Agent Responsibilities (Who Does What)

| Agent | Prompts Used | Files Modified | Approval Gate |
|-------|-------------|-----------------|----------------|
| **platform-architect** | Steps 1-2 | Plan documents, task lists | Architecture review |
| **backend-agent** | Step 3 | libs/api/services-lib/, apps/api-app/Program.cs | Backend code review |
| **web-agent** | Step 4 | apps/web/, libs/web/, packages/web/ | Web code review |
| **mobile-agent** | Step 5 | apps/mobile/lib/, libs/mobile/, packages/mobile/ | Mobile code review |
| **test-agent** | Step 6 | All test files | Test coverage review |
| **review-agent** | Step 7 | (reads all changes) | Final approval gate |
| **devops-agent** | release-check | (infrastructure validation) | Release approval |

---

## Prompt Input/Output Chain

```
1-brainstorm-feature OUTPUT
  ├─ Feature definition
  ├─ Service breakdown
  ├─ API needs → INPUT to
  │
2-write-plan OUTPUT
  ├─ Ordered tasks → INPUT to
  ├─ File paths
  └─ Dependencies
       ├─ INPUT to 3-implement-feature-backend
       ├─ INPUT to 4-implement-feature-web
       ├─ INPUT to 5-implement-feature-mobile
       │
3-implement-feature-backend OUTPUT
  ├─ Services created
  ├─ Endpoints defined → INPUT to
  ├─ DTOs created → INPUT to
  │   ├─ 4-implement-feature-web
  │   └─ 5-implement-feature-mobile
  │
4-implement-feature-web OUTPUT
5-implement-feature-mobile OUTPUT
  └───→ Combined changes → INPUT to
       │
6-add-tests OUTPUT
  ├─ Test files created
  ├─ Coverage report → INPUT to
  │
7-review-change OUTPUT
  ├─ Issues found
  ├─ Approval/Block → Merge to main
```

---

## Key Rules for All Agents

1. **Use existing directory structure** - No new onlycats/platform-lib directories
2. **Assessment app focus** - All decisions aligned with assessment/interview feature
3. **Reusable components** - Shared UI in libs/web/components, shared models in libs/mobile/models
4. **Composable services** - Backend services call each other, orchestrated by AssessmentService
5. **Separation of concerns** - Presentation ≠ Data-access
6. **Test-as-you-go** - Tests added with every step, not at the end
7. **Follow backend contracts** - Web/mobile consume DTOs from services-lib

---

## Quick Reference: Which Prompt to Use

| Scenario | Use Prompts |
|----------|------------|
| Start new project | 1 → 2 → 3 → 4 → 5 → 6 → 7 |
| Add feature to existing app | 1 → 2 → 3 → 4 → 5 → 6 → 7 |
| Fix backend bug | 3 → 6 → 7 |
| Fix web bug | 4 → 6 → 7 |
| Fix mobile bug | 5 → 6 → 7 |
| Refactor backend | 3 → 6 → 7 |
| Before production release | 6 → 7 → release-check |
| Review code | 7 |

