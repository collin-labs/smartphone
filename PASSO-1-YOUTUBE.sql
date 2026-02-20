-- ============================================
-- PASSO 1 DE 2 — YOUTUBE (só seeds)
-- As tabelas e colunas já existem no seu banco
-- ============================================

INSERT INTO smartphone_youtube_channels (id, name, color, initial, subscribers_count) VALUES
(1, 'Weazel News LS', '#FF0000', 'W', 15000),
(2, 'Memes de LS', '#FFD700', 'M', 28000),
(3, 'LS Music', '#1DB954', '♫', 42000),
(4, 'LS Tutoriais', '#0A66C2', 'T', 8500),
(5, 'Street Racing LS', '#FF6B00', 'R', 19000)
ON DUPLICATE KEY UPDATE name = VALUES(name), color = VALUES(color), initial = VALUES(initial), subscribers_count = VALUES(subscribers_count);

INSERT INTO smartphone_youtube_videos (id, channel_id, youtube_id, title, category, duration, is_short, views_count, likes_count) VALUES
(1, 3, 'dQw4w9WgXcQ', 'Never Gonna Give You Up - Rick Astley', 'musica', '3:33', 0, 1500000, 45000),
(2, 2, 'J---aiyznGQ', 'Keyboard Cat - O Classico dos Memes', 'memes', '0:54', 1, 850000, 32000),
(3, 3, 'kJQP7kiw5Fk', 'Despacito - Luis Fonsi ft. Daddy Yankee', 'musica', '4:42', 0, 2800000, 89000),
(4, 1, 'HEfHFsfGIhQ', 'URGENTE: Tiroteio em Vinewood Boulevard', 'noticias', '2:15', 0, 120000, 8700),
(5, 4, 'rfscVS0vtbw', 'Python para Iniciantes - Curso Completo', 'tutorial', '10:24', 0, 340000, 21000),
(6, 5, '2MtOpB_S0IA', 'DRIFT INSANO - Compilacao Street Racing LS', 'carros', '5:17', 0, 560000, 34000),
(7, 3, 'fJ9rUzIMcZQ', 'Bohemian Rhapsody - Queen (Classico)', 'musica', '5:55', 0, 3200000, 120000),
(8, 2, 'QH2-TGUlwu4', 'Nyan Cat mas em Los Santos', 'memes', '0:30', 1, 1200000, 56000)
ON DUPLICATE KEY UPDATE title = VALUES(title), youtube_id = VALUES(youtube_id);
