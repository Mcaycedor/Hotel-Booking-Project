namespace Gen.StarterApp.Services.Dtos;

/// <summary>
/// Represents an AI-generated interview question
/// </summary>
public class InterviewQuestion
{
    /// <summary>
    /// Unique identifier for the question
    /// </summary>
    public string QuestionId { get; set; } = Guid.NewGuid().ToString();

    /// <summary>
    /// The interview question text
    /// </summary>
    public string Question { get; set; } = string.Empty;

    /// <summary>
    /// Difficulty level: Easy, Medium, Hard
    /// </summary>
    public string Difficulty { get; set; } = "Medium";

    /// <summary>
    /// Category: Technical, Behavioral, Situational, Domain-specific
    /// </summary>
    public string Category { get; set; } = string.Empty;

    /// <summary>
    /// Which skill(s) does this question test
    /// </summary>
    public List<string> TestedSkills { get; set; } = new();

    /// <summary>
    /// Optional: Expected answer hints or key points to cover
    /// </summary>
    public string? ExpectedAnswerHints { get; set; }

    /// <summary>
    /// Sequence number (1, 2, 3, etc.)
    /// </summary>
    public int SequenceNumber { get; set; }
}

/// <summary>
/// Request DTO for question generation
/// </summary>
public class QuestionGenerationRequest
{
    /// <summary>
    /// Parsed resume data from candidate
    /// </summary>
    public ResumeData ResumeData { get; set; } = new();

    /// <summary>
    /// Job description text
    /// </summary>
    public string JobDescription { get; set; } = string.Empty;

    /// <summary>
    /// Number of questions to generate (default: 5)
    /// </summary>
    public int QuestionCount { get; set; } = 5;

    /// <summary>
    /// Focus areas (optional): technical, soft-skills, domain-specific
    /// </summary>
    public List<string>? FocusAreas { get; set; }
}

/// <summary>
/// Response DTO containing generated interview questions
/// </summary>
public class QuestionGenerationResponse
{
    /// <summary>
    /// List of generated interview questions
    /// </summary>
    public List<InterviewQuestion> Questions { get; set; } = new();

    /// <summary>
    /// Flag indicating if generation was successful
    /// </summary>
    public bool IsSuccessful { get; set; }

    /// <summary>
    /// Error message if generation failed
    /// </summary>
    public string? ErrorMessage { get; set; }

    /// <summary>
    /// Timestamp when questions were generated
    /// </summary>
    public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
}
