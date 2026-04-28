namespace Gen.StarterApp.Services.Data.Entities;

/// <summary>
/// Database entity for Assessment records
/// </summary>
public class AssessmentEntity
{
    /// <summary>
    /// Primary key - UUID
    /// </summary>
    public Guid Id { get; set; } = Guid.NewGuid();

    /// <summary>
    /// Candidate name
    /// </summary>
    public string CandidateName { get; set; } = string.Empty;

    /// <summary>
    /// Job title being assessed for
    /// </summary>
    public string JobTitle { get; set; } = string.Empty;

    /// <summary>
    /// Original resume text
    /// </summary>
    public string ResumeText { get; set; } = string.Empty;

    /// <summary>
    /// Original job description text
    /// </summary>
    public string JobDescription { get; set; } = string.Empty;

    /// <summary>
    /// Parsed resume data (stored as JSON)
    /// </summary>
    public string ResumeDataJson { get; set; } = string.Empty;

    /// <summary>
    /// Status: Draft, InProgress, Completed
    /// </summary>
    public string Status { get; set; } = "Draft";

    /// <summary>
    /// Overall match score
    /// </summary>
    public int? OverallMatchScore { get; set; }

    /// <summary>
    /// Overall match percentage
    /// </summary>
    public int? OverallMatchPercentage { get; set; }

    /// <summary>
    /// Match report as JSON
    /// </summary>
    public string? MatchReportJson { get; set; }

    /// <summary>
    /// Creation timestamp
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Last update timestamp
    /// </summary>
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Completion timestamp
    /// </summary>
    public DateTime? CompletedAt { get; set; }

    // Navigation properties
    public ICollection<InterviewQuestionEntity> InterviewQuestions { get; set; } = new List<InterviewQuestionEntity>();
    public ICollection<CandidateResponseEntity> CandidateResponses { get; set; } = new List<CandidateResponseEntity>();
}
