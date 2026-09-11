-- Rotina de cadastro de transportadoras no agrupador Logística.

INSERT INTO user_routine_permissions (user_id, routine_id, granted)
VALUES
  ('000000-admin', 'transportadoras', TRUE)
ON CONFLICT (user_id, routine_id) DO UPDATE SET granted = TRUE;
