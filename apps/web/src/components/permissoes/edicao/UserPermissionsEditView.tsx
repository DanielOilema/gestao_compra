import React from "react";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { Button } from "@gestao-compra/ui";
import type { AppUser, RoutinePermissionId } from "@gestao-compra/shared";
import UserPermissionGroupedSwitchList from "./UserPermissionGroupedSwitchList";

interface UserPermissionsEditViewProps {
  user: AppUser;
  permissions: RoutinePermissionId[];
  disabled?: boolean;
  isSaving?: boolean;
  onToggle: (routineId: RoutinePermissionId, granted: boolean) => void;
  onSave: () => void;
  onBack: () => void;
}

const UserPermissionsEditView: React.FC<UserPermissionsEditViewProps> = ({
  user,
  permissions,
  disabled = false,
  isSaving = false,
  onToggle,
  onSave,
  onBack,
}) => {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Button type="button" variant="ghost" size="sm" className="-ml-2 h-8 px-2" onClick={onBack}>
          <ArrowLeft className="mr-1 h-4 w-4" />
          Voltar
        </Button>

        <div className="space-y-1">
          <h2 className="text-xl font-bold text-foreground sm:text-2xl">
            Permissões de {user.displayName}
          </h2>
          <p className="text-sm text-muted-foreground">
            Usuário: {user.userName}
          </p>
        </div>
      </div>

      <div className="space-y-4 rounded-lg border border-border bg-card p-4">
        <h3 className="text-sm font-semibold text-foreground">Permissões de rotinas</h3>
        <UserPermissionGroupedSwitchList
          permissions={permissions}
          disabled={disabled}
          onToggle={onToggle}
        />
      </div>

      {disabled && (
        <p className="text-sm text-muted-foreground">
          Usuários administradores do sistema possuem acesso total e não podem ter permissões alteradas.
        </p>
      )}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onBack} disabled={isSaving}>
          Voltar
        </Button>
        <Button type="button" onClick={onSave} disabled={disabled || isSaving}>
          {isSaving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Salvar alterações
        </Button>
      </div>
    </div>
  );
};

export default UserPermissionsEditView;
