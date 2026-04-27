#!/usr/bin/env bash
# Local development only — serves the Jekyll site with dev overrides.
# For production builds, GitHub Pages uses _config.yml directly.
set -e
cd "$(dirname "$0")/docs"

export JEKYLL_ENV=development

LAN_IP="$(hostname -I 2>/dev/null | awk '{print $1}')"
PORT=4000

if [ -n "$LAN_IP" ]; then
  echo "Local network: http://${LAN_IP}:${PORT}"
fi

bundle exec jekyll serve --livereload --host 0.0.0.0 --port "$PORT" \
  --config _config.yml,_config.dev.yml "$@"
