# credential-sentinel

Pemindai kredensial bocor (API key, token, private key, connection string) di repo lokal
atau di repo publik GitHub milik sendiri. Dibangun dengan **TypeScript** + skrip **bash**
untuk automasi scan.

![CI](https://github.com/patrickivanuellf/credential-sentinel/actions/workflows/ci.yml/badge.svg)

## Kenapa proyek ini?

Developer sering tidak sengaja mem-push API key, token, atau connection string database ke
repo publik. Sekali ter-push, kredensial itu tetap ada di riwayat Git meski commit-nya dihapus,
dan bisa ditemukan serta disalahgunakan orang lain dalam hitungan menit. `credential-sentinel`
membantu menemukan kredensial semacam itu **sebelum** disalahgunakan, lalu menampilkannya dengan
nilai yang sudah disamarkan (redacted) supaya aman dibagikan dalam laporan.

## Cara pakai

```bash
./bin/setup.sh                 # install dependensi + build

# Pindai folder lokal
./bin/scan-local.sh .
./bin/scan-local.sh . --json

# Pindai repo publik milik satu akun/organisasi GitHub
GITHUB_TOKEN=ghp_xxx ./bin/scan-org.sh namaakun
```

Atau langsung lewat Node:

```bash
node dist/cli.js scan-local ./path/ke/repo
node dist/cli.js scan-github --owner namaakun --token "$GITHUB_TOKEN"
```

Kode keluar: `0` = tidak ada temuan keyakinan tinggi, `1` = ada (berguna untuk CI).

### Contoh keluaran

```
Ditemukan 3 indikasi kredensial (tinggi: 3, sedang: 0, rendah: 0)

  [TINGGI] AWS Access Key ID — config.env:1 (AKIA****...MNOP)
  [TINGGI] GitHub Personal Access Token — config.env:2 (ghp_****...6789)
  [TINGGI] Connection string database dengan kredensial — config.env:3 (post****...5432)
```

## Cara kerja

1. **`patterns.ts`** — pola regex untuk jenis kredensial umum (AWS, GitHub, Google, Slack,
   Stripe, private key PEM, JWT, connection string, dan pola generik `key/token/password = ...`).
2. **`entropy.ts`** — util entropi Shannon untuk membedakan token acak dari teks biasa (dipakai
   di pola generik agar tidak terlalu banyak false positive).
3. **`scanner.ts`** — menyusuri folder lokal (melewati `node_modules`, `.git`, file biner, dll.)
   dan menjalankan semua pola pada tiap baris file teks.
4. **`github.ts`** — opsional, memindai repo GitHub lewat API resmi (`@octokit/rest`) dengan
   token yang diberikan pengguna.
5. **`redact.ts`** — nilai asli **tidak pernah** ditampilkan utuh; selalu disamarkan sebelum
   masuk ke laporan atau log.

## Batasan dan etika pemakaian

- **Hanya untuk repo milik sendiri atau yang sudah memberi izin eksplisit.** `scan-github`
  tidak dirancang dan tidak boleh dipakai untuk memindai akun/organisasi orang lain tanpa izin.
- Alat ini **tidak pernah** mengirim, menyimpan di luar mesin lokal, atau mempublikasikan
  kredensial yang ditemukan. Semua hasil disamarkan sebelum ditampilkan.
- Deteksi berbasis heuristik (regex + entropi), jadi mungkin ada **false positive/negative**.
  Selalu verifikasi manual sebelum merotasi atau melaporkan kredensial.
- Kalau menemukan kredensial asli milikmu, segera **rotasi/cabut** kredensial tersebut, baru
  bersihkan riwayat Git (`git filter-repo` atau BFG Repo-Cleaner) — menghapus commit saja tidak cukup.

## Pengembangan

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

## Roadmap

- [ ] Pembersih riwayat Git otomatis (wrapper untuk `git filter-repo`)
- [ ] Mode `--since` untuk memindai hanya commit baru di CI (pre-commit hook)
- [ ] Laporan agregat multi-repo dalam satu organisasi (statistik, bukan daftar kredensial mentah)
- [ ] Integrasi sebagai GitHub Action siap pakai

## Lisensi

MIT
