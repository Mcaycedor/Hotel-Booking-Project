using Gen.StarterApp.Api.Services;
using Gen.StarterApp.Services.Dtos;
using System.Text.RegularExpressions;

namespace Gen.StarterApp.Services;

/// <summary>
/// Service for analyzing and extracting data from resume text
/// Uses text parsing to identify skills, experience, education, etc.
/// </summary>
public class ResumeAnalysisService : IResumeAnalysisService
{
    /// <summary>
    /// Analyzes resume text and extracts structured data
    /// </summary>
    /// <param name="resumeText">Raw resume text to analyze</param>
    /// <returns>Parsed resume data</returns>
    public ResumeData AnalyzeResume(string resumeText)
    {
        if (string.IsNullOrWhiteSpace(resumeText))
        {
            throw new ArgumentException("Resume text cannot be empty", nameof(resumeText));
        }

        if (resumeText.Length < 50)
        {
            throw new ArgumentException("Resume text must be at least 50 characters", nameof(resumeText));
        }

        var resumeData = new ResumeData();

        // Extract candidate name (usually first line or look for patterns)
        resumeData.Name = ExtractName(resumeText);

        // Extract skills from keywords and patterns
        resumeData.Skills = ExtractSkills(resumeText);

        // Extract years of experience
        resumeData.YearsOfExperience = ExtractExperienceYears(resumeText);

        // Extract education
        resumeData.Education = ExtractEducation(resumeText);

        // Extract certifications
        resumeData.Certifications = ExtractCertifications(resumeText);

        // Extract previous roles
        resumeData.PreviousRoles = ExtractPreviousRoles(resumeText);

        // Create summary
        resumeData.Summary = GenerateSummary(resumeData, resumeText);

        return resumeData;
    }

    /// <summary>
    /// Extracts candidate name from resume
    /// </summary>
    private string ExtractName(string resumeText)
    {
        var lines = resumeText.Split(new[] { "\r\n", "\r", "\n" }, StringSplitOptions.None);

        // Usually the first non-empty line is the name
        foreach (var line in lines)
        {
            var trimmed = line.Trim();
            if (!string.IsNullOrEmpty(trimmed) && trimmed.Length < 100 && !trimmed.Contains("@"))
            {
                return trimmed;
            }
        }

        return "Unknown";
    }

    /// <summary>
    /// Extracts technical and professional skills
    /// Looks for common skill keywords
    /// </summary>
    private List<string> ExtractSkills(string resumeText)
    {
        var skills = new List<string>();
        var skillKeywords = new[]
        {
            // Programming languages
            "C#", "Java", "Python", "JavaScript", "TypeScript", "Go", "Rust", "PHP", "Ruby", "Swift",
            "Kotlin", "C++", "C", "VB.NET", "Scala", "Perl",
            
            // Frontend frameworks
            "Angular", "React", "Vue", "Svelte", "Next.js", "Nuxt", "Gatsby",
            
            // Backend frameworks
            ".NET", "Node.js", "Express", "Django", "Flask", "Spring", "Laravel", "ASP.NET",
            
            // Databases
            "PostgreSQL", "MySQL", "MongoDB", "SQL Server", "Redis", "Elasticsearch",
            "Oracle", "DynamoDB", "Cassandra",
            
            // Cloud/DevOps
            "AWS", "Azure", "GCP", "Docker", "Kubernetes", "CI/CD", "Jenkins", "GitLab CI",
            "GitHub Actions", "Terraform", "CloudFormation",
            
            // Concepts
            "REST API", "GraphQL", "Microservices", "Machine Learning", "AI", "Big Data",
            "Data Science", "Agile", "Scrum", "Git", "Linux", "Windows",
            
            // Soft skills
            "Leadership", "Communication", "Problem Solving", "Team Management",
            "Project Management", "Mentoring"
        };

        var lowerText = resumeText.ToLower();
        foreach (var skill in skillKeywords)
        {
            if (lowerText.Contains(skill.ToLower()))
            {
                skills.Add(skill);
            }
        }

        return skills.Distinct().ToList();
    }

    /// <summary>
    /// Extracts years of professional experience
    /// </summary>
    private int ExtractExperienceYears(string resumeText)
    {
        // Look for patterns like "X years", "X+ years", etc.
        var matches = Regex.Matches(resumeText, @"(\d+)\s*\+?\s*years?", RegexOptions.IgnoreCase);

        if (matches.Count == 0)
        {
            return 0;
        }

        // Return the largest number found (usually total experience)
        int maxYears = 0;
        foreach (Match match in matches)
        {
            if (int.TryParse(match.Groups[1].Value, out int years) && years < 100)
            {
                maxYears = Math.Max(maxYears, years);
            }
        }

        return maxYears;
    }

    /// <summary>
    /// Extracts educational background
    /// </summary>
    private List<string> ExtractEducation(string resumeText)
    {
        var education = new List<string>();
        var degreePatterns = new[] { "Bachelor", "Master", "PhD", "PhD", "Diploma", "Associate", "Certificate" };

        foreach (var pattern in degreePatterns)
        {
            if (resumeText.Contains(pattern, StringComparison.OrdinalIgnoreCase))
            {
                education.Add(pattern);
            }
        }

        // Look for university names (common ones)
        var universityKeywords = new[]
        {
            "University", "Institute", "College", "Academy", "Technical", "School",
            "MIT", "Stanford", "Harvard", "Cambridge", "Oxford", "Yale", "Berkeley"
        };

        foreach (var keyword in universityKeywords)
        {
            if (resumeText.Contains(keyword, StringComparison.OrdinalIgnoreCase))
            {
                education.Add(keyword);
            }
        }

        return education.Distinct().ToList();
    }

    /// <summary>
    /// Extracts professional certifications
    /// </summary>
    private List<string> ExtractCertifications(string resumeText)
    {
        var certifications = new List<string>();
        var certPatterns = new[]
        {
            "AWS Certified", "Azure Certified", "GCP Certified",
            "Scrum Master", "Project Management",
            "CISCI", "Security+", "Network+",
            "Oracle Certified", "Microsoft Certified",
            "Google Cloud Certified"
        };

        foreach (var pattern in certPatterns)
        {
            if (resumeText.Contains(pattern, StringComparison.OrdinalIgnoreCase))
            {
                certifications.Add(pattern);
            }
        }

        return certifications;
    }

    /// <summary>
    /// Extracts job titles/roles from resume
    /// </summary>
    private List<string> ExtractPreviousRoles(string resumeText)
    {
        var roles = new List<string>();
        var rolePatterns = new[]
        {
            "Engineer", "Developer", "Manager", "Lead", "Senior", "Junior", "Analyst",
            "Architect", "Administrator", "Consultant", "Specialist", "Coordinator",
            "Director", "VP", "Head", "Chief"
        };

        foreach (var pattern in rolePatterns)
        {
            if (resumeText.Contains(pattern, StringComparison.OrdinalIgnoreCase) && !roles.Contains(pattern))
            {
                roles.Add(pattern);
            }
        }

        return roles;
    }

    /// <summary>
    /// Generates a summary of the candidate's profile
    /// </summary>
    private string GenerateSummary(ResumeData data, string resumeText)
    {
        var parts = new List<string>();

        if (data.YearsOfExperience > 0)
        {
            parts.Add($"{data.YearsOfExperience} years of professional experience");
        }

        if (data.Skills.Any())
        {
            parts.Add($"Proficient in {string.Join(", ", data.Skills.Take(3))}");
        }

        if (data.Education.Any())
        {
            parts.Add($"Hold {string.Join(", ", data.Education.Take(2))}");
        }

        if (data.Certifications.Any())
        {
            parts.Add($"Certified in {string.Join(", ", data.Certifications.Take(2))}");
        }

        return string.Join(". ", parts) + ".";
    }
}
