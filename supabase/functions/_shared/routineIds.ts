export const ROUTINE_IDS = [
  'aprovacoes',
  'solicitacoes-compra',
  'notas-debito-credito',
  'gestao-permissoes',
] as const;

export type RoutineId = (typeof ROUTINE_IDS)[number];

export const DEFAULT_ADMIN_USER_ID = '000000-admin';

export function getAdminUserId(): string {
  return Deno.env.get('ADMIN_USER_ID')?.trim() || DEFAULT_ADMIN_USER_ID;
}

export function getAdminUserNames(): string[] {
  const configured = Deno.env.get('ADMIN_USER_NAMES')?.trim();
  const defaults = ['admin', getAdminUserId()];
  if (!configured) return defaults;

  return [
    ...new Set([
      ...defaults,
      ...configured.split(',').map((name) => name.trim()).filter(Boolean),
    ]),
  ];
}

export function isAdminUserName(userName: string): boolean {
  const normalized = userName.trim().toLowerCase();
  return getAdminUserNames().some((name) => name.toLowerCase() === normalized);
}
