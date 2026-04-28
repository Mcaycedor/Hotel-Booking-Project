namespace Gen.StarterApp.Services.Dtos;

/// <summary>
/// Request DTO for resume analysis
/// Contains raw resume text to be parsed and analyzed
/// </summary>
public class ResumeAnalysisRequest
{
    /// <summary>
    /// Raw resume text content (plain text or extracted from PDF)
    /// </summary>
    public string ResumeText { get; set; } = string.Empty;
}
