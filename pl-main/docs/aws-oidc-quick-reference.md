# AWS OIDC Quick Reference

Fast commands for managing GitHub OIDC authentication with AWS.

## Installation & Deployment

### Quick Setup (Unix/Mac/Linux)

```bash
# 1. Run setup script
cd c:/dev/profiler
bash scripts/setup-aws-oidc.sh --profile=default --region=us-east-1

# 2. Add GitHub secret: AWS_ACCOUNT_ID = <your-account-id>

# 3. Deploy by pushing to main
git push

# 4. Monitor
gh run list --workflow=aws-oidc-deploy.yml
```

### Quick Setup (Windows)

```powershell
# 1. Run setup script
cd c:\dev\profiler
.\scripts\setup-aws-oidc.ps1 -Profile default -Region us-east-1

# 2. Add GitHub secret: AWS_ACCOUNT_ID = <your-account-id>

# 3. Deploy by pushing to main
git push

# 4. Monitor
gh run list --workflow=aws-oidc-deploy.yml
```

### Manual CDK Deployment

```bash
cd packages/infra

# Install dependencies
pnpm install

# Preview changes
pnpm nx cdk diff infra

# Deploy
pnpm nx cdk deploy infra --all --require-approval never
```

---

## Verification

### Verify OIDC Provider

```bash
# List all OIDC providers
aws iam list-open-id-connect-providers

# Get specific provider details
PROVIDER_ARN=$(aws iam list-open-id-connect-providers \
  --query "OpenIDConnectProviderList[0].Arn" --output text)
aws iam get-open-id-connect-provider --open-id-connect-provider-arn $PROVIDER_ARN

# Check thumbprint
aws iam get-open-id-connect-provider \
  --open-id-connect-provider-arn arn:aws:iam::ACCOUNT:oidc-provider/token.actions.githubusercontent.com | jq '.ThumbprintList'
```

### Verify IAM Role

```bash
# Get role details
aws iam get-role --role-name github-actions-role

# View trust policy
aws iam get-role --role-name github-actions-role \
  --query 'Role.AssumeRolePolicyDocument' | jq .

# View inline policies
aws iam list-role-policies --role-name github-actions-role

# View attached policies
aws iam list-attached-role-policies --role-name github-actions-role

# Get specific policy
POLICY_NAME=$(aws iam list-role-policies \
  --role-name github-actions-role \
  --query 'PolicyNames[0]' --output text)
aws iam get-role-policy \
  --role-name github-actions-role \
  --policy-name $POLICY_NAME | jq '.PolicyDocument'
```

### Test OIDC Token

```bash
# Simulate GitHub Actions context
TOKEN=$(curl -s -H "Authorization: bearer $ACTIONS_ID_TOKEN_REQUEST_TOKEN" \
  "$ACTIONS_ID_TOKEN_REQUEST_URL" | jq -r '.token')

# Decode and inspect token
echo $TOKEN | jq -R 'split(".") | .[0:2] | map(@base64d | fromjson)'

# Attempt assume role with token
aws sts assume-role-with-web-identity \
  --role-arn arn:aws:iam::ACCOUNT:role/github-actions-role \
  --role-session-name github-actions \
  --web-identity-token $TOKEN \
  --duration-seconds 3600
```

---

## CloudTrail Audit Logging

### View OIDC Usage

```bash
# Get CloudTrail events for OIDC role
aws cloudtrail lookup-events \
  --lookup-attributes AttributeKey=ResourceName,AttributeValue=github-actions-role \
  --max-results 50

# Get role assumption events
aws cloudtrail lookup-events \
  --lookup-attributes AttributeKey=EventName,AttributeValue=AssumeRole \
  --start-time 2024-01-01 \
  --end-time 2024-12-31 | jq '.Events[] | select(.CloudTrailEvent | contains("github-actions-role"))'

# Get with detailed output
aws cloudtrail lookup-events \
  --lookup-attributes AttributeKey=ResourceName,AttributeValue=github-actions-role \
  --query 'Events[*].[EventName,EventTime,Username,EventSource,CloudTrailEvent]' \
  --output table
```

---

## ECR Management

### Create ECR Repository

```bash
# Create repository
aws ecr create-repository \
  --repository-name profiler-api \
  --region us-east-1

# Set lifecycle policy (30 days retention)
aws ecr put-lifecycle-policy \
  --repository-name profiler-api \
  --lifecycle-policy-text '{
    "rules": [
      {
        "rulePriority": 1,
        "description": "Keep last 10 images",
        "selection": {
          "tagStatus": "any",
          "countType": "imageCountMoreThan",
          "countNumber": 10
        },
        "action": {
          "type": "expire"
        }
      }
    ]
  }'

# List repositories
aws ecr describe-repositories

# Get repository URI
aws ecr describe-repositories \
  --repository-names profiler-api \
  --query 'repositories[0].repositoryUri' --output text
```

### Push Images to ECR

```bash
# Get login token
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin ACCOUNT.dkr.ecr.us-east-1.amazonaws.com

# Build and push
docker build -t profiler-api:latest .
docker tag profiler-api:latest ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/profiler-api:latest
docker push ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/profiler-api:latest

# List images in repository
aws ecr describe-images --repository-name profiler-api
```

---

## S3 & CloudFront Management

### S3 Web Deployment

```bash
# Create bucket
aws s3 mb s3://profiler-web --region us-east-1

# Upload files
aws s3 sync . s3://profiler-web --delete

# Set cache policy
aws s3api put-bucket-versioning \
  --bucket profiler-web \
  --versioning-configuration Status=Enabled

# Get bucket website URL
aws s3api get-bucket-website --bucket profiler-web
```

### CloudFront Cache Invalidation

```bash
# Get distribution ID
DIST_ID=$(aws cloudfront list-distributions \
  --query 'DistributionList.Items[0].Id' --output text)

# Invalidate cache
aws cloudfront create-invalidation \
  --distribution-id $DIST_ID \
  --paths "/*"

# Check invalidation status
aws cloudfront list-invalidations --distribution-id $DIST_ID

# Get invalidation details
aws cloudfront get-invalidation \
  --distribution-id $DIST_ID \
  --id INVALIDATION_ID
```

---

## App Runner Deployment

### Create Service

```bash
# Create service
aws apprunner create-service \
  --service-name profiler-api \
  --source-configuration '
  {
    "ImageRepository": {
      "ImageIdentifier": "ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/profiler-api:latest",
      "ImageRepositoryType": "ECR"
    },
    "AutoDeploymentsEnabled": true
  }' \
  --instance-configuration InstanceRoleArn=arn:aws:iam::ACCOUNT:role/AppRunnerECRRole

# List services
aws apprunner list-services

# Get service details
aws apprunner describe-service --service-arn <SERVICE_ARN>

# Start deployment
aws apprunner start-deployment \
  --service-arn <SERVICE_ARN>

# Stop service
aws apprunner pause-service --service-arn <SERVICE_ARN>
```

---

## Troubleshooting

### Issue: "InvalidParameterValueException: Invalid thumbprint"

```bash
# Update thumbprint to current value
THUMBPRINT=$(echo | openssl s_client -servername token.actions.githubusercontent.com \
  -connect token.actions.githubusercontent.com:443 2>/dev/null | \
  openssl x509 -fingerprint -noout | sed 's/://g' | \
  awk -F= '{print tolower($2)}')

echo "New thumbprint: $THUMBPRINT"

# Update CDK: Edit packages/infra/src/lib/stacks/github-oidc.stack.ts
# Replace: thumbprints: ['6938fd4d98bab03faadb97b34396831e3780aea1']
# With:    thumbprints: ['$THUMBPRINT']
```

### Issue: "AccessDenied: User is not authorized to perform assume role"

```bash
# Check role trust policy
aws iam get-role --role-name github-actions-role \
  --query 'Role.AssumeRolePolicyDocument'

# Verify it includes your repository
# Should contain: "repo:Programming-Factory-Inc/profiler:*"

# If missing, update CDK repos parameter and redeploy
```

### Issue: "No credentials provided"

```bash
# Verify GitHub secret is set
gh secret list --repo Programming-Factory-Inc/profiler

# Verify environment variables in workflow
curl -s https://api.github.com/repos/Programming-Factory-Inc/profiler/actions/variables \
  -H "Authorization: token $GITHUB_TOKEN" | jq '.variables[] | select(.name=="AWS_ACCOUNT_ID")'
```

### Issue: "ECR authentication failed"

```bash
# Re-authenticate with ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin ACCOUNT.dkr.ecr.us-east-1.amazonaws.com

# Verify permissions in IAM role
aws iam get-role-policy \
  --role-name github-actions-role \
  --policy-name GitHubActionsRolePolicy
```

---

## Useful Aliases

Add to `~/.bashrc` or `~/.zshrc`:

```bash
alias oidc-verify='aws iam list-open-id-connect-providers'
alias oidc-role='aws iam get-role --role-name github-actions-role --query "Role.AssumeRolePolicyDocument" | jq .'
alias ecr-login='aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $(aws sts get-caller-identity --query "Account" --output text).dkr.ecr.us-east-1.amazonaws.com'
alias cf-invalidate='aws cloudfront create-invalidation --distribution-id $(aws cloudfront list-distributions --query "DistributionList.Items[0].Id" --output text) --paths "/*"'
alias cf-status='aws cloudfront list-invalidations --distribution-id $(aws cloudfront list-distributions --query "DistributionList.Items[0].Id" --output text)'
```

Usage: `oidc-verify`, `oidc-role`, `ecr-login`, etc.

---

## For onlycats Project

Same commands work - just update repository names:

```bash
# Replace profiler-api with onlycats-api
# Replace profiler-web with onlycats-web

# Update GitHub Actions workflow: .github/workflows/aws-oidc-deploy.yml
# Update repositories in CDK: packages/infra/src/main.ts
```

---

## External Resources

- [AWS OIDC Documentation](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_create_oidc.html)
- [GitHub OIDC Guide](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect)
- [AWS CLI Reference](https://docs.aws.amazon.com/cli/latest/reference/)
- [AWS CDK Reference](https://docs.aws.amazon.com/cdk/api/v2/)
