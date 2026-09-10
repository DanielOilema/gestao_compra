import { describe, expect, it } from "vitest";
import { buildBasicCredential } from "./protheusBasicAuth";
import { fromBase64 } from "./base64";

describe("buildBasicCredential", () => {
  it("codifica usuario:senha em base64", () => {
    expect(buildBasicCredential("admin", "123")).toBe(btoa("admin:123"));
  });

  it("remove espaços em volta do usuário mas preserva a senha", () => {
    expect(fromBase64(buildBasicCredential("  daniel.silveira  ", " segredo "))).toBe(
      "daniel.silveira: segredo ",
    );
  });

  it("codifica senha com acento em UTF-8", () => {
    const credential = buildBasicCredential("usuario", "não");
    expect(fromBase64(credential)).toBe("usuario:não");
  });

  it("preserva o separador quando a senha contém dois pontos", () => {
    const credential = buildBasicCredential("usuario", "a:b:c");
    const decoded = fromBase64(credential);
    expect(decoded.slice(0, decoded.indexOf(":"))).toBe("usuario");
    expect(decoded.slice(decoded.indexOf(":") + 1)).toBe("a:b:c");
  });
});
