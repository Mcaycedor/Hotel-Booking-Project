namespace Gen.StarterApp.Services.Data.Entities;

/// <summary>
/// Database entity for candidate responses to interview questions
/// </summary>
public class CandidateResponseEntity
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
    /// Foreign key to InterviewQuestion
    /// </summary>
    public Guid InterviewQuestionId { get; set; }

    /// <summary>
    /// Candidate's answer text
    /// </summary>
    public string Answer { get; set; } = string.Empty;

    /// <summary>
    /// Time spent answering (seconds)
    /// </summary>
    public int TimeSpentSeconds { get; set; }

    /// <summary>
    /// When response was submitted
    /// </summary>
    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public AssessmentEntity Assessment { get; set; } = null!;
    public InterviewQuestionEntity InterviewQuestion { get; set; } = null!;
}
