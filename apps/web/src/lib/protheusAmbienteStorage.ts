import {
  normalizeProtheusAmbiente,
  type ProtheusAmbiente,
} from "@gestao-compra/shared";

export const AMBIENTE_STORAGE_KEY = "oilema:protheus:ambiente";

export function readStoredProtheusAmbiente(): ProtheusAmbiente {
  try {
    return normalizeProtheusAmbiente(localStorage.getItem(AMBIENTE_STORAGE_KEY));
  } catch {
    return "homologacao";
  }
}

export function writeStoredProtheusAmbiente(ambiente: ProtheusAmbiente): void {
  try {
    localStorage.setItem(AMBIENTE_STORAGE_KEY, ambiente);
  } catch {
    // ignore storage failures
  }
}
