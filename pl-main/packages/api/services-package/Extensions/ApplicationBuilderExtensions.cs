using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Routing;
using Microsoft.AspNetCore.Http;

namespace Gen.Platform.Services
{
  /// <summary>
  /// Keys for ApplicationBuilderExtensions properties
  /// </summary>
  public static class ApplicationBuilderExtensionKeys
  {
    /// <summary>
    /// Set when all GEN Platform middleware has been added
    /// </summary>
    public const string MiddlewareAdded = "GenPlatformMiddlewareAdded";

    /// <summary>
    /// Set when Swagger middleware has been added
    /// </summary>
    public const string SwaggerMiddlewareAdded = "SwaggerMiddlewareAdded";

    /// <summary>
    /// Set when Swagger UI middleware has been added
    /// </summary>
    public const string SwaggerUIMiddlewareAdded = "SwaggerUIMiddlewareAdded";

    /// <summary>
    /// Set when all GEN Platform endpoints have been mapped
    /// </summary>
    public const string EndpointsMapped = "GenPlatformEndpointsMapped";

    /// <summary>
    /// Set when Health Check endpoints have been mapped
    /// </summary>
    public const string HealthCheckEndpointsMapped = "HealthCheckEndpointsMapped";

    /// <summary>
    /// Set when Greeting endpoints have been mapped
    /// </summary>
    public const string GreetingEndpointsMapped = "GreetingEndpointsMapped";
  }

  /// <summary>
  /// Extension methods for configuring GEN Platform services
  /// </summary>
  public static class ApplicationBuilderExtensions
  {
    #region Middleware
    /// <summary>
    /// Configure GEN Platform middleware
    /// </summary>
    public static IApplicationBuilder AddGenPlatformMiddleware(this IApplicationBuilder app, string apiTitle, string[] versions)
    {
      app
        .UseSwagger(apiTitle, versions)
        .UseSwaggerUI(apiTitle, versions);

      app.Properties[ApplicationBuilderExtensionKeys.MiddlewareAdded] = true;

      return app;
    }

    // prettier-ignore
    private static IApplicationBuilder UseSwagger(this IApplicationBuilder app, string apiTitle, string[] versions) // NOSONAR csharpsquid:S1172 - some params are unused - WIP
    {
      // prettier-ignore
      // app.UseSwagger(); // NOSONAR csharpsquid:S125 - suggested code - WIP

      app.Properties[ApplicationBuilderExtensionKeys.SwaggerMiddlewareAdded] = true;

      return app;
    }

    // prettier-ignore
    private static IApplicationBuilder UseSwaggerUI(this IApplicationBuilder app, string apiTitle, string[] versions) // NOSONAR csharpsquid:S1172 - some params are unused - WIP
    {
      // prettier-ignore
      // app.UseSwaggerUI(); // NOSONAR csharpsquid:S125 - suggested code - WIP

      app.Properties[ApplicationBuilderExtensionKeys.SwaggerUIMiddlewareAdded] = true;

      return app;
    }

    #endregion

    #region Endpoints

    /// <summary>
    /// Maps all GEN Platform endpoints
    /// </summary>
    public static T MapGenPlatformEndpoints<T>(this T app, string[] versions) where T : IApplicationBuilder, IEndpointRouteBuilder
    {
      // NewApiVersionSet
      // build ApiVersionSet

      // Map GEN Platform endpoints 
      app
        .MapHealthCheckEndpoints(versions)
        .MapGreetingEndpoints(versions);

      app.Properties[ApplicationBuilderExtensionKeys.EndpointsMapped] = true;


      return app;
    }

    // prettier-ignore
    private static T MapHealthCheckEndpoints<T>(this T app, string[] versions) where T : IApplicationBuilder, IEndpointRouteBuilder // NOSONAR csharpsquid:S1172 - some params are unused - WIP
    {
      // More code needs to be implemented here

      app.Properties[ApplicationBuilderExtensionKeys.HealthCheckEndpointsMapped] = true;

      return app;
    }

    // prettier-ignore
    private static T MapGreetingEndpoints<T>(this T app, string[] versions) where T : IApplicationBuilder, IEndpointRouteBuilder // NOSONAR csharpsquid:S1172 - some params are unused - WIP
    {
      app.MapGet("/api/services/hello/{name}", (string name) =>
      {
        var greeting = Greeting.SayHello(name);
        return Results.Ok(new { message = greeting, timestamp = DateTime.UtcNow });
      })
      .WithOpenApi();

      app.Properties[ApplicationBuilderExtensionKeys.GreetingEndpointsMapped] = true;

      return app;
    }

    #endregion
  }
}
