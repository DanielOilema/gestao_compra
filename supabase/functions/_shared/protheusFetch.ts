import { PROTHEUS_PASSWORD_EXPIRED_MESSAGE } from './protheusPasswordPolicy.ts';

export const PROTHEUS_SESSION_EXPIRED_MESSAGE =
  'Sessão expirada. Faça login novamente.';

/** Mensagem reconhecida pelo front (handleSessionExpired) para forçar logout + tela de login. */
export const PROTHEUS_PASSWORD_EXPIRED_LOGIN_MESSAGE =
  `${PROTHEUS_PASSWORD_EXPIRED_MESSAGE}. Faça login novamente.`;

export async function fetchProtheus(
  input: string | URL,
  init?: RequestInit,
): Promise<Response> {
  return fetch(input, {
    ...init,
    redirect: 'manual',
    signal: init?.signal ?? AbortSignal.timeout(20_000),
  });
}

export function isPasswordExpiredResponse(
  response: Response,
  bodyText = '',
): boolean {
  const location = (response.headers.get('location') ?? '').toLowerCase();
  if (location.includes('changepassworduserservice')) return true;

  if (
    (response.status === 302 || response.status === 303 || response.status === 307) &&
    location.includes('changepassword')
  ) {
    return true;
  }

  // Em alguns runtimes o redirect manual vira resposta opaca (status 0).
  if (response.status === 0) return true;

  const normalized = bodyText.toLowerCase();
  return (
    normalized.includes('troca de senha') ||
    normalized.includes('changepassword')
  );
}

export function getProtheusAuthError(
  response: Response,
  data?: unknown,
  bodyText = '',
): string | null {
  if (isPasswordExpiredResponse(response, bodyText)) {
    return PROTHEUS_PASSWORD_EXPIRED_LOGIN_MESSAGE;
  }

  if (response.status === 401 || (data as { code?: number } | null)?.code === 401) {
    return PROTHEUS_SESSION_EXPIRED_MESSAGE;
  }

  return null;
}
