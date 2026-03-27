#!/usr/bin/env bash
set -euo pipefail

if [[ ! -f firebase-applet-config.json ]]; then
  echo "Missing required Firebase config file: firebase-applet-config.json"
  exit 1
fi

echo "Running lint..."
npm run lint

echo "Running build..."
npm run build

echo "Preflight checks passed for frontend + Firebase deployment."
