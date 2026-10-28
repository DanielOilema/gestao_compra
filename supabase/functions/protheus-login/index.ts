import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { getProtheusBaseUrl, normalizeProtheusAmbiente, protheusUrl } from '../_shared/protheusConfig.ts';
import { parseProtheusJson, readProtheusText } from '../_shared/protheusResponse.ts';
import {
  looksLikeEmail,
  PROTHEUS_EMAIL_LOGIN_BLOCKED_MESSAGE,
} from '../_shared/protheusUserName.ts';
import { PROTHEUS_PASSWORD_EXPIRED_MESSAGE } from '../_shared/protheusPasswordPolicy.ts';

function sanitizeErrorMessage(message: string): string {
  return message.replace(/password=[^&\s)]*/gi, 'password=***');
}

function isPasswordExpiredRedirect(response: Response): boolean {
  if (response.status !== 302 && response.status !== 303 && response.status !== 307) {
    return false;
  }
  const location = response.headers.get('location') ?? '';
  return location.toLowerCase().includes('changepassworduserservice');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  let selectedAmbiente = normalizeProtheusAmbiente(undefined);

  try {
    const { username, password, ambiente } = await req.json();
    selectedAmbiente = normalizeProtheusAmbiente(ambiente);
    const loginUserName = typeof username === 'string' ? username.trim() : '';

    if (!loginUserName || !password) {
      return new Response(
        JSON.stringify({ success: false, error: 'Usuário e senha são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    if (looksLikeEmail(loginUserName)) {
      return new Response(
        JSON.stringify({ success: false, error: PROTHEUS_EMAIL_LOGIN_BLOCKED_MESSAGE }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const tokenUrl = new URL(protheusUrl('/rest/api/oauth2/v1/token', selectedAmbiente));
    tokenUrl.searchParams.set('grant_type', 'password');

    // redirect:'manual' é obrigatório: com senha expirada o Protheus devolve 302
    // com Location apontando para changepassworduserservice (às vezes em IP interno).
    // Seguir o redirect trava a Edge Function (timeout sem resposta ao front).
    const response = await fetch(tokenUrl, {
      method: 'POST',
      redirect: 'manual',
      signal: AbortSignal.timeout(20_000),
      headers: {
        username: loginUserName,
        password,
        'Content-Type': 'application/json',
      },
    });

    const locationHeader = response.headers.get('location') ?? '';
    const passwordExpired =
      isPasswordExpiredRedirect(response) ||
      locationHeader.toLowerCase().includes('changepassworduserservice');

    if (passwordExpired) {
      let message = PROTHEUS_PASSWORD_EXPIRED_MESSAGE;
      try {
        const bodyText = (await readProtheusText(response)).trim();
        if (bodyText) message = bodyText;
      } catch {
        // keep default message
      }

      return new Response(
        JSON.stringify({
          success: false,
          passwordExpired: true,
          error: message,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Resposta opaca (status 0) em alguns runtimes quando há redirect não seguido.
    if (response.status === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          passwordExpired: true,
          error: PROTHEUS_PASSWORD_EXPIRED_MESSAGE,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

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

    if (
      bodyText.toLowerCase().includes('troca de senha') ||
      bodyText.toLowerCase().includes('changepassword')
    ) {
      return new Response(
        JSON.stringify({
          success: false,
          passwordExpired: true,
          error: bodyText.trim() || PROTHEUS_PASSWORD_EXPIRED_MESSAGE,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // O token não é mais usado pelo app (as demais chamadas usam Basic auth);
    // esta requisição serve apenas para validar usuário e senha no Protheus.
    if (data?.access_token) {
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    if (data?.code === 401 || response.status === 401) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Não foi possível realizar o login para o usuário ${loginUserName}`,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: data?.message || `Falha ao autenticar no Protheus (HTTP ${response.status})`,
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
