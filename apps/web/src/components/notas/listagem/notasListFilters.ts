export interface NotasListFilters {
  tipo: "all" | "debito" | "credito";
  cliFor: string;
  pesquisa: string;
  dataInicio: string;
  dataFim: string;
}

export const emptyNotasListFilters = (): NotasListFilters => ({
  tipo: "all",
  cliFor: "",
  pesquisa: "",
  dataInicio: "",
  dataFim: "",
});
