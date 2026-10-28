// Mantenha em sincronia com packages/shared/src/protheusPasswordPolicy.ts
export const PROTHEUS_PASSWORD_EXPIRED_MESSAGE =
  'É necessário que o usuário efetue a troca de senha';

export const PROTHEUS_PASSWORD_MIN_LENGTH = 8;

export function hasNumericSequence(password: string): boolean {
  for (let i = 0; i < password.length - 2; i++) {
    const a = password.charCodeAt(i);
    const b = password.charCodeAt(i + 1);
    const c = password.charCodeAt(i + 2);
    const isDigit = (code: number) => code >= 48 && code <= 57;
    if (!isDigit(a) || !isDigit(b) || !isDigit(c)) continue;

    const ascending = b === a + 1 && c === b + 1;
    const descending = b === a - 1 && c === b - 1;
    if (ascending || descending) return true;
  }
  return false;
}

export function validateProtheusPassword(password: string): { ok: boolean; errors: string[] } {
  const value = password ?? '';
  const errors: string[] = [];

  if (value.length < PROTHEUS_PASSWORD_MIN_LENGTH) {
    errors.push(`Mínimo de ${PROTHEUS_PASSWORD_MIN_LENGTH} caracteres`);
  }
  if (!/[A-ZÀ-ÖØ-Þ]/.test(value)) {
    errors.push('Pelo menos 1 letra maiúscula');
  }
  if (!/[a-zà-öø-ÿ]/.test(value)) {
    errors.push('Pelo menos 1 letra minúscula');
  }
  if (!/\d/.test(value)) {
    errors.push('Pelo menos 1 número');
  }
  if (!/[^A-Za-zÀ-ÖØ-öø-ÿ0-9]/.test(value)) {
    errors.push('Pelo menos 1 caractere especial');
  }
  if (hasNumericSequence(value)) {
    errors.push('Sem sequência numérica (ex.: 123 ou 987)');
  }

  return { ok: errors.length === 0, errors };
}
