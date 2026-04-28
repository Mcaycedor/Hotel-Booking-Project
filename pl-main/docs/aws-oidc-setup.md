# AWS OIDC Setup Guide

This guide explains how to set up GitHub Actions OIDC authentication with AWS for the profiler and onlycats projects.

## Why OIDC?

✅ **No long-lived AWS credentials needed**
✅ **Temporary, token-based authentication**
✅ **Built-in audit logging via CloudTrail**
✅ **Automatic credential rotation**
✅ **Industry best practice for CI/CD**

---

## Prerequisites

- AWS Account with appropriate permissions
- AWS CLI v2 installed
- GitHub repository secret: `AWS_ACCOUNT_ID`

---

## Step 1: Deploy GitHub OIDC Stack

### 1.1 Install Dependencies

```bash
cd packages/infra
pnpm install
```

### 1.2 Configure AWS Credentials

Use your AWS CLI credentials (with admin/IAM permissions):

```bash
aws configure
```

Or use environment variables:

```bash
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_DEFAULT_REGION=us-east-1
```

### 1.3 Deploy the Stack

```bash
# Synthesize the CDK
pnpm nx cdk synth infra

# Deploy to AWS
pnpm nx cdk deploy infra
```

The CDK will create:
- ✓ GitHub OIDC Provider
- ✓ IAM Role with permissions for:
  - ECR (push Docker images)
  - S3 (upload frontend)
  - CloudFront (invalidate cache)
  - App Runner (deploy services)

---

## Step 2: Configure GitHub Secrets

Add to GitHub repository settings:\
[https://github.com/Programming-Factory-Inc/profiler/settings/secrets/actions](https://github.com/Programming-Factory-Inc/profiler/settings/actions)

```
AWS_ACCOUNT_ID = your-12-digit-account-id
SLACK_WEBHOOK  = https://hooks.slack.com/services/... (optional)
```

---

## Step 3: Verify OIDC Configuration

### 3.1 Check Provider in AWS

```bash
# List OIDC providers
aws iam list-open-id-connect-providers

# Get provider thumbprint
aws iam get-open-id-connect-provider \
  --open-id-connect-provider-arn arn:aws:iam::ACCOUNT:oidc-provider/token.actions.githubusercontent.com
```

### 3.2 Check IAM Role

```bash
# Get role details
aws iam get-role --role-name github-actions-role

# View trust relationship
aws iam get-role --role-name github-actions-role \
  --query 'Role.AssumeRolePolicyDocument' | jq .
```

### 3.3 Test with GitHub Actions Manual Run

```bash
# Push to trigger workflow
git push

# Or manually trigger
gh workflow run aws-oidc-deploy.yml
```

Monitor execution:

```bash
gh run list --workflow=aws-oidc-deploy.yml
gh run view RUN_ID --log
```

---

## Troubleshooting

### Problem: "InvalidParameterValueException: Invalid thumbprint"

**Solution:** Update the thumbprint in `github-oidc.stack.ts`:

```bash
# Get current GitHub thumbprint
echo | openssl s_client -servername token.actions.githubusercontent.com \
  -connect token.actions.githubusercontent.com:443 2>/dev/null | \
  openssl x509 -fingerprint -noout | sed 's/://g' | \
  awk -F= '{print tolower($2)}'

# Update: thumbprints: ['<new-thumbprint>']
```

### Problem: "User is not authorized to perform: sts:AssumeRole"

**Solution:** Verify trust relationship includes your GitHub repo:

```bash
# Should be: repo:Programming-Factory-Inc/profiler:*
aws iam get-role --role-name github-actions-role \
  --query 'Role.AssumeRolePolicyDocument'
```

### Problem: "AccessDenied when pushing to ECR"

**Solution:** Verify ECR repository exists:

```bash
aws ecr describe-repositories --repository-names profiler-api
```

If missing, create it:

```bash
aws ecr create-repository \
  --repository-name profiler-api \
  --region us-east-1
```

---

## Advanced Configuration

### Multi-Repository Setup

To allow multiple repos to use the same OIDC role:

```typescript
repos: [
  'Programming-Factory-Inc/profiler',
  'Programming-Factory-Inc/onlycats',
  'YourOrg/other-project'
]
```

### Environment-Specific Roles

Create separate roles per environment:

```typescript
new GitHubOIDCStack(app, 'GitHubOIDCStackProd', {
  repos: ['Programming-Factory-Inc/profiler'],
  // Restrict to main branch only
  environment: 'production'
});

new GitHubOIDCStack(app, 'GitHubOIDCStackDev', {
  repos: ['Programming-Factory-Inc/profiler'],
  environment: 'development'
});
```

### Custom Permissions

Modify `github-oidc.stack.ts` to add/remove permissions:

```typescript
// Example: Add CodeDeploy permissions
this.githubActionsRole.addToPrincipalPolicy(
  new iam.PolicyStatement({
    effect: iam.Effect.ALLOW,
    actions: ['codedeploy:CreateDeployment'],
    resources: ['arn:aws:codedeploy:*:*:*']
  })
);
```

---

## Security Best Practices

✅ **Use environment-specific roles** - Limit production access
✅ **Review permissions quarterly** - Remove unused permissions
✅ **Enable CloudTrail logging** - Audit all API calls
✅ **Use AWS Config** - Track configuration changes
✅ **Set short session duration** - Max 1 hour in our config

### View CloudTrail Logs

```bash
aws cloudtrail lookup-events \
  --lookup-attributes AttributeKey=ResourceName,AttributeValue=github-actions-role
```

---

## For the onlycats Project

The same OIDC stack can be used for the onlycats benchmark project:

1. Add `onlycats` to the repos list in the CDK stack
2. Set up similar GitHub Actions workflows
3. Configure AWS credentials for infrastructure/deployment

This avoids:
- ❌ Multiple OIDC providers
- ❌ Managing separate credentials per project
- ❌ Credential rotation complexity

---

## Reference

- [AWS OIDC Documentation](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_create_oidc.html)
- [GitHub OIDC Provider](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect)
- [AWS CDK OIDC](https://docs.aws.amazon.com/cdk/api/v2/python/aws_cdk.aws_iam/OpenIdConnectProvider.html)
