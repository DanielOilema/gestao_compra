import React, { createContext, useContext, useState, useCallback, useEffect, useMemo, useRef } from 'react';
import {
  User,
  normalizeProtheusAmbiente,
  looksLikeEmail,
  normalizeProtheusLoginUserName,
  PROTHEUS_EMAIL_LOGIN_BLOCKED_MESSAGE,
  type ProtheusAmbiente,
  type RoutinePermissionId,
  type UserPermissionsResponse,
} from '@gestao-compra/shared';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { registerSessionExpiredHandler } from '@/lib/sessionExpired';
import {
  readStoredProtheusAmbiente,
  writeStoredProtheusAmbiente,
} from '@/lib/protheusAmbienteStorage';
import { buildBasicCredential } from '@/lib/protheusBasicAuth';
import { clearSavedCredentials, readSavedCredentials } from '@/lib/savedCredentials';

interface AuthContextType {
  user: User | null;
  protheusAuth: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  permissions: RoutinePermissionId[];
  hasPermission: (permission: RoutinePermissionId) => boolean;
  login: (
    username: string,
    password: string,
    ambiente?: ProtheusAmbiente,
  ) => Promise<{ success: boolean; error?: string; passwordExpired?: boolean }>;
  changePassword: (
    username: string,
    oldPassword: string,
    newPassword: string,
    ambiente?: ProtheusAmbiente,
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  expireSession: (message?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'oilema:auth:user';
// Chaves legadas: mantidas apenas para limpar resíduo de versões anteriores.
const LEGACY_TOKEN_STORAGE_KEY = 'oilema:auth:token';
const LEGACY_LOGIN_AT_KEY = 'oilema:auth:loginAt';

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

function clearPersistedSession(): void {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(LEGACY_TOKEN_STORAGE_KEY);
    localStorage.removeItem(LEGACY_LOGIN_AT_KEY);
  } catch {
    // ignore storage failures
  }
}

function readStoredUser(): User | null {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    return stored ? (JSON.parse(stored) as User) : null;
  } catch {
    return null;
  }
}

interface RestoredSession {
  user: User | null;
  protheusAuth: string | null;
}

// A credencial Basic só vive em memória. Ao recarregar a página ela é reconstruída
// a partir das credenciais salvas ("Salvar senha"); sem elas, a sessão não continua.
function restoreSession(): RestoredSession {
  const saved = readSavedCredentials();
  if (!saved) {
    clearPersistedSession();
    return { user: null, protheusAuth: null };
  }

  try {
    localStorage.removeItem(LEGACY_TOKEN_STORAGE_KEY);
  } catch {
    // ignore storage failures
  }

  const userName = normalizeProtheusLoginUserName(saved.username);
  return {
    user: readStoredUser(),
    protheusAuth: buildBasicCredential(userName, saved.password),
  };
}

let restoredSession: RestoredSession | null = null;

function getRestoredSession(): RestoredSession {
  if (!restoredSession) {
    restoredSession = restoreSession();
  }
  return restoredSession;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => getRestoredSession().user);
  const [protheusAuth, setProtheusAuth] = useState<string | null>(
    () => getRestoredSession().protheusAuth,
  );
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
    async (
      username: string,
      password: string,
      ambiente?: ProtheusAmbiente,
    ): Promise<{ success: boolean; error?: string; passwordExpired?: boolean }> => {
      const loginUserName = normalizeProtheusLoginUserName(username);
      if (looksLikeEmail(loginUserName)) {
        return { success: false, error: PROTHEUS_EMAIL_LOGIN_BLOCKED_MESSAGE };
      }

      setIsLoading(true);
      try {
        const selectedAmbiente = normalizeProtheusAmbiente(
          ambiente ?? readStoredProtheusAmbiente(),
        );
        writeStoredProtheusAmbiente(selectedAmbiente);

        const { data, error } = await supabase.functions.invoke('protheus-login', {
          body: { username: loginUserName, password, ambiente: selectedAmbiente },
        });

        if (error) {
          const timedOut =
            /timeout|timed out|aborted|signal timed out/i.test(error.message || '');
          if (timedOut) {
            return {
              success: false,
              error:
                'Tempo esgotado ao autenticar no Protheus. Se a senha estiver expirada, atualize a Edge Function protheus-login (deploy) e tente novamente.',
            };
          }
          const hint =
            error.message.includes('Failed to send a request to the Edge Function')
              ? ' Verifique se as Edge Functions estão em execução (supabase functions serve) ou implantadas no Supabase.'
              : '';
          return {
            success: false,
            error: `Não foi possível conectar ao Protheus: ${error.message}${hint}`,
          };
        }

        if (data?.passwordExpired) {
          return {
            success: false,
            passwordExpired: true,
            error:
              data?.error ||
              'É necessário que o usuário efetue a troca de senha',
          };
        }

        if (data?.success) {
          let permissionsData: UserPermissionsResponse;
          try {
            permissionsData = await fetchUserPermissions(loginUserName);
          } catch (permError) {
            return {
              success: false,
              error:
                permError instanceof Error
                  ? permError.message
                  : 'Falha ao carregar permissões do usuário',
            };
          }

          const profile = buildUserProfile(loginUserName, permissionsData);

          const credential = buildBasicCredential(loginUserName, password);

          permissionsRefreshedRef.current = true;
          setProtheusAuth(credential);
          setUser(profile);
          restoredSession = { user: profile, protheusAuth: credential };
          try {
            localStorage.removeItem(LEGACY_TOKEN_STORAGE_KEY);
            localStorage.removeItem(LEGACY_LOGIN_AT_KEY);
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
          } catch {
            // ignore storage failures
          }
          return { success: true };
        }

        return {
          success: false,
          error: data?.error || `Não foi possível realizar o login para o usuário ${loginUserName}`,
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

  const changePassword = useCallback(
    async (
      username: string,
      oldPassword: string,
      newPassword: string,
      ambiente?: ProtheusAmbiente,
    ): Promise<{ success: boolean; error?: string }> => {
      const loginUserName = normalizeProtheusLoginUserName(username);
      if (looksLikeEmail(loginUserName)) {
        return { success: false, error: PROTHEUS_EMAIL_LOGIN_BLOCKED_MESSAGE };
      }

      try {
        const selectedAmbiente = normalizeProtheusAmbiente(
          ambiente ?? readStoredProtheusAmbiente(),
        );

        const { data, error } = await supabase.functions.invoke('protheus-change-password', {
          body: {
            user: loginUserName,
            oldPassword,
            newPassword,
            ambiente: selectedAmbiente,
          },
        });

        if (error) {
          const hint =
            error.message.includes('Failed to send a request to the Edge Function')
              ? ' Verifique se a Edge Function protheus-change-password está implantada.'
              : '';
          return {
            success: false,
            error: `Não foi possível trocar a senha: ${error.message}${hint}`,
          };
        }

        if (!data?.success) {
          return {
            success: false,
            error: data?.error || 'Não foi possível trocar a senha no Protheus',
          };
        }

        return { success: true };
      } catch {
        return {
          success: false,
          error: 'Não foi possível conectar ao Protheus. Verifique sua rede.',
        };
      }
    },
    [],
  );

  const logout = useCallback(() => {
    setUser(null);
    setProtheusAuth(null);
    permissionsRefreshedRef.current = false;
    restoredSession = { user: null, protheusAuth: null };
    clearPersistedSession();
  }, []);

  const expireSession = useCallback(
    (message?: string) => {
      const normalized = (message || '').toLowerCase();
      const passwordExpired =
        normalized.includes('troca de senha') ||
        normalized.includes('senha expirada') ||
        normalized.includes('changepassword');

      // Senha expirada: limpa credenciais salvas para forçar novo login/troca na tela inicial.
      if (passwordExpired) {
        clearSavedCredentials();
      }

      logout();
      toast.warning(
        message ||
          (passwordExpired
            ? 'É necessário que o usuário efetue a troca de senha. Faça login novamente.'
            : 'Sessão expirada. Faça login novamente.'),
      );
    },
    [logout],
  );

  useEffect(() => {
    registerSessionExpiredHandler(expireSession);
    return () => registerSessionExpiredHandler(null);
  }, [expireSession]);

  useEffect(() => {
    if (!protheusAuth || !user?.userName || permissionsRefreshedRef.current) return;

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
  }, [protheusAuth, user?.userName, user?.permissions]);

  return (
    <AuthContext.Provider
      value={{
        user,
        protheusAuth,
        isAuthenticated: !!user && !!protheusAuth,
        isLoading,
        isAdmin,
        permissions,
        hasPermission,
        login,
        changePassword,
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
