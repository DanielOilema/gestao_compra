import { fetchProtheus, getProtheusAuthError } from '../_shared/protheusFetch.ts';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { protheusUrl } from '../_shared/protheusConfig.ts';
import { parseProtheusJson } from '../_shared/protheusResponse.ts';
import { BASIC_AUTH_REQUIRED_MESSAGE, basicAuthHeader, isValidBasicAuth } from '../_shared/protheusAuth.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { filial, tipo, codigo, basicAuth, ambiente } = await req.json();

    if (!filial?.trim() || !tipo?.trim() || !codigo?.trim() || !isValidBasicAuth(basicAuth)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `filial, tipo, codigo e ${BASIC_AUTH_REQUIRED_MESSAGE}`,
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const params = new URLSearchParams({
      filial: String(filial).trim(),
      tipo: String(tipo).trim(),
      codigo: String(codigo).trim(),
    });

    const baseUrl = protheusUrl('/rest/detalhe_nota_deb_cred', ambiente);
    const url = `${baseUrl}?${params.toString()}`;
    const response = await fetchProtheus(url, {
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

    const authError = getProtheusAuthError(response, data);
    if (authError) {
      return new Response(
        JSON.stringify({ success: false, error: authError }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    if (!response.ok) {
      const message =
        (data as { message?: string })?.message ||
        `Falha ao buscar detalhe da nota (HTTP ${response.status})`;
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
