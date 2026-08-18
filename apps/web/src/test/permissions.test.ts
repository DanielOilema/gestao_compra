import { describe, expect, it } from "vitest";
import { buildUserMenu, hasRoutineAccess } from "@/lib/buildUserMenu";
import { appModuleGroups } from "@/config/navigation";

describe("buildUserMenu", () => {
  it("shows all menu routines for admin", () => {
    const menu = buildUserMenu(appModuleGroups, [], true);
    const routineCount = menu.reduce((acc, group) => acc + group.routines.length, 0);
    expect(routineCount).toBe(3);
  });

  it("shows only granted routines for regular user", () => {
    const menu = buildUserMenu(appModuleGroups, ["solicitacoes-compra"], false);
    const paths = menu.flatMap((group) => group.routines.map((routine) => routine.path));
    expect(paths).toEqual(["/solicitacoes-compra"]);
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
});
