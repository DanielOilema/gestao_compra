export interface FilialOption {
  codigo: string;
  nome: string;
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

export const mapProtheusFiliaisResponse = (res: Record<string, unknown>): FilialOption[] => {
  const rows = extractArray(res, ['filiais', 'FILIAIS', 'items', 'data']);

  return rows
    .filter((row): row is Record<string, unknown> => typeof row === 'object' && row !== null)
    .map((row) => ({
      codigo: readField(row, 'codigo', 'code', 'filial'),
      nome: readField(row, 'nome', 'name', 'descricao', 'description'),
    }))
    .filter((f) => f.codigo);
};
