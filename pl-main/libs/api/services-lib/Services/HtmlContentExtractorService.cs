using System.Net.Http;
using System.Text.RegularExpressions;
using HtmlAgilityPack;
using Gen.StarterApp.Services.Dtos;
using Microsoft.Extensions.Logging;

namespace Gen.StarterApp.Api.Services;

/// <summary>
/// Service for extracting text content from HTML pages (job postings, etc.)
/// </summary>
public interface IHtmlContentExtractorService
{
    /// <summary>
    /// Fetches and extracts plain text content from a URL
    /// </summary>
    /// <param name="url">The URL to fetch</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Plain text content extracted from the HTML page</returns>
    Task<string> ExtractTextFromUrlAsync(string url, CancellationToken cancellationToken = default);

    /// <summary>
    /// Validates if a URL is properly formatted
    /// </summary>
    /// <param name="url">URL to validate</param>
    /// <returns>True if URL is valid; false otherwise</returns>
    bool IsValidUrl(string url);
}

/// <summary>
/// Implementation of HTML content extraction service
/// </summary>
public class HtmlContentExtractorService : IHtmlContentExtractorService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<HtmlContentExtractorService> _logger;

    // Common job posting CSS selectors and element patterns
    private static readonly string[] JobDescriptionSelectors = new[]
    {
        "main", "article", ".job-description", ".job-posting",
        "[data-qa='jobDescription']", ".description", ".content",
        "section[role='main']", "div.posting"
    };

    // Elements to exclude from extraction
    private static readonly string[] ExcludeSelectors = new[]
    {
        "script", "style", "meta", "link", "noscript", "iframe",
        ".navigation", ".header", ".footer", ".sidebar", ".ads",
        ".comments", ".social", ".share", ".apply-button"
    };

    public HtmlContentExtractorService(HttpClient httpClient, ILogger<HtmlContentExtractorService> logger)
    {
        _httpClient = httpClient ?? throw new ArgumentNullException(nameof(httpClient));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));

        // Set reasonable timeout and user agent
        _httpClient.Timeout = TimeSpan.FromSeconds(30);
        _httpClient.DefaultRequestHeaders.Add("User-Agent",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
    }

    /// <summary>
    /// Fetches HTML from URL and extracts plain text content
    /// </summary>
    public async Task<string> ExtractTextFromUrlAsync(string url, CancellationToken cancellationToken = default)
    {
        try
        {
            // Validate URL format
            if (!IsValidUrl(url))
            {
                throw new ArgumentException($"Invalid URL format: {url}");
            }

            _logger.LogInformation("Fetching content from URL: {Url}", url);

            // Fetch HTML content
            var response = await _httpClient.GetAsync(url, cancellationToken);
            response.EnsureSuccessStatusCode();

            var htmlContent = await response.Content.ReadAsStringAsync(cancellationToken);

            if (string.IsNullOrWhiteSpace(htmlContent))
            {
                throw new InvalidOperationException("No content retrieved from URL");
            }

            // Load and parse HTML
            var doc = new HtmlDocument();
            doc.LoadHtml(htmlContent);

            // Extract text content
            var extractedText = ExtractTextFromHtmlDocument(doc);

            if (string.IsNullOrWhiteSpace(extractedText))
            {
                throw new InvalidOperationException("Could not extract text content from HTML");
            }

            _logger.LogInformation("Successfully extracted {CharCount} characters from URL", extractedText.Length);
            return extractedText;
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "HTTP error fetching URL: {Url}", url);
            throw new InvalidOperationException($"Failed to fetch URL: {ex.Message}", ex);
        }
        catch (OperationCanceledException ex)
        {
            _logger.LogError(ex, "Request timeout for URL: {Url}", url);
            throw new InvalidOperationException($"Request timeout: {ex.Message}", ex);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error extracting content from URL: {Url}", url);
            throw new InvalidOperationException($"Error extracting content: {ex.Message}", ex);
        }
    }

    /// <summary>
    /// Validates URL format
    /// </summary>
    public bool IsValidUrl(string url)
    {
        if (string.IsNullOrWhiteSpace(url))
        {
            return false;
        }

        try
        {
            var uri = new Uri(url);
            return uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps;
        }
        catch
        {
            return false;
        }
    }

    /// <summary>
    /// Extracts plain text from HTML document, prioritizing job description content
    /// </summary>
    private string ExtractTextFromHtmlDocument(HtmlDocument doc)
    {
        // First, try to find and extract from job-specific sections
        var mainContent = FindMainContent(doc);

        if (mainContent != null)
        {
            var text = ExtractTextFromNode(mainContent);
            if (!string.IsNullOrWhiteSpace(text) && text.Length > 100)
            {
                return text;
            }
        }

        // Fallback to extracting from body
        var bodyNode = doc.DocumentNode.SelectSingleNode("//body");
        if (bodyNode != null)
        {
            return ExtractTextFromNode(bodyNode);
        }

        // Last resort: extract all text
        return ExtractTextFromNode(doc.DocumentNode);
    }

    /// <summary>
    /// Finds the main content node that likely contains the job description
    /// </summary>
    private HtmlNode? FindMainContent(HtmlDocument doc)
    {
        // Try common job description selectors
        foreach (var selector in JobDescriptionSelectors)
        {
            try
            {
                var node = doc.DocumentNode.SelectSingleNode($"//{selector}");
                if (node != null && HasSignificantContent(node))
                {
                    return node;
                }
            }
            catch
            {
                // Continue to next selector if XPath fails
            }
        }

        return null;
    }

    /// <summary>
    /// Checks if a node has sufficient text content
    /// </summary>
    private bool HasSignificantContent(HtmlNode node)
    {
        var text = node.InnerText?.Trim() ?? string.Empty;
        return text.Length > 50; // At least 50 characters
    }

    /// <summary>
    /// Recursively extracts text from HTML node, removing unwanted elements
    /// </summary>
    private string ExtractTextFromNode(HtmlNode node)
    {
        // Clone to avoid modifying original
        var clonedNode = node.CloneNode(true);

        // Remove unwanted elements
        foreach (var selector in ExcludeSelectors)
        {
            try
            {
                var unwantedNodes = clonedNode.SelectNodes($"//{selector}");
                foreach (var unwantedNode in unwantedNodes ?? new HtmlNodeCollection(null))
                {
                    unwantedNode.Remove();
                }
            }
            catch
            {
                // Continue if selector fails
            }
        }

        // Extract and clean text
        var text = clonedNode.InnerText;

        // Clean up whitespace and normalize
        text = Regex.Replace(text, @"\s+", " "); // Replace multiple spaces with single space
        text = Regex.Replace(text, @"[\r\n]+", "\n"); // Normalize line breaks
        text = text.Trim();

        return text;
    }
}
