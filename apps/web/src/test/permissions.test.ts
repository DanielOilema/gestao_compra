import { describe, expect, it } from "vitest";
import { buildUserMenu, hasRoutineAccess } from "@/lib/buildUserMenu";
import { appModuleGroups } from "@/config/navigation";

const enabledRoutineCount = appModuleGroups.reduce(
  (acc, group) => acc + group.routines.filter((routine) => routine.enabled).length,
  0,
);

describe("buildUserMenu", () => {
  it("shows all enabled menu routines for admin", () => {
    const menu = buildUserMenu(appModuleGroups, [], true);
    const routineCount = menu.reduce((acc, group) => acc + group.routines.length, 0);
    expect(routineCount).toBe(enabledRoutineCount);
  });

  it("shows only granted routines for regular user", () => {
    const menu = buildUserMenu(appModuleGroups, ["solicitacoes-compra"], false);
    const paths = menu.flatMap((group) => group.routines.map((routine) => routine.path));
    expect(paths).toEqual(["/solicitacoes-compra"]);
  });

  it("shows the kanban when the acompanhamento permission is granted", () => {
    const menu = buildUserMenu(appModuleGroups, ["acompanhamento-solicitacoes"], false);
    const paths = menu.flatMap((group) => group.routines.map((routine) => routine.path));
    expect(paths).toEqual(["/acompanhamento-solicitacoes"]);
  });

  it("hides disabled routines even for admin", () => {
    const menu = buildUserMenu(appModuleGroups, [], true);
    const ids = menu.flatMap((group) => group.routines.map((routine) => routine.id));
    const disabledIds = appModuleGroups
      .flatMap((group) => group.routines)
      .filter((routine) => !routine.enabled)
      .map((routine) => routine.id);

    for (const id of disabledIds) {
      expect(ids).not.toContain(id);
    }
  });
});

describe("hasRoutineAccess", () => {
  it("grants admin access to admin-only routines", () => {
    expect(
      hasRoutineAccess("gestao-permissoes", [], true, true),
    ).toBe(true);
  });

  it("denies non-admin access to admin-only routines", () => {
    expect(
      hasRoutineAccess("gestao-permissoes", ["gestao-permissoes"], false, true),
    ).toBe(false);
  });

  it("grants access when any listed report permission is present", () => {
    expect(
      hasRoutineAccess("relatorios-compras", ["relatorios-pedidos"], false, false, [
        "relatorios-compras",
        "relatorios-pedidos",
        "relatorios-passagens",
      ]),
    ).toBe(true);
  });
});
