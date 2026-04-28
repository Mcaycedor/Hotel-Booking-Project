---
id: 4-implement-feature-web.v1
owner: platform
agent: web-agent
purpose: Implement Angular web feature
version: REPEATABLE - Use this for every new web feature/page
inputs:
  - feature_name
  - plan
  - backend_contracts
  - routing_rules
outputs:
  - pages/components
  - routes
  - services/data-access
  - forms
  - tests
  - assumptions
  - follow-ups
usage_order: '4th - Use after 3-implement-feature-backend (parallel with 5-implement-feature-mobile)'
require: Backend endpoints must exist first
---

You are the web-agent.

Task:
Implement the Angular web feature consuming backend services.

Inputs:
- feature name: {{feature_name}}
- plan: {{plan}}
- backend contracts/endpoints: {{backend_contracts}}
- routing rules: {{routing_rules}}

Output:
1. pages/components created in libs/web/components/ (reusable form/display components) or apps/web/src/app/assessment/ (feature screens: intake, questions, results)
2. routes added to app routing configuration (/assessment, /assessment/questions, /assessment/results)
3. data-access services created in packages/web/services/ for backend assessment API calls
4. state management changes in packages/web/store/ for assessment workflow state (if needed)
5. form interactions implemented (resume input, job description entry, question answers, filtering)
6. tests added (component tests, service tests, routing tests via jest)
7. assumptions documented (backend API contracts, data types, workflow sequencing)
8. follow-up tasks identified

Rules:
- keep reusable UI components in libs/web/components/ (form inputs, visualizations, question display)
- put assessment API integrations in packages/web/services/
- put assessment state in packages/web/store/
- separate UI presentation from API data-access (create Angular services for HTTP calls)
- consume backend DTOs from libs/api/services-lib/ (AssessmentDto, ResumeDto, JobDescriptionDto, InterviewQuestionDto, MatchResultDto)
- add unit and component tests using jest
- register routes in Angular routing module
- follow backend assessment workflow and endpoint specifications
