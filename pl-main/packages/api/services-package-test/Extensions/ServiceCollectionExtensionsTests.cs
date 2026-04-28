using Microsoft.Extensions.DependencyInjection;
using NUnit.Framework;
using Microsoft.AspNetCore.Mvc.ApiExplorer;
using Asp.Versioning;

namespace Gen.Platform.Services.Tests
{
  [TestFixture]
  public class ServiceCollectionExtensionsTests
  {
    [Test]
    public void AddGenPlatformServices_ReturnsSameServiceCollection()
    {
      var services = new ServiceCollection();

      var result = services.AddGenPlatformServices("Test API", new string[0]);

      Assert.That(result, Is.SameAs(services), "AddGenPlatformServices should return the same IServiceCollection instance");
    }

    [Test]
    public void AddGenPlatformServices_CallsAddApiVersioning()
    {
      var services = new ServiceCollection();

      services.AddGenPlatformServices("Test API", new string[0]);

      // Assert

    }

    [Test]
    public void AddGenPlatformServices_RegistersApiExplorer()
    {
      var services = new ServiceCollection();

      services.AddGenPlatformServices("Test API", new string[0]);

      var apiExplorerService = services.FirstOrDefault(s => s.ServiceType == typeof(IApiDescriptionGroupCollectionProvider));
      Assert.That(apiExplorerService, Is.Not.Null, "AddGenPlatformServices should register API Explorer services");
      Assert.That(apiExplorerService!.Lifetime, Is.EqualTo(ServiceLifetime.Singleton), "API Explorer should be registered as Singleton");
    }

    [Test]
    public void AddGenPlatformServices_CallsAddHealthChecks()
    {
      var services = new ServiceCollection();

      services.AddGenPlatformServices("Test API", new string[0]);

      // Assert

    }

    [Test]
    public void AddGenPlatformServices_CallsAddSwagger()
    {
      var services = new ServiceCollection();

      services.AddGenPlatformServices("Test API", new string[0]);

      // Assert

    }
  }
}
