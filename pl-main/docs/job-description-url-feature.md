# Job description URL Feature

## Overview

The job description component now supports two input modes:
1. **Paste Text** - Directly paste the job posting text
2. **Provide URL** - Enter a link to the job posting, and the system fetches and extracts the text automatically

## Backend Implementation

### New Service: `HtmlContentExtractorService`

Located in: `libs/api/services-lib/Services/HtmlContentExtractorService.cs`

**Capabilities:**
- Fetches HTML content from URLs with proper timeout handling
- Extracts plain text from HTML pages
- Intelligently identifies job description sections using CSS selectors
- Removes unwanted elements (scripts, navigation, footer)
- Returns cleaned, normalized text

**Key Methods:**
```csharp
Task<string> ExtractTextFromUrlAsync(string url, CancellationToken cancellationToken)
bool IsValidUrl(string url)
```

### Updated DTOs

**Assessment.cs** - DTOs now include:
```csharp
public string JobDescriptionSourceType { get; set; } = "text"; // "text" or "url"
public string? JobDescriptionUrl { get; set; } // Original URL
```

### New API Endpoint

**POST `/api/assessments/create-from-url`**

Creates an assessment by fetching job description from a URL:

```http
POST /api/assessments/create-from-url
Content-Type: application/json

{
  "resumeText": "...",
  "jobDescriptionUrl": "https://example.com/jobs/senior-engineer",
  "questionCount": 5
}
```

Response:
```json
{
  "assessmentId": "xxx",
  "candidateName": "...",
  "initialMatchPercentage": 75,
  "questionCount": 5,
  "jobDescriptionSourceUrl": "https://example.com/jobs/senior-engineer"
}
```

## Frontend Implementation

### Updated Component: `JobDescriptionComponent`

Located in: `libs/web/components/src/lib/assessment-page/components/job-description/job-description.component.ts`

**New Properties:**
```typescript
inputMode: 'text' | 'url' = 'text';
jobDescriptionUrl: string = '';
```

**Updated Interface:**
```typescript
export interface JobDescriptionInput {
  jobDescription: string;
  questionCount: number;
  sourceType: 'text' | 'url';
  sourceUrl?: string;
}
```

**New Methods:**
```typescript
isValidUrl(): boolean  // Validates URL format
onUrlChange(): void    // Handles URL input changes
```

### UI Features

- Radio button selection between "Paste Text" and "Provide URL" modes
- URL input field with real-time validation
- Helpful messaging about what happens when URL is provided
- Character counter updates based on input mode
- All existing question count selection features preserved

## Usage Examples

### Example 1: Fetch from LinkedIn Job Post

```
1. Select "🔗 Provide URL" option
2. Enter: https://www.linkedin.com/jobs/view/1234567890/
3. System fetches page and extracts job description
4. Select question count (5, 10, or 15)
5. Click "Analyze Resume & Job Description"
```

### Example 2: Fetch from Company Career Page

```
1. Select "🔗 Provide URL" option
2. Enter: https://careers.example.com/jobs/senior-backend-engineer
3. System extracts job requirements and responsibilities
4. Proceeds with assessment
```

### Example 3: Paste Text (Original Method)

```
1. Select "📝 Paste Text" option
2. Copy and paste job description from any source
3. Provide at least 50 characters
4. Select question count
5. Analyze
```

## Technical Details

### HTML Parsing Strategy

The `HtmlContentExtractorService` uses the following approach:

1. **Fetch Phase**
   - Respects HTTP timeouts (30 seconds max)
   - Uses realistic User-Agent header
   - Follows redirects automatically

2. **Content Identification**
   - Tries common job description CSS selectors:
     - `.job-description`
     - `.job-posting`
     - `[data-qa='jobDescription']`
     - `article`, `main`, `section[role='main']`

3. **Text Extraction**
   - Removes unwanted elements: scripts, styles, navigation, footer
   - Cleans excessive whitespace
   - Normalizes line breaks
   - Returns human-readable plain text

4. **Error Handling**
   - Validates URL format before fetching
   - Catches HTTP errors with detailed messages
   - Handles timeouts gracefully
   - Provides user-friendly error feedback

### Dependencies

**New NuGet Package:**
- `HtmlAgilityPack` v1.11.59 - HTML parsing library

### Service Registration

In `ServiceCollectionExtensions.cs`:
```csharp
services.AddHttpClient<IHtmlContentExtractorService, HtmlContentExtractorService>();
```

## Testing

### Unit Tests

Test scenarios:
- Valid URL format validation
- Invalid URL format rejection
- HTML content extraction from various job posting sites
- Timeout handling
- Network error handling
- Empty response handling

### Integration Tests

Example test flow:
```
1. Upload resume
2. Provide job posting URL
3. Verify extracted text
4. Check assessment creation
5. Verify question generation
```

### Manual Testing

Test cases:
1. **LinkedIn Job Post**
   - Fetch from LinkedIn career page
   - Verify text is properly extracted

2. **Company Careers Page**
   - Test with various company career pages
   - Verify formatting preservation

3. **Error Scenarios**
   - Invalid URLs (should show error)
   - 404 pages (should handle gracefully)
   - Timeout (should retry or timeout gracefully)
   - HTTPS-only URLs (should work fine)

## Configuration

### Optional: Customize Timeouts

In `HtmlContentExtractorService.cs`:
```csharp
_httpClient.Timeout = TimeSpan.FromSeconds(30); // Modify as needed
```

### Optional: Add More CSS Selectors

To support additional job posting formats, add more selectors to:
```csharp
private static readonly string[] JobDescriptionSelectors = new[]
{
    // Add more selectors here for additional sites
    ".custom-job-class",  // Example
    ".job-content"        // Example
};
```

## Security Considerations

✅ **Already Implemented:**
- URL validation before fetching
- Timeout protection (30 seconds max)
- Content-type checking
- No eval or dynamic code execution
- Plain text extraction only

⚠️ **Best Practices:**
- Monitor for suspicious URLs in logs
- Rate limit URL fetching if needed
- Log all URL fetch attempts for audit
- Consider adding URL whitelist for sensitive environments

## Future Enhancements

1. **Caching**
   - Cache extracted URLs to reduce repeated fetches
   - Implement TTL-based cache invalidation

2. **Rate Limiting**
   - Limit URL fetches per user/IP
   - Prevent abuse of external fetching

3. **Advanced Parsing**
   - LLM-based section identification
   - Structured data extraction (salary, benefits, etc.)

4. **Format Support**
   - PDF URL fetching
   - Email parsing
   - Direct API integration with job boards

5. **Analytics**
   - Track most commonly used job sources
   - Monitor URL fetch success rates
   - Identify problematic websites

## Troubleshooting

### URL Not Being Extracted

**Issue:** System can't find job description on page

**Solutions:**
1. Check if website has dynamic content (requires Selenium/Playwright)
2. Try a direct link to job posting (not job search results)
3. Copy and paste text instead

### Timeout Errors

**Issue:** "Request timeout" error

**Solutions:**
1. Check internet connection
2. Try a different URL
3. Increase timeout in configuration

### Incomplete Text Extraction

**Issue:** Job description is incomplete or missing sections

**Solutions:**
1. Manually add missing sections using paste mode
2. Report issue with specific URL for investigation
3. Try alternative URL source if available

## Support

For issues or questions:
1. Check the logs for detailed error messages
2. Test with the alternate Paste Text method
3. Report URLs that don't work properly
4. Submit enhancement requests

---

**Last Updated:** March 2026  
**Version:** 1.0.0

