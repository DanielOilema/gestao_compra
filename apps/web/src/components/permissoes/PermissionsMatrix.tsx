import React from "react";
import { Loader2, Save } from "lucide-react";
import { Button, Label, Switch } from "@gestao-compra/ui";
import type { RoutinePermissionId } from "@gestao-compra/shared";
import { ASSIGNABLE_PERMISSION_IDS, ROUTINE_LABELS } from "@gestao-compra/shared";

interface PermissionsMatrixProps {
  permissions: RoutinePermissionId[];
  disabled?: boolean;
  isSaving?: boolean;
  onToggle: (routineId: RoutinePermissionId, granted: boolean) => void;
  onSave: () => void;
}

const PermissionsMatrix: React.FC<PermissionsMatrixProps> = ({
  permissions,
  disabled = false,
  isSaving = false,
  onToggle,
  onSave,
}) => {
  return (
    <div className="space-y-4 rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-sm font-semibold text-foreground">Permissões de rotinas</h3>
        <Button onClick={onSave} disabled={disabled || isSaving} size="sm">
          {isSaving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Salvar alterações
        </Button>
      </div>

      <div className="space-y-3">
        {ASSIGNABLE_PERMISSION_IDS.map((routineId) => {
          const granted = permissions.includes(routineId);
          return (
            <div
              key={routineId}
              className="flex items-center justify-between gap-4 rounded-md border border-border/60 px-3 py-2"
            >
              <Label htmlFor={`perm-${routineId}`} className="cursor-pointer">
                {ROUTINE_LABELS[routineId]}
              </Label>
              <Switch
                id={`perm-${routineId}`}
                checked={granted}
                disabled={disabled}
                onCheckedChange={(checked) => onToggle(routineId, checked)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PermissionsMatrix;
