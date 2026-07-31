export interface ProtheusResult {
  success: boolean;
  message?: string;
}

export const normalizeProtheusSuccess = (value: unknown): boolean => {
  if (value === true) return true;
  if (typeof value === 'string') {
    return value.trim().toLowerCase() === 'true';
  }
  if (typeof value === 'number') return value === 1;
  return false;
};

export const parseProtheusResult = (data: Record<string, unknown>): ProtheusResult => {
  const success = normalizeProtheusSuccess(data?.success);
  const message =
    (typeof data?.message === 'string' && data.message.trim().length > 0 && data.message) ||
    (typeof data?.error === 'string' && data.error.trim().length > 0 && data.error) ||
    undefined;
  return { success, message: message || undefined };
};
