-- Usuários do aplicativo (mesmo formato do primeiro login válido).
-- Rotinas não são concedidas: um administrador precisa marcar as permissões.

INSERT INTO app_users (id, user_name, display_name, is_admin)
VALUES
  ('pending-luiane.rosa', 'luiane.rosa', 'luiane.rosa', FALSE),
  ('pending-leicione.marques', 'leicione.marques', 'leicione.marques', FALSE),
  ('pending-adriene.kist', 'adriene.kist', 'adriene.kist', FALSE),
  ('pending-michelle.silva', 'michelle.silva', 'michelle.silva', FALSE),
  ('pending-sirlandia.jesus', 'sirlandia.jesus', 'sirlandia.jesus', FALSE),
  ('pending-renata.gatto', 'renata.gatto', 'renata.gatto', FALSE),
  ('pending-andressa.balsani', 'andressa.balsani', 'andressa.balsani', FALSE),
  ('pending-kellen', 'kellen', 'kellen', FALSE),
  ('pending-maria.silva', 'maria.silva', 'maria.silva', FALSE),
  ('pending-anabela.almeida', 'anabela.almeida', 'anabela.almeida', FALSE),
  ('pending-gabriel.braga', 'gabriel.braga', 'gabriel.braga', FALSE),
  ('pending-arival.junior', 'arival.junior', 'arival.junior', FALSE),
  ('pending-luan.rocha', 'luan.rocha', 'luan.rocha', FALSE),
  ('pending-lucio', 'lucio', 'lucio', FALSE),
  ('pending-dalila.casanova', 'dalila.casanova', 'dalila.casanova', FALSE)
ON CONFLICT (user_name) DO NOTHING;
