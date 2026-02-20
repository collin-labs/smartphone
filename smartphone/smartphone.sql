-- ============================================
-- SMARTPHONE FiveM — SQL CONSOLIDADO v5.0
-- Agência Soluções Digitais — 19/02/2026
-- 
-- 52 tabelas, ZERO duplicatas
-- Todos schemas alinhados com server/main.js
-- Executar em MySQL/MariaDB limpo
-- ============================================

-- ============================================
-- 1. SISTEMA CORE
-- ============================================

SELECT 1;

CREATE TABLE IF NOT EXISTS smartphone_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    phone_number VARCHAR(20) NOT NULL UNIQUE,
    avatar VARCHAR(255) DEFAULT 'user.jpg',
    wallpaper VARCHAR(100) DEFAULT 'default',
    settings JSON DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_phone (phone_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS smartphone_contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    contact_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user (user_id),
    UNIQUE KEY uk_user_phone (user_id, contact_phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS smartphone_blocked (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    blocked_phone VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_block (user_id, blocked_phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS smartphone_appstore (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    installed_apps TEXT,
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 2. TELEFONE / CHAMADAS
-- ============================================

SELECT 1;

CREATE TABLE IF NOT EXISTS smartphone_calls (
    id INT AUTO_INCREMENT PRIMARY KEY,
    caller_phone VARCHAR(20) NOT NULL,
    receiver_phone VARCHAR(20) NOT NULL,
    status ENUM('missed','answered','rejected','cancelled') DEFAULT 'missed',
    duration INT DEFAULT 0,
    is_anonymous TINYINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_caller (caller_phone),
    INDEX idx_receiver (receiver_phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS smartphone_service_calls (
    id INT AUTO_INCREMENT PRIMARY KEY,
    caller_phone VARCHAR(20) NOT NULL,
    service_number VARCHAR(10) NOT NULL,
    message TEXT,
    location_x FLOAT DEFAULT 0,
    location_y FLOAT DEFAULT 0,
    location_z FLOAT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 3. SMS / iMessage
-- ============================================

SELECT 1;

CREATE TABLE IF NOT EXISTS smartphone_sms_conversations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    is_group TINYINT DEFAULT 0,
    name VARCHAR(100) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS smartphone_sms_participants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    conversation_id INT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    unread_count INT DEFAULT 0,
    INDEX idx_conv (conversation_id),
    INDEX idx_phone (phone),
    UNIQUE KEY uk_conv_phone (conversation_id, phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS smartphone_sms_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    conversation_id INT NOT NULL,
    sender_phone VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    is_deleted TINYINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_conv (conversation_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 4. WHATSAPP
-- ============================================

SELECT 1;

CREATE TABLE IF NOT EXISTS smartphone_whatsapp_chats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('private','group') DEFAULT 'private',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_group TINYINT DEFAULT 0,
    group_name VARCHAR(100) DEFAULT NULL,
    created_by INT DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS smartphone_whatsapp_participants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    chat_id INT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    unread_count INT DEFAULT 0,
    INDEX idx_chat (chat_id),
    INDEX idx_phone (phone),
    UNIQUE KEY uk_chat_phone (chat_id, phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS smartphone_whatsapp_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    chat_id INT NOT NULL,
    sender_phone VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    is_read TINYINT DEFAULT 0,
    sender_name VARCHAR(50) DEFAULT NULL,
    type VARCHAR(20) DEFAULT 'text',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_chat (chat_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS smartphone_whatsapp_group_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    chat_id INT NOT NULL,
    user_phone VARCHAR(20) NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_chat (chat_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 5. INSTAGRAM
-- ============================================

SELECT 1;

CREATE TABLE IF NOT EXISTS smartphone_instagram_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    username VARCHAR(50) NOT NULL,
    name VARCHAR(100) DEFAULT '',
    bio VARCHAR(255) DEFAULT '',
    avatar VARCHAR(255) DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS smartphone_instagram_posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    profile_id INT NOT NULL,
    image VARCHAR(500) DEFAULT '',
    caption TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_profile (profile_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS smartphone_instagram_likes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    profile_id INT NOT NULL,
    post_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_like (profile_id, post_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS smartphone_instagram_comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    profile_id INT NOT NULL,
    text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_post (post_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS smartphone_instagram_follows (
    id INT AUTO_INCREMENT PRIMARY KEY,
    follower_id INT NOT NULL,
    following_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_follow (follower_id, following_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS smartphone_instagram_stories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    profile_id INT NOT NULL,
    image VARCHAR(500) DEFAULT '',
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_profile (profile_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 6. TWITTER / X
-- ============================================

SELECT 1;

CREATE TABLE IF NOT EXISTS smartphone_twitter_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    username VARCHAR(50) NOT NULL,
    display_name VARCHAR(100) DEFAULT '',
    bio VARCHAR(255) DEFAULT '',
    avatar VARCHAR(255) DEFAULT '',
    verified TINYINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS smartphone_twitter_tweets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    profile_id INT NOT NULL,
    content TEXT NOT NULL,
    image VARCHAR(500) DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_profile (profile_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS smartphone_twitter_likes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    profile_id INT NOT NULL,
    tweet_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_like (profile_id, tweet_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 7. TIKTOK
-- ============================================

SELECT 1;

CREATE TABLE IF NOT EXISTS smartphone_tiktok_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    phone VARCHAR(20) NOT NULL UNIQUE,
    username VARCHAR(50) NOT NULL,
    display_name VARCHAR(100) DEFAULT '',
    bio VARCHAR(255) DEFAULT '',
    avatar VARCHAR(255) DEFAULT '',
    followers_count INT DEFAULT 0,
    following_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS smartphone_tiktok_videos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    profile_id INT NOT NULL,
    caption TEXT DEFAULT NULL,
    thumbnail VARCHAR(500) DEFAULT '',
    likes_count INT DEFAULT 0,
    comments_count INT DEFAULT 0,
    views_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_profile (profile_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS smartphone_tiktok_likes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    profile_id INT NOT NULL,
    video_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_like (profile_id, video_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS smartphone_tiktok_comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    video_id INT NOT NULL,
    profile_id INT NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_video (video_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS smartphone_tiktok_follows (
    id INT AUTO_INCREMENT PRIMARY KEY,
    follower_id INT NOT NULL,
    following_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_follow (follower_id, following_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 8. TINDER
-- ============================================

SELECT 1;

CREATE TABLE IF NOT EXISTS smartphone_tinder_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    phone VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(50) NOT NULL,
    age INT DEFAULT 18,
    bio VARCHAR(255) DEFAULT '',
    photos TEXT DEFAULT '',
    gender VARCHAR(20) DEFAULT 'male',
    interest VARCHAR(20) DEFAULT 'female',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS smartphone_tinder_swipes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    swiper_id INT NOT NULL,
    swiped_id INT NOT NULL,
    direction ENUM('left','right') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_swipe (swiper_id, swiped_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS smartphone_tinder_matches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    profile1_id INT NOT NULL,
    profile2_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_match (profile1_id, profile2_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS smartphone_tinder_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    match_id INT NOT NULL,
    sender_id INT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_match (match_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 9. GRINDR (schemas v2 — alinhados com server)
-- ============================================

SELECT 1;

CREATE TABLE IF NOT EXISTS smartphone_grindr_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    name VARCHAR(50) NOT NULL,
    bio TEXT DEFAULT NULL,
    avatar VARCHAR(10) DEFAULT '😎',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS smartphone_grindr_taps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    target_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_target (target_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS smartphone_grindr_chats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user1_id INT NOT NULL,
    user1_name VARCHAR(50) DEFAULT '',
    user1_avatar VARCHAR(10) DEFAULT '😎',
    user2_id INT NOT NULL,
    user2_name VARCHAR(50) DEFAULT '',
    user2_avatar VARCHAR(10) DEFAULT '😎',
    last_message TEXT DEFAULT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users (user1_id, user2_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS smartphone_grindr_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    chat_id INT NOT NULL,
    sender_id INT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_chat (chat_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 10. BANCO / FINANCEIRO
-- ============================================

SELECT 1;

CREATE TABLE IF NOT EXISTS smartphone_bank_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    from_phone VARCHAR(20) NOT NULL,
    to_phone VARCHAR(20) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    type VARCHAR(30) DEFAULT 'pix',
    description VARCHAR(255) DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_from (from_phone),
    INDEX idx_to (to_phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS smartphone_paypal_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    sender_phone VARCHAR(20) DEFAULT '',
    receiver_id INT NOT NULL,
    receiver_phone VARCHAR(20) DEFAULT '',
    amount DECIMAL(15,2) NOT NULL,
    note VARCHAR(255) DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_sender (sender_id),
    INDEX idx_receiver (receiver_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 11. UBER
-- ============================================

SELECT 1;

CREATE TABLE IF NOT EXISTS smartphone_uber_rides (
    id INT AUTO_INCREMENT PRIMARY KEY,
    passenger_id INT NOT NULL,
    passenger_phone VARCHAR(20) DEFAULT '',
    driver_id INT DEFAULT NULL,
    driver_phone VARCHAR(20) DEFAULT NULL,
    destination VARCHAR(200) NOT NULL,
    ride_type VARCHAR(20) DEFAULT 'uberx',
    estimated_price INT DEFAULT 0,
    price INT DEFAULT 0,
    status ENUM('waiting','accepted','completed','cancelled') DEFAULT 'waiting',
    rating TINYINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_passenger (passenger_id),
    INDEX idx_driver (driver_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 12. WAZE / GPS
-- ============================================

SELECT 1;

CREATE TABLE IF NOT EXISTS smartphone_waze_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    destination VARCHAR(200) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS smartphone_waze_reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type VARCHAR(30) DEFAULT 'traffic',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_time (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 13. iFOOD (schema v2 — alinhado com server)
-- ============================================

SELECT 1;

CREATE TABLE IF NOT EXISTS smartphone_ifood_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    restaurant VARCHAR(100) NOT NULL,
    items TEXT DEFAULT NULL,
    total INT DEFAULT 0,
    fee INT DEFAULT 0,
    status ENUM('confirmed','preparing','delivering','delivered','cancelled') DEFAULT 'confirmed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS smartphone_ifood_restaurants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) DEFAULT 'Lanches',
    rating DECIMAL(2,1) DEFAULT 4.0,
    time VARCHAR(20) DEFAULT '30-45',
    fee INT DEFAULT 0,
    emoji VARCHAR(5) DEFAULT '',
    promo VARCHAR(100) DEFAULT NULL,
    active TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS smartphone_ifood_menu_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    restaurant_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    price INT DEFAULT 0,
    `desc` VARCHAR(255) DEFAULT '',
    popular TINYINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_restaurant (restaurant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 14. MARKETPLACE (Mercado Livre)
-- ============================================

SELECT 1;

CREATE TABLE IF NOT EXISTS smartphone_marketplace (
    id INT AUTO_INCREMENT PRIMARY KEY,
    seller_phone VARCHAR(20) NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT DEFAULT '',
    price DECIMAL(10,2) DEFAULT 0,
    image VARCHAR(500) DEFAULT '',
    category VARCHAR(50) DEFAULT 'geral',
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_seller (seller_phone),
    INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 15. TOR / DEEP WEB (schemas v2 — alinhados com server)
-- ============================================

SELECT 1;

CREATE TABLE IF NOT EXISTS smartphone_tor_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    channel VARCHAR(30) NOT NULL,
    user_id INT NOT NULL,
    alias VARCHAR(50) DEFAULT '',
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_channel (channel)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS smartphone_tor_store (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price INT DEFAULT 0,
    available TINYINT DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 16. WEAZEL NEWS (tabela nova: weazel_articles)
-- ============================================

SELECT 1;

CREATE TABLE IF NOT EXISTS smartphone_weazel_articles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    author_id INT NOT NULL,
    author_name VARCHAR(50) DEFAULT '',
    title VARCHAR(200) NOT NULL,
    body TEXT DEFAULT NULL,
    category VARCHAR(30) DEFAULT 'Cidade',
    is_breaking TINYINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_breaking (is_breaking)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 17. YELLOW PAGES (schema v2 — alinhado com server)
-- ============================================

SELECT 1;

CREATE TABLE IF NOT EXISTS smartphone_yellowpages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT DEFAULT NULL,
    category VARCHAR(30) DEFAULT 'outro',
    phone VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_cat (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 18. DISCORD CLONE (EXCLUSIVO)
-- ============================================

SELECT 1;

CREATE TABLE IF NOT EXISTS smartphone_discord_servers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(10) DEFAULT '🎮',
    owner_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS smartphone_discord_channels (
    id INT AUTO_INCREMENT PRIMARY KEY,
    server_id INT NOT NULL,
    name VARCHAR(50) NOT NULL,
    type ENUM('text','announcements') DEFAULT 'text',
    position INT DEFAULT 0,
    INDEX idx_server (server_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS smartphone_discord_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    server_id INT NOT NULL,
    user_id INT NOT NULL,
    role VARCHAR(30) DEFAULT 'membro',
    role_color VARCHAR(7) DEFAULT '#99AAB5',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_member (server_id, user_id),
    INDEX idx_server (server_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS smartphone_discord_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    channel_id INT NOT NULL,
    user_id INT NOT NULL,
    username VARCHAR(50) DEFAULT '',
    role_color VARCHAR(7) DEFAULT '#99AAB5',
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_channel (channel_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 19. UTILIDADES
-- ============================================

SELECT 1;

CREATE TABLE IF NOT EXISTS smartphone_notes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    phone VARCHAR(20) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT DEFAULT '',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS smartphone_gallery (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    url TEXT DEFAULT '',
    caption VARCHAR(200) DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- FIM — 52 tabelas, zero duplicatas
-- Executar: mysql -u root -p < smartphone.sql
-- ============================================

-- ============================================
-- SPOTIFY TABLES
-- ============================================

SELECT 1;

CREATE TABLE IF NOT EXISTS smartphone_spotify_playlists (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    cover VARCHAR(10) DEFAULT '🎵',
    description TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS smartphone_spotify_songs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    playlist_id INT NOT NULL,
    name VARCHAR(200) NOT NULL,
    artist VARCHAR(200) NOT NULL,
    dur VARCHAR(10) DEFAULT '3:00',
    track_order INT DEFAULT 0
);


-- ============================================
-- MEGA SEED DATA — Dados realistas GTA RP brasileiro
-- 30 apps, todas as telas testáveis
-- ============================================

-- =====================
-- CORE: Perfis dos jogadores de teste
-- =====================
INSERT INTO smartphone_profiles (id, user_id, phone_number) VALUES
(1, 1, '555-0001'),
(2, 2, '555-0002'),
(3, 3, '555-0003'),
(4, 4, '555-0004'),
(5, 5, '555-0005'),
(6, 6, '555-0006'),
(7, 7, '555-0007'),
(8, 8, '555-0008'),
(9, 9, '555-0009'),
(10, 10, '555-0010');

-- =====================
-- CONTATOS (para testar Contacts, WhatsApp, SMS, Phone)
-- =====================
INSERT INTO smartphone_contacts (user_id, contact_phone, contact_name) VALUES
(1, '555-0002', 'Maria Santos'),
(1, '555-0003', 'João Grau'),
(1, '555-0004', 'Ana Belle'),
(1, '555-0005', 'Pedro MG'),
(1, '555-0006', 'Lari Santos'),
(1, '555-0007', 'Rafa Tuner'),
(1, '555-0008', 'Dr. Marcos'),
(1, '555-0009', 'Adv. Paula'),
(1, '555-0010', 'Mecânico Zé'),
(2, '555-0001', 'Carlos Silva'),
(2, '555-0003', 'João'),
(3, '555-0001', 'Carlos'),
(3, '555-0002', 'Maria');

-- =====================
-- CHAMADAS (para testar Phone > Histórico)
-- =====================
INSERT INTO smartphone_calls (caller_phone, receiver_phone, status, duration, is_anonymous) VALUES
('555-0001', '555-0002', 'answered', 124, 0),
('555-0003', '555-0001', 'missed', 0, 0),
('555-0001', '555-0007', 'answered', 340, 0),
('555-0004', '555-0001', 'answered', 67, 0),
('555-0001', '555-0008', 'answered', 180, 0),
('555-0005', '555-0001', 'missed', 0, 0),
('555-0001', '555-0010', 'answered', 45, 0),
('555-0006', '555-0001', 'rejected', 0, 0),
('555-0009', '555-0001', 'missed', 0, 1);

-- =====================
-- SMS (para testar SMS > Lista + Chat)
-- =====================
INSERT INTO smartphone_sms_conversations (id, is_group) VALUES (1, 0), (2, 0), (3, 0);
INSERT INTO smartphone_sms_participants (conversation_id, phone, unread) VALUES
(1, '555-0001', 0), (1, '555-0002', 2),
(2, '555-0001', 0), (2, '555-0008', 0),
(3, '555-0001', 0), (3, '555-0010', 1);
INSERT INTO smartphone_sms_messages (conversation_id, sender_phone, message) VALUES
(1, '555-0002', 'E aí Carlos, beleza?'),
(1, '555-0001', 'Tudo certo Maria! E vc?'),
(1, '555-0002', 'Bora pro Bahama Mamas hj?'),
(1, '555-0001', 'Bora! Que horas?'),
(1, '555-0002', 'Umas 22h pode ser?'),
(2, '555-0008', 'Carlos, seus exames ficaram prontos'),
(2, '555-0001', 'Obrigado Dr. Marcos! Vou buscar amanhã'),
(2, '555-0008', 'Tá tudo normal, pode ficar tranquilo'),
(3, '555-0010', 'Seu carro tá pronto chefe'),
(3, '555-0001', 'Show! Quanto ficou?'),
(3, '555-0010', 'R$ 4.500 com as peças');

-- =====================
-- WHATSAPP (para testar WhatsApp > Conversas + Chat + Grupo)
-- =====================
INSERT INTO smartphone_whatsapp_chats (id, type, is_group, group_name, created_by) VALUES
(1, 'private', 0, NULL, NULL),
(2, 'private', 0, NULL, NULL),
(3, 'group', 1, 'Grupo da Firma', 1),
(4, 'private', 0, NULL, NULL),
(5, 'private', 0, NULL, NULL),
(6, 'group', 1, 'Churrasco Sábado', 2);
INSERT INTO smartphone_whatsapp_participants (chat_id, phone, unread_count) VALUES
(1, '555-0001', 0), (1, '555-0002', 3),
(2, '555-0001', 0), (2, '555-0003', 1),
(3, '555-0001', 0), (3, '555-0002', 0), (3, '555-0003', 0), (3, '555-0005', 0),
(4, '555-0001', 0), (4, '555-0004', 0),
(5, '555-0001', 0), (5, '555-0007', 0),
(6, '555-0001', 0), (6, '555-0002', 0), (6, '555-0005', 0), (6, '555-0006', 0);
INSERT INTO smartphone_whatsapp_messages (chat_id, sender_phone, sender_name, message, type, is_read) VALUES
(1, '555-0002', 'Maria Santos', 'Oi! Tudo bem?', 'text', 1),
(1, '555-0001', 'Carlos Silva', 'Tudo ótimo! E vc?', 'text', 1),
(1, '555-0002', 'Maria Santos', 'Viu o que aconteceu no Bahama Mamas ontem?', 'text', 1),
(1, '555-0002', 'Maria Santos', 'Foi muito louco kkkk', 'text', 0),
(1, '555-0002', 'Maria Santos', 'Olha essa foto!', 'text', 0),
(1, '555-0002', 'Maria Santos', 'https://i.imgur.com/example.jpg', 'image', 0),
(2, '555-0003', 'João Grau', 'Fala mano! Bora pro corre hj?', 'text', 1),
(2, '555-0001', 'Carlos Silva', 'Bora! Que horas?', 'text', 1),
(2, '555-0003', 'João Grau', 'Passo aí umas 21h', 'text', 0),
(3, '555-0002', 'Maria Santos', 'Gente, reunião às 20h', 'text', 1),
(3, '555-0005', 'Pedro MG', 'Blz, vou estar lá', 'text', 1),
(3, '555-0003', 'João Grau', 'Tô chegando', 'text', 1),
(3, '555-0001', 'Carlos Silva', 'Show, tô confirmado', 'text', 1),
(4, '555-0004', 'Ana Belle', 'Carlos! Amei as fotos do pôr do sol', 'text', 1),
(4, '555-0001', 'Carlos Silva', 'Vespucci Beach é demais né', 'text', 1),
(4, '555-0004', 'Ana Belle', 'Precisamos ir de novo!', 'text', 1),
(5, '555-0007', 'Rafa Tuner', 'O motor do seu carro ficou pronto', 'text', 1),
(5, '555-0001', 'Carlos Silva', 'Show! Quanto ficou o serviço?', 'text', 1),
(5, '555-0007', 'Rafa Tuner', '15k com tudo instalado', 'text', 1),
(6, '555-0002', 'Maria Santos', 'Churrasco confirmado pro sábado!', 'text', 1),
(6, '555-0005', 'Pedro MG', 'Eu levo a carne!', 'text', 1),
(6, '555-0006', 'Lari Santos', 'Eu levo as bebidas', 'text', 1);

-- =====================
-- INSTAGRAM (para testar Feed + Stories + Perfil + Comentários)
-- =====================
INSERT INTO smartphone_instagram_profiles (id, user_id, username, name, bio, avatar) VALUES
(1, 1, 'carlos_silva', 'Carlos Silva', 'Empreendedor | Los Santos', ''),
(2, 2, 'maria_ls', 'Maria Santos', 'Festeira profissional 🎉', ''),
(3, 3, 'joao_grau', 'João Grau', 'Grau é meu sobrenome 🏎️', ''),
(4, 4, 'ana_belle', 'Ana Belle', 'Fotógrafa | Viajante 🌅', ''),
(5, 5, 'pedro_mg', 'Pedro MG', 'Fitness | Saúde 💪', ''),
(6, 6, 'lari_santos', 'Lari Santos', 'Fashion Store Owner 👗', ''),
(7, 7, 'rafa_tuner', 'Rafa Tuner', 'Import Cars | JDM | Euro 🔧', ''),
(8, 8, 'dr_marcos', 'Dr. Marcos', 'Clínica 24h | Pillbox Hill', ''),
(9, 9, 'adv_paula', 'Adv. Paula', 'Direito Criminal & Civil ⚖️', ''),
(10, 10, 'mecanico_ze', 'Mecânico Zé', 'LS Customs | Tunagem | Reparo', '');

INSERT INTO smartphone_instagram_posts (id, profile_id, image, caption) VALUES
(1, 2, '', 'Noite perfeita no Bahama Mamas! 🍸🎶'),
(2, 3, '', 'Novo carro chegou! V8 turbinado 🔥 #grau'),
(3, 4, '', 'Pôr do sol em Vespucci Beach. Los Santos nunca decepciona 🌅'),
(4, 5, '', 'Treino pesado hoje! Sem dor sem ganho 💪 #gym'),
(5, 6, '', 'Abrindo a loja nova amanha! Venham conferir 🛍️'),
(6, 7, '', 'Motor ficou pronto, vem buscar o seu! 🏎️ #tuning'),
(7, 1, '', 'Escritório novo da agência! Partiu trabalhar 🖥️'),
(8, 8, '', 'Plantão hoje na Pillbox. Cuidem-se! 🏥'),
(9, 2, '', 'Pool party domingo! Quem vem? 🏊‍♀️'),
(10, 3, '', 'De 0 a 200 em 4.5 segundos 🏁'),
(11, 4, '', 'Sessão fotográfica no Mount Chiliad 📸'),
(12, 5, '', 'Shape de verão chegando! 3 meses de treino 🔥'),
(13, 6, '', 'Coleção nova chegou! Tênis importados 👟'),
(14, 7, '', 'Antes e depois da tunagem. Ficou absurdo! 🤯'),
(15, 9, '', 'Caso ganho! Justiça feita ⚖️');

INSERT INTO smartphone_instagram_likes (profile_id, post_id) VALUES
(1,1),(1,3),(1,5),(2,2),(2,4),(2,7),(3,1),(3,5),(3,9),
(4,1),(4,2),(4,6),(5,3),(5,7),(5,12),(6,1),(6,4),(6,8),
(7,2),(7,10),(7,14),(8,7),(8,15),(9,1),(9,7),(10,2),(10,6);

INSERT INTO smartphone_instagram_comments (post_id, profile_id, text) VALUES
(1, 1, 'Que foto linda! 😍'),
(1, 3, 'Bora de novo semana que vem!'),
(1, 4, 'Melhor festa de LS!'),
(2, 1, 'Tá insano esse carro! 🔥'),
(2, 7, 'Passa aqui que eu turbo mais!'),
(3, 2, 'Vespucci é o melhor lugar!'),
(3, 5, 'Preciso ir lá tirar foto'),
(5, 2, 'Sucesso amiga! 🙏'),
(5, 1, 'Vou passar lá!'),
(7, 6, 'Ficou lindo o escritório!'),
(7, 2, 'Parabéns Carlos! 👏'),
(12, 1, 'Motivação! 💪'),
(14, 3, 'Ficou absurdo mesmo!');

INSERT INTO smartphone_instagram_follows (follower_id, following_id) VALUES
(1,2),(1,3),(1,4),(1,5),(1,6),(1,7),(2,1),(2,3),(2,4),
(3,1),(3,2),(3,7),(4,1),(4,2),(4,5),(5,1),(5,3),(5,4),
(6,1),(6,2),(6,4),(7,1),(7,3),(7,10),(8,1),(9,1),(10,7);

INSERT INTO smartphone_instagram_stories (profile_id, image, expires_at) VALUES
(2, '', DATE_ADD(NOW(), INTERVAL 20 HOUR)),
(3, '', DATE_ADD(NOW(), INTERVAL 18 HOUR)),
(5, '', DATE_ADD(NOW(), INTERVAL 15 HOUR)),
(6, '', DATE_ADD(NOW(), INTERVAL 12 HOUR)),
(7, '', DATE_ADD(NOW(), INTERVAL 10 HOUR));

-- =====================
-- TWITTER (para testar Feed + Perfil + Tweets)
-- =====================
INSERT INTO smartphone_twitter_profiles (id, user_id, username, display_name, bio, verified) VALUES
(1, 1, 'carlos_dev', 'Carlos Silva', 'CEO Agência Soluções Digitais | LS', 0),
(2, 2, 'maria_ls', 'Maria Santos', 'Curtindo a vida em Los Santos 🌴', 0),
(3, 3, 'joaograu', 'João Grau', 'Velocidade é meu estilo 🏎️', 0),
(4, 4, 'anabelle', 'Ana Belle', 'Fotografando LS uma foto por vez 📸', 0),
(5, 5, 'pedromg', 'Pedro MG', 'Treino, disciplina, resultado 💪', 0),
(6, 8, 'dr_marcos', 'Dr. Marcos Lima', 'Médico | Pillbox Hill Medical Center', 1),
(7, 9, 'adv_paula_s', 'Adv. Paula Santos', 'Justiça para todos ⚖️ | OAB/LS', 1);

INSERT INTO smartphone_twitter_tweets (id, profile_id, content, image) VALUES
(1, 1, 'Novo projeto da agência saindo do forno! 🔥 Em breve mais novidades.', ''),
(2, 2, 'Bahama Mamas ontem foi INSANO! Melhor noite do ano 🎶', ''),
(3, 3, 'Quem quer racha na highway hoje? 🏁', ''),
(4, 4, 'Mount Chiliad ao pôr do sol. Sem filtro. 🌅', ''),
(5, 5, 'Treino de pernas hoje. Amanhã ninguém anda direito kkkk', ''),
(6, 6, 'Lembrete: plantão noturno na Pillbox. Emergências, estamos aqui.', ''),
(7, 7, 'URGENTE: Novo decreto sobre porte de armas entra em vigor amanhã. Fiquem atentos.', ''),
(8, 1, 'Los Santos tem os melhores pores do sol do mundo. Provem que estou errado.', ''),
(9, 3, 'Motor V8 biturbo instalado. 850cv. Os vizinhos vão amar. 😈', ''),
(10, 2, 'Procurando personal trainer em LS. Alguém indica?', '');

INSERT INTO smartphone_twitter_likes (profile_id, tweet_id) VALUES
(1,2),(1,4),(2,1),(2,5),(3,1),(3,8),(4,2),(4,8),(5,2),(5,3),(6,7),(7,1);

-- =====================
-- TIKTOK (para testar Feed + Perfil + Vídeos)
-- =====================
INSERT INTO smartphone_tiktok_profiles (id, phone, username, display_name, bio, followers_count, following_count) VALUES
(1, '555-0001', 'carlos.dev', 'Carlos Silva', 'Tech + RP', 1250, 340),
(2, '555-0002', 'maria.ls', 'Maria Santos', 'Festas & Vibes 🎉', 8900, 120),
(3, '555-0003', 'joao.grau', 'João Grau', 'Grau nas ruas de LS 🏎️', 15600, 89),
(4, '555-0004', 'ana.belle', 'Ana Belle', 'Fotografia & Lifestyle', 5400, 230),
(5, '555-0005', 'pedro.fit', 'Pedro Fitness', 'Treino & Motivação 💪', 22000, 150);

INSERT INTO smartphone_tiktok_videos (id, profile_id, caption, likes_count, comments_count, views_count) VALUES
(1, 3, 'De 0 a 200 no Elegy 🏎️ #grau #drift', 4500, 230, 45000),
(2, 2, 'Tutorial de makeup pra festa 💄 #festeira', 2300, 120, 18000),
(3, 5, 'Treino de peito completo em 15min ⏱️ #gym', 8900, 450, 89000),
(4, 4, 'Lugares secretos de LS pt.3 📸 #lossantos', 3400, 180, 34000),
(5, 3, 'Fuga épica da polícia (RP) 🚔 #roleplay', 12000, 890, 120000),
(6, 1, 'Como programar em 2026 💻 #tech #dev', 1800, 95, 15000),
(7, 2, 'Bahama Mamas vlog 🍸 #nightlife', 5600, 340, 56000),
(8, 5, 'Dieta de cutting: o que eu como num dia 🥗', 6700, 280, 67000);

INSERT INTO smartphone_tiktok_likes (profile_id, video_id) VALUES
(1,1),(1,2),(1,4),(2,3),(2,5),(3,2),(3,6),(4,1),(4,3),(5,1),(5,4);

INSERT INTO smartphone_tiktok_comments (video_id, profile_id, comment) VALUES
(1, 1, 'Que carro insano! 🔥'),
(1, 2, 'Eu no banco do passageiro kkk'),
(3, 1, 'Motivação pura! 💪'),
(3, 2, 'Vou começar amanhã juro'),
(5, 4, 'Melhor fuga que já vi kkkkk'),
(5, 1, 'O cara é brabo demais');

INSERT INTO smartphone_tiktok_follows (follower_id, following_id) VALUES
(1,2),(1,3),(1,4),(1,5),(2,1),(2,3),(3,1),(3,5),(4,1),(4,2),(5,1),(5,3);

-- =====================
-- TINDER (para testar Discover + Matches + Chat)
-- =====================
INSERT INTO smartphone_tinder_profiles (id, phone, name, age, bio, photos, gender, interest) VALUES
(1, '555-0001', 'Carlos', 26, 'Empreendedor, apaixonado por tecnologia e carros. Procurando alguém pra curtir LS juntos 🌆', '[]', 'male', 'female'),
(2, '555-0002', 'Maria', 24, 'Amo festas, praia e boas companhias. Me leva pro Bahama Mamas? 🍸', '[]', 'female', 'male'),
(3, '555-0004', 'Ana', 23, 'Fotógrafa. Vou te levar pros melhores cenários de LS 📸', '[]', 'female', 'male'),
(4, '555-0006', 'Larissa', 25, 'Dona de loja. Fashion é minha vida 👗', '[]', 'female', 'male'),
(5, '555-0003', 'João', 27, 'Se vc curte adrenalina, me dá match 🏎️', '[]', 'male', 'female'),
(6, '555-0005', 'Pedro', 28, 'Personal trainer. Vamos treinar juntos? 💪', '[]', 'male', 'female'),
(7, '555-0009', 'Paula', 30, 'Advogada. Inteligência é o melhor shape ⚖️', '[]', 'female', 'male');

INSERT INTO smartphone_tinder_swipes (swiper_id, swiped_id, direction) VALUES
(1, 2, 'right'), (2, 1, 'right'),
(1, 3, 'right'), (3, 1, 'right'),
(1, 4, 'right'),
(5, 2, 'right'), (2, 5, 'left'),
(6, 4, 'right'), (4, 6, 'right');

INSERT INTO smartphone_tinder_matches (id, profile1_id, profile2_id) VALUES
(1, 1, 2),
(2, 1, 3),
(3, 4, 6);

INSERT INTO smartphone_tinder_messages (match_id, sender_id, message) VALUES
(1, 2, 'Oi Carlos! Vi que vc é empreendedor, conta mais! 😊'),
(1, 1, 'Oi Maria! Tenho uma agência digital aqui em LS. E vc?'),
(1, 2, 'Eu sou festeira profissional kkk brincadeira, trabalho com eventos'),
(1, 1, 'Haha que legal! Bora tomar um drink no Bahama Mamas?'),
(1, 2, 'Bora sim! Quando?'),
(2, 1, 'Oi Ana! Vi que vc é fotógrafa, muito legal!'),
(2, 3, 'Oi! Sim, amo fotografar LS. Conhece algum lugar legal?'),
(2, 1, 'Mount Chiliad ao pôr do sol é incrível!'),
(3, 6, 'Oi Larissa! Tudo bem?'),
(3, 4, 'Oi Pedro! Tudo sim e vc?');

-- =====================
-- GRINDR (para testar Grid + Perfis + Chat + Taps — INCLUSÃO!)
-- =====================
INSERT INTO smartphone_grindr_profiles (id, user_id, name, bio, avatar) VALUES
(1, 11, 'Lucas M.', 'Discreto. Curto academia e praia. LS nativo 🏖️', ''),
(2, 12, 'Thiago R.', 'DJ nos fins de semana 🎧 Bora curtir?', ''),
(3, 13, 'Rafael S.', 'Chef de cozinha 🍳 Faço um jantar pra vc', ''),
(4, 14, 'André L.', 'Médico residente. Pouco tempo livre mas compenso 😏', ''),
(5, 15, 'Bruno K.', 'Designer | Tatuador | Art lover 🎨', ''),
(6, 16, 'Felipe G.', 'Personal trainer 💪 Vamos malhar juntos?', ''),
(7, 17, 'Matheus P.', 'Advogado de dia, bartender à noite 🍹', ''),
(8, 18, 'Gustavo N.', 'Fotógrafo. Posso te fotografar? 📸', '');

INSERT INTO smartphone_grindr_taps (sender_id, target_id) VALUES
(2, 1), (3, 1), (5, 1), (4, 2), (6, 3), (1, 4), (7, 5);

INSERT INTO smartphone_grindr_chats (id, user1_id, user1_name, user1_avatar, user2_id, user2_name, user2_avatar, last_message) VALUES
(1, 11, 'Lucas M.', '', 12, 'Thiago R.', '', 'Bora pro Bahama Mamas hj? 🎧'),
(2, 11, 'Lucas M.', '', 13, 'Rafael S.', '', 'Aquele jantar tá de pé? 🍳'),
(3, 14, 'André L.', '', 15, 'Bruno K.', '', 'Adorei sua última tattoo!');

INSERT INTO smartphone_grindr_messages (chat_id, sender_id, message) VALUES
(1, 12, 'E aí Lucas! Tudo bem?'),
(1, 11, 'Tudo ótimo Thiago! E vc?'),
(1, 12, 'De boa! Vou tocar no Bahama Mamas hj, bora?'),
(1, 11, 'Bora sim! Que horas?'),
(1, 12, 'A partir das 22h! Te coloco na lista VIP 🎧'),
(2, 13, 'Fala Lucas! Lembra do jantar que prometi?'),
(2, 11, 'Claro! Aquele risoto?'),
(2, 13, 'Esse mesmo! Sábado à noite pode ser?'),
(2, 11, 'Perfeito! Levo o vinho 🍷'),
(3, 14, 'Bruno, vi tua última tattoo no insta. Ficou incrível!'),
(3, 15, 'Valeu André! Quer fazer uma?'),
(3, 14, 'Quero sim! Algo discreto no braço');

-- =====================
-- BANCO / FINANCEIRO (para testar Bank + PayPal)
-- =====================
INSERT INTO smartphone_bank_transactions (from_phone, to_phone, amount, type, description) VALUES
('555-0001', '555-0007', 15000.00, 'pix', 'Pagamento motor V8'),
('555-0002', '555-0001', 500.00, 'pix', 'Racha da festa'),
('555-0001', '555-0006', 2500.00, 'pix', 'Compra roupa'),
('555-0003', '555-0001', 1000.00, 'transfer', 'Dívida paga'),
('555-0001', '555-0008', 350.00, 'pix', 'Consulta médica'),
('555-0005', '555-0001', 200.00, 'pix', 'Personal treino'),
('555-0001', '555-0010', 4500.00, 'pix', 'Mecânico - conserto');

INSERT INTO smartphone_paypal_transactions (sender_id, sender_phone, receiver_id, receiver_phone, amount, note) VALUES
(1, '555-0001', 6, '555-0006', 1200.00, 'Tênis importado'),
(2, '555-0002', 1, '555-0001', 300.00, 'Ingresso festa'),
(3, '555-0003', 7, '555-0007', 8000.00, 'Peça importada JDM');

-- =====================
-- UBER (para testar Uber > Histórico + Corrida)
-- =====================
INSERT INTO smartphone_uber_rides (passenger_id, passenger_phone, driver_id, driver_phone, destination, ride_type, estimated_price, price, status, rating) VALUES
(1, '555-0001', 3, '555-0003', 'Bahama Mamas', 'comfort', 2500, 2500, 'completed', 5),
(1, '555-0001', 5, '555-0005', 'Pillbox Hill Medical', 'economy', 1800, 1800, 'completed', 4),
(1, '555-0001', 3, '555-0003', 'Maze Bank Tower', 'premium', 3500, 3500, 'completed', 5),
(2, '555-0002', 1, '555-0001', 'Vespucci Beach', 'economy', 1200, 1200, 'completed', 5);

-- =====================
-- WAZE (para testar Waze > Histórico + Alertas)
-- =====================
INSERT INTO smartphone_waze_history (user_id, destination) VALUES
(1, 'Bahama Mamas'), (1, 'Pillbox Hill'), (1, 'LS Customs'),
(1, 'Maze Bank Tower'), (1, 'Vespucci Beach');
INSERT INTO smartphone_waze_reports (user_id, type) VALUES
(1, 'police'), (2, 'accident'), (3, 'traffic'), (1, 'hazard');

-- =====================
-- IFOOD (Restaurantes + Menu + Pedidos)
-- =====================
INSERT INTO smartphone_ifood_restaurants (id, name, category, rating, time, fee, emoji, promo) VALUES
(1, 'Burger King LS', 'Lanches', 4.5, '25-35', 599, 'B', '20% OFF'),
(2, 'Pizza Hut Santos', 'Pizza', 4.7, '30-45', 0, 'P', NULL),
(3, 'Sushi Los Santos', 'Japonesa', 4.8, '40-55', 799, 'S', NULL),
(4, 'Açaí do Grau', 'Açaí', 4.6, '20-30', 0, 'A', 'Frete grátis'),
(5, 'Churrascaria LS', 'Brasileira', 4.4, '35-50', 899, 'C', NULL),
(6, 'Padaria Pão Quente', 'Lanches', 4.2, '15-25', 399, 'P', NULL),
(7, 'Wok Express', 'Chinesa', 4.3, '30-40', 699, 'W', '10% OFF'),
(8, 'Tacos El Gringo', 'Mexicana', 4.1, '25-35', 499, 'T', NULL);

INSERT INTO smartphone_ifood_menu_items (restaurant_id, name, price, `desc`, popular) VALUES
(1, 'Whopper', 2990, 'Pão, carne, queijo, alface, tomate', 1),
(1, 'Chicken Crispy', 2490, 'Frango empanado crocante', 0),
(1, 'Onion Rings', 1490, 'Anéis de cebola', 0),
(1, 'Milk Shake', 1690, 'Chocolate, morango ou baunilha', 0),
(1, 'Combo BK', 3490, 'Whopper + batata + refri', 1),
(2, 'Margherita', 3990, 'Molho, mussarela, manjericão', 1),
(2, 'Pepperoni', 4490, 'Pepperoni, mussarela', 1),
(2, 'Calabresa', 3790, 'Calabresa, cebola, mussarela', 0),
(2, 'Quatro Queijos', 4290, 'Mussarela, provolone, gorgonzola, parmesão', 0),
(3, 'Combo 20 peças', 5990, 'Mix de sashimi e sushi', 1),
(3, 'Hot Roll', 3290, '10 unidades', 0),
(3, 'Temaki Salmão', 2790, 'Salmão fresco', 0),
(4, 'Açaí 500ml', 1890, 'Granola, banana, leite condensado', 1),
(4, 'Açaí 700ml', 2490, 'Completo com frutas', 0),
(5, 'Picanha na brasa', 4990, 'Com arroz, farofa e vinagrete', 1),
(5, 'Costela 12h', 5490, 'Desfiada, com mandioca', 1),
(6, 'Pão francês (10un)', 590, 'Quentinho', 0),
(6, 'Café com leite', 690, 'Grande', 1),
(6, 'Coxinha', 890, 'Frango com catupiry', 0),
(7, 'Yakisoba tradicional', 2990, 'Legumes, frango, molho shoyu', 1),
(7, 'Rolinho primavera', 1490, '4 unidades', 0),
(8, 'Tacos (3un)', 2290, 'Carne, guacamole, pico de gallo', 1),
(8, 'Burrito grande', 2990, 'Carne, feijão, arroz, queijo', 0);

INSERT INTO smartphone_ifood_orders (user_id, restaurant, items, total, fee, status) VALUES
(1, 'Burger King LS', '[{"name":"Whopper","qty":2,"price":2990},{"name":"Milk Shake","qty":1,"price":1690}]', 7670, 599, 'delivered'),
(1, 'Sushi Los Santos', '[{"name":"Combo 20 peças","qty":1,"price":5990}]', 5990, 799, 'delivered');

-- =====================
-- MARKETPLACE (para testar Home + Detalhes + Meus anúncios)
-- =====================
INSERT INTO smartphone_marketplace (seller_phone, title, description, price, category, image, status) VALUES
('555-0003', 'Elegy RH8 Tunado', 'Motor V6 turbo, pintura metálica azul, rodas importadas. Só venda!', 150000, 'Veículos', '', 'active'),
('555-0004', 'iPhone 15 Pro Max', 'Novo na caixa, lacrado. Garantia 1 ano.', 8500, 'Eletrônicos', '', 'active'),
('555-0005', 'Kit Musculação Completo', 'Banco, barra, anilhas até 100kg. Pouco uso.', 3500, 'Esportes', '', 'active'),
('555-0006', 'Apartamento Vinewood', '2 quartos, sala ampla, garagem. Vista para o Maze Bank.', 500000, 'Imóveis', '', 'active'),
('555-0007', 'Rolex Submariner', 'Original com certificado. Troco em veículo.', 25000, 'Acessórios', '', 'active'),
('555-0001', 'MacBook Pro M3', 'Usado 6 meses, perfeito estado. Com carregador.', 12000, 'Eletrônicos', '', 'active'),
('555-0002', 'Vestido de Festa', 'Usado uma vez. Tamanho M. Marca importada.', 800, 'Moda', '', 'active'),
('555-0010', 'Moto Hakuchou Drag', 'A mais rápida de LS. 300km/h+. Aceito propostas.', 85000, 'Veículos', '', 'active');

-- =====================
-- TOR / DEEP WEB (para testar Market + Chat)
-- =====================
INSERT INTO smartphone_tor_store (name, price, available) VALUES
('Lockpick Set', 500, 1),
('Documento Falso', 2000, 1),
('Escuta Telefônica', 1500, 1),
('Placa Clonada', 3000, 1),
('Radio Freq. Policial', 5000, 1),
('Colete Kevlar III-A', 15000, 1),
('GPS Rastreador Mini', 3000, 1),
('Silenciador', 8000, 1);

INSERT INTO smartphone_tor_messages (channel, user_id, alias, message) VALUES
('general', 10, 'Shadow', 'Alguém tem lockpick?'),
('general', 11, 'Ghost', 'Tenho sim, fala no PV'),
('general', 12, 'Phantom', 'Placa clonada, alguém?'),
('general', 10, 'Shadow', 'Manda msg, tenho estoque');

-- =====================
-- WEAZEL NEWS (para testar Feed + Breaking News)
-- =====================
INSERT INTO smartphone_weazel_articles (author_id, author_name, title, body, category, is_breaking) VALUES
(1, 'Sandra Lee', 'Tiroteio em Vinewood Boulevard', 'A polícia de Los Santos respondeu a um chamado de tiroteio na região de Vinewood Boulevard na madrugada de hoje. Três suspeitos foram detidos e encaminhados à delegacia central. Não houve vítimas fatais.', 'Cidade', 1),
(1, 'Tom Rivers', 'Nova ponte ligando Paleto Bay será inaugurada', 'O prefeito anunciou a construção de uma nova ponte conectando Paleto Bay ao centro de Los Santos, com previsão de conclusão em 6 meses. O investimento é de R$ 2 milhões.', 'Política', 0),
(2, 'Maria Costa', 'Preços de imóveis em alta no centro', 'O mercado imobiliário de Los Santos registrou alta de 15% nos preços de apartamentos na região central nos últimos 3 meses. Especialistas apontam crescimento da cidade.', 'Economia', 0),
(3, 'Ana Reporter', 'Festival de música confirmado para sábado', 'O evento acontecerá na praia de Vespucci e contará com shows ao vivo, food trucks e atividades para toda a família. Entrada gratuita.', 'Entretenimento', 0),
(1, 'Sandra Lee', 'Perseguição policial termina em Blaine County', 'Após 40 minutos de perseguição, dois suspeitos foram capturados em Blaine County. A LSPD usou helicóptero na operação.', 'Cidade', 1);

-- =====================
-- YELLOW PAGES (para testar Lista + Anúncios)
-- =====================
INSERT INTO smartphone_yellowpages (user_id, name, description, category, phone) VALUES
(1, 'LS Customs - Tunagem', 'Tunagem completa, pintura, blindagem. Orçamento grátis!', 'Mecânica', '555-0100'),
(1, 'Agência Soluções Digitais', 'Sites, apps e sistemas. Orçamento online.', 'Tecnologia', '555-0001'),
(2, 'Dr. Marcos - Clínica 24h', 'Atendimento 24h. Emergências e consultas.', 'Saúde', '555-0008'),
(3, 'Adv. Paula Santos', 'Direito criminal e civil. Consulta gratuita.', 'Advocacia', '555-0009'),
(4, 'Lari Fashion Store', 'Roupas importadas, tênis originais. Entrega em LS.', 'Moda', '555-0006'),
(5, 'Rafa Tuner Import', 'Peças importadas JDM e Euro. Instalação inclusa.', 'Mecânica', '555-0007'),
(6, 'Segurança VIP LS', 'Escolta, segurança pessoal e eventos.', 'Segurança', '555-0300'),
(7, 'Corretor Imóveis LS', 'Casas, aptos e terrenos em toda Los Santos.', 'Imóveis', '555-0400'),
(8, 'DJ ThuG - Eventos', 'DJ para festas e eventos. Som profissional.', 'Entretenimento', '555-0500');

-- =====================
-- DISCORD (para testar Servidores + Canais + Chat)
-- =====================
INSERT INTO smartphone_discord_servers (id, name, icon, owner_id) VALUES
(1, 'Los Santos RP', '🎮', 1),
(2, 'Mecânicos LS', '🔧', 7),
(3, 'Polícia LS', '🚔', 8);

INSERT INTO smartphone_discord_channels (server_id, name, type, position) VALUES
(1, 'geral', 'text', 1),
(1, 'anúncios', 'announcements', 2),
(1, 'memes', 'text', 3),
(2, 'orçamentos', 'text', 1),
(2, 'peças-import', 'text', 2),
(3, 'ocorrências', 'text', 1),
(3, 'avisos', 'announcements', 2);

INSERT INTO smartphone_discord_members (server_id, user_id, role, role_color) VALUES
(1, 1, 'Admin', '#FF6B6B'),
(1, 2, 'Membro', '#4ECDC4'),
(1, 3, 'Membro', '#4ECDC4'),
(1, 5, 'Mod', '#FFE66D'),
(2, 7, 'Admin', '#FF6B6B'),
(2, 1, 'Cliente', '#4ECDC4'),
(2, 3, 'Cliente', '#4ECDC4'),
(3, 8, 'Chefe', '#FF6B6B'),
(3, 1, 'Civil', '#4ECDC4');

INSERT INTO smartphone_discord_messages (channel_id, user_id, username, role_color, message) VALUES
(1, 1, 'carlos_silva', '#FF6B6B', 'Bem-vindos ao servidor! Leiam as regras.'),
(1, 2, 'maria_ls', '#4ECDC4', 'Oi pessoal! 👋'),
(1, 3, 'joao_grau', '#4ECDC4', 'Salve salve!'),
(1, 5, 'pedro_mg', '#FFE66D', 'Evento de sábado confirmado!'),
(3, 2, 'maria_ls', '#4ECDC4', 'Manda o orçamento do Elegy?'),
(3, 7, 'rafa_tuner', '#FF6B6B', 'V8 completo: R$15k. Turbo: R$8k extra.'),
(3, 1, 'carlos_silva', '#4ECDC4', 'Quero o pacote completo!');

-- =====================
-- NOTAS (para testar Notes > Lista + Editor)
-- =====================
INSERT INTO smartphone_notes (phone, title, content) VALUES
('555-0001', 'Lista de compras', '- Arroz\n- Feijão\n- Carne\n- Refrigerante\n- Pão'),
('555-0001', 'Senhas importantes', 'Banco: ****\nEmail: ****\nWifi casa: losantos123'),
('555-0001', 'Ideias pro negócio', '1. Abrir loja no marketplace\n2. Vender carros importados\n3. Delivery de comida\n4. Segurança privada'),
('555-0001', 'Contatos úteis', 'Mecânico: 555-0010\nAdvogado: 555-0009\nMédico: 555-0008'),
('555-0001', 'Treino da semana', 'Seg: Peito/Tríceps\nTer: Costas/Bíceps\nQua: Pernas\nQui: Ombro/Trap\nSex: Full body'),
('555-0001', 'Receita de bolo', '3 ovos, 2 xícaras farinha, 1 xícara leite, 1 xícara açúcar, 1 colher fermento');

-- =====================
-- SPOTIFY (playlists + músicas)
-- =====================
INSERT INTO smartphone_spotify_playlists (id, name, cover, description) VALUES
(1, 'Rap Nacional', '🎤', 'Os clássicos do rap BR'),
(2, 'Trap BR', '🔥', 'Trap pesado nacional'),
(3, 'Lo-Fi Beats', '🎧', 'Para relaxar e codar'),
(4, 'Funk', '💃', 'Pancadão de LS'),
(5, 'Rock Clássico', '🎸', 'Lendas do rock');

INSERT INTO smartphone_spotify_songs (playlist_id, name, artist, dur, track_order) VALUES
(1, 'Vida Loka Pt.2', 'Racionais MCs', '5:42', 1),
(1, 'Negro Drama', 'Racionais MCs', '6:32', 2),
(1, 'Diário de um Detento', 'Racionais MCs', '8:18', 3),
(1, 'Aqui é Selva', 'MV Bill', '3:55', 4),
(2, 'Type Beat', 'Matuê', '3:12', 1),
(2, 'M4', 'MC Poze', '2:55', 2),
(2, 'Kenny G', 'MC IG', '2:48', 3),
(2, 'Eu Comprei um Carro', 'Orochi', '3:22', 4),
(3, 'Coffee Shop Vibes', 'Lo-Fi Girl', '3:05', 1),
(3, 'Rainy Day', 'Chillhop', '2:45', 2),
(3, 'Midnight Study', 'Lofi Fruits', '3:30', 3),
(4, 'Bum Bum Tam Tam', 'MC Fioti', '2:42', 1),
(4, 'Envolvimento', 'MC Loma', '2:30', 2),
(4, 'Vai Malandra', 'Anitta', '3:01', 3),
(5, 'Bohemian Rhapsody', 'Queen', '5:55', 1),
(5, 'Stairway to Heaven', 'Led Zeppelin', '8:02', 2),
(5, 'Hotel California', 'Eagles', '6:30', 3);

-- =====================
-- APPSTORE
-- =====================
INSERT INTO smartphone_appstore (user_id, installed_apps) VALUES
(1, '["instagram","whatsapp","ifood","twitter","tiktok","spotify","calculator","notes","camera","gallery","phone","sms","contacts","settings","bank","uber","marketplace"]');

-- ============================================
-- FIM DO SEED DATA
-- Total: ~300 rows em 30+ tabelas
-- Todos os apps testáveis com dados realistas
-- ============================================
