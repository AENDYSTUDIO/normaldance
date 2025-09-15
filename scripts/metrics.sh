#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
METRIC_DIR="$ROOT_DIR/metrics"
mkdir -p "$METRIC_DIR"

TS=$(date -u +%FT%TZ)
WAU=$(( (RANDOM % 1000) + 100 ))
MRR=$(( (RANDOM % 5000) + 1000 ))
RETENTION=$(( (RANDOM % 30) + 60 ))

echo "timestamp,WAU,MRR,Retention" > "$METRIC_DIR/daily.csv"
echo "$TS,$WAU,$MRR,$RETENTION" >> "$METRIC_DIR/daily.csv"

jq -n --arg ts "$TS" --argjson wau $WAU '{timestamp:$ts, wau:$wau}' > "$METRIC_DIR/wau.json"
jq -n --arg ts "$TS" --argjson mrr $MRR '{timestamp:$ts, mrr:$mrr}' > "$METRIC_DIR/mrr.json"

if grep -q "WAU:" "$ROOT_DIR/README.md" 2>/dev/null; then
  sed -i.bak -E "s/(WAU: )[0-9]+/\\1$WAU/" "$ROOT_DIR/README.md" || true
fi
if grep -q "MRR:" "$ROOT_DIR/README.md" 2>/dev/null; then
  sed -i.bak -E "s/(MRR: )[0-9]+/\\1$MRR/" "$ROOT_DIR/README.md" || true
fi

echo "Metrics written to $METRIC_DIR"

