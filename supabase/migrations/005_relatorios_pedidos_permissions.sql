-- Rotina do relatório de pedidos de compra por setores.

INSERT INTO user_routine_permissions (user_id, routine_id, granted)
VALUES
  ('000000-admin', 'relatorios-pedidos', TRUE)
ON CONFLICT (user_id, routine_id) DO UPDATE SET granted = TRUE;
