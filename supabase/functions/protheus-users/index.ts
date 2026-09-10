import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { protheusUrl } from '../_shared/protheusConfig.ts';
import { parseProtheusJson } from '../_shared/protheusResponse.ts';
import { BASIC_AUTH_REQUIRED_MESSAGE, basicAuthHeader, isValidBasicAuth } from '../_shared/protheusAuth.ts';

function getUsersPath(): string {
  return Deno.env.get('PROTHEUS_USERS_PATH')?.trim() || '/rest/users';
}

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

    const response = await fetch(protheusUrl(getUsersPath(), ambiente), {
      method: 'GET',
      headers: {
        Authorization: basicAuthHeader(basicAuth),
        'Content-Type': 'application/json',
      },
    });

    let data: unknown = null;
    try {
      data = await parseProtheusJson(response);
    } catch {
      // ignore
    }

    if (response.status === 401 || (data as { code?: number })?.code === 401) {
      return new Response(
        JSON.stringify({ success: false, error: 'Sessão expirada. Faça login novamente.' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    if (!response.ok) {
      const message =
        (data as { message?: string })?.message ||
        `Falha ao buscar usuários (HTTP ${response.status})`;
      return new Response(
        JSON.stringify({ success: false, error: message }),
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
