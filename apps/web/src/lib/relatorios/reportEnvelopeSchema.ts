import { z } from "zod";
import {
  REPORT_COLUMN_ALIGNS,
  REPORT_SERIES_TIPOS,
  VALUE_FORMATS,
  type ReportEnvelope,
} from "@gestao-compra/shared";

/**
 * O envelope de relatório é montado no Protheus, então o frontend não tem garantia de compilação
 * sobre ele. Este schema é a fronteira: valida a resposta antes de qualquer renderização, para que
 * um relatório mal serializado falhe com mensagem clara em vez de quebrar a tela.
 *
 * Fica em apps/web porque zod já é dependência daqui e packages/shared não tem dependências
 * de runtime.
 */

const valueFormatSchema = z.enum(VALUE_FORMATS);

const cellValueSchema = z
  .union([z.string(), z.number(), z.boolean(), z.null()])
  .transform((value) => (typeof value === "boolean" ? (value ? "Sim" : "Não") : value));

const kpiSchema = z.object({
  key: z.string().min(1),
  label: z.string(),
  valor: z.union([z.string(), z.number()]),
  formato: valueFormatSchema,
  variacao: z.number().optional(),
});

const seriesSchema = z.object({
  key: z.string().min(1),
  label: z.string(),
  tipo: z.enum(REPORT_SERIES_TIPOS),
  formato: valueFormatSchema.optional(),
  pontos: z
    .array(
      z.object({
        x: z.string(),
        y: z.number(),
      }),
    )
    .default([]),
});

const rankingSchema = z.object({
  key: z.string().min(1),
  label: z.string(),
  formato: valueFormatSchema.optional(),
  itens: z
    .array(
      z.object({
        codigo: z.string(),
        descricao: z.string(),
        valor: z.number(),
      }),
    )
    .default([]),
});

const columnSchema = z.object({
  key: z.string().min(1),
  label: z.string(),
  formato: valueFormatSchema,
  alinhamento: z.enum(REPORT_COLUMN_ALIGNS).optional(),
  largura: z.number().positive().optional(),
});

export const reportEnvelopeSchema = z.object({
  id: z.string().min(1),
  titulo: z.string().default(""),
  kpis: z.array(kpiSchema).default([]),
  series: z.array(seriesSchema).default([]),
  rankings: z.array(rankingSchema).default([]),
  colunas: z.array(columnSchema).default([]),
  linhas: z.array(z.record(z.string(), cellValueSchema)).default([]),
  totais: z.record(z.string(), z.number()).optional(),
  paginacao: z
    .object({
      page: z.number().int().positive(),
      pageSize: z.number().int().positive(),
      hasNext: z.boolean(),
    })
    .optional(),
});

export class ReportEnvelopeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReportEnvelopeError";
  }
}

/**
 * O retorno tipado como ReportEnvelope faz o compilador acusar qualquer divergência entre o
 * schema e o contrato em packages/shared.
 */
export function parseReportEnvelope(input: unknown): ReportEnvelope {
  const result = reportEnvelopeSchema.safeParse(input);

  if (!result.success) {
    const issue = result.error.issues[0];
    const path = issue?.path.join(".");
    const detail = path ? `${path}: ${issue?.message}` : issue?.message;
    throw new ReportEnvelopeError(
      `Resposta do relatório em formato inesperado${detail ? ` (${detail})` : ""}.`,
    );
  }

  return result.data;
}
