# Profiler Mobile - Flutter App

Candidate Assessment & Interview Preparation Mobile Application

## Overview

A Flutter-based mobile application for candidate assessment and interview preparation. Features AI-powered interview question generation and job match analysis to help candidates prepare for interviews and assess their fit for job positions.

## Features

- 📱 **Resume Analysis** - Upload and analyze candidate resumes
- 🤖 **AI Interview Questions** - Generate dynamic interview questions based on resume and job description
- 📊 **Match Analysis** - Calculate job-candidate fit with skill matching and gap analysis
- 💾 **Assessment History** - Track assessment progress and historical results
- 🎨 **Beautiful UI** - Modern, responsive design with gradient themes
- 🔄 **State Management** - Efficient state management using Provider pattern

## Project Structure

```
lib/
├── main.dart                      # Application entry point
├── models/
│   └── models.dart               # Data models (DTOs)
├── services/
│   └── assessment_api_service.dart # API communication
├── providers/
│   └── assessment_provider.dart   # State management
├── screens/
│   ├── home_screen.dart
│   ├── resume_screen.dart
│   ├── job_description_screen.dart
│   ├── questions_screen.dart
│   └── results_screen.dart
├── routes/
│   └── app_routes.dart            # Navigation configuration
└── theme/
    └── app_theme.dart             # Theme configuration
```

## Tech Stack

- **Framework**: Flutter 3.0+
- **Language**: Dart 3.0+
- **State Management**: Provider
- **Navigation**: GoRouter
- **HTTP Client**: http package
- **JSON**: json_annotation, json_serializable
- **Utilities**: equatable, intl

## Getting Started

### Prerequisites

- Flutter SDK 3.0 or later
- Dart SDK 3.0 or later
- An IDE (VS Code, Android Studio, or IntelliJ)
- Backend API running (default: `http://localhost:5000/api`)

### Installation

1. **Navigate to project directory**
   ```bash
   cd apps/mobile
   ```

2. **Get dependencies**
   ```bash
   flutter pub get
   ```

3. **Generate JSON serialization code**
   ```bash
   flutter pub run build_runner build --delete-conflicting-outputs
   ```

### Running the Application

#### Development
```bash
flutter run -d <device-id>
```

Replace `<device-id>` with:
- `chrome` - for web
- Device name or ID for physical device
- Emulator ID for emulator

#### Build for Release

**Android**
```bash
flutter build apk --release
```

**iOS**
```bash
flutter build ios --release
```

**Web**
```bash
flutter build web --release
```

## Configuration

### API Base URL

Edit `lib/services/assessment_api_service.dart`:

```dart
AssessmentApiService({this.baseUrl = 'http://localhost:5000/api'})
```

For production, update to your API endpoint:
```dart
AssessmentApiService({this.baseUrl = 'https://api.example.com/api'})
```

### Theme

Customize theme colors in `lib/theme/app_theme.dart`:

```dart
static const Color primaryColor = Color(0xFF667EEA);
static const Color primaryDark = Color(0xFF764BA2);
```

## API Integration

### Create Assessment
```
POST /api/assessments/create
{
  "resumeText": "...",
  "jobDescription": "...",
  "questionCount": 5
}
```

### Get Assessment
```
GET /api/assessments/{assessmentId}
```

### Submit Responses
```
POST /api/assessments/{assessmentId}/submit-responses
{
  "responses": [
    {
      "id": "response-0",
      "questionId": "q1",
      "candidateAnswer": "...",
      "submittedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Get Assessment History
```
GET /api/assessments/history/{candidateEmail}
```

## Code Generation

The project uses `json_serializable` for code generation. After modifying models:

```bash
flutter pub run build_runner build --delete-conflicting-outputs
```

Watch mode (for development):
```bash
flutter pub run build_runner watch --delete-conflicting-outputs
```

## Testing

### Unit Tests
```bash
flutter test
```

### Run specific test
```bash
flutter test test/path/to/test.dart
```

### Generate coverage
```bash
flutter test --coverage
```

## Linting & Analysis

### Analyze code
```bash
flutter analyze
```

### Format code
```bash
dart format lib/
```

### Fix issues automatically
```bash
dart fix --apply
```

## Build Sizing

### Analyze build size
```bash
flutter build apk --analyze-size
```

### Size insights
```bash
flutter build apk --release
flutter test test/ --coverage
```

## Debugging

### Enable verbose logging
```bash
flutter run -v
```

### Debug on device
```bash
flutter attach
```

### Check device logs
```bash
flutter logs
```

## Performance Tips

1. Use `const` constructors where possible
2. Lazy load screens with GoRouter
3. Cache API responses using shared_preferences
4. Use `RepaintBoundary` for expensive widgets
5. Profile with DevTools: `flutter pub global activate devtools`

## Common Issues

### JSON Serialization not generating
```bash
flutter pub run build_runner build --delete-conflicting-outputs
```

### API connection errors
- Ensure backend is running
- Check API base URL configuration
- Verify network connectivity

### Navigation issues
- Ensure routes are defined in `app_routes.dart`
- Check GoRouter initialization in `main.dart`

## Project Statistics

- **Screens**: 5 (Home, Resume, Job Description, Questions, Results)
- **Models**: 6 (Assessment, InterviewQuestion, CandidateResponse, etc.)
- **API Methods**: 4 (Create, Get, Submit, History)
- **Lines of Code**: ~2,000+

## Future Enhancements

- [ ] Offline support with local caching
- [ ] Photo/file upload for resume
- [ ] Real-time collaboration features
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Push notifications
- [ ] Video interview recording
- [ ] Performance metrics and analytics

## Contributing

1. Create feature branch (`git checkout -b feature/amazing-feature`)
2. Commit changes (`git commit -m 'Add amazing feature'`)
3. Push to branch (`git push origin feature/amazing-feature`)
4. Open Pull Request

## License

This project is proprietary and confidential.

## Support

For issues, questions, or suggestions:
- Create an issue in the repository
- Contact the development team
- Check existing documentation

## References

- [Flutter Docs](https://flutter.dev/docs)
- [Dart Docs](https://dart.dev/guides)
- [GoRouter](https://pub.dev/packages/go_router)
- [Provider](https://pub.dev/packages/provider)
