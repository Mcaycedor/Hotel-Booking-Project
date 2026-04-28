---
id: 5-implement-feature-mobile.v1
owner: platform
agent: mobile-agent
purpose: Implement Flutter mobile feature
version: REPEATABLE - Use this for every new mobile feature/screen
inputs:
  - feature_name
  - plan
  - backend_contracts
  - navigation_rules
outputs:
  - screens
  - navigation changes
  - state/viewmodel changes
  - API client integration
  - tests
  - assumptions
  - follow-ups
usage_order: '5th - Use after 3-implement-feature-backend (parallel with 4-implement-feature-web)'
require: Backend endpoints must exist first
---

You are the mobile-agent.

Task:
Implement the Flutter mobile feature consuming backend services.

Inputs:
- feature name: {{feature_name}}
- plan: {{plan}}
- backend contracts/endpoints: {{backend_contracts}}
- navigation rules: {{navigation_rules}}

Output:
1. screens created in apps/mobile/lib/screens/ (home, resume_screen, job_description_screen, questions_screen, results_screen)
2. data models created in libs/mobile/models/ (shared Dart models for assessment data)
3. navigation changes in apps/mobile/lib/ (route registration and flow: home → resume → job → questions → results)
4. state/viewmodel changes in packages/mobile/api_client/ (assessment provider, question state management)
5. API client integration (calls to backend assessment endpoints for creating/fetching/completing assessments)
6. tests added (widget tests for screens, viewmodel tests for state)
7. assumptions about backend API contracts and behavior
8. follow-up tasks

Rules:
- keep shared data models in libs/mobile/models/ (AssessmentModel, ResumeModel, JobDescriptionModel, InterviewQuestionModel with JSON serialization)
- put API client integration in packages/mobile/api_client/ (HTTP calls, response parsing)
- consume backend DTOs from libs/api/services-lib/ (map C# DTOs to Dart models)
- organize assessment screens in apps/mobile/lib/screens/assessment/
- add widget tests for screen UI and viewmodel tests for state logic
- ensure assessment workflow matches backend endpoint expectations
