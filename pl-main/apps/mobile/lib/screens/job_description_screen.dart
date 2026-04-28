import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../providers/assessment_provider.dart';
import '../routes/app_routes.dart';

/// Job description input screen
class JobDescriptionScreen extends StatefulWidget {
  const JobDescriptionScreen({Key? key}) : super(key: key);

  @override
  State<JobDescriptionScreen> createState() => _JobDescriptionScreenState();
}

class _JobDescriptionScreenState extends State<JobDescriptionScreen> {
  late TextEditingController _jobController;
  int _questionCount = 5;
  final String _resumeText = '';

  @override
  void initState() {
    super.initState();
    _jobController = TextEditingController();
  }

  @override
  void dispose() {
    _jobController.dispose();
    super.dispose();
  }

  bool _isValid() => _jobController.text.length >= 50;

  Future<void> _nextStep() async {
    if (!_isValid()) return;

    final provider = context.read<AssessmentProvider>();

    // TODO: Get resume text from previous screen
    final resumeText = _resumeText; // This should come from the first screen

    final assessmentId = await provider.createAssessment(
      resumeText: resumeText,
      jobDescription: _jobController.text,
      questionCount: _questionCount,
    );

    if (mounted && assessmentId != null) {
      context.go(AppRoutes.questions);
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('Step 2: Job Description'), elevation: 0),
    body: Consumer<AssessmentProvider>(
      builder: (context, provider, child) => SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Job Description',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            const Text(
              'Paste the job posting or requirements',
              style: TextStyle(fontSize: 14, color: Colors.grey),
            ),
            const SizedBox(height: 24),
            TextField(
              controller: _jobController,
              maxLines: 10,
              onChanged: (value) {
                setState(() {});
              },
              decoration: InputDecoration(
                hintText: 'Paste the job description/posting here...',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                contentPadding: const EdgeInsets.all(16),
              ),
              enabled: !provider.isLoading,
            ),
            const SizedBox(height: 12),
            Text(
              '${_jobController.text.length} characters',
              style: const TextStyle(fontSize: 12, color: Colors.grey),
            ),
            const SizedBox(height: 24),
            const Text(
              'Interview Questions',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            const Text(
              'How many questions would you like to answer?',
              style: TextStyle(fontSize: 14, color: Colors.grey),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: Slider(
                    value: _questionCount.toDouble(),
                    min: 1,
                    max: 20,
                    divisions: 19,
                    label: _questionCount.toString(),
                    onChanged: provider.isLoading
                        ? null
                        : (value) {
                            setState(() {
                              _questionCount = value.toInt();
                            });
                          },
                  ),
                ),
                const SizedBox(width: 16),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 8,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.blue[50],
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    '$_questionCount',
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Wrap(
              spacing: 8,
              children: [5, 10, 15]
                  .map(
                    (count) => FilterChip(
                      label: Text('$count'),
                      selected: _questionCount == count,
                      onSelected: provider.isLoading
                          ? null
                          : (selected) {
                              if (selected) {
                                setState(() {
                                  _questionCount = count;
                                });
                              }
                            },
                    ),
                  )
                  .toList(),
            ),
            const SizedBox(height: 24),
            if (provider.error != null)
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.red[50],
                  border: Border.all(color: Colors.red[300]!),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  provider.error!,
                  style: TextStyle(color: Colors.red[900]),
                ),
              ),
            if (provider.error != null) const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: provider.isLoading
                        ? null
                        : () {
                            context.go(AppRoutes.resume);
                          },
                    child: const Text('Back'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton(
                    onPressed: !_isValid() || provider.isLoading
                        ? null
                        : _nextStep,
                    child: provider.isLoading
                        ? const SizedBox(
                            height: 20,
                            width: 20,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Text('Generate Questions'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    ),
  );
}
