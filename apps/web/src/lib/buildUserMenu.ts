import type { RoutinePermissionId } from "@gestao-compra/shared";
import type { AppModuleGroup } from "@/config/navigation";

export function hasRoutineAccess(
  permissionKey: RoutinePermissionId,
  permissions: RoutinePermissionId[] | undefined,
  isAdmin: boolean | undefined,
  adminOnly?: boolean,
  anyOfPermissions?: readonly RoutinePermissionId[],
): boolean {
  if (adminOnly && !isAdmin) return false;
  if (isAdmin) return true;
  const keys = anyOfPermissions && anyOfPermissions.length > 0 ? anyOfPermissions : [permissionKey];
  return keys.some((key) => permissions?.includes(key) ?? false);
}

export function buildUserMenu(
  groups: AppModuleGroup[],
  permissions: RoutinePermissionId[] | undefined,
  isAdmin: boolean | undefined,
): AppModuleGroup[] {
  return groups
    .map((group) => ({
      ...group,
      routines: group.routines.filter(
        (routine) =>
          routine.enabled &&
          hasRoutineAccess(
            routine.permissionKey,
            permissions,
            isAdmin,
            routine.adminOnly,
            routine.anyOfPermissions,
          ),
      ),
    }))
    .filter((group) => group.routines.length > 0);
}
