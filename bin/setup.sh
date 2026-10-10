#!/usr/bin/env bash
# Setup proyek: install dependensi dan build sekali supaya CLI siap dipakai.
set -euo pipefail

echo "==> Installing dependencies..."
npm install

echo "==> Building TypeScript..."
npm run build

echo "==> Selesai. Jalankan: npm run dev -- scan-local ."
