export interface SolicitacaoCompraListFilters {
  filial: string;
  numSC: string;
  produto: string;
  solicitante: string;
  dataInicio: string;
  dataFim: string;
}

export const emptySolicitacaoCompraListFilters = (): SolicitacaoCompraListFilters => ({
  filial: "",
  numSC: "",
  produto: "",
  solicitante: "",
  dataInicio: "",
  dataFim: "",
});
