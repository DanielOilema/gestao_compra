import { CheckSquare, FileText, Receipt, type LucideIcon } from "lucide-react";

export interface AppRoutine {
  id: string;
  title: string;
  description: string;
  path: string;
  icon: LucideIcon;
  enabled: boolean;
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
      },
      {
        id: "solicitacoes-compra",
        title: "Solicitações de Compra",
        description: "Criar e acompanhar solicitações de compra",
        path: "/solicitacoes-compra",
        icon: FileText,
        enabled: true,
      },
      {
        id: "notas-debito-credito",
        title: "Notas de Débito e Crédito",
        description: "Gerenciar notas de débito e crédito vinculadas a pedidos ou faturas",
        path: "/notas-debito-credito",
        icon: Receipt,
        enabled: true,
      },
    ],
  },
];

export const appModules: AppRoutine[] = appModuleGroups.flatMap((group) => group.routines);
