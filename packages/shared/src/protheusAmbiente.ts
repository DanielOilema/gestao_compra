export type ProtheusAmbiente = "homologacao" | "producao";

export const PROTHEUS_AMBIENTE_HOMOLOGACAO: ProtheusAmbiente = "homologacao";
export const PROTHEUS_AMBIENTE_PRODUCAO: ProtheusAmbiente = "producao";

export const PROTHEUS_AMBIENTE_PORT: Record<ProtheusAmbiente, number> = {
  homologacao: 9559,
  producao: 9505,
};

export const PROTHEUS_AMBIENTE_LABEL: Record<ProtheusAmbiente, string> = {
  homologacao: "Homologação",
  producao: "Produção",
};

export const PROTHEUS_AMBIENTE_BADGE: Record<ProtheusAmbiente, string> = {
  homologacao: "HOMOLOGAÇÃO",
  producao: "PRODUÇÃO",
};

export const PROTHEUS_AMBIENTE_OPTIONS: ReadonlyArray<{
  value: ProtheusAmbiente;
  label: string;
  port: number;
}> = [
  {
    value: "homologacao",
    label: PROTHEUS_AMBIENTE_LABEL.homologacao,
    port: PROTHEUS_AMBIENTE_PORT.homologacao,
  },
  {
    value: "producao",
    label: PROTHEUS_AMBIENTE_LABEL.producao,
    port: PROTHEUS_AMBIENTE_PORT.producao,
  },
];

export function normalizeProtheusAmbiente(value: unknown): ProtheusAmbiente {
  if (typeof value === "string" && value.trim().toLowerCase() === "producao") {
    return "producao";
  }
  return "homologacao";
}
