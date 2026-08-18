import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AppUser, ImportUsersResult, RoutinePermissionId } from "@gestao-compra/shared";
import { useAuth } from "@/contexts/AuthContext";
import { useEnvironment } from "@/contexts/EnvironmentContext";
import { supabase } from "@/integrations/supabase/client";

interface InvokeResponse<T> {
  success?: boolean;
  error?: string;
  data?: T;
}

async function invokePermissionsFunction<T>(
  functionName: string,
  body: Record<string, unknown>,
  defaultError: string,
): Promise<T> {
  const { data, error } = await supabase.functions.invoke(functionName, { body });

  if (error) {
    throw new Error(error.message || defaultError);
  }

  const response = (data ?? null) as InvokeResponse<T> | null;
  if (!response?.success) {
    throw new Error(response?.error || defaultError);
  }

  return response.data as T;
}

export function usePermissionsList() {
  const { user, token, hasPermission } = useAuth();

  return useQuery({
    queryKey: ["permissoes", "listar"],
    enabled: hasPermission("gestao-permissoes") && !!token,
    queryFn: () =>
      invokePermissionsFunction<AppUser[]>(
        "permissoes-listar",
        { userName: user!.userName ?? user!.nome },
        "Falha ao listar usuários",
      ),
  });
}

export function useImportUsers() {
  const { user, token } = useAuth();
  const { ambiente } = useEnvironment();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      invokePermissionsFunction<ImportUsersResult>(
        "permissoes-importar",
        {
          userName: user!.userName ?? user!.nome,
          accessToken: token!,
          ambiente,
        },
        "Falha ao importar usuários",
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissoes", "listar"] });
    },
  });
}

export function useSavePermissions() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      targetUserId,
      permissions,
    }: {
      targetUserId: string;
      permissions: RoutinePermissionId[];
    }) =>
      invokePermissionsFunction<{ userId: string }>(
        "permissoes-salvar",
        {
          userName: user!.userName ?? user!.nome,
          targetUserId,
          permissions,
        },
        "Falha ao salvar permissões",
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissoes", "listar"] });
    },
  });
}
