#!/usr/bin/env bash
# Installs every component by URL from a locally served registry into a fresh Next.js app, then builds it.
set -euo pipefail

ROOT=$(cd "$(dirname "$0")/.." && pwd)
PORT=${PORT:-4321}
WORK=$(mktemp -d)
SHADCN="$ROOT/node_modules/.bin/shadcn"
trap 'kill "${SERVER:-}" 2>/dev/null || true; rm -rf "$WORK"' EXIT

cd "$ROOT"
REGISTRY_URL="http://localhost:$PORT/r" node scripts/build-registry.ts "$WORK/registry.json"
"$SHADCN" build "$WORK/registry.json" -o "$WORK/public/r"

node -e '
  const [dir, port] = process.argv.slice(1);
  require("http").createServer((req, res) => {
    require("fs").readFile(require("path").join(dir, req.url), (err, body) => {
      res.writeHead(err ? 404 : 200, { "content-type": "application/json" });
      res.end(err ? "{}" : body);
    });
  }).listen(port);
' "$WORK/public" "$PORT" &
SERVER=$!

cd "$WORK"
pnpm dlx create-next-app@latest app --ts --tailwind --eslint --app --no-src-dir --import-alias "@/*" --use-pnpm --disable-git --yes
cd app
"$SHADCN" init --defaults --yes

ITEMS=$(node -p 'require(process.argv[1]).items.filter((i) => i.type === "registry:ui").map((i) => i.name).join(" ")' "$WORK/registry.json")
for item in $ITEMS; do "$SHADCN" add "http://localhost:$PORT/r/$item.json" --yes --overwrite; done

cat > app/page.tsx <<'EOF'
import { DitherField } from "@/components/ui/dither-field";

export default function Page() {
  return (
    <DitherField style={{ height: 320 }}>
      <h1>ditherui</h1>
    </DitherField>
  );
}
EOF

pnpm build

ENGINES=$(find . -name quantize.tsx -not -path "./node_modules/*" | wc -l | tr -d " ")
[ "$ENGINES" = 1 ] && [ -f lib/ditherui/quantize.tsx ] || { echo "engine installed $ENGINES times"; exit 1; }
echo "e2e install OK: $ITEMS"
