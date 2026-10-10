/**
 * Menyamarkan kredensial supaya bisa ditampilkan di laporan/CLI tanpa membocorkan nilai asli.
 * Contoh: "AKIAABCDEFGH12345678" -> "AKIA****...5678"
 */
export function redact(value: string): string {
  if (value.length <= 8) return "*".repeat(value.length);
  const head = value.slice(0, 4);
  const tail = value.slice(-4);
  return `${head}****...${tail}`;
}
