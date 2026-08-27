// Mantenha em sincronia com packages/shared/src/protheusUserName.ts
export const PROTHEUS_EMAIL_LOGIN_BLOCKED_MESSAGE =
  'Use o nome de usuário do Protheus, não o e-mail.';

export function looksLikeEmail(login: string): boolean {
  return login.trim().includes('@');
}
