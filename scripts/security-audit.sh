#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
REPORT_DIR="$ROOT_DIR/reports"
REPORT_FILE="$REPORT_DIR/security-audit.json"

mkdir -p "$REPORT_DIR"

command -v trufflehog >/dev/null 2>&1 || TRUFFLEHOG_FALLBACK=1
command -v git-secrets >/dev/null 2>&1 || GITSECRETS_FALLBACK=1
command -v snyk >/dev/null 2>&1 || SNYK_FALLBACK=1

tmpdir="$(mktemp -d)"
findings=0

echo "Running security audit..."

trufflehog_json="$tmpdir/trufflehog.json"
if [ -z "${TRUFFLEHOG_FALLBACK:-}" ]; then
  trufflehog filesystem --json "$ROOT_DIR" > "$trufflehog_json" || true
else
  echo '{"error":"trufflehog not installed"}' > "$trufflehog_json"
fi
if grep -q '"SourceMetadata"' "$trufflehog_json" 2>/dev/null; then findings=$((findings+1)); fi

gitsecrets_json="$tmpdir/gitsecrets.json"
if [ -z "${GITSECRETS_FALLBACK:-}" ]; then
  git secrets --register-aws --global >/dev/null 2>&1 || true
  git secrets --scan > "$tmpdir/gitsecrets.txt" || true
  if [ -s "$tmpdir/gitsecrets.txt" ]; then findings=$((findings+1)); fi
  jq -Rs '{raw: .}' "$tmpdir/gitsecrets.txt" > "$gitsecrets_json" 2>/dev/null || echo '{"raw":"see text file"}' > "$gitsecrets_json"
else
  echo '{"error":"git-secrets not installed"}' > "$gitsecrets_json"
fi

npmaudit_json="$tmpdir/npmaudit.json"
npm audit --json > "$npmaudit_json" || true
if jq -e '.metadata.vulnerabilities.total // 0 > 0' "$npmaudit_json" >/dev/null 2>&1; then findings=$((findings+1)); fi

snyk_json="$tmpdir/snyk.json"
if [ -z "${SNYK_FALLBACK:-}" ]; then
  snyk test --json > "$snyk_json" || true
  if [ -s "$snyk_json" ] && jq -e 'length > 0' "$snyk_json" >/dev/null 2>&1; then findings=$((findings+1)); fi
else
  echo '{"error":"snyk not installed"}' > "$snyk_json"
fi

jq -n \
  --arg timestamp "$(date -u +"%Y-%m-%dT%H:%M:%SZ")" \
  --slurpfile trufflehog "$trufflehog_json" \
  --slurpfile gitsecrets "$gitsecrets_json" \
  --slurpfile npmaudit "$npmaudit_json" \
  --slurpfile snyk "$snyk_json" \
  --argjson findings "$findings" \
  '{timestamp: $timestamp, findings: $findings, trufflehog: $trufflehog[0], gitsecrets: $gitsecrets[0], npmaudit: $npmaudit[0], snyk: $snyk[0]}' \
  > "$REPORT_FILE"

echo "Security audit report: $REPORT_FILE"
if [ "$findings" -gt 0 ]; then
  echo "Findings detected: $findings" >&2
  exit 1
fi

exit 0

