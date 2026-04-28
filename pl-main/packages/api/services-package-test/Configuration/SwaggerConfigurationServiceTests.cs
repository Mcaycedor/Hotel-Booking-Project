using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using NUnit.Framework;
using Gen.Platform.Configuration;

namespace Gen.Platform.Tests
{
  /// <summary>
  /// Unit tests for SwaggerConfigurationService
  /// </summary>
  [TestFixture]
  public class SwaggerConfigurationServiceTests
  {
    [Test]
    public void AddServices_RegistersSwaggerGen()
    {
      // Arrange
      var services = new ServiceCollection();

      // Act
      SwaggerConfigurationService.AddServices(services, "Test API", "v1");

      // Assert - Verify Swagger services are registered by checking for typical service types
      var hasSwaggerServices = services.Any(s =>
        s.ServiceType.FullName?.Contains("Swagger", StringComparison.OrdinalIgnoreCase) ?? false);

      Assert.That(hasSwaggerServices, Is.True, "Swagger services should be registered");
    }

    [Test]
    public void AddServices_RegistersEndpointsApiExplorer()
    {
      // Arrange
      var services = new ServiceCollection();

      // Act
      SwaggerConfigurationService.AddServices(services, "Test API", "v1");

      // Assert
      var apiExplorer = services.FirstOrDefault(s =>
        s.ServiceType == typeof(Microsoft.AspNetCore.Mvc.ApiExplorer.IApiDescriptionGroupCollectionProvider));
      Assert.That(apiExplorer, Is.Not.Null, "EndpointsApiExplorer should be registered");
    }

    [TestCase(true, false, TestName = "AddMiddleware_Development_DoesNotThrow")]
    [TestCase(false, false, TestName = "AddMiddleware_Production_DoesNotThrow")]
    [TestCase(false, true, TestName = "AddMiddleware_ProductionWithGenerateSwagger_DoesNotThrow")]
    [TestCase(true, true, TestName = "AddMiddleware_DevelopmentWithGenerateSwagger_DoesNotThrow")]
    public void AddMiddleware_VariousEnvironments_DoesNotThrow(
      bool isDevelopment,
      bool enableGenerateSwagger)
    {
      // Arrange
      var builder = WebApplication.CreateBuilder();
      builder.Environment.EnvironmentName = isDevelopment ? Environments.Development : Environments.Production;

      if (enableGenerateSwagger)
      {
        builder.Configuration["GenerateSwagger"] = "true";
      }

      SwaggerConfigurationService.AddServices(builder.Services, "Test API", "v1");
      var app = builder.Build();

      // Act & Assert - Verify middleware configuration doesn't throw under various conditions
      Assert.DoesNotThrow(() => SwaggerConfigurationService.AddMiddleware(app, "Test API", "v1"));
    }
  }
}
