#!/bin/bash

# NORMAL DANCE Project Cleanup Script
# Удаляет документацию с результатами и планами, сохраняет только код

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo -e "${GREEN}🧹 NORMAL DANCE Project Cleanup${NC}"
echo -e "${GREEN}================================${NC}"
echo -e "${BLUE}Removing plans, reports, and marketing materials${NC}"
echo -e "${BLUE}Keeping only code and technical documentation${NC}"
echo

# Safety check
if [ ! -f "package.json" ]; then
    log_error "Not in the main NORMAL DANCE repository"
    exit 1
fi

# Function to remove files if they exist
remove_if_exists() {
    local file="$1"
    if [ -f "$file" ] || [ -d "$file" ]; then
        log_info "Removing: $file"
        rm -rf "$file"
    fi
}

# Function to check if file exists and is important
check_important() {
    local file="$1"
    local description="$2"
    
    if [ -f "$file" ]; then
        echo "✅ $description: $file (preserved)"
    else
        echo "❌ $description: $file (not found)"
    fi
}

echo -e "${BLUE}📋 Starting cleanup process...${NC}"

# Remove reports and summaries
echo -e "${BLUE}Removing reports and summaries...${NC}"
remove_if_exists "FINAL_REPORT.md"
remove_if_exists "PFINAL_SUMMARY.md"
remove_if_exists "RELEASE_SUMMARY.md"
remove_if_exists "RELEASE-NOTES.md"
remove_if_exists "LAUNCH_REPORT.md"
remove_if_exists "DAY1_SUMMARY.md"
remove_if_exists "PROJECT_IMPROVEMENT_SUMMARY.md"
remove_if_exists "README-secrets.md"
remove_if_exists "PRIVACY.md"

# Remove implementation and analysis reports
echo -e "${BLUE}Removing implementation reports...${NC}"
remove_if_exists "IMPLEMENTATION_PLAN.md"
remove_if_exists "PROJECT_ANALYSIS_REPORT.md"
remove_if_exists "ARCHITECTURE_ANALYSIS_REPORT.md"
remove_if_exists "ARCHITECTURE_SEPARATION_GUIDE.md"
remove_if_exists "INVISIBLE_WALLET_*.md"
remove_if_exists "GR IMPLEMENTATION_STATUS.md"
remove_if_exists "G.rave 2.0.md"

# Remove task files and progress reports
echo -e "${BLUE}Removing task files...${NC}"
remove_if_exists "TASK1_TYPE_SAFETY_PROGRESS.md"
remove_if_exists "TASK4_LOGGER_COMPLETED.md"
remove_if_exists "TASK5_MOCK_DATA_REMOVAL.md"
remove_if_exists "TASK6_SECURITY_COMPLETED.md"
remove_if_exists "TASK*_*.md"
remove_if_exists "PHASE1_*.md"
remove_if_exists "PHASE2_*.md"
remove_if_exists "MONITORING_WEEK3.md"
remove_if_exists "PERFORMANCE_WEEK4.md"
remove_if_exists "TESTING_WEEK2.md"
remove_if_exists "SECURITY_FIXES_WEEK1.md"

# Remove TODO and planning files
echo -e "${BLUE}Removing planning files...${NC}"
remove_if_exists "SOLO_DEV_TODO.md"
remove_if_exists "START_HERE.md"
remove_if_exists "READY_TO_RUN.md"
remove_if_exists "NEXT_STEPS_FOR_REMAINING_ISSUES.md"
remove_if_exists "SOLO_DEV_TODO.md"

# Remove technical debt reports
echo -e "${BLUE}Removing technical debt reports...${NC}"
remove_if_exists "TECHNICAL_DEBT_REPORT_2024.md"
remove_if_exists "TECHNICAL_DEBT_REGISTER.md"
remove_if_exists "TECHNICAL_DEBT_REGISTER_GUIDE.md"
remove_if_exists "TECHNICAL_DEBT_GUIDE.md"
remove_if_exists "TECHNICAL_DEBT_ANALYSIS.md"

# Remove temporary guides and quick starts
echo -e "${BLUE}Removing temporary guides...${NC}"
remove_if_exists "QUICK_START.md"
remove_if_exists "QUICK_START_GRAVE_2.0.md"
remove_if_exists "QUICK_SECURITY_FIXES.md"
remove_if_exists "QUICK_FIX_GUIDE.md"
remove_if_exists "QUICK_FIX.md"
remove_if_exists "QUICK_VERIFY_FIXES.md"
remove_if_exists "quick-setup-guide.md"

# Remove deployment roadmaps and guides
echo -e "${BLUE}Removing deployment guides...${NC}"
remove_if_exists "VERCEL_DEPLOYMENT_ROADMAP.md"
remove_if_exists "VERCEL_DEPLOYMENT_FIXES.md"
remove_if_exists "VERCEL_DEPLOYMENT_GUIDE_RU.md"
remove_if_exists "DEPLOY_STEP_BY_STEP.md"
remove_if_exists "DEPLOY_AUTO_README.md"
remove_if_exists "CREATE_REPOSITORIES.md"
remove_if_exists "ЗАПУСК_ПРЯМО_СЕЙЧАС.md"
remove_if_exists "РАЗВЕРТЫВАНИЕ_ПСКУАДРУКОВАНИЕ.md"
remove_if_exists "БЫСТРАЯ_РАЗВЕРТКА.md"

# Remove specific project implementation files
echo -e "${BLUE}Removing specific project files...${NC}"
remove_if_exists "brif.md"
remove_if_exists "блокчеин*.md"
remove_if_exists "COMPREHENSIVE_CI_CD_SOLUTION.md"
remove_if_exists "CI_CD_ISSUES_ANALYSIS.md"
remove_if_exists "FINAL_CI_CD_FIXES_SUMMARY.md"
remove_if_exists "WEEKLY_CHECKLIST.md"

# Remove marketing and sales materials
echo -e "${YELLOW}Removing marketing and sales materials...${NC}"
remove_if_exists "sales-packet/"
remove_if_exists "grants/"
remove_if_exists "pitch_deck.md"
remove_if_exists "business-presentation.md"
remove_if_exists "investor-teaser.md"
remove_if_exists "telegram-partnership/"

# Remove blockchain/grant specific files
echo -e "${BLUE}Removing blockchain/grant materials...${NC}"
remove_if_exists "TON_GRANT_STAGED_STRATEGY.md"
remove_if_exists "INFLUENCER_MARKETING_PLAN.md"
remove_if_exists "TON_GRANT_EXECUTIVE_SUMMARY.md"

# Remove project documentation archives
echo -e "${BLUE}Removing documentation archives...${NC}"
remove_if_exists "_archive-docs/"

# Remove temporary implementation files
echo -e "${BLUE}Removing temporary Droid-created files...${NC}"
remove_if_exists "CREATE_REPOSITORIES.md"
remove_if_exists "ЗАПУСК_ПРЯМО_СЕЙЧАС.md"
remove_if_exists "БЫСТРАЯ_РАЗВЕРТКА.md"

# Remove all *.md files except important ones (keeping README.md)
echo -e "${BLUE}Cleaning root markdown files...${NC}"
find . -maxdepth 1 -name "*.md" -not -name "README.md" -not -path "./docs/*" -not -path "./src/*" -not -path "./contracts/*" | head -20 | while read file; do
    if [ -f "$file" ]; then
        log_info "Removing: $file"
        rm -f "$file"
    fi
done

# Remove log files and temporary files
echo -e "${BLUE}Cleaning up logs and temp files...${NC}"
find . -name "*.log" -type f -delete 2>/dev/null || true
find . -name "*.backup" -type f -delete 2>/dev/null || true
find . -name "*generated*" -type f -delete 2>/dev/null || true
find . -name "*temp*" -type f -delete 2>/dev/null || true
find . -name "temp*" -type d -delete 2>/dev/null || true

# Remove some generated JSON files
echo -e "${BLUE}Cleaning generated files...${NC}"
find . -name "output.txt" -type f -delete 2>/dev/null || true
find . -name "index-codebase.json" -type f -delete 2>/dev/null || true

# Remove Node modules from contracts (if exists)
if [ -d "contracts/node_modules" ]; then
    log_info "Removing contracts node_modules..."
    rm -rf contracts/node_modules
fi

# Remove build artifacts
if [ -d ".next" ]; then
    log_info "Removing .next build artifacts..."
    rm -rf .next
fi

if [ -d "coverage" ]; then
    log_info "Removing coverage reports..."
    rm -rf coverage
fi

echo -e "${GREEN}🧹 Cleanup completed!${NC}"
echo
echo -e "${GREEN}📁 Project structure after cleanup:${NC}"
echo

# Check what important files are kept
echo -e "${BLUE}✅ Kept important files:${NC}"
check_important "package.json" "Package dependencies"
check_important "README.md" "Main README"
check_important "vercel.json" "Vercel configuration"
check_important "tsconfig.json" "TypeScript configuration"
check_important "next.config.ts" "Next.js configuration"

# Show current directory structure (nice and clean)
if command -v tree &> /dev/null; then
    echo -e "${BLUE}📊 Current project structure:${NC}"
    echo
    # Show clean structure excluding common unwanted dirs
    tree -I 'node_modules|.next|coverage|*.log|*.backup|*generated|*_archive*|sales-packet|grants|telegram-partnership|_archive-docs|contracts/node_modules' -L 3 --dirsfirst
else
    echo -e "${BLUE}📊 Directory structure (basic):${NC}"
    ls -la
fi

echo
echo -e "${GREEN}🚀 Project is now cleaned and focused on code!${NC}"
echo -e "${GREEN}📈 Ready for development and deployment${NC}"
echo -e "${YELLOW}💡 Note: Run 'docs/API_DOCUMENTATION.md' for API reference${NC}"
echo -e "${YELLOW}💡 Note: Check 'docs/ARCHITECTURE.md' for technical overview${NC}"
echo

# Verify cleanup results
echo -e "${BLUE}🔍 Verifying cleanup...${NC}"

# Count remaining files
MD_FILES=$(find . -name "*.md" | wc -l)
JS_FILES=$(find src -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | wc -l)
PACKAGE_EXISTS=[ -f "package.json" ] && echo "✅ package.json" || echo "❌ package.json missing"

echo -e "${BLUE}📊 Cleanup statistics:${NC}"
echo "📄 Markdown files remaining: $MD_FILES"
echo "📝 Source files src/: $JS_FILES"
echo "📦 Package.json: $PACKAGE_EXISTS"

if [ $MD_FILES -lt 20 ]; then
    echo -e "${GREEN}✅ Successfully cleaned documentation!${NC}"
else
    echo -e "${YELLOW}⚠️ Still have $MD_FILES markdown files - check if any are important${NC}"
fi

echo
echo -e "${GREEN}🎉 NORMAL DANCE project cleanup completed successfully!${NC}"
