import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User } from '@gestao-compra/shared';
import { mockUser } from '@/data/mockOrders';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { registerSessionExpiredHandler } from '@/lib/sessionExpired';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  expireSession: (message?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'oilema:auth:user';
const TOKEN_STORAGE_KEY = 'oilema:auth:token';

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

  const login = useCallback(
    async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('protheus-login', {
          body: { username, password },
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
          const profile: User = { ...mockUser, nome: username };

          setToken(accessToken);
          setUser(profile);
          try {
            localStorage.setItem(TOKEN_STORAGE_KEY, accessToken);
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
          } catch {
            // ignore storage failures
          }
          return { success: true };
        }

        return {
          success: false,
          error: data?.error || `Não foi possível realizar o login para o usuário ${username}`,
        };

      } catch (err) {
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
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
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

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
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
