# PowerShell Script to Check and Validate Secrets
# Проверяет все критически важные ключи и секреты

# Colors
$Green = @{ ForegroundColor = 'Green' }
$Yellow = @{ ForegroundColor = 'Yellow' }
$Red = @{ ForegroundColor = 'Red' }
$Blue = @{ ForegroundColor = 'Blue' }
$Cyan = @{ ForegroundColor = 'Cyan' }

function Write-Success { param([string]$Message) Write-Host "✅ $Message" @Green }
function Write-Warning { param([string]$Message) Write-Host "⚠️  $Message" @Yellow }
function Write-Error { param([string]$Message) Write-Host "❌ $Message" @Red }
function Write-Info { param([string]$Message) Write-Host "ℹ️  $Message" @Blue }
function Write-Header { param([string]$Message) Write-Host "🔍 $Message" @Cyan }

Write-Header "NormalDance - Проверка секретов и ключей"
Write-Host ""
Write-Info "Проверка всех критически важных секретов..."
Write-Host ""

# Function to load .env file
function Load-EnvFile {
    param([string]$FilePath)
    if (Test-Path $FilePath) {
        $content = Get-Content $FilePath
        $envVars = @{}
        foreach ($line in $content) {
            if ($line -and $line -notmatch '^#' -and $line -match '^(.+?)=(.+)$') {
                $envVars[$matches[1].Trim()] = $matches[2].Trim()
            }
        }
        return $envVars
    }
    return @{}
}

# Load environment variables
$envVars = Load-EnvFile ".env"
Write-Host ""

# 1. Check local .env file
Write-Header "Проверка локального .env файла:"
if (-not (Test-Path ".env")) {
    Write-Error ".env файл не найден"
} else {
    Write-Success ".env файл найден"
    
    # Check critical variables
    $criticalVars = @(
        "NEXTAUTH_SECRET",
        "JWT_SECRET", 
        "API_SECRET_KEY",
        "DATABASE_URL"
    )
    
    $missingCount = 0
    foreach ($var in $criticalVars) {
        if (-not $envVars.ContainsKey($var) -or [string]::IsNullOrWhiteSpace($envVars[$var])) {
            Write-Error "$var отсутствует или пуст"
            $missingCount++
        } else {
            $value = $envVars[$var]
            if ($value -match "CHANGE_ME|REPLACE_WITH|example") {
                Write-Warning "$var использует placeholder значение"
                $missingCount++
            } else {
                Write-Success "$var установлен"
            }
        }
    }
    
    if ($missingCount -eq 0) {
        Write-Success "Все критические переменные в .env в порядке"
    } else {
        Write-Warning "$missingCount переменных требуют внимания"
    }
}

Write-Host ""

# 2. Check GitHub CLI and authentication
Write-Header "Проверка GitHub CLI и аутентификации:"
try {
    $ghVersion = gh --version
    Write-Success "GitHub CLI установлен: $ghVersion"
}
catch {
    Write-Error "GitHub CLI не установлен. Установите: https://cli.github.com/"
    exit 1
}

try {
    gh auth status | Out-Null
    Write-Success "Аутентификация GitHub успешна"
}
catch {
    Write-Error "Не авторизован в GitHub. Выполните: gh auth login"
    exit 1
}

Write-Host ""

# 3. Check GitHub repository secrets
Write-Header "Проверка секретов репозитория GitHub:"

try {
    $secrets = gh secret list
    $criticalSecrets = @(
        "NEXTAUTH_SECRET",
        "JWT_SECRET",
        "DATABASE_URL",
        "OPENAI_API_KEY",
        "NEXTAUTH_URL"
    )
    
    $foundSecrets = 0
    $totalCritical = $criticalSecrets.Count
    
    foreach ($secret in $criticalSecrets) {
        if ($secrets -match $secret) {
            Write-Success "$secret установлен"
            $foundSecrets++
        } else {
            Write-Error "$secret отсутствует в GitHub secrets"
        }
    }
    
    Write-Info "Найдено $foundSecrets из $totalCritical критических секретов"
    
} catch {
    Write-Error "Не удалось получить список секретов: $($_.Exception.Message)"
}

Write-Host ""

# 4. Test database connection (if DATABASE_URL exists)
if ($envVars.ContainsKey("DATABASE_URL") -and $envVars["DATABASE_URL"]) {
    Write-Header "Проверка подключения к базе данных:"
    $dbUrl = $envVars["DATABASE_URL"]
    
    if ($dbUrl -match "^postgresql://") {
        Write-Success "PostgreSQL connection string обнаружен"
        
        # Test with psql if available
        try {
            $psqlTest = psql --version 2>$null
            if ($psqlTest) {
                Write-Info "PostgreSQL клиент доступен"
                # Не теструем подключение тут, только проверяем формат
                if ($dbUrl -match "localhost|127\.0\.0\.1") {
                    Write-Warning "Используется локальная база данных. Для production используйте облачное решение (Supabase, Railway)"
                } else {
                    Write-Success "Используется облачная база данных"
                }
            }
        } catch {
            Write-Warning "PostgreSQL клиент не установлен, формат строки не проверен"
        }
    } elseif ($dbUrl -match "^file:.*\.db$") {
        Write-Warning "Используется SQLite файловая база. Для production используйте PostgreSQL"
    } else {
        Write-Warning "Неизвестный формат DATABASE_URL"
    }
} else {
    Write-Warning "DATABASE_URL не настроен"
}

Write-Host ""

# 5. Check generated backup files
Write-Header "Проверка резервных копий секретов:"
if (Test-Path ".env.generated") {
    Write-Warning "Найден .env.generated - удалите его для безопасности"
}
if (Test-Path ".env.generated.backup") {
    Write-Warning "Найден .env.generated.backup - храните в безопасном месте"
}

Write-Host ""

# 6. Solana Program IDs validation
Write-Header "Проверка Solana Program IDs:"
$solanaPrograms = @(
    "NEXT_PUBLIC_NDT_PROGRAM_ID",
    "NEXT_PUBLIC_TRACKNFT_PROGRAM_ID", 
    "NEXT_PUBLIC_STAKING_PROGRAM_ID"
)

foreach ($program in $solanaPrograms) {
    if ($envVars.ContainsKey($program)) {
        $value = $envVars[$program]
        if ($value -match "1111|CHANGE_ME|REPLACE_WITH") {
            Write-Warning "$program использует тестовое/placeholder значение"
        } elseif ($value -match "^[A-HJ-NP-Z0-9]{44,59}$") {
            Write-Success "$program имеет правильный формат Solana адреса"
        } else {
            Write-Warning "$program имеет некорректный формат"
        }
    } else {
        Write-Warning "$program отсутствует в .env"
    }
}

Write-Host ""

# 7. API Keys validation
Write-Header "Проверка ключей внешних сервисов:"
$apiKeys = @(
    @{ Name = "OPENAI_API_KEY"; Pattern = "^sk-[A-Za-z0-9]{48,}" },
    @{ Name = "SPOTIFY_CLIENT_ID"; Pattern = "^[a-fA-F0-9]{32}$" },
    @{ Name = "PINATA_API_KEY"; Pattern = "^[A-Za-z0-9]{32,}$" },
    @{ Name = "TELEGRAM_BOT_TOKEN"; Pattern = "^[0-9]{8,}:[A-Za-z0-9_-]{35}$" }
)

foreach ($key in $apiKeys) {
    if ($envVars.ContainsKey($key.Name)) {
        $value = $envVars[$key.Name]
        if ($value -match "CHANGE_ME|REPLACE_WITH|your-") {
            Write-Warning "$($key.Name) требует реального API ключа"
        } elseif ($value -match $key.Pattern) {
            Write-Success "$($key.Name) имеет правильный формат"
        } else {
            Write-Warning "$($key.Name) имеет некорректный формат"
        }
    } else {
        Write-Info "$($key.Name) не установлен (необязательно для базового функционала)"
    }
}

Write-Host ""

# Summary
Write-Header "Сводка по безопасности:"
if (Test-Path ".env") {
    $envContent = Get-Content ".env"
    $anyChangeMe = $envContent -match "CHANGE_ME|REPLACE_WITH|your-"
    if ($anyChangeMe) {
        Write-Warning "В .env есть placeholder значения - замените их перед production"
    }
    
    if (Test-Path ".git") {
        $gitIgnore = Get-Content ".gitignore"
        if ($gitIgnore -match "^\s*\.env\s*$") {
            Write-Success ".env.exclude в .gitignore - в безопасности"
        } else {
            Write-Error "Добавьте .env в .gitignore немедленно!"
        }
    }
}

Write-Host ""
Write-Header "Рекомендации по следующим шагам:"
Write-Host "1. Получите реальный Database URL (Supabase/Railway/Vercel)"
Write-Host "2. Установите все GitHub secrets: gh secret set NAME --body 'value'"
Write-Host "3. Получите реальные API ключи для OpenAI, Spotify, Pinata"
Write-Host "4. Разверните Solana программы и используйте реальные Program IDs"
Write-Host "5. Удалите .env.generated файлы из репозитория"

Write-Host ""
Write-Success "Проверка секретов завершена!"
