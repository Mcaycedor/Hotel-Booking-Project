# ✅ Rebuild Checklist - Assessment App from Scratch

Use this checklist when rebuilding the entire platform from zero.

---

## Phase 1: Design (5-10 min)

### ☐ Step 1: Brainstorm Feature
**Prompt:** `.ai/prompts/1-brainstorm-feature.md`  
**Agent:** platform-architect

**Before running:**
- [ ] Have feature definition ready
- [ ] Know target channels (Web, Mobile)
- [ ] Have business goal defined

**After completion:**
- [ ] Feature broken into service components
- [ ] API endpoints identified
- [ ] Web/Mobile requirements documented
- [ ] Test approach outlined
- Proceed to: **Step 2**

**Time:** 2-5 min reading, 30 min agent execution

---

### ☐ Step 2: Write Plan
**Prompt:** `.ai/prompts/2-write-plan.md`  
**Agent:** platform-architect

**Before running:**
- [ ] Have Step 1 output available
- [ ] Know Nx monorepo structure (apps/, libs/, packages/)
- [ ] Have delivery channels confirmed

**After completion:**
- [ ] 50+ ordered implementation tasks
- [ ] Exact file paths specified
- [ ] Dependencies mapped
- [ ] Test plan outlined
- [ ] Risks identified
- [ ] Handoff sequence documented
- Proceed to: **Step 3**

**Time:** 5 min reading, 30-45 min agent execution

---

## Phase 2: Implementation (90-120 min)

### ☐ Step 3: Implement Backend
**Prompt:** `.ai/prompts/3-implement-feature-backend.md`  
**Agent:** backend-agent

**Before running:**
- [ ] Have Plan output (tasks 1-20)
- [ ] Know which services to create
- [ ] Have database schema ready (or use existing)

**During execution:**
- [ ] Backend endpoints being created
- [ ] DTOs being defined
- [ ] Validation logic being implemented
- [ ] Unit tests being written

**After completion:**
- [ ] 4 service classes created
- [ ] 5 DTO models defined
- [ ] 4-6 API endpoints in Program.cs
- [ ] Validation rules documented
- [ ] Backend unit tests complete
- [ ] API contracts ready for web/mobile
- Proceed to: **Steps 4 & 5 (in parallel)**

**Directory Check:**
```
apps/api-app/Program.cs
  └─ New endpoints added

libs/api/services-lib/
  ├─ ResumeAnalysisService.cs ✅
  ├─ InterviewQuestionGeneratorService.cs ✅
  ├─ CandidateMatchService.cs ✅
  ├─ AssessmentService.cs ✅
  └─ Contracts/
      ├─ AssessmentDto.cs ✅
      ├─ ResumeDto.cs ✅
      ├─ JobDescriptionDto.cs ✅
      ├─ InterviewQuestionDto.cs ✅
      └─ MatchResultDto.cs ✅

libs/api/services-lib-test/
  └─ New test files ✅
```

**Time:** 45 min reading, 60-90 min agent execution

---

### ☐ Step 4: Implement Web
**Prompt:** `.ai/prompts/4-implement-feature-web.md`  
**Agent:** web-agent

**REQUIREMENT:** Step 3 (backend) must be complete first

**Before running:**
- [ ] Backend endpoints from Step 3 available
- [ ] Backend DTOs documented
- [ ] Have Step 2 web tasks (tasks 21-35)
- [ ] Angular routing plan ready

**During execution (parallel with Step 5):**
- [ ] Angular components created
- [ ] Routing configured
- [ ] Data-access services created
- [ ] State management set up
- [ ] Web tests written

**After completion:**
- [ ] 5 feature components created
- [ ] Routes configured (/assessment path)
- [ ] HTTP services created
- [ ] State management initialized
- [ ] Web component tests complete
- Proceed to: **Step 6 (after Step 5 complete)**

**Directory Check:**
```
apps/web/src/app/assessment/
  ├─ resume-input.component.ts ✅
  ├─ job-description.component.ts ✅
  ├─ interview-questions.component.ts ✅
  ├─ match-report.component.ts ✅
  └─ assessment-container.component.ts ✅

libs/web/components/
  └─ Common form/display components ✅

packages/web/services/
  └─ assessment.service.ts ✅

apps/web/
  └─ Test files (.spec.ts) ✅
```

**Time:** 30 min reading, 60-90 min agent execution

---

### ☐ Step 5: Implement Mobile
**Prompt:** `.ai/prompts/5-implement-feature-mobile.md`  
**Agent:** mobile-agent

**REQUIREMENT:** Step 3 (backend) must be complete first

**Before running:**
- [ ] Backend endpoints from Step 3 available
- [ ] Backend DTOs documented
- [ ] Have Step 2 mobile tasks (tasks 36-50)
- [ ] Flutter navigation plan ready

**During execution (parallel with Step 4):**
- [ ] Flutter screens created
- [ ] Models and providers set up
- [ ] API client integration
- [ ] Navigation implemented
- [ ] Mobile tests written

**After completion:**
- [ ] 5 mobile screens created
- [ ] Shared models defined
- [ ] API client wrapper done
- [ ] Navigation flow set up
- [ ] Mobile widget tests complete
- Proceed to: **Step 6 (after Step 4 complete)**

**Directory Check:**
```
apps/mobile/lib/screens/assessment/
  ├─ home_screen.dart ✅
  ├─ resume_screen.dart ✅
  ├─ job_description_screen.dart ✅
  ├─ questions_screen.dart ✅
  └─ results_screen.dart ✅

libs/mobile/models/
  ├─ assessment_model.dart ✅
  ├─ resume_model.dart ✅
  ├─ job_description_model.dart ✅
  ├─ interview_question_model.dart ✅
  └─ match_result_model.dart ✅

packages/mobile/api_client/
  ├─ assessment_api_client.dart ✅
  └─ assessment_provider.dart ✅
```

**Time:** 30 min reading, 60-90 min agent execution

---

## Phase 3: Validation (40-60 min)

### ☐ Step 6: Add Tests
**Prompt:** `.ai/prompts/6-add-tests.md`  
**Agent:** test-agent

**REQUIREMENT:** Steps 3, 4, 5 must be complete

**Before running:**
- [ ] Backend implementation complete
- [ ] Web implementation complete
- [ ] Mobile implementation complete
- [ ] Have summaries of all changes

**During execution:**
- [ ] Backend tests being written
- [ ] Web tests being written
- [ ] Mobile tests being written
- [ ] Integration tests being created

**After completion:**
- [ ] Backend unit tests written
- [ ] Backend integration tests written
- [ ] Web component tests written
- [ ] Web e2e scenarios written
- [ ] Mobile widget tests written
- [ ] Mobile integration tests written
- [ ] Test coverage report generated
- [ ] Identify any gaps or risks
- Proceed to: **Step 7**

**Test Coverage Checklist:**
- [ ] Backend critical paths tested
- [ ] Resume analysis validation tested
- [ ] Question generation tested
- [ ] Match scoring tested
- [ ] Web components render correctly
- [ ] Web HTTP calls tested (mocked)
- [ ] Web routing tested
- [ ] Mobile screens render correctly
- [ ] Mobile navigation tested
- [ ] Mobile API calls tested (mocked)

**Time:** 20 min reading, 30-45 min agent execution

---

### ☐ Step 7: Review Changes
**Prompt:** `.ai/prompts/7-review-change.md`  
**Agent:** review-agent

**REQUIREMENT:** Step 6 (tests) must be complete, all tests passing

**Before running:**
- [ ] All tests passing
- [ ] Have test summary from Step 6
- [ ] Have implementation summary from Steps 3-5
- [ ] Know deployment impact

**During execution:**
- [ ] Code architecture reviewed
- [ ] Quality standards checked
- [ ] Security review done
- [ ] Test coverage verified

**After completion - If APPROVED:**
- ✅ Code merged to main
- ✅ Platform ready for deployment
- Proceed to: **Optional Step 8 (release)**

**After completion - If BLOCKED:**
- ❌ Issues documented
- ❌ Return to Steps 3-5 to fix
- ❌ Re-run Step 6 after fixes
- ❌ Re-run Step 7 for approval

**Review Checklist:**
- [ ] Backend services follow domain-driven design
- [ ] Web components are reusable and maintainable
- [ ] Mobile screens follow Flutter conventions
- [ ] All business logic in services (not UI)
- [ ] All DTOs properly contract tested
- [ ] No hardcoded values
- [ ] Proper error handling everywhere
- [ ] Security: no secrets in code
- [ ] Security: SQL injection prevention (if applicable)
- [ ] Deployment: containers build successfully
- [ ] Deployment: environment variables documented
- [ ] Tests: 80%+ coverage
- [ ] Tests: all critical paths tested
- [ ] No breaking changes to existing APIs

**Time:** 10 min reading, 15-20 min agent execution

---

## Optional Phase: Release

### ☐ Step 8: Release Check (Optional)
**Prompt:** `.ai/prompts/release-check.md`  
**Agent:** devops-agent

**WHEN TO USE:** Only before production releases (not for every feature)

**Before running:**
- [ ] Have all production deployments ready
- [ ] Infrastructure changes documented
- [ ] Secrets management configured

**After completion:**
- [ ] Production readiness verified
- [ ] Pipeline checks passed
- [ ] Approval for production release

**Time:** 10-15 min

---

## Success Criteria

### ✅ All Complete When:

**Backend (Step 3):**
- [ ] 4 service classes created
- [ ] 5 DTOs defined
- [ ] 4-6 API endpoints working
- [ ] All validation rules implemented
- [ ] Backend unit tests green ✅

**Web (Step 4):**
- [ ] 5 components created
- [ ] Routes working (/assessment visible)
- [ ] HTTP services calling backend
- [ ] State management initialized
- [ ] Web tests green ✅

**Mobile (Step 5):**
- [ ] 5 screens created
- [ ] Navigation flow working
- [ ] API client calling backend
- [ ] Models properly serialized
- [ ] Mobile tests green ✅

**Tests (Step 6):**
- [ ] 50+ unit tests written
- [ ] 20+ integration tests written
- [ ] 80%+ code coverage
- [ ] All tests passing ✅

**Review (Step 7):**
- [ ] All issues resolved
- [ ] APPROVED ✅
- [ ] Ready to merge ✅

---

## Troubleshooting

### ❌ Tests Failing at Step 6
- Check backend endpoints are accessible
- Verify DTOs match between backend/frontend
- Check mock data in services
- Run individual test suites to isolate failures

### ❌ Review Blocked at Step 7
- Review agent will provide specific issues
- Return to relevant step (3/4/5)
- Fix identified issues
- Re-run affected tests
- Re-run Step 7 review

### ❌ Web/Mobile Can't Find Backend
- Confirm backend (Step 3) is complete
- Verify endpoints in Program.cs
- Check HTTP client baseURL configuration
- Test endpoint with Postman/curl

### ❌ Agent Seems Stuck
- Check if previous step is actually complete
- Verify all inputs are provided to the prompt
- Review prompt description to confirm what's needed

---

## Time Estimates

| Phase | Steps | Min Time | Max Time |
|-------|-------|----------|----------|
| Design | 1-2 | 5 min | 15 min |
| Backend | 3 | 60 min | 90 min |
| Web | 4 | 60 min | 90 min |
| Mobile | 5 | 60 min | 90 min |
| Tests | 6 | 30 min | 45 min |
| Review | 7 | 15 min | 30 min |
| **TOTAL** | 1-7 | **3.5 hrs** | **5.5 hrs** |
| Release (optional) | 8 | 10 min | 20 min |

Note: Time estimates assume experienced team and good prompt inputs

---

## Next Actions

### To Start Now:
1. Read `.ai/WORKFLOW.md` (detailed guide)
2. Read `.ai/PROMPTS_INDEX.md` (quick reference)
3. Run Step 1: `.ai/prompts/1-brainstorm-feature.md`
4. Follow the numbered sequence

### Files Reference:
- Documentation: `.ai/README.md`, `.ai/WORKFLOW.md`, `.ai/PROMPTS_INDEX.md`
- This checklist: `.ai/REBUILD_CHECKLIST.md` (you are here)
- Agents: `.ai/agents/` (platform-architect, backend-agent, web-agent, etc.)
- Prompts: `.ai/prompts/` (1-7 numbered workflow + release-check)

---

**Status:** ✅ Ready for Full Platform Rebuild  
**Last Updated:** March 25, 2026  
**Platform:** Candidate Assessment & Interview Preparation

