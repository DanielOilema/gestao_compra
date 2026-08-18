const DEFAULT_PROTHEUS_BASE_URL = 'http://192.168.200.2:9559';
const PROD_PORT = 9505;

export type ProtheusAmbiente = 'homologacao' | 'producao';

export function normalizeProtheusAmbiente(value: unknown): ProtheusAmbiente {
  if (typeof value === 'string' && value.trim().toLowerCase() === 'producao') {
    return 'producao';
  }
  return 'homologacao';
}

function stripTrailingSlashes(url: string): string {
  return url.replace(/\/+$/, '');
}

function replaceUrlPort(baseUrl: string, port: number): string {
  try {
    const url = new URL(baseUrl);
    url.port = String(port);
    return stripTrailingSlashes(url.toString());
  } catch {
    return stripTrailingSlashes(baseUrl.replace(/:\d+(?=\/?$)/, `:${port}`));
  }
}

function getConfiguredHomologBaseUrl(): string {
  const configured = Deno.env.get('PROTHEUS_BASE_URL')?.trim();
  if (!configured) return DEFAULT_PROTHEUS_BASE_URL;
  return stripTrailingSlashes(configured);
}

export function getProtheusBaseUrl(ambiente?: unknown): string {
  const env = normalizeProtheusAmbiente(ambiente);
  const homologBase = getConfiguredHomologBaseUrl();

  if (env === 'producao') {
    const configuredProd = Deno.env.get('PROTHEUS_BASE_URL_PROD')?.trim();
    if (configuredProd) return stripTrailingSlashes(configuredProd);
    return replaceUrlPort(homologBase, PROD_PORT);
  }

  return homologBase;
}

export function protheusUrl(path: string, ambiente?: unknown): string {
  const base = getProtheusBaseUrl(ambiente);
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}
