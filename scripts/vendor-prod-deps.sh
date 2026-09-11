#!/usr/bin/env bash
# Rebuilds Backend/node_modules as a clean, production-only (--omit=dev)
# install and commits it to git.
#
# Why this exists: the production server (cPanel/LiteSpeed, memory-constrained)
# deploys via `git pull` only — it cannot run `npm install` or `npm run build`.
# So node_modules must be vendored (tracked in git) exactly like dist/ is.
#
# Run this locally whenever package.json/package-lock.json dependencies change,
# then commit and push the resulting node_modules/ changes along with dist/.
set -euo pipefail
cd "$(dirname "$0")/.."

if [ -d node_modules ]; then
  rm -rf node_modules.tmp-dev-backup
  mv node_modules node_modules.tmp-dev-backup
fi

npm install --omit=dev --no-audit --no-fund

echo ""
echo "node_modules rebuilt for production ($(du -sh node_modules | cut -f1))."
echo "Next steps:"
echo "  1. npm run build"
echo "  2. git add dist node_modules package.json package-lock.json"
echo "  3. git commit -m '...' && git push"
echo "  4. Restore your dev environment: rm -rf node_modules && mv node_modules.tmp-dev-backup node_modules"
echo "     (or just run 'npm install' again for a full dev install with devDependencies)"
