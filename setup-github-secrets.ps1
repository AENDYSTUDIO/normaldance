# PowerShell Script to Setup GitHub Repository Secrets
# Usage: .\setup-github-secrets.ps1

# Colors for output
$Green = @{ ForegroundColor = 'Green' }
$Yellow = @{ ForegroundColor = 'Yellow' }
$Red = @{ ForegroundColor = 'Red' }
$Blue = @{ ForegroundColor = 'Blue' }

function Write-Success {
    param([string]$Message)
    Write-Host "✓ $Message" @Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠ $Message" @Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "✗ $Message" @Red
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ $Message" @Blue
}

# Check if gh CLI is installed
try {
    $ghVersion = gh --version
    Write-Success "GitHub CLI found: $ghVersion"
}
catch {
    Write-Error "GitHub CLI not found. Install it from: https://cli.github.com/"
    exit 1
}

# Check if authenticated with GitHub
try {
    gh auth status | Out-Null
    Write-Success "Authenticated with GitHub"
}
catch {
    Write-Error "Not authenticated with GitHub. Run: gh auth login"
    exit 1
}

# Generate secrets
function Generate-Secret {
    param([int]$Length = 32)
    $bytes = -join (1..$Length | ForEach-Object { "{0:x2}" -f (Get-Random -Maximum 256) })
    return $bytes
}

function Generate-UUID {
    return [System.Guid]::NewGuid().ToString()
}

Write-Info "Generating secure secrets..."

# Secrets dictionary
$secrets = @{
    # Core Authentication & Security
    NEXTAUTH_SECRET = Generate-Secret 64
    JWT_SECRET = Generate-Secret 64
    API_SECRET_KEY = Generate-Secret 32
    APP_ID = Generate-UUID

    # Database
    DATABASE_URL = "postgresql://normaldance:$(Generate-Secret 16)@localhost:5432/normaldance"
    DB_PASSWORD = Generate-Secret 16
    REDIS_PASSWORD = Generate-Secret 16
    REDIS_URL = "redis://:$(Generate-Secret 16)@localhost:6379"

    # Solana & Web3
    SOLANA_RPC_TIMEOUT = "8000"
    NEXT_PUBLIC_NDT_PROGRAM_ID = "NDT$(Generate-Secret 20).ToUpper()"
    NEXT_PUBLIC_NDT_MINT_ADDRESS = "$(Generate-Secret 40).ToUpper()"
    NEXT_PUBLIC_TRACKNFT_PROGRAM_ID = "TRACKNFT$(Generate-Secret 16).ToUpper()"
    NEXT_PUBLIC_STAKING_PROGRAM_ID = "STAKING$(Generate-Secret 16).ToUpper()"

    # IPFS
    PINATA_API_KEY = Generate-Secret 32
    PINATA_SECRET_KEY = Generate-Secret 32
    PINATA_JWT = Generate-Secret 32

    # External Services
    SPOTIFY_CLIENT_ID = Generate-UUID
    SPOTIFY_CLIENT_SECRET = Generate-Secret 32
    APPLE_CLIENT_ID = Generate-UUID
    APPLE_CLIENT_SECRET = Generate-Secret 32

    # Error Tracking
    SENTRY_DSN = "https://$(Generate-Secret 32)@sentry.io/1234567"
    NEXT_PUBLIC_SENTRY_DSN = "https://$(Generate-Secret 32)@sentry.io/1234567"

    # Telegram
    TELEGRAM_BOT_TOKEN = "$(Generate-Secret 10):A$(Generate-Secret 20).ToUpper()"
    TELEGRAM_CHAT_ID = Generate-Secret 10

    # Vercel
    VERCEL_PROJECT_NAME = "normaldance"
    NEXT_PUBLIC_VERCEL_ANALYTICS_ID = Generate-UUID

    # AI/ML Services
    LANGGRAPH_API_KEY = "sk-$(Generate-Secret 32)"
    OPENAI_API_KEY = "sk-$(Generate-Secret 48)"

    # Upstash Redis
    UPSTASH_REDIS_REST_URL = "https://$(Generate-Secret 16).upstash.io"
    UPSTASH_REDIS_REST_TOKEN = Generate-Secret 32

    # Analytics
    MIXPANEL_TOKEN = Generate-Secret 32
}

# Save secrets to a file for backup
$envContent = @()
foreach ($secret in $secrets.GetEnumerator()) {
    $envContent += "$($secret.Key)=$($secret.Value)"
}
$envContent -join "`n" | Out-File -FilePath ".env.generated.backup" -Encoding UTF8

Write-Info "Setting up GitHub repository secrets..."

$successCount = 0
$totalCount = $secrets.Count

foreach ($secret in $secrets.GetEnumerator()) {
    try {
        Write-Host "Setting $secret.Key..." -ForegroundColor Gray
        gh secret set $secret.Key --body $secret.Value
        Write-Success "Set $secret.Key"
        $successCount++
    }
    catch {
        Write-Error "Failed to set $secret.Key : $($_.Exception.Message)"
    }
}

Write-Host ""
Write-Success "Successfully set $successCount/$totalCount secrets"
Write-Host ""

if ($successCount -lt $totalCount) {
    Write-Warning "Some secrets failed to set. Check the errors above."
    Write-Warning "You can retry this script or set secrets manually."
}

Write-Host ""
Write-Info "=== IMPORTANT NOTES ==="
Write-Info "1. A backup .env.generated.backup file has been created"
Write-Info "2. These are generated values - you may need to replace some with actual API keys"
Write-Info "3. Keep the backup file secure and do not commit it to version control"
Write-Info "4. Update program IDs with actual deployed contract addresses"
Write-Info "5. Replace placeholder secrets with real API keys from service providers"

Write-Host ""
Write-Warning "=== CRITICAL SECRETS THAT NEED MANUAL REPLACEMENT ==="
Write-Warning "You must manually replace these secrets with real values:"
Write-Host "• OPENAI_API_KEY (get from platform.openai.com)"
Write-Host "• SPOTIFY_CLIENT_ID & SPOTIFY_CLIENT_SECRET (from Spotify Developer Dashboard)"
Write-Host "• APPLE_CLIENT_ID & APPLE_CLIENT_SECRET (from Apple Developer Portal)"
Write-Host "• SENTRY_DSN (from Sentry.io project)"
Write-Host "• Program IDs (from actual deployed Solana programs)"
Write-Host "• PINATA credentials (from Pinata.cloud)"
Write-Host "• TELEGRAM_BOT_TOKEN (from @BotFather on Telegram)"

Write-Host ""
Write-Info "To update a secret manually, use:"
Write-Info 'gh secret set SECRET_NAME --body "your-value"'
Write-Host ""

Write-Success "GitHub secrets setup complete!"
