export interface GrupoSolicitacao {
  codigo: string;
  descricao: string;
}

export interface RelatorioScSetoresQuery {
  dtInicial: string;
  dtFinal: string;
  grupoAprovacao: string;
}

export interface RelatorioScSetorRow {
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
