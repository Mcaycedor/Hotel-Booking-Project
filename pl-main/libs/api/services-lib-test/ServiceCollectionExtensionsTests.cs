using Gen.StarterApp.Api.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using NUnit.Framework;

namespace Gen.StarterApp.Services.Test;

[TestFixture]
public class ServiceCollectionExtensionsTests
{
  [Test]
  public void AddServices_RegistersGreetingService()
  {
    // Arrange
    var services = new ServiceCollection();
    var config = new ConfigurationBuilder().Build();

    // Act
    services.AddServices(config);
    var serviceProvider = services.BuildServiceProvider();
    var greetingService = serviceProvider.GetService<IGreetingService>();

    // Assert
    Assert.That(greetingService, Is.Not.Null);
    Assert.That(greetingService, Is.TypeOf<GreetingService>());
  }

  [Test]
  public void AddServices_ReturnsServiceCollection()
  {
    // Arrange
    var services = new ServiceCollection();
    var config = new ConfigurationBuilder().Build();

    // Act
    var result = services.AddServices(config);

    // Assert
    Assert.That(result, Is.SameAs(services));
  }
}
