using Gen.StarterApp.Api.Services;

// Application Entry Point
var builder = WebApplication.CreateBuilder(args);

// Configure services
Program.AddServices(builder);

// Build application
var app = builder.Build();

// Configure middleware
Program.AddMiddleware(app);

// Map endpoints
Program.MapEndpoints(app);

// Start the application
await app.RunAsync();

/// <summary>
/// Partial Program class to organize application startup logic.
/// Declared as public partial to complement the compiler-generated class from top-level statements.
/// </summary>
public partial class Program
{
  private const string ApiTitle = "Starter App";

  // Protected constructor to satisfy CA1052 (Static holder types should be Static or NotInheritable)
  protected Program() { }

  /// <summary>
  /// Configures all application services
  /// </summary>
  public static void AddServices(WebApplicationBuilder builder)
  {
    // Register API services (assessment-specific)
    builder.Services.AddServices(builder.Configuration);

    // Add Swagger/Endpoints API Explorer
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen(options =>
    {
      options.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
      {
        Title = ApiTitle,
        Version = "v1"
      });
    });

    // Add health checks
    builder.Services.AddHealthChecks();
  }

  /// <summary>
  /// Configures all application middleware
  /// </summary>
  public static void AddMiddleware(WebApplication app)
  {
    if (app.Environment.IsDevelopment())
    {
      app.UseSwagger();
      app.UseSwaggerUI(options =>
      {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", $"{ApiTitle} v1");
        options.RoutePrefix = string.Empty;
      });
    }

    // Add assessment service middleware
    app.AddMiddleware();
  }

  /// <summary>
  /// Maps all application endpoints
  /// </summary>
  public static void MapEndpoints(WebApplication app)
  {
    app.MapHealthChecks("/health");

    // Map assessment-specific endpoints
    app.MapEndpoints();
  }
}
