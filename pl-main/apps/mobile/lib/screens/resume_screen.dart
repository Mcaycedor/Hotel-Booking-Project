import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../providers/assessment_provider.dart';
import '../routes/app_routes.dart';

/// Resume input screen
class ResumeScreen extends StatefulWidget {
  const ResumeScreen({Key? key}) : super(key: key);

  @override
  State<ResumeScreen> createState() => _ResumeScreenState();
}

class _ResumeScreenState extends State<ResumeScreen> {
  late TextEditingController _resumeController;

  @override
  void initState() {
    super.initState();
    _resumeController = TextEditingController();
  }

  @override
  void dispose() {
    _resumeController.dispose();
    super.dispose();
  }

  bool _isValid() => _resumeController.text.length >= 50;

  void _nextStep() {
    if (_isValid()) {
      // Store resume in provider or pass to next screen
      context.go(AppRoutes.jobDescription);
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('Step 1: Your Resume'), elevation: 0),
    body: Consumer<AssessmentProvider>(
      builder: (context, provider, child) => SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Paste Your Resume',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            const Text(
              'Paste your complete resume text below for analysis',
              style: TextStyle(fontSize: 14, color: Colors.grey),
            ),
            const SizedBox(height: 24),
            TextField(
              controller: _resumeController,
              maxLines: 12,
              onChanged: (value) {
                setState(() {});
              },
              decoration: InputDecoration(
                hintText: 'Paste your resume here (minimum 50 characters)...',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                contentPadding: const EdgeInsets.all(16),
              ),
              enabled: !provider.isLoading,
            ),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '${_resumeController.text.length} characters',
                  style: const TextStyle(fontSize: 12, color: Colors.grey),
                ),
                if (_isValid())
                  const Text(
                    '✓ Ready to continue',
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.green,
                      fontWeight: FontWeight.w600,
                    ),
                  )
                else
                  const Text(
                    '⚠ Minimum 50 characters required',
                    style: TextStyle(fontSize: 12, color: Colors.red),
                  ),
              ],
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
                            _resumeController.clear();
                            setState(() {});
                          },
                    child: const Text('Clear'),
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
                        : const Text('Next: Job Description'),
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
