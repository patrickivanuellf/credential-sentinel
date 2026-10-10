# Arsitektur credential-sentinel

```
            scan-local <path>          scan-github --owner <nama>
                   │                              │
                   ▼                              ▼
             scanner.ts                      github.ts
      (susuri folder, baca file)     (Octokit: list repo → git tree → blob)
                   │                              │
                   └──────────────┬───────────────┘
                                  ▼
                          scanText() per file
                    (patterns.ts: regex per jenis kredensial)
                                  │
                                  ▼
                         redact() tiap temuan
                   (nilai asli tidak pernah disimpan utuh)
                                  │
                                  ▼
                        report.ts (human / JSON)
                                  │
                                  ▼
                             cli.ts (exit code)
```

## Keputusan desain

- **Redaction di titik paling awal mungkin** (langsung setelah match ditemukan di `scanner.ts`)
  supaya nilai kredensial asli tidak pernah mengalir ke lapisan laporan atau log.
- **Pola regex + entropi**, bukan model ML, supaya mudah diaudit: setiap temuan bisa dijelaskan
  pola mana yang cocok.
- **`scan-github` butuh token eksplisit dan `--owner` eksplisit** — tidak ada mode "pindai semua
  GitHub", untuk mencegah penyalahgunaan terhadap akun yang tidak diberi izin.
- **Exit code non-zero untuk temuan tinggi** supaya langsung bisa dipakai sebagai gate di CI/CD
  (lihat job `self-scan` di `.github/workflows/ci.yml`, yang memindai repo ini sendiri).

## Menangani kredensial yang sudah bocor (di luar tool ini)

1. **Rotasi/cabut kredensial itu lebih dulu** (anggap sudah bocor, meski repo lalu di-private-kan).
2. Bersihkan riwayat Git dengan `git filter-repo` atau BFG Repo-Cleaner — menghapus commit biasa
   tidak menghapusnya dari riwayat.
3. Aktifkan GitHub secret scanning / push protection untuk mencegah kejadian berulang.
