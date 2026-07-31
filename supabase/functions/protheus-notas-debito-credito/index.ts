import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { protheusUrl } from '../_shared/protheusConfig.ts';
import { parseProtheusJson } from '../_shared/protheusResponse.ts';

const BASE_URL = protheusUrl('/rest/busca_notas_deb_cred');

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const {
      page,
      pageSize,
      tipo,
      cliFor,
      filtro,
      dtInicial,
      dtFinal,
      accessToken,
    } = await req.json();

    if (page == null || pageSize == null || !accessToken) {
      return new Response(
        JSON.stringify({ success: false, error: 'page, pageSize e accessToken são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const params = new URLSearchParams({
      Page: String(page),
      PageSize: String(pageSize),
    });

    if (tipo?.trim()) params.set('tipo', tipo.trim());
    if (cliFor?.trim()) params.set('cliFor', cliFor.trim());
    if (filtro?.trim()) params.set('filtro', filtro.trim());
    if (dtInicial?.trim()) params.set('dtInicial', dtInicial.trim());
    if (dtFinal?.trim()) params.set('dtFinal', dtFinal.trim());

    const url = `${BASE_URL}?${params.toString()}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
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
        `Falha ao buscar notas (HTTP ${response.status})`;
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
