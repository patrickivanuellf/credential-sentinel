/**
 * Pola deteksi kredensial yang umum bocor di repo publik.
 * Setiap pola: id, label, regex, tingkat keyakinan (confidence) dasar.
 */

export interface SecretPattern {
  id: string;
  label: string;
  regex: RegExp;
  confidence: "tinggi" | "sedang" | "rendah";
}

export const PATTERNS: SecretPattern[] = [
  {
    id: "AWS-ACCESS-KEY",
    label: "AWS Access Key ID",
    regex: /\bAKIA[0-9A-Z]{16}\b/g,
    confidence: "tinggi",
  },
  {
    id: "AWS-SECRET-KEY",
    label: "Kemungkinan AWS Secret Access Key",
    regex: /(?<=['"=:\s])[A-Za-z0-9/+]{40}(?=['"\s,]|$)/g,
    confidence: "rendah",
  },
  {
    id: "GITHUB-TOKEN",
    label: "GitHub Personal Access Token",
    regex: /\bgh[pousr]_[A-Za-z0-9]{36,255}\b/g,
    confidence: "tinggi",
  },
  {
    id: "GOOGLE-API-KEY",
    label: "Google API Key",
    regex: /\bAIza[0-9A-Za-z\-_]{35}\b/g,
    confidence: "tinggi",
  },
  {
    id: "SLACK-TOKEN",
    label: "Slack Token",
    regex: /\bxox[baprs]-[0-9A-Za-z-]{10,72}\b/g,
    confidence: "tinggi",
  },
  {
    id: "STRIPE-KEY",
    label: "Stripe API Key",
    regex: /\b(?:sk|pk|rk)_(?:live|test)_[0-9A-Za-z]{16,247}\b/g,
    confidence: "tinggi",
  },
  {
    id: "PRIVATE-KEY-BLOCK",
    label: "Blok private key (PEM)",
    regex: /-----BEGIN (?:RSA |EC |OPENSSH |DSA |)PRIVATE KEY-----/g,
    confidence: "tinggi",
  },
  {
    id: "JWT",
    label: "Kemungkinan JSON Web Token",
    regex: /\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g,
    confidence: "sedang",
  },
  {
    id: "DB-CONN-STRING",
    label: "Connection string database dengan kredensial",
    regex: /\b(?:postgres|postgresql|mysql|mongodb(?:\+srv)?):\/\/[^\s:]+:[^\s@]+@[^\s/]+/g,
    confidence: "tinggi",
  },
  {
    id: "GENERIC-ASSIGNMENT",
    label: "Kemungkinan secret dalam assignment (api_key/password/token = ...)",
    regex:
      /\b(api[_-]?key|secret|token|password|passwd)\s*[:=]\s*['"][A-Za-z0-9_\-/+=]{12,}['"]/gi,
    confidence: "rendah",
  },
];

/** Jalur/file yang dilewati karena bukan sumber relevan atau terlalu besar/biner. */
export const DEFAULT_IGNORE_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  "coverage",
  ".next",
  ".venv",
]);

export const DEFAULT_IGNORE_EXTENSIONS = new Set([
  ".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico", ".pdf",
  ".zip", ".tar", ".gz", ".lock", ".woff", ".woff2", ".ttf",
]);
