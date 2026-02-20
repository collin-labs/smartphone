-- ============================================
-- PASSO 2 DE 2 — LINKEDIN (colunas + seeds)
--
-- IMPORTANTE: No HeidiSQL, DESMARQUE a opção:
-- "Parar quando ocorrer um erro no modo de lote"
-- (é o aviso que apareceu antes)
-- Assim ele ignora "Duplicate column" e continua
-- ============================================

ALTER TABLE smartphone_linkedin_profiles ADD COLUMN phone VARCHAR(20) DEFAULT NULL;
ALTER TABLE smartphone_linkedin_profiles ADD COLUMN headline VARCHAR(255) DEFAULT '';
ALTER TABLE smartphone_linkedin_profiles ADD COLUMN avatar VARCHAR(20) DEFAULT '#666';
ALTER TABLE smartphone_linkedin_profiles ADD COLUMN location VARCHAR(100) DEFAULT 'Los Santos, San Andreas';
ALTER TABLE smartphone_linkedin_profiles ADD COLUMN about TEXT DEFAULT NULL;
ALTER TABLE smartphone_linkedin_profiles ADD COLUMN connections_count INT DEFAULT 0;
ALTER TABLE smartphone_linkedin_profiles ADD COLUMN followers_count INT DEFAULT 0;

ALTER TABLE smartphone_linkedin_posts ADD COLUMN likes_count INT DEFAULT 0;
ALTER TABLE smartphone_linkedin_posts ADD COLUMN comments_count INT DEFAULT 0;
ALTER TABLE smartphone_linkedin_posts ADD COLUMN reposts_count INT DEFAULT 0;

ALTER TABLE smartphone_linkedin_jobs ADD COLUMN salary_range VARCHAR(50) DEFAULT NULL;
ALTER TABLE smartphone_linkedin_jobs ADD COLUMN applicants_count INT DEFAULT 0;

-- Seeds perfis
INSERT INTO smartphone_linkedin_profiles (id, name, headline, avatar, connections_count, followers_count) VALUES
(1, 'Marina Oliveira', 'CEO na Weazel News', '#FF0000', 487, 1230),
(2, 'Rafael Santos', 'Mecanico Chefe na LS Customs', '#FF6B00', 312, 890),
(3, 'Ana Costa', 'Medica na Pillbox Medical', '#1DB954', 523, 1560),
(4, 'Pedro Almeida', 'Advogado na Freeman & Associates', '#9B59B6', 198, 670),
(5, 'Julia Ferreira', 'Corretora na Dynasty 8 Real Estate', '#E67E22', 445, 1100),
(6, 'Lucas Martins', 'Piloto na Los Santos Airlines', '#3498DB', 276, 2340),
(7, 'Fernanda Lima', 'Chef no Bahama Mamas West', '#E74C3C', 189, 780),
(8, 'Diego Rocha', 'Dono da LS Tattoos', '#8E44AD', 134, 560),
(9, 'Camila Souza', 'Personal Trainer no Iron Gym', '#E91E63', 267, 890),
(10, 'Bruno Neves', 'DJ no Bahama Mamas', '#FF9800', 156, 1200)
ON DUPLICATE KEY UPDATE name = VALUES(name), headline = VALUES(headline), avatar = VALUES(avatar), connections_count = VALUES(connections_count), followers_count = VALUES(followers_count);

-- Seeds posts
INSERT INTO smartphone_linkedin_posts (id, profile_id, content, likes_count, comments_count, reposts_count) VALUES
(1, 1, 'Estamos contratando! A Weazel News esta com vagas abertas para Reporter de Campo e Cinegrafista.\n\n#VagasLS #Jornalismo #WeazelNews', 145, 32, 8),
(2, 3, 'Dia de treinamento na Pillbox Medical! Formamos mais 5 paramedicos que vao atender a populacao de Los Santos.', 287, 45, 12),
(3, 2, 'Nova parceria fechada entre a LS Customs e a Street Racing League!\n\n#LSCustoms #Mecanica #StreetRacing', 198, 28, 15),
(4, 4, 'Artigo novo: Direitos Trabalhistas em Los Santos - O que voce precisa saber.\n\n#Direito #LosSantos', 89, 14, 22),
(5, 5, 'Mansion em Vinewood Hills acabou de entrar no mercado! 4 quartos, piscina, vista pro oceano.\n\n#Imoveis #Dynasty8', 312, 56, 30),
(6, 6, 'Completei 1000 horas de voo essa semana! Nunca desistam dos seus sonhos. O ceu nao e o limite.', 534, 78, 41)
ON DUPLICATE KEY UPDATE content = VALUES(content), likes_count = VALUES(likes_count);

-- Seeds vagas
INSERT INTO smartphone_linkedin_jobs (id, poster_id, title, company, location, description, salary_range) VALUES
(1, 1, 'Reporter de Campo', 'Weazel News', 'Los Santos, SA', 'Reporter com experiencia em cobertura ao vivo.', '$3.500 - $5.000'),
(2, 3, 'Enfermeiro(a)', 'Pillbox Medical Center', 'Los Santos, SA', 'Enfermeiro com experiencia em emergencia.', '$4.000 - $6.000'),
(3, 5, 'Corretor de Imoveis Jr', 'Dynasty 8 Real Estate', 'Vinewood, SA', 'Jovens talentos para mercado imobiliario.', '$2.500 - $4.000'),
(4, 2, 'Mecanico Automotivo', 'Los Santos Customs', 'Los Santos, SA', 'Mecanico com experiencia em tuning.', '$3.000 - $5.500')
ON DUPLICATE KEY UPDATE title = VALUES(title), salary_range = VALUES(salary_range);
