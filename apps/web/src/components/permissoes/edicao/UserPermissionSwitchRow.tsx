import React from "react";
import { Label, Switch } from "@gestao-compra/ui";
import type { RoutinePermissionId } from "@gestao-compra/shared";
import { ROUTINE_LABELS } from "@gestao-compra/shared";

interface UserPermissionSwitchRowProps {
  routineId: RoutinePermissionId;
  granted: boolean;
  disabled?: boolean;
  onToggle: (routineId: RoutinePermissionId, granted: boolean) => void;
}

const UserPermissionSwitchRow: React.FC<UserPermissionSwitchRowProps> = ({
  routineId,
  granted,
  disabled = false,
  onToggle,
}) => {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md border border-border/60 px-3 py-2">
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
};

export default UserPermissionSwitchRow;
