using Gen.StarterApp.Services.Dtos;

namespace Gen.StarterApp.Api.Services;

/// <summary>
/// Interface for assessment service.
/// </summary>
public interface IAssessmentService
{
    /// <summary>
    /// Creates a new assessment with resume analysis and generated interview questions.
    /// </summary>
    /// <param name="resumeText">Candidate's resume</param>
    /// <param name="jobDescription">Job posting description</param>
    /// <param name="questionCount">Number of questions to generate</param>
    /// <returns>Assessment with questions ready for candidate answers</returns>
    Task<Assessment> CreateAssessmentAsync(string resumeText, string jobDescription, int questionCount = 5);

    /// <summary>
    /// Creates a new assessment by fetching job description from a URL.
    /// </summary>
    /// <param name="resumeText">Candidate's resume</param>
    /// <param name="jobDescriptionUrl">URL to job posting page</param>
    /// <param name="questionCount">Number of questions to generate</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Assessment with questions ready for candidate answers</returns>
    Task<Assessment> CreateAssessmentFromUrlAsync(string resumeText, string jobDescriptionUrl, int questionCount = 5, CancellationToken cancellationToken = default);

    /// <summary>
    /// Retrieves an assessment by ID.
    /// </summary>
    /// <param name="assessmentId">The ID of the assessment to retrieve</param>
    /// <returns>Assessment if found; null otherwise</returns>
    Task<Assessment?> GetAssessmentAsync(string assessmentId);

    /// <summary>
    /// Submits candidate responses to interview questions for an assessment.
    /// </summary>
    /// <param name="assessmentId">The ID of the assessment</param>
    /// <param name="responses">Candidate responses to interview questions</param>
    /// <returns>Assessment with updated responses and final recommendation</returns>
    Task<Assessment> SubmitResponsesAsync(string assessmentId, List<CandidateResponse> responses);

    /// <summary>
    /// Calculates final assessment results based on candidate responses.
    /// </summary>
    /// <param name="assessmentId">The ID of the assessment</param>
    /// <returns>Final assessment report with scoring and recommendations</returns>
    Task<Assessment> CalculateResultsAsync(string assessmentId);
}
