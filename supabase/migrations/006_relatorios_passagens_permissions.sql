-- Rotina do relatório de passagens e hospedagens.

INSERT INTO user_routine_permissions (user_id, routine_id, granted)
VALUES
  ('000000-admin', 'relatorios-passagens', TRUE)
ON CONFLICT (user_id, routine_id) DO UPDATE SET granted = TRUE;
