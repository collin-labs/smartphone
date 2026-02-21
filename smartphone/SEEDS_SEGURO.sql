-- ============================================
-- SEEDS COMPLETO — Só INSERT IGNORE
-- 100% seguro pra rodar a qualquer momento
-- Se o dado já existe, pula (IGNORE)
-- NÃO apaga nada, NÃO altera estrutura
-- ============================================


-- =====================
-- APPSTORE
-- =====================
INSERT IGNORE INTO smartphone_appstore (user_id, installed_apps) VALUES
(1, '["instagram","whatsapp","ifood","twitter","tiktok","spotify","calculator","notes","camera","gallery","phone","sms","contacts","settings","bank","uber","marketplace"]');


-- =====================
-- BANK_TRANSACTIONS
-- =====================
INSERT IGNORE INTO smartphone_bank_transactions (from_phone, to_phone, amount, type, description) VALUES
('555-0001', '555-0007', 15000.00, 'pix', 'Pagamento motor V8'),
('555-0002', '555-0001', 500.00, 'pix', 'Racha da festa'),
('555-0001', '555-0006', 2500.00, 'pix', 'Compra roupa'),
('555-0003', '555-0001', 1000.00, 'transfer', 'Dívida paga'),
('555-0001', '555-0008', 350.00, 'pix', 'Consulta médica'),
('555-0005', '555-0001', 200.00, 'pix', 'Personal treino'),
('555-0001', '555-0010', 4500.00, 'pix', 'Mecânico - conserto');


-- =====================
-- CALLS
-- =====================
INSERT IGNORE INTO smartphone_calls (caller_phone, receiver_phone, status, duration, is_anonymous) VALUES
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
-- CONTACTS
-- =====================
INSERT IGNORE INTO smartphone_contacts (user_id, contact_phone, contact_name) VALUES
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
-- DISCORD_CHANNELS
-- =====================
INSERT IGNORE INTO smartphone_discord_channels (server_id, name, type, position) VALUES
(1, 'geral', 'text', 1),
(1, 'anúncios', 'announcements', 2),
(1, 'memes', 'text', 3),
(2, 'orçamentos', 'text', 1),
(2, 'peças-import', 'text', 2),
(3, 'ocorrências', 'text', 1),
(3, 'avisos', 'announcements', 2);


-- =====================
-- DISCORD_MEMBERS
-- =====================
INSERT IGNORE INTO smartphone_discord_members (server_id, user_id, role, role_color) VALUES
(1, 1, 'Admin', '#FF6B6B'),
(1, 2, 'Membro', '#4ECDC4'),
(1, 3, 'Membro', '#4ECDC4'),
(1, 5, 'Mod', '#FFE66D'),
(2, 7, 'Admin', '#FF6B6B'),
(2, 1, 'Cliente', '#4ECDC4'),
(2, 3, 'Cliente', '#4ECDC4'),
(3, 8, 'Chefe', '#FF6B6B'),
(3, 1, 'Civil', '#4ECDC4');


-- =====================
-- DISCORD_MESSAGES
-- =====================
INSERT IGNORE INTO smartphone_discord_messages (channel_id, user_id, username, role_color, message) VALUES
(1, 1, 'carlos_silva', '#FF6B6B', 'Bem-vindos ao servidor! Leiam as regras.'),
(1, 2, 'maria_ls', '#4ECDC4', 'Oi pessoal! 👋'),
(1, 3, 'joao_grau', '#4ECDC4', 'Salve salve!'),
(1, 5, 'pedro_mg', '#FFE66D', 'Evento de sábado confirmado!'),
(3, 2, 'maria_ls', '#4ECDC4', 'Manda o orçamento do Elegy?'),
(3, 7, 'rafa_tuner', '#FF6B6B', 'V8 completo: R$15k. Turbo: R$8k extra.'),
(3, 1, 'carlos_silva', '#4ECDC4', 'Quero o pacote completo!');


-- =====================
-- DISCORD_SERVERS
-- =====================
INSERT IGNORE INTO smartphone_discord_servers (id, name, icon, owner_id) VALUES
(1, 'Los Santos RP', '🎮', 1),
(2, 'Mecânicos LS', '🔧', 7),
(3, 'Polícia LS', '🚔', 8);


-- =====================
-- GRINDR_CHATS
-- =====================
INSERT IGNORE INTO smartphone_grindr_chats (id, user1_id, user1_name, user1_avatar, user2_id, user2_name, user2_avatar, last_message) VALUES
(1, 11, 'Lucas M.', '', 12, 'Thiago R.', '', 'Bora pro Bahama Mamas hj? 🎧'),
(2, 11, 'Lucas M.', '', 13, 'Rafael S.', '', 'Aquele jantar tá de pé? 🍳'),
(3, 14, 'André L.', '', 15, 'Bruno K.', '', 'Adorei sua última tattoo!');


-- =====================
-- GRINDR_MESSAGES
-- =====================
INSERT IGNORE INTO smartphone_grindr_messages (chat_id, sender_id, message) VALUES
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
-- GRINDR_PROFILES
-- =====================
INSERT IGNORE INTO smartphone_grindr_profiles (id, user_id, name, bio, avatar) VALUES
(1, 11, 'Lucas M.', 'Discreto. Curto academia e praia. LS nativo 🏖️', ''),
(2, 12, 'Thiago R.', 'DJ nos fins de semana 🎧 Bora curtir?', ''),
(3, 13, 'Rafael S.', 'Chef de cozinha 🍳 Faço um jantar pra vc', ''),
(4, 14, 'André L.', 'Médico residente. Pouco tempo livre mas compenso 😏', ''),
(5, 15, 'Bruno K.', 'Designer | Tatuador | Art lover 🎨', ''),
(6, 16, 'Felipe G.', 'Personal trainer 💪 Vamos malhar juntos?', ''),
(7, 17, 'Matheus P.', 'Advogado de dia, bartender à noite 🍹', ''),
(8, 18, 'Gustavo N.', 'Fotógrafo. Posso te fotografar? 📸', '');


-- =====================
-- GRINDR_TAPS
-- =====================
INSERT IGNORE INTO smartphone_grindr_taps (sender_id, target_id) VALUES
(2, 1), (3, 1), (5, 1), (4, 2), (6, 3), (1, 4), (7, 5);


-- =====================
-- IFOOD_MENU_ITEMS
-- =====================
INSERT IGNORE INTO smartphone_ifood_menu_items (restaurant_id, name, price, `desc`, popular) VALUES
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


-- =====================
-- IFOOD_ORDERS
-- =====================
INSERT IGNORE INTO smartphone_ifood_orders (user_id, restaurant, items, total, fee, status) VALUES
(1, 'Burger King LS', '[{"name":"Whopper","qty":2,"price":2990},{"name":"Milk Shake","qty":1,"price":1690}]', 7670, 599, 'delivered'),
(1, 'Sushi Los Santos', '[{"name":"Combo 20 peças","qty":1,"price":5990}]', 5990, 799, 'delivered');


-- =====================
-- IFOOD_RESTAURANTS
-- =====================
INSERT IGNORE INTO smartphone_ifood_restaurants (id, name, category, rating, time, fee, emoji, promo) VALUES
(1, 'Burger King LS', 'Lanches', 4.5, '25-35', 599, 'B', '20% OFF'),
(2, 'Pizza Hut Santos', 'Pizza', 4.7, '30-45', 0, 'P', NULL),
(3, 'Sushi Los Santos', 'Japonesa', 4.8, '40-55', 799, 'S', NULL),
(4, 'Açaí do Grau', 'Açaí', 4.6, '20-30', 0, 'A', 'Frete grátis'),
(5, 'Churrascaria LS', 'Brasileira', 4.4, '35-50', 899, 'C', NULL),
(6, 'Padaria Pão Quente', 'Lanches', 4.2, '15-25', 399, 'P', NULL),
(7, 'Wok Express', 'Chinesa', 4.3, '30-40', 699, 'W', '10% OFF'),
(8, 'Tacos El Gringo', 'Mexicana', 4.1, '25-35', 499, 'T', NULL);


-- =====================
-- INSTAGRAM_COMMENTS
-- =====================
INSERT IGNORE INTO smartphone_instagram_comments (post_id, profile_id, text) VALUES
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


-- =====================
-- INSTAGRAM_FOLLOWS
-- =====================
INSERT IGNORE INTO smartphone_instagram_follows (follower_id, following_id) VALUES
(1,2),(1,3),(1,4),(1,5),(1,6),(1,7),(2,1),(2,3),(2,4),
(3,1),(3,2),(3,7),(4,1),(4,2),(4,5),(5,1),(5,3),(5,4),
(6,1),(6,2),(6,4),(7,1),(7,3),(7,10),(8,1),(9,1),(10,7);


-- =====================
-- INSTAGRAM_LIKES
-- =====================
INSERT IGNORE INTO smartphone_instagram_likes (profile_id, post_id) VALUES
(1,1),(1,3),(1,5),(2,2),(2,4),(2,7),(3,1),(3,5),(3,9),
(4,1),(4,2),(4,6),(5,3),(5,7),(5,12),(6,1),(6,4),(6,8),
(7,2),(7,10),(7,14),(8,7),(8,15),(9,1),(9,7),(10,2),(10,6);


-- =====================
-- INSTAGRAM_POSTS
-- =====================
INSERT IGNORE INTO smartphone_instagram_posts (id, profile_id, image, caption) VALUES
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


-- =====================
-- INSTAGRAM_PROFILES
-- =====================
INSERT IGNORE INTO smartphone_instagram_profiles (id, user_id, username, name, bio, avatar) VALUES
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


-- =====================
-- INSTAGRAM_STORIES
-- =====================
INSERT IGNORE INTO smartphone_instagram_stories (profile_id, image, expires_at) VALUES
(2, '', DATE_ADD(NOW(), INTERVAL 20 HOUR)),
(3, '', DATE_ADD(NOW(), INTERVAL 18 HOUR)),
(5, '', DATE_ADD(NOW(), INTERVAL 15 HOUR)),
(6, '', DATE_ADD(NOW(), INTERVAL 12 HOUR)),
(7, '', DATE_ADD(NOW(), INTERVAL 10 HOUR));


-- =====================
-- LINKEDIN_APPLICATIONS
-- =====================
INSERT IGNORE INTO smartphone_linkedin_applications (job_id, applicant_id, message, status) VALUES
(1, 3, 'Tenho experiência com tecnologia e estou buscando nova oportunidade. Quando posso começar?', 'pending'),
(1, 5, 'Sou autodidata em programação e gostaria de aprender mais na prática.', 'pending'),
(4, 3, 'Tenho experiência servindo drinks em festas. Sou comunicativo e pontual.', 'accepted'),
(4, 5, 'Procurando renda extra nos fins de semana. Tenho boa apresentação.', 'pending'),
(7, 3, 'Sou apaixonado por carros e quero aprender tunagem profissional!', 'accepted'),
(2, 4, 'Tenho curso técnico em enfermagem e experiência em pronto-socorro.', 'pending');


-- =====================
-- LINKEDIN_CONNECTIONS
-- =====================
INSERT IGNORE INTO smartphone_linkedin_connections (requester_id, target_id, status) VALUES
(1, 2, 'accepted'), (1, 4, 'accepted'), (1, 5, 'accepted'), (1, 8, 'accepted'),
(1, 9, 'accepted'), (2, 5, 'accepted'), (2, 6, 'accepted'), (2, 8, 'accepted'),
(3, 7, 'accepted'), (3, 1, 'pending'), (4, 5, 'accepted'), (4, 6, 'accepted'),
(5, 8, 'accepted'), (6, 9, 'accepted'), (7, 10, 'accepted'), (8, 9, 'accepted'),
(9, 10, 'accepted'), (10, 1, 'accepted');


-- =====================
-- LINKEDIN_JOBS
-- =====================
INSERT IGNORE INTO smartphone_linkedin_jobs (id, poster_id, company, title, description, salary_min, salary_max, location, type, status, applicants_count) VALUES
(1, 1, 'Agência Soluções Digitais', 'Desenvolvedor Full-Stack', 'Buscamos dev com experiência em React, Node.js e banco de dados. Trabalho presencial no escritório em Vinewood.', 5000, 8000, 'Vinewood', 'full-time', 'open', 3),
(2, 8, 'Pillbox Hill Medical', 'Enfermeiro(a)', 'Plantão 12h. Experiência em emergência desejável. Benefícios: plano de saúde, vale alimentação.', 3500, 5000, 'Pillbox Hill', 'full-time', 'open', 5),
(3, 8, 'Pillbox Hill Medical', 'Paramédico', 'Atendimento pré-hospitalar. CNH categoria D obrigatória. Treinamento oferecido pela instituição.', 3000, 4500, 'Los Santos', 'full-time', 'open', 2),
(4, 2, 'Bahama Mamas', 'Bartender', 'Preparar drinks, atender clientes VIP. Experiência em coquetelaria é um diferencial. Noturno.', 2000, 3500, 'Bahama Mamas', 'part-time', 'open', 8),
(5, 2, 'Bahama Mamas', 'Segurança', 'Controle de entrada, segurança do estabelecimento. Porte físico e experiência em segurança privada.', 3000, 4000, 'Bahama Mamas', 'full-time', 'open', 4),
(6, 6, 'Lari Fashion Store', 'Vendedora', 'Atendimento ao cliente, organização de vitrine, controle de estoque. Gostar de moda é essencial!', 1800, 2500, 'Vinewood', 'full-time', 'open', 6),
(7, 7, 'Rafa Tuner Import', 'Aprendiz de Mecânico', 'Aprenda tunagem profissional. Sem experiência necessária, apenas vontade de aprender. Início imediato.', 1500, 2000, 'LS Customs', 'full-time', 'open', 3),
(8, 10, 'LS Customs', 'Mecânico Experiente', 'Mínimo 2 anos de experiência. Motor, suspensão, freios. Salário + comissão por serviço.', 4000, 6000, 'LS Customs', 'full-time', 'open', 2),
(9, 10, 'LS Customs', 'Pintor Automotivo', 'Pintura automotiva, envelopamento, detailing. Experiência comprovada.', 3000, 5000, 'LS Customs', 'full-time', 'open', 1),
(10, 4, 'Freelancer', 'Assistente de Fotografia', 'Me ajude em ensaios e eventos. Equipamento fornecido. Horários flexíveis. Ótimo para aprender.', 1000, 2000, 'Los Santos', 'freelance', 'open', 2);


-- =====================
-- LINKEDIN_LIKES
-- =====================
INSERT IGNORE INTO smartphone_linkedin_likes (profile_id, post_id) VALUES
(1,2),(1,3),(1,4),(2,1),(2,3),(2,5),(3,1),(3,7),(4,1),(4,5),
(5,1),(5,6),(6,1),(6,4),(7,1),(7,3),(8,1),(8,4),(9,1),(9,2),
(10,1),(10,7),(1,6),(2,4),(3,5),(4,6),(5,7),(6,8),(7,9),(8,10);


-- =====================
-- LINKEDIN_POSTS
-- =====================
INSERT IGNORE INTO smartphone_linkedin_posts (id, profile_id, content, likes_count, comments_count) VALUES
(1, 1, '🚀 Estamos contratando! A Agência Soluções Digitais está em busca de desenvolvedores para projetos inovadores em Los Santos. Se você manja de tecnologia, manda DM!', 24, 8),
(2, 8, '🏥 Orgulho em anunciar: Pillbox Hill Medical Center agora atende 24h com equipe completa. Estamos contratando enfermeiros e paramédicos. Venha salvar vidas conosco!', 45, 12),
(3, 5, '💪 Resultados falam mais que palavras. Meu aluno @joao_grau perdeu 15kg em 3 meses com meu programa de cutting. Quer ser o próximo? Agende sua avaliação!', 38, 15),
(4, 9, '⚖️ IMPORTANTE: Novo decreto sobre porte de armas entra em vigor amanhã. Se você tem dúvidas sobre como isso afeta seus direitos, entre em contato. Consulta gratuita.', 52, 20),
(5, 6, '👗 Coleção de verão chegou na Lari Fashion Store! Tênis importados, roupas de grife. Procuramos vendedoras para a nova filial em Vinewood. Interessadas, me chamem!', 30, 9),
(6, 2, '🎉 Bahama Mamas está contratando! Precisamos de bartenders, seguranças e DJs para a temporada de verão. Experiência desejável mas não obrigatória. Salários competitivos!', 41, 18),
(7, 7, '🔧 Acabei de finalizar um projeto insano: motor V8 biturbo com 850cv num Elegy RH8. Procurando aprendiz de mecânico que queira aprender tunagem de verdade.', 33, 11),
(8, 4, '📸 Disponível para ensaios fotográficos esta semana! Locações: Vespucci Beach, Mount Chiliad, Vinewood Sign. Pacotes a partir de R$500. Portfólio no meu perfil.', 19, 6),
(9, 10, '🔧 LS Customs está expandindo! Precisamos de mecânicos experientes e pintores automotivos. Salário + comissão. Melhor oficina de Los Santos, venha fazer parte!', 27, 7),
(10, 1, '💡 Dica profissional: Em Los Santos, networking é tudo. Já contratei 3 pessoas através desta plataforma. Conectem-se, pessoal!', 35, 14);


-- =====================
-- LINKEDIN_PROFILES
-- =====================
INSERT IGNORE INTO smartphone_linkedin_profiles (id, phone, name, headline, bio, company, position, connections_count) VALUES
(1, '555-0001', 'Carlos Silva', 'CEO & Fundador | Agência Soluções Digitais', 'Empreendedor com experiência em tecnologia e desenvolvimento de soluções digitais para Los Santos. Focado em inovação e crescimento.', 'Agência Soluções Digitais', 'CEO', 8),
(2, '555-0002', 'Maria Santos', 'Event Manager | Bahama Mamas Entertainment', 'Organizo os melhores eventos de Los Santos. Mais de 50 eventos realizados com sucesso.', 'Bahama Mamas', 'Gerente de Eventos', 12),
(3, '555-0003', 'João Silva', 'Street Racer & Import Specialist', 'Especialista em veículos de alta performance. Conexões com fornecedores internacionais de peças JDM e Euro.', 'Underground Racing LS', 'Piloto Principal', 5),
(4, '555-0004', 'Ana Belle', 'Fotógrafa Profissional | Freelancer', 'Capturo os melhores momentos de Los Santos. Ensaios, eventos e paisagens. Portfolio disponível.', 'Freelancer', 'Fotógrafa', 15),
(5, '555-0005', 'Pedro Martins', 'Personal Trainer Certificado | Iron Temple Gym', 'Transformo vidas através do fitness. +100 alunos atendidos. Especialista em hipertrofia e cutting.', 'Iron Temple Gym', 'Personal Trainer', 22),
(6, '555-0006', 'Larissa Santos', 'Founder & CEO | Lari Fashion Store', 'Loja de roupas importadas e tênis originais. Representante oficial de marcas internacionais em LS.', 'Lari Fashion Store', 'CEO', 18),
(7, '555-0007', 'Rafael Costa', 'Master Mechanic | Import Tuning Specialist', 'Certificado em tunagem JDM e Euro. Mais de 200 carros transformados. Motor swap, turbo, suspensão.', 'Rafa Tuner Import', 'Mecânico Chefe', 9),
(8, '555-0008', 'Dr. Marcos Lima', 'Médico | Diretor Clínico Pillbox Hill Medical Center', 'CRM/LS ativo. Especialista em emergências e trauma. Atendimento 24h. Salvando vidas desde 2020.', 'Pillbox Hill Medical', 'Diretor Clínico', 30),
(9, '555-0009', 'Paula Santos', 'Advogada Criminal & Civil | OAB/LS', 'Defesa criminal, contratos, direito civil. Taxa de sucesso de 87%. Consulta inicial gratuita.', 'Santos & Associados', 'Advogada Sênior', 25),
(10, '555-0010', 'José Almeida', 'Gerente | LS Customs Official', 'A maior oficina mecânica de Los Santos. Tunagem, reparo, pintura e blindagem. Orçamento sem compromisso.', 'LS Customs', 'Gerente', 14);


-- =====================
-- MARKETPLACE
-- =====================
INSERT IGNORE INTO smartphone_marketplace (seller_phone, title, description, price, category, image, status) VALUES
('555-0003', 'Elegy RH8 Tunado', 'Motor V6 turbo, pintura metálica azul, rodas importadas. Só venda!', 150000, 'Veículos', '', 'active'),
('555-0004', 'iPhone 15 Pro Max', 'Novo na caixa, lacrado. Garantia 1 ano.', 8500, 'Eletrônicos', '', 'active'),
('555-0005', 'Kit Musculação Completo', 'Banco, barra, anilhas até 100kg. Pouco uso.', 3500, 'Esportes', '', 'active'),
('555-0006', 'Apartamento Vinewood', '2 quartos, sala ampla, garagem. Vista para o Maze Bank.', 500000, 'Imóveis', '', 'active'),
('555-0007', 'Rolex Submariner', 'Original com certificado. Troco em veículo.', 25000, 'Acessórios', '', 'active'),
('555-0001', 'MacBook Pro M3', 'Usado 6 meses, perfeito estado. Com carregador.', 12000, 'Eletrônicos', '', 'active'),
('555-0002', 'Vestido de Festa', 'Usado uma vez. Tamanho M. Marca importada.', 800, 'Moda', '', 'active'),
('555-0010', 'Moto Hakuchou Drag', 'A mais rápida de LS. 300km/h+. Aceito propostas.', 85000, 'Veículos', '', 'active');


-- =====================
-- NOTES
-- =====================
INSERT IGNORE INTO smartphone_notes (phone, title, content) VALUES
('555-0001', 'Lista de compras', '- Arroz\n- Feijão\n- Carne\n- Refrigerante\n- Pão'),
('555-0001', 'Senhas importantes', 'Banco: ****\nEmail: ****\nWifi casa: losantos123'),
('555-0001', 'Ideias pro negócio', '1. Abrir loja no marketplace\n2. Vender carros importados\n3. Delivery de comida\n4. Segurança privada'),
('555-0001', 'Contatos úteis', 'Mecânico: 555-0010\nAdvogado: 555-0009\nMédico: 555-0008'),
('555-0001', 'Treino da semana', 'Seg: Peito/Tríceps\nTer: Costas/Bíceps\nQua: Pernas\nQui: Ombro/Trap\nSex: Full body'),
('555-0001', 'Receita de bolo', '3 ovos, 2 xícaras farinha, 1 xícara leite, 1 xícara açúcar, 1 colher fermento');


-- =====================
-- PAYPAL_TRANSACTIONS
-- =====================
INSERT IGNORE INTO smartphone_paypal_transactions (sender_id, sender_phone, receiver_id, receiver_phone, amount, note) VALUES
(1, '555-0001', 6, '555-0006', 1200.00, 'Tênis importado'),
(2, '555-0002', 1, '555-0001', 300.00, 'Ingresso festa'),
(3, '555-0003', 7, '555-0007', 8000.00, 'Peça importada JDM');


-- =====================
-- PROFILES
-- =====================
INSERT IGNORE INTO smartphone_profiles (id, user_id, phone_number) VALUES
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
-- SMS_CONVERSATIONS
-- =====================
INSERT IGNORE INTO smartphone_sms_conversations (id, is_group) VALUES (1, 0), (2, 0), (3, 0);


-- =====================
-- SMS_MESSAGES
-- =====================
INSERT IGNORE INTO smartphone_sms_messages (conversation_id, sender_phone, message) VALUES
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
-- SMS_PARTICIPANTS
-- =====================
INSERT IGNORE INTO smartphone_sms_participants (conversation_id, phone, unread_count) VALUES
(1, '555-0001', 0), (1, '555-0002', 2),
(2, '555-0001', 0), (2, '555-0008', 0),
(3, '555-0001', 0), (3, '555-0010', 1);


-- =====================
-- TIKTOK_COMMENTS
-- =====================
INSERT IGNORE INTO smartphone_tiktok_comments (video_id, profile_id, comment) VALUES
(1, 1, 'Que carro insano! 🔥'),
(1, 2, 'Eu no banco do passageiro kkk'),
(3, 1, 'Motivação pura! 💪'),
(3, 2, 'Vou começar amanhã juro'),
(5, 4, 'Melhor fuga que já vi kkkkk'),
(5, 1, 'O cara é brabo demais');


-- =====================
-- TIKTOK_FOLLOWS
-- =====================
INSERT IGNORE INTO smartphone_tiktok_follows (follower_id, following_id) VALUES
(1,2),(1,3),(1,4),(1,5),(2,1),(2,3),(3,1),(3,5),(4,1),(4,2),(5,1),(5,3);


-- =====================
-- TIKTOK_LIKES
-- =====================
INSERT IGNORE INTO smartphone_tiktok_likes (profile_id, video_id) VALUES
(1,1),(1,2),(1,4),(2,3),(2,5),(3,2),(3,6),(4,1),(4,3),(5,1),(5,4);


-- =====================
-- TIKTOK_PROFILES
-- =====================
INSERT IGNORE INTO smartphone_tiktok_profiles (id, phone, username, display_name, bio, followers_count, following_count) VALUES
(1, '555-0001', 'carlos.dev', 'Carlos Silva', 'Tech + RP', 1250, 340),
(2, '555-0002', 'maria.ls', 'Maria Santos', 'Festas & Vibes 🎉', 8900, 120),
(3, '555-0003', 'joao.grau', 'João Grau', 'Grau nas ruas de LS 🏎️', 15600, 89),
(4, '555-0004', 'ana.belle', 'Ana Belle', 'Fotografia & Lifestyle', 5400, 230),
(5, '555-0005', 'pedro.fit', 'Pedro Fitness', 'Treino & Motivação 💪', 22000, 150);


-- =====================
-- TIKTOK_VIDEOS
-- =====================
INSERT IGNORE INTO smartphone_tiktok_videos (id, profile_id, caption, likes_count, comments_count, views_count) VALUES
(1, 3, 'De 0 a 200 no Elegy 🏎️ #grau #drift', 4500, 230, 45000),
(2, 2, 'Tutorial de makeup pra festa 💄 #festeira', 2300, 120, 18000),
(3, 5, 'Treino de peito completo em 15min ⏱️ #gym', 8900, 450, 89000),
(4, 4, 'Lugares secretos de LS pt.3 📸 #lossantos', 3400, 180, 34000),
(5, 3, 'Fuga épica da polícia (RP) 🚔 #roleplay', 12000, 890, 120000),
(6, 1, 'Como programar em 2026 💻 #tech #dev', 1800, 95, 15000),
(7, 2, 'Bahama Mamas vlog 🍸 #nightlife', 5600, 340, 56000),
(8, 5, 'Dieta de cutting: o que eu como num dia 🥗', 6700, 280, 67000);


-- =====================
-- TINDER_MATCHES
-- =====================
INSERT IGNORE INTO smartphone_tinder_matches (id, profile1_id, profile2_id) VALUES
(1, 1, 2),
(2, 1, 3),
(3, 4, 6);


-- =====================
-- TINDER_MESSAGES
-- =====================
INSERT IGNORE INTO smartphone_tinder_messages (match_id, sender_id, message) VALUES
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
-- TINDER_PROFILES
-- =====================
INSERT IGNORE INTO smartphone_tinder_profiles (id, phone, name, age, bio, photos, gender, interest) VALUES
(1, '555-0001', 'Carlos', 26, 'Empreendedor, apaixonado por tecnologia e carros. Procurando alguém pra curtir LS juntos 🌆', '[]', 'male', 'female'),
(2, '555-0002', 'Maria', 24, 'Amo festas, praia e boas companhias. Me leva pro Bahama Mamas? 🍸', '[]', 'female', 'male'),
(3, '555-0004', 'Ana', 23, 'Fotógrafa. Vou te levar pros melhores cenários de LS 📸', '[]', 'female', 'male'),
(4, '555-0006', 'Larissa', 25, 'Dona de loja. Fashion é minha vida 👗', '[]', 'female', 'male'),
(5, '555-0003', 'João', 27, 'Se vc curte adrenalina, me dá match 🏎️', '[]', 'male', 'female'),
(6, '555-0005', 'Pedro', 28, 'Personal trainer. Vamos treinar juntos? 💪', '[]', 'male', 'female'),
(7, '555-0009', 'Paula', 30, 'Advogada. Inteligência é o melhor shape ⚖️', '[]', 'female', 'male');


-- =====================
-- TINDER_SWIPES
-- =====================
INSERT IGNORE INTO smartphone_tinder_swipes (swiper_id, swiped_id, direction) VALUES
(1, 2, 'right'), (2, 1, 'right'),
(1, 3, 'right'), (3, 1, 'right'),
(1, 4, 'right'),
(5, 2, 'right'), (2, 5, 'left'),
(6, 4, 'right'), (4, 6, 'right');


-- =====================
-- TOR_MESSAGES
-- =====================
INSERT IGNORE INTO smartphone_tor_messages (channel, user_id, alias, message) VALUES
('general', 10, 'Shadow', 'Alguém tem lockpick?'),
('general', 11, 'Ghost', 'Tenho sim, fala no PV'),
('general', 12, 'Phantom', 'Placa clonada, alguém?'),
('general', 10, 'Shadow', 'Manda msg, tenho estoque');


-- =====================
-- TOR_STORE
-- =====================
INSERT IGNORE INTO smartphone_tor_store (name, price, available) VALUES
('Lockpick Set', 500, 1),
('Documento Falso', 2000, 1),
('Escuta Telefônica', 1500, 1),
('Placa Clonada', 3000, 1),
('Radio Freq. Policial', 5000, 1),
('Colete Kevlar III-A', 15000, 1),
('GPS Rastreador Mini', 3000, 1),
('Silenciador', 8000, 1);


-- =====================
-- TWITTER_LIKES
-- =====================
INSERT IGNORE INTO smartphone_twitter_likes (profile_id, tweet_id) VALUES
(1,2),(1,4),(2,1),(2,5),(3,1),(3,8),(4,2),(4,8),(5,2),(5,3),(6,7),(7,1);


-- =====================
-- TWITTER_PROFILES
-- =====================
INSERT IGNORE INTO smartphone_twitter_profiles (id, user_id, username, display_name, bio, verified) VALUES
(1, 1, 'carlos_dev', 'Carlos Silva', 'CEO Agência Soluções Digitais | LS', 0),
(2, 2, 'maria_ls', 'Maria Santos', 'Curtindo a vida em Los Santos 🌴', 0),
(3, 3, 'joaograu', 'João Grau', 'Velocidade é meu estilo 🏎️', 0),
(4, 4, 'anabelle', 'Ana Belle', 'Fotografando LS uma foto por vez 📸', 0),
(5, 5, 'pedromg', 'Pedro MG', 'Treino, disciplina, resultado 💪', 0),
(6, 8, 'dr_marcos', 'Dr. Marcos Lima', 'Médico | Pillbox Hill Medical Center', 1),
(7, 9, 'adv_paula_s', 'Adv. Paula Santos', 'Justiça para todos ⚖️ | OAB/LS', 1);


-- =====================
-- TWITTER_TWEETS
-- =====================
INSERT IGNORE INTO smartphone_twitter_tweets (id, profile_id, content, image) VALUES
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


-- =====================
-- UBER_RIDES
-- =====================
INSERT IGNORE INTO smartphone_uber_rides (passenger_id, passenger_phone, driver_id, driver_phone, destination, ride_type, estimated_price, price, status, rating) VALUES
(1, '555-0001', 3, '555-0003', 'Bahama Mamas', 'comfort', 2500, 2500, 'completed', 5),
(1, '555-0001', 5, '555-0005', 'Pillbox Hill Medical', 'economy', 1800, 1800, 'completed', 4),
(1, '555-0001', 3, '555-0003', 'Maze Bank Tower', 'premium', 3500, 3500, 'completed', 5),
(2, '555-0002', 1, '555-0001', 'Vespucci Beach', 'economy', 1200, 1200, 'completed', 5);


-- =====================
-- WAZE_HISTORY
-- =====================
INSERT IGNORE INTO smartphone_waze_history (user_id, destination) VALUES
(1, 'Bahama Mamas'), (1, 'Pillbox Hill'), (1, 'LS Customs'),
(1, 'Maze Bank Tower'), (1, 'Vespucci Beach');


-- =====================
-- WAZE_REPORTS
-- =====================
INSERT IGNORE INTO smartphone_waze_reports (user_id, type) VALUES
(1, 'police'), (2, 'accident'), (3, 'traffic'), (1, 'hazard');


-- =====================
-- WEAZEL_ARTICLES
-- =====================
INSERT IGNORE INTO smartphone_weazel_articles (author_id, author_name, title, body, category, is_breaking) VALUES
(1, 'Sandra Lee', 'Tiroteio em Vinewood Boulevard', 'A polícia de Los Santos respondeu a um chamado de tiroteio na região de Vinewood Boulevard na madrugada de hoje. Três suspeitos foram detidos e encaminhados à delegacia central. Não houve vítimas fatais.', 'Cidade', 1),
(1, 'Tom Rivers', 'Nova ponte ligando Paleto Bay será inaugurada', 'O prefeito anunciou a construção de uma nova ponte conectando Paleto Bay ao centro de Los Santos, com previsão de conclusão em 6 meses. O investimento é de R$ 2 milhões.', 'Política', 0),
(2, 'Maria Costa', 'Preços de imóveis em alta no centro', 'O mercado imobiliário de Los Santos registrou alta de 15% nos preços de apartamentos na região central nos últimos 3 meses. Especialistas apontam crescimento da cidade.', 'Economia', 0),
(3, 'Ana Reporter', 'Festival de música confirmado para sábado', 'O evento acontecerá na praia de Vespucci e contará com shows ao vivo, food trucks e atividades para toda a família. Entrada gratuita.', 'Entretenimento', 0),
(1, 'Sandra Lee', 'Perseguição policial termina em Blaine County', 'Após 40 minutos de perseguição, dois suspeitos foram capturados em Blaine County. A LSPD usou helicóptero na operação.', 'Cidade', 1);


-- =====================
-- WHATSAPP_CHATS
-- =====================
INSERT IGNORE INTO smartphone_whatsapp_chats (id, type, is_group, group_name, created_by) VALUES
(1, 'private', 0, NULL, NULL),
(2, 'private', 0, NULL, NULL),
(3, 'group', 1, 'Grupo da Firma', 1),
(4, 'private', 0, NULL, NULL),
(5, 'private', 0, NULL, NULL),
(6, 'group', 1, 'Churrasco Sábado', 2);


-- =====================
-- WHATSAPP_MESSAGES
-- =====================
INSERT IGNORE INTO smartphone_whatsapp_messages (chat_id, sender_phone, sender_name, message, type, is_read) VALUES
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
-- WHATSAPP_PARTICIPANTS
-- =====================
INSERT IGNORE INTO smartphone_whatsapp_participants (chat_id, phone, unread_count) VALUES
(1, '555-0001', 0), (1, '555-0002', 3),
(2, '555-0001', 0), (2, '555-0003', 1),
(3, '555-0001', 0), (3, '555-0002', 0), (3, '555-0003', 0), (3, '555-0005', 0),
(4, '555-0001', 0), (4, '555-0004', 0),
(5, '555-0001', 0), (5, '555-0007', 0),
(6, '555-0001', 0), (6, '555-0002', 0), (6, '555-0005', 0), (6, '555-0006', 0);


-- =====================
-- YELLOWPAGES
-- =====================
INSERT IGNORE INTO smartphone_yellowpages (user_id, name, description, category, phone) VALUES
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
-- YOUTUBE_CHANNELS
-- =====================
INSERT IGNORE INTO smartphone_youtube_channels (id, name, description, subscribers_count) VALUES
(1, 'Weazel News LS', 'Canal oficial da Weazel News. Notícias 24h de Los Santos.', 15000),
(2, 'Memes de LS', 'Os melhores memes e momentos engraçados de Los Santos.', 28000),
(3, 'LS Music', 'Música brasileira e internacional. Playlists diárias.', 42000),
(4, 'LS Tutoriais', 'Tutoriais e dicas para a vida em Los Santos.', 8500),
(5, 'Street Racing LS', 'Os melhores rachas e tunagens de Los Santos.', 19000);


-- =====================
-- YOUTUBE_FAVORITES
-- =====================
INSERT IGNORE INTO smartphone_youtube_favorites (phone, video_id) VALUES
('555-0001', 1), ('555-0001', 3), ('555-0001', 8),
('555-0002', 2), ('555-0002', 6);


-- =====================
-- YOUTUBE_HISTORY
-- =====================
INSERT IGNORE INTO smartphone_youtube_history (phone, video_id) VALUES
('555-0001', 1), ('555-0001', 3), ('555-0001', 7), ('555-0001', 8), ('555-0001', 5),
('555-0002', 2), ('555-0002', 6), ('555-0002', 3);


-- =====================
-- YOUTUBE_VIDEOS
-- =====================
INSERT IGNORE INTO smartphone_youtube_videos (id, channel_id, youtube_id, title, category, views_count, likes_count, duration, is_short) VALUES
(1,  3, 'dQw4w9WgXcQ', 'Rick Astley - Never Gonna Give You Up', 'musica', 1500000, 89000, '3:33', 0),
(2,  2, 'J---aiyznGQ', 'Keyboard Cat - O Clássico', 'memes', 850000, 45000, '0:54', 1),
(3,  3, 'kJQP7kiw5Fk', 'Luis Fonsi - Despacito', 'musica', 2800000, 120000, '4:42', 0),
(4,  1, 'HEfHFsfGIhQ', 'Breaking News - Cobertura Ao Vivo', 'noticias', 120000, 8000, '2:15', 0),
(5,  4, 'rfscVS0vtbw', 'Tutorial Python para Iniciantes', 'tutorial', 340000, 22000, '10:24', 0),
(6,  2, 'QH2-TGUlwu4', 'Nyan Cat - 10 Hours', 'memes', 1200000, 67000, '0:30', 1),
(7,  5, '2MtOpB_S0IA', 'Drift Compilation - Best of 2025', 'carros', 560000, 34000, '5:17', 0),
(8,  3, 'fJ9rUzIMcZQ', 'Queen - Bohemian Rhapsody', 'musica', 3200000, 180000, '5:55', 0),
(9,  4, 'Y8Wp3dafaMQ', 'GTA RP - Como Começar', 'tutorial', 89000, 5600, '8:30', 0),
(10, 2, 'dQw4w9WgXcQ', 'Rickroll Compilação', 'memes', 420000, 28000, '1:20', 1),
(11, 5, '9bZkp7q19f0', 'PSY - Gangnam Style (Corrida Edition)', 'carros', 780000, 45000, '4:13', 0),
(12, 1, 'HEfHFsfGIhQ', 'Weazel News - Resumo Semanal', 'noticias', 67000, 3400, '3:45', 0),
(13, 3, 'hT_nvWreIhg', 'Counting Stars - OneRepublic', 'musica', 950000, 56000, '4:17', 0),
(14, 2, 'j5a0jTc9S10', 'Best Fails LS - Compilação #47', 'memes', 310000, 19000, '2:30', 1),
(15, 4, 'pQN-pnXPaVg', 'Tutorial HTML e CSS Completo', 'tutorial', 520000, 31000, '12:08', 0);

