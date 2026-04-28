---
id: 3-implement-feature-backend.v2
owner: platform
agent: backend-agent
purpose: Implement backend service and endpoints for a feature
version: REPEATABLE - Use this for every new backend domain/service
inputs:
  - feature_name
  - plan
  - contracts
outputs:
  - service classes created
  - endpoints
  - DI configuration
  - validation rules
  - tests
  - build verified
usage_order: '3rd - Use after 2-write-plan (can run parallel with web/mobile)'
---

You are the backend-agent.

Task:
Implement the backend service and endpoints for a feature, including full dependency injection setup and build verification.

Inputs:
- feature name: {{feature_name}}
- plan: {{plan}}
- contracts: {{contracts}}

## Implementation Steps (in order)

### Step 1: Audit Service Dependencies
Before creating services, determine the dependency graph:
- What services will you create?
- What do they depend on (other services, HttpClient, IConfiguration)?
- Are there circular dependencies?
- Which services are concrete (needed by other services) vs. interface-only?

Example from job-description-url feature:
```
HtmlContentExtractorService → depends on HttpClient, needed by AssessmentService
AssessmentService → depends on ILogger, optional on IHtmlContentExtractorService
CandidateMatchService → depends on ResumeAnalysisService (concrete)
```

### Step 2: Create Service Classes in libs/api/services-lib/
Create service files with explicit constructor dependencies showing what they need:
- Service.cs with business logic
- IService.cs interface (if new domain concept)
- DTOs alongside (Assessment.cs, Request.cs, Response.cs)

Ensure constructors declare all dependencies:
```csharp
public HtmlContentExtractorService(HttpClient httpClient, ILogger<HtmlContentExtractorService> logger)
{
    _httpClient = httpClient ?? throw new ArgumentNullException(nameof(httpClient));
    _logger = logger ?? throw new ArgumentNullException(nameof(logger));
}
```

### Step 3: Register Services in ServiceCollectionExtensions.cs
Update libs/api/services-lib/ServiceCollectionExtensions.cs AddServices() method:

**For concrete service classes needed by other services, register BEFORE their dependents:**
```csharp
services.AddTransient<ResumeAnalysisService>();     // Register concrete first
services.AddTransient<CandidateMatchService>();     // Then classes that depend on it
```

**For HttpClient-dependent services:**
```csharp
services.AddHttpClient<IHtmlContentExtractorService, HtmlContentExtractorService>();
```

**For services with interfaces:**
```csharp
services.AddTransient<IAssessmentService, AssessmentService>();
services.AddTransient<IResumeAnalysisService, ResumeAnalysisService>();
```

**Critical:** IConfiguration must be passed from Program.cs:
```csharp
// In Program.cs AddServices():
builder.Services.AddServices(builder.Configuration);
```

### Step 4: Add Service Registrations to Program.cs (if needed)
Usually ServiceCollectionExtensions.AddServices() handles this, but verify:
```csharp
public static void AddServices(WebApplicationBuilder builder)
{
    builder.Services.AddServices(builder.Configuration);  // ← Must pass IConfiguration
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen(...);
    builder.Services.AddHealthChecks();
}
```

### Step 5: Create/Update API Endpoints in Program.cs
Add endpoints with dependency injection via parameter binding:
```csharp
app.MapPost("/api/assessments/create", async (
    CreateAssessmentRequest request,
    AssessmentService assessmentService) =>  // ← DI injects automatically
{
    var assessment = await assessmentService.CreateAssessmentAsync(...);
    return Results.Ok(assessment);
})
.WithOpenApi()
.WithName("CreateAssessment");
```

The framework automatically resolves the service from DI container.

### Step 6: Create Tests in libs/api/services-lib-test/
For each service, add unit tests covering:
- Valid inputs (happy path)
- Invalid inputs (null, empty, out of range)
- Dependencies mocking if needed
- Error conditions

### Step 7: Build and Verify
```bash
cd c:\dev\profiler
dotnet build
```

Monitor for these common errors and fixes:

**Error:** "No argument given for required parameter 'configuration'"
- **Fix:** Pass IConfiguration to AddServices() in Program.cs

**Error:** "'ServiceName' does not contain a definition for property 'DependsOn'"
- **Fix:** Ensure property is defined on the DTO/service class

**Error:** "Unable to resolve service for type 'ServiceX'"
- **Fix:** Register ServiceX in ServiceCollectionExtensions.cs before the service that depends on it

**Error:** "'HttpContent' does not contain definition 'ReadAsAsync'"
- **Fix:** Use `ReadAsStringAsync()` then `JsonDocument.Parse()` instead (ReadAsAsync removed in .NET 6+)

**Error:** "No overload for method 'StatusCode' takes 2 arguments"
- **Fix:** Use `Results.Problem()` instead of `Results.StatusCode(500, object)`

### Step 8: Document for Frontend Teams
Provide endpoint specifications:
```
POST /api/assessments/create
- Request: CreateAssessmentRequest { ResumeText, JobDescription, QuestionCount }
- Response: Assessment { AssessmentId, InterviewQuestions[], MatchReport }

POST /api/assessments/create-from-url
- Request: CreateAssessmentRequest { ResumeText, JobDescriptionUrl, QuestionCount }
- Response: Assessment { AssessmentId, InterviewQuestions[], MatchReport, JobDescriptionSourceUrl }
```

## Output Checklist

- [ ] Service classes created with explicit constructor dependencies documented
- [ ] DTOs created alongside services
- [ ] Interfaces created for new domain concepts
- [ ] ServiceCollectionExtensions.cs updated with all service registrations
- [ ] Concrete services registered before their dependents
- [ ] HttpClient registrations added for services that need it
- [ ] IConfiguration passed from Program.cs to AddServices()
- [ ] API endpoints added with correct dependency parameter binding
- [ ] Validation logic in service layer (not endpoints)
- [ ] Unit tests added to libs/api/services-lib-test/
- [ ] `dotnet build` passes with zero errors
- [ ] Endpoint summary documented for frontend teams
- [ ] Dependency graph documented (what depends on what)
- [ ] Known configuration requirements documented (env vars, secrets, etc.)

## If Build Fails

Debug in this order:
1. Check DI container registrations in ServiceCollectionExtensions.cs
2. Verify concrete services registered before services that depend on them
3. Confirm IConfiguration passed to AddServices(builder.Configuration)
4. Review constructor signatures - all dependencies must be injectable types
5. Check for .NET version compatibility (ReadAsAsync removed in .NET 6+)
6. Run `dotnet build` and read full error messages carefully
7. Inspect ServiceCollectionExtensions.cs for registration order issues
