import { describe, expect, it } from "vitest";
import { redact } from "../src/redact.js";

describe("redact", () => {
  it("menyamarkan bagian tengah string panjang", () => {
    expect(redact("AKIAABCDEFGHIJKLMNOP")).toBe("AKIA****...MNOP");
  });

  it("menyamarkan seluruhnya jika string pendek", () => {
    expect(redact("short")).toBe("*****");
  });

  it("tidak pernah mengembalikan nilai asli", () => {
    const secret = "ghp_abcdefghijklmnopqrstuvwxyz0123456789";
    expect(redact(secret)).not.toBe(secret);
  });
});
