import type { RateioCCPayload } from "./types/solicitacaoInclusao";

export type ValidateRateioCCResult =
  | { ok: true }
  | { ok: false; error: string };

export function sumRateioPercentual(rateio: RateioCCPayload[]): number {
  return rateio.reduce((acc, row) => acc + (Number(row.percentual) || 0), 0);
}

export function validateRateioCC(
  rateio: RateioCCPayload[] | undefined | null,
): ValidateRateioCCResult {
  if (!rateio || rateio.length === 0) {
    return { ok: false, error: "Informe o rateio de centros de custo" };
  }

  if (rateio.length < 2) {
    return { ok: false, error: "Informe pelo menos 2 centros de custo diferentes" };
  }

  const codes = new Set<string>();
  for (const row of rateio) {
    const cc = row.cc?.trim() ?? "";
    if (!cc) {
      return { ok: false, error: "Selecione o centro de custo em todas as linhas" };
    }
    if (codes.has(cc)) {
      return { ok: false, error: "Os centros de custo do rateio devem ser diferentes" };
    }
    codes.add(cc);

    const pct = Number(row.percentual);
    if (!Number.isFinite(pct) || pct <= 0) {
      return { ok: false, error: "Informe um percentual maior que zero em todas as linhas" };
    }
  }

  if (codes.size < 2) {
    return { ok: false, error: "Informe pelo menos 2 centros de custo diferentes" };
  }

  const sum = Math.round(sumRateioPercentual(rateio) * 100) / 100;
  if (sum !== 100) {
    return { ok: false, error: `A soma do rateio deve ser 100% (atual: ${sum}%)` };
  }

  return { ok: true };
}

export function hasValidRateioCC(rateio?: RateioCCPayload[] | null): boolean {
  return validateRateioCC(rateio).ok;
}
