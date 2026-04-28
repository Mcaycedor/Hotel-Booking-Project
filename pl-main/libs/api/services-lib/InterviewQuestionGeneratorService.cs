using Gen.StarterApp.Api.Services;
using Gen.StarterApp.Services.Dtos;
using System.Text.Json;
using System.Net.Http.Json;
using Microsoft.Extensions.Configuration;

namespace Gen.StarterApp.Services;

/// <summary>
/// Service for generating interview questions using OpenAI API
/// Generates role-specific, AI-powered interview questions based on resume and job description
/// </summary>
public class InterviewQuestionGeneratorService : IInterviewQuestionGeneratorService
{
    private readonly HttpClient _httpClient;
    private readonly string _openAiApiKey;
    private const string OpenAiApiUrl = "https://api.openai.com/v1/chat/completions";

    /// <summary>
    /// Constructor
    /// </summary>
    public InterviewQuestionGeneratorService(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient ?? throw new ArgumentNullException(nameof(httpClient));
        _openAiApiKey = configuration["OpenAI:ApiKey"] ?? throw new InvalidOperationException("OpenAI API key not configured");
    }

    /// <summary>
    /// Generates interview questions based on resume and job description
    /// </summary>
    /// <param name="resumeData">Candidate's parsed resume data</param>
    /// <param name="jobDescription">Job description text</param>
    /// <param name="questionCount">Number of questions to generate (default: 5)</param>
    /// <returns>List of generated interview questions</returns>
    public async Task<List<InterviewQuestion>> GenerateQuestionsAsync(
        ResumeData resumeData,
        string jobDescription,
        int questionCount = 5)
    {
        if (resumeData == null)
        {
            throw new ArgumentNullException(nameof(resumeData));
        }

        if (string.IsNullOrWhiteSpace(jobDescription))
        {
            throw new ArgumentException("Job description cannot be empty", nameof(jobDescription));
        }

        if (questionCount < 1 || questionCount > 20)
        {
            throw new ArgumentException("Question count must be between 1 and 20", nameof(questionCount));
        }

        try
        {
            var prompt = BuildPrompt(resumeData, jobDescription, questionCount);
            var response = await CallOpenAiApiAsync(prompt);
            var questions = ParseQuestionsFromResponse(response, questionCount);

            return questions;
        }
        catch (HttpRequestException ex)
        {
            throw new InvalidOperationException("Failed to call OpenAI API", ex);
        }
    }

    /// <summary>
    /// Builds the prompt for OpenAI
    /// </summary>
    private string BuildPrompt(ResumeData resumeData, string jobDescription, int questionCount)
    {
        var skills = string.Join(", ", resumeData.Skills.Take(10));
        var experience = resumeData.YearsOfExperience > 0
            ? $"{resumeData.YearsOfExperience} years of experience"
            : "entry-level experience";

        return $@"You are an expert technical interviewer. Generate {questionCount} interview questions for a candidate with the following profile:

CANDIDATE PROFILE:
- Skills: {skills}
- Experience: {experience}
- Education: {string.Join(", ", resumeData.Education)}
- Previous Roles: {string.Join(", ", resumeData.PreviousRoles)}

JOB DESCRIPTION:
{jobDescription}

Generate {questionCount} interview questions that:
1. Test technical skills matching the job requirements
2. Include mix of difficulty levels (Easy, Medium, Hard)
3. Cover behavioral, technical, and situational scenarios
4. Are specific to the role and candidate's background

Format the response as a JSON array with this structure:
[
  {{
    ""question"": ""The interview question here"",
    ""difficulty"": ""Medium"",
    ""category"": ""Technical"",
    ""tested_skills"": [""Skill1"", ""Skill2""],
    ""expected_answer_hints"": ""Key points to cover in the answer""
  }}
]

Return ONLY the JSON array, no other text.";
    }

    /// <summary>
    /// Calls OpenAI API to generate questions
    /// </summary>
    private async Task<string> CallOpenAiApiAsync(string prompt)
    {
        var request = new
        {
            model = "gpt-3.5-turbo",
            messages = new object[]
            {
                new { role = "system", content = "You are an expert technical interviewer assistant." },
                new { role = "user", content = prompt }
            },
            temperature = 0.7,
            max_tokens = 2000
        };

        _httpClient.DefaultRequestHeaders.Clear();
        _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {_openAiApiKey}");

        try
        {
            var response = await _httpClient.PostAsJsonAsync(OpenAiApiUrl, request);
            response.EnsureSuccessStatusCode();

            var jsonContent = await response.Content.ReadAsStringAsync();
            using (var doc = JsonDocument.Parse(jsonContent))
            {
                var root = doc.RootElement;
                var messageContent = root.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString();
                return messageContent ?? string.Empty;
            }
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException("OpenAI API call failed", ex);
        }
    }

    /// <summary>
    /// Parses the API response into InterviewQuestion objects
    /// </summary>
    private List<InterviewQuestion> ParseQuestionsFromResponse(string response, int expectedCount)
    {
        var questions = new List<InterviewQuestion>();

        try
        {
            // Try to extract JSON from response (in case API returns extra text)
            var jsonStartIndex = response.IndexOf('[');
            var jsonEndIndex = response.LastIndexOf(']');

            if (jsonStartIndex == -1 || jsonEndIndex == -1)
            {
                throw new FormatException("Response does not contain valid JSON array");
            }

            var jsonString = response.Substring(jsonStartIndex, jsonEndIndex - jsonStartIndex + 1);
            var questionsJson = JsonSerializer.Deserialize<JsonElement>(jsonString);

            if (questionsJson.ValueKind != JsonValueKind.Array)
            {
                throw new FormatException("Response JSON is not an array");
            }

            int sequenceNumber = 1;
            foreach (var item in questionsJson.EnumerateArray())
            {
                var question = new InterviewQuestion
                {
                    QuestionId = Guid.NewGuid().ToString(),
                    Question = GetJsonString(item, "question"),
                    Difficulty = GetJsonString(item, "difficulty") ?? "Medium",
                    Category = GetJsonString(item, "category") ?? "Technical",
                    TestedSkills = GetJsonArray(item, "tested_skills"),
                    ExpectedAnswerHints = GetJsonString(item, "expected_answer_hints"),
                    SequenceNumber = sequenceNumber++
                };

                questions.Add(question);
            }

            // Ensure we have the expected number of questions
            return questions.Take(expectedCount).ToList();
        }
        catch (JsonException ex)
        {
            throw new FormatException("Failed to parse OpenAI response as JSON", ex);
        }
    }

    /// <summary>
    /// Helper to extract string from JSON
    /// </summary>
    private string? GetJsonString(JsonElement element, string propertyName)
    {
        if (element.TryGetProperty(propertyName, out var property) && property.ValueKind == JsonValueKind.String)
        {
            return property.GetString();
        }
        return null;
    }

    /// <summary>
    /// Helper to extract array from JSON
    /// </summary>
    private List<string> GetJsonArray(JsonElement element, string propertyName)
    {
        var result = new List<string>();

        if (element.TryGetProperty(propertyName, out var property) && property.ValueKind == JsonValueKind.Array)
        {
            foreach (var item in property.EnumerateArray())
            {
                if (item.ValueKind == JsonValueKind.String)
                {
                    var value = item.GetString();
                    if (!string.IsNullOrEmpty(value))
                    {
                        result.Add(value);
                    }
                }
            }
        }

        return result;
    }
}
