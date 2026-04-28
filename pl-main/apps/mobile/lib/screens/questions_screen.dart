import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../models/models.dart';
import '../providers/assessment_provider.dart';
import '../routes/app_routes.dart';

/// Interview questions screen
class QuestionsScreen extends StatefulWidget {
  const QuestionsScreen({Key? key}) : super(key: key);

  @override
  State<QuestionsScreen> createState() => _QuestionsScreenState();
}

class _QuestionsScreenState extends State<QuestionsScreen> {
  int _currentQuestionIndex = 0;
  late TextEditingController _answerController;

  @override
  void initState() {
    super.initState();
    _answerController = TextEditingController();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _loadCurrentAnswer();
  }

  void _loadCurrentAnswer() {
    final provider = context.read<AssessmentProvider>();
    if (_currentQuestionIndex < provider.responses.length) {
      _answerController.text =
          provider.responses[_currentQuestionIndex].candidateAnswer;
    }
  }

  void _saveCurrentAnswer() {
    final provider = context.read<AssessmentProvider>();
    provider.updateResponse(_currentQuestionIndex, _answerController.text);
  }

  void _previousQuestion() {
    if (_currentQuestionIndex > 0) {
      _saveCurrentAnswer();
      setState(() {
        _currentQuestionIndex--;
      });
      _loadCurrentAnswer();
    }
  }

  void _nextQuestion() {
    final provider = context.read<AssessmentProvider>();
    final questions = provider.currentAssessment?.interviewQuestions ?? [];

    _saveCurrentAnswer();

    if (_currentQuestionIndex < questions.length - 1) {
      setState(() {
        _currentQuestionIndex++;
      });
      _loadCurrentAnswer();
    } else {
      _submitAnswers();
    }
  }

  Future<void> _submitAnswers() async {
    _saveCurrentAnswer();

    final provider = context.read<AssessmentProvider>();
    final success = await provider.submitResponses();

    if (mounted && success) {
      context.go(AppRoutes.results);
    }
  }

  @override
  void dispose() {
    _answerController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(
      title: const Text('Step 3: Interview Questions'),
      elevation: 0,
    ),
    body: Consumer<AssessmentProvider>(
      builder: (context, provider, child) {
        final questions = provider.currentAssessment?.interviewQuestions ?? [];

        if (questions.isEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const CircularProgressIndicator(),
                const SizedBox(height: 16),
                Text(provider.loadingMessage),
              ],
            ),
          );
        }

        final currentQuestion = questions[_currentQuestionIndex];
        final progress = (_currentQuestionIndex + 1) / questions.length;

        return SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Progress bar
              Column(
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(4),
                    child: LinearProgressIndicator(
                      value: progress,
                      minHeight: 8,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Question ${_currentQuestionIndex + 1} of ${questions.length}',
                    style: const TextStyle(fontSize: 12, color: Colors.grey),
                  ),
                ],
              ),
              const SizedBox(height: 24),
              // Question metadata
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: _getDifficultyColor(currentQuestion.difficulty),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      currentQuestion.difficulty,
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: Colors.white,
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.blue[50],
                      border: Border.all(color: Colors.blue[300]!),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      currentQuestion.category,
                      style: const TextStyle(fontSize: 12, color: Colors.blue),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              // Question text
              Text(
                currentQuestion.question,
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 24),
              // Skills tested
              if (currentQuestion.testedSkills.isNotEmpty)
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Skills Tested:',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: Colors.grey,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 8,
                      children: currentQuestion.testedSkills
                          .map(
                            (skill) => Chip(
                              label: Text(skill),
                              labelPadding: const EdgeInsets.symmetric(
                                horizontal: 8,
                              ),
                            ),
                          )
                          .toList(),
                    ),
                    const SizedBox(height: 24),
                  ],
                ),
              // Hints
              if (currentQuestion.hints.isNotEmpty)
                ExpansionTile(
                  title: const Text('💡 Hints'),
                  children: currentQuestion.hints
                      .map(
                        (hint) => Padding(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 8,
                          ),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Padding(
                                padding: EdgeInsets.only(right: 8),
                                child: Text('•'),
                              ),
                              Expanded(child: Text(hint)),
                            ],
                          ),
                        ),
                      )
                      .toList(),
                ),
              const SizedBox(height: 24),
              // Answer input
              const Text(
                'Your Answer:',
                style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: _answerController,
                maxLines: 8,
                onChanged: (value) {
                  setState(() {});
                },
                decoration: InputDecoration(
                  hintText: 'Type your answer here (Ctrl+Enter to continue)...',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                  contentPadding: const EdgeInsets.all(16),
                ),
                enabled: !provider.isLoading,
              ),
              const SizedBox(height: 8),
              Text(
                '${_answerController.text.length} characters',
                style: const TextStyle(fontSize: 12, color: Colors.grey),
              ),
              const SizedBox(height: 24),
              // Navigation buttons
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed:
                          _currentQuestionIndex == 0 || provider.isLoading
                          ? null
                          : _previousQuestion,
                      child: const Text('← Previous'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: provider.isLoading ? null : _nextQuestion,
                      child: provider.isLoading
                          ? const SizedBox(
                              height: 20,
                              width: 20,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            )
                          : Text(
                              _currentQuestionIndex == questions.length - 1
                                  ? 'Submit Answers'
                                  : 'Next →',
                            ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),
              // Question navigator
              const Text(
                'Answer Progress',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: Colors.grey,
                ),
              ),
              const SizedBox(height: 8),
              Wrap(
                spacing: 4,
                children: List.generate(questions.length, (index) {
                  final isAnswered =
                      provider.responses[index].candidateAnswer.isNotEmpty;
                  return GestureDetector(
                    onTap: () {
                      _saveCurrentAnswer();
                      setState(() {
                        _currentQuestionIndex = index;
                      });
                      _loadCurrentAnswer();
                    },
                    child: Container(
                      width: 36,
                      height: 36,
                      decoration: BoxDecoration(
                        color: _currentQuestionIndex == index
                            ? Colors.blue
                            : isAnswered
                            ? Colors.green[50]
                            : Colors.grey[100],
                        border: Border.all(
                          color: _currentQuestionIndex == index
                              ? Colors.blue
                              : isAnswered
                              ? Colors.green
                              : Colors.grey[300]!,
                        ),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Center(
                        child: Text(
                          '${index + 1}',
                          style: TextStyle(
                            fontWeight: FontWeight.w600,
                            color: _currentQuestionIndex == index
                                ? Colors.white
                                : Colors.black,
                          ),
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ],
          ),
        );
      },
    ),
  );

  Color _getDifficultyColor(String difficulty) {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return Colors.green;
      case 'medium':
        return Colors.orange;
      case 'hard':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  @override
  void dispose() {
    _answerController.dispose();
    super.dispose();
  }
}
