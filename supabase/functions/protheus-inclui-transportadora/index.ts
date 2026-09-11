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
  for (const key of ['mensagem', 'message', 'error', 'descricao']) {
    const value = data[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return undefined;
};

const readCodigo = (data: Record<string, unknown> | null): string | undefined => {
  if (!data) return undefined;
  for (const key of ['codigo', 'code']) {
    const value = data[key];
    if (typeof value === 'string' || typeof value === 'number') {
      const text = String(value).trim();
      if (text) return text;
    }
  }
  return undefined;
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { basicAuth, ambiente, ...payload } = body as Record<string, unknown>;
    const nome = typeof payload.nome === 'string' ? payload.nome.trim() : '';
    const via = typeof payload.via === 'string' ? payload.via.trim() : '';
    const cgc = typeof payload.cgc === 'string' ? payload.cgc.trim() : '';
    const tipoAntt = typeof payload.tipoAntt === 'string' ? payload.tipoAntt.trim() : '';
    const antt = typeof payload.antt === 'string' ? payload.antt.trim() : '';

    if (!isValidBasicAuth(basicAuth) || !nome || !via || !cgc || !tipoAntt || !antt) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `nome, via, cgc, tipoAntt, antt e ${BASIC_AUTH_REQUIRED_MESSAGE}`,
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const protheusPayload = {
      nome,
      nomeReduzido: typeof payload.nomeReduzido === 'string' ? payload.nomeReduzido : '',
      via,
      endereco: typeof payload.endereco === 'string' ? payload.endereco : '',
      bairro: typeof payload.bairro === 'string' ? payload.bairro : '',
      municipio: typeof payload.municipio === 'string' ? payload.municipio : '',
      estado: typeof payload.estado === 'string' ? payload.estado : '',
      cep: typeof payload.cep === 'string' ? payload.cep : '',
      ddd: typeof payload.ddd === 'string' ? payload.ddd : '',
      telefone: typeof payload.telefone === 'string' ? payload.telefone : '',
      cgc,
      tipoAntt,
      inscEstadual: typeof payload.inscEstadual === 'string' ? payload.inscEstadual : '',
      email: typeof payload.email === 'string' ? payload.email : '',
      antt,
      acao: 'incluir',
      codMunicipio: typeof payload.codMunicipio === 'string' ? payload.codMunicipio : '',
      codMun:
        typeof payload.codMun === 'string'
          ? payload.codMun
          : typeof payload.codMunicipio === 'string'
            ? payload.codMunicipio
            : '',
    };

    const response = await fetch(protheusUrl('/rest/crudTransportadora', ambiente), {
      method: 'POST',
      headers: {
        Authorization: basicAuthHeader(basicAuth),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(protheusPayload),
    });

    let data: Record<string, unknown> | null = null;
    try {
      data = await parseProtheusJson(response) as Record<string, unknown> | null;
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
    const codigo = readCodigo(data);

    if (!response.ok || !protheusSuccess) {
      return new Response(
        JSON.stringify({
          success: false,
          error: mensagem || `Falha ao incluir transportadora (HTTP ${response.status})`,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          mensagem: mensagem || 'Transportadora incluída com sucesso',
          codigo,
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
