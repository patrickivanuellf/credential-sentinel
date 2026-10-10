#!/usr/bin/env node
import { scanDirectory } from "./scanner.js";
import { scanGithubOwner } from "./github.js";
import { toHumanReport, toJsonReport } from "./report.js";

function printHelp(): void {
  console.log(`credential-sentinel — pemindai kredensial bocor

Pemakaian:
  sentinel scan-local <path> [--json]
      Memindai folder lokal (repo milik sendiri atau yang sudah di-clone).

  sentinel scan-github --owner <username> [--token <TOKEN>] [--json] [--include-private]
      Memindai repo publik milik satu akun/organisasi GitHub.
      Gunakan hanya untuk akun sendiri atau yang sudah memberi izin eksplisit.
      Token bisa diisi lewat --token atau env GITHUB_TOKEN.

Contoh:
  sentinel scan-local .
  sentinel scan-github --owner patrickivanuellf
`);
}

function getFlag(args: string[], name: string): string | undefined {
  const idx = args.indexOf(name);
  if (idx === -1) return undefined;
  return args[idx + 1];
}

async function main(): Promise<number> {
  const [, , cmd, ...args] = process.argv;
  const asJson = args.includes("--json");

  if (cmd === "scan-local") {
    const target = args.find((a) => !a.startsWith("--")) ?? ".";
    const findings = await scanDirectory(target);
    console.log(asJson ? toJsonReport(findings) : toHumanReport(findings));
    return findings.some((f) => f.confidence === "tinggi") ? 1 : 0;
  }

  if (cmd === "scan-github") {
    const owner = getFlag(args, "--owner");
    const token = getFlag(args, "--token") ?? process.env.GITHUB_TOKEN;
    const includePrivate = args.includes("--include-private");
    if (!owner) {
      console.error("Error: --owner wajib diisi (akun/organisasi yang ingin dipindai).");
      return 2;
    }
    if (!token) {
      console.error("Error: token GitHub wajib diisi lewat --token atau env GITHUB_TOKEN.");
      return 2;
    }
    const findings = await scanGithubOwner({ token, owner, includePrivate });
    console.log(asJson ? toJsonReport(findings) : toHumanReport(findings));
    return findings.some((f) => f.confidence === "tinggi") ? 1 : 0;
  }

  printHelp();
  return cmd ? 2 : 0;
}

main()
  .then((code) => process.exit(code))
  .catch((err) => {
    console.error("Terjadi error:", err instanceof Error ? err.message : err);
    process.exit(1);
  });
