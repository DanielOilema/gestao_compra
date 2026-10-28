import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { getProtheusBaseUrl, normalizeProtheusAmbiente, protheusUrl } from '../_shared/protheusConfig.ts';
import { parseProtheusJson, readProtheusText } from '../_shared/protheusResponse.ts';
import {
  looksLikeEmail,
  PROTHEUS_EMAIL_LOGIN_BLOCKED_MESSAGE,
} from '../_shared/protheusUserName.ts';
import { validateProtheusPassword } from '../_shared/protheusPasswordPolicy.ts';

function sanitizeErrorMessage(message: string): string {
  return message.replace(/password=[^&\s)"]*/gi, 'password=***');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  let selectedAmbiente = normalizeProtheusAmbiente(undefined);

  try {
    const { user, oldPassword, newPassword, ambiente } = await req.json();
    selectedAmbiente = normalizeProtheusAmbiente(ambiente);

    const userName = typeof user === 'string' ? user.trim() : '';
    const currentPassword = typeof oldPassword === 'string' ? oldPassword : '';
    const nextPassword = typeof newPassword === 'string' ? newPassword : '';

    if (!userName || !currentPassword || !nextPassword) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Usuário, senha atual e nova senha são obrigatórios',
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    if (looksLikeEmail(userName)) {
      return new Response(
        JSON.stringify({ success: false, error: PROTHEUS_EMAIL_LOGIN_BLOCKED_MESSAGE }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const policy = validateProtheusPassword(nextPassword);
    if (!policy.ok) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Nova senha inválida: ${policy.errors.join('; ')}`,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const changeUrl = protheusUrl(
      '/rest/api/framework/v1/changepassworduserservice',
      selectedAmbiente,
    );

    const response = await fetch(changeUrl, {
      method: 'POST',
      signal: AbortSignal.timeout(20_000),
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user: userName,
        oldPassword: currentPassword,
        newPassword: nextPassword,
      }),
    });

    let data: any = null;
    let bodyText = '';
    try {
      bodyText = await readProtheusText(response);
      if (bodyText.trim()) {
        try {
          data = JSON.parse(bodyText);
        } catch {
          data = null;
        }
      }
    } catch {
      // ignore
    }

    if (!response.ok) {
      const message =
        data?.message ||
        data?.error ||
        data?.errorMessage ||
        (bodyText.trim() || `Falha ao trocar senha no Protheus (HTTP ${response.status})`);
      return new Response(
        JSON.stringify({ success: false, error: sanitizeErrorMessage(String(message)) }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: data?.message || 'Senha alterada com sucesso',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    const message = sanitizeErrorMessage(
      err instanceof Error ? err.message : 'Erro desconhecido',
    );
    const baseUrl = getProtheusBaseUrl(selectedAmbiente);
    return new Response(
      JSON.stringify({
        success: false,
        error: `Não foi possível conectar ao Protheus (${selectedAmbiente}: ${baseUrl}): ${message}`,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
