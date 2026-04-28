# AWS OIDC Setup Script for GitHub Actions (PowerShell)
# Automates OIDC provider and IAM role creation for Windows
# Usage: .\setup-aws-oidc.ps1 -Profile default -Region us-east-1

param(
    [string]$Profile = "default",
    [string]$Region = "us-east-1",
    [switch]$DryRun = $false,
    [switch]$Help = $false
)

# ============ Configuration ============
$SCRIPT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
$PROJECT_ROOT = Split-Path -Parent $SCRIPT_DIR
$ROLE_NAME = "github-actions-role"

# ============ Colors ============
function Write-Info {
    param([string]$Message)
    Write-Host "ℹ $Message" -ForegroundColor Green
}

function Write-Warn {
    param([string]$Message)
    Write-Host "⚠ $Message" -ForegroundColor Yellow
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

function Write-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

# ============ Help ============
if ($Help) {
    Write-Host "AWS OIDC Setup Script (PowerShell)"
    Write-Host ""
    Write-Host "Usage: .\setup-aws-oidc.ps1 [OPTIONS]"
    Write-Host ""
    Write-Host "Options:"
    Write-Host "  -Profile <string>  AWS profile to use (default: default)"
    Write-Host "  -Region <string>   AWS region (default: us-east-1)"
    Write-Host "  -DryRun           Show what would be done without making changes"
    Write-Host "  -Help             Show this help message"
    exit 0
}

# ============ Verify Prerequisites ============
Write-Info "Verifying prerequisites..."

# Check AWS CLI
if (-not (Get-Command aws -ErrorAction SilentlyContinue)) {
    Write-Error-Custom "AWS CLI not found. Please install it: https://aws.amazon.com/cli/"
    exit 1
}

# Test AWS credentials
try {
    $callerIdentity = aws sts get-caller-identity --profile $Profile 2>&1 | ConvertFrom-Json
    $ACCOUNT_ID = $callerIdentity.Account
    Write-Success "AWS credentials valid (Account: $ACCOUNT_ID)"
} catch {
    Write-Error-Custom "Cannot authenticate with AWS profile '$Profile'"
    Write-Host "Run: aws configure --profile $Profile"
    exit 1
}

# ============ Get GitHub Information ============
Write-Info "Detecting GitHub repository..."

$gitUrl = git config --get remote.origin.url 2>$null
if ($gitUrl) {
    $REPO = $gitUrl -replace '.*:', '' -replace '\.git$', '' -replace 'https://github.com/', ''
    Write-Success "Detected repository: $REPO"
} else {
    $REPO = Read-Host "Enter GitHub repository (owner/repo)"
}

# ============ Get OIDC Thumbprint ============
Write-Info "Fetching GitHub OIDC provider thumbprint..."

try {
    # Using OpenSSL via PowerShell
    $certData = openssl s_client -servername token.actions.githubusercontent.com `
        -connect token.actions.githubusercontent.com:443 -showcerts 2>$null | `
        Select-String -Pattern "-----BEGIN CERTIFICATE-----" -Context 0, 50 | `
        Select-Object -First 1

    if ($certData) {
        # Extract and compute thumbprint
        $cert = [System.Security.Cryptography.X509Certificates.X509Certificate2]::new()
        $THUMBPRINT = $cert.Thumbprint.ToLower()
        Write-Success "Thumbprint: $THUMBPRINT"
    } else {
        Write-Warn "Could not fetch thumbprint automatically. Using default."
        $THUMBPRINT = "6938fd4d98bab03faadb97b34396831e3780aea1"
    }
} catch {
    Write-Warn "Error fetching thumbprint, using hardcoded value"
    $THUMBPRINT = "6938fd4d98bab03faadb97b34396831e3780aea1"
}

# ============ Deploy CDK Stack ============
Write-Info "Deploying AWS CDK stack..."

if ($DryRun) {
    Write-Info "(DRY RUN) Would deploy to $Region"
} else {
    Push-Location "$PROJECT_ROOT\packages\infra"
    
    try {
        Write-Info "Installing dependencies..."
        pnpm install 2>$null
        
        Write-Info "Synthesizing CDK..."
        pnpm nx cdk synth infra 2>&1 | Out-Null
        
        Write-Info "Deploying CDK stack..."
        pnpm nx cdk deploy infra `
            --profile $Profile `
            --require-approval never `
            --all
        
        Write-Success "CDK deployment complete"
    } catch {
        Write-Error-Custom "Failed to deploy CDK: $_"
        exit 1
    } finally {
        Pop-Location
    }
}

# ============ Extract Outputs ============
if (-not $DryRun) {
    Write-Info "Extracting stack outputs..."
    
    try {
        $role = aws iam get-role `
            --role-name $ROLE_NAME `
            --profile $Profile `
            --query 'Role.Arn' `
            --output text 2>$null
        
        if ($role) {
            Write-Success "GitHub Actions Role ARN: $role"
        }
    } catch {
        Write-Warn "Could not retrieve role ARN"
    }
}

# ============ Configuration Summary ============
Write-Info "Configuration summary:"
Write-Host ""
Write-Host "AWS Account:          $ACCOUNT_ID"
Write-Host "AWS Region:           $Region"
Write-Host "GitHub Repository:    $REPO"
Write-Host "IAM Role Name:        $ROLE_NAME"
Write-Host ""

Write-Info "Next steps:"
Write-Host ""
Write-Host "1. Add GitHub secret:"
Write-Host "   Repository → Settings → Secrets and variables → Actions"
Write-Host "   Name: AWS_ACCOUNT_ID"
Write-Host "   Value: $ACCOUNT_ID"
Write-Host ""
Write-Host "2. Update GitHub Actions workflow:"
Write-Host "   File: .github/workflows/aws-oidc-deploy.yml"
Write-Host ""
Write-Host "3. Test OIDC authentication:"
Write-Host "   git push  (or manually trigger workflow)"
Write-Host ""
Write-Host "4. Monitor deployment:"
Write-Host "   gh run list --workflow=aws-oidc-deploy.yml"
Write-Host ""

if ($DryRun) {
    Write-Warn "This was a dry run. Re-run without -DryRun to apply changes."
} else {
    Write-Success "AWS OIDC setup complete!"
}
