import { describe, expect, it } from "vitest";
import { scanText } from "../src/scanner.js";

describe("scanText", () => {
  it("mendeteksi AWS Access Key ID", () => {
    const content = `const key = "AKIAABCDEFGHIJKLMNOP";`;
    const findings = scanText(content, "config.js");
    expect(findings.some((f) => f.patternId === "AWS-ACCESS-KEY")).toBe(true);
  });

  it("mendeteksi GitHub token", () => {
    const content = `GITHUB_TOKEN=ghp_${"a".repeat(36)}`;
    const findings = scanText(content, ".env");
    expect(findings.some((f) => f.patternId === "GITHUB-TOKEN")).toBe(true);
  });

  it("mendeteksi private key PEM", () => {
    const content = "-----BEGIN RSA PRIVATE KEY-----\nMIIBOgIBAAJBAK...\n-----END RSA PRIVATE KEY-----";
    const findings = scanText(content, "id_rsa");
    expect(findings.some((f) => f.patternId === "PRIVATE-KEY-BLOCK")).toBe(true);
  });

  it("mendeteksi connection string database", () => {
    const content = "DATABASE_URL=postgres://user:supersecret@db.example.com:5432/app";
    const findings = scanText(content, ".env");
    expect(findings.some((f) => f.patternId === "DB-CONN-STRING")).toBe(true);
  });

  it("tidak melaporkan apa pun pada teks biasa", () => {
    const content = "Ini hanya catatan rapat biasa, tidak ada rahasia di sini.";
    const findings = scanText(content, "notes.md");
    expect(findings).toHaveLength(0);
  });

  it("menyertakan nomor baris yang benar", () => {
    const content = `baris 1\nbaris 2\nconst t = "ghp_${"b".repeat(36)}";`;
    const findings = scanText(content, "a.ts");
    expect(findings[0]?.line).toBe(3);
  });

  it("menyamarkan nilai pada hasil (tidak menampilkan token penuh)", () => {
    const token = "ghp_" + "c".repeat(36);
    const content = `const t = "${token}";`;
    const findings = scanText(content, "a.ts");
    expect(findings[0]?.redacted).not.toBe(token);
    expect(findings[0]?.redacted).toContain("****");
  });
});
