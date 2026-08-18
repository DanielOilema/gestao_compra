import {
  findUserByUserName,
  getUserPermissions,
  resolveGrantedPermissions,
  PermissionError,
} from './permissionsDb.ts';
import type { RoutineId } from './routineIds.ts';

export interface PermissionCheckResult {
  allowed: boolean;
  userId?: string;
  isAdmin?: boolean;
}

export async function checkPermission(
  userName: string,
  routineId: RoutineId,
): Promise<PermissionCheckResult> {
  const user = await findUserByUserName(userName);
  if (!user) {
    return { allowed: false };
  }

  if (user.is_admin) {
    return { allowed: true, userId: user.id, isAdmin: true };
  }

  const rows = await getUserPermissions(user.id);
  const granted = resolveGrantedPermissions(user, rows);
  return {
    allowed: granted.includes(routineId),
    userId: user.id,
    isAdmin: false,
  };
}

export async function requirePermission(
  userName: string,
  routineId: RoutineId,
): Promise<void> {
  const result = await checkPermission(userName, routineId);
  if (!result.allowed) {
    throw new PermissionError('Acesso negado. Você não possui permissão para esta rotina.');
  }
}

export { PermissionError };
