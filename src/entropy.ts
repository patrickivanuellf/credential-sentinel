/** Hitung entropi Shannon per karakter sebuah string (bit/char). */
export function shannonEntropy(value: string): number {
  if (value.length === 0) return 0;
  const counts = new Map<string, number>();
  for (const ch of value) {
    counts.set(ch, (counts.get(ch) ?? 0) + 1);
  }
  let entropy = 0;
  for (const count of counts.values()) {
    const p = count / value.length;
    entropy -= p * Math.log2(p);
  }
  return entropy;
}

/**
 * Heuristik: token acak (API key/secret) biasanya punya entropi tinggi
 * dan panjang cukup, berbeda dari kata/kalimat biasa.
 */
export function looksRandomHighEntropy(token: string, minLength = 20, minEntropy = 3.5): boolean {
  return token.length >= minLength && shannonEntropy(token) >= minEntropy;
}
