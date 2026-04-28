# 🤖 AI Agents & Prompts System

Candidate Assessment & Interview Preparation Platform

---

## Quick Start: Rebuild from Scratch

To recreate the **entire assessment platform** from zero, follow these 7 prompts in order:

```
1️⃣  1-brainstorm-feature       (platform-architect: Define feature)
2️⃣  2-write-plan              (platform-architect: Create tasks)
3️⃣  3-implement-feature-backend (backend-agent: Build services)
4️⃣  4-implement-feature-web    (web-agent: Build Angular UI)     [parallel with 5]
5️⃣  5-implement-feature-mobile (mobile-agent: Build Flutter UI) [parallel with 4]
6️⃣  6-add-tests              (test-agent: Add test coverage)
7️⃣  7-review-change          (review-agent: Final approval)
```

**Time to complete:** ~6-8 hours of agent work (depending on feature complexity)

---

## System Architecture

### Directory Structure
```
.ai/
├── README.md           (you are here)
├── WORKFLOW.md         ← Read this for detailed execution guide
├── PROMPTS_INDEX.md    ← Read this for prompt reference
│
├── agents/             (Who does the work)
│   ├── platform-architect.md     (Steps 1-2: Design & plan)
│   ├── backend-agent.md          (Step 3: Backend services)
│   ├── web-agent.md             (Step 4: Web UI)
│   ├── mobile-agent.md          (Step 5: Mobile UI)
│   ├── test-agent.md            (Step 6: Testing)
│   ├── review-agent.md          (Step 7: Code review)
│   ├── devops-agent.md          (Optional: Release validation)
│   ├── scaffold-agent.md        (Optional: Infrastructure)
│   └── prompt-manager.md        (Optional: Prompt coordination)
│
└── prompts/            (What to do at each step)
    ├── 1-brainstorm-feature.md
    ├── 2-write-plan.md
    ├── 3-implement-feature-backend.md
    ├── 4-implement-feature-web.md
    ├── 5-implement-feature-mobile.md
    ├── 6-add-tests.md
    ├── 7-review-change.md
    └── release-check.md (optional)
```

### Workspace Directories

**Backend Services** (libs/api/services-lib/)
- ResumeAnalysisService.cs
- InterviewQuestionGeneratorService.cs
- CandidateMatchService.cs
- AssessmentService.cs

**API Endpoints** (apps/api-app/Program.cs)
- POST /api/assessments
- GET /api/assessments/{id}/questions
- POST /api/assessments/{id}/answers
- GET /api/assessments/{id}/results

**Web Frontend** (apps/web/src/app/assessment/)
- Resume input component
- Job description component
- Interview questions display
- Match report component

**Mobile Frontend** (apps/mobile/lib/)
- Home screen
- Resume entry screen
- Job description screen
- Questions display screen
- Results screen

---

## How Agents Work Together

### Phase 1: Design 📋
**Agents:** platform-architect (2 prompts)
- 1️⃣ **Brainstorm** - Understand the feature
- 2️⃣ **Write Plan** - Create 50+ ordered tasks

**Output:** Implementation plan with exact file paths and dependencies

---

### Phase 2: Implementation 🛠️
**Agents:** backend-agent, web-agent, mobile-agent (3 prompts parallel after backend)

#### Backend (Sequential)
- 3️⃣ **backend-agent** reads Plan from Step 2
  - Creates 4 services, 5 DTOs, 4 endpoints
  - ~400+ lines of C# code
  - Produces API contracts (DTOs)

#### Web & Mobile (Parallel after Backend)
- 4️⃣ **web-agent** reads Backend output (DTOs, endpoints)
  - Creates 5 Angular components
  - ~800+ lines TypeScript code
  
- 5️⃣ **mobile-agent** reads Backend output (DTOs, endpoints)
  - Creates 5 Flutter screens
  - ~600+ lines Dart code

**Output:** Complete implementation (backend + web + mobile)

---

### Phase 3: Validation 🧪
**Agents:** test-agent, review-agent (2 prompts sequential)

- 6️⃣ **test-agent** reads all changes from Phases 1-2
  - Creates unit tests
  - Creates integration tests
  - Creates e2e tests
  - ~300+ lines test code

- 7️⃣ **review-agent** reads all outputs + test results
  - Reviews architecture alignment
  - Reviews code quality
  - Reviews security
  - Issues approval/block decision

**Output:** Merge approval or block with issues list

---

## Execution Workflows

### Initial Platform Build (Steps 1-7)
```
START
 ├─→ 1-brainstorm-feature (2 min reading)
 │    └─ Input: Feature scope, channels
 │    └─ Output: Feature breakdown
 │
 ├─→ 2-write-plan (5 min reading)
 │    └─ Input: Brainstorm summary
 │    └─ Output: 50+ ordered tasks
 │
 ├─→ 3-implement-feature-backend (30-45 min)
 │    └─ Input: Plan tasks 1-20
 │    └─ Output: Services, DTOs, endpoints
 │
 ├─→ 4-implement-feature-web (30-45 min) [parallel with 5]
 │    └─ Input: Backend DTOs + Plan tasks 21-35
 │    └─ Output: Angular components
 │
 ├─→ 5-implement-feature-mobile (30-45 min) [parallel with 4]
 │    └─ Input: Backend DTOs + Plan tasks 36-50
 │    └─ Output: Flutter screens
 │
 ├─→ 6-add-tests (20-30 min)
 │    └─ Input: All implementation changes
 │    └─ Output: Test suite (~300+ lines)
 │
 ├─→ 7-review-change (10-15 min)
 │    └─ Input: All changes + test results
 │    └─ Output: APPROVE or BLOCK
 │
 └─→ If APPROVED: Merge to main ✅
    If BLOCKED: Fix issues, re-run 6-7

Total Time: ~2-3 hours (for experienced team)
```

### Add New Feature to Existing Platform (Steps 1-7)
Same sequence as above, but:
- Step 1-2 focus on new feature only
- Step 3 adds to existing services-lib
- Step 4 adds to existing web app
- Step 5 adds to existing mobile app
- Steps 6-7 test new feature + affected areas

### Bug Fix (Skip 1-2, Start at 3)
```
3-implement-feature-backend (fix services)
  ↓
4&5 (if UI affected)
  ↓
6-add-tests (tests for fix)
  ↓
7-review-change (approval)
```

---

## Key Rules for Success

### 1. Always Follow the Sequence
Don't skip steps. The plan from Step 2 feeds into Steps 3-5.

### 2. Backend First
Endpoints must exist before web/mobile can write code. Agents enforce this.

### 3. Parallel Where Possible
- Steps 1-2: Sequential (sequential, 5 min total)
- Steps 3-5: 3→4&5 parallel (30-45 min each, can overlap)
- Steps 6-7: Sequential (30-40 min total)

### 4. Use Real Architecture
Agents guide code to correct places:
- Backend services → `libs/api/services-lib/`
- Web components → `apps/web/src/app/assessment/` or `libs/web/components/`
- Mobile screens → `apps/mobile/lib/screens/assessment/`
- Tests → `libs/api/services-lib-test/`, `apps/web/`, etc.

### 5. No Onlycats References
Prompts have been cleaned to use actual existing directories, not non-existent platforms-lib structure.

### 6. Assessment-Focused Context
All agents understand:
- Assessment domain logic (resume analysis, question generation, job match scoring)
- Required services (ResumeAnalysisService, InterviewQuestionGeneratorService, CandidateMatchService, AssessmentService)
- API contracts (AssessmentDto, ResumeDto, JobDescriptionDto, InterviewQuestionDto, MatchResultDto)

---

## Documentation Files

| File | Purpose | Read When |
|------|---------|-----------|
| [WORKFLOW.md](WORKFLOW.md) | Detailed step-by-step execution guide with examples | Before running any prompt |
| [PROMPTS_INDEX.md](PROMPTS_INDEX.md) | Quick reference for what each prompt expects | When using a specific prompt |
| Agent files (.md) | Agent descriptions and responsibilities | To understand who does what |
| Prompt files (.md) | Detailed prompt instructions for each step | When invoking that step's agent |

---

## FAQ

### Q: Can I use these agents to rebuild the entire app from scratch?
**A:** Yes! Follow steps 1-7 in order. Each prompt is designed to work from zero.

### Q: What if I only want to add one new feature?
**A:** Still follow 1-7, but Steps 1-2 will focus on just that feature. Steps 3-5 will add to what's already built.

### Q: Can web and mobile work in parallel?
**A:** Yes! After Step 3 (backend) completes with API contracts, Steps 4 & 5 can run simultaneously.

### Q: What if the backend isn't done yet?
**A:** Web/Mobile can start earlier using mock endpoints or contracts-first approach. They'll swap in real endpoints once Step 3 completes.

### Q: Do I need all 7 steps for a bug fix?
**A:** Usually no. Skip 1-2 if just fixing existing code. Start at Step 3, then 6-7 for tests & review.

### Q: What does "REPEATABLE" mean on a prompt?
**A:** Use it every time you add a new feature. For example, to add a "peer review" feature later, you'd use the numbered sequence 1-7 again.

### Q: What about release-check.md?
**A:** That's optional, only before production releases. Not needed for feature development or internal testing.

### Q: How do agents know the workflow?
**A:** The prompts are numbered and sequenced. Each prompt's output feeds into the next prompt's input. Agents read this WORKFLOW.md to understand the full context.

---

## Next Steps

1. **Read [WORKFLOW.md](WORKFLOW.md)** - Understand the 7-step process in detail
2. **Read [PROMPTS_INDEX.md](PROMPTS_INDEX.md)** - See what each prompt does
3. **Start with Step 1** - Invoke `1-brainstorm-feature.md` with your feature definition
4. **Follow the chain** - Each step tells you what to do next

---

## Glossary

| Term | Meaning |
|------|---------|
| **Prompt** | A detailed instruction file (.md) that guides an agent to do something |
| **Agent** | An AI that follows a prompt and produces code/documentation |
| **Service** | A domain-focused C# class in libs/api/services-lib/ (e.g., ResumeAnalysisService) |
| **DTO** | Data Transfer Object - contract model between frontend and backend |
| **Component** | Reusable UI element (Web: Angular component, Mobile: Flutter widget) |
| **Screen** | Full page or view in mobile app |
| **Handoff** | When one agent's output becomes the next agent's input |
| **Step** | One numbered prompt in the 1-7 workflow |
| **Phase** | Group of related steps (Design/Build/Validate) |

---

**Last Updated:** March 25, 2026  
**Status:** Ready for production rebuild  
**Platform:** Candidate Assessment & Interview Preparation  

