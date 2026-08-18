import React, { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { Skeleton } from "@gestao-compra/ui";
import AppLayout from "@/components/layout/AppLayout";
import PageHeader from "@/components/layout/PageHeader";
import ImportUsersButton from "@/components/permissoes/ImportUsersButton";
import UserPermissionsEditView from "@/components/permissoes/edicao/UserPermissionsEditView";
import { filterUsersBySearch } from "@/components/permissoes/listagem/filterUsersBySearch";
import UserPermissionsSearchBar from "@/components/permissoes/listagem/UserPermissionsSearchBar";
import UserPermissionsTable from "@/components/permissoes/listagem/UserPermissionsTable";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissionsList, useSavePermissions } from "@/hooks/usePermissions";
import type { RoutinePermissionId } from "@gestao-compra/shared";
import { toast } from "sonner";

type PermissoesView = "list" | "edit";

const PermissoesPage: React.FC = () => {
  const { hasPermission } = useAuth();
  const { data: users = [], isLoading, error } = usePermissionsList();
  const savePermissions = useSavePermissions();

  const [view, setView] = useState<PermissoesView>("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [draftPermissions, setDraftPermissions] = useState<RoutinePermissionId[]>([]);

  const filteredUsers = useMemo(
    () => filterUsersBySearch(users, searchQuery),
    [users, searchQuery],
  );

  const editingUser = useMemo(
    () => users.find((user) => user.id === editingUserId) ?? null,
    [users, editingUserId],
  );

  useEffect(() => {
    if (editingUser) {
      setDraftPermissions(editingUser.permissions);
    } else {
      setDraftPermissions([]);
    }
  }, [editingUser]);

  useEffect(() => {
    if (view === "edit" && editingUserId && !editingUser && !isLoading) {
      setView("list");
      setEditingUserId(null);
    }
  }, [view, editingUserId, editingUser, isLoading]);

  if (!hasPermission("gestao-permissoes")) {
    return <Navigate to="/home" replace />;
  }

  const handleOpenEdit = (userId: string) => {
    setEditingUserId(userId);
    setView("edit");
  };

  const handleBackToList = () => {
    setView("list");
    setEditingUserId(null);
    setDraftPermissions([]);
  };

  const handleToggle = (routineId: RoutinePermissionId, granted: boolean) => {
    setDraftPermissions((current) => {
      if (granted) {
        return current.includes(routineId) ? current : [...current, routineId];
      }
      return current.filter((id) => id !== routineId);
    });
  };

  const handleSave = async () => {
    if (!editingUser) return;

    try {
      await savePermissions.mutateAsync({
        targetUserId: editingUser.id,
        permissions: draftPermissions,
      });
      toast.success("Permissões salvas com sucesso.");
      handleBackToList();
    } catch (saveError) {
      toast.error(
        saveError instanceof Error ? saveError.message : "Falha ao salvar permissões",
      );
    }
  };

  return (
    <AppLayout>
      {view === "list" ? (
        <>
          <PageHeader
            title="Gestão de Permissões"
            description="Importe usuários do Protheus e gerencie o acesso às rotinas do sistema."
            actions={<ImportUsersButton />}
          />

          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full max-w-md" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : error ? (
            <p className="text-sm text-destructive">
              {error instanceof Error ? error.message : "Falha ao carregar usuários."}
            </p>
          ) : (
            <div className="space-y-6">
              <UserPermissionsSearchBar value={searchQuery} onChange={setSearchQuery} />
              <UserPermissionsTable users={filteredUsers} onEdit={handleOpenEdit} />
            </div>
          )}
        </>
      ) : editingUser ? (
        <UserPermissionsEditView
          user={editingUser}
          permissions={draftPermissions}
          disabled={editingUser.isAdmin}
          isSaving={savePermissions.isPending}
          onToggle={handleToggle}
          onSave={handleSave}
          onBack={handleBackToList}
        />
      ) : (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full max-w-md" />
          <Skeleton className="h-64 w-full" />
        </div>
      )}
    </AppLayout>
  );
};

export default PermissoesPage;
