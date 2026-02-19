-- ============================================
-- SMARTPHONE FIVEM — Schema Completo
-- Agência Soluções Digitais
-- 35 tabelas para 27 apps
-- Execute via oxmysql ou cliente MySQL
-- ============================================

SET NAMES utf8mb4;

-- ============================================
-- CORE: Perfil e Contatos
-- ============================================

CREATE TABLE IF NOT EXISTS smartphone_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    phone_number VARCHAR(20) NOT NULL UNIQUE,
    avatar VARCHAR(255) DEFAULT 'user.jpg',
    wallpaper VARCHAR(100) DEFAULT 'default',
    settings JSON DEFAULT '{}',
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
    UNIQUE KEY unique_contact (user_id, contact_phone),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS smartphone_blocked (
    user_id INT NOT NULL,
    blocked_phone VARCHAR(20) NOT NULL,
    PRIMARY KEY (user_id, blocked_phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- CHAMADAS
-- ============================================

CREATE TABLE IF NOT EXISTS smartphone_calls (
    id INT AUTO_INCREMENT PRIMARY KEY,
    caller_phone VARCHAR(20) NOT NULL,
    receiver_phone VARCHAR(20) NOT NULL,
    status ENUM('missed','answered','rejected') DEFAULT 'missed',
    duration INT DEFAULT 0,
    is_anonymous TINYINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_caller (caller_phone),
    INDEX idx_receiver (receiver_phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- SMS (Conversations model)
-- ============================================

CREATE TABLE IF NOT EXISTS smartphone_sms_conversations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    is_group TINYINT DEFAULT 0,
    name VARCHAR(100) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS smartphone_sms_participants (
    conversation_id INT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    unread_count INT DEFAULT 0,
    PRIMARY KEY (conversation_id, phone),
    INDEX idx_phone (phone),
    FOREIGN KEY (conversation_id) REFERENCES smartphone_sms_conversations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS smartphone_sms_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    conversation_id INT NOT NULL,
    sender_phone VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    media VARCHAR(255) DEFAULT NULL,
    is_deleted TINYINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_conversation (conversation_id),
    FOREIGN KEY (conversation_id) REFERENCES smartphone_sms_conversations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- WHATSAPP
-- ============================================

CREATE TABLE IF NOT EXISTS smartphone_whatsapp_chats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('private','group') DEFAULT 'private',
    name VARCHAR(100) DEFAULT NULL,
    icon VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS smartphone_whatsapp_participants (
    chat_id INT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    unread_count INT DEFAULT 0,
    PRIMARY KEY (chat_id, phone),
    FOREIGN KEY (chat_id) REFERENCES smartphone_whatsapp_chats(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS smartphone_whatsapp_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    chat_id INT NOT NULL,
    sender_phone VARCHAR(20) NOT NULL,
    message TEXT,
    type ENUM('text','image','audio','location') DEFAULT 'text',
    media VARCHAR(255) DEFAULT NULL,
    is_read TINYINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_chat (chat_id),
    FOREIGN KEY (chat_id) REFERENCES smartphone_whatsapp_chats(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- INSTAGRAM
-- ============================================

CREATE TABLE IF NOT EXISTS smartphone_instagram_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    username VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    avatar VARCHAR(255) DEFAULT NULL,
    bio VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS smartphone_instagram_posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    profile_id INT NOT NULL,
    image VARCHAR(255) NOT NULL,
    caption TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (profile_id) REFERENCES smartphone_instagram_profiles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS smartphone_instagram_likes (
    profile_id INT NOT NULL,
    post_id INT NOT NULL,
    PRIMARY KEY (profile_id, post_id),
    FOREIGN KEY (post_id) REFERENCES smartphone_instagram_posts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS smartphone_instagram_comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    profile_id INT NOT NULL,
    text VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES smartphone_instagram_posts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS smartphone_instagram_follows (
    follower_id INT NOT NULL,
    following_id INT NOT NULL,
    PRIMARY KEY (follower_id, following_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS smartphone_instagram_stories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    profile_id INT NOT NULL,
    image VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- TWITTER
-- ============================================

CREATE TABLE IF NOT EXISTS smartphone_twitter_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    username VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    avatar VARCHAR(255) DEFAULT NULL,
    bio VARCHAR(255) DEFAULT NULL,
    header VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS smartphone_twitter_tweets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    profile_id INT NOT NULL,
    text VARCHAR(280) NOT NULL,
    image VARCHAR(255) DEFAULT NULL,
    reply_to INT DEFAULT NULL,
    visible TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (profile_id) REFERENCES smartphone_twitter_profiles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS smartphone_twitter_likes (
    profile_id INT NOT NULL,
    tweet_id INT NOT NULL,
    PRIMARY KEY (profile_id, tweet_id),
    FOREIGN KEY (tweet_id) REFERENCES smartphone_twitter_tweets(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- TIKTOK
-- ============================================

CREATE TABLE IF NOT EXISTS smartphone_tiktok_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    phone VARCHAR(20) NOT NULL UNIQUE,
    username VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) DEFAULT NULL,
    bio VARCHAR(255) DEFAULT '',
    avatar VARCHAR(255) DEFAULT NULL,
    followers_count INT DEFAULT 0,
    following_count INT DEFAULT 0,
    likes_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS smartphone_tiktok_videos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    profile_id INT NOT NULL,
    caption TEXT,
    thumbnail VARCHAR(255) DEFAULT NULL,
    likes_count INT DEFAULT 0,
    comments_count INT DEFAULT 0,
    views_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_profile (profile_id),
    INDEX idx_created (created_at),
    FOREIGN KEY (profile_id) REFERENCES smartphone_tiktok_profiles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS smartphone_tiktok_likes (
    profile_id INT NOT NULL,
    video_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (profile_id, video_id),
    FOREIGN KEY (video_id) REFERENCES smartphone_tiktok_videos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS smartphone_tiktok_comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    video_id INT NOT NULL,
    profile_id INT NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (video_id) REFERENCES smartphone_tiktok_videos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS smartphone_tiktok_follows (
    follower_id INT NOT NULL,
    following_id INT NOT NULL,
    PRIMARY KEY (follower_id, following_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- TINDER
-- ============================================

CREATE TABLE IF NOT EXISTS smartphone_tinder_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    name VARCHAR(50) NOT NULL,
    age INT NOT NULL,
    bio VARCHAR(255) DEFAULT NULL,
    photos JSON DEFAULT NULL,
    preference ENUM('men','women','all') DEFAULT 'all',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS smartphone_tinder_swipes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    swiper_id INT NOT NULL,
    target_id INT NOT NULL,
    direction ENUM('like','nope','superlike') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_swipe (swiper_id, target_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS smartphone_tinder_matches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    profile1_id INT NOT NULL,
    profile2_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS smartphone_tinder_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    match_id INT NOT NULL,
    sender_id INT NOT NULL,
    text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (match_id) REFERENCES smartphone_tinder_matches(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- GRINDR (NOVO)
-- ============================================

CREATE TABLE IF NOT EXISTS smartphone_grindr_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    name VARCHAR(50) NOT NULL,
    age INT NOT NULL,
    bio VARCHAR(255) DEFAULT NULL,
    photo VARCHAR(255) DEFAULT NULL,
    stats JSON DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS smartphone_grindr_taps (
    from_id INT NOT NULL,
    to_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (from_id, to_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS smartphone_grindr_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- BANCO / FINANCEIRO
-- ============================================

CREATE TABLE IF NOT EXISTS smartphone_bank_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    from_phone VARCHAR(20) NOT NULL,
    to_phone VARCHAR(20) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    type ENUM('pix','transfer','paypal','invoice','fine') NOT NULL,
    description VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_from (from_phone),
    INDEX idx_to (to_phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS smartphone_bank_invoices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    from_phone VARCHAR(20) NOT NULL,
    to_phone VARCHAR(20) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    description VARCHAR(255) DEFAULT NULL,
    paid TINYINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS smartphone_bank_fines (
    id INT AUTO_INCREMENT PRIMARY KEY,
    phone VARCHAR(20) NOT NULL,
    officer_phone VARCHAR(20) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    reason VARCHAR(255) NOT NULL,
    paid TINYINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- UBER (NOVO)
-- ============================================

CREATE TABLE IF NOT EXISTS smartphone_uber_drivers (
    phone VARCHAR(20) PRIMARY KEY,
    online TINYINT DEFAULT 0,
    rating_avg DECIMAL(3,2) DEFAULT 5.00,
    total_rides INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS smartphone_uber_rides (
    id INT AUTO_INCREMENT PRIMARY KEY,
    passenger_phone VARCHAR(20) NOT NULL,
    driver_phone VARCHAR(20) DEFAULT NULL,
    origin_x FLOAT, origin_y FLOAT, origin_z FLOAT,
    dest_x FLOAT, dest_y FLOAT, dest_z FLOAT,
    status ENUM('requesting','accepted','in_progress','completed','cancelled') DEFAULT 'requesting',
    fare DECIMAL(10,2) DEFAULT 0,
    rating_passenger TINYINT DEFAULT NULL,
    rating_driver TINYINT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- iFOOD (NOVO)
-- ============================================

CREATE TABLE IF NOT EXISTS smartphone_ifood_restaurants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    owner_phone VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    photo VARCHAR(255) DEFAULT NULL,
    is_open TINYINT DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS smartphone_ifood_menu_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    restaurant_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    photo VARCHAR(255) DEFAULT NULL,
    FOREIGN KEY (restaurant_id) REFERENCES smartphone_ifood_restaurants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS smartphone_ifood_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_phone VARCHAR(20) NOT NULL,
    restaurant_id INT NOT NULL,
    delivery_phone VARCHAR(20) DEFAULT NULL,
    items JSON NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    status ENUM('pending','preparing','delivering','delivered','cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- MARKETPLACE (OLX)
-- ============================================

CREATE TABLE IF NOT EXISTS smartphone_marketplace (
    id INT AUTO_INCREMENT PRIMARY KEY,
    phone VARCHAR(20) NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10,2) DEFAULT 0,
    image VARCHAR(255) DEFAULT NULL,
    category VARCHAR(50) DEFAULT NULL,
    sold TINYINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- UTILIDADES
-- ============================================

CREATE TABLE IF NOT EXISTS smartphone_notes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    phone VARCHAR(20) NOT NULL,
    title VARCHAR(255) DEFAULT '',
    content TEXT DEFAULT '',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS smartphone_gallery (
    id INT AUTO_INCREMENT PRIMARY KEY,
    phone VARCHAR(20) NOT NULL,
    image VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS smartphone_yellowpages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    phone VARCHAR(20) NOT NULL,
    text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS smartphone_weazel_news (
    id INT AUTO_INCREMENT PRIMARY KEY,
    author_phone VARCHAR(20) NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    image VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- TOR / DEEP WEB
-- ============================================

CREATE TABLE IF NOT EXISTS smartphone_tor_channels (
    id INT AUTO_INCREMENT PRIMARY KEY,
    identifier VARCHAR(100) NOT NULL UNIQUE,
    label VARCHAR(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS smartphone_tor_members (
    channel_id INT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    is_owner TINYINT DEFAULT 0,
    PRIMARY KEY (channel_id, phone),
    FOREIGN KEY (channel_id) REFERENCES smartphone_tor_channels(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS smartphone_tor_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    channel_id INT NOT NULL,
    sender_phone VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (channel_id) REFERENCES smartphone_tor_channels(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS smartphone_tor_store (
    id INT AUTO_INCREMENT PRIMARY KEY,
    seller_phone VARCHAR(20) NOT NULL,
    item_name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    description TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- SERVIÇOS DE EMERGÊNCIA
-- ============================================

CREATE TABLE IF NOT EXISTS smartphone_service_calls (
    id INT AUTO_INCREMENT PRIMARY KEY,
    caller_phone VARCHAR(20) NOT NULL,
    service_number VARCHAR(10) NOT NULL,
    message TEXT DEFAULT NULL,
    location_x FLOAT, location_y FLOAT, location_z FLOAT,
    status ENUM('pending','responded','closed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
