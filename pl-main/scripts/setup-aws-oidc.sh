#!/usr/bin/env bash

# AWS OIDC Setup Script for GitHub Actions
# Automates OIDC provider and IAM role creation
# Usage: ./setup-aws-oidc.sh [--profile=PROFILE] [--region=REGION] [--dry-run]

set -e

# ============ Configuration ============
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
AWS_PROFILE="${AWS_PROFILE:-default}"
AWS_REGION="${AWS_REGION:-us-east-1}"
DRY_RUN=false
ROLE_NAME="github-actions-role"

# ============ Colors ============
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ============ Helper Functions ============
log_info() {
  echo -e "${GREEN}ℹ${NC} $1"
}

log_warn() {
  echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
  echo -e "${RED}✗${NC} $1"
}

log_success() {
  echo -e "${GREEN}✓${NC} $1"
}

# ============ Parse Arguments ============
for arg in "$@"; do
  case $arg in
    --profile=*)
      AWS_PROFILE="${arg#*=}"
      shift
      ;;
    --region=*)
      AWS_REGION="${arg#*=}"
      shift
      ;;
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --help)
      echo "AWS OIDC Setup Script"
      echo ""
      echo "Usage: $0 [OPTIONS]"
      echo ""
      echo "Options:"
      echo "  --profile=PROFILE   AWS profile to use (default: default)"
      echo "  --region=REGION     AWS region (default: us-east-1)"
      echo "  --dry-run           Show what would be done without making changes"
      echo "  --help              Show this help message"
      exit 0
      ;;
  esac
done

# ============ Verify Prerequisites ============
log_info "Verifying prerequisites..."

if ! command -v aws &> /dev/null; then
  log_error "AWS CLI not found. Please install it: https://aws.amazon.com/cli/"
  exit 1
fi

if ! command -v jq &> /dev/null; then
  log_warn "jq not found. Some features may be limited."
fi

# Test AWS credentials
if ! aws sts get-caller-identity --profile "$AWS_PROFILE" &> /dev/null; then
  log_error "Cannot authenticate with AWS profile '$AWS_PROFILE'"
  echo "Run: aws configure --profile $AWS_PROFILE"
  exit 1
fi

ACCOUNT_ID=$(aws sts get-caller-identity --profile "$AWS_PROFILE" --query Account --output text)
log_success "AWS credentials valid (Account: $ACCOUNT_ID)"

# ============ Get GitHub Information ============
log_info "Detecting GitHub repositories..."

# Try to get from git remote
if REPO_URL=$(git config --get remote.origin.url 2>/dev/null); then
  REPO=$(echo "$REPO_URL" | sed 's/.*://;s/.git$//' | sed 's|^https://github.com/||')
  log_success "Detected repository: $REPO"
else
  read -p "Enter GitHub repository (owner/repo): " REPO
fi

# ============ Get OIDC Thumbprint ============
log_info "Fetching GitHub OIDC provider thumbprint..."

THUMBPRINT=$(echo | openssl s_client -servername token.actions.githubusercontent.com \
  -connect token.actions.githubusercontent.com:443 2>/dev/null | \
  openssl x509 -fingerprint -noout | sed 's/://g' | awk -F= '{print tolower($2)}' | head -c 40)

if [ -z "$THUMBPRINT" ]; then
  log_error "Failed to fetch thumbprint"
  exit 1
fi

log_success "Thumbprint: $THUMBPRINT"

# ============ Deploy CDK Stack ============
log_info "Deploying AWS CDK stack..."

if [ "$DRY_RUN" = true ]; then
  log_info "(DRY RUN) Would deploy to $AWS_REGION"
else
  cd "$PROJECT_ROOT/packages/infra"
  
  if ! pnpm install &> /dev/null; then
    log_error "Failed to install dependencies"
    exit 1
  fi
  
  log_info "Synthesizing CDK..."
  pnpm nx cdk synth infra > /dev/null 2>&1
  
  log_info "Deploying CDK stack..."
  pnpm nx cdk deploy infra \
    --profile "$AWS_PROFILE" \
    --require-approval never \
    --all
fi

# ============ Extract Outputs ============
if [ "$DRY_RUN" = false ]; then
  log_info "Extracting stack outputs..."
  
  ROLE_ARN=$(aws iam get-role \
    --role-name "$ROLE_NAME" \
    --profile "$AWS_PROFILE" \
    --query 'Role.Arn' \
    --output text 2>/dev/null || echo "")
  
  if [ ! -z "$ROLE_ARN" ]; then
    log_success "GitHub Actions Role ARN: $ROLE_ARN"
  fi
fi

# ============ Provide Configuration ============
log_info "Configuration summary:"
echo ""
echo "AWS Account:          $ACCOUNT_ID"
echo "AWS Region:           $AWS_REGION"
echo "GitHub Repository:    $REPO"
echo "IAM Role Name:        $ROLE_NAME"
echo ""

log_info "Next steps:"
echo ""
echo "1. Add GitHub secret:"
echo "   Repository → Settings → Secrets and variables → Actions"
echo "   Name: AWS_ACCOUNT_ID"
echo "   Value: $ACCOUNT_ID"
echo ""
echo "2. Update GitHub Actions workflow:"
echo "   File: .github/workflows/aws-oidc-deploy.yml"
echo ""
echo "3. Test OIDC authentication:"
echo "   git push  (or manually trigger workflow)"
echo ""
echo "4. Monitor deployment:"
echo "   gh run list --workflow=aws-oidc-deploy.yml"
echo ""

if [ "$DRY_RUN" = true ]; then
  log_warn "This was a dry run. Re-run without --dry-run to apply changes."
else
  log_success "AWS OIDC setup complete!"
fi
