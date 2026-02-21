-- ============================================
-- VERIFICAÇÃO DE DADOS — Só SELECT (não altera nada)
-- Roda no HeidiSQL tranquilo
-- ============================================

-- 1. CONTATOS
SELECT '=== CONTATOS ===' AS verificacao;
SELECT COUNT(*) AS total_contatos FROM smartphone_contacts;
SELECT * FROM smartphone_contacts LIMIT 10;

-- 2. PERFIS (base de tudo)
SELECT '=== PERFIS ===' AS verificacao;
SELECT COUNT(*) AS total_perfis FROM smartphone_profiles;
SELECT * FROM smartphone_profiles LIMIT 10;

-- 3. INSTAGRAM
SELECT '=== INSTAGRAM - Perfis ===' AS verificacao;
SELECT COUNT(*) AS total FROM smartphone_instagram_profiles;
SELECT * FROM smartphone_instagram_profiles LIMIT 10;

SELECT '=== INSTAGRAM - Posts ===' AS verificacao;
SELECT COUNT(*) AS total FROM smartphone_instagram_posts;
SELECT * FROM smartphone_instagram_posts LIMIT 5;

SELECT '=== INSTAGRAM - Follows ===' AS verificacao;
SELECT COUNT(*) AS total FROM smartphone_instagram_follows;

-- 4. WHATSAPP
SELECT '=== WHATSAPP - Chats ===' AS verificacao;
SELECT COUNT(*) AS total FROM smartphone_whatsapp_chats;
SELECT * FROM smartphone_whatsapp_chats LIMIT 10;

SELECT '=== WHATSAPP - Mensagens ===' AS verificacao;
SELECT COUNT(*) AS total FROM smartphone_whatsapp_messages;
SELECT * FROM smartphone_whatsapp_messages LIMIT 10;

-- 5. IFOOD
SELECT '=== IFOOD - Restaurantes ===' AS verificacao;
SELECT COUNT(*) AS total FROM smartphone_ifood_restaurants;
SELECT * FROM smartphone_ifood_restaurants LIMIT 10;

SELECT '=== IFOOD - Menu ===' AS verificacao;
SELECT COUNT(*) AS total FROM smartphone_ifood_menu_items;
SELECT * FROM smartphone_ifood_menu_items LIMIT 10;

SELECT '=== IFOOD - Pedidos ===' AS verificacao;
SELECT COUNT(*) AS total FROM smartphone_ifood_orders;

-- 6. TIKTOK (youtube_id funcionando?)
SELECT '=== TIKTOK - Videos com youtube_id ===' AS verificacao;
SELECT id, caption, youtube_id FROM smartphone_tiktok_videos LIMIT 10;

-- 7. YOUTUBE
SELECT '=== YOUTUBE - Videos ===' AS verificacao;
SELECT COUNT(*) AS total FROM smartphone_youtube_videos;
SELECT id, title, youtube_id, category FROM smartphone_youtube_videos LIMIT 10;

-- 8. LINKEDIN
SELECT '=== LINKEDIN - Perfis ===' AS verificacao;
SELECT COUNT(*) AS total FROM smartphone_linkedin_profiles;
SELECT * FROM smartphone_linkedin_profiles LIMIT 10;

-- 9. SPOTIFY
SELECT '=== SPOTIFY - Playlists ===' AS verificacao;
SELECT COUNT(*) AS total FROM smartphone_spotify_playlists;
SELECT id, name, type, track_count FROM smartphone_spotify_playlists;

SELECT '=== SPOTIFY - Tracks ===' AS verificacao;
SELECT COUNT(*) AS total FROM smartphone_spotify_tracks;
SELECT id, playlist_id, name, artist, youtube_id FROM smartphone_spotify_tracks LIMIT 10;

-- 10. RESUMO GERAL
SELECT '=== RESUMO GERAL ===' AS verificacao;
SELECT 'contatos' AS tabela, COUNT(*) AS registros FROM smartphone_contacts
UNION ALL SELECT 'perfis', COUNT(*) FROM smartphone_profiles
UNION ALL SELECT 'instagram_profiles', COUNT(*) FROM smartphone_instagram_profiles
UNION ALL SELECT 'instagram_posts', COUNT(*) FROM smartphone_instagram_posts
UNION ALL SELECT 'whatsapp_chats', COUNT(*) FROM smartphone_whatsapp_chats
UNION ALL SELECT 'whatsapp_mensagens', COUNT(*) FROM smartphone_whatsapp_messages
UNION ALL SELECT 'ifood_restaurantes', COUNT(*) FROM smartphone_ifood_restaurants
UNION ALL SELECT 'ifood_menu', COUNT(*) FROM smartphone_ifood_menu_items
UNION ALL SELECT 'tiktok_videos', COUNT(*) FROM smartphone_tiktok_videos
UNION ALL SELECT 'youtube_videos', COUNT(*) FROM smartphone_youtube_videos
UNION ALL SELECT 'linkedin_profiles', COUNT(*) FROM smartphone_linkedin_profiles
UNION ALL SELECT 'spotify_playlists', COUNT(*) FROM smartphone_spotify_playlists
UNION ALL SELECT 'spotify_tracks', COUNT(*) FROM smartphone_spotify_tracks;
