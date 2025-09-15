#!/usr/bin/env bash
set -euo pipefail

TEMP_FILE=${TEMP_FILE:-/tmp/keys.json}
AUDIT_LOG=${AUDIT_LOG:-/tmp/key-audit.log}
TTL_MIN=${VAULT_JWT_TTL_MIN:-30}

log() { echo "[$(date -u +%FT%TZ)] $*" | tee -a "$AUDIT_LOG"; }

if [ -z "${VAULT_ADDR:-}" ]; then echo "VAULT_ADDR is required" >&2; exit 1; fi
if [ -z "${VAULT_PATH:-}" ]; then echo "VAULT_PATH is required" >&2; exit 1; fi

log "key-get start: addr=$VAULT_ADDR path=$VAULT_PATH ttl=${TTL_MIN}m"
mkdir -p "$(dirname "$TEMP_FILE")"

AUTH_HEADER=""
if [ -n "${VAULT_TOKEN:-}" ]; then
  AUTH_HEADER="X-Vault-Token: $VAULT_TOKEN"
else
  log "No VAULT_TOKEN provided; attempting unauthenticated read may fail"
fi

set +e
RESP=$(curl -sS -H "$AUTH_HEADER" "$VAULT_ADDR/v1/$VAULT_PATH")
RC=$?
set -e

if [ $RC -ne 0 ] || [ -z "$RESP" ]; then
  echo "{\"keys\":[],\"ttlMinutes\":$TTL_MIN,\"source\":\"placeholder\"}" > "$TEMP_FILE"
else
  echo "$RESP" | jq -e '.' >/dev/null 2>&1 || RESP="{\"raw\":$(jq -Rs . <<<"$RESP")}" 
  jq -n --argjson data "$RESP" --arg ttl "$TTL_MIN" '{keys: $data.data // $data, ttlMinutes: ($ttl|tonumber), source:"vault"}' > "$TEMP_FILE"
fi

chmod 600 "$TEMP_FILE"
log "key-get complete: file=$TEMP_FILE"
exit 0

