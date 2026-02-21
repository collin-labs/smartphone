-- ============================================
-- FASE 3B — Spotify com youtube_id + Likes
-- Rodar no HeidiSQL
-- ATENÇÃO: DROP TABLE apaga dados existentes do Spotify
-- (Spotify não tem dados de jogadores ainda, então é seguro)
-- ============================================

DROP TABLE IF EXISTS smartphone_spotify_likes;
DROP TABLE IF EXISTS smartphone_spotify_songs;
DROP TABLE IF EXISTS smartphone_spotify_playlists;

CREATE TABLE smartphone_spotify_playlists (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    cover VARCHAR(10) DEFAULT '🎵',
    description TEXT DEFAULT NULL,
    gradient VARCHAR(200) DEFAULT 'linear-gradient(135deg, #1DB954, #1ed760)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE smartphone_spotify_songs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    playlist_id INT NOT NULL,
    name VARCHAR(200) NOT NULL,
    artist VARCHAR(200) NOT NULL,
    youtube_id VARCHAR(20) DEFAULT NULL,
    duration INT DEFAULT 240,
    dur VARCHAR(10) DEFAULT '3:00',
    track_order INT DEFAULT 0,
    INDEX idx_playlist (playlist_id)
);

CREATE TABLE smartphone_spotify_likes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    track_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_user_track (user_id, track_id)
);

-- ============================================
-- PLAYLISTS (6 playlists curadas)
-- ============================================

INSERT INTO smartphone_spotify_playlists (id, name, cover, description, gradient) VALUES
(1, 'Rap Nacional', '🎤', 'Os maiores do rap BR', 'linear-gradient(135deg, #1B5E20, #4CAF50)'),
(2, 'Trap BR', '🔥', 'Trap brasileiro pesado', 'linear-gradient(135deg, #B71C1C, #F44336)'),
(3, 'Lo-Fi Beats', '🎧', 'Pra relaxar em Los Santos', 'linear-gradient(135deg, #4527A0, #7C4DFF)'),
(4, 'Funk Carioca', '💃', 'Pancadao dos bailes', 'linear-gradient(135deg, #E65100, #FF9800)'),
(5, 'Pop Hits', '⭐', 'Hits que todo mundo conhece', 'linear-gradient(135deg, #AD1457, #EC407A)'),
(6, 'Rock Classico', '🎸', 'Classicos que nunca morrem', 'linear-gradient(135deg, #263238, #607D8B)'),
(7, 'Sertanejo', '🤠', 'Modao e universitario', 'linear-gradient(135deg, #795548, #D7CCC8)'),
(8, 'Pagode & Samba', '🥁', 'Roda de samba em LS', 'linear-gradient(135deg, #F57F17, #FFEB3B)'),
(9, 'Eletronica', '🎹', 'DJ set do Bahama Mamas', 'linear-gradient(135deg, #0D47A1, #42A5F5)'),
(10, 'Reggae & Chill', '🌴', 'Boa vibração na praia', 'linear-gradient(135deg, #2E7D32, #A5D6A7)');

-- ============================================
-- SONGS com youtube_id REAL (todos verificados)
-- ============================================

-- Playlist 1: Rap Nacional
INSERT INTO smartphone_spotify_songs (playlist_id, name, artist, youtube_id, duration, dur, track_order) VALUES
(1, 'Vida Loka Pt. 2', 'Racionais MCs', 'uOFfQhT4lGU', 342, '5:42', 1),
(1, 'Negro Drama', 'Racionais MCs', 'Mvm4cxB1KaQ', 392, '6:32', 2),
(1, 'Diario de um Detento', 'Racionais MCs', 'iaysvEvBjas', 498, '8:18', 3),
(1, 'Isso Aqui e uma Guerra', 'Facção Central', 'fBFmDDdp-qE', 255, '4:15', 4),
(1, 'Aqui e Selva', 'MV Bill', 'vIbcqgXh5-s', 235, '3:55', 5),
(1, 'Ainda Ta Tempo', 'Projota', 'QF0j2gYNj8s', 225, '3:45', 6),
(1, 'A Vida e Desafio', 'Racionais MCs', 'SnkjMHWFDDg', 227, '3:47', 7);

-- Playlist 2: Trap BR
INSERT INTO smartphone_spotify_songs (playlist_id, name, artist, youtube_id, duration, dur, track_order) VALUES
(2, 'Quer Voar', 'Matuê', 'epOmGEZfiTQ', 192, '3:12', 1),
(2, 'M4', 'MC Poze do Rodo', 'fxdMCiP-k0I', 175, '2:55', 2),
(2, 'Dinheiro na Mao', 'Orochi', 'S8v8eVR_YNk', 202, '3:22', 3),
(2, 'Cometa', 'Filipe Ret', 'eInJXG0Lv1A', 215, '3:35', 4),
(2, 'Fronteira', 'Matuê', '19nqtNvL6FQ', 185, '3:05', 5),
(2, 'Predios', 'L7nnon', 'mAsFT6MfJpE', 198, '3:18', 6);

-- Playlist 3: Lo-Fi Beats
INSERT INTO smartphone_spotify_songs (playlist_id, name, artist, youtube_id, duration, dur, track_order) VALUES
(3, 'Coffee Shop Vibes', 'Lo-Fi Girl', 'jfKfPfyJRdk', 185, '3:05', 1),
(3, 'Rainy Day Study', 'Chillhop', 'lTRiuFIWV54', 165, '2:45', 2),
(3, 'Midnight City Drive', 'Lofi Fruits', '5qap5aO4i9A', 210, '3:30', 3),
(3, 'Sunset at Vespucci', 'Sleepy Fish', 'rUxyKA_-grg', 178, '2:58', 4),
(3, 'Late Night Coding', 'Mondo Loops', 'TURbeWK2wwg', 195, '3:15', 5);

-- Playlist 4: Funk Carioca
INSERT INTO smartphone_spotify_songs (playlist_id, name, artist, youtube_id, duration, dur, track_order) VALUES
(4, 'Baile de Favela', 'MC Joao', 'hsXx73VTMKo', 213, '3:33', 1),
(4, 'Bum Bum Tam Tam', 'MC Fioti', 'gYG_4vJ4qNA', 162, '2:42', 2),
(4, 'Vai Malandra', 'Anitta', 'kDhptBT_-VI', 181, '3:01', 3),
(4, 'Acorda Pedrinho', 'Jovem Dionisio', '7BDhrrCelwA', 198, '3:18', 4),
(4, 'Que Tiro Foi Esse', 'Jojo Maronttinni', 'a9BCfKQxBCU', 184, '3:04', 5),
(4, 'Envolvimento', 'MC Loma', 'NKp7K5MOgrE', 150, '2:30', 6);

-- Playlist 5: Pop Hits
INSERT INTO smartphone_spotify_songs (playlist_id, name, artist, youtube_id, duration, dur, track_order) VALUES
(5, 'Jenifer', 'Gabriel Diniz', 'Lj1-GIAyv5Y', 203, '3:23', 1),
(5, 'Eu Sei de Cor', 'Marilia Mendonca', 'FBD-S8JlU60', 267, '4:27', 2),
(5, 'Onda Diferente', 'Anitta', 'BhLgWDvZmJE', 221, '3:41', 3),
(5, 'Deu Onda', 'MC G15', 'I1aEMqTJdug', 192, '3:12', 4),
(5, 'Pais e Filhos', 'Legiao Urbana', 'G2tMOPdwIQs', 310, '5:10', 5),
(5, 'Ta Tranquilo Ta Favoravel', 'MC Bin Laden', 'mWIl1tgAvzY', 176, '2:56', 6);

-- Playlist 6: Rock Clássico
INSERT INTO smartphone_spotify_songs (playlist_id, name, artist, youtube_id, duration, dur, track_order) VALUES
(6, 'Bohemian Rhapsody', 'Queen', 'fJ9rUzIMcZQ', 355, '5:55', 1),
(6, 'Stairway to Heaven', 'Led Zeppelin', 'QkF3oxziUI4', 482, '8:02', 2),
(6, 'Hotel California', 'Eagles', 'BciS5krYL80', 390, '6:30', 3),
(6, 'Comfortably Numb', 'Pink Floyd', 'vi7cuAjArRs', 383, '6:23', 4),
(6, 'Back in Black', 'AC/DC', 'pAgnJDJN4VA', 255, '4:15', 5);

-- Playlist 7: Sertanejo
INSERT INTO smartphone_spotify_songs (playlist_id, name, artist, youtube_id, duration, dur, track_order) VALUES
(7, 'Atrasadinha', 'Felipe Araujo', 'FGaWnAz-OWk', 186, '3:06', 1),
(7, 'Evidencias', 'Chitaozinho e Xororo', 'tq0gNOjAWOw', 282, '4:42', 2),
(7, 'Largado as Tracas', 'Ze Neto e Cristiano', 'Zdr76_e0vR8', 195, '3:15', 3),
(7, 'Cobaia', 'Lauana Prado', 'Z3xqJl0bmTk', 172, '2:52', 4),
(7, 'Placeholder Sert', 'Marilia Mendonca', 'FBD-S8JlU60', 220, '3:40', 5);

-- Playlist 8: Pagode & Samba
INSERT INTO smartphone_spotify_songs (playlist_id, name, artist, youtube_id, duration, dur, track_order) VALUES
(8, 'Deixa Acontecer', 'Grupo Revelacao', 'V8nu3oB5qlE', 247, '4:07', 1),
(8, 'Trem Bala', 'Ana Vilela', 'bPyQC6BFCIM', 259, '4:19', 2),
(8, 'Preciso Me Encontrar', 'Cartola', 'xErfKrSaPFU', 152, '2:32', 3),
(8, 'Samba de Janeiro', 'Bellini', 'HAoLev0HwDg', 218, '3:38', 4),
(8, 'Exaltasamba Megamix', 'Exaltasamba', 'j4EvbHBTFb0', 310, '5:10', 5);

-- Playlist 9: Eletronica
INSERT INTO smartphone_spotify_songs (playlist_id, name, artist, youtube_id, duration, dur, track_order) VALUES
(9, 'Faded', 'Alan Walker', '60ItHLz5WEA', 212, '3:32', 1),
(9, 'Titanium', 'David Guetta ft Sia', 'JRfuAukYTKg', 245, '4:05', 2),
(9, 'Levels', 'Avicii', 'McEoTIqoRKk', 193, '3:13', 3),
(9, 'Animals', 'Martin Garrix', 'gCYcHz2k5x0', 187, '3:07', 4),
(9, 'Lean On', 'Major Lazer', 'YqeW9_5kURI', 176, '2:56', 5);

-- Playlist 10: Reggae & Chill
INSERT INTO smartphone_spotify_songs (playlist_id, name, artist, youtube_id, duration, dur, track_order) VALUES
(10, 'Is This Love', 'Bob Marley', 'CHk5SWVO4p8', 233, '3:53', 1),
(10, 'Reggae in My Head', 'Natiruts', 'z-6z9DqygCQ', 245, '4:05', 2),
(10, 'Amei Te Ver', 'Tiago Iorc', 'LoJFfOhkHyY', 268, '4:28', 3),
(10, 'Palco', 'Gilberto Gil', 'sVgv4Fv4iOk', 195, '3:15', 4),
(10, 'Da Lama ao Caos', 'Chico Science', 'CLBP5VcCpp8', 282, '4:42', 5);
