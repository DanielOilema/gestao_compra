const SESSION_EXPIRED_PATTERNS = [
  "sessão expirada",
  "sessao expirada",
  "sessão inválida",
  "sessao invalida",
  "faça login novamente",
  "faca login novamente",
  "troca de senha",
  "senha expirada",
  "changepassword",
];

export const isSessionExpiredMessage = (message?: string | null): boolean => {
  if (!message?.trim()) return false;
  const normalized = message.trim().toLowerCase();
  return SESSION_EXPIRED_PATTERNS.some((pattern) => normalized.includes(pattern));
};

type SessionExpiredHandler = (message?: string) => void;

let sessionExpiredHandler: SessionExpiredHandler | null = null;

export const registerSessionExpiredHandler = (handler: SessionExpiredHandler | null) => {
  sessionExpiredHandler = handler;
};

export const handleSessionExpired = (message?: string | null): boolean => {
  if (!isSessionExpiredMessage(message)) return false;
  sessionExpiredHandler?.(message ?? undefined);
  return true;
};
