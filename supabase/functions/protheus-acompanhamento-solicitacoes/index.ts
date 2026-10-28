import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { protheusUrl } from '../_shared/protheusConfig.ts';
import { parseProtheusJson } from '../_shared/protheusResponse.ts';
import { BASIC_AUTH_REQUIRED_MESSAGE, basicAuthHeader, isValidBasicAuth } from '../_shared/protheusAuth.ts';
import { fetchProtheus, getProtheusAuthError } from '../_shared/protheusFetch.ts';

/** Lista completa. Homologação usa a porta 9559 e produção a 9505, via protheusUrl. */
const ACOMPANHAMENTO_SOLICITACOES_PATH = '/rest/busca_sc_situacao';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { basicAuth, ambiente, codUser, nomeUser } = await req.json();

    if (!isValidBasicAuth(basicAuth)) {
      return new Response(
        JSON.stringify({ success: false, error: BASIC_AUTH_REQUIRED_MESSAGE }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const params = new URLSearchParams();
    if (typeof codUser === 'string' && codUser.trim()) params.set('codUser', codUser.trim());
    if (typeof nomeUser === 'string' && nomeUser.trim()) params.set('nomeUser', nomeUser.trim());
    const query = params.toString();
    const url = `${protheusUrl(ACOMPANHAMENTO_SOLICITACOES_PATH, ambiente)}${query ? `?${query}` : ''}`;
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
        `Falha ao buscar o acompanhamento das solicitações (HTTP ${response.status})`;
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
