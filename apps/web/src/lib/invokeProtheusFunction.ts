import { FunctionsHttpError } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { handleSessionExpired } from "@/lib/sessionExpired";
import { readStoredProtheusAmbiente } from "@/lib/protheusAmbienteStorage";

interface ProtheusInvokeResponse {
  success?: boolean;
  error?: string;
  data?: unknown;
}

async function readInvokeErrorMessage(error: unknown, fallback: string): Promise<string> {
  if (error instanceof FunctionsHttpError) {
    try {
      const payload = (await error.context.json()) as ProtheusInvokeResponse | null;
      if (payload?.error?.trim()) {
        return payload.error.trim();
      }
    } catch {
      // ignore JSON parse failures
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}

export async function invokeProtheusFunction<T = unknown>(
  functionName: string,
  body: Record<string, unknown>,
  defaultError = "Falha na comunicação com o Protheus",
): Promise<T> {
  const ambiente = readStoredProtheusAmbiente();
  const { data, error } = await supabase.functions.invoke(functionName, {
    body: { ...body, ambiente },
  });

  if (error) {
    const message = await readInvokeErrorMessage(error, defaultError);
    handleSessionExpired(message);
    throw new Error(message);
  }

  const response = (data ?? null) as ProtheusInvokeResponse | null;

  if (!response?.success) {
    const message = response?.error || defaultError;
    handleSessionExpired(message);
    throw new Error(message);
  }

  return response.data as T;
}
