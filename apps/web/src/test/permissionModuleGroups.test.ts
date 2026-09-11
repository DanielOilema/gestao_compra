import { describe, expect, it } from "vitest";
import { ROUTINE_LABELS } from "@gestao-compra/shared";
import { permissionModuleGroups } from "@/components/permissoes/edicao/permissionModuleGroups";

describe("gestão de permissões — grupo Relatórios", () => {
  it("exposes Relatórios with the purchase requests report permission", () => {
    const relatorios = permissionModuleGroups.find((group) => group.id === "relatorios");

    expect(relatorios).toEqual({
      id: "relatorios",
      title: "Relatórios",
      permissions: ["relatorios-compras"],
    });
    expect(ROUTINE_LABELS["relatorios-compras"]).toBe("Solicitações de Compras");
  });

  it("keeps Relatórios after Logística and before Administração", () => {
    expect(permissionModuleGroups.map((group) => group.id)).toEqual([
      "compras",
      "logistica",
      "relatorios",
      "administracao",
    ]);
  });
});
