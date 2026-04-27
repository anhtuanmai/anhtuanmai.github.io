#!/usr/bin/env bash
# Local-only shortcut for `bundle exec rake serve`.
# Runs the Jekyll dev server from this developer machine; not for deployed envs.
# All real logic lives in docs/Rakefile.
set -e
cd "$(dirname "$0")/docs"
exec bundle exec rake serve "$@"
