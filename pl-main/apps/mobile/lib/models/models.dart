import 'package:equatable/equatable.dart';
import 'package:json_annotation/json_annotation.dart';

part 'models.g.dart';

/// Interview question model
@JsonSerializable()
class InterviewQuestion extends Equatable {
  final String id;
  final String question;
  final String difficulty;
  final String category;

  @JsonKey(name: 'testedSkills')
  final List<String> testedSkills;

  final List<String> hints;

  const InterviewQuestion({
    required this.id,
    required this.question,
    required this.difficulty,
    required this.category,
    required this.testedSkills,
    required this.hints,
  });

  factory InterviewQuestion.fromJson(Map<String, dynamic> json) =>
      _$InterviewQuestionFromJson(json);

  Map<String, dynamic> toJson() => _$InterviewQuestionToJson(this);

  @override
  List<Object?> get props => [id, question, difficulty, category, testedSkills, hints];
}

/// Candidate response to interview question
@JsonSerializable()
class CandidateResponse extends Equatable {
  final String id;
  final String questionId;

  @JsonKey(name: 'candidateAnswer')
  final String candidateAnswer;

  @JsonKey(name: 'submittedAt')
  final DateTime? submittedAt;

  const CandidateResponse({
    required this.id,
    required this.questionId,
    required this.candidateAnswer,
    this.submittedAt,
  });

  factory CandidateResponse.fromJson(Map<String, dynamic> json) =>
      _$CandidateResponseFromJson(json);

  Map<String, dynamic> toJson() => _$CandidateResponseToJson(this);

  @override
  List<Object?> get props => [id, questionId, candidateAnswer, submittedAt];
}

/// Skill match information
@JsonSerializable()
class SkillMatch extends Equatable {
  final String skillName;
  final String requiredProficiency;
  final String candidateProficiency;
  final int matchScore;
  final String gapAnalysis;

  const SkillMatch({
    required this.skillName,
    required this.requiredProficiency,
    required this.candidateProficiency,
    required this.matchScore,
    required this.gapAnalysis,
  });

  factory SkillMatch.fromJson(Map<String, dynamic> json) =>
      _$SkillMatchFromJson(json);

  Map<String, dynamic> toJson() => _$SkillMatchToJson(this);

  @override
  List<Object?> get props => [skillName, requiredProficiency, candidateProficiency, matchScore, gapAnalysis];
}

/// Recommendation for candidate improvement
@JsonSerializable()
class Recommendation extends Equatable {
  final String description;
  final String priority;
  final String estimatedEffort;
  final List<String> resources;

  const Recommendation({
    required this.description,
    required this.priority,
    required this.estimatedEffort,
    required this.resources,
  });

  factory Recommendation.fromJson(Map<String, dynamic> json) =>
      _$RecommendationFromJson(json);

  Map<String, dynamic> toJson() => _$RecommendationToJson(this);

  @override
  List<Object?> get props => [description, priority, estimatedEffort, resources];
}

/// Match report with analysis and recommendations
@JsonSerializable()
class MatchReport extends Equatable {
  final String assessmentId;

  @JsonKey(name: 'overallMatchPercentage')
  final int overallMatchPercentage;

  @JsonKey(name: 'overallMatchScore')
  final int overallMatchScore;

  @JsonKey(name: 'hiringRecommendation')
  final String hiringRecommendation;

  @JsonKey(name: 'skillMatches')
  final List<SkillMatch> skillMatches;

  @JsonKey(name: 'criticalMissingSkills')
  final List<String> criticalMissingSkills;

  @JsonKey(name: 'niceTohaveSkills')
  final List<String> niceTohaveSkills;

  @JsonKey(name: 'additionalSkills')
  final List<String> additionalSkills;

  @JsonKey(name: 'summaryAssessment')
  final String summaryAssessment;

  final List<Recommendation> recommendations;

  const MatchReport({
    required this.assessmentId,
    required this.overallMatchPercentage,
    required this.overallMatchScore,
    required this.hiringRecommendation,
    required this.skillMatches,
    required this.criticalMissingSkills,
    required this.niceTohaveSkills,
    required this.additionalSkills,
    required this.summaryAssessment,
    required this.recommendations,
  });

  factory MatchReport.fromJson(Map<String, dynamic> json) =>
      _$MatchReportFromJson(json);

  Map<String, dynamic> toJson() => _$MatchReportToJson(this);

  @override
  List<Object?> get props => [
    assessmentId,
    overallMatchPercentage,
    overallMatchScore,
    hiringRecommendation,
    skillMatches,
    criticalMissingSkills,
    niceTohaveSkills,
    additionalSkills,
    summaryAssessment,
    recommendations,
  ];
}

/// Complete assessment response
@JsonSerializable()
class Assessment extends Equatable {
  final String id;
  final String candidateName;
  final String candidateEmail;
  final String resumeText;
  final String jobDescription;
  final String status;

  @JsonKey(name: 'createdAt')
  final DateTime createdAt;

  @JsonKey(name: 'updatedAt')
  final DateTime updatedAt;

  @JsonKey(name: 'submittedAt')
  final DateTime? submittedAt;

  @JsonKey(name: 'interviewQuestions')
  final List<InterviewQuestion> interviewQuestions;

  @JsonKey(name: 'candidateResponses')
  final List<CandidateResponse> candidateResponses;

  @JsonKey(name: 'initialMatchReport')
  final MatchReport? initialMatchReport;

  const Assessment({
    required this.id,
    required this.candidateName,
    required this.candidateEmail,
    required this.resumeText,
    required this.jobDescription,
    required this.status,
    required this.createdAt,
    required this.updatedAt,
    this.submittedAt,
    required this.interviewQuestions,
    required this.candidateResponses,
    this.initialMatchReport,
  });

  factory Assessment.fromJson(Map<String, dynamic> json) =>
      _$AssessmentFromJson(json);

  Map<String, dynamic> toJson() => _$AssessmentToJson(this);

  @override
  List<Object?> get props => [
    id,
    candidateName,
    candidateEmail,
    resumeText,
    jobDescription,
    status,
    createdAt,
    updatedAt,
    submittedAt,
    interviewQuestions,
    candidateResponses,
    initialMatchReport,
  ];
}
