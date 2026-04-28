namespace Gen.StarterApp.Services.Dtos;

/// <summary>
/// Parsed resume data extracted from raw resume text
/// Contains structured information about candidate skills, experience, etc.
/// </summary>
public class ResumeData
{
    /// <summary>
    /// Extracted candidate name
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Years of professional experience
    /// </summary>
    public int YearsOfExperience { get; set; }

    /// <summary>
    /// List of technical and professional skills
    /// </summary>
    public List<string> Skills { get; set; } = new();

    /// <summary>
    /// Educational background (degree, university, field)
    /// </summary>
    public List<string> Education { get; set; } = new();

    /// <summary>
    /// Professional certifications
    /// </summary>
    public List<string> Certifications { get; set; } = new();

    /// <summary>
    /// Summary of professional background
    /// </summary>
    public string Summary { get; set; } = string.Empty;

    /// <summary>
    /// List of previous job titles/roles
    /// </summary>
    public List<string> PreviousRoles { get; set; } = new();
}

/// <summary>
/// Response DTO containing analyzed resume data
/// </summary>
public class ResumeAnalysisResponse
{
    /// <summary>
    /// Parsed resume data
    /// </summary>
    public ResumeData ResumeData { get; set; } = new();

    /// <summary>
    /// Flag indicating if parsing was successful
    /// </summary>
    public bool IsSuccessful { get; set; }

    /// <summary>
    /// Error message if parsing failed
    /// </summary>
    public string? ErrorMessage { get; set; }
}
