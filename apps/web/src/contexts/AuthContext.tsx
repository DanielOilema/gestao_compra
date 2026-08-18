import React, { createContext, useContext, useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { User, type RoutinePermissionId, type UserPermissionsResponse } from '@gestao-compra/shared';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { registerSessionExpiredHandler } from '@/lib/sessionExpired';
import { readStoredProtheusAmbiente } from '@/lib/protheusAmbienteStorage';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  permissions: RoutinePermissionId[];
  hasPermission: (permission: RoutinePermissionId) => boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  expireSession: (message?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'oilema:auth:user';
const TOKEN_STORAGE_KEY = 'oilema:auth:token';
const LOGIN_AT_KEY = 'oilema:auth:loginAt';

async function fetchUserPermissions(
  userName: string,
): Promise<UserPermissionsResponse> {
  const { data, error } = await supabase.functions.invoke('permissoes-por-usuario', {
    body: { userName },
  });

  if (error) {
    const isUnreachable = error.message.includes('Failed to send a request to the Edge Function');
    const hint = isUnreachable
      ? ' Verifique se as Edge Functions de permissões estão implantadas (supabase functions deploy permissoes-por-usuario).'
      : '';
    throw new Error(`${error.message || 'Falha ao carregar permissões do usuário'}${hint}`);
  }

  if (!data?.success || !data?.data) {
    throw new Error(data?.error || 'Falha ao carregar permissões do usuário');
  }

  return data.data as UserPermissionsResponse;
}

function buildUserProfile(
  username: string,
  permissionsData: UserPermissionsResponse,
): User {
  return {
    id: permissionsData.id,
    protheusId: permissionsData.id,
    userName: permissionsData.userName || username,
    nome: permissionsData.displayName?.trim() || username,
    email: '',
    alcada: 0,
    filial: '',
    isAdmin: !!permissionsData.isAdmin,
    permissions: Array.isArray(permissionsData.permissions) ? permissionsData.permissions : [],
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      return stored ? (JSON.parse(stored) as User) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem(TOKEN_STORAGE_KEY);
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const permissionsRefreshedRef = useRef(false);

  const permissions = useMemo(
    () => user?.permissions ?? [],
    [user?.permissions],
  );

  const isAdmin = !!user?.isAdmin;

  const hasPermission = useCallback(
    (permission: RoutinePermissionId) => {
      if (isAdmin) return true;
      return permissions.includes(permission);
    },
    [isAdmin, permissions],
  );

  const login = useCallback(
    async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('protheus-login', {
          body: { username, password, ambiente: readStoredProtheusAmbiente() },
        });

        if (error) {
          const hint =
            error.message.includes('Failed to send a request to the Edge Function')
              ? ' Verifique se as Edge Functions estão em execução (supabase functions serve) ou implantadas no Supabase.'
              : '';
          return {
            success: false,
            error: `Não foi possível conectar ao Protheus: ${error.message}${hint}`,
          };
        }

        if (data?.success && data?.access_token) {
          const accessToken = data.access_token as string;

          let permissionsData: UserPermissionsResponse;
          try {
            permissionsData = await fetchUserPermissions(username);
          } catch (permError) {
            return {
              success: false,
              error:
                permError instanceof Error
                  ? permError.message
                  : 'Falha ao carregar permissões do usuário',
            };
          }

          const profile = buildUserProfile(username, permissionsData);

          permissionsRefreshedRef.current = true;
          setToken(accessToken);
          setUser(profile);
          try {
            localStorage.setItem(TOKEN_STORAGE_KEY, accessToken);
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
            localStorage.setItem(LOGIN_AT_KEY, String(Date.now()));
          } catch {
            // ignore storage failures
          }
          return { success: true };
        }

        return {
          success: false,
          error: data?.error || `Não foi possível realizar o login para o usuário ${username}`,
        };
      } catch {
        return {
          success: false,
          error: 'Não foi possível conectar ao Protheus. Verifique sua rede.',
        };
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    permissionsRefreshedRef.current = false;
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(LOGIN_AT_KEY);
    } catch {
      // ignore storage failures
    }
  }, []);

  const expireSession = useCallback(
    (message?: string) => {
      logout();
      toast.warning(message || "Sessão expirada. Faça login novamente.");
    },
    [logout],
  );

  useEffect(() => {
    registerSessionExpiredHandler(expireSession);
    return () => registerSessionExpiredHandler(null);
  }, [expireSession]);

  useEffect(() => {
    if (!token || !user?.userName || permissionsRefreshedRef.current) return;

    let cancelled = false;

    const refreshPermissions = async () => {
      try {
        const permissionsData = await fetchUserPermissions(user.userName!);
        if (cancelled) return;

        permissionsRefreshedRef.current = true;
        const refreshedProfile = buildUserProfile(user.userName!, permissionsData);
        setUser(refreshedProfile);
        try {
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(refreshedProfile));
        } catch {
          // ignore storage failures
        }
      } catch {
        permissionsRefreshedRef.current = true;
      }
    };

    if (!user.permissions) {
      void refreshPermissions();
    }

    return () => {
      cancelled = true;
    };
  }, [token, user?.userName, user?.permissions]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        isAdmin,
        permissions,
        hasPermission,
        login,
        logout,
        expireSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
