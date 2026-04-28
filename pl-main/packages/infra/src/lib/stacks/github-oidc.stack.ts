import * as iam from 'aws-cdk-lib/aws-iam';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

/**
 * GitHub OIDC Provider Stack
 * 
 * Creates IAM role for GitHub Actions to assume with OIDC federation
 * No long-lived credentials needed - automatic token-based authentication
 * 
 * Usage in GitHub Actions:
 * ```yaml
 * - uses: aws-actions/configure-aws-credentials@v4
 *   with:
 *     role-to-assume: arn:aws:iam::ACCOUNT:role/github-actions-role
 *     aws-region: us-east-1
 * ```
 */
export interface GitHubOIDCStackProps extends cdk.StackProps {
  repos?: string[]; // List of repos (e.g., ['Programming-Factory-Inc/profiler'])
}

export class GitHubOIDCStack extends cdk.Stack {
  public readonly oidcProvider: iam.OpenIdConnectProvider;
  public readonly githubActionsRole: iam.Role;

  constructor(scope: Construct, id: string, props: GitHubOIDCStackProps = {}) {
    super(scope, id, props);

    const repos = props.repos || ['Programming-Factory-Inc/profiler'];

    // ============ Step 1: Create GitHub OIDC Provider ============
    this.oidcProvider = new iam.OpenIdConnectProvider(this, 'GitHubOIDCProvider', {
      url: 'https://token.actions.githubusercontent.com',
      clientIds: ['sts.amazonaws.com'],
      thumbprints: ['6938fd4d98bab03faadb97b34396831e3780aea1'],
    });

    // ============ Step 2: Create GitHub Actions IAM Role ============
    this.githubActionsRole = new iam.Role(this, 'GitHubActionsRole', {
      roleName: 'github-actions-role',
      description: 'IAM role for GitHub Actions OIDC authentication',
      assumedBy: new iam.WebIdentityPrincipal(
        this.oidcProvider.openIdConnectProviderArn,
        {
          StringEquals: {
            'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
          },
          StringLike: {
            'token.actions.githubusercontent.com:sub': repos.map(
              (repo) => `repo:${repo}:*`
            ),
          },
        }
      ),
      maxSessionDuration: cdk.Duration.hours(1),
    });

    // ============ Step 3: Attach Required Policies ============

    // ECR Permissions (push Docker images)
    this.githubActionsRole.addToPrincipalPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          'ecr:GetAuthorizationToken',
          'ecr:BatchCheckLayerAvailability',
          'ecr:GetDownloadUrlForLayer',
          'ecr:PutImage',
          'ecr:InitiateLayerUpload',
          'ecr:UploadLayerPart',
          'ecr:CompleteLayerUpload',
        ],
        resources: ['*'],
      })
    );

    // S3 Permissions (upload frontend)
    this.githubActionsRole.addToPrincipalPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          's3:GetObject',
          's3:PutObject',
          's3:DeleteObject',
          's3:ListBucket',
        ],
        resources: [
          'arn:aws:s3:::profiler-web',
          'arn:aws:s3:::profiler-web/*',
        ],
      })
    );

    // CloudFront Permissions (invalidate cache)
    this.githubActionsRole.addToPrincipalPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          'cloudfront:CreateInvalidation',
          'cloudfront:GetDistribution',
        ],
        resources: ['*'],
      })
    );

    // App Runner Permissions (deploy service)
    this.githubActionsRole.addToPrincipalPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          'apprunner:StartDeployment',
          'apprunner:DescribeService',
          'apprunner:ListServices',
        ],
        resources: ['*'],
      })
    );

    // ============ Outputs ============
    new cdk.CfnOutput(this, 'GitHubOIDCProviderArn', {
      value: this.oidcProvider.openIdConnectProviderArn,
      description: 'GitHub OIDC Provider ARN',
      exportName: 'GitHubOIDCProviderArn',
    });

    new cdk.CfnOutput(this, 'GitHubActionsRoleArn', {
      value: this.githubActionsRole.roleArn,
      description: 'GitHub Actions IAM Role ARN (use in GitHub Actions)',
      exportName: 'GitHubActionsRoleArn',
    });

    new cdk.CfnOutput(this, 'GitHubActionsRoleName', {
      value: this.githubActionsRole.roleName,
      description: 'GitHub Actions IAM Role Name',
    });
  }
}
