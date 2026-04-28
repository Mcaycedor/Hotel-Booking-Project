# Prompts Index - Candidate Assessment App

## Numbered Prompts (Use in Order for Complete Rebuild)

### 🔢 Workflow Prompts (Repeatable - Use for Every Feature)

| # | Prompt | Agent | Repeat? | When to Use |
|---|--------|-------|--------|------------|
| 1 | `1-brainstorm-feature` | platform-architect | ✅ YES | Start of any new feature |
| 2 | `2-write-plan` | platform-architect | ✅ YES | After brainstorm completes |
| 3 | `3-implement-feature-backend` | backend-agent | ✅ YES | After plan written |
| 4 | `4-implement-feature-web` | web-agent | ✅ YES | After backend endpoints ready |
| 5 | `5-implement-feature-mobile` | mobile-agent | ✅ YES | After backend endpoints ready |
| 6 | `6-add-tests` | test-agent | ✅ YES | After all implementation complete |
| 7 | `7-review-change` | review-agent | ✅ YES | Before merge, after tests pass |

---

## Optional Prompts (Troubleshooting & Support)

| Prompt | Agent | Use When |
|--------|-------|----------|
| `3a-configure-di-container` | backend-agent | After step 3, if `dotnet build` fails with "Unable to resolve service" |
| `release-check` | devops-agent | Before production release only (NOT for every feature) |

---

## Execution Order for Complete Rebuild

```
INITIAL SETUP (From Scratch)
├── 1-brainstorm-feature ← Start here
│   └── Define: feature name, channels, goal
│
├── 2-write-plan ← After Step 1 completes
│   └── Outputs: Task list, file paths, dependencies
│
├── 3-implement-feature-backend ← After Step 2 completes
│   └── Creates: Services, DTOs, endpoints in Program.cs
│   └── Outputs: Backend implementation ready
│       │
│       ├─→ Wait for Step 3 completion before 4 & 5
│
├── 4-implement-feature-web ← After Step 3 completes [Can run parallel with 5]
│   └── Creates: Angular pages, components, services
│   └── Consumes: DTOs from Step 3
│   └── Outputs: Web implementation ready
│
├── 5-implement-feature-mobile ← After Step 3 completes [Can run parallel with 4]
│   └── Creates: Flutter screens, models, API client
│   └── Consumes: DTOs from Step 3
│   └── Outputs: Mobile implementation ready
│
├── 6-add-tests ← After Steps 4 & 5 complete
│   └── Inputs: All changes from steps 3-5
│   └── Creates: Unit tests, integration tests, e2e tests
│   └── Outputs: Test suite complete
│
├── 7-review-change ← After Step 6 completes, tests pass
│   └── Inputs: Summary of all changes + test results
│   └── Outputs: Approval/Block recommendation
│   └── If APPROVED → MERGE TO MAIN
│   └── If BLOCKED → Fix issues, re-run 6-7
```

---

## How to Invoke Each Prompt

### Step 1: Brainstorm Feature
```
Use prompt: 1-brainstorm-feature.md
Agent: platform-architect

Provide:
- Feature name: "Candidate Assessment & Interview Preparation"
- Channels: "Web (Angular), Mobile (Flutter)"
- Goal: "Help candidates practice interviews and self-assess job fit"

Expect output:
- Feature purpose & architecture
- Backend service breakdown (ResumeAnalysisService, InterviewQuestionGeneratorService, etc.)
- API endpoints needed
- Web/Mobile requirements
- Test approach
```

### Step 2: Write Plan
```
Use prompt: 2-write-plan.md
Agent: platform-architect

Provide:
- Feature summary (from Step 1 output)
- Current monorepo structure (apps/, libs/, packages/)
- Channels (Web, Mobile)

Expect output:
- 50+ ordered implementation tasks
- Exact file paths (libs/api/services-lib/ResumeAnalysisService.cs, etc.)
- Task dependencies
- Test plan (where + what)
- Risks identified
- Agent handoff sequence
```

### Step 3: Implement Backend
```
Use prompt: 3-implement-feature-backend.md
Agent: backend-agent

Provide:
- Feature name
- Plan excerpt (tasks 1-20 from Step 2)
- API contracts needed

Expect output:
- 4 new service classes (~400+ lines)
- 5 DTOs (~150+ lines)
- 4 endpoints in Program.cs
- Validation rules
- Unit tests (services-lib-test/)
- Next steps for web/mobile teams
```

### Step 4: Implement Web
```
Use prompt: 4-implement-feature-web.md
Agent: web-agent

REQUIREMENT: Backend endpoints from Step 3 must exist

Provide:
- Feature name
- Plan excerpt (web tasks from Step 2)
- Backend contracts (DTOs from Step 3)
- Routing requirements

Expect output:
- 5 feature components (~800+ lines)
- Reusable components
- Data-access services (HTTP clients)
- State management setup
- Routes configured
- Component tests
- Assumptions about backend
```

### Step 5: Implement Mobile
```
Use prompt: 5-implement-feature-mobile.md
Agent: mobile-agent

REQUIREMENT: Backend endpoints from Step 3 must exist

Provide:
- Feature name
- Plan excerpt (mobile tasks from Step 2)
- Backend contracts (DTOs from Step 3)
- Navigation requirements

Expect output:
- 5 screens in Flutter (~600+ lines)
- Shared models
- API client integration
- Navigation/routing setup
- Widget tests
- Assumptions about backend
```

### Step 6: Add Tests
```
Use prompt: 6-add-tests.md
Agent: test-agent

REQUIREMENT: Steps 3, 4, 5 must be completed

Provide:
- Feature name
- Summary of backend changes (services, endpoints)
- Summary of web changes (components, services)
- Summary of mobile changes (screens, models)

Expect output:
- Backend unit tests (services-lib-test/)
- Backend integration tests
- Web component tests
- Web e2e scenarios
- Mobile widget tests
- Test coverage report
- Approve/Block recommendation
```

### Step 7: Review Changes
```
Use prompt: 7-review-change.md
Agent: review-agent

REQUIREMENT: All tests must pass

Provide:
- Summary of all changes (backend + web + mobile)
- List of impacted files
- Test results (passed/failed)
- Deployment impact (containers, env vars, etc.)

Expect output:
- Critical issues found (if any)
- Major issues found (if any)
- Minor issues found (if any)
- Positives/strengths noted
- MERGE: Approve/Block
- RELEASE: Approve/Block
```

---

## Directory Structure Expected by Agents

### Backend (Step 3)
```
apps/api-app/
  └── Program.cs (Add endpoints here)

libs/api/services-lib/
  ├── ResumeAnalysisService.cs (new)
  ├── InterviewQuestionGeneratorService.cs (new)
  ├── CandidateMatchService.cs (new)
  ├── AssessmentService.cs (new)
  ├── Contracts/
  │   ├── AssessmentDto.cs (new)
  │   ├── ResumeDto.cs (new)
  │   ├── JobDescriptionDto.cs (new)
  │   ├── InterviewQuestionDto.cs (new)
  │   └── MatchResultDto.cs (new)
  └── ...existing services

libs/api/services-lib-test/
  └── [Unit tests for new services]
```

### Web (Step 4)
```
apps/web/src/app/assessment/
  ├── resume-input.component.ts (new)
  ├── job-description.component.ts (new)
  ├── interview-questions.component.ts (new)
  ├── match-report.component.ts (new)
  ├── assessment-container.component.ts (new)
  └── ...test files

libs/web/components/
  └── [Reusable form components, visualizations]

packages/web/services/
  └── assessment.service.ts (HTTP client)

packages/web/store/
  └── [State management if needed]

apps/web/
  └── [Spec test files]
```

### Mobile (Step 5)
```
apps/mobile/lib/
  ├── screens/assessment/
  │   ├── home_screen.dart (new)
  │   ├── resume_screen.dart (new)
  │   ├── job_description_screen.dart (new)
  │   ├── questions_screen.dart (new)
  │   └── results_screen.dart (new)
  ├── app_routes.dart (updated)
  └── pubspec.yaml (updated)

libs/mobile/models/
  ├── assessment_model.dart (new)
  ├── resume_model.dart (new)
  ├── job_description_model.dart (new)
  ├── interview_question_model.dart (new)
  └── match_result_model.dart (new)

packages/mobile/api_client/
  ├── assessment_api_client.dart (HTTP wrapper)
  ├── assessment_provider.dart (State management)
  └── ...models if needed

apps/mobile/
  └── [Widget test files]
```

---

## Non-Repeatable Prompt

### Release Check (Optional)
```
Use prompt: release-check.md
Agent: devops-agent

WHEN: Before production release (not for every feature)

Provide:
- List of services changed
- Containers affected
- Environment variables needed
- Secrets management
- Database migration needed (yes/no)

Expect output:
- Production readiness validation
- Pipeline checks
- Approval/Block for release
```

---

## Summary: Five Key Rules

1. **Always start with Step 1-2** - Never skip brainstorm or plan
2. **Backend before Web/Mobile** - Endpoints must exist before UI consumption
3. **Web and Mobile in parallel** - Can work simultaneously on steps 4-5
4. **Tests before review** - All features must have tests (Step 6) before review (Step 7)
5. **Repeat for each feature** - Same 1-7 sequence for initial build AND any new features added later

