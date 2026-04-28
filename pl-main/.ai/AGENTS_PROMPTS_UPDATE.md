# Agents & Prompts Update - Job Description URL Feature

**Date:** March 30, 2026  
**Feature:** Accept job description links and fetch content from HTML pages  
**Status:** ✅ Agents & Prompts Updated to Automate Implementation

---

## Overview

The prompts and agents system has been updated to capture all steps required to implement the job description URL feature. This ensures future features can be implemented end-to-end without manual debugging of dependency injection, service registration, or build errors.

---

## Changes Made

### 1. Updated `backend-agent.md`

**Added:** Comprehensive DI configuration requirements section

**New Rules Added:**
- Service implementation details (constructor dependencies)
- DI registration patterns for concrete vs. interface-based services
- HttpClient factory registration for HTTP-dependent services
- Configuration & secrets handling
- Pattern for testing service instantiation with `dotnet build`

**Key Addition:**
```markdown
- **Dependency Injection Requirements:**
  - Register service implementations in ServiceCollectionExtensions.cs AddServices() method
  - When a service depends on concrete types, register both concrete and interface
  - When service needs HttpClient, use: services.AddHttpClient<IService, ServiceImpl>()
  - Services with dependencies must declare them in constructor parameters
  - Test all service instantiation by running `dotnet build`
```

### 2. Updated `implement-feature-backend.md` → **Version 2**

**Major Expansion:** 7-step implementation process with DI focus

**Added:**
- **Step 1:** Audit Service Dependencies (dependency graph)
- **Step 2:** Create Service Classes (with constructor dependencies)
- **Step 3:** Register Services in ServiceCollectionExtensions.cs
- **Step 4:** Verify Program.cs Configuration Passing
- **Step 5:** Create/Update API Endpoints
- **Step 6:** Create Tests
- **Step 7:** Build and Verify
- **Step 8:** Document for Frontend Teams

**Added:** Comprehensive debugging section with common errors and fixes:
- "No argument given for required parameter 'configuration'"
- "'ServiceName' does not contain a definition for property"
- "Unable to resolve service for type 'ServiceX'"
- "'HttpContent' does not contain definition 'ReadAsAsync'"
- "No overload for method 'StatusCode' takes 2 arguments"

**Added:** Output checklist with 14 verification items ensuring all steps completed

**Value:** Future backend implementations will know exactly what to do instead of discovering DI errors manually

### 3. New Prompt: `configure-di-container.md`

**Purpose:** Optional troubleshooting prompt for DI configuration

**Location:** `.ai/prompts/3a-configure-di-container.md`

**Use Case:** When Step 3 build fails with DI-related errors

**Contains:**
- Service dependency auditing checklist
- Step-by-step DI container registration process
- Registration order requirements (concrete first, then dependents)
- Example complete registration
- Debug guide for common DI errors
- Service lifetime explanations (Transient/Scoped/Singleton)

### 4. Updated `scaffold-agent.md`

**Added:** Service registration requirements to backend scaffolding rules

**New Rules for Backend Scaffolding:**
```markdown
- create ServiceName.cs in libs/api/services-lib/ with constructor showing all dependencies
- create IServiceName.cs interface if this is a new domain concept
- create ServiceNameTests.cs in libs/api/services-lib-test/
- create DTOs alongside service class
- register in ServiceCollectionExtensions.cs:
  - If needs HttpClient: services.AddHttpClient<IService, Service>()
  - If concrete class needed by others: services.AddTransient<ConcreteService>()
  - If interface exists: services.AddTransient<IService, Service>()
  - Register order matters: concrete classes before services that depend on them
```

### 5. Updated `web-agent.md`

**Added:** Dual-mode feature implementation patterns

**New Rule for Web:**
```markdown
**For dual-mode features** (text input + URL input modes):
- Create component with mode selector (radio button or toggle)
- Conditional rendering for input section (textarea vs URL input field)
- Call appropriate backend endpoint based on mode:
  - Text mode: POST /api/assessments/create with JobDescription text
  - URL mode: POST /api/assessments/create-from-url with JobDescriptionUrl
- Client-side URL validation before sending to server
- Server-side validation errors handled with user feedback
- Example: JobDescriptionComponent with inputMode: 'text' | 'url' property
```

**Value:** Future web developers know how to structure components that support both input modes

### 6. Updated `WORKFLOW.md`

**Added:** Reference to optional DI configuration prompt

**New Note in Step 3:**
```markdown
⚠️ If Build Fails: Use `3a-configure-di-container` prompt to resolve dependency injection errors
```

**Value:** Developers know exactly which prompt to use if DI fails

### 7. Updated `PROMPTS_INDEX.md`

**Added:** Optional prompts section with new DI configuration prompt

```markdown
| `3a-configure-di-container` | backend-agent | After step 3, if `dotnet build` fails with "Unable to resolve service" |
```

**Value:** Central index shows all available prompts and when to use them

---

## How to Use Updated System to Recreate App from Scratch

### For Initial Build (Complete Assessment App):

```
1️⃣  1-brainstorm-feature        → Define feature
2️⃣  2-write-plan               → Create implementation plan  
3️⃣  3-implement-feature-backend → Build services
    ⚠️  If build fails: Use 3a-configure-di-container
4️⃣  4-implement-feature-web    → Build Angular UI
5️⃣  5-implement-feature-mobile → Build Flutter UI
6️⃣  6-add-tests               → Add test coverage
7️⃣  7-review-change           → Final approval
```

### For New Features:

Same sequence but focused on the new feature's services, endpoints, and UI components.

---

## Key Takeaways

### What Was Learned

1. **Service Dependencies Matter**
   - Services depending on concrete types must have those types registered first
   - Order of registration in DI container is critical

2. **HttpClient Requires Special Handling**
   - Use `AddHttpClient<IService, ServiceImpl>()` not regular `AddTransient()`
   - This ensures HttpClient factory injection works correctly

3. **Configuration Must Be Passed Through**
   - Program.cs must pass `builder.Configuration` to `AddServices()`
   - Services accessing config need `IConfiguration` injected

4. **Build Verification is Critical**
   - `dotnet build` catches all DI errors immediately
   - Should be run after any service registration changes

### Documentation Improvements

**Before:** Backend implementation prompt assumed DI was obvious; developers had to debug manually

**After:** 
- Step-by-step DI instructions in `implement-feature-backend`
- Optional dedicated `configure-di-container` prompt for troubleshooting
- Updated `backend-agent` with explicit DI requirements
- Web-agent knows about dual-mode component patterns
- Scaffold-agent includes service registration in scaffolding rules

---

## Files Modified

| File | Changes |
|------|---------|
| `.ai/agents/backend-agent.md` | Added comprehensive DI requirements section, updated output checklist |
| `.ai/agents/scaffold-agent.md` | Added service registration requirements |
| `.ai/agents/web-agent.md` | Added dual-mode feature implementation patterns |
| `.ai/prompts/implement-feature-backend.md` | Upgraded from v1 to v2, added 8-step process with DI focus |
| `.ai/prompts/configure-di-container.md` | **NEW** - Optional troubleshooting prompt for DI |
| `.ai/WORKFLOW.md` | Added reference to optional `3a-configure-di-container` |
| `.ai/PROMPTS_INDEX.md` | Added optional prompts section with DI configuration |

**Total:** 7 files updated/created

---

## Next Steps for Using Updated System

To test the updated agents and prompts:

1. **Run Step 3 with New Prompt:**
   - Use the updated `implement-feature-backend.md` version 2
   - Follow the 8-step process
   - If build fails, use `configure-di-container.md`

2. **Run Step 4 with Web-Agent Rules:**
   - Use updated `web-agent.md`
   - Build dual-mode job description component
   - Call both `/api/assessments/create` and `/api/assessments/create-from-url`

3. **Verify Build Passes:**
   ```bash
   cd c:\dev\profiler
   dotnet build  # Should pass with no DI errors
   ```

4. **Run Backend:**
   ```bash
   cd apps\api-app
   dotnet run    # Should start without dependency resolution errors
   ```

---

## Future Feature Implementation

When implementing any future feature:

1. Review the updated `backend-agent.md` to understand DI requirements
2. Follow `implement-feature-backend.md` version 2 step-by-step
3. If DI fails, immediately run `configure-di-container.md` prompt
4. Don't proceed to frontend until `dotnet build` and `dotnet run` succeed
5. Frontend teams use updated `web-agent.md` for proper component structure

---

**Status:** ✅ Agents and prompts updated to automate job description URL feature implementation  
**Ready:** Yes - Can now recreate entire app from scratch using 7-step workflow with proper DI configuration

