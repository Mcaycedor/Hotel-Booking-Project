using Gen.StarterApp.Api.Services;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using NUnit.Framework;

namespace Gen.StarterApp.Services.Test;

[TestFixture]
public class WebApplicationExtensionsTests
{
  [Test]
  public void AddMiddleware_ReturnsWebApplication()
  {
    // Arrange
    var builder = WebApplication.CreateBuilder();
    var app = builder.Build();

    // Act
    var result = app.AddMiddleware();

    // Assert
    Assert.That(result, Is.SameAs(app));
  }

  [Test]
  public void MapEndpoints_ReturnsWebApplication()
  {
    // Arrange
    var builder = WebApplication.CreateBuilder();
    var config = new ConfigurationBuilder().Build();
    builder.Services.AddServices(config);
    var app = builder.Build();

    // Act
    var result = app.MapEndpoints();

    // Assert
    Assert.That(result, Is.SameAs(app));
  }
}

