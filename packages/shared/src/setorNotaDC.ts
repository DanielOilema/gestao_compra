export interface SetorNotaDCOption {
  codigo: string;
  descricao: string;
}

export const SETOR_NOTA_DC_OPTIONS: SetorNotaDCOption[] = [
  { codigo: "001", descricao: "COMERCIAL" },
  { codigo: "002", descricao: "CONTAB/CONTROL" },
  { codigo: "003", descricao: "FINANCEIRO" },
  { codigo: "004", descricao: "LOGISTICA" },
  { codigo: "005", descricao: "MARKETING" },
  { codigo: "006", descricao: "PRODUCAO" },
  { codigo: "007", descricao: "RH" },
  { codigo: "008", descricao: "T.I." },
  { codigo: "009", descricao: "LEGALIDADE" },
  { codigo: "010", descricao: "COMPRAS" },
  { codigo: "011", descricao: "ADMINISTRATIVO" },
  { codigo: "012", descricao: "FATURAMENTO" },
];

export const getSetorNotaDCLabel = (codigo: string): string => {
  const option = SETOR_NOTA_DC_OPTIONS.find((item) => item.codigo === codigo);
  return option ? `${option.codigo} - ${option.descricao}` : codigo;
};

export const getSetorNotaDCCodigo = (value?: string): string => {
  if (!value?.trim()) return "";
  const normalized = value.trim();
  const byCode = SETOR_NOTA_DC_OPTIONS.find((item) => item.codigo === normalized);
  if (byCode) return byCode.codigo;
  const byDescricao = SETOR_NOTA_DC_OPTIONS.find(
    (item) => item.descricao.toUpperCase() === normalized.toUpperCase(),
  );
  return byDescricao?.codigo ?? normalized;
};

export const getSetorNotaDCDescricao = (value?: string): string => {
  if (!value?.trim()) return "";
  const normalized = value.trim();
  const byCode = SETOR_NOTA_DC_OPTIONS.find((item) => item.codigo === normalized);
  if (byCode) return byCode.descricao;
  const byDescricao = SETOR_NOTA_DC_OPTIONS.find(
    (item) => item.descricao.toUpperCase() === normalized.toUpperCase(),
  );
  return byDescricao?.descricao ?? normalized;
};
