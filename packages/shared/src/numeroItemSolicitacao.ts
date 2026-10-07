const ITEM_NUMERO_WIDTH = 4;

export function formatNumeroItem(n: number): string {
  return String(Math.max(1, Math.trunc(n))).padStart(ITEM_NUMERO_WIDTH, "0");
}

export function parseNumeroItem(value?: string | null): number | null {
  const trimmed = value?.trim() ?? "";
  if (!/^\d+$/.test(trimmed)) return null;
  const n = Number(trimmed);
  return n > 0 ? n : null;
}

export function maxNumeroItem(itens: { item?: string }[], reserved = 0): number {
  return itens.reduce((acc, row) => {
    const n = parseNumeroItem(row.item);
    return n != null && n > acc ? n : acc;
  }, reserved);
}

export function nextNumeroItem(itens: { item?: string }[], reservedMax = 0): string {
  return formatNumeroItem(maxNumeroItem(itens, reservedMax) + 1);
}

/**
 * Inclusão: renumera 0001..n na ordem atual.
 * Alteração: preserva o número já carregado e continua após o maior número conhecido,
 * inclusive itens removidos (`reservedMax`).
 */
export function assignNumerosItens<T extends { item?: string }>(
  itens: T[],
  options?: { preserveExisting?: boolean; reservedMax?: number },
): T[] {
  if (!options?.preserveExisting) {
    return itens.map((item, index) => ({
      ...item,
      item: formatNumeroItem(index + 1),
    }));
  }

  let max = options.reservedMax ?? 0;
  const parsed = itens.map((item) => {
    const n = parseNumeroItem(item.item);
    if (n != null) max = Math.max(max, n);
    return n;
  });

  return itens.map((item, index) => {
    const existing = parsed[index];
    if (existing != null) {
      return { ...item, item: formatNumeroItem(existing) };
    }
    max += 1;
    return { ...item, item: formatNumeroItem(max) };
  });
}
