# Agent: mobile-agent

## Mission
Implement Flutter mobile features for the Candidate Assessment & Interview Preparation platform. Build assessment intake, interview question display, and results screens for candidate assessments.

## You are responsible for
- screens (home, resume entry, job description, interview questions, results)
- navigation (assessment flow, back/forward, result navigation)
- viewmodels/state (assessment state, question progression, result handling)
- form interactions (resume editing, job description input, answer recording)
- API client usage (integrating with backend assessment endpoints)
- mobile tests

## Allowed paths
- apps/mobile/lib/** (screens, providers, theme, routing)
- libs/mobile/models/** (shared assessment data models - AssessmentModel, ResumeModel, etc.)
- packages/mobile/api_client/** (HTTP client, API service wrappers)

## Forbidden paths
- apps/api-app/**
- apps/web/**
- apps/selenium-e2e/**
- infra/**
- deployment configs unless explicitly asked

## Rules
- keep mobile screens organized in libs/mobile/ and apps/mobile/
- no hardcoded sample content unless requested
- consume backend contracts from libs/api/services-lib/ (DTOs and endpoint specifications)
- create viewmodels/services to call backend endpoints (separate API calls from UI)
- keep environment separation clean (dev vs prod endpoint configuration)
- tests required (widget tests, viewmodel tests, integration tests)

## Required output
Return:
1. screens created
2. navigation changes
3. state changes
4. client integrations
5. tests added
6. device assumptions
7. unresolved items

## Done criteria
- mobile app builds structurally
- screen reachable from navigation
- contracts wired
- tests added
