using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using NUnit.Framework;
using Gen.StarterApp.Api.Services;
using Gen.StarterApp.Services;

namespace Gen.StarterApp.Api.Tests
{
  /// <summary>
  /// Unit tests for Program class and application configuration
  /// </summary>
  [TestFixture]
  public class ProgramUnitTests
  {
    [Test]
    public void AddServices_RegistersGreetingService()
    {
      var builder = WebApplication.CreateBuilder();

      Program.AddServices(builder);

      var descriptor = builder.Services.FirstOrDefault(s => s.ServiceType == typeof(IGreetingService));
      Assert.That(descriptor, Is.Not.Null, "IGreetingService should be registered");
    }

    [Test]
    public void AddServices_RegistersAssessmentService()
    {
      var builder = WebApplication.CreateBuilder();

      Program.AddServices(builder);

      var descriptor = builder.Services.FirstOrDefault(s => s.ServiceType == typeof(AssessmentService));
      Assert.That(descriptor, Is.Not.Null, "AssessmentService should be registered");
    }

    [Test]
    public void AddServices_RegistersResumeAnalysisService()
    {
      var builder = WebApplication.CreateBuilder();

      Program.AddServices(builder);

      var descriptor = builder.Services.FirstOrDefault(s => s.ServiceType == typeof(ResumeAnalysisService));
      Assert.That(descriptor, Is.Not.Null, "ResumeAnalysisService should be registered");
    }

    [Test]
    public void AddMiddleware_AddsAPIMiddleware()
    {
      var builder = WebApplication.CreateBuilder();
      var app = builder.Build();

      Program.AddMiddleware(app);

      var appBuilder = (IApplicationBuilder)app;
      Assert.That(appBuilder.Properties.ContainsKey(WebApplicationExtensionKeys.MiddlewareAdded), Is.True, "API middleware should be added to the application");
      Assert.That(appBuilder.Properties[WebApplicationExtensionKeys.MiddlewareAdded], Is.True, "API middleware property should be set to true");
    }

    [Test]
    public void MapEndpoints_MapsAPIEndpoints()
    {
      var builder = WebApplication.CreateBuilder();
      Program.AddServices(builder);
      var app = builder.Build();

      Program.MapEndpoints(app);

      var appBuilder = (IApplicationBuilder)app;
      Assert.That(appBuilder.Properties.ContainsKey(WebApplicationExtensionKeys.EndpointsMapped), Is.True, "API endpoints should be mapped in the application");
      Assert.That(appBuilder.Properties[WebApplicationExtensionKeys.EndpointsMapped], Is.True, "API endpoints mapped property should be set to true");
    }
  }
}

