import type { ReportColumn } from './types/report';

export const RELATORIO_HOSP_PASS_ID = 'passagens-hospedagens';
export const RELATORIO_HOSP_PASS_TITULO = 'Passagens e Hospedagens';

export const RELATORIO_HOSP_PASS_COLUMNS: ReportColumn[] = [
  { key: 'filial', label: 'Filial', formato: 'texto', largura: 10 },
  { key: 'nf', label: 'NF', formato: 'texto', largura: 12 },
  { key: 'serie', label: 'Série', formato: 'texto', largura: 8 },
  { key: 'fornecedor', label: 'Fornecedor', formato: 'texto', largura: 12 },
  { key: 'loja', label: 'Loja', formato: 'texto', largura: 8 },
  { key: 'nome', label: 'Nome', formato: 'texto', largura: 32 },
  { key: 'emissao', label: 'Data de emissão', formato: 'data', largura: 16 },
  { key: 'produto', label: 'Produto', formato: 'texto', largura: 14 },
  { key: 'descricao', label: 'Descrição', formato: 'texto', largura: 40 },
  { key: 'quantidade', label: 'Quantidade', formato: 'numero', largura: 14 },
  { key: 'valorUnit', label: 'Valor unitário', formato: 'moeda', largura: 16 },
  { key: 'total', label: 'Total', formato: 'moeda', largura: 16 },
  { key: 'centroCusto', label: 'Centro de custo', formato: 'texto', largura: 16 },
  { key: 'descCC', label: 'Descrição do centro de custo', formato: 'texto', largura: 36 },
  { key: 'observacao', label: 'Observação', formato: 'texto', largura: 40 },
];
