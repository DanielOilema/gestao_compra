import { describe, expect, it } from "vitest";
import {
  hasNumericSequence,
  validateProtheusPassword,
} from "@gestao-compra/shared";

describe("hasNumericSequence", () => {
  it("detects ascending and descending digit runs", () => {
    expect(hasNumericSequence("Abc@123x")).toBe(true);
    expect(hasNumericSequence("Abc@987x")).toBe(true);
    expect(hasNumericSequence("Senha@135")).toBe(false);
    expect(hasNumericSequence("Senha@112")).toBe(false);
  });
});

describe("validateProtheusPassword", () => {
  it("accepts a valid Protheus password", () => {
    const result = validateProtheusPassword("Oilema@20");
    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("rejects passwords missing policy rules", () => {
    expect(validateProtheusPassword("short1!").ok).toBe(false);
    expect(validateProtheusPassword("semmaiuscula1!").ok).toBe(false);
    expect(validateProtheusPassword("SEMMINUSCULA1!").ok).toBe(false);
    expect(validateProtheusPassword("SemNumero!").ok).toBe(false);
    expect(validateProtheusPassword("SemEspecial1").ok).toBe(false);
    expect(validateProtheusPassword("ComSeq@123").ok).toBe(false);
  });

});
