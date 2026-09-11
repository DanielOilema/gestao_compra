import type { GrupoSolicitacao } from './types/relatorioScSetores';

const t = (v: unknown) => (typeof v === 'string' ? v.trim() : '');

const readField = (record: Record<string, unknown>, ...keys: string[]): string => {
  for (const key of keys) {
    const match = Object.entries(record).find(([k]) => k.toLowerCase() === key.toLowerCase());
    if (match) {
      const value = t(match[1]);
      if (value) return value;
    }
  }
  return '';
};

const extractArray = (res: Record<string, unknown>, preferredKeys: string[]): unknown[] => {
  if (Array.isArray(res)) return res;

  for (const key of preferredKeys) {
    const match = Object.entries(res).find(([k]) => k.toLowerCase() === key.toLowerCase());
    if (match && Array.isArray(match[1])) return match[1];
  }

  for (const value of Object.values(res)) {
    if (Array.isArray(value)) return value;
  }

  return [];
};

export const mapProtheusGruposSolicitacoes = (res: unknown): GrupoSolicitacao[] => {
  const record = Array.isArray(res)
    ? { grupos_solicitacoes: res }
    : ((res ?? {}) as Record<string, unknown>);

  const rows = extractArray(record, ['grupos_solicitacoes', 'grupos', 'items', 'data']);

  return rows
    .filter((row): row is Record<string, unknown> => typeof row === 'object' && row !== null)
    .map((row) => ({
      codigo: readField(row, 'codigo', 'code', 'grupo'),
      descricao: readField(row, 'descricao', 'description', 'nome'),
    }))
    .filter((grupo) => grupo.codigo);
};
