import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { getSupabaseAdmin } from '../_shared/supabaseAdmin.ts';
import {
  assertCallerIsAdmin,
  getUserPermissions,
  PermissionError,
  resolveGrantedPermissions,
} from '../_shared/permissionsDb.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { userName } = await req.json();

    if (!userName?.trim()) {
      return new Response(
        JSON.stringify({ success: false, error: 'userName é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    await assertCallerIsAdmin(userName.trim());

    const supabase = getSupabaseAdmin();
    const { data: users, error } = await supabase
      .from('app_users')
      .select('id, user_name, display_name, is_admin')
      .order('display_name', { ascending: true });

    if (error) throw new Error(error.message);

    const result = await Promise.all(
      (users ?? []).map(async (user) => {
        const rows = await getUserPermissions(user.id);
        return {
          id: user.id,
          userName: user.user_name,
          displayName: user.display_name,
          isAdmin: user.is_admin,
          permissions: resolveGrantedPermissions(user, rows),
        };
      }),
    );

    return new Response(
      JSON.stringify({ success: true, data: result }),
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
