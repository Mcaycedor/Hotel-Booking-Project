using Gen.StarterApp.Services.Dtos;

namespace Gen.StarterApp.Api.Services;

/// <summary>
/// Interface for candidate match service.
/// </summary>
public interface ICandidateMatchService
{
    /// <summary>
    /// Calculates match between candidate and job requirements.
    /// </summary>
    /// <param name="resumeData">Candidate's parsed resume</param>
    /// <param name="jobDescription">Job description text</param>
    /// <returns>Detailed match report</returns>
    MatchReport CalculateMatch(ResumeData resumeData, string jobDescription);
}
