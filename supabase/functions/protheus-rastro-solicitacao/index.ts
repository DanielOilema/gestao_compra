import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { protheusUrl } from '../_shared/protheusConfig.ts';
import { parseProtheusJson } from '../_shared/protheusResponse.ts';
import { BASIC_AUTH_REQUIRED_MESSAGE, basicAuthHeader, isValidBasicAuth } from '../_shared/protheusAuth.ts';

const RASTRO_SOLICITACAO_PATH = '/rest/rastro_solicitacao_compra';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { filial, numSc, basicAuth, ambiente } = await req.json();
    const filialValue = typeof filial === 'string' ? filial.trim() : '';
    const numScValue = typeof numSc === 'string' || typeof numSc === 'number' ? String(numSc).trim() : '';

    if (!filialValue || !numScValue || !isValidBasicAuth(basicAuth)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `filial, numSc e ${BASIC_AUTH_REQUIRED_MESSAGE}`,
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const params = new URLSearchParams({
      filial: filialValue,
      numSc: numScValue,
    });

    const baseUrl = protheusUrl(RASTRO_SOLICITACAO_PATH, ambiente);
    const url = `${baseUrl}?${params.toString()}`;
    const response = await fetch(url, {
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
        `Falha ao buscar o rastro da solicitação (HTTP ${response.status})`;
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
