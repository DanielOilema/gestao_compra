import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { protheusUrl } from '../_shared/protheusConfig.ts';
import { parseProtheusJson } from '../_shared/protheusResponse.ts';
import { getSupabaseAdmin } from '../_shared/supabaseAdmin.ts';
import {
  assertCallerIsAdmin,
  ensureAdminPermissions,
  PermissionError,
} from '../_shared/permissionsDb.ts';
import { getAdminUserId } from '../_shared/routineIds.ts';
import { BASIC_AUTH_REQUIRED_MESSAGE, basicAuthHeader, isValidBasicAuth } from '../_shared/protheusAuth.ts';
import { fetchProtheus, getProtheusAuthError } from '../_shared/protheusFetch.ts';

function getUsersPath(): string {
  return Deno.env.get('PROTHEUS_USERS_PATH')?.trim() || '/rest/users';
}

function mapProtheusUsers(data: unknown): Array<{ id: string; userName: string; displayName: string }> {
  if (!data) return [];

  const rows = Array.isArray(data)
    ? data
    : Array.isArray((data as { items?: unknown[] }).items)
      ? (data as { items: unknown[] }).items
      : Array.isArray((data as { users?: unknown[] }).users)
        ? (data as { users: unknown[] }).users
        : [];

  return rows
    .map((row) => {
      const record = row as Record<string, unknown>;
      const read = (...keys: string[]) => {
        for (const key of keys) {
          const value = record[key];
          if (typeof value === 'string' && value.trim()) return value.trim();
        }
        return '';
      };

      const id = read('id', 'ID', 'codigo', 'code');
      const userName = read('userName', 'username', 'user_name', 'login');
      const displayName = read('displayName', 'display_name', 'name', 'nome') || userName;

      if (!id || !userName) return null;
      return { id, userName, displayName };
    })
    .filter((user): user is { id: string; userName: string; displayName: string } => user !== null);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { userName, basicAuth, ambiente } = await req.json();

    if (!userName?.trim() || !isValidBasicAuth(basicAuth)) {
      return new Response(
        JSON.stringify({ success: false, error: `userName e ${BASIC_AUTH_REQUIRED_MESSAGE}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    await assertCallerIsAdmin(userName.trim());

    const response = await fetchProtheus(protheusUrl(getUsersPath(), ambiente), {
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
        `Falha ao buscar usuários (HTTP ${response.status})`;
      return new Response(
        JSON.stringify({ success: false, error: message }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const protheusUsers = mapProtheusUsers(data);
    const supabase = getSupabaseAdmin();
    const adminUserId = getAdminUserId();

    const { data: existingUsers, error: listError } = await supabase
      .from('app_users')
      .select('id, user_name');

    if (listError) throw new Error(listError.message);

    const existingIds = new Set((existingUsers ?? []).map((user) => user.id));
    const existingUserNames = new Set((existingUsers ?? []).map((user) => user.user_name));
    let imported = 0;
    let skipped = 0;

    for (const protheusUser of protheusUsers) {
      if (existingIds.has(protheusUser.id) || existingUserNames.has(protheusUser.userName)) {
        skipped++;
        continue;
      }

      const isAdmin = protheusUser.id === adminUserId;
      const { error: insertError } = await supabase.from('app_users').insert({
        id: protheusUser.id,
        user_name: protheusUser.userName,
        display_name: protheusUser.displayName,
        is_admin: isAdmin,
      });

      if (insertError) {
        skipped++;
        continue;
      }

      existingIds.add(protheusUser.id);
      existingUserNames.add(protheusUser.userName);
      imported++;

      if (isAdmin) {
        await ensureAdminPermissions(protheusUser.id);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          imported,
          skipped,
          total: protheusUsers.length,
        },
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    if (err instanceof PermissionError) {
      return new Response(
        JSON.stringify({ success: false, error: err.message }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const message = err instanceof Error ? err.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
