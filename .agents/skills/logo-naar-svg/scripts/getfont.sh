#!/usr/bin/env bash
# Download a Google Font (OFL) into a folder:  getfont.sh <dir> <family-folder> <file> [<file>...]
#   getfont.sh work/fonts cormorantgaramond "CormorantGaramond[wght].ttf" OFL.txt
# Family folders and file names: https://github.com/google/fonts/tree/main/ofl
set -e
dir="$1"; fam="$2"; shift 2; mkdir -p "$dir"
for f in "$@"; do
  enc=$(python3 -c "import sys,urllib.parse; print(urllib.parse.quote(sys.argv[1]))" "$f")
  curl -sfL -o "$dir/$f" "https://raw.githubusercontent.com/google/fonts/main/ofl/$fam/$enc" && echo "ok $dir/$f" || echo "FAILED $fam/$f"
done
