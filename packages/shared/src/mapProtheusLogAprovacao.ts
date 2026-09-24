export interface LogAprovacaoEntry {
  filial: string;
  numero: string;
  tipo: string;
  usuario: string;
  status: string;
  nivel: string;
}

const readText = (record: Record<string, unknown>, ...keys: string[]): string => {
  for (const key of keys) {
    const match = Object.entries(record).find(([name]) => name.toLowerCase() === key.toLowerCase());
    if (!match || match[1] == null) continue;
    const value = String(match[1]).trim();
    if (value) return value;
  }
  return '';
};

const extractRows = (res: unknown): unknown[] => {
  if (Array.isArray(res)) return res;

  const record = (res ?? {}) as Record<string, unknown>;
  const preferred = ['log_aprovacao', 'logaprovacao', 'logs', 'items', 'data'];

  for (const key of preferred) {
    const match = Object.entries(record).find(([name]) => name.toLowerCase() === key);
    if (match && Array.isArray(match[1])) return match[1];
  }

  for (const value of Object.values(record)) {
    if (Array.isArray(value)) return value;
  }

  return [];
};

export const mapProtheusLogAprovacao = (res: unknown): LogAprovacaoEntry[] => {
  return extractRows(res)
    .filter((row): row is Record<string, unknown> => typeof row === 'object' && row !== null)
    .map((row) => ({
      filial: readText(row, 'filial'),
      numero: readText(row, 'numero', 'numdoc'),
      tipo: readText(row, 'tipo'),
      usuario: readText(row, 'usuario', 'user'),
      status: readText(row, 'status'),
      nivel: readText(row, 'nivel', 'nível'),
    }))
    .filter((entry) => entry.usuario || entry.status || entry.nivel);
};
