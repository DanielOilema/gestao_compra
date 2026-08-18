-- Gestão de permissões: usuários e acesso a rotinas

CREATE TABLE IF NOT EXISTS app_users (
  id TEXT PRIMARY KEY,
  user_name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL DEFAULT '',
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_routine_permissions (
  user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  routine_id TEXT NOT NULL,
  granted BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (user_id, routine_id)
);

CREATE INDEX IF NOT EXISTS idx_app_users_user_name ON app_users(user_name);
CREATE INDEX IF NOT EXISTS idx_user_routine_permissions_user_id ON user_routine_permissions(user_id);

-- Seed admin padrão com todas as rotinas
INSERT INTO app_users (id, user_name, display_name, is_admin)
VALUES ('000000-admin', 'admin', 'Administrador', TRUE)
ON CONFLICT (id) DO UPDATE SET
  is_admin = TRUE,
  display_name = EXCLUDED.display_name,
  updated_at = NOW();

INSERT INTO user_routine_permissions (user_id, routine_id, granted)
VALUES
  ('000000-admin', 'aprovacoes', TRUE),
  ('000000-admin', 'solicitacoes-compra', TRUE),
  ('000000-admin', 'notas-debito-credito', TRUE),
  ('000000-admin', 'gestao-permissoes', TRUE)
ON CONFLICT (user_id, routine_id) DO UPDATE SET granted = TRUE;
