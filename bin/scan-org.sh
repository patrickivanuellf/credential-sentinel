#!/usr/bin/env bash
# Memindai repo publik satu akun/organisasi GitHub.
# WAJIB: hanya untuk akun/organisasi sendiri atau yang sudah memberi izin eksplisit.
# Pemakaian: GITHUB_TOKEN=xxx ./bin/scan-org.sh <owner> [--json]
set -euo pipefail

OWNER="${1:-}"
shift || true

if [ -z "$OWNER" ]; then
  echo "Pemakaian: GITHUB_TOKEN=xxx ./bin/scan-org.sh <owner> [--json]" >&2
  exit 2
fi

if [ -z "${GITHUB_TOKEN:-}" ]; then
  echo "Error: set env GITHUB_TOKEN terlebih dahulu." >&2
  exit 2
fi

node dist/cli.js scan-github --owner "$OWNER" --token "$GITHUB_TOKEN" "$@"
