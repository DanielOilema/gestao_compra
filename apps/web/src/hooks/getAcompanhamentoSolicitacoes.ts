import type {
  AcompanhamentoSolicitacaoFilters,
  SolicitacaoAcompanhamento,
  SolicitacaoStatusNaoReconhecido,
} from "@gestao-compra/shared";
import { mapProtheusAcompanhamentoSolicitacoesResponse } from "@gestao-compra/shared";
import { invokeProtheusFunction } from "@/lib/invokeProtheusFunction";
import { toApiDate } from "@/lib/dateBr";

export const ACOMPANHAMENTO_PAGE_SIZE = 100;

export interface GetAcompanhamentoSolicitacoesParams {
  filters: AcompanhamentoSolicitacaoFilters;
  page: number;
  pageSize: number;
  basicAuth: string;
  codUser: string;
  nomeUser: string;
}

export interface GetAcompanhamentoSolicitacoesResult {
  solicitacoes: SolicitacaoAcompanhamento[];
  naoReconhecidas: SolicitacaoStatusNaoReconhecido[];
  hasNextPage: boolean;
}

export async function getAcompanhamentoSolicitacoes({
  filters,
  page,
  pageSize,
  basicAuth,
  codUser,
  nomeUser,
}: GetAcompanhamentoSolicitacoesParams): Promise<GetAcompanhamentoSolicitacoesResult> {
  const body: Record<string, string | number> = {
    page,
    pageSize,
    basicAuth,
  };

  if (codUser.trim()) body.codUser = codUser.trim();
  if (nomeUser.trim()) body.nomeUser = nomeUser.trim();

  if (filters.filial.trim()) body.filial = filters.filial.trim();
  if (filters.numero.trim()) body.numSC = filters.numero.trim();
  if (filters.solicitante.trim()) body.solicitante = filters.solicitante.trim();
  if (filters.centroCusto.trim()) body.centroCusto = filters.centroCusto.trim();
  if (filters.status) body.status = filters.status;
  if (filters.fornecedor.trim()) body.fornecedor = filters.fornecedor.trim();

  const dtInicial = toApiDate(filters.dataInicio);
  const dtFinal = toApiDate(filters.dataFim);
  if (dtInicial) body.dtInicial = dtInicial;
  if (dtFinal) body.dtFinal = dtFinal;

  const data = await invokeProtheusFunction<unknown>(
    "protheus-acompanhamento-solicitacoes",
    body,
    "Falha ao buscar o acompanhamento das solicitações",
  );

  const mapped = mapProtheusAcompanhamentoSolicitacoesResponse(data ?? {});
  const filtradas = filtrarAcompanhamento(mapped.solicitacoes, filters);
  const numero = filters.numero.trim().toLowerCase();
  const filial = filters.filial.trim();

  return {
    solicitacoes: filtradas,
    naoReconhecidas: mapped.naoReconhecidas.filter((item) => {
      if (numero && !item.numero.toLowerCase().includes(numero)) return false;
      if (filial && item.filial !== filial) return false;
      return true;
    }),
    // busca_sc_situacao devolve a lista inteira; a paginação fica para um contrato futuro.
    hasNextPage: false,
  };
}

function filtrarAcompanhamento(
  solicitacoes: SolicitacaoAcompanhamento[],
  filters: AcompanhamentoSolicitacaoFilters,
): SolicitacaoAcompanhamento[] {
  const numero = filters.numero.trim().toLowerCase();
  const filial = filters.filial.trim();
  const solicitante = filters.solicitante.trim().toLowerCase();
  const centroCusto = filters.centroCusto.trim().toLowerCase();
  const fornecedor = filters.fornecedor.trim().toLowerCase();
  const dtInicial = toApiDate(filters.dataInicio);
  const dtFinal = toApiDate(filters.dataFim);

  return solicitacoes.filter((item) => {
    if (numero && !item.numero.toLowerCase().includes(numero)) return false;
    if (filial && item.filial !== filial) return false;
    if (solicitante && !(item.solicitante ?? "").toLowerCase().includes(solicitante)) return false;
    if (filters.status && item.statusAtual !== filters.status) return false;
    if (centroCusto && !(item.centroCusto ?? "").toLowerCase().includes(centroCusto)) return false;
    if (dtInicial && (item.dataSolicitacao ?? "") < dtInicial) return false;
    if (dtFinal && (item.dataSolicitacao ?? "") > dtFinal) return false;
    if (fornecedor && !textoFornecedores(item).includes(fornecedor)) return false;
    return true;
  });
}

function textoFornecedores(item: SolicitacaoAcompanhamento): string {
  const nomes = [
    ...(item.cotacoes ?? []).flatMap((cotacao) => [
      cotacao.fornecedorEscolhido,
      ...(cotacao.fornecedores ?? []).map((fornecedor) => fornecedor.nome),
    ]),
    ...(item.pedidos ?? []).map((pedido) => pedido.fornecedor),
    ...(item.notasFiscais ?? []).map((nota) => nota.fornecedor),
  ];
  return nomes.filter(Boolean).join(" ").toLowerCase();
}
