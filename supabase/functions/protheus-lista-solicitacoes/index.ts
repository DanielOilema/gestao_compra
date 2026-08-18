import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { protheusUrl } from '../_shared/protheusConfig.ts';
import { parseProtheusJson } from '../_shared/protheusResponse.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const {
      page,
      pageSize,
      filial,
      numSC,
      produto,
      solicitante,
      dtInicial,
      dtFinal,
      accessToken,
      ambiente,
    } = await req.json();

    if (page == null || pageSize == null || !accessToken) {
      return new Response(
        JSON.stringify({ success: false, error: 'page, pageSize e accessToken são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Page e PageSize sempre na URL (contrato Protheus)
    const params = new URLSearchParams({
      Page: String(page),
      PageSize: String(pageSize),
    });

    if (filial?.trim()) params.set('filial', filial.trim());
    if (numSC?.trim()) params.set('numSC', numSC.trim());
    if (produto?.trim()) params.set('produto', produto.trim());
    if (solicitante?.trim()) params.set('solicitante', solicitante.trim());
    if (dtInicial?.trim()) params.set('dtInicial', dtInicial.trim());
    if (dtFinal?.trim()) params.set('dtFinal', dtFinal.trim());

    const baseUrl = protheusUrl('/rest/busca_solicitacoes_compra', ambiente);
    const url = `${baseUrl}?${params.toString()}`;
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
        `Falha ao buscar solicitações (HTTP ${response.status})`;
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
