using Microsoft.AspNetCore.Builder;
using NUnit.Framework;

namespace Gen.Platform.Services.Tests
{
  [TestFixture]
  public class ApplicationBuilderExtensionsTests
  {
    [Test]
    public void AddGenPlatformMiddleware_ReturnsSameApplicationBuilder()
    {
      // Arrange
      var builder = WebApplication.CreateBuilder();
      var app = builder.Build();

      // Act
      var result = app.AddGenPlatformMiddleware("Test API", new string[0]);

      // Assert
      Assert.That(result, Is.SameAs(app), "AddGenPlatformMiddleware should return the same IApplicationBuilder instance");
    }

    [Test]
    public void AddGenPlatformMiddleware_ReportsMiddlewareAdded()
    {
      // Arrange
      var builder = WebApplication.CreateBuilder();
      var app = builder.Build();

      // Act
      app.AddGenPlatformMiddleware("Test API", new string[0]);

      // Assert
      var appBuilder = (IApplicationBuilder)app;
      Assert.That(appBuilder.Properties.ContainsKey(ApplicationBuilderExtensionKeys.MiddlewareAdded), Is.True, "AddGenPlatformMiddleware should report middleware added");
      Assert.That(appBuilder.Properties[ApplicationBuilderExtensionKeys.MiddlewareAdded], Is.True, "MiddlewareAdded property should be true");
    }

    [Test]
    public void AddGenPlatformMiddleware_CallsUseSwagger()
    {
      // Arrange
      var builder = WebApplication.CreateBuilder();
      var app = builder.Build();

      // Act
      app.AddGenPlatformMiddleware("Test API", new string[0]);

      // Assert
      var appBuilder = (IApplicationBuilder)app;
      Assert.That(appBuilder.Properties.ContainsKey(ApplicationBuilderExtensionKeys.SwaggerMiddlewareAdded), Is.True, "AddGenPlatformMiddleware should call UseSwagger");
      Assert.That(appBuilder.Properties[ApplicationBuilderExtensionKeys.SwaggerMiddlewareAdded], Is.True, "UseSwagger should set SwaggerMiddlewareAdded property");
    }

    [Test]
    public void AddGenPlatformMiddleware_CallsUseSwaggerUI()
    {
      // Arrange
      var builder = WebApplication.CreateBuilder();
      var app = builder.Build();

      // Act
      app.AddGenPlatformMiddleware("Test API", new string[0]);

      // Assert
      var appBuilder = (IApplicationBuilder)app;
      Assert.That(appBuilder.Properties.ContainsKey(ApplicationBuilderExtensionKeys.SwaggerUIMiddlewareAdded), Is.True, "AddGenPlatformMiddleware should call UseSwaggerUI");
      Assert.That(appBuilder.Properties[ApplicationBuilderExtensionKeys.SwaggerUIMiddlewareAdded], Is.True, "UseSwaggerUI should set SwaggerUIMiddlewareAdded property");
    }

    [Test]
    public void MapGenPlatformEndpoints_ReturnsSameApplicationBuilder()
    {
      // Arrange
      var builder = WebApplication.CreateBuilder();
      var app = builder.Build();

      // Act
      var result = app.MapGenPlatformEndpoints(new string[0]);

      // Assert
      Assert.That(result, Is.SameAs(app), "MapGenPlatformEndpoints should return the same IApplicationBuilder instance");
    }

    [Test]
    public void MapGenPlatformEndpoints_ReportsEndpointsMapped()
    {
      // Arrange
      var builder = WebApplication.CreateBuilder();
      var app = builder.Build();

      // Act
      app.MapGenPlatformEndpoints(new string[0]);

      // Assert
      var appBuilder = (IApplicationBuilder)app;
      Assert.That(appBuilder.Properties.ContainsKey(ApplicationBuilderExtensionKeys.EndpointsMapped), Is.True, "MapGenPlatformEndpoints should report endpoints mapped");
      Assert.That(appBuilder.Properties[ApplicationBuilderExtensionKeys.EndpointsMapped], Is.True, "EndpointsMapped property should be true");
    }

    [Test]
    public void MapGenPlatformEndpoints_CallsMapHealthCheckEndpoints()
    {
      // Arrange
      var builder = WebApplication.CreateBuilder();
      var app = builder.Build();

      // Act
      app.MapGenPlatformEndpoints(new string[0]);

      // Assert
      var appBuilder = (IApplicationBuilder)app;
      Assert.That(appBuilder.Properties.ContainsKey(ApplicationBuilderExtensionKeys.HealthCheckEndpointsMapped), Is.True, "MapGenPlatformEndpoints should call MapHealthCheckEndpoints");
      Assert.That(appBuilder.Properties[ApplicationBuilderExtensionKeys.HealthCheckEndpointsMapped], Is.True, "MapHealthCheckEndpoints should set HealthCheckEndpointsMapped property");
    }

    [Test]
    public void MapGenPlatformEndpoints_CallsMapGreetingEndpoints()
    {
      // Arrange
      var builder = WebApplication.CreateBuilder();
      var app = builder.Build();

      // Act
      app.MapGenPlatformEndpoints(new string[0]);

      // Assert
      var appBuilder = (IApplicationBuilder)app;
      Assert.That(appBuilder.Properties.ContainsKey(ApplicationBuilderExtensionKeys.GreetingEndpointsMapped), Is.True, "MapGenPlatformEndpoints should call MapGreetingEndpoints");
      Assert.That(appBuilder.Properties[ApplicationBuilderExtensionKeys.GreetingEndpointsMapped], Is.True, "MapGreetingEndpoints should set GreetingEndpointsMapped property");
    }
  }
}
