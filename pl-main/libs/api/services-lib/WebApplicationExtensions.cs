using Gen.StarterApp.Services;
using Gen.StarterApp.Services.Dtos;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;

namespace Gen.StarterApp.Api.Services;

/// <summary>
/// Keys for ApplicationBuilderExtensions properties
/// </summary>
public static class WebApplicationExtensionKeys
{
  /// <summary>
  /// Set when all API middleware has been added
  /// </summary>
  public const string MiddlewareAdded = "APIMiddlewareAdded";

  /// <summary>
  /// Set when all API endpoints have been mapped
  /// </summary>
  public const string EndpointsMapped = "APIEndpointsMapped";
}

/// <summary>
/// Extension methods for WebApplication.
/// </summary>
public static class WebApplicationExtensions
{
  /// <summary>
  /// Adds Starter App API middleware to the application pipeline.
  /// </summary>
  /// <param name="app">The web application.</param>
  /// <returns>The web application for chaining.</returns>
  public static IApplicationBuilder AddMiddleware(this IApplicationBuilder app)
  {
    // Add any required middleware here

    app.Properties[WebApplicationExtensionKeys.MiddlewareAdded] = true;

    return app;
  }

  /// <summary>
  /// Maps Starter App API endpoints.
  /// </summary>
  /// <param name="app">The web application.</param>
  /// <returns>The web application for chaining.</returns>
  public static T MapEndpoints<T>(this T app) where T : IApplicationBuilder, IEndpointRouteBuilder
  {
    app.MapGet("/greeting", (IGreetingService greetingService) =>
    {
      return Results.Ok(greetingService.GetGreeting());
    })
    .WithOpenApi();

    // ========== Assessment Endpoints ==========

    /// <summary>
    /// POST /api/assessments/create
    /// Creates a new assessment with resume analysis and interview question generation
    /// </summary>
    app.MapPost("/api/assessments/create", async (
        CreateAssessmentRequest request,
        AssessmentService assessmentService) =>
    {
      try
      {
        var assessment = await assessmentService.CreateAssessmentAsync(
            request.ResumeText,
            request.JobDescription,
            request.QuestionCount);

        return Results.Ok(new
        {
          assessmentId = assessment.AssessmentId,
          candidateName = assessment.CandidateName,
          initialMatchPercentage = assessment.MatchReport?.OverallMatchPercentage,
          questionCount = assessment.InterviewQuestions?.Count ?? 0
        });
      }
      catch (ArgumentException ex)
      {
        return Results.BadRequest(new { error = ex.Message });
      }
      catch (Exception ex)
      {
        return Results.Problem(detail: ex.Message, statusCode: 500);
      }
    })
    .WithOpenApi()
    .WithName("CreateAssessment")
    .WithDescription("Creates a new assessment by analyzing resume and generating interview questions");

    /// <summary>
    /// GET /api/assessments/{assessmentId}
    /// Retrieves assessment details with questions and responses
    /// </summary>
    app.MapGet("/api/assessments/{assessmentId}", async (
        string assessmentId,
        AssessmentService assessmentService) =>
    {
      try
      {
        var assessment = await assessmentService.GetAssessmentAsync(assessmentId);

        if (assessment == null)
        {
          return Results.NotFound(new { error = $"Assessment {assessmentId} not found" });
        }

        return Results.Ok(assessment);
      }
      catch (Exception ex)
      {
        return Results.Problem(detail: ex.Message, statusCode: 500);
      }
    })
    .WithOpenApi()
    .WithName("GetAssessment")
    .WithDescription("Retrieves an assessment with all questions and responses");

    /// <summary>
    /// POST /api/assessments/{assessmentId}/submit-responses
    /// Submits candidate responses to interview questions
    /// </summary>
    app.MapPost("/api/assessments/{assessmentId}/submit-responses", async (
        string assessmentId,
        SubmitResponsesRequest request,
        AssessmentService assessmentService) =>
    {
      try
      {
        var assessment = await assessmentService.SubmitResponsesAsync(
            assessmentId,
            request.Responses);

        return Results.Ok(new
        {
          assessmentId = assessment.AssessmentId,
          status = assessment.Status,
          completedAt = assessment.CompletedAt
        });
      }
      catch (ArgumentException ex)
      {
        return Results.BadRequest(new { error = ex.Message });
      }
      catch (InvalidOperationException ex)
      {
        return Results.BadRequest(new { error = ex.Message });
      }
      catch (Exception ex)
      {
        return Results.Problem(detail: ex.Message, statusCode: 500);
      }
    })
    .WithOpenApi()
    .WithName("SubmitResponses")
    .WithDescription("Submits candidate answers to interview questions");

    /// <summary>
    /// GET /api/assessments
    /// Retrieves all assessments
    /// </summary>
    app.MapGet("/api/assessments", async (
        AssessmentService assessmentService) =>
    {
      try
      {
        // Return a sample assessment summary
        return Results.Ok(new
        {
          message = "Assessment API is working"
        });
      }
      catch (Exception ex)
      {
        return Results.Problem(detail: ex.Message, statusCode: 500);
      }
    })
    .WithOpenApi()
    .WithName("GetAssessments")
    .WithDescription("Retrieves all assessments");

    app.Properties[WebApplicationExtensionKeys.EndpointsMapped] = true;

    return app;
  }
}

/// <summary>
/// Request model for creating an assessment
/// </summary>
public class CreateAssessmentRequest
{
  /// <summary>
  /// Candidate's resume text
  /// </summary>
  public string ResumeText { get; set; } = string.Empty;

  /// <summary>
  /// Job description/posting
  /// </summary>
  public string JobDescription { get; set; } = string.Empty;

  /// <summary>
  /// Number of interview questions to generate (1-20, default 5)
  /// </summary>
  public int QuestionCount { get; set; } = 5;
}

/// <summary>
/// Request model for submitting interview responses
/// </summary>
public class SubmitResponsesRequest
{
  /// <summary>
  /// List of responses from candidate
  /// </summary>
  public List<CandidateResponse> Responses { get; set; } = new();
}
