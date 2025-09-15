#!/usr/bin/env bash
set -euo pipefail

TEMP_FILE=${TEMP_FILE:-/tmp/keys.json}
AUDIT_LOG=${AUDIT_LOG:-/tmp/key-audit.log}

log() { echo "[$(date -u +%FT%TZ)] $*" | tee -a "$AUDIT_LOG"; }

if [ -f "$TEMP_FILE" ]; then
  if command -v shred >/dev/null 2>&1; then
    shred -u -n 3 "$TEMP_FILE" || rm -f "$TEMP_FILE"
  else
    dd if=/dev/zero of="$TEMP_FILE" bs=1 count=$(stat -c%s "$TEMP_FILE" 2>/dev/null || wc -c < "$TEMP_FILE") conv=notrunc 2>/dev/null || true
    rm -f "$TEMP_FILE"
  fi
  log "key-drop: destroyed $TEMP_FILE"
else
  log "key-drop: no file to destroy ($TEMP_FILE)"
fi
exit 0

