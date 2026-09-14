import type { ReportColumn } from './types/report';

export const RELATORIO_PC_SETORES_ID = 'pedidos-setores';
export const RELATORIO_PC_SETORES_TITULO = 'Pedidos de Compras';
export const RELATORIO_PC_SETORES_LOOKUP_GRUPOS = 'grupos-aprovacao-pc';
export const RELATORIO_PC_SETORES_FILTRO_GRUPOS = 'PC';

export const RELATORIO_PC_SETORES_COLUMNS: ReportColumn[] = [
  { key: 'filial', label: 'Filial', formato: 'texto', largura: 10 },
  { key: 'tipoCompra', label: 'Tipo de compra', formato: 'texto', largura: 16 },
  { key: 'numero', label: 'Número', formato: 'texto', largura: 12 },
  { key: 'emissao', label: 'Data de emissão', formato: 'data', largura: 16 },
  { key: 'produto', label: 'Produto', formato: 'texto', largura: 14 },
  { key: 'descricao', label: 'Descrição', formato: 'texto', largura: 40 },
  { key: 'quantidade', label: 'Quantidade', formato: 'numero', largura: 14 },
  { key: 'centroCusto', label: 'Centro de custo', formato: 'texto', largura: 16 },
  { key: 'descCC', label: 'Descrição do centro de custo', formato: 'texto', largura: 36 },
  { key: 'solicitante', label: 'Solicitante', formato: 'texto', largura: 22 },
  { key: 'observacao', label: 'Observação', formato: 'texto', largura: 40 },
];
