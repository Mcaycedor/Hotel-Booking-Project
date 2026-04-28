using Gen.StarterApp.Services;
using Gen.StarterApp.Services.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Gen.StarterApp.Api.Services;

/// <summary>
/// Extension methods for IServiceCollection.
/// </summary>
public static class ServiceCollectionExtensions
{
  /// <summary>
  /// Adds Starter App API services to the service collection.
  /// </summary>
  /// <param name="services">The service collection.</param>
  /// <param name="configuration">The application configuration.</param>
  /// <returns>The service collection for chaining.</returns>
  public static IServiceCollection AddServices(this IServiceCollection services, IConfiguration configuration)
  {
    // Register greeting service
    services.AddTransient<IGreetingService, GreetingService>();

    // Register Entity Framework Core with SQL Server
    var connectionString = configuration.GetConnectionString("DefaultConnection");
    services.AddDbContext<ApplicationDbContext>(options =>
        options.UseSqlServer(connectionString)
    );

    // Register concrete service classes (needed for dependency injection of concrete types)
    services.AddTransient<ResumeAnalysisService>();
    services.AddTransient<InterviewQuestionGeneratorService>();
    services.AddTransient<CandidateMatchService>();

    // Register HttpClient for OpenAI integration
    services.AddHttpClient<InterviewQuestionGeneratorService>();

    // Register HttpClient for HTML content extraction
    services.AddHttpClient<IHtmlContentExtractorService, HtmlContentExtractorService>();

    // Register assessment services with interfaces
    services.AddTransient<IResumeAnalysisService, ResumeAnalysisService>();
    services.AddTransient<IInterviewQuestionGeneratorService, InterviewQuestionGeneratorService>();
    services.AddTransient<ICandidateMatchService, CandidateMatchService>();
    services.AddTransient<IAssessmentService, AssessmentService>();

    return services;
  }
}
