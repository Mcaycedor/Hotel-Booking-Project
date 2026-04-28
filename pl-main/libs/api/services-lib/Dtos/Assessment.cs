namespace Gen.StarterApp.Services.Dtos;

/// <summary>
/// Candidate's response to an interview question
/// </summary>
public class CandidateResponse
{
    /// <summary>
    /// Question ID being answered
    /// </summary>
    public string QuestionId { get; set; } = string.Empty;

    /// <summary>
    /// Candidate's answer text
    /// </summary>
    public string Answer { get; set; } = string.Empty;

    /// <summary>
    /// Time spent answering (seconds)
    /// </summary>
    public int TimeSpentSeconds { get; set; }
}

/// <summary>
/// Complete assessment record for a candidate
/// </summary>
public class Assessment
{
    /// <summary>
    /// Unique assessment identifier
    /// </summary>
    public string AssessmentId { get; set; } = Guid.NewGuid().ToString();

    /// <summary>
    /// Candidate name
    /// </summary>
    public string CandidateName { get; set; } = string.Empty;

    /// <summary>
    /// Job position title being assessed for
    /// </summary>
    public string JobTitle { get; set; } = string.Empty;

    /// <summary>
    /// Original resume text submitted
    /// </summary>
    public string ResumeText { get; set; } = string.Empty;

    /// <summary>
    /// Original job description text submitted
    /// </summary>
    public string JobDescription { get; set; } = string.Empty;

    /// <summary>
    /// Job description source: "text" or "url"
    /// </summary>
    public string JobDescriptionSourceType { get; set; } = "text";

    /// <summary>
    /// Original job description URL (if sourced from URL)
    /// </summary>
    public string? JobDescriptionUrl { get; set; }

    /// <summary>
    /// Parsed resume data
    /// </summary>
    public ResumeData ResumeData { get; set; } = new();

    /// <summary>
    /// Generated interview questions for this assessment
    /// </summary>
    public List<InterviewQuestion> InterviewQuestions { get; set; } = new();

    /// <summary>
    /// Candidate responses to interview questions
    /// </summary>
    public List<CandidateResponse> CandidateResponses { get; set; } = new();

    /// <summary>
    /// Final match analysis report
    /// </summary>
    public MatchReport MatchReport { get; set; } = new();

    /// <summary>
    /// Assessment status: Draft, InProgress, Completed
    /// </summary>
    public string Status { get; set; } = "Draft";

    /// <summary>
    /// When assessment was created
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// When assessment was last updated
    /// </summary>
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// When assessment was completed (submitted)
    /// </summary>
    public DateTime? CompletedAt { get; set; }
}

/// <summary>
/// Request DTO for creating a new assessment
/// </summary>
public class CreateAssessmentRequest
{
    /// <summary>
    /// Candidate name
    /// </summary>
    public string CandidateName { get; set; } = string.Empty;

    /// <summary>
    /// Job title being assessed for
    /// </summary>
    public string JobTitle { get; set; } = string.Empty;

    /// <summary>
    /// Resume text (plain text)
    /// </summary>
    public string ResumeText { get; set; } = string.Empty;

    /// <summary>
    /// Job description text (plain text or HTML extracted from URL)
    /// </summary>
    public string JobDescription { get; set; } = string.Empty;

    /// <summary>
    /// Job description source type: "text" or "url"
    /// </summary>
    public string JobDescriptionSourceType { get; set; } = "text";

    /// <summary>
    /// Job description URL (used when JobDescriptionSourceType is "url")
    /// </summary>
    public string? JobDescriptionUrl { get; set; }

    /// <summary>
    /// Optional: number of questions to generate
    /// </summary>
    public int? QuestionCount { get; set; } = 5;
}

/// <summary>
/// Response DTO after assessment creation
/// </summary>
public class AssessmentResponse
{
    /// <summary>
    /// The created or updated assessment
    /// </summary>
    public Assessment Assessment { get; set; } = new();

    /// <summary>
    /// Flag indicating if operation was successful
    /// </summary>
    public bool IsSuccessful { get; set; }

    /// <summary>
    /// Error message if operation failed
    /// </summary>
    public string? ErrorMessage { get; set; }

    /// <summary>
    /// Message describing the operation result
    /// </summary>
    public string Message { get; set; } = string.Empty;
}

/// <summary>
/// Request DTO for submitting candidate responses
/// </summary>
public class SubmitResponsesRequest
{
    /// <summary>
    /// Candidate's answers to interview questions
    /// </summary>
    public List<CandidateResponse> Responses { get; set; } = new();
}

/// <summary>
/// Request DTO for retrieving assessment history
/// </summary>
public class AssessmentHistoryRequest
{
    /// <summary>
    /// Candidate identifier (name or ID)
    /// </summary>
    public string CandidateIdentifier { get; set; } = string.Empty;

    /// <summary>
    /// Optional: filter by status
    /// </summary>
    public string? Status { get; set; }

    /// <summary>
    /// Optional: limit number of results
    /// </summary>
    public int Limit { get; set; } = 10;

    /// <summary>
    /// Optional: offset for pagination
    /// </summary>
    public int Offset { get; set; } = 0;
}

/// <summary>
/// Response DTO with list of assessments
/// </summary>
public class AssessmentHistoryResponse
{
    /// <summary>
    /// List of assessments
    /// </summary>
    public List<Assessment> Assessments { get; set; } = new();

    /// <summary>
    /// Total count of assessments for this candidate
    /// </summary>
    public int TotalCount { get; set; }

    /// <summary>
    /// Flag indicating if operation was successful
    /// </summary>
    public bool IsSuccessful { get; set; }

    /// <summary>
    /// Error message if operation failed
    /// </summary>
    public string? ErrorMessage { get; set; }
}
