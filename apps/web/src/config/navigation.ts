import {
  CheckSquare,
  FileText,
  Landmark,
  Receipt,
  ShoppingCart,
  Truck,
  type LucideIcon,
} from "lucide-react";
import type { RoutinePermissionId } from "@gestao-compra/shared";

export interface AppRoutine {
  id: string;
  title: string;
  description: string;
  path: string;
  icon: LucideIcon;
  enabled: boolean;
  permissionKey: RoutinePermissionId;
  /**
   * Se informado, o menu aparece quando o usuário tem qualquer uma destas permissões.
   * Sem isso, vale apenas `permissionKey`.
   */
  anyOfPermissions?: RoutinePermissionId[];
  adminOnly?: boolean;
}

/** @deprecated Use AppRoutine */
export type AppModule = AppRoutine;

export interface AppModuleGroup {
  id: string;
  title: string;
  routines: AppRoutine[];
}

export const appModuleGroups: AppModuleGroup[] = [
  {
    id: "compras",
    title: "Compras",
    routines: [
      {
        id: "aprovacoes",
        title: "Aprovações",
        description: "Aprovar ou bloquear pedidos e solicitações de compra pendentes",
        path: "/aprovacoes",
        icon: CheckSquare,
        enabled: true,
        permissionKey: "aprovacoes",
      },
      {
        id: "solicitacoes-compra",
        title: "Solicitações de Compra",
        description: "Criar e acompanhar solicitações de compra",
        path: "/solicitacoes-compra",
        icon: FileText,
        enabled: true,
        permissionKey: "solicitacoes-compra",
      },
      {
        id: "notas-debito-credito",
        title: "Notas de Débito e Crédito",
        description: "Gerenciar notas de débito e crédito vinculadas a pedidos ou faturas",
        path: "/notas-debito-credito",
        icon: Receipt,
        enabled: true,
        permissionKey: "notas-debito-credito",
      },
    ],
  },
  {
    id: "logistica",
    title: "Logística",
    routines: [
      {
        id: "transportadoras",
        title: "Transportadoras",
        description: "Consultar e cadastrar transportadoras",
        path: "/transportadoras",
        icon: Truck,
        enabled: true,
        permissionKey: "transportadoras",
      },
    ],
  },
  {
    id: "relatorios",
    title: "Relatórios",
    routines: [
      {
        id: "relatorios-financeiro",
        title: "Relatórios do Financeiro",
        description: "Consultar indicadores e relatórios do módulo financeiro",
        path: "/relatorios/financeiro",
        icon: Landmark,
        // Habilitado quando o primeiro relatório do módulo entrar no catálogo.
        enabled: false,
        permissionKey: "relatorios-financeiro",
      },
      {
        id: "relatorios-compras",
        title: "Relatórios de Compras",
        description: "Consultar indicadores e relatórios do módulo de compras",
        path: "/relatorios/compras",
        icon: ShoppingCart,
        enabled: true,
        permissionKey: "relatorios-compras",
        anyOfPermissions: ["relatorios-compras", "relatorios-pedidos", "relatorios-passagens"],
      },
    ],
  },
];

export const appModules: AppRoutine[] = appModuleGroups.flatMap((group) => group.routines);

export const routinePermissionIds: RoutinePermissionId[] = appModules.map(
  (routine) => routine.permissionKey,
);
