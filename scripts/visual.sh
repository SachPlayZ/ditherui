#!/usr/bin/env bash
# Runs Playwright in the official Linux image (amd64, like CI) so screenshots match baselines.
# Pass Playwright args through, e.g. `pnpm test:visual --update-snapshots`.
set -euo pipefail
VERSION=$(node -p "require('@playwright/test/package.json').version")
exec docker run --rm --platform linux/amd64 --ipc=host \
  -v "$PWD":/work -v ditherui-node-modules:/work/node_modules -v /work/.next -w /work -e CI=1 \
  "mcr.microsoft.com/playwright:v$VERSION-noble" \
  bash -c "corepack enable && pnpm install --frozen-lockfile && pnpm exec playwright test $*"
