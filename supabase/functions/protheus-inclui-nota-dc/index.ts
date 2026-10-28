import { fetchProtheus, getProtheusAuthError } from '../_shared/protheusFetch.ts';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { protheusUrl } from '../_shared/protheusConfig.ts';
import { parseProtheusJson } from '../_shared/protheusResponse.ts';
import { BASIC_AUTH_REQUIRED_MESSAGE, basicAuthHeader, isValidBasicAuth } from '../_shared/protheusAuth.ts';

const FORMA_PAGAMENTO_CREDITO = '6';
const FORMAS_DEBITO = new Set(['1', '2', '3', '4', '5']);

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

const normalizeSuccess = (value: unknown): boolean => {
  if (value === true) return true;
  if (typeof value === 'string') return value.trim().toLowerCase() === 'true';
  if (typeof value === 'number') return value === 1;
  return false;
};

const readMessage = (data: Record<string, unknown> | null): string | undefined => {
  if (!data) return undefined;
  for (const key of ['descricao', 'mensagem', 'message', 'error']) {
    const value = data[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return undefined;
};

const readCodigoNota = (data: Record<string, unknown> | null): string | undefined => {
  if (!data) return undefined;
  for (const key of ['codigoNota', 'codigonota', 'numero', 'numeroNota']) {
    const value = data[key];
    if (typeof value === 'string' || typeof value === 'number') {
      const text = String(value).trim();
      if (text) return text;
    }
  }
  return undefined;
};

const parseMessagesResponse = (
  data: unknown,
): { success: boolean; descricao?: string; codigoNota?: string } => {
  if (!data || typeof data !== 'object') {
    return { success: false };
  }

  const record = data as Record<string, unknown>;
  const messages = Array.isArray(record.messages) ? record.messages : [];
  const first = messages.find((item) => typeof item === 'object' && item !== null);

  if (first && typeof first === 'object') {
    const message = first as Record<string, unknown>;
    return {
      success: normalizeSuccess(message.result),
      descricao: readMessage(message),
      codigoNota: readCodigoNota(message),
    };
  }

  return {
    success: normalizeSuccess(record.sucesso) || normalizeSuccess(record.success),
    descricao: readMessage(record),
    codigoNota: readCodigoNota(record),
  };
};

const validatePagamento = (det: Record<string, unknown>): string | null => {
  const tipo = typeof det.tipo === 'string' ? det.tipo.trim().toUpperCase() : '';
  const forma = typeof det.condPagto === 'string' ? det.condPagto.trim() : '';

  if (!forma) return 'condPagto é obrigatório';

  if (tipo === 'C' && forma !== FORMA_PAGAMENTO_CREDITO) {
    return 'Notas de crédito devem usar forma de pagamento Crédito (6)';
  }

  if (tipo === 'D') {
    if (forma === FORMA_PAGAMENTO_CREDITO) {
      return 'Notas de débito não podem usar forma de pagamento Crédito (6)';
    }
    if (!FORMAS_DEBITO.has(forma)) {
      return 'Forma de pagamento inválida para nota de débito';
    }
  }

  if (forma === '4') {
    const banco = typeof det.banco === 'string' ? det.banco.trim() : '';
    const agencia = typeof det.agencia === 'string' ? det.agencia.trim() : '';
    const conta = typeof det.conta === 'string' ? det.conta.trim() : '';
    if (!banco) return 'Banco é obrigatório para pagamento por depósito';
    if (!agencia) return 'Agência é obrigatória para pagamento por depósito';
    if (!conta) return 'Conta é obrigatória para pagamento por depósito';
  }

  return null;
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { basicAuth, detNotaDebCre, ambiente } = body;

    if (
      !isValidBasicAuth(basicAuth) ||
      !detNotaDebCre ||
      typeof detNotaDebCre !== 'object' ||
      !detNotaDebCre.filial ||
      !detNotaDebCre.tipo ||
      !detNotaDebCre.clifor ||
      !detNotaDebCre.loja ||
      !Array.isArray(detNotaDebCre.itens) ||
      detNotaDebCre.itens.length === 0
    ) {
      return jsonResponse({
        success: false,
        error:
          `detNotaDebCre.filial, tipo, clifor, loja, itens e ${BASIC_AUTH_REQUIRED_MESSAGE}`,
      });
    }

    const pagamentoError = validatePagamento(detNotaDebCre as Record<string, unknown>);
    if (pagamentoError) {
      return jsonResponse({ success: false, error: pagamentoError });
    }

    const response = await fetchProtheus(
      protheusUrl('/rest/financeiro/inclui_nota_deb_cred', ambiente),
      {
      method: 'POST',
      headers: {
        Authorization: basicAuthHeader(basicAuth),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ detNotaDebCre }),
    });

    let data: unknown = null;
    try {
      data = await parseProtheusJson(response);
    } catch {
      // ignore
    }

    const authError = getProtheusAuthError(response, data);
    if (authError) {
      return jsonResponse({ success: false, error: authError });
    }

    const parsed = parseMessagesResponse(data);

    if (!response.ok || !parsed.success) {
      return jsonResponse({
        success: false,
        error: parsed.descricao || `Falha ao incluir nota (HTTP ${response.status})`,
      });
    }

    return jsonResponse({
      success: true,
      data: {
        mensagem: parsed.descricao || 'Nota incluída com sucesso',
        numero: parsed.codigoNota,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido';
    return jsonResponse({
      success: false,
      error: `Não foi possível conectar ao Protheus: ${message}`,
    });
  }
});
