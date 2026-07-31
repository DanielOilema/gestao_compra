const DEFAULT_PROTHEUS_BASE_URL = 'http://192.168.200.2:9559';

export function getProtheusBaseUrl(): string {
  const configured = Deno.env.get('PROTHEUS_BASE_URL')?.trim();
  if (!configured) return DEFAULT_PROTHEUS_BASE_URL;
  return configured.replace(/\/+$/, '');
}

export function protheusUrl(path: string): string {
  const base = getProtheusBaseUrl();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}
