import { Order, OrderItem } from '@gestao-compra/shared';

const createSolicitationItems = (count: number): OrderItem[] => {
  const items: OrderItem[] = [];
  const produtos = [
    { codigo: 'MAT001', descricao: 'Material de Escritório - Papel A4' },
    { codigo: 'MAT002', descricao: 'Equipamento de Proteção Individual' },
    { codigo: 'MAT003', descricao: 'Peças de Reposição - Motor' },
    { codigo: 'MAT004', descricao: 'Lubrificante Industrial 20L' },
    { codigo: 'MAT005', descricao: 'Filtro de Ar - Máquina Colheitadeira' },
  ];
  const centrosCusto = [
    { codigo: 'CC010', descricao: 'Manutenção' },
    { codigo: 'CC011', descricao: 'Operações de Campo' },
    { codigo: 'CC012', descricao: 'Segurança do Trabalho' },
    { codigo: 'CC013', descricao: 'Escritório Central' },
  ];

  for (let i = 0; i < count; i++) {
    const produto = produtos[i % produtos.length];
    const centroCusto = centrosCusto[i % centrosCusto.length];
    const quantidade = Math.floor(Math.random() * 50) + 5;
    const valorUnitario = Math.floor(Math.random() * 300) + 20;

    items.push({
      id: `sol-item-${i + 1}`,
      codigoProduto: produto.codigo,
      descricaoProduto: produto.descricao,
      quantidade,
      valorUnitario,
      valorTotal: quantidade * valorUnitario,
      codigoCentroCusto: centroCusto.codigo,
      descricaoCentroCusto: centroCusto.descricao,
      observacao: i % 3 === 0 ? 'Urgente' : undefined,
    });
  }
  return items;
};

export const mockSolicitations: Order[] = [
  {
    id: 'sol-1',
    numero: 'SC-2025-000501',
    filial: '0101',
    fornecedor: 'A definir',
    cnpj: '00.000.000/0000-00',
    valor: 4200.0,
    dataEmissao: '2025-02-05',
    dataEntrega: '2025-03-05',
    solicitante: 'Ricardo Lima',
    status: 'pending',
    itens: createSolicitationItems(2),
    observacaoGeral: 'Necessidade urgente para manutenção preventiva',
  },
  {
    id: 'sol-2',
    numero: 'SC-2025-000502',
    filial: '0102',
    fornecedor: 'A definir',
    cnpj: '00.000.000/0000-00',
    valor: 12800.0,
    dataEmissao: '2025-02-06',
    dataEntrega: '2025-03-10',
    solicitante: 'Fernanda Rocha',
    status: 'pending',
    itens: createSolicitationItems(4),
  },
  {
    id: 'sol-3',
    numero: 'SC-2025-000503',
    filial: '0103',
    fornecedor: 'A definir',
    cnpj: '00.000.000/0000-00',
    valor: 7500.0,
    dataEmissao: '2025-02-07',
    dataEntrega: '2025-03-15',
    solicitante: 'Lucas Martins',
    status: 'pending',
    itens: createSolicitationItems(3),
    observacaoGeral: 'Substituição de EPIs vencidos',
  },
  {
    id: 'sol-4',
    numero: 'SC-2025-000504',
    filial: '0104',
    fornecedor: 'A definir',
    cnpj: '00.000.000/0000-00',
    valor: 23000.0,
    dataEmissao: '2025-02-08',
    dataEntrega: '2025-03-20',
    solicitante: 'Camila Souza',
    status: 'pending',
    itens: createSolicitationItems(5),
  },
  {
    id: 'sol-5',
    numero: 'SC-2025-000505',
    filial: '0105',
    fornecedor: 'A definir',
    cnpj: '00.000.000/0000-00',
    valor: 3100.0,
    dataEmissao: '2025-02-09',
    dataEntrega: '2025-03-25',
    solicitante: 'Ricardo Lima',
    status: 'pending',
    itens: createSolicitationItems(2),
  },
];
