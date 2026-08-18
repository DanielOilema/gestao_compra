import React, { useMemo, useState } from "react";
import SolicitacaoFilters, { type SolicitacaoFiltersState } from "@/components/solicitacoes/SolicitacaoFilters";
import SolicitacaoStatusTable from "@/components/solicitacoes/SolicitacaoStatusTable";
import { mockPurchaseRequests } from "@/data/mockPurchaseRequests";
import { toApiDate } from "@/lib/dateBr";

const MinhasSolicitacoesPage: React.FC = () => {
  const [filters, setFilters] = useState<SolicitacaoFiltersState>({
    status: "all",
    dataInicio: "",
    dataFim: "",
  });

  const filtered = useMemo(() => {
    const dataInicioIso = toApiDate(filters.dataInicio);
    const dataFimIso = toApiDate(filters.dataFim);

    return mockPurchaseRequests.filter((req) => {
      if (filters.status !== "all" && req.status !== filters.status) return false;
      if (dataInicioIso && req.dataCriacao < dataInicioIso) return false;
      if (dataFimIso && req.dataCriacao > dataFimIso) return false;
      return true;
    });
  }, [filters]);

  return (
    <div className="animate-fade-in space-y-6">
      <SolicitacaoFilters filters={filters} onChange={setFilters} />
      <SolicitacaoStatusTable requests={filtered} />
    </div>
  );
};

export default MinhasSolicitacoesPage;
