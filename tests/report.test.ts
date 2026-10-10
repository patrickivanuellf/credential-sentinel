import { describe, expect, it } from "vitest";
import { summarize, toHumanReport } from "../src/report.js";
import type { Finding } from "../src/scanner.js";

const sample: Finding[] = [
  { patternId: "AWS-ACCESS-KEY", label: "AWS Access Key ID", confidence: "tinggi", file: "a.ts", line: 1, redacted: "AKIA****...1234" },
  { patternId: "JWT", label: "JWT", confidence: "sedang", file: "b.ts", line: 2, redacted: "eyJh****...abcd" },
];

describe("summarize", () => {
  it("menghitung total dan breakdown confidence", () => {
    const s = summarize(sample);
    expect(s.total).toBe(2);
    expect(s.byConfidence.tinggi).toBe(1);
    expect(s.byConfidence.sedang).toBe(1);
  });
});

describe("toHumanReport", () => {
  it("melaporkan aman jika tidak ada temuan", () => {
    expect(toHumanReport([])).toMatch(/Tidak ditemukan/);
  });

  it("menampilkan jumlah temuan jika ada", () => {
    expect(toHumanReport(sample)).toMatch(/Ditemukan 2 indikasi/);
  });
});
