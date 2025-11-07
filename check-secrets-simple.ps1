# Simple PowerShell Script to Check Secrets
# Проверка секретов без сложных кавычек

function Write-Info { param([string]$Message) Write-Host "INFO: $Message" -ForegroundColor Blue }
function Write-Success { param([string]$Message) Write-Host "OK: $Message" -ForegroundColor Green }
function Write-Warning { param([string]$Message) Write-Host "WARN: $Message" -ForegroundColor Yellow }
function Write-Error { param([string]$Message) Write-Host "ERROR: $Message" -ForegroundColor Red }

Write-Host "NormalDance - Secret Check" -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Error ".env file not found"
} else {
    Write-Success ".env file found"
    
    # Read .env content
    $envContent = Get-Content ".env"
    
    # Check for critical variables
    $criticalVars = @("NEXTAUTH_SECRET", "JWT_SECRET", "DATABASE_URL", "OPENAI_API_KEY")
    
    foreach ($var in $criticalVars) {
        $found = $false
        foreach ($line in $envContent) {
            if ($line -match "^$var=(.*)") {
                $found = $true
                $value = $matches[1]
                if ($value -match "CHANGE_ME|your-|REPLACE_WITH") {
                    Write-Warning "$var has placeholder value"
                } else {
                    Write-Success "$var is set"
                }
                break
            }
        }
        if (-not $found) {
            Write-Error "$var is missing"
        }
    }
}

Write-Host ""

# Check GitHub CLI
try {
    $ghAuth = gh auth status 2>$null
    Write-Success "GitHub CLI authenticated"
} catch {
    Write-Error "GitHub CLI not authenticated"
}

Write-Host ""

# Check GitHub secrets
try {
    $secrets = gh secret list
    Write-Success "Connected to GitHub repository"
    
    $criticalSecrets = @("NEXTAUTH_SECRET", "DATABASE_URL", "OPENAI_API_KEY")
    
    foreach ($secret in $criticalSecrets) {
        if ($secrets -match $secret) {
            Write-Success "GitHub secret $secret exists"
        } else {
            Write-Warning "GitHub secret $secret missing"
        }
    }
} catch {
    Write-Error "Cannot access GitHub secrets"
}

Write-Host ""

# Check Solana program IDs in .env
if (Test-Path ".env") {
    $envContent = Get-Content ".env"
    
    $solanaVars = @("NEXT_PUBLIC_NDT_PROGRAM_ID", "NEXT_PUBLIC_TRACKNFT_PROGRAM_ID")
    
    foreach ($var in $solanaVars) {
        foreach ($line in $envContent) {
            if ($line -match "^$var=(.*)") {
                $value = $matches[1]
                if ($value -match "1111|CHANGE_ME") {
                    Write-Warning "$var uses test value"
                } else {
                    Write-Success "$var uses real value"
                }
                break
            }
        }
    }
}

Write-Host ""
Write-Info "Secret check completed"

# Recommendations
Write-Host ""
Write-Host "Recommended actions:" -ForegroundColor Cyan
Write-Host "1. Set real DATABASE_URL from Supabase/Railway"
Write-Host "2. Set real OPENAI_API_KEY from OpenAI platform"
Write-Host "3. Update all GitHub secrets with: gh secret set NAME --body 'value'"
Write-Host "4. Replace placeholder values before production deployment"
