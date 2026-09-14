import { describe, expect, it } from "vitest";
import { ROUTINE_LABELS } from "@gestao-compra/shared";
import { permissionModuleGroups } from "@/components/permissoes/edicao/permissionModuleGroups";

describe("gestão de permissões — grupo Relatórios", () => {
  it("exposes Relatórios with the purchase requests and purchase orders report permissions", () => {
    const relatorios = permissionModuleGroups.find((group) => group.id === "relatorios");

    expect(relatorios).toEqual({
      id: "relatorios",
      title: "Relatórios",
      permissions: ["relatorios-compras", "relatorios-pedidos", "relatorios-passagens"],
    });
    expect(ROUTINE_LABELS["relatorios-compras"]).toBe("Solicitações de Compras");
    expect(ROUTINE_LABELS["relatorios-pedidos"]).toBe("Pedidos de Compras");
    expect(ROUTINE_LABELS["relatorios-passagens"]).toBe("Passagens e Hospedagens");
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
