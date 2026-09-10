export type SolicitacaoCompraProtheusStatus =
  | "aberto"
  | "totalmente_atendida"
  | "parcialmente_atendida"
  | "em_cotacao"
  | "residuo"
  | "bloqueada"
  | "rejeitada";

const STATUS_LABELS: Record<SolicitacaoCompraProtheusStatus, string> = {
  aberto: "Aberto",
  totalmente_atendida: "Totalmente Atendida",
  parcialmente_atendida: "Parcialmente Atendida",
  em_cotacao: "Em Cotação",
  residuo: "Resíduo",
  bloqueada: "Bloqueada",
  rejeitada: "Rejeitada",
};

const STATUS_DOT_CLASSES: Record<SolicitacaoCompraProtheusStatus, string> = {
  aberto: "bg-emerald-500",
  totalmente_atendida: "bg-red-500",
  parcialmente_atendida: "bg-yellow-500",
  em_cotacao: "bg-blue-500",
  residuo: "bg-gray-300",
  bloqueada: "bg-blue-600",
  rejeitada: "bg-orange-500",
};

const EXACT_STATUS_MAP: Record<string, SolicitacaoCompraProtheusStatus> = {
  aberto: "aberto",
  "totalmente atendida": "totalmente_atendida",
  "parcialmente atendida": "parcialmente_atendida",
  "parciamente atendida": "parcialmente_atendida",
  "em cotacao": "em_cotacao",
  residuo: "residuo",
  bloqueada: "bloqueada",
  rejeitada: "rejeitada",
};

const normalizeStatusKey = (raw: string): string =>
  raw
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

export const mapProtheusSolicitacaoCompraStatus = (
  raw?: string | number,
): SolicitacaoCompraProtheusStatus => {
  const key = normalizeStatusKey(raw == null ? "" : String(raw));
  if (!key) return "aberto";

  if (EXACT_STATUS_MAP[key]) return EXACT_STATUS_MAP[key];

  if (key === "aberto") return "aberto";
  if (key.includes("totalmente") && key.includes("atend")) return "totalmente_atendida";
  if (key.includes("parcial") && key.includes("atend")) return "parcialmente_atendida";
  if (key.includes("parciamente") && key.includes("atend")) return "parcialmente_atendida";
  if (key.includes("cotacao")) return "em_cotacao";
  if (key.includes("residuo")) return "residuo";
  if (key.includes("bloquead")) return "bloqueada";
  if (key.includes("rejeitad")) return "rejeitada";

  return "aberto";
};

export const getSolicitacaoCompraStatusLabel = (
  status: SolicitacaoCompraProtheusStatus,
): string => STATUS_LABELS[status];

export const getSolicitacaoCompraStatusDotClass = (
  status: SolicitacaoCompraProtheusStatus,
): string => STATUS_DOT_CLASSES[status];

export const isSolicitacaoCompraStatusAlteravel = (
  status?: string,
): boolean => {
  if (!status) return false;
  const key = normalizeStatusKey(status);
  if (!key) return false;
  if (EXACT_STATUS_MAP[key] === "aberto" || EXACT_STATUS_MAP[key] === "bloqueada") {
    return true;
  }
  if (key === "aberto") return true;
  if (key.includes("bloquead")) return true;
  return false;
};
