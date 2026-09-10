export const BASIC_AUTH_REQUIRED_MESSAGE = 'basicAuth é obrigatório';

export function isValidBasicAuth(basicAuth: unknown): basicAuth is string {
  return typeof basicAuth === 'string' && basicAuth.trim().length > 0;
}

export function basicAuthHeader(basicAuth: unknown): string {
  if (!isValidBasicAuth(basicAuth)) {
    throw new Error(BASIC_AUTH_REQUIRED_MESSAGE);
  }
  return `Basic ${basicAuth.trim()}`;
}
