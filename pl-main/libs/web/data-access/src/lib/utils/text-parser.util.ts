/**
 * Text parsing utility for extracting structured data from resume and job description text
 */

export interface ParsedResume {
  name?: string;
  email?: string;
  phone?: string;
  skills: string[];
  yearsOfExperience: number;
  education: string[];
  certifications: string[];
  previousRoles: string[];
  summary: string;
}

export interface ParsedJobDescription {
  jobTitle?: string;
  company?: string;
  requiredSkills: string[];
  niceToHaveSkills: string[];
  yearsRequired: number;
  responsibilities: string[];
  summary: string;
}

/**
 * Common technical skills database for matching
 */
const KNOWN_SKILLS = [
  // Frontend
  'angular', 'react', 'vue', 'typescript', 'javascript', 'html', 'css', 'sass', 'scss',
  'rxjs', 'redux', 'state management', 'material design',
  
  // Backend
  'nodejs', 'node.js', 'python', 'java', 'c#', 'csharp', 'php', 'go', 'rust',
  '.net', 'dotnet', 'asp.net', 'spring', 'django', 'flask',
  
  // Databases
  'sql', 'mysql', 'postgresql', 'mongodb', 'firebase', 'redis', 'elasticsearch',
  'oracle', 'mssql', 'dynamodb',
  
  // DevOps/Cloud
  'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'google cloud', 'jenkins',
  'ci/cd', 'devops', 'terraform', 'ansible',
  
  // APIs & Communication
  'rest api', 'rest', 'graphql', 'websocket', 'http', 'soap', 'grpc',
  
  // Testing
  'jest', 'mocha', 'jasmine', 'cypress', 'selenium', 'junit', 'nunit',
  'unit testing', 'integration testing', 'e2e', 'end-to-end',
  
  // Version Control
  'git', 'github', 'gitlab', 'bitbucket', 'svn', 'mercurial',
  
  // Other
  'nx', 'webpack', 'vite', 'npm', 'yarn', 'pnpm', 'agile', 'scrum', 'jira',
  'linux', 'windows', 'macos', 'unix', 'bash', 'powershell', 'shell',
  'debugging', 'performance', 'optimization', 'architecture', 'design patterns',
  'oop', 'functional programming', 'microservices', 'monolith',
];

/**
 * Parse resume text and extract structured data
 */
export function parseResume(resumeText: string): ParsedResume {
  const textLower = resumeText.toLowerCase();
  
  // Extract skills
  const skills = extractSkills(textLower);
  
  // Extract years of experience (look for patterns like "X years", "X+ years")
  const yearsMatch = resumeText.match(/(\d+)\s*\+?\s*years\s+(?:of\s+)?experience/i);
  const yearsOfExperience = yearsMatch ? parseInt(yearsMatch[1]) : 5;
  
  // Extract education (look for degree patterns)
  const education = extractEducation(resumeText);
  
  // Extract certifications
  const certifications = extractCertifications(resumeText);
  
  // Extract job titles/roles
  const previousRoles = extractRoles(resumeText);
  
  // Extract name (usually at the beginning)
  const name = extractName(resumeText);
  
  // Extract email
  const email = extractEmail(resumeText);
  
  // Extract phone
  const phone = extractPhone(resumeText);
  
  // Create summary from skills
  const summary = `Experienced professional with ${yearsOfExperience} years of experience. ${skills.length > 0 ? `Key skills: ${skills.slice(0, 5).join(', ')}.` : ''}`;
  
  return {
    name,
    email,
    phone,
    skills,
    yearsOfExperience,
    education,
    certifications,
    previousRoles,
    summary,
  };
}

/**
 * Parse job description text and extract structured data
 */
export function parseJobDescription(jobDescText: string): ParsedJobDescription {
  const textLower = jobDescText.toLowerCase();
  
  // Extract required skills
  const requiredSkills = extractSkills(textLower, true);
  
  // Extract nice-to-have skills (usually after "nice to have", "preferred", "desirable")
  const niceToHaveMatch = jobDescText.match(
    /(?:nice to have|preferred|desirable|bonus|plus)\s*:?\s*([^.]*?)(?:\.|$|requirements|responsibilities)/is
  );
  const niceToHaveText = niceToHaveMatch ? niceToHaveMatch[1] : '';
  const niceToHaveSkills = extractSkills(niceToHaveText.toLowerCase(), true);
  
  // Extract years required
  const yearsMatch = jobDescText.match(/(\d+)\s*\+?\s*years\s+(?:of\s+)?(?:experience|working)/i);
  const yearsRequired = yearsMatch ? parseInt(yearsMatch[1]) : 3;
  
  // Extract job title (usually in heading or first line)
  const jobTitle = extractJobTitle(jobDescText);
  
  // Extract company name (look for "Company:", "at", etc.)
  const company = extractCompanyName(jobDescText);
  
  // Extract responsibilities
  const responsibilities = extractResponsibilities(jobDescText);
  
  // Create summary
  const summary = `${jobTitle || 'Position'} with ${yearsRequired} years of experience required. Key skills: ${requiredSkills.slice(0, 4).join(', ')}.`;
  
  return {
    jobTitle,
    company,
    requiredSkills,
    niceToHaveSkills,
    yearsRequired,
    responsibilities,
    summary,
  };
}

/**
 * Extract skills from text
 */
function extractSkills(text: string, strict = false): string[] {
  const foundSkills = new Set<string>();
  
  KNOWN_SKILLS.forEach(skill => {
    // Match whole skill words (case-insensitive)
    const regex = new RegExp(`\\b${skill}\\b`, 'gi');
    if (regex.test(text)) {
      foundSkills.add(capitalizeSkill(skill));
    }
  });
  
  return Array.from(foundSkills).sort();
}

/**
 * Extract education/degree information - only from dedicated sections
 */
function extractEducation(text: string): string[] {
  // Only look for education in a dedicated section (more strict)
  const eduSectionPattern = /(?:education|academic|qualifications?)\s*:?\s*([\s\S]*?)(?:\n\n|experience|skills|certifications|$)/i;
  const eduSection = text.match(eduSectionPattern);
  
  if (!eduSection) {
    return [];
  }
  
  const educationText = eduSection[1];
  const degrees = new Set<string>();
  
  // Look for degree patterns within the education section
  const degreePatterns = [
    /(?:bachelor|bs|b\.s|b\.a|bachelors?)\s+(?:of\s+)?(?:science|arts|engineering)?\s+(?:in\s+)?([^,.\n]*)/gi,
    /(?:master|ms|m\.s|m\.a|masters?|mba)\s+(?:in\s+)?([^,.\n]*)/gi,
    /(?:phd|ph\.d|doctorate)\s+(?:in\s+)?([^,.\n]*)/gi,
    /(?:diploma|associate|certificate|professional diploma)\s+(?:in\s+)?([^,.\n]*)/gi,
  ];
  
  degreePatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(educationText)) !== null) {
      const degree = match[0].trim();
      if (degree.length > 5 && degree.length < 150) {
        degrees.add(degree);
      }
    }
  });
  
  return Array.from(degrees);
}

/**
 * Extract certifications - only from dedicated sections
 */
function extractCertifications(text: string): string[] {
  // Only look for certifications in a dedicated section (more strict)
  const certSectionPattern = /(?:certifications|certified|credentials?)\s*:?\s*([\s\S]*?)(?:\n\n|education|experience|skills|$)/i;
  const certSection = text.match(certSectionPattern);
  
  if (!certSection) {
    return [];
  }
  
  const certs = new Set<string>();
  const certText = certSection[1];
  
  // Split by common separators
  const certLines = certText.split(/[,.\n•\-*]/).map(line => line.trim()).filter(line => line.length > 3 && line.length < 100);
  
  // Filter to only include lines that look like actual certifications
  certLines.forEach(line => {
    // Only include if it contains cert keywords or looks like a cert name
    if (
      /(?:aws|azure|gcp|cisco|comptia|oracle|salesforce|certified|cert\b|certification|credential)/i.test(line) ||
      (line.length > 10 && /[A-Z]{2,}/.test(line)) // Capital letter patterns like AWS, GCP
    ) {
      certs.add(line);
    }
  });
  
  return Array.from(certs);
}

/**
 * Extract job titles/roles
 */
function extractRoles(text: string): string[] {
  const rolePatterns = [
    /(?:as\s+|titled?\s+)?(?:a\s+)?([a-z ]{5,40}(?:developer|engineer|architect|manager|lead|director|specialist|analyst))/gi,
    /(?:position|role|title)\s*:?\s*([^,.\n]+)/gi,
  ];
  
  const roles = new Set<string>();
  rolePatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const role = match[1].trim();
      if (role.length > 3 && role.length < 50) {
        roles.add(role);
      }
    }
  });
  
  return Array.from(roles).slice(0, 5);
}

/**
 * Extract name from text (assume first line or name pattern)
 */
function extractName(text: string): string | undefined {
  const lines = text.split('\n');
  const firstLine = lines[0]?.trim();
  
  // Look for a name pattern (Capital Letter(s) at start)
  const nameMatch = firstLine?.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
  
  if (nameMatch && nameMatch[1] && !nameMatch[1].toLowerCase().includes('experience')) {
    return nameMatch[1];
  }
  
  return undefined;
}

/**
 * Extract email from text
 */
function extractEmail(text: string): string | undefined {
  const emailMatch = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  return emailMatch ? emailMatch[1] : undefined;
}

/**
 * Extract phone number from text
 */
function extractPhone(text: string): string | undefined {
  const phoneMatch = text.match(/(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/);
  return phoneMatch ? `${phoneMatch[1]}-${phoneMatch[2]}-${phoneMatch[3]}` : undefined;
}

/**
 * Extract job title from job description
 */
function extractJobTitle(text: string): string | undefined {
  // Usually the job title is in the first line or after "Position:", "Job Title:", etc.
  const titleMatch = text.match(
    /(?:position|job title|role|hiring for)\s*:?\s*([^\n.]+)/i
  );
  
  if (titleMatch) {
    return titleMatch[1].trim();
  }
  
  // Try first line as fallback
  const firstLine = text.split('\n')[0]?.trim();
  if (firstLine && firstLine.length > 3 && firstLine.length < 100) {
    return firstLine;
  }
  
  return undefined;
}

/**
 * Extract company name from job description
 */
function extractCompanyName(text: string): string | undefined {
  const companyMatch = text.match(/(?:company|at|organization)\s*:?\s*([^\n.]+)/i);
  return companyMatch ? companyMatch[1].trim() : undefined;
}

/**
 * Extract responsibilities from job description
 */
function extractResponsibilities(text: string): string[] {
  const respPatterns = [
    /(?:responsibilities|duties|role includes|tasks?)\s*:?\s*([\s\S]*?)(?:requirements|qualifications|skills|$)/i,
  ];
  
  const responsibilities: string[] = [];
  
  respPatterns.forEach(pattern => {
    const match = text.match(pattern);
    if (match) {
      const respText = match[1];
      // Split by bullet points, numbers, or line breaks
      const items = respText.split(/[•\-*\n]\s*/).filter(item => item.trim().length > 5);
      responsibilities.push(...items.slice(0, 5));
    }
  });
  
  // If no responsibilities found, extract bullet points generally
  if (responsibilities.length === 0) {
    const bulletPoints = text.match(/[•\-*]\s*([^•\-*\n]+)/g);
    if (bulletPoints) {
      responsibilities.push(...bulletPoints.map(bp => bp.replace(/^[•\-*]\s*/, '').trim()).slice(0, 5));
    }
  }
  
  return responsibilities.filter(r => r.length > 3 && r.length < 200);
}

/**
 * Capitalize skill name properly
 */
function capitalizeSkill(skill: string): string {
  return skill
    .split(/[\s\.\/\-]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Calculate match score between resume and job description
 */
export function calculateMatchScore(resume: ParsedResume, jobDesc: ParsedJobDescription): {
  skillScore: number;
  experienceScore: number;
  overallScore: number;
  matchedSkills: string[];
  missingSkills: string[];
} {
  // Calculate skill match
  const resumeSkillsLower = resume.skills.map(s => s.toLowerCase());
  const requiredSkillsLower = jobDesc.requiredSkills.map(s => s.toLowerCase());
  
  const matchedSkills = requiredSkillsLower.filter(skill =>
    resumeSkillsLower.some(rSkill => rSkill.includes(skill) || skill.includes(rSkill))
  );
  
  const missingSkills = requiredSkillsLower.filter(skill => !matchedSkills.includes(skill));
  
  const skillScore = requiredSkillsLower.length > 0
    ? (matchedSkills.length / requiredSkillsLower.length) * 100
    : 0;
  
  // Calculate experience match
  const experienceMatch = Math.min((resume.yearsOfExperience / jobDesc.yearsRequired) * 100, 100);
  
  // Overall score: 70% skills, 30% experience
  const overallScore = Math.round((skillScore * 0.7) + (experienceMatch * 0.3));
  
  return {
    skillScore: Math.round(skillScore),
    experienceScore: Math.round(experienceMatch),
    overallScore,
    matchedSkills: matchedSkills.map(s => capitalizeSkill(s)),
    missingSkills: missingSkills.map(s => capitalizeSkill(s)),
  };
}
