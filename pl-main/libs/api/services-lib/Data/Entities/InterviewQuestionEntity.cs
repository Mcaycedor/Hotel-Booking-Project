namespace Gen.StarterApp.Services.Data.Entities;

/// <summary>
/// Database entity for interview questions
/// </summary>
public class InterviewQuestionEntity
{
    /// <summary>
    /// Primary key
    /// </summary>
    public Guid Id { get; set; } = Guid.NewGuid();

    /// <summary>
    /// Foreign key to Assessment
    /// </summary>
    public Guid AssessmentId { get; set; }

    /// <summary>
    /// The question text
    /// </summary>
    public string Question { get; set; } = string.Empty;

    /// <summary>
    /// Difficulty: Easy, Medium, Hard
    /// </summary>
    public string Difficulty { get; set; } = "Medium";

    /// <summary>
    /// Category: Technical, Behavioral, Situational, Domain-specific
    /// </summary>
    public string Category { get; set; } = string.Empty;

    /// <summary>
    /// Tested skills (JSON array)
    /// </summary>
    public string TestedSkillsJson { get; set; } = "[]";

    /// <summary>
    /// Expected answer hints
    /// </summary>
    public string? ExpectedAnswerHints { get; set; }

    /// <summary>
    /// Sequence number in assessment
    /// </summary>
    public int SequenceNumber { get; set; }

    /// <summary>
    /// Creation timestamp
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    public AssessmentEntity Assessment { get; set; } = null!;
    public ICollection<CandidateResponseEntity> Responses { get; set; } = new List<CandidateResponseEntity>();
}
