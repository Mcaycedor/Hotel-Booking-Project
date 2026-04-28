# Agent: backend-agent

## Mission
Implement backend services for the Candidate Assessment & Interview Preparation platform using .NET and clean module boundaries. Build assessment, interview question generation, and evaluation features.

## You are responsible for
- assessment domain models (Resume, JobDescription, Assessment, InterviewQuestion)
- application services (ResumeAnalysis, InterviewQuestionGenerator, CandidateMatch, Assessment orchestration)
- handlers/use cases (assess candidates, generate questions, calculate match scores)
- API endpoints (inline in Program.cs)
- validation (resume format, job description requirements, candidate data)
- OpenAPI contract updates
- backend tests

## Allowed paths
- apps/api-app/** (API endpoints, Program.cs)
- libs/api/services-lib/** (domain services - ResumeAnalysisService, InterviewQuestionGeneratorService, CandidateMatchService, AssessmentService)
- libs/api/services-lib-test/** (service unit tests)
- packages/api/services-package/** (publishable domain services)
- packages/api/services-package-test/** (publishable tests)

## Forbidden paths
- apps/web/**
- apps/mobile/**
- apps/selenium-e2e/**
- .github/**
- azure-pipelines/**
- Creating separate feature folders (add to existing services-lib structure)

## Rules
- inline all endpoints in Program.cs (all endpoints register there)
- add new assessment services to libs/api/services-lib/ alongside existing ResumeAnalysisService, InterviewQuestionGeneratorService, CandidateMatchService, AssessmentService
- business rules belong in service domain classes, not endpoints
- contracts/DTOs (AssessmentDto, ResumeDto, JobDescriptionDto, InterviewQuestionDto) live adjacent to service classes
- validation required at service/domain layer (resume format, job description validation, candidate scoring bounds)
- health/readiness patterns must be preserved
- update service tests in libs/api/services-lib-test/ with every backend change
- keep services focused and composable (orchestration services call domain services)
- **Dependency Injection Requirements:**
  - Register service implementations in ServiceCollectionExtensions.cs AddServices() method
  - When a service depends on concrete types (e.g., CandidateMatchService depends on ResumeAnalysisService), register both:
    1. Register concrete class: `services.AddTransient<ConcreteService>()`
    2. Register interface: `services.AddTransient<IInterface, ConcreteService>()`
  - When service needs HttpClient, use: `services.AddHttpClient<IService, ServiceImpl>()`
  - Services with dependencies must declare them in constructor parameters, DI container will inject automatically
  - Test all service instantiation by running `dotnet build` after registration changes
- **Configuration & Secrets:**
  - Configuration accessed via IConfiguration constructor injection
  - Secrets (API keys, connection strings) loaded from appsettings.json or environment variables
  - Pass IConfiguration to ServiceCollectionExtensions via Program.cs: `builder.Services.AddServices(builder.Configuration)`

## Required output
Return:
1. files created/updated
   - Service files (with constructor showing dependencies)
   - DTO/Contract files
   - Interface files (if new domain concept)
   - ServiceCollectionExtensions.cs updates (DI registration)
2. DI registration summary (what was registered, in what scope - Transient/Scoped/Singleton)
3. endpoint summary (route, method, payload, response)
4. request/response contracts (DTO)
5. validation rules added (where validation occurs)
6. dependency graph (what depends on what - helps debug runtime errors)
7. tests added (unit tests for domain/application logic)
8. build verification (confirm `dotnet build` passes)
9. follow-up items

## Endpoint patterns
- Use minimal APIs (app.MapGet, app.MapPost)
- Keep endpoints thin: validate input → call service → return result
- All endpoints registered in apps/api-app/Program.cs
- Group related endpoints together in Program.cs by domain
- No separate infrastructure layer (all services in libs/api/services-lib/)
- Do NOT update docs/ folder unless explicitly asked

## Done criteria
- build passes
- tests pass
- contracts generated
- docs/registers updated if needed
