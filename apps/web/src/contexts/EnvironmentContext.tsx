import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  PROTHEUS_AMBIENTE_BADGE,
  PROTHEUS_AMBIENTE_LABEL,
  normalizeProtheusAmbiente,
  type ProtheusAmbiente,
} from "@gestao-compra/shared";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {
  readStoredProtheusAmbiente,
  writeStoredProtheusAmbiente,
} from "@/lib/protheusAmbienteStorage";

interface EnvironmentContextType {
  ambiente: ProtheusAmbiente;
  isProducao: boolean;
  label: string;
  badgeLabel: string;
  setAmbiente: (ambiente: ProtheusAmbiente) => void;
}

const EnvironmentContext = createContext<EnvironmentContextType | undefined>(undefined);

export const EnvironmentProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [ambiente, setAmbienteState] = useState<ProtheusAmbiente>(() =>
    readStoredProtheusAmbiente(),
  );

  const setAmbiente = useCallback(
    (next: ProtheusAmbiente) => {
      const normalized = normalizeProtheusAmbiente(next);
      if (normalized === ambiente) return;

      writeStoredProtheusAmbiente(normalized);
      setAmbienteState(normalized);

      if (isAuthenticated) {
        logout();
        toast.info("Ambiente alterado. Faça login novamente no ambiente selecionado.");
        navigate("/", { replace: true });
      }
    },
    [ambiente, isAuthenticated, logout, navigate],
  );

  const value = useMemo(
    () => ({
      ambiente,
      isProducao: ambiente === "producao",
      label: PROTHEUS_AMBIENTE_LABEL[ambiente],
      badgeLabel: PROTHEUS_AMBIENTE_BADGE[ambiente],
      setAmbiente,
    }),
    [ambiente, setAmbiente],
  );

  return (
    <EnvironmentContext.Provider value={value}>{children}</EnvironmentContext.Provider>
  );
};

export const useEnvironment = () => {
  const context = useContext(EnvironmentContext);
  if (context === undefined) {
    throw new Error("useEnvironment must be used within an EnvironmentProvider");
  }
  return context;
};
