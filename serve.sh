#!/usr/bin/env bash
set -e
cd "$(dirname "$0")/docs"

LAN_IP="$(hostname -I 2>/dev/null | awk '{print $1}')"
PORT=4000

if [ -n "$LAN_IP" ]; then
  echo "Local network: http://${LAN_IP}:${PORT}"
fi

bundle exec jekyll serve --livereload --host 0.0.0.0 --port "$PORT" "$@"
