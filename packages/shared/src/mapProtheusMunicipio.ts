export interface MunicipioOption {
  codMun: string;
  municipio: string;
  estado: string;
}

const t = (v: unknown) => {
  if (v == null) return '';
  if (typeof v === 'string') return v.trim();
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  return '';
};

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

export const mapProtheusMunicipioResponse = (res: unknown): MunicipioOption[] => {
  const record = Array.isArray(res)
    ? { municipios: res }
    : ((res ?? {}) as Record<string, unknown>);

  const rows = extractArray(record, ['MUNICIPIOS', 'municipios', 'municipio', 'items', 'data']);

  return rows
    .filter((row): row is Record<string, unknown> => typeof row === 'object' && row !== null)
    .map((row) => ({
      codMun: readField(row, 'codMun', 'codmun', 'codMunicipio', 'codmunicipio', 'codigo', 'cod'),
      municipio: readField(row, 'municipio', 'nome', 'descricao', 'mun'),
      estado: readField(row, 'estado', 'uf').toUpperCase(),
    }))
    .filter((item) => item.codMun && item.municipio);
};

export const municipioOptionKey = (item: Pick<MunicipioOption, 'codMun' | 'estado'>): string =>
  `${item.codMun}|${item.estado}`;

export const municipioOptionLabel = (item: Pick<MunicipioOption, 'municipio' | 'estado'>): string =>
  item.estado ? `${item.municipio} - ${item.estado}` : item.municipio;
