/** Converte YYYY-MM-DD → DD/MM/AAAA */
export const isoToBrDate = (iso?: string): string => {
  if (!iso) return "";
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!match) return iso;
  return `${match[3]}/${match[2]}/${match[1]}`;
};

/** Converte DD/MM/AAAA → YYYY-MM-DD (ou null se incompleto/inválido) */
export const brDateToIso = (br?: string): string | null => {
  if (!br) return null;
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(br.trim());
  if (!match) return null;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;

  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
};

/** Máscara progressiva para digitar DD/MM/AAAA */
export const maskBrDateInput = (raw: string): string => {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
};
