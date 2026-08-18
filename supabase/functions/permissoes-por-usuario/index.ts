import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import {
  findUserByUserName,
  getUserPermissions,
  provisionUserIfMissing,
  resolveGrantedPermissions,
} from '../_shared/permissionsDb.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { userName, displayName } = await req.json();

    if (!userName?.trim()) {
      return new Response(
        JSON.stringify({ success: false, error: 'userName é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const normalizedUserName = userName.trim();
    let user = await findUserByUserName(normalizedUserName);

    if (!user) {
      user = await provisionUserIfMissing(normalizedUserName, displayName);
    }

    const rows = await getUserPermissions(user.id);
    const permissions = resolveGrantedPermissions(user, rows);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          id: user.id,
          userName: user.user_name,
          displayName: user.display_name,
          isAdmin: user.is_admin,
          permissions,
        },
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
