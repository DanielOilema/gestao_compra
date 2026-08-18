import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { protheusUrl } from '../_shared/protheusConfig.ts';
import { readProtheusText } from '../_shared/protheusResponse.ts';
import { requirePermission, PermissionError } from '../_shared/checkPermission.ts';

// Extrai o primeiro objeto JSON válido de um texto que pode conter JSON
// duplicado/concatenado (ex.: `{"success":"true"}{"success":"true"}`).
const extractFirstJson = (raw: string): any => {
  if (!raw) return null;
  // tentativa direta
  try {
    return JSON.parse(raw);
  } catch {
    // ignore
  }
  // varre buscando primeiro objeto balanceado
  let depth = 0;
  let start = -1;
  let inStr = false;
  let escape = false;
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    if (inStr) {
      if (escape) escape = false;
      else if (ch === '\\') escape = true;
      else if (ch === '"') inStr = false;
      continue;
    }
    if (ch === '"') { inStr = true; continue; }
    if (ch === '{') {
      if (depth === 0) start = i;
      depth++;
    } else if (ch === '}') {
      depth--;
      if (depth === 0 && start >= 0) {
        const candidate = raw.slice(start, i + 1);
        try { return JSON.parse(candidate); } catch { /* continue */ }
        start = -1;
      }
    }
  }
  // fallback regex para extrair campos isolados
  const sMatch = raw.match(/"success"\s*:\s*"?(true|false)"?/i);
  const mMatch = raw.match(/"message"\s*:\s*"((?:[^"\\]|\\.)*)"/);
  if (sMatch || mMatch) {
    return {
      success: sMatch ? sMatch[1].toLowerCase() === 'true' : undefined,
      message: mMatch ? mMatch[1].replace(/\\"/g, '"') : undefined,
    };
  }
  return null;
};

const normalizeSuccess = (value: unknown): boolean => {
  if (value === true) return true;
  if (typeof value === 'string') return value.trim().toLowerCase() === 'true';
  if (typeof value === 'number') return value === 1;
  return false;
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { filial, numero, tipo, user, acao, observacao, accessToken, ambiente } = await req.json();

    if (!filial || !numero || !tipo || !user || !acao || !accessToken) {
      return new Response(
        JSON.stringify({ success: false, error: 'Campos obrigatórios ausentes' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    try {
      await requirePermission(user, 'aprovacoes');
    } catch (err) {
      if (err instanceof PermissionError) {
        return new Response(
          JSON.stringify({ success: false, error: err.message }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }
      throw err;
    }

    const response = await fetch(protheusUrl('/rest/AprovaCompra', ambiente), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ filial, numero, tipo, user, acao, observacao: observacao ?? '' }),
    });

    const rawText = await readProtheusText(response);
    const data = extractFirstJson(rawText);
    console.log('[protheus-aprova-compra] status:', response.status, 'body:', rawText, 'parsed:', JSON.stringify(data));

    if (response.status === 401 || data?.code === 401) {
      return new Response(
        JSON.stringify({ success: false, error: 'Sessão expirada. Faça login novamente.' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const protheusSuccess = normalizeSuccess(data?.success);
    const protheusMessage: string | undefined =
      typeof data?.message === 'string' && data.message.trim().length > 0
        ? data.message
        : undefined;

    if (!protheusSuccess) {
      return new Response(
        JSON.stringify({
          success: false,
          message: protheusMessage,
          error: protheusMessage || `Falha ao processar ação (HTTP ${response.status})`,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: protheusMessage, data }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({ success: false, error: `Não foi possível conectar ao Protheus: ${message}` }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
