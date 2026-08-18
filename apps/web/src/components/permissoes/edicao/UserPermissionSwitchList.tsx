import React from "react";
import { Label, Switch } from "@gestao-compra/ui";
import type { RoutinePermissionId } from "@gestao-compra/shared";
import { ASSIGNABLE_PERMISSION_IDS, ROUTINE_LABELS } from "@gestao-compra/shared";

interface UserPermissionSwitchListProps {
  permissions: RoutinePermissionId[];
  disabled?: boolean;
  onToggle: (routineId: RoutinePermissionId, granted: boolean) => void;
}

const UserPermissionSwitchList: React.FC<UserPermissionSwitchListProps> = ({
  permissions,
  disabled = false,
  onToggle,
}) => {
  return (
    <div className="space-y-3">
      {ASSIGNABLE_PERMISSION_IDS.map((routineId) => {
        const granted = permissions.includes(routineId);

        return (
          <div
            key={routineId}
            className="flex items-center justify-between gap-4 rounded-md border border-border/60 px-3 py-2"
          >
            <Label htmlFor={`edit-perm-${routineId}`} className="cursor-pointer">
              {ROUTINE_LABELS[routineId]}
            </Label>
            <Switch
              id={`edit-perm-${routineId}`}
              checked={granted}
              disabled={disabled}
              onCheckedChange={(checked) => onToggle(routineId, checked)}
            />
          </div>
        );
      })}
    </div>
  );
};

export default UserPermissionSwitchList;
