---
id: 1-brainstorm-feature.v1
owner: platform
agent: platform-architect
purpose: Plan a new feature for the monorepo platform
version: REPEATABLE - Use this every time you add a new feature
inputs:
  - feature_name
  - channels
  - goal
outputs:
  - feature purpose
  - module placement
  - API/Web/Mobile needs
  - test strategy
  - implementation steps
usage_order: '1st - Always start here for any new feature'
---

You are the platform-architect.

Task:
Plan a new feature for the monorepo platform.

Inputs:
- feature name: {{feature_name}}
- channels: {{channels}}
- goal: {{goal}}

Output:
1. feature purpose
2. backend service breakdown (which services to add/modify in libs/api/services-lib/)
3. API endpoint needs (method, path, payload, response) for apps/api-app/Program.cs
4. DTO/contract models (to be created alongside service classes)
5. Web needs (pages, components, routes in libs/web/ or apps/web/)
6. Mobile needs (screens, viewmodels, routes in libs/mobile/ or apps/mobile/)
7. validation approach (where validation occurs in service layer)
8. unit test approach (unit tests in services-lib-test/, web tests in apps/web, etc.)
9. ordered implementation steps (scaffold backend → implement service → register endpoints → web → mobile → test)

Rules:
- keep platform services reusable
- do not leak domain logic into shared core
- group related endpoints in Program.cs by domain
- keep web/mobile features isolated
- focus on concrete decisions, not documentation
- be specific about which service classes to create/modify
