#!/usr/bin/env bash
# Install what the logo-naar-svg scripts need. Safe to run more than once.
set -e
HERE="$(cd "$(dirname "$0")" && pwd)"
need=()
command -v potrace >/dev/null || need+=(potrace)
command -v inkscape >/dev/null || need+=(inkscape)
command -v xmllint >/dev/null || need+=(libxml2-utils)
if [ ${#need[@]} -gt 0 ]; then
  if command -v apt-get >/dev/null; then (sudo -n true 2>/dev/null && SUDO=sudo || SUDO=); $SUDO apt-get install -y -q "${need[@]}"
  elif command -v brew >/dev/null; then brew install potrace inkscape libxml2
  else echo "Install by hand: ${need[*]}"; exit 1; fi
fi
python3 -c "import numpy, scipy, PIL, fontTools" 2>/dev/null || python3 -m pip install -q numpy scipy pillow fonttools
python3 -c "from PIL import features; assert features.check('raqm')" 2>/dev/null || echo "note: Pillow without raqm; font fitting still works, OpenType features (ss01...) are ignored"
[ -d "$HERE/node_modules/paper-jsdom" ] || (cd "$HERE" && npm install -q --no-audit --no-fund)
echo "logo-naar-svg: ready"
