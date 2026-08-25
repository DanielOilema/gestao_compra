-- Rotinas de relatórios: permissão com granularidade por módulo.
-- Dado financeiro consolidado tem sensibilidade diferente de dado de compras, por isso cada
-- módulo de relatório é uma rotina própria em vez de uma permissão 'relatorios' única.

INSERT INTO user_routine_permissions (user_id, routine_id, granted)
VALUES
  ('000000-admin', 'relatorios-financeiro', TRUE),
  ('000000-admin', 'relatorios-compras', TRUE)
ON CONFLICT (user_id, routine_id) DO UPDATE SET granted = TRUE;
