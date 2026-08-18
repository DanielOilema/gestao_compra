import { getSupabaseAdmin } from './supabaseAdmin.ts';
import { getAdminUserId, ROUTINE_IDS, type RoutineId, isAdminUserName } from './routineIds.ts';

export interface DbAppUser {
  id: string;
  user_name: string;
  display_name: string;
  is_admin: boolean;
}

export interface DbUserPermission {
  routine_id: string;
  granted: boolean;
}

export async function findUserByUserName(userName: string): Promise<DbAppUser | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('app_users')
    .select('id, user_name, display_name, is_admin')
    .ilike('user_name', userName.trim())
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

export async function findUserById(userId: string): Promise<DbAppUser | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('app_users')
    .select('id, user_name, display_name, is_admin')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

export async function getUserPermissions(userId: string): Promise<DbUserPermission[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('user_routine_permissions')
    .select('routine_id, granted')
    .eq('user_id', userId);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export function resolveGrantedPermissions(
  user: DbAppUser,
  rows: DbUserPermission[],
): RoutineId[] {
  if (user.is_admin || user.id === getAdminUserId()) {
    return [...ROUTINE_IDS];
  }

  return rows
    .filter((row) => row.granted)
    .map((row) => row.routine_id as RoutineId)
    .filter((id) => ROUTINE_IDS.includes(id));
}

export async function provisionUserIfMissing(
  userName: string,
  displayName?: string,
): Promise<DbAppUser> {
  const existing = await findUserByUserName(userName);
  if (existing) return existing;

  const supabase = getSupabaseAdmin();
  const adminId = getAdminUserId();
  const isAdmin = isAdminUserName(userName);

  const newUser: DbAppUser = {
    id: isAdmin ? adminId : `pending-${userName}`,
    user_name: userName,
    display_name: displayName?.trim() || userName,
    is_admin: isAdmin,
  };

  const { data, error } = await supabase
    .from('app_users')
    .insert(newUser)
    .select('id, user_name, display_name, is_admin')
    .single();

  if (error) {
    const retry = await findUserByUserName(userName);
    if (retry) return retry;
    throw new Error(error.message);
  }

  if (data.is_admin) {
    await ensureAdminPermissions(data.id);
  }

  return data;
}

export async function ensureAdminPermissions(userId: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const rows = ROUTINE_IDS.map((routineId) => ({
    user_id: userId,
    routine_id: routineId,
    granted: true,
  }));

  const { error } = await supabase
    .from('user_routine_permissions')
    .upsert(rows, { onConflict: 'user_id,routine_id' });

  if (error) throw new Error(error.message);

  await supabase
    .from('app_users')
    .update({ is_admin: true, updated_at: new Date().toISOString() })
    .eq('id', userId);
}

export async function canManagePermissions(user: DbAppUser): Promise<boolean> {
  if (user.is_admin || user.id === getAdminUserId()) {
    return true;
  }

  const rows = await getUserPermissions(user.id);
  return rows.some((row) => row.routine_id === 'gestao-permissoes' && row.granted);
}

export async function assertCanManagePermissions(userName: string): Promise<DbAppUser> {
  const user = await findUserByUserName(userName);
  if (!user) {
    throw new PermissionError('Acesso negado. Usuário não encontrado.');
  }

  if (!(await canManagePermissions(user))) {
    throw new PermissionError('Acesso negado. Você não possui permissão para gerenciar permissões.');
  }

  return user;
}

/** @deprecated Use assertCanManagePermissions */
export async function assertCallerIsAdmin(userName: string): Promise<DbAppUser> {
  return assertCanManagePermissions(userName);
}

export class PermissionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PermissionError';
  }
}
