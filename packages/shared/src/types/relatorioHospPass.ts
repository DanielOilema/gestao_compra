export interface RelatorioHospPassQuery {
  dtInicial: string;
  dtFinal: string;
}

export interface RelatorioHospPassRow {
  filial: string;
  nf: string;
  serie: string;
  fornecedor: string;
  loja: string;
  nome: string;
  emissao: string;
  produto: string;
  descricao: string;
  quantidade: number | null;
  valorUnit: number | null;
  total: number | null;
  centroCusto: string;
  descCC: string;
  observacao: string;
}
