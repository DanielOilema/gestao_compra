import React from "react";
import { Accordion } from "@gestao-compra/ui";
import type { RoutinePermissionId } from "@gestao-compra/shared";
import UserPermissionGroupPanel from "./UserPermissionGroupPanel";
import { permissionModuleGroupIds, permissionModuleGroups } from "./permissionModuleGroups";

interface UserPermissionGroupedSwitchListProps {
  permissions: RoutinePermissionId[];
  disabled?: boolean;
  onToggle: (routineId: RoutinePermissionId, granted: boolean) => void;
}

const UserPermissionGroupedSwitchList: React.FC<UserPermissionGroupedSwitchListProps> = ({
  permissions,
  disabled = false,
  onToggle,
}) => {
  return (
    <Accordion type="multiple" defaultValue={permissionModuleGroupIds} className="space-y-3">
      {permissionModuleGroups.map((group) => (
        <UserPermissionGroupPanel
          key={group.id}
          group={group}
          permissions={permissions}
          disabled={disabled}
          onToggle={onToggle}
        />
      ))}
    </Accordion>
  );
};

export default UserPermissionGroupedSwitchList;
