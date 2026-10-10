import type { Finding } from "./scanner.js";

export interface Summary {
  total: number;
  byConfidence: Record<"tinggi" | "sedang" | "rendah", number>;
  byPattern: Record<string, number>;
}

export function summarize(findings: Finding[]): Summary {
  const summary: Summary = {
    total: findings.length,
    byConfidence: { tinggi: 0, sedang: 0, rendah: 0 },
    byPattern: {},
  };
  for (const f of findings) {
    summary.byConfidence[f.confidence]++;
    summary.byPattern[f.label] = (summary.byPattern[f.label] ?? 0) + 1;
  }
  return summary;
}

export function toHumanReport(findings: Finding[]): string {
  if (findings.length === 0) {
    return "Tidak ditemukan pola kredensial pada jalur yang dipindai.";
  }
  const summary = summarize(findings);
  const lines: string[] = [];
  lines.push(
    `Ditemukan ${summary.total} indikasi kredensial ` +
      `(tinggi: ${summary.byConfidence.tinggi}, sedang: ${summary.byConfidence.sedang}, rendah: ${summary.byConfidence.rendah})`,
  );
  lines.push("");
  const sorted = [...findings].sort((a, b) => {
    const order = { tinggi: 0, sedang: 1, rendah: 2 };
    return order[a.confidence] - order[b.confidence];
  });
  for (const f of sorted) {
    lines.push(
      `  [${f.confidence.toUpperCase()}] ${f.label} — ${f.file}:${f.line} (${f.redacted})`,
    );
  }
  return lines.join("\n");
}

export function toJsonReport(findings: Finding[]): string {
  return JSON.stringify({ summary: summarize(findings), findings }, null, 2);
}
