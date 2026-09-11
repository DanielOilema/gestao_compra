import type { TransportadoraListItem } from './types/transportadora';

const onlyDigits = (value: string) => value.replace(/\D/g, '');

export const matchesTransportadoraPesquisa = (
  item: TransportadoraListItem,
  term: string,
): boolean => {
  const query = term.trim().toLowerCase();
  if (!query) return true;

  if (item.codigo.toLowerCase().includes(query)) return true;
  if (item.nome.toLowerCase().includes(query)) return true;

  const queryDigits = onlyDigits(term);
  if (queryDigits && onlyDigits(item.cgc).includes(queryDigits)) return true;

  return false;
};

export const filterTransportadorasByPesquisa = (
  items: TransportadoraListItem[],
  term: string,
): TransportadoraListItem[] => {
  const query = term.trim();
  if (!query) return items;
  return items.filter((item) => matchesTransportadoraPesquisa(item, query));
};
