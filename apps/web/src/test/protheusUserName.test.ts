import { describe, expect, it } from "vitest";
import { looksLikeEmail, normalizeProtheusLoginUserName } from "@gestao-compra/shared";

describe("looksLikeEmail", () => {
  it("detects Protheus email logins", () => {
    expect(looksLikeEmail("daniel.silveira@sementesoilema.com.br")).toBe(true);
    expect(looksLikeEmail("  user@empresa.com  ")).toBe(true);
  });

  it("accepts Protheus usernames", () => {
    expect(looksLikeEmail("daniel.silveira")).toBe(false);
    expect(looksLikeEmail("admin")).toBe(false);
    expect(looksLikeEmail("  daniel.silveira  ")).toBe(false);
  });
});

describe("normalizeProtheusLoginUserName", () => {
  it("trims surrounding whitespace", () => {
    expect(normalizeProtheusLoginUserName("  daniel.silveira  ")).toBe("daniel.silveira");
  });
});
