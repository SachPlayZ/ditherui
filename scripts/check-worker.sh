#!/usr/bin/env bash
# Builds the site for Cloudflare Workers, checks the Worker fits the free plan, and smoke-tests pages
# in the real Workers runtime (wrangler dev), where Next's dev server can hide failures.
set -euo pipefail

ROOT=$(cd "$(dirname "$0")/.." && pwd)
PORT=${PORT:-8788}
LIMIT_KIB=3072 # Workers free plan: 3 MiB gzipped
OUT=$(mktemp -d)
LOG="$OUT/wrangler.log"
trap 'kill "${DEV:-}" 2>/dev/null || true; rm -rf "$OUT"' EXIT
export WRANGLER_SEND_METRICS=false

cd "$ROOT"
pnpm exec opennextjs-cloudflare build

size=$(pnpm exec wrangler deploy --dry-run --outdir "$OUT/dist" | sed -n 's/.*gzip: \([0-9.]*\) KiB.*/\1/p')
echo "Worker: ${size} KiB gzip (limit ${LIMIT_KIB} KiB)"
awk -v s="$size" -v l="$LIMIT_KIB" 'BEGIN { exit !(s != "" && s < l) }' || { echo "Worker too large or size unknown"; exit 1; }

pnpm exec wrangler dev --port "$PORT" >"$LOG" 2>&1 &
DEV=$!
for _ in $(seq 1 60); do curl -s -o /dev/null "localhost:$PORT" && break; sleep 2; done

paths=(/ /docs /llms.txt /og/docs/image.png)
for item in $(node -e 'import("./registry/meta/index.ts").then(m => console.log(m.components.map(c => c.name).join(" ")))'); do
  paths+=("/docs/components/$item" "/r/$item.json")
done

failed=0
for p in "${paths[@]}"; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "localhost:$PORT$p")
  echo "$code $p"
  [ "$code" = 200 ] || failed=1
done
if [ "$failed" = 1 ]; then cat "$LOG"; exit 1; fi
