#!/usr/bin/env bash
# Memindai satu folder lokal dan keluar dengan kode non-nol jika ada temuan keyakinan tinggi.
# Pemakaian: ./bin/scan-local.sh <path> [--json]
set -euo pipefail

TARGET="${1:-.}"
shift || true

if [ ! -d "$TARGET" ]; then
  echo "Error: folder '$TARGET' tidak ditemukan." >&2
  exit 2
fi

node dist/cli.js scan-local "$TARGET" "$@"
