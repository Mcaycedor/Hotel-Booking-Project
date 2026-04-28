import 'package:flutter/foundation.dart';

import '../models/models.dart';
import '../services/assessment_api_service.dart';

/// Assessment state provider using Provider pattern
/// Manages assessment data, API interactions, and UI state
class AssessmentProvider extends ChangeNotifier {
  final AssessmentApiService _apiService = AssessmentApiService();

  // State variables
  Assessment? _currentAssessment;
  MatchReport? _matchReport;
  List<CandidateResponse> _responses = [];
  String? _error;
  bool _isLoading = false;
  String _loadingMessage = '';

  // Getters
  Assessment? get currentAssessment => _currentAssessment;
  MatchReport? get matchReport => _matchReport;
  List<CandidateResponse> get responses => _responses;
  String? get error => _error;
  bool get isLoading => _isLoading;
  String get loadingMessage => _loadingMessage;

  /// Creates a new assessment
  Future<String?> createAssessment({
    required String resumeText,
    required String jobDescription,
    required int questionCount,
  }) async {
    try {
      _setLoading(
        true,
        'Analyzing resume and generating interview questions...',
      );
      _error = null;

      final response = await _apiService.createAssessment(
        resumeText: resumeText,
        jobDescription: jobDescription,
        questionCount: questionCount,
      );

      final assessmentId = response['assessmentId'] as String?;
      if (assessmentId == null) {
        throw Exception('Assessment ID not received');
      }

      // Fetch full assessment
      await fetchAssessment(assessmentId);
      return assessmentId;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return null;
    } finally {
      _setLoading(false);
    }
  }

  /// Fetches an assessment by ID
  Future<void> fetchAssessment(String assessmentId) async {
    try {
      _setLoading(true, 'Loading assessment...');
      _error = null;

      _currentAssessment = await _apiService.getAssessment(assessmentId);

      // Initialize responses with question IDs
      if (_currentAssessment != null) {
        _responses = _currentAssessment!.interviewQuestions
            .asMap()
            .entries
            .map(
              (entry) => CandidateResponse(
                id: 'response-${entry.key}',
                questionId: entry.value.id,
                candidateAnswer: '',
                submittedAt: DateTime.now(),
              ),
            )
            .toList();
      }

      notifyListeners();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    } finally {
      _setLoading(false);
    }
  }

  /// Updates a response answer
  void updateResponse(int index, String answer) {
    if (index >= 0 && index < _responses.length) {
      _responses[index] = CandidateResponse(
        id: _responses[index].id,
        questionId: _responses[index].questionId,
        candidateAnswer: answer,
        submittedAt: DateTime.now(),
      );
      notifyListeners();
    }
  }

  /// Submits all responses
  Future<bool> submitResponses() async {
    try {
      if (_currentAssessment == null) {
        throw Exception('No assessment loaded');
      }

      _setLoading(true, 'Submitting your answers...');
      _error = null;

      await _apiService.submitResponses(_currentAssessment!.id, _responses);

      // Fetch updated assessment
      await fetchAssessment(_currentAssessment!.id);
      _matchReport = _currentAssessment?.initialMatchReport;

      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    } finally {
      _setLoading(false);
    }
  }

  /// Gets assessment history
  Future<List<Map<String, dynamic>>> getAssessmentHistory(String email) async {
    try {
      _setLoading(true, 'Loading history...');
      _error = null;

      final response = await _apiService.getAssessmentHistory(email);
      final assessments = List<Map<String, dynamic>>.from(
        response['assessments'] ?? [],
      );

      notifyListeners();
      return assessments;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return [];
    } finally {
      _setLoading(false);
    }
  }

  /// Clears all state
  void clearAssessment() {
    _currentAssessment = null;
    _matchReport = null;
    _responses = [];
    _error = null;
    notifyListeners();
  }

  /// Sets or clears error message
  void setError(String? error) {
    _error = error;
    notifyListeners();
  }

  // Private helpers
  void _setLoading(bool loading, [String message = '']) {
    _isLoading = loading;
    _loadingMessage = message;
    notifyListeners();
  }

  @override
  void dispose() {
    _apiService.dispose();
    super.dispose();
  }
}
