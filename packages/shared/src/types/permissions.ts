export const ROUTINE_PERMISSION_IDS = [
  'aprovacoes',
  'solicitacoes-compra',
  'notas-debito-credito',
  'transportadoras',
  'relatorios-financeiro',
  'relatorios-compras',
  'relatorios-pedidos',
  'relatorios-passagens',
  'gestao-permissoes',
] as const;

export type RoutinePermissionId = (typeof ROUTINE_PERMISSION_IDS)[number];

export interface ProtheusUserRecord {
  id: string;
  displayName: string;
  userName: string;
}

export interface AppUser {
  id: string;
  userName: string;
  displayName: string;
  isAdmin: boolean;
  permissions: RoutinePermissionId[];
}

export interface UserPermissionsResponse {
  id: string;
  userName: string;
  displayName: string;
  isAdmin: boolean;
  permissions: RoutinePermissionId[];
}

export interface ImportUsersResult {
  imported: number;
  skipped: number;
  total: number;
}

export const ROUTINE_LABELS: Record<RoutinePermissionId, string> = {
  aprovacoes: 'Aprovação de Compra',
  'solicitacoes-compra': 'Solicitação de Compra',
  'notas-debito-credito': 'Nota de Débito/Crédito',
  transportadoras: 'Transportadoras',
  'relatorios-financeiro': 'Relatórios do Financeiro',
  'relatorios-compras': 'Solicitações de Compras',
  'relatorios-pedidos': 'Pedidos de Compras',
  'relatorios-passagens': 'Passagens e Hospedagens',
  'gestao-permissoes': 'Administrador',
};

/** Permissões exibidas e editáveis na tela de gestão de permissões */
export const ASSIGNABLE_PERMISSION_IDS: RoutinePermissionId[] = [
  'aprovacoes',
  'solicitacoes-compra',
  'notas-debito-credito',
  'transportadoras',
  'relatorios-financeiro',
  'relatorios-compras',
  'relatorios-pedidos',
  'relatorios-passagens',
  'gestao-permissoes',
];

export const DEFAULT_ADMIN_USER_ID = '000000-admin';
