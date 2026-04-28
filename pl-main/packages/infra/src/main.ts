#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { GitHubOIDCStack } from './lib/stacks/github-oidc.stack';

const app = new cdk.App();

// Create GitHub OIDC Stack
new GitHubOIDCStack(app, 'GitHubOIDCStack', {
  description: 'GitHub OIDC IAM setup for CI/CD pipeline',
  repos: [
    'Programming-Factory-Inc/profiler',
    'Programming-Factory-Inc/onlycats', // If needed for future projects
  ],
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
  },
});

app.synth();
