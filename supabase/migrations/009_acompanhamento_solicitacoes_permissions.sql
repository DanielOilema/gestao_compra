-- Rotina do quadro de acompanhamento das solicitações de compra.

INSERT INTO user_routine_permissions (user_id, routine_id, granted)
VALUES
  ('000000-admin', 'acompanhamento-solicitacoes', TRUE)
ON CONFLICT (user_id, routine_id) DO UPDATE SET granted = TRUE;
