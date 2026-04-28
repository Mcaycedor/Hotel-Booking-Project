using Gen.StarterApp.Services.Dtos;

namespace Gen.StarterApp.Api.Services;

/// <summary>
/// Interface for resume analysis service.
/// </summary>
public interface IResumeAnalysisService
{
    /// <summary>
    /// Analyzes resume text and extracts structured data.
    /// </summary>
    /// <param name="resumeText">Raw resume text to analyze</param>
    /// <returns>Parsed resume data</returns>
    ResumeData AnalyzeResume(string resumeText);
}
