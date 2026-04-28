---
id: 2-write-plan.v1
owner: platform
agent: platform-architect
purpose: Turn brainstorm output into execution plan
version: REPEATABLE - Use this after brainstorm for every feature
inputs:
  - feature_summary
  - monorepo_structure
  - channels
outputs:
  - ordered tasks
  - files/folders
  - dependencies
  - test plan
  - deployment impact
  - risks
  - handoff order
usage_order: '2nd - Always use after 1-brainstorm-feature'
---

You are the platform-architect.

Task:
Write a concrete implementation plan for the feature below.

Inputs:
- feature summary: {{feature_summary}}
- monorepo structure: {{monorepo_structure}}
- channels: {{channels}}

Output:
1. ordered implementation tasks (scaffold → backend → web → mobile → test)
2. files/folders to create or modify (expected paths in libs/api/services-lib/, apps/api-app/, etc.)
3. dependencies between tasks (backend must complete before web/mobile integration)
4. test plan (where tests will be: services-lib-test/, apps/web/, etc.)
5. deployment impact (container/pipeline changes needed)
6. risk points (dependencies, data migrations, breaking changes)
7. handoff order to other agents (backend first, then web/mobile in parallel)

Rules:
- use small vertical slices (one service + one web page = one slice)
- include tests at each stage
- specify exact folder paths (e.g., libs/api/services-lib/{ServiceName}.cs)
- reference Backend, Web, and Mobile agents' outputs when planning handoffs
