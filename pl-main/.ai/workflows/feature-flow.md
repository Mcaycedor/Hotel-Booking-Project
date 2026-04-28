# Feature Flow

## Purpose
Standard execution order for building a new feature into the blank platform.

## Order
1. prompt-manager validates prompt + variables
2. platform-architect runs brainstorm-feature
3. platform-architect runs write-plan
4. scaffold-agent creates the feature skeleton
5. backend-agent builds the API slice
6. web-agent builds the Angular slice
7. mobile-agent builds the Flutter slice
8. test-agent adds or reviews tests
9. review-agent reviews the whole change
10. devops-agent validates release readiness

## Rule
Do not skip test-agent or review-agent.
