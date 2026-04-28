# AWS OIDC Authentication for GitHub Actions

Complete setup guide for eliminating long-lived AWS credentials in CI/CD pipelines using OpenID Connect (OIDC) federation.

## 📋 Overview

This solution implements **temporary, token-based authentication** for GitHub Actions to deploy to AWS without managing long-lived credentials.

### Key Benefits

| Feature | Traditional | OIDC |
|---------|-----------|------|
| **Credentials** | Long-lived AWS keys | Temporary OIDC tokens |
| **Rotation** | Manual every 90 days | Automatic per workflow |
| **Audit Trail** | Limited | Full CloudTrail logging |
| **Scope** | Account-wide | Per-repo restrictions |
| **Security** | Higher risk | Industry best practice |

---

## 🚀 Quick Start

### Unix/Mac/Linux

```bash
cd c:/dev/profiler

# Automated setup
bash scripts/setup-aws-oidc.sh --profile=default --region=us-east-1

# Follow prompts to add GitHub secret
```

### Windows

```powershell
cd c:\dev\profiler

# Automated setup
.\scripts\setup-aws-oidc.ps1 -Profile default -Region us-east-1

# Follow prompts to add GitHub secret
```

### Manual Setup

```bash
# 1. Deploy CDK stack
cd packages/infra
pnpm install
pnpm nx cdk deploy infra

# 2. Add GitHub secret
# Repository Settings → Secrets → AWS_ACCOUNT_ID

# 3. Done! Next push triggers deployment
git push main
```

---

## 📁 What's Included

### 1. **CDK Infrastructure** (`packages/infra/src/lib/stacks/github-oidc.stack.ts`)

Defines:
- ✅ GitHub OIDC Provider
- ✅ IAM Role with repository-specific restrictions
- ✅ Permissions for ECR, S3, CloudFront, App Runner

```typescript
// Supports multiple repositories
repos: [
  'Programming-Factory-Inc/profiler',
  'Programming-Factory-Inc/onlycats'
]
```

### 2. **GitHub Actions Workflow** (`.github/workflows/aws-oidc-deploy.yml`)

Automates:
- 🔐 OIDC-based AWS authentication
- 📦 Docker build & push to ECR
- ☁️ Frontend deployment to S3
- ⚡ CloudFront cache invalidation
- 🚀 App Runner deployment

### 3. **Setup Scripts**

- **Unix/Mac/Linux**: `scripts/setup-aws-oidc.sh`
- **Windows**: `scripts/setup-aws-oidc.ps1`

Features:
- Auto-detect GitHub repository
- Fetch OIDC thumbprint
- Deploy CDK stack
- Extract outputs
- Display configuration

### 4. **Documentation**

- **Setup Guide**: `docs/aws-oidc-setup.md` (comprehensive)
- **Quick Reference**: `docs/aws-oidc-quick-reference.md` (commands)

---

## 🔐 Security Architecture

```
┌─────────────────────────────────────────────────────────┐
│ GitHub Actions Workflow                                  │
│ (on: push to main)                                       │
└──────────────────┬──────────────────────────────────────┘
                   │
                   │ 1. Request OIDC token
                   ▼
┌─────────────────────────────────────────────────────────┐
│ GitHub OIDC Provider                                     │
│ (token.actions.githubusercontent.com)                    │
│                                                          │
│ Token includes:                                          │
│ - Repository: Programming-Factory-Inc/profiler          │
│ - Ref: refs/heads/main                                  │
│ - Commit: abc123...                                      │
│ - Timestamp: 2024-01-15T10:30:00Z                       │
└──────────────────┬──────────────────────────────────────┘
                   │
                   │ 2. Present token via STS AssumeRole
                   ▼
┌─────────────────────────────────────────────────────────┐
│ AWS IAM                                                  │
│                                                          │
│ Trust Policy checks:                                     │
│ - Issuer: token.actions.githubusercontent.com ✓          │
│ - Subject: repo:Programming-Factory-Inc/profiler:* ✓    │
│ - Signature: Valid ✓                                     │
└──────────────────┬──────────────────────────────────────┘
                   │
                   │ 3. Grant temporary credentials
                   │ (1 hour session)
                   ▼
┌─────────────────────────────────────────────────────────┐
│ GitHub Actions                                           │
│ (now authenticated as github-actions-role)              │
│                                                          │
│ Can perform:                                             │
│ - Push to ECR ✓                                          │
│ - Deploy to S3 ✓                                         │
│ - Invalidate CloudFront ✓                               │
│ - Deploy to App Runner ✓                                │
│                                                          │
│ Cannot perform:                                          │
│ - Delete RDS databases ✗                                │
│ - Modify IAM roles ✗                                    │
│ - Access other repos ✗                                  │
└─────────────────────────────────────────────────────────┘
                   │
                   │ 4. All actions logged to CloudTrail
                   ▼
┌─────────────────────────────────────────────────────────┐
│ CloudTrail                                               │
│                                                          │
│ Event: AssumeRole                                        │
│ Principal: OIDC token from profiler repo                │
│ Time: 2024-01-15T10:30:15Z                              │
│ Service: GitHub Actions                                 │
│ Result: Success                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🛠 How It Works

### Step 1: OIDC Token Generation

When GitHub Actions workflow runs:

```yaml
- uses: aws-actions/configure-aws-credentials@v4
  with:
    role-to-assume: arn:aws:iam::ACCOUNT:role/github-actions-role
    aws-region: us-east-1
```

GitHub generates a cryptographically signed JWT token containing:
- `iss`: `https://token.actions.githubusercontent.com` (issuer)
- `sub`: `repo:Programming-Factory-Inc/profiler:ref:refs/heads/main`
- `aud`: `sts.amazonaws.com`
- `iat`: `1705315200` (issued at)
- `exp`: `1705318800` (expires in 15 minutes)

### Step 2: Token Validation

AWS IAM receives the token and:
1. Verifies issuer matches OIDC provider URL
2. Validates digital signature using provider's public key
3. Checks subject (`sub`) matches trust policy restrictions
4. Confirms token hasn't expired

### Step 3: Temporary Credentials

Upon successful validation, AWS returns temporary credentials:
- `AccessKeyId`: `ASIXXXXXXXXXX`
- `SecretAccessKey`: `XXX...` (valid for 1 hour max)
- `SessionToken`: `XXX...`
- `Expiration`: `2024-01-15T11:30:00Z`

### Step 4: AWS API Calls

GitHub Actions uses temporary credentials to:
- Push Docker images to ECR
- Upload frontend to S3
- Invalidate CloudFront cache
- Deploy to App Runner

All actions are:
- ✅ Logged to CloudTrail
- ✅ Restricted by IAM policy
- ✅ Time-limited (1 hour expiration)
- ✅ Unable to create new credentials

---

## 📝 Configuration

### Customize Repositories

Edit `packages/infra/src/main.ts`:

```typescript
new GitHubOIDCStack(app, 'GitHubOIDCStack', {
  repos: [
    'Programming-Factory-Inc/profiler',
    'Programming-Factory-Inc/onlycats',
    'YourOrg/another-repo'  // Add here
  ],
});
```

### Customize Permissions

Edit `packages/infra/src/lib/stacks/github-oidc.stack.ts`:

Add new permissions as needed:

```typescript
// Example: Add Lambda deployment
this.githubActionsRole.addToPrincipalPolicy(
  new iam.PolicyStatement({
    effect: iam.Effect.ALLOW,
    actions: [
      'lambda:UpdateFunction',
      'lambda:PublishVersion',
      'lambda:CreateAlias'
    ],
    resources: ['arn:aws:lambda:*:*:function/profiler-*']
  })
);
```

### Environment-Specific Deployment

```typescript
// Dev environment: Allow from any branch
new GitHubOIDCStack(app, 'GitHubOIDCDev', {
  repos: ['Programming-Factory-Inc/profiler'],
  branchFilter: 'develop'
});

// Prod environment: Main branch only
new GitHubOIDCStack(app, 'GitHubOIDCProd', {
  repos: ['Programming-Factory-Inc/profiler'],
  branchFilter: 'main'
});
```

---

## 🔍 Verification

### Test OIDC Setup

```bash
# 1. Check provider exists
aws iam list-open-id-connect-providers

# 2. Verify role trust policy
aws iam get-role --role-name github-actions-role | jq '.Role.AssumeRolePolicyDocument'

# 3. Manually trigger workflow
gh workflow run aws-oidc-deploy.yml

# 4. Monitor execution
gh run list --workflow=aws-oidc-deploy.yml
gh run view RUN_ID --log
```

### Audit OIDC Usage

```bash
# View all OIDC role assumptions
aws cloudtrail lookup-events \
  --lookup-attributes AttributeKey=EventName,AttributeValue=AssumeRole \
  --query 'Events[*].[EventTime,CloudTrailEvent]' | \
  jq '.[] | select(.[1] | contains("github-actions-role"))'
```

---

## 🆘 Troubleshooting

### "InvalidParameterValueException: Invalid thumbprint"

GitHub's OIDC provider thumbprint rarely changes, but if needed:

```bash
# Get current thumbprint
THUMBPRINT=$(echo | openssl s_client -servername token.actions.githubusercontent.com \
  -connect token.actions.githubusercontent.com:443 2>/dev/null | \
  openssl x509 -fingerprint -noout | sed 's/://g' | \
  awk -F= '{print tolower($2)}')

# Update CDK and redeploy
# Edit: packages/infra/src/lib/stacks/github-oidc.stack.ts
# thumbprints: ['$THUMBPRINT']

pnpm nx cdk deploy infra
```

### "User is not authorized to perform: sts:AssumeRole"

The trust policy may not include your repository:

```bash
# Check repository name in policy
aws iam get-role --role-name github-actions-role | \
  jq '.Role.AssumeRolePolicyDocument' | \
  grep "repo:"

# Should show: "repo:Programming-Factory-Inc/profiler:*"

# If missing, update packages/infra/src/main.ts repos array
```

### "AccessDenied when pushing to ECR"

ECR repository may not exist:

```bash
# Check repositories
aws ecr describe-repositories

# Create if missing
aws ecr create-repository --repository-name profiler-api
```

---

## 📚 For onlycats Project

The same OIDC stack supports multiple repositories. To use for onlycats:

### 1. Update CDK Configuration

```typescript
// packages/infra/src/main.ts
new GitHubOIDCStack(app, 'GitHubOIDCStack', {
  repos: [
    'Programming-Factory-Inc/profiler',
    'Programming-Factory-Inc/onlycats'  // Add this
  ],
});
```

### 2. Redeploy CDK

```bash
pnpm nx cdk deploy infra
```

### 3. Add Workflow to onlycats

Copy `.github/workflows/aws-oidc-deploy.yml` to onlycats repository:

```bash
cp .github/workflows/aws-oidc-deploy.yml \
   ../onlycats/.github/workflows/aws-oidc-deploy.yml
```

### 4. Update Workflow Parameters

Edit ECR repository and S3 bucket names for onlycats.

### 5. Deploy

```bash
cd ../onlycats
git push
```

---

## 🎯 Architecture Decision Records

### Why OIDC Instead of IAM Keys?

- ✅ **No credential storage**: No AWS keys in GitHub secrets
- ✅ **Automatic rotation**: New token per workflow run
- ✅ **Audit trail**: Full CloudTrail logging
- ✅ **Repository scope**: Can't access other repos
- ✅ **Compliance**: Meets SOC2/ISO27001 requirements
- ✅ **Industry standard**: Used by AWS, HashiCorp, JFrog, etc.

### Why AWS CDK?

- ✅ **Infrastructure as Code**: Version controlled, peer reviewed
- ✅ **Multi-language**: Supports TypeScript, Python, Java, C#
- ✅ **Type safety**: Catch errors before deployment
- ✅ **Reusability**: Package as construct library
- ✅ **Testing**: Unit and integration tests built-in

### Why Temporary Credentials?

- ✅ **Session duration**: Max 1 hour per GitHub Actions run
- ✅ **Cannot escalate**: Can't create new IAM users/roles
- ✅ **Automatic cleanup**: Credentials expire, no revocation needed
- ✅ **Consistent context**: All actions tied to single session token

---

## 📖 Additional Resources

- [AWS OIDC Documentation](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_create_oidc.html)
- [GitHub OIDC Guide](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect)
- [AWS CDK Reference](https://docs.aws.amazon.com/cdk/api/v2/)
- [This Blog Post Explains OIDC](https://github.blog/changelog/2021-04-27-github-actions-oidc-support-for-aws/)

---

## 🔗 Related Documentation

- [AWS IAM Best Practices](./secure-coding-guidelines.md)
- [Development Setup](./developer-setup-guide.md)
- [Deployment Guide](./aws-oidc-setup.md) (comprehensive)
- [Command Reference](./aws-oidc-quick-reference.md) (commands)

---

## ✅ Verification Checklist

Before going to production:

- [ ] OIDC provider created and verified
- [ ] IAM role trust policy updated
- [ ] GitHub secret `AWS_ACCOUNT_ID` added
- [ ] Workflow successfully authenticated with OIDC
- [ ] ECR, S3, and CloudFront deployments working
- [ ] CloudTrail logging OIDC role assumptions
- [ ] No long-lived AWS keys in GitHub secrets
- [ ] Documentation updated for team
- [ ] Backup plan if OIDC provider fails

---

**Last Updated**: January 2024  
**Version**: 1.0.0

For questions or improvements, please file an issue or reach out to the DevOps team.
