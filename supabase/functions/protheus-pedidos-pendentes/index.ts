import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { protheusUrl } from '../_shared/protheusConfig.ts';
import { parseProtheusJson } from '../_shared/protheusResponse.ts';
import { BASIC_AUTH_REQUIRED_MESSAGE, basicAuthHeader, isValidBasicAuth } from '../_shared/protheusAuth.ts';
import { fetchProtheus, getProtheusAuthError } from '../_shared/protheusFetch.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { aprovador, basicAuth, ambiente } = await req.json();

    if (!aprovador || !isValidBasicAuth(basicAuth)) {
      return new Response(
        JSON.stringify({ success: false, error: `Aprovador e ${BASIC_AUTH_REQUIRED_MESSAGE}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const baseUrl = protheusUrl('/rest/busca_pc_pendentes', ambiente);
    const url = `${baseUrl}?Aprovador=${encodeURIComponent(aprovador)}`;
    const response = await fetchProtheus(url, {
      method: 'GET',
      headers: {
        Authorization: basicAuthHeader(basicAuth),
        'Content-Type': 'application/json',
      },
    });

    let data: any = null;
    try {
      data = await parseProtheusJson(response);
    } catch {
      // ignore
    }

    const authError = getProtheusAuthError(response, data);
    if (authError) {
      return new Response(
        JSON.stringify({ success: false, error: authError }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    if (!response.ok) {
      return new Response(
        JSON.stringify({
          success: false,
          error: data?.message || `Falha ao buscar pedidos (HTTP ${response.status})`,
        }),
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
