export interface RelatorioPcSetoresQuery {
  dtInicial: string;
  dtFinal: string;
  grupoAprovacao: string;
}

export interface RelatorioPcSetorRow {
  filial: string;
  tipoCompra: string;
  numero: string;
  emissao: string;
  produto: string;
  descricao: string;
  quantidade: number | null;
  centroCusto: string;
  descCC: string;
  solicitante: string;
  observacao: string;
}
