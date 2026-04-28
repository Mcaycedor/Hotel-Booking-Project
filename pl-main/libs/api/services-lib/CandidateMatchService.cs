using Gen.StarterApp.Api.Services;
using Gen.StarterApp.Services.Dtos;
using System.Text.RegularExpressions;

namespace Gen.StarterApp.Services;

/// <summary>
/// Service for analyzing and calculating candidate match against job requirements
/// Uses skill matching, experience analysis, and gap identification
/// </summary>
public class CandidateMatchService : ICandidateMatchService
{
    private readonly ResumeAnalysisService _resumeAnalysisService;

    /// <summary>
    /// Constructor
    /// </summary>
    public CandidateMatchService(ResumeAnalysisService resumeAnalysisService)
    {
        _resumeAnalysisService = resumeAnalysisService ?? throw new ArgumentNullException(nameof(resumeAnalysisService));
    }

    /// <summary>
    /// Calculates match between candidate and job requirements
    /// </summary>
    /// <param name="resumeData">Candidate's parsed resume</param>
    /// <param name="jobDescription">Job description text</param>
    /// <returns>Detailed match report</returns>
    public MatchReport CalculateMatch(ResumeData resumeData, string jobDescription)
    {
        if (resumeData == null)
        {
            throw new ArgumentNullException(nameof(resumeData));
        }

        if (string.IsNullOrWhiteSpace(jobDescription))
        {
            throw new ArgumentException("Job description cannot be empty", nameof(jobDescription));
        }

        var report = new MatchReport
        {
            AssessmentId = Guid.NewGuid().ToString()
        };

        // Extract required skills from job description
        var requiredSkills = ExtractRequiredSkills(jobDescription);
        var requiredExperience = ExtractRequiredExperience(jobDescription);

        // Calculate skill matches
        report.SkillMatches = CalculateSkillMatches(resumeData.Skills, requiredSkills);

        // Identify gaps
        var matchedSkillNames = report.SkillMatches.Select(s => s.SkillName).ToList();
        report.CriticalMissingSkills = requiredSkills
            .Where(s => !matchedSkillNames.Contains(s, StringComparer.OrdinalIgnoreCase))
            .ToList();

        report.NiceTohaveSkills = report.CriticalMissingSkills.Take(3).ToList();

        // Additional skills candidate has
        report.AdditionalSkills = resumeData.Skills
            .Where(s => !requiredSkills.Contains(s, StringComparer.OrdinalIgnoreCase))
            .Take(5)
            .ToList();

        // Calculate overall match score
        report.OverallMatchPercentage = CalculateOverallMatchPercentage(
            report.SkillMatches,
            requiredSkills,
            resumeData.YearsOfExperience,
            requiredExperience);

        report.OverallMatchScore = (int)Math.Round(report.OverallMatchPercentage / 100.0 * 100);

        // Generate hiring recommendation
        report.HiringRecommendation = GetHiringRecommendation(report.OverallMatchPercentage);

        // Generate summary assessment
        report.SummaryAssessment = GenerateSummaryAssessment(resumeData, report);

        // Generate recommendations
        report.Recommendations = GenerateRecommendations(report, resumeData);

        return report;
    }

    /// <summary>
    /// Extracts required skills from job description
    /// </summary>
    private List<string> ExtractRequiredSkills(string jobDescription)
    {
        var skills = new List<string>();
        var skillKeywords = new[]
        {
            // Programming languages
            "C#", "Java", "Python", "JavaScript", "TypeScript", "Go", "Rust", "PHP", "Ruby", "Swift",
            
            // Frontend frameworks
            "Angular", "React", "Vue", "Next.js",
            
            // Backend frameworks
            ".NET", "Node.js", "Express", "Django", "Spring", "Laravel", "ASP.NET",
            
            // Databases
            "PostgreSQL", "MySQL", "MongoDB", "SQL Server", "Redis",
            
            // Cloud/DevOps
            "AWS", "Azure", "GCP", "Docker", "Kubernetes", "Terraform",
            
            // Concepts
            "REST API", "GraphQL", "Microservices", "AI", "Machine Learning"
        };

        var lowerDescription = jobDescription.ToLower();
        foreach (var skill in skillKeywords)
        {
            if (lowerDescription.Contains(skill.ToLower()))
            {
                skills.Add(skill);
            }
        }

        return skills.Distinct().ToList();
    }

    /// <summary>
    /// Extracts required years of experience from job description
    /// </summary>
    private int ExtractRequiredExperience(string jobDescription)
    {
        var matches = Regex.Matches(jobDescription, @"(\d+)\s*\+?\s*years?", RegexOptions.IgnoreCase);

        if (matches.Count == 0)
        {
            return 0;
        }

        if (int.TryParse(matches[0].Groups[1].Value, out int years))
        {
            return years;
        }

        return 0;
    }

    /// <summary>
    /// Calculates skill-by-skill matching
    /// </summary>
    private List<SkillMatch> CalculateSkillMatches(
        List<string> candidateSkills,
        List<string> requiredSkills)
    {
        var matches = new List<SkillMatch>();

        foreach (var requiredSkill in requiredSkills)
        {
            var hasSkill = candidateSkills.Any(s =>
                s.Equals(requiredSkill, StringComparison.OrdinalIgnoreCase));

            var match = new SkillMatch
            {
                SkillName = requiredSkill,
                RequiredProficiency = "Proficient",
                CandidateProficiency = hasSkill ? "Proficient" : "Missing",
                MatchScore = hasSkill ? 100 : 0,
                GapAnalysis = hasSkill
                    ? $"Candidate has {requiredSkill}"
                    : $"Candidate lacks {requiredSkill}"
            };

            matches.Add(match);
        }

        return matches;
    }

    /// <summary>
    /// Calculates overall match percentage
    /// </summary>
    private int CalculateOverallMatchPercentage(
        List<SkillMatch> skillMatches,
        List<string> requiredSkills,
        int candidateExperience,
        int requiredExperience)
    {
        // Skill match: 70% weight
        int skillMatchPercentage = skillMatches.Any()
            ? (int)skillMatches.Average(s => s.MatchScore)
            : 0;

        // Experience match: 30% weight
        int experiencePercentage = 100;
        if (requiredExperience > 0)
        {
            if (candidateExperience >= requiredExperience)
            {
                experiencePercentage = 100;
            }
            else if (candidateExperience >= requiredExperience * 0.8)
            {
                experiencePercentage = 80;
            }
            else if (candidateExperience >= requiredExperience * 0.5)
            {
                experiencePercentage = 60;
            }
            else
            {
                experiencePercentage = 40;
            }
        }

        // Weighted average
        int overallMatch = (skillMatchPercentage * 70 + experiencePercentage * 30) / 100;
        return Math.Max(0, Math.Min(100, overallMatch));
    }

    /// <summary>
    /// Determines hiring recommendation based on match percentage
    /// </summary>
    private string GetHiringRecommendation(int matchPercentage)
    {
        return matchPercentage switch
        {
            >= 85 => "StrongYes",
            >= 70 => "Yes",
            >= 50 => "Maybe",
            >= 30 => "No",
            _ => "StrongNo"
        };
    }

    /// <summary>
    /// Generates a summary assessment
    /// </summary>
    private string GenerateSummaryAssessment(ResumeData resumeData, MatchReport report)
    {
        var parts = new List<string>();

        // Overall assessment
        var matchLevel = report.OverallMatchPercentage >= 80 ? "Excellent"
            : report.OverallMatchPercentage >= 60 ? "Good"
            : report.OverallMatchPercentage >= 40 ? "Fair"
            : "Poor";

        parts.Add($"Candidate shows {matchLevel} overall match ({report.OverallMatchPercentage}%)");

        // Strengths
        var matchedSkills = report.SkillMatches.Where(s => s.MatchScore == 100).ToList();
        if (matchedSkills.Any())
        {
            parts.Add($"Strengths: Proficient in {string.Join(", ", matchedSkills.Take(3).Select(s => s.SkillName))}");
        }

        // Areas of improvement
        if (report.CriticalMissingSkills.Any())
        {
            parts.Add($"Development areas: {string.Join(", ", report.CriticalMissingSkills.Take(2))}");
        }

        return string.Join(". ", parts) + ".";
    }

    /// <summary>
    /// Generates actionable recommendations for the candidate
    /// </summary>
    private List<Recommendation> GenerateRecommendations(MatchReport report, ResumeData resumeData)
    {
        var recommendations = new List<Recommendation>();

        // Critical skill recommendations
        foreach (var skill in report.CriticalMissingSkills.Take(2))
        {
            recommendations.Add(new Recommendation
            {
                Description = $"Learn {skill} - a critical skill for this role",
                Priority = "Critical",
                EstimatedEffort = "Months",
                Resources = new List<string>
                {
                    $"Online courses for {skill}",
                    "Practice projects",
                    "Certifications"
                }
            });
        }

        // Experience recommendations
        if (resumeData.YearsOfExperience < 2)
        {
            recommendations.Add(new Recommendation
            {
                Description = "Gain more hands-on experience through internships or projects",
                Priority = "High",
                EstimatedEffort = "Months",
                Resources = new List<string> { "Internships", "Open source projects", "Freelance work" }
            });
        }

        // Education recommendations
        if (!resumeData.Education.Any())
        {
            recommendations.Add(new Recommendation
            {
                Description = "Complete relevant degree or professional certification",
                Priority = "High",
                EstimatedEffort = "Years",
                Resources = new List<string> { "University programs", "Online degrees", "Boot camps" }
            });
        }

        return recommendations;
    }
}
