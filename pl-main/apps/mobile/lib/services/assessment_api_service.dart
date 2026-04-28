import 'dart:convert';

import 'package:http/http.dart' as http;

import '../models/models.dart';

/// Exception thrown when API call fails
class ApiException implements Exception {
  final String message;
  final int? statusCode;

  ApiException(this.message, [this.statusCode]);

  @override
  String toString() => 'ApiException: $message (Status: $statusCode)';
}

/// Service for communicating with the Assessment API
class AssessmentApiService {
  final String baseUrl;
  late final http.Client _client;

  AssessmentApiService({this.baseUrl = 'http://localhost:5000/api'}) {
    _client = http.Client();
  }

  /// Creates a new assessment from resume and job description
  Future<Map<String, dynamic>> createAssessment({
    required String resumeText,
    required String jobDescription,
    required int questionCount,
  }) async {
    try {
      final response = await _client.post(
        Uri.parse('$baseUrl/assessments/create'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'resumeText': resumeText,
          'jobDescription': jobDescription,
          'questionCount': questionCount,
        }),
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body) as Map<String, dynamic>;
      } else {
        final errorBody = jsonDecode(response.body);
        throw ApiException(
          errorBody['error'] ?? 'Failed to create assessment',
          response.statusCode,
        );
      }
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Network error: $e');
    }
  }

  /// Retrieves a full assessment with questions and responses
  Future<Assessment> getAssessment(String assessmentId) async {
    try {
      final response = await _client.get(
        Uri.parse('$baseUrl/assessments/$assessmentId'),
      );

      if (response.statusCode == 200) {
        final json = jsonDecode(response.body) as Map<String, dynamic>;
        return Assessment.fromJson(json);
      } else if (response.statusCode == 404) {
        throw ApiException('Assessment not found', 404);
      } else {
        final errorBody = jsonDecode(response.body);
        throw ApiException(
          errorBody['error'] ?? 'Failed to retrieve assessment',
          response.statusCode,
        );
      }
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Network error: $e');
    }
  }

  /// Submits candidate responses to interview questions
  Future<Map<String, dynamic>> submitResponses(
    String assessmentId,
    List<CandidateResponse> responses,
  ) async {
    try {
      final response = await _client.post(
        Uri.parse('$baseUrl/assessments/$assessmentId/submit-responses'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'responses': responses.map((r) => r.toJson()).toList(),
        }),
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body) as Map<String, dynamic>;
      } else {
        final errorBody = jsonDecode(response.body);
        throw ApiException(
          errorBody['error'] ?? 'Failed to submit responses',
          response.statusCode,
        );
      }
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Network error: $e');
    }
  }

  /// Retrieves assessment history for a candidate
  Future<Map<String, dynamic>> getAssessmentHistory(
    String candidateEmail,
  ) async {
    try {
      final response = await _client.get(
        Uri.parse('$baseUrl/assessments/history/$candidateEmail'),
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body) as Map<String, dynamic>;
      } else {
        final errorBody = jsonDecode(response.body);
        throw ApiException(
          errorBody['error'] ?? 'Failed to retrieve history',
          response.statusCode,
        );
      }
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Network error: $e');
    }
  }

  void dispose() {
    _client.close();
  }
}
