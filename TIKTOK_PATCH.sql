-- ============================================
-- TIKTOK PATCH — Adicionar youtube_id + seeds reais
-- Rodar no HeidiSQL DEPOIS do smartphone.sql principal
-- ============================================

-- 1. Adicionar coluna youtube_id na tabela de vídeos
ALTER TABLE smartphone_tiktok_videos 
  ADD COLUMN IF NOT EXISTS youtube_id VARCHAR(20) DEFAULT '' AFTER thumbnail;

-- 2. Atualizar seeds existentes com IDs reais do YouTube
-- (vídeos curtos / verticais que funcionam como shorts)
UPDATE smartphone_tiktok_videos SET youtube_id = 'dQw4w9WgXcQ' WHERE id = 1;
UPDATE smartphone_tiktok_videos SET youtube_id = 'kJQP7kiw5Fk' WHERE id = 2;
UPDATE smartphone_tiktok_videos SET youtube_id = 'J---aiyznGQ' WHERE id = 3;
UPDATE smartphone_tiktok_videos SET youtube_id = 'fJ9rUzIMcZQ' WHERE id = 4;
UPDATE smartphone_tiktok_videos SET youtube_id = 'QH2-TGUlwu4' WHERE id = 5;
UPDATE smartphone_tiktok_videos SET youtube_id = '2MtOpB_S0IA' WHERE id = 6;
UPDATE smartphone_tiktok_videos SET youtube_id = 'HEfHFsfGIhQ' WHERE id = 7;
UPDATE smartphone_tiktok_videos SET youtube_id = 'rfscVS0vtbw' WHERE id = 8;

-- 3. Caso os IDs não existam (rodar em banco limpo), inserir novos
-- Esses INSERTs só executam se a tabela tiver menos de 8 registros
INSERT INTO smartphone_tiktok_videos (id, profile_id, caption, thumbnail, youtube_id, likes_count, comments_count, views_count)
SELECT 1, 2, 'Cobertura ao vivo do evento beneficente em Vinewood! #WeazelNews #LosSantos #Evento', '', 'dQw4w9WgXcQ', 45200, 3100, 120000
WHERE NOT EXISTS (SELECT 1 FROM smartphone_tiktok_videos WHERE id = 1);

INSERT INTO smartphone_tiktok_videos (id, profile_id, caption, thumbnail, youtube_id, likes_count, comments_count, views_count)
SELECT 2, 3, 'Transformacao INSANA desse Elegy!! De sucata a carro de corrida em 48h #LSCustoms #Drift #CarrosLS', '', 'kJQP7kiw5Fk', 128000, 8700, 560000
WHERE NOT EXISTS (SELECT 1 FROM smartphone_tiktok_videos WHERE id = 2);

INSERT INTO smartphone_tiktok_videos (id, profile_id, caption, thumbnail, youtube_id, likes_count, comments_count, views_count)
SELECT 3, 4, 'POV: voce esta atrasado pro trabalho na Maze Bank e o Uber cancelou pela 3a vez KKKKK #MemesLS', '', 'J---aiyznGQ', 256000, 12000, 890000
WHERE NOT EXISTS (SELECT 1 FROM smartphone_tiktok_videos WHERE id = 3);

INSERT INTO smartphone_tiktok_videos (id, profile_id, caption, thumbnail, youtube_id, likes_count, comments_count, views_count)
SELECT 4, 5, 'Bohemian Rhapsody no palco do Bahama Mamas! Show historico ontem a noite #Musica #BahamaMamas', '', 'fJ9rUzIMcZQ', 89500, 5400, 340000
WHERE NOT EXISTS (SELECT 1 FROM smartphone_tiktok_videos WHERE id = 4);

INSERT INTO smartphone_tiktok_videos (id, profile_id, caption, thumbnail, youtube_id, likes_count, comments_count, views_count)
SELECT 5, 6, 'Dia a dia no Pillbox Medical: salvando vidas desde as 6h da manha! #Medicina #Pillbox #LosSantos', '', 'QH2-TGUlwu4', 34100, 2800, 98000
WHERE NOT EXISTS (SELECT 1 FROM smartphone_tiktok_videos WHERE id = 5);

INSERT INTO smartphone_tiktok_videos (id, profile_id, caption, thumbnail, youtube_id, likes_count, comments_count, views_count)
SELECT 6, 7, 'DRIFT COMPILATION - As melhores manobras da semana no circuito de Sandy Shores! #StreetRacing', '', '2MtOpB_S0IA', 198000, 9200, 450000
WHERE NOT EXISTS (SELECT 1 FROM smartphone_tiktok_videos WHERE id = 6);

INSERT INTO smartphone_tiktok_videos (id, profile_id, caption, thumbnail, youtube_id, likes_count, comments_count, views_count)
SELECT 7, 2, 'URGENTE: Perseguicao policial em alta velocidade pela LS Freeway! #WeazelNews #Urgente', '', 'HEfHFsfGIhQ', 312000, 18000, 780000
WHERE NOT EXISTS (SELECT 1 FROM smartphone_tiktok_videos WHERE id = 7);

INSERT INTO smartphone_tiktok_videos (id, profile_id, caption, thumbnail, youtube_id, likes_count, comments_count, views_count)
SELECT 8, 8, 'Aprenda Python em 5 minutos! Tutorial rapido pra quem quer comecar na programacao #Tech', '', 'rfscVS0vtbw', 67300, 4100, 230000
WHERE NOT EXISTS (SELECT 1 FROM smartphone_tiktok_videos WHERE id = 8);
