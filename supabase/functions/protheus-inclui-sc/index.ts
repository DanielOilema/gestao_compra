import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { protheusUrl } from '../_shared/protheusConfig.ts';
import { parseProtheusJson } from '../_shared/protheusResponse.ts';
import { BASIC_AUTH_REQUIRED_MESSAGE, basicAuthHeader, isValidBasicAuth } from '../_shared/protheusAuth.ts';

const normalizeSuccess = (value: unknown): boolean => {
  if (value === true) return true;
  if (typeof value === 'string') return value.trim().toLowerCase() === 'true';
  if (typeof value === 'number') return value === 1;
  return false;
};

const readMessage = (data: Record<string, unknown> | null): string | undefined => {
  if (!data) return undefined;
  for (const key of ['mensagem', 'message', 'error']) {
    const value = data[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return undefined;
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { basicAuth, filial, solicitante, tipoCompra, itens, ambiente, numeroSC } = body;
    const acao = Number(body.acao) === 4 ? 4 : 3;

    if (!isValidBasicAuth(basicAuth) || !filial || !solicitante || !tipoCompra || !Array.isArray(itens) || itens.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `filial, solicitante, tipoCompra, itens e ${BASIC_AUTH_REQUIRED_MESSAGE}`,
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    if (acao === 4 && !numeroSC) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'numeroSC é obrigatório para alteração da solicitação',
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const payload =
      acao === 4
        ? { filial, solicitante, tipoCompra, itens, acao, numeroSC }
        : { filial, solicitante, tipoCompra, itens, acao };

    const response = await fetch(protheusUrl('/rest/incluiSC', ambiente), {
      method: 'POST',
      headers: {
        Authorization: basicAuthHeader(basicAuth),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    let data: Record<string, unknown> | null = null;
    try {
      data = await parseProtheusJson(response);
    } catch {
      // ignore
    }

    if (response.status === 401 || data?.code === 401) {
      return new Response(
        JSON.stringify({ success: false, error: 'Sessão expirada. Faça login novamente.' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const protheusSuccess =
      normalizeSuccess(data?.sucesso) || normalizeSuccess(data?.success);
    const mensagem = readMessage(data);
    const numeroRetorno =
      typeof data?.numeroSC === 'string' || typeof data?.numeroSC === 'number'
        ? String(data.numeroSC)
        : acao === 4
          ? String(numeroSC)
          : undefined;

    if (!response.ok || !protheusSuccess) {
      return new Response(
        JSON.stringify({
          success: false,
          error: mensagem || `Falha ao ${acao === 4 ? 'alterar' : 'incluir'} solicitação (HTTP ${response.status})`,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          mensagem: mensagem || (acao === 4
            ? 'Solicitação de compra alterada com sucesso'
            : 'Solicitação de compra incluída com sucesso'),
          numeroSC: numeroRetorno,
        },
      }),
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
