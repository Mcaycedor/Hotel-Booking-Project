namespace Gen.StarterApp.Services.Dtos;

/// <summary>
/// Represents a skill match between candidate and job requirements
/// </summary>
public class SkillMatch
{
    /// <summary>
    /// The skill name
    /// </summary>
    public string SkillName { get; set; } = string.Empty;

    /// <summary>
    /// Candidate proficiency level: Expert, Proficient, Familiar, Learning
    /// </summary>
    public string CandidateProficiency { get; set; } = string.Empty;

    /// <summary>
    /// Required proficiency level from job description
    /// </summary>
    public string RequiredProficiency { get; set; } = string.Empty;

    /// <summary>
    /// Match score: 0-100
    /// </summary>
    public int MatchScore { get; set; }

    /// <summary>
    /// Gap analysis: how well candidate matches requirement
    /// </summary>
    public string GapAnalysis { get; set; } = string.Empty;
}

/// <summary>
/// Recommendation for candidate improvement
/// </summary>
public class Recommendation
{
    /// <summary>
    /// Description of the recommendation
    /// </summary>
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// Priority: Critical, High, Medium, Low
    /// </summary>
    public string Priority { get; set; } = "Medium";

    /// <summary>
    /// Estimated effort: Days, Weeks, Months
    /// </summary>
    public string EstimatedEffort { get; set; } = string.Empty;

    /// <summary>
    /// Learning resources or suggestions
    /// </summary>
    public List<string> Resources { get; set; } = new();
}

/// <summary>
/// Complete match analysis report
/// </summary>
public class MatchReport
{
    /// <summary>
    /// Unique assessment identifier
    /// </summary>
    public string AssessmentId { get; set; } = Guid.NewGuid().ToString();

    /// <summary>
    /// Overall match percentage (0-100)
    /// </summary>
    public int OverallMatchPercentage { get; set; }

    /// <summary>
    /// Overall match score (0-100)
    /// </summary>
    public int OverallMatchScore { get; set; }

    /// <summary>
    /// Detailed skill matching results
    /// </summary>
    public List<SkillMatch> SkillMatches { get; set; } = new();

    /// <summary>
    /// Skills candidate has that aren't in job description
    /// </summary>
    public List<string> AdditionalSkills { get; set; } = new();

    /// <summary>
    /// Critical skills missing from candidate resume
    /// </summary>
    public List<string> CriticalMissingSkills { get; set; } = new();

    /// <summary>
    /// Non-critical skills that would be nice to have
    /// </summary>
    public List<string> NiceTohaveSkills { get; set; } = new();

    /// <summary>
    /// Match summary assessment
    /// </summary>
    public string SummaryAssessment { get; set; } = string.Empty;

    /// <summary>
    /// Recommendations for candidate
    /// </summary>
    public List<Recommendation> Recommendations { get; set; } = new();

    /// <summary>
    /// Hiring recommendation: StrongYes, Yes, Maybe, No, StrongNo
    /// </summary>
    public string HiringRecommendation { get; set; } = "Maybe";

    /// <summary>
    /// Timestamp of analysis
    /// </summary>
    public DateTime AnalyzedAt { get; set; } = DateTime.UtcNow;
}

/// <summary>
/// Request DTO for match analysis
/// </summary>
public class MatchAnalysisRequest
{
    /// <summary>
    /// Parsed resume data from candidate
    /// </summary>
    public ResumeData ResumeData { get; set; } = new();

    /// <summary>
    /// Job description text
    /// </summary>
    public string JobDescription { get; set; } = string.Empty;
}

/// <summary>
/// Response DTO containing match analysis
/// </summary>
public class MatchAnalysisResponse
{
    /// <summary>
    /// The match report
    /// </summary>
    public MatchReport MatchReport { get; set; } = new();

    /// <summary>
    /// Flag indicating if analysis was successful
    /// </summary>
    public bool IsSuccessful { get; set; }

    /// <summary>
    /// Error message if analysis failed
    /// </summary>
    public string? ErrorMessage { get; set; }
}
