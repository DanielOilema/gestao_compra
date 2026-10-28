import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { protheusUrl } from '../_shared/protheusConfig.ts';
import { parseProtheusJson } from '../_shared/protheusResponse.ts';
import { BASIC_AUTH_REQUIRED_MESSAGE, basicAuthHeader, isValidBasicAuth } from '../_shared/protheusAuth.ts';
import { fetchProtheus, getProtheusAuthError } from '../_shared/protheusFetch.ts';

const readErrorMessage = (data: unknown): string | undefined => {
  if (!data || typeof data !== 'object') return undefined;
  const record = data as Record<string, unknown>;
  for (const key of ['error', 'mensagem', 'message', 'descricao']) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return undefined;
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { basicAuth, ambiente } = await req.json();

    if (!isValidBasicAuth(basicAuth)) {
      return new Response(
        JSON.stringify({ success: false, error: BASIC_AUTH_REQUIRED_MESSAGE }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const url = protheusUrl('/rest/busca_filiais', ambiente);
    const response = await fetchProtheus(url, {
      method: 'GET',
      headers: {
        Authorization: basicAuthHeader(basicAuth),
        'Content-Type': 'application/json',
      },
    });

    let data: unknown = null;
    let parseError: string | undefined;
    try {
      data = await parseProtheusJson(response);
    } catch (err) {
      parseError = err instanceof Error ? err.message : 'Resposta inválida do Protheus';
    }

    const authError = getProtheusAuthError(response, data);
    if (authError) {
      return new Response(
        JSON.stringify({ success: false, error: authError }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    if (!response.ok) {
      const message =
        readErrorMessage(data) ||
        parseError ||
        `Falha ao buscar filiais (HTTP ${response.status})`;
      return new Response(
        JSON.stringify({ success: false, error: message }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    if (parseError) {
      return new Response(
        JSON.stringify({ success: false, error: `Falha ao interpretar filiais: ${parseError}` }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    return new Response(
      JSON.stringify({ success: true, data }),
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
