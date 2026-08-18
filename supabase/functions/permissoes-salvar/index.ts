import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { getSupabaseAdmin } from '../_shared/supabaseAdmin.ts';
import {
  assertCallerIsAdmin,
  findUserById,
  PermissionError,
} from '../_shared/permissionsDb.ts';
import { ROUTINE_IDS } from '../_shared/routineIds.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { userName, targetUserId, permissions } = await req.json();

    if (!userName?.trim() || !targetUserId?.trim() || !Array.isArray(permissions)) {
      return new Response(
        JSON.stringify({ success: false, error: 'userName, targetUserId e permissions são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    await assertCallerIsAdmin(userName.trim());

    const targetUser = await findUserById(targetUserId.trim());
    if (!targetUser) {
      return new Response(
        JSON.stringify({ success: false, error: 'Usuário não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    if (targetUser.is_admin) {
      return new Response(
        JSON.stringify({ success: false, error: 'Não é possível alterar permissões de um administrador' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const grantedSet = new Set(
      permissions.filter((id: unknown): id is string => typeof id === 'string'),
    );

    const rows = ROUTINE_IDS.map((routineId) => ({
      user_id: targetUser.id,
      routine_id: routineId,
      granted: grantedSet.has(routineId),
    }));

    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from('user_routine_permissions')
      .upsert(rows, { onConflict: 'user_id,routine_id' });

    if (error) throw new Error(error.message);

    await supabase
      .from('app_users')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', targetUser.id);

    return new Response(
      JSON.stringify({ success: true, data: { userId: targetUser.id } }),
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
