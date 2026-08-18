import type { RoutinePermissionId } from "@gestao-compra/shared";

export interface PermissionModuleGroup {
  id: string;
  title: string;
  permissions: RoutinePermissionId[];
}

export const permissionModuleGroups: PermissionModuleGroup[] = [
  {
    id: "compras",
    title: "Compras",
    permissions: ["aprovacoes", "solicitacoes-compra", "notas-debito-credito"],
  },
  {
    id: "administracao",
    title: "Administração",
    permissions: ["gestao-permissoes"],
  },
];

export const permissionModuleGroupIds = permissionModuleGroups.map((group) => group.id);
