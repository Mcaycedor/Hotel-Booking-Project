using Gen.StarterApp.Services.Dtos;

namespace Gen.StarterApp.Api.Services;

/// <summary>
/// Interface for interview question generator service.
/// </summary>
public interface IInterviewQuestionGeneratorService
{
    /// <summary>
    /// Generates interview questions based on resume and job description.
    /// </summary>
    /// <param name="resumeData">Candidate's parsed resume data</param>
    /// <param name="jobDescription">Job description text</param>
    /// <param name="questionCount">Number of questions to generate (default: 5)</param>
    /// <returns>List of generated interview questions</returns>
    Task<List<InterviewQuestion>> GenerateQuestionsAsync(
        ResumeData resumeData,
        string jobDescription,
        int questionCount = 5);
}
