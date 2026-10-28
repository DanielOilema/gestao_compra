export const PROTHEUS_PASSWORD_EXPIRED_MESSAGE =
  'É necessário que o usuário efetue a troca de senha';

export const PROTHEUS_PASSWORD_MIN_LENGTH = 8;

export interface ProtheusPasswordRuleResult {
  id: string;
  label: string;
  ok: boolean;
}

export interface ProtheusPasswordValidation {
  ok: boolean;
  errors: string[];
  rules: ProtheusPasswordRuleResult[];
}

function hasUppercase(value: string): boolean {
  return /[A-ZÀ-ÖØ-Þ]/.test(value);
}

function hasLowercase(value: string): boolean {
  return /[a-zà-öø-ÿ]/.test(value);
}

function hasNumber(value: string): boolean {
  return /\d/.test(value);
}

function hasSpecialChar(value: string): boolean {
  return /[^A-Za-zÀ-ÖØ-öø-ÿ0-9]/.test(value);
}

/** Sequência numérica ascendente ou descendente com 3+ dígitos consecutivos (ex.: 123, 987). */
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

export function validateProtheusPassword(password: string): ProtheusPasswordValidation {
  const value = password ?? '';
  const rules: ProtheusPasswordRuleResult[] = [
    {
      id: 'min-length',
      label: `Mínimo de ${PROTHEUS_PASSWORD_MIN_LENGTH} caracteres`,
      ok: value.length >= PROTHEUS_PASSWORD_MIN_LENGTH,
    },
    {
      id: 'uppercase',
      label: 'Pelo menos 1 letra maiúscula',
      ok: hasUppercase(value),
    },
    {
      id: 'lowercase',
      label: 'Pelo menos 1 letra minúscula',
      ok: hasLowercase(value),
    },
    {
      id: 'number',
      label: 'Pelo menos 1 número',
      ok: hasNumber(value),
    },
    {
      id: 'special',
      label: 'Pelo menos 1 caractere especial',
      ok: hasSpecialChar(value),
    },
    {
      id: 'no-sequence',
      label: 'Sem sequência numérica (ex.: 123 ou 987)',
      ok: !hasNumericSequence(value),
    },
  ];

  const errors = rules.filter((rule) => !rule.ok).map((rule) => rule.label);
  return { ok: errors.length === 0, errors, rules };
}
