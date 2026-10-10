import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { DEFAULT_IGNORE_DIRS, DEFAULT_IGNORE_EXTENSIONS, PATTERNS } from "./patterns.js";
import { redact } from "./redact.js";

export interface Finding {
  patternId: string;
  label: string;
  confidence: "tinggi" | "sedang" | "rendah";
  file: string;
  line: number;
  redacted: string;
}

export interface ScanOptions {
  maxFileSizeBytes?: number;
  ignoreDirs?: Set<string>;
  ignoreExtensions?: Set<string>;
}

const DEFAULT_MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

async function* walk(
  dir: string,
  ignoreDirs: Set<string>,
): AsyncGenerator<string> {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (ignoreDirs.has(entry.name)) continue;
      yield* walk(path.join(dir, entry.name), ignoreDirs);
    } else if (entry.isFile()) {
      yield path.join(dir, entry.name);
    }
  }
}

export function scanText(content: string, filePath: string): Finding[] {
  const findings: Finding[] = [];
  const lines = content.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? "";
    for (const pattern of PATTERNS) {
      const matches = line.matchAll(pattern.regex);
      for (const match of matches) {
        const value = match[0];
        findings.push({
          patternId: pattern.id,
          label: pattern.label,
          confidence: pattern.confidence,
          file: filePath,
          line: i + 1,
          redacted: redact(value),
        });
      }
    }
  }
  return findings;
}

export async function scanDirectory(
  rootDir: string,
  options: ScanOptions = {},
): Promise<Finding[]> {
  const ignoreDirs = options.ignoreDirs ?? DEFAULT_IGNORE_DIRS;
  const ignoreExtensions = options.ignoreExtensions ?? DEFAULT_IGNORE_EXTENSIONS;
  const maxSize = options.maxFileSizeBytes ?? DEFAULT_MAX_FILE_SIZE;

  const findings: Finding[] = [];
  for await (const filePath of walk(rootDir, ignoreDirs)) {
    const ext = path.extname(filePath).toLowerCase();
    if (ignoreExtensions.has(ext)) continue;

    try {
      const stats = await stat(filePath);
      if (stats.size > maxSize) continue;
      const content = await readFile(filePath, "utf-8");
      findings.push(...scanText(content, path.relative(rootDir, filePath)));
    } catch {
      // File biner/tidak terbaca sebagai UTF-8: lewati.
      continue;
    }
  }
  return findings;
}
