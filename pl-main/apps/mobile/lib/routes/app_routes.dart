import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../screens/home_screen.dart';
import '../screens/job_description_screen.dart';
import '../screens/questions_screen.dart';
import '../screens/results_screen.dart';
import '../screens/resume_screen.dart';

/// Application routing configuration using GoRouter
class AppRoutes {
  static const String home = '/';
  static const String resume = '/resume';
  static const String jobDescription = '/job-description';
  static const String questions = '/questions';
  static const String results = '/results';

  static GoRouter router = GoRouter(
    initialLocation: home,
    errorBuilder: (context, state) => Scaffold(
      appBar: AppBar(title: const Text('Page Not Found')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text(
              '404 - Route Not Found',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            Text(state.error?.message ?? 'Unknown error'),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () => context.go(home),
              child: const Text('Go Home'),
            ),
          ],
        ),
      ),
    ),
    routes: [
      GoRoute(path: home, builder: (context, state) => const HomeScreen()),
      GoRoute(path: resume, builder: (context, state) => const ResumeScreen()),
      GoRoute(
        path: jobDescription,
        builder: (context, state) => const JobDescriptionScreen(),
      ),
      GoRoute(
        path: questions,
        builder: (context, state) => const QuestionsScreen(),
      ),
      GoRoute(
        path: results,
        builder: (context, state) => const ResultsScreen(),
      ),
    ],
  );
}
