import type { DebitCreditNote } from "./types/debitCreditNote";

const onlyDigits = (value: string) => value.replace(/\D/g, "");

export const matchesNotaPesquisa = (nota: DebitCreditNote, term: string): boolean => {
  const query = term.trim().toLowerCase();
  if (!query) return true;

  if (nota.numero.toLowerCase().includes(query)) return true;
  if (nota.nomeCliFor.toLowerCase().includes(query)) return true;

  const queryDigits = onlyDigits(term);
  if (queryDigits && onlyDigits(nota.cnpj).includes(queryDigits)) return true;

  return false;
};

export const filterNotasByPesquisa = (
  notas: DebitCreditNote[],
  term: string,
): DebitCreditNote[] => {
  const query = term.trim();
  if (!query) return notas;
  return notas.filter((nota) => matchesNotaPesquisa(nota, query));
};
