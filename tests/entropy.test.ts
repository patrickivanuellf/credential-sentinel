import { describe, expect, it } from "vitest";
import { shannonEntropy, looksRandomHighEntropy } from "../src/entropy.js";

describe("shannonEntropy", () => {
  it("string kosong punya entropi 0", () => {
    expect(shannonEntropy("")).toBe(0);
  });

  it("string berulang punya entropi rendah", () => {
    expect(shannonEntropy("aaaaaaaaaa")).toBeLessThan(1);
  });

  it("string acak punya entropi lebih tinggi dari kata biasa", () => {
    const randomLike = "aZ9!kQ2$mP7#xR4@";
    const wordLike = "helloworldhelloworld";
    expect(shannonEntropy(randomLike)).toBeGreaterThan(shannonEntropy(wordLike));
  });
});

describe("looksRandomHighEntropy", () => {
  it("menolak string pendek walau acak", () => {
    expect(looksRandomHighEntropy("aZ9!kQ2$")).toBe(false);
  });

  it("menolak kalimat biasa berbahasa Indonesia yang panjang", () => {
    expect(
      looksRandomHighEntropy("ini hanya catatan rapat biasa tidak ada rahasia di sini"),
    ).toBe(false);
  });
});
