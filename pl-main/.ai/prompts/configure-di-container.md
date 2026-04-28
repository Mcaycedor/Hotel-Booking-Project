---
id: 3a-configure-di-container.v1
owner: platform
agent: backend-agent
purpose: Configure ASP.NET Core dependency injection container for services
version: SUPPLEMENT - Run after implementing services if build fails with "Unable to resolve service"
inputs:
  - list of services to register
  - dependencies for each service
outputs:
  - ServiceCollectionExtensions.cs updated
  - Program.cs verified correct
  - dotnet build passes
---

You are the backend-agent.

Task:
Configure the ASP.NET Core dependency injection (DI) container to register all services and their dependencies.

This step is needed when you see errors like:
```
Unable to resolve service for type 'X' while attempting to activate 'Y'
```

## DI Container Configuration Checklist

### 1. Identify All Services to Register
From your implementation, list:
- Concrete services (plain C# classes)
- Interface-based services
- Services needing HttpClient
- Services depending on IConfiguration

### 2. Audit Dependencies
For each service, determine:
- Constructor parameters (what does it need?)
- Are parameters concrete classes or interfaces?
- Does it need HttpClient?
- Does it need IConfiguration?
- Does it need ILogger<T>?

Example dependency audit:
```
HtmlContentExtractorService
  ├─ HttpClient (provided by AddHttpClient)
  └─ ILogger<HtmlContentExtractorService> (automatic via framework)

CandidateMatchService
  ├─ ResumeAnalysisService (concrete class - must register)
  └─ (none)

AssessmentService
  └─ ILogger<AssessmentService> (automatic)
```

### 3. Register in ServiceCollectionExtensions.cs

**DO THIS IN ORDER:**

1. **Register concrete service classes FIRST** (services needed by other services):
   ```csharp
   services.AddTransient<ResumeAnalysisService>();      // 1st
   services.AddTransient<InterviewQuestionGeneratorService>();  // 2nd
   services.AddTransient<CandidateMatchService>();      // 3rd
   ```

2. **Register HttpClient services**:
   ```csharp
   services.AddHttpClient<IHtmlContentExtractorService, HtmlContentExtractorService>();
   services.AddHttpClient<InterviewQuestionGeneratorService>();  // if needs HttpClient directly
   ```

3. **Register interface-based services**:
   ```csharp
   services.AddTransient<IAssessmentService, AssessmentService>();
   services.AddTransient<IResumeAnalysisService, ResumeAnalysisService>();
   ```

**Example complete registration:**
```csharp
public static IServiceCollection AddServices(this IServiceCollection services, IConfiguration configuration)
{
    // Step 1: Register concrete classes (needed as dependencies)
    services.AddTransient<ResumeAnalysisService>();
    services.AddTransient<InterviewQuestionGeneratorService>();
    services.AddTransient<CandidateMatchService>();
    
    // Step 2: Register HttpClient services
    services.AddHttpClient<IHtmlContentExtractorService, HtmlContentExtractorService>();
    
    // Step 3: Register interface-based services
    services.AddTransient<IResumeAnalysisService, ResumeAnalysisService>();
    services.AddTransient<IInterviewQuestionGeneratorService, InterviewQuestionGeneratorService>();
    services.AddTransient<ICandidateMatchService, CandidateMatchService>();
    services.AddTransient<IAssessmentService, AssessmentService>();
    
    // Database, logging, etc.
    // ... rest of configuration
    
    return services;
}
```

### 4. Verify Program.cs Passes IConfiguration

In `Program.cs AddServices()` method, ensure:
```csharp
public static void AddServices(WebApplicationBuilder builder)
{
    // ← MUST pass builder.Configuration
    builder.Services.AddServices(builder.Configuration);
    
    // ... rest of Program setup
}
```

### 5. Verify Endpoints Use Proper Parameter Binding

In your endpoints, the DI container injects services automatically:
```csharp
app.MapPost("/api/assessments/create", async (
    CreateAssessmentRequest request,           // ← From request body
    AssessmentService service) =>              // ← Injected by DI
{
    return Results.Ok(await service.CreateAsync(request));
});
```

The framework sees `AssessmentService` parameter and injects the registered instance.

### 6. Debug Common DI Errors

**Error:** `Unable to resolve service for type 'X' while attempting to activate 'Y'`
- **Cause:** Y depends on X, but X not registered
- **Fix:** Register X in ServiceCollectionExtensions
- **Example:** CandidateMatchService depends on ResumeAnalysisService
  ```csharp
  services.AddTransient<ResumeAnalysisService>();      // Register first
  services.AddTransient<CandidateMatchService>();      // Then register dependent
  ```

**Error:** `No argument given that corresponds to required parameter 'configuration'`
- **Cause:** AddServices() called without IConfiguration parameter
- **Fix:** In Program.cs, pass configuration:
  ```csharp
  builder.Services.AddServices(builder.Configuration);  // ← Add this
  ```

**Error:** `There is no argument given for required parameter 'httpClient'`
- **Cause:** Service needs HttpClient but used wrong registration method
- **Fix:** Use AddHttpClient registration:
  ```csharp
  // WRONG:
  services.AddTransient<HtmlExtractor>();
  
  // CORRECT:
  services.AddHttpClient<IHtmlContentExtractorService, HtmlContentExtractorService>();
  ```

**Error:** Service constructor has Parameter of type 'IService' but implementation doesn't exist
- **Cause:** Registered concrete class but requesting interface
- **Fix:** Register both:
  ```csharp
  services.AddTransient<MyService>();                    // Concrete
  services.AddTransient<IMyService, MyService>();        // Interface
  ```

### 7. Test Registration by Building

```bash
cd c:\dev\profiler
dotnet build
```

If any DI errors exist, build will fail with clear error messages pointing to the service that can't be resolved.

### 8. Service Lifetimes

Use the correct lifetime for each service:
- **AddTransient:** New instance every time (good for stateless services) ← DEFAULT
- **AddScoped:** One instance per HTTP request
- **AddSingleton:** One instance for entire application lifetime

For assessment services, use **Transient** unless you have state/caching requirements.

## Output Checklist

- [ ] All concrete service classes registered
- [ ] Concrete classes registered before services that depend on them
- [ ] Interface registrations reference correct implementations
- [ ] HttpClient registrations use AddHttpClient<>()
- [ ] IConfiguration passed to AddServices() in Program.cs
- [ ] Endpoint parameters properly injected
- [ ] `dotnet build` passes with zero DI errors
- [ ] Verified at least one endpoint calls a service (confirms DI works)
