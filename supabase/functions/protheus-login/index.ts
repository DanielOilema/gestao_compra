import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { getProtheusBaseUrl, normalizeProtheusAmbiente, protheusUrl } from '../_shared/protheusConfig.ts';
import { parseProtheusJson } from '../_shared/protheusResponse.ts';

function sanitizeErrorMessage(message: string): string {
  return message.replace(/password=[^&\s)]*/gi, 'password=***');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  let selectedAmbiente = normalizeProtheusAmbiente(undefined);

  try {
    const { username, password, ambiente } = await req.json();
    selectedAmbiente = normalizeProtheusAmbiente(ambiente);

    if (!username || !password) {
      return new Response(
        JSON.stringify({ success: false, error: 'Usuário e senha são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const tokenUrl = new URL(protheusUrl('/rest/api/oauth2/v1/token', selectedAmbiente));
    tokenUrl.searchParams.set('grant_type', 'password');

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        username,
        password,
        'Content-Type': 'application/json',
      },
    });

    let data: any = null;
    try {
      data = await parseProtheusJson(response);
    } catch {
      // ignore
    }

    if (data?.access_token) {
      return new Response(
        JSON.stringify({ success: true, access_token: data.access_token, raw: data }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    if (data?.code === 401 || response.status === 401) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Não foi possível realizar o login para o usuário ${username}`,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: data?.message || `Falha ao autenticar no Protheus (HTTP ${response.status})`,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    const message = sanitizeErrorMessage(
      err instanceof Error ? err.message : 'Erro desconhecido',
    );
    const baseUrl = getProtheusBaseUrl(selectedAmbiente);
    return new Response(
      JSON.stringify({
        success: false,
        error: `Não foi possível conectar ao Protheus (${selectedAmbiente}: ${baseUrl}): ${message}`,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
