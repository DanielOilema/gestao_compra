export interface NotasListFilters {
  tipo: "all" | "debito" | "credito";
  cliFor: string;
  usuario: string;
  pesquisa: string;
  dataInicio: string;
  dataFim: string;
}

export const emptyNotasListFilters = (): NotasListFilters => ({
  tipo: "all",
  cliFor: "",
  usuario: "",
  pesquisa: "",
  dataInicio: "",
  dataFim: "",
});
