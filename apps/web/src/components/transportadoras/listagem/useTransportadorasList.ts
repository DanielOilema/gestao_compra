import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  filterTransportadorasByPesquisa,
  type TransportadoraDetalhe,
  type TransportadoraListItem,
} from "@gestao-compra/shared";
import { useAuth } from "@/contexts/AuthContext";
import { useEnvironment } from "@/contexts/EnvironmentContext";
import { getDetTransportadora } from "@/hooks/getDetTransportadora";
import { getTransportadoras } from "@/hooks/getTransportadoras";

export function useTransportadorasList() {
  const { protheusAuth } = useAuth();
  const { ambiente } = useEnvironment();
  const [pesquisa, setPesquisa] = useState("");
  const [appliedPesquisa, setAppliedPesquisa] = useState("");
  const [selectedCodigo, setSelectedCodigo] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState<TransportadoraDetalhe | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const { data, error, isFetching, refetch } = useQuery({
    queryKey: ["transportadoras", ambiente],
    enabled: !!protheusAuth,
    queryFn: () => getTransportadoras(protheusAuth!),
  });

  useEffect(() => {
    if (!error) return;
    toast.error(error instanceof Error ? error.message : "Erro ao buscar transportadoras");
  }, [error]);

  const rows = useMemo(
    () => filterTransportadorasByPesquisa(data ?? [], appliedPesquisa),
    [data, appliedPesquisa],
  );

  const handlePesquisaSubmit = useCallback(() => {
    setAppliedPesquisa(pesquisa);
    setSelectedCodigo(null);
  }, [pesquisa]);

  const handleLimpar = useCallback(() => {
    setPesquisa("");
    setAppliedPesquisa("");
    setSelectedCodigo(null);
    void refetch();
  }, [refetch]);

  const openDetail = useCallback(
    async (item: TransportadoraListItem) => {
      if (!protheusAuth) return;
      setSelectedCodigo(item.codigo);
      setDetailOpen(true);
      setDetailLoading(true);
      setDetail({
        codigo: item.codigo,
        nome: item.nome,
        nomeReduzido: "",
        via: "",
        endereco: "",
        bairro: "",
        municipio: "",
        estado: "",
        cep: "",
        ddd: "",
        telefone: "",
        cgc: item.cgc,
        tipoAntt: "",
        inscEstadual: "",
        email: "",
        antt: "",
        codMunicipio: "",
      });
      try {
        const full = await getDetTransportadora({
          codigo: item.codigo,
          basicAuth: protheusAuth,
          header: item,
        });
        setDetail(full);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erro ao carregar detalhe");
      } finally {
        setDetailLoading(false);
      }
    },
    [protheusAuth],
  );

  const handleSelectRow = useCallback(
    (item: TransportadoraListItem) => {
      void openDetail(item);
    },
    [openDetail],
  );

  const handleCloseDetail = useCallback((open: boolean) => {
    setDetailOpen(open);
    if (!open) {
      setDetail(null);
      setDetailLoading(false);
    }
  }, []);

  return {
    pesquisa,
    setPesquisa,
    isLoading: isFetching,
    selectedCodigo,
    rows,
    detailOpen,
    detail,
    detailLoading,
    handlePesquisaSubmit,
    handleLimpar,
    handleSelectRow,
    handleCloseDetail,
  };
}
