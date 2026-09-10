import type { PurchaseRequest, PurchaseRequestItem } from "./types/purchaseRequest";
import type { SolicitacaoCompraProtheusStatus } from "./solicitacaoCompraStatus";
import { isSolicitacaoCompraStatusAlteravel } from "./solicitacaoCompraStatus";

export const SOLICITACAO_COMPRA_STATUS_ALTERAVEIS: readonly SolicitacaoCompraProtheusStatus[] = [
  "aberto",
  "bloqueada",
];

export type CanAlterSolicitacaoReason = "status" | "solicitante";

export type CanAlterSolicitacaoResult = {
  ok: boolean;
  reason?: CanAlterSolicitacaoReason;
};

export const ALTERAR_SOLICITACAO_STATUS_MESSAGE =
  "Só é possível alterar solicitações em aberto ou bloqueadas.";

export const ALTERAR_SOLICITACAO_SOLICITANTE_MESSAGE =
  "Apenas quem incluiu a solicitação pode alterá-la.";

export const ALTERAR_SOLICITACAO_SELECIONE_MESSAGE =
  "Selecione uma solicitação para alterar";

const normalizePersonKey = (value?: string): string =>
  (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");

export const isSolicitanteDaSolicitacao = (
  solicitante: string,
  user?: { nome?: string; userName?: string } | null,
): boolean => {
  const target = normalizePersonKey(solicitante);
  if (!target || !user) return false;

  return [user.nome, user.userName]
    .map(normalizePersonKey)
    .some((candidate) => candidate.length > 0 && candidate === target);
};

const resolveItemStatus = (
  item: PurchaseRequestItem,
  requestStatus: PurchaseRequest["status"],
): string => {
  if (item.status) return item.status;
  return String(requestStatus ?? "");
};

export const canAlterSolicitacaoCompra = (
  request: PurchaseRequest | null | undefined,
  user?: { nome?: string; userName?: string } | null,
): CanAlterSolicitacaoResult => {
  if (!request) return { ok: false, reason: "status" };

  const statuses =
    request.itens.length > 0
      ? request.itens.map((item) => resolveItemStatus(item, request.status))
      : [String(request.status ?? "")];

  if (!statuses.every(isSolicitacaoCompraStatusAlteravel)) {
    return { ok: false, reason: "status" };
  }

  if (!isSolicitanteDaSolicitacao(request.solicitante, user)) {
    return { ok: false, reason: "solicitante" };
  }

  return { ok: true };
};

export const getAlterarSolicitacaoMessage = (
  result: CanAlterSolicitacaoResult,
): string => {
  if (result.ok) return "";
  if (result.reason === "solicitante") return ALTERAR_SOLICITACAO_SOLICITANTE_MESSAGE;
  return ALTERAR_SOLICITACAO_STATUS_MESSAGE;
};
