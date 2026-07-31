export interface TesOption {
  codigo: string;
  descricao: string;
}

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

export const mapProtheusTesResponse = (res: Record<string, unknown>): TesOption[] => {
  const rows = extractArray(res, ['tes', 'tes_saida', 'tessaida', 'items', 'data']);

  return rows
    .filter((row): row is Record<string, unknown> => typeof row === 'object' && row !== null)
    .map((row) => ({
      codigo: readField(row, 'codigo', 'cod', 'tes'),
      descricao: readField(row, 'descricao', 'description', 'nome'),
    }))
    .filter((item) => item.codigo);
};
