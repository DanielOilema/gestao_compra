import { Order, OrderSummary, User, OrderStatus, OrderItem } from "@gestao-compra/shared";

export const mockUser: User = {
  id: "1",
  nome: "Carlos Silva",
  email: "carlos.silva@oilema.com.br",
  alcada: 50000,
  filial: "01 - São Paulo",
};

const createOrderItems = (count: number): OrderItem[] => {
  const items: OrderItem[] = [];
  const produtos = [
    { codigo: "SEM001", descricao: "Semente de Soja - Cultivar X" },
    { codigo: "SEM002", descricao: "Semente de Milho - Híbrido Premium" },
    { codigo: "SEM003", descricao: "Semente de Trigo - Variedade A" },
    { codigo: "FER001", descricao: "Fertilizante NPK 20-10-10" },
    { codigo: "DEF001", descricao: "Defensivo Agrícola - Herbicida" },
  ];
  const centrosCusto = [
    { codigo: "CC001", descricao: "Produção Agrícola" },
    { codigo: "CC002", descricao: "Armazenagem" },
    { codigo: "CC003", descricao: "Logística" },
    { codigo: "CC004", descricao: "Administrativo" },
  ];

  for (let i = 0; i < count; i++) {
    const produto = produtos[i % produtos.length];
    const centroCusto = centrosCusto[i % centrosCusto.length];
    const quantidade = Math.floor(Math.random() * 100) + 10;
    const valorUnitario = Math.floor(Math.random() * 500) + 50;

    items.push({
      id: `item-${i + 1}`,
      codigoProduto: produto.codigo,
      descricaoProduto: produto.descricao,
      quantidade,
      valorUnitario,
      valorTotal: quantidade * valorUnitario,
      codigoCentroCusto: centroCusto.codigo,
      descricaoCentroCusto: centroCusto.descricao,
      observacao: i % 2 === 0 ? "Entrega urgente" : undefined,
    });
  }
  return items;
};

export const mockOrders: Order[] = [
  {
    id: "1",
    numero: "PC-2025-001234",
    filial: "0101",
    fornecedor: "Distribuidora Agrícola ABC Ltda",
    cnpj: "12.345.678/0001-90",
    valor: 15750.0,
    dataEmissao: "2025-02-01",
    dataEntrega: "2025-03-01",
    solicitante: "João Mendes",
    status: "pending",
    itens: createOrderItems(3),
    observacaoGeral: "Pedido prioritário para safra",
  },
  {
    id: "2",
    numero: "PC-2025-001235",
    filial: "0102",
    fornecedor: "Sementes XYZ S/A",
    cnpj: "98.765.432/0001-10",
    valor: 32400.0,
    dataEmissao: "2025-02-02",
    dataEntrega: "2025-03-02",
    solicitante: "Maria Santos",
    status: "pending",
    itens: createOrderItems(5),
  },
  {
    id: "3",
    numero: "PC-2025-001230",
    filial: "0103",
    fornecedor: "Insumos Agrícolas 123 Ltda",
    cnpj: "11.222.333/0001-44",
    valor: 8900.0,
    dataEmissao: "2025-01-28",
    dataEntrega: "2025-02-28",
    solicitante: "Pedro Oliveira",
    status: "blocked",
    motivoBloqueio: "Fornecedor com pendências fiscais",
    itens: createOrderItems(2),
  },
  {
    id: "4",
    numero: "PC-2025-001228",
    filial: "0104",
    fornecedor: "Tech Agro Solutions ME",
    cnpj: "44.555.666/0001-77",
    valor: 45000.0,
    dataEmissao: "2025-01-25",
    dataEntrega: "2025-02-25",
    solicitante: "Ana Costa",
    status: "blocked",
    motivoBloqueio: "Valor acima da alçada do solicitante",
    itens: createOrderItems(4),
    observacaoGeral: "Aguardando aprovação da diretoria",
  },
  {
    id: "5",
    numero: "PC-2025-001220",
    filial: "0105",
    fornecedor: "Fertilizantes Popular Ltda",
    cnpj: "77.888.999/0001-11",
    valor: 12300.0,
    dataEmissao: "2025-01-20",
    dataEntrega: "2025-02-20",
    solicitante: "João Mendes",
    status: "approved",
    itens: createOrderItems(3),
  },
  {
    id: "6",
    numero: "PC-2025-001215",
    filial: "0106",
    fornecedor: "Atacado Centro-Oeste Agro",
    cnpj: "22.333.444/0001-55",
    valor: 28750.0,
    dataEmissao: "2025-01-18",
    dataEntrega: "2025-02-18",
    solicitante: "Maria Santos",
    status: "approved",
    itens: createOrderItems(6),
  },
  {
    id: "7",
    numero: "PC-2025-001210",
    filial: "0107",
    fornecedor: "Mega Distribuidora Rural",
    cnpj: "55.666.777/0001-88",
    valor: 67500.0,
    dataEmissao: "2025-01-15",
    dataEntrega: "2025-02-15",
    solicitante: "Pedro Oliveira",
    status: "approved",
    itens: createOrderItems(8),
  },
  {
    id: "8",
    numero: "PC-2025-001240",
    filial: "0101",
    fornecedor: "Loja Express Agro",
    cnpj: "33.444.555/0001-22",
    valor: 5600.0,
    dataEmissao: "2025-02-03",
    dataEntrega: "2025-03-03",
    solicitante: "Ana Costa",
    status: "pending",
    itens: createOrderItems(2),
  },
];

export const getOrderSummary = (orders: Order[]): OrderSummary => {
  return orders.reduce(
    (acc, order) => {
      acc[order.status]++;
      acc.totalValue += order.valor;
      return acc;
    },
    { pending: 0, blocked: 0, approved: 0, totalValue: 0 },
  );
};

export const getOrdersByStatus = (orders: Order[], status: OrderStatus): Order[] => {
  return orders.filter((order) => order.status === status);
};
