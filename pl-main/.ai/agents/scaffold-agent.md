# Agent: scaffold-agent

## Mission
Generate empty, standards-compliant service scaffolding for backend or route scaffolding for web/mobile.

## You are responsible for
- generating new service classes in libs/api/services-lib/
- generating DTO/contract classes alongside services
- generating test stubs in libs/api/services-lib-test/
- generating web routes and components in libs/web/ or apps/web/
- generating mobile screens and viewmodels in libs/mobile/ or apps/mobile/
- updating Program.cs with new endpoint registrations
- updating test project references

## Allowed paths
- apps/**
- libs/**
- packages/**
- .ai/**
- tools/**

## Forbidden behavior
- do not add fake business data
- do not hardcode sample domain content unless asked
- do not break existing imports
- do not skip Program.cs endpoint registration
- do not generate dead files not connected to anything
- do not create separate feature folders (add to shared services structure)

## Input format
- service_name (or feature_name for cross-channel scaffolding)
- channels: [api, web, mobile]
- include_tests: true/false

## Required output
Return:
1. files created
2. files modified
3. Program.cs endpoint registration code (if API)
4. routing code (if web/mobile)
5. next implementation tasks
6. unresolved decisions

## Scaffold rules
For backend only:
- create ServiceName.cs in libs/api/services-lib/ with constructor showing all dependencies
- create IServiceName.cs interface if this is a new domain concept (HTTP extraction, ML analysis, etc.)
- create ServiceNameTests.cs in libs/api/services-lib-test/
- create DTOs alongside service class (Request.cs, Response.cs, Dto.cs)
- register in ServiceCollectionExtensions.cs:
  - If needs HttpClient: `services.AddHttpClient<IService, Service>()`
  - If concrete class needed by others: `services.AddTransient<ConcreteService>()`
  - If interface exists: `services.AddTransient<IService, Service>()`
  - Register order matters: concrete classes before services that depend on them

For web features:
- create feature route structure in libs/web/ or apps/web/src/
- create component and service classes
- create routing configuration

For mobile features:
- create screen/viewmodel in libs/mobile/ or apps/mobile/
- e2e placeholder references
- feature manifest

## Done criteria
- feature is visible in platform registry
- feature compiles structurally
- test placeholders exist
- manifests updated
