# PfGenPlatform.Services

API Services utility library for the PF GEN Platform containing helper methods and common functionality for API development.

## Features

- **Greeting Service**: Simple greeting functionality
- **API Extension Methods**: Extension methods for configuring GEN Platform API endpoints

### Basic Greeting Functionality

```csharp
using Gen.Platform.Services;

// Basic greeting
string greeting = Greeting.SayHello("John");
// Returns: "Hello, John!"

// Null-safe greeting
string defaultGreeting = Greeting.SayHello(null);
// Returns: "Hello, World!"
```

### API Endpoint Extensions

```csharp
using Gen.Platform.Services;

// In your Program.cs or API configuration
var app = builder.Build();

// Map GEN Platform endpoints
app.MapGenPlatformEndpoints();

// This adds:
// GET /api/services/hello/{name} - Returns greeting with timestamp
```

### Example API Response

```json
{
  "message": "Hello, John!",
  "timestamp": "2025-12-05T10:30:00.000Z"
}
```

## Installation

Install the package via NuGet Package Manager:

```
Install-Package PfGenPlatform.Services
```

Or via .NET CLI:

```
dotnet add package PfGenPlatform.Services
```
