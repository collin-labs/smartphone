/**
 * Hook: useNui
 * Comunicação React → client.lua (via NUI fetch)
 * 
 * No FiveM: fetch("http://smartphone/backend") → RegisterNUICallback
 * No browser (dev): retorna mock data
 */

const isInGame = typeof GetParentResourceName === 'function' || 
                 window.__FIVEM_NUI__ === true ||
                 window.invokeNative !== undefined;

const resourceName = isInGame ? 'smartphone' : 'smartphone';

/**
 * Envia request para o backend via NUI → client.lua → server.js
 * @param {string} member - Nome da função backend (ex: 'sms_send')
 * @param {Array} args - Argumentos da função
 * @returns {Promise<any>} Resultado do server
 */
export async function fetchBackend(member, args = {}) {
    if (!isInGame) {
        console.log(`[DEV] backend.${member}(`, args, ')');
        return getMockResponse(member, args);
    }

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

        const response = await fetch(`https://${resourceName}/backend`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ member, args }),
            signal: controller.signal
        });
        clearTimeout(timeout);
        return await response.json();
    } catch (error) {
        console.error(`[NUI] Erro ao chamar ${member}:`, error);
        return { error: error.message };
    }
}

/**
 * Envia request para ações do client.lua
 * @param {string} action - Nome da ação (ex: 'getPlayerPosition')
 * @param {object} data - Dados extras
 */
export async function fetchClient(action, data = {}) {
    if (!isInGame) {
        console.log(`[DEV] client.${action}(`, data, ')');
        return { ok: true };
    }

    try {
        const response = await fetch(`https://${resourceName}/client:action`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, ...data })
        });
        return await response.json();
    } catch (error) {
        console.error(`[NUI] Erro ao chamar action ${action}:`, error);
        return { error: error.message };
    }
}

/**
 * Fecha o celular (avisa o client.lua)
 */
export async function closePhone() {
    if (!isInGame) {
        console.log('[DEV] phone:close');
        return;
    }

    try {
        await fetch(`https://${resourceName}/phone:close`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
        });
    } catch (error) {
        console.error('[NUI] Erro ao fechar celular:', error);
    }
}

/**
 * Verifica se estamos rodando dentro do FiveM
 */
export function useIsInGame() {
    return isInGame;
}

// ============================================
// MOCK DATA (para desenvolvimento no browser)
// ============================================

function getMockResponse(member, args) {
    const mocks = {
        ping: {
            ok: true,
            phone: '555-0001',
            timestamp: Date.now(),
            message: 'Smartphone server online! 🟢 (MOCK)'
        },
        getSettings: {
            phone: '555-0001',
            userId: 1,
            config: { currency: 'R$', bankType: 'nubank', zoom: 100, case: 'iphonexs' },
            settings: { currency: 'R$', bankType: 'nubank', zoom: 100, case: 'iphonexs' },
            identity: { phone: '555-0001', name: 'Carlos Silva' }
        },
        download: {
            phone: '555-0001', userId: 1,
            config: { currency: 'R$' }, settings: { currency: 'R$' },
            identity: { phone: '555-0001', name: 'Carlos Silva' }
        },

        // ============================================
        // INSTAGRAM — Mock Data
        // ============================================
        ig_feed: {
            myProfileId: 1,
            posts: [
                { id: 1, profile_id: 2, username: 'maria_ls', caption: 'Noite perfeita no Bahama Mamas com a galera toda! Quem mais curtiu?', likes_count: 234, comments_count: 18, is_liked: 0, created_at: new Date(Date.now() - 7200000).toISOString() },
                { id: 2, profile_id: 3, username: 'joao_grau', caption: 'Novo carro chegou! V8 turbinado 🔥', likes_count: 567, comments_count: 42, is_liked: 1, created_at: new Date(Date.now() - 14400000).toISOString() },
                { id: 3, profile_id: 4, username: 'ana_belle', caption: 'Pôr do sol em Vespucci Beach. Los Santos nunca decepciona 🌅', likes_count: 891, comments_count: 56, is_liked: 0, created_at: new Date(Date.now() - 28800000).toISOString() },
                { id: 4, profile_id: 5, username: 'pedro_mg', caption: 'Treino pesado hoje! Sem dor sem ganho 💪', likes_count: 123, comments_count: 8, is_liked: 0, created_at: new Date(Date.now() - 43200000).toISOString() },
                { id: 5, profile_id: 6, username: 'lari_santos', caption: 'Abrindo a loja nova amanha! Venham conferir', likes_count: 345, comments_count: 27, is_liked: 1, created_at: new Date(Date.now() - 57600000).toISOString() },
                { id: 6, profile_id: 7, username: 'rafa_tuner', caption: 'Motor ficou pronto, vem buscar o seu! 🏎️', likes_count: 189, comments_count: 15, is_liked: 0, created_at: new Date(Date.now() - 72000000).toISOString() },
                { id: 7, profile_id: 8, username: 'grupo_ls', caption: 'Evento de sábado confirmado na praia!', likes_count: 456, comments_count: 31, is_liked: 0, created_at: new Date(Date.now() - 86400000).toISOString() },
            ]
        },
        ig_explore: {
            myProfileId: 1,
            posts: [
                { id: 10, profile_id: 10, username: 'vinewood_official', caption: 'Red carpet tonight ⭐', likes_count: 2340, comments_count: 180, is_liked: 0 },
                { id: 11, profile_id: 11, username: 'ls_customs', caption: 'Transformação completa! De lata velha pra nave 🚀', likes_count: 1567, comments_count: 92, is_liked: 0 },
                { id: 12, profile_id: 12, username: 'fitness_ls', caption: 'Shape de verão, bora?', likes_count: 891, comments_count: 45, is_liked: 0 },
            ]
        },
        ig_profile: {
            myProfileId: 1,
            profile: {
                id: 1, username: 'carlos_silva', name: 'Carlos Silva',
                bio: 'Empreendedor | Los Santos 🏙️\nAgência Soluções Digitais',
                followers: 1247, following: 356,
                posts: [
                    { id: 20, caption: 'Escritório novo!', created_at: new Date(Date.now() - 172800000).toISOString() },
                    { id: 21, caption: 'Projeto entregue ✅', created_at: new Date(Date.now() - 345600000).toISOString() },
                    { id: 22, caption: 'Café e código', created_at: new Date(Date.now() - 518400000).toISOString() },
                ]
            }
        },
        ig_stories: {
            ok: true,
            stories: [
                { id: 1, profile_id: 2, username: 'maria_ls', image: '', content: 'Noite incrível no Bahama Mamas!', color: '#E1306C', created_at: new Date(Date.now() - 3600000).toISOString() },
                { id: 2, profile_id: 6, username: 'lari_santos', image: '', content: 'Abrindo a loja nova amanha!', color: '#833AB4', created_at: new Date(Date.now() - 7200000).toISOString() },
                { id: 3, profile_id: 3, username: 'joao_grau', image: '', content: 'Bora pro corre hoje à noite?', color: '#405DE6', created_at: new Date(Date.now() - 10800000).toISOString() },
                { id: 4, profile_id: 5, username: 'pedro_mg', image: '', content: 'Treino amanhã cedo, bora?', color: '#FD1D1D', created_at: new Date(Date.now() - 14400000).toISOString() },
                { id: 5, profile_id: 7, username: 'rafa_tuner', image: '', content: 'Peça nova chegou da importação!', color: '#F77737', created_at: new Date(Date.now() - 18000000).toISOString() },
            ]
        },
        ig_story_post: { ok: true, storyId: Date.now() },
        ig_like: { ok: true, liked: !(args?.isLiked) },
        ig_comments: {
            comments: [
                { id: 1, username: 'maria_ls', text: 'Que lindo! 😍', profile_id: 2, created_at: new Date(Date.now() - 3600000).toISOString() },
                { id: 2, username: 'joao_grau', text: 'Top demais mano!', profile_id: 3, created_at: new Date(Date.now() - 7200000).toISOString() },
                { id: 3, username: 'ana_belle', text: 'Quero ir também!', profile_id: 4, created_at: new Date(Date.now() - 10800000).toISOString() },
            ]
        },
        ig_comment: { ok: true, comment: { id: Date.now(), username: 'carlos_silva', text: args?.text || '', profile_id: 1, created_at: new Date().toISOString() } },
        ig_post: { ok: true },
        ig_follow: { ok: true, following: true },
        ig_search: { results: [
            { id: 2, username: 'maria_ls', name: 'Maria Santos', followers: 3456 },
            { id: 3, username: 'joao_grau', name: 'João Grau', followers: 2189 },
            { id: 10, username: 'vinewood_official', name: 'Vinewood', followers: 45600 },
        ]},
        ig_delete_post: { ok: true },

        // ============================================
        // WHATSAPP — Mock Data
        // ============================================
        whatsapp_chats: {
            phone: '555-0001',
            chats: [
                { id: 1, name: 'Maria Santos', type: 'private', otherPhones: ['555-0002'], lastMessage: 'Voce viu o que aconteceu no Bah...', lastMessageAt: new Date(Date.now() - 1200000).toISOString(), lastSender: '555-0002', unreadCount: 3 },
                { id: 2, name: 'Joao Grau', type: 'private', otherPhones: ['555-0003'], lastMessage: 'Bora pro corre hoje a noite?', lastMessageAt: new Date(Date.now() - 5400000).toISOString(), lastSender: '555-0003', unreadCount: 1 },
                { id: 3, name: 'Grupo da Firma', type: 'group', otherPhones: ['555-0002','555-0003','555-0004'], lastMessage: 'Pedro: Reuniao as 20h', lastMessageAt: new Date(Date.now() - 9600000).toISOString(), lastSender: '555-0004', unreadCount: 12 },
                { id: 4, name: 'Ana Belle', type: 'private', otherPhones: ['555-0004'], lastMessage: 'Amei as fotos! Manda mais', lastMessageAt: new Date(Date.now() - 16200000).toISOString(), lastSender: '555-0004', unreadCount: 0 },
                { id: 5, name: 'Pedro MG', type: 'private', otherPhones: ['555-0005'], lastMessage: 'Treino amanha cedo, bora?', lastMessageAt: new Date(Date.now() - 25200000).toISOString(), lastSender: '555-0005', unreadCount: 0 },
                { id: 6, name: 'Lari Santos', type: 'private', otherPhones: ['555-0006'], lastMessage: 'A loja ta ficando linda!', lastMessageAt: new Date(Date.now() - 37800000).toISOString(), lastSender: '555-0006', unreadCount: 0 },
                { id: 7, name: 'Rafa Tuner', type: 'private', otherPhones: ['555-0007'], lastMessage: 'O motor ficou pronto, vem buscar', lastMessageAt: new Date(Date.now() - 86400000).toISOString(), lastSender: '555-0007', unreadCount: 0 },
                { id: 8, name: 'Grupo Los Santos', type: 'group', otherPhones: ['555-0002','555-0005','555-0006'], lastMessage: 'Evento confirmado!', lastMessageAt: new Date(Date.now() - 86400000).toISOString(), lastSender: '555-0005', unreadCount: 0 },
            ]
        },
        whatsapp_messages: {
            messages: [
                { id: 1, chatId: args?.chatId || 1, sender_phone: '555-0002', sender_name: 'Maria Santos', message: 'E aí, tudo bem?', type: 'text', is_read: 1, created_at: new Date(Date.now() - 7200000).toISOString() },
                { id: 2, chatId: args?.chatId || 1, sender_phone: '555-0001', message: 'Tudo ótimo! E você?', type: 'text', is_read: 1, created_at: new Date(Date.now() - 7000000).toISOString() },
                { id: 3, chatId: args?.chatId || 1, sender_phone: '555-0002', sender_name: 'Maria Santos', message: 'Voce viu o que aconteceu no Bahama Mamas ontem?', type: 'text', is_read: 1, created_at: new Date(Date.now() - 3600000).toISOString() },
                { id: 4, chatId: args?.chatId || 1, sender_phone: '555-0002', sender_name: 'Maria Santos', message: 'Olha essa foto!', type: 'text', is_read: 0, created_at: new Date(Date.now() - 3500000).toISOString() },
                { id: 5, chatId: args?.chatId || 1, sender_phone: '555-0002', sender_name: 'Maria Santos', message: 'https://i.imgur.com/placeholder.jpg', type: 'image', is_read: 0, created_at: new Date(Date.now() - 3400000).toISOString() },
            ]
        },
        whatsapp_send: { ok: true, message: { id: Date.now(), chatId: args?.chatId || 1, sender_phone: '555-0001', message: args?.message || '', type: args?.type || 'text', is_read: 0, created_at: new Date().toISOString() } },
        whatsapp_mark_read: { ok: true },
        whatsapp_create_group: { ok: true, chatId: Date.now() },
        whatsapp_delete_chat: { ok: true },
        contacts_list: {
            contacts: [
                { id: 1, name: 'Maria Santos', phone: '555-0002' },
                { id: 2, name: 'Joao Grau', phone: '555-0003' },
                { id: 3, name: 'Ana Belle', phone: '555-0004' },
                { id: 4, name: 'Pedro MG', phone: '555-0005' },
                { id: 5, name: 'Lari Santos', phone: '555-0006' },
                { id: 6, name: 'Rafa Tuner', phone: '555-0007' },
                { id: 7, name: 'Dr. Marcos', phone: '555-0010' },
                { id: 8, name: 'Mecanico Ze', phone: '555-0011' },
            ]
        },

        // ============================================
        // IFOOD — Mock Data
        // ============================================
        ifood_init: {
            restaurants: [
                { id: 1, name: 'Burger King LS', category: 'Lanches', rating: 4.5, time: '25-35', fee: 5.99, emoji: 'B', promo: '20% OFF', items: [
                    { id: 101, name: 'Whopper', price: 29.90, desc: 'Pão, carne, queijo, alface, tomate' },
                    { id: 102, name: 'Chicken Crispy', price: 24.90, desc: 'Frango empanado crocante' },
                    { id: 103, name: 'Onion Rings', price: 14.90, desc: 'Anéis de cebola' },
                    { id: 104, name: 'Milk Shake', price: 16.90, desc: 'Chocolate, morango ou baunilha' },
                ]},
                { id: 2, name: 'Pizza Hut Santos', category: 'Pizza', rating: 4.7, time: '30-45', fee: 0, emoji: 'P', items: [
                    { id: 201, name: 'Margherita', price: 39.90, desc: 'Molho, mussarela, manjericão' },
                    { id: 202, name: 'Pepperoni', price: 44.90, desc: 'Pepperoni, mussarela' },
                    { id: 203, name: 'Calabresa', price: 37.90, desc: 'Calabresa, cebola, mussarela' },
                ]},
                { id: 3, name: 'Sushi Los Santos', category: 'Japonesa', rating: 4.8, time: '40-55', fee: 7.99, emoji: 'S', items: [
                    { id: 301, name: 'Combo 20 peças', price: 59.90, desc: 'Mix de sashimi e sushi' },
                    { id: 302, name: 'Hot Roll', price: 32.90, desc: '10 unidades' },
                    { id: 303, name: 'Temaki Salmão', price: 27.90, desc: 'Salmão fresco' },
                ]},
                { id: 4, name: 'Açaí do Grau', category: 'Acai', rating: 4.6, time: '20-30', fee: 0, emoji: 'A', promo: 'Frete grátis', items: [
                    { id: 401, name: 'Açaí 500ml', price: 18.90, desc: 'Granola, banana, leite condensado' },
                    { id: 402, name: 'Açaí 700ml', price: 24.90, desc: 'Completo com frutas' },
                ]},
                { id: 5, name: 'Churrascaria LS', category: 'Brasileira', rating: 4.4, time: '35-50', fee: 8.99, emoji: 'C', items: [
                    { id: 501, name: 'Picanha na brasa', price: 49.90, desc: 'Com arroz, farofa e vinagrete' },
                    { id: 502, name: 'Costela 12h', price: 54.90, desc: 'Desfiada, com mandioca' },
                ]},
                { id: 6, name: 'Padaria Pão Quente', category: 'Lanches', rating: 4.2, time: '15-25', fee: 3.99, emoji: 'P', items: [
                    { id: 601, name: 'Pão francês (10un)', price: 5.90, desc: 'Quentinho' },
                    { id: 602, name: 'Café com leite', price: 6.90, desc: 'Grande' },
                ]},
            ],
            orders: []
        },
        ifood_order: { ok: true, orderId: Date.now() },

        // ============================================
        // NOTES — Mock Data
        // ============================================
        notes_list: {
            notes: [
                { id: 1, title: 'Lista de compras', content: '- Arroz\n- Feijão\n- Carne\n- Refrigerante\n- Pão', updated_at: new Date(Date.now() - 3600000).toISOString() },
                { id: 2, title: 'Senhas importantes', content: 'Banco: ****\nEmail: ****\nWifi casa: losantos123', updated_at: new Date(Date.now() - 18000000).toISOString() },
                { id: 3, title: 'Ideias pro corre', content: '1. Abrir loja no marketplace\n2. Vender carros importados\n3. Delivery de comida', updated_at: new Date(Date.now() - 86400000).toISOString() },
                { id: 4, title: 'Contatos úteis', content: 'Mecânico: 555-0011\nAdvogado: 555-0020\nDentista: 555-0030', updated_at: new Date(Date.now() - 172800000).toISOString() },
                { id: 5, title: 'Treino da semana', content: 'Seg: Peito/Tríceps\nTer: Costas/Bíceps\nQua: Pernas\nQui: Ombro\nSex: Full body', updated_at: new Date(Date.now() - 259200000).toISOString() },
                { id: 6, title: 'Receita de bolo', content: '3 ovos\n2 xícaras farinha\n1 xícara leite\n1 xícara açúcar\n1 colher fermento', updated_at: new Date(Date.now() - 345600000).toISOString() },
            ]
        },
        notes_save: { ok: true, id: Date.now() },
        notes_delete: { ok: true },

        // ============================================
        // GALLERY — Mock Data
        // ============================================
        gallery_init: {
            photos: [
                { id: 1, url: '', thumbnail: '', created_at: new Date(Date.now() - 86400000).toISOString() },
                { id: 2, url: '', thumbnail: '', created_at: new Date(Date.now() - 172800000).toISOString() },
                { id: 3, url: '', thumbnail: '', created_at: new Date(Date.now() - 259200000).toISOString() },
            ]
        },
        gallery_capture: { ok: true, url: 'https://via.placeholder.com/400x400/333/fff?text=Screenshot' },
        gallery_delete: { ok: true },

        // ============================================
        // CAMERA — Mock Data
        // ============================================
        takeScreenshot: { ok: true, url: 'https://via.placeholder.com/400x400/333/fff?text=Camera' },

        // ============================================
        // TIKTOK — Mock Data (Fase 2 — vídeo real)
        // ============================================
        tiktok_feed: {
            ok: true,
            myProfileId: 1,
            videos: [
                { id: 1, youtube_id: 'dQw4w9WgXcQ', username: 'marina.weazel', display_name: 'Marina Oliveira', avatar: '', caption: 'Cobertura ao vivo do evento beneficente em Vinewood! #WeazelNews #LosSantos', likes_count: 45200, comments_count: 3100, views_count: 120000, is_liked: 0 },
                { id: 2, youtube_id: 'kJQP7kiw5Fk', username: 'rafael.customs', display_name: 'Rafael Santos', avatar: '', caption: 'Transformacao INSANA desse Elegy!! #LSCustoms #Drift', likes_count: 128000, comments_count: 8700, views_count: 560000, is_liked: 0 },
                { id: 3, youtube_id: 'J---aiyznGQ', username: 'memes.ls', display_name: 'Memes de LS', avatar: '', caption: 'POV: voce esta atrasado pro trabalho na Maze Bank KKKKK #MemesLS', likes_count: 256000, comments_count: 12000, views_count: 890000, is_liked: 1 },
                { id: 4, youtube_id: 'fJ9rUzIMcZQ', username: 'ls.music', display_name: 'LS Music Official', avatar: '', caption: 'Bohemian Rhapsody no Bahama Mamas! #Musica #BahamaMamas', likes_count: 89500, comments_count: 5400, views_count: 340000, is_liked: 0 },
                { id: 5, youtube_id: 'QH2-TGUlwu4', username: 'ana.pillbox', display_name: 'Ana Costa', avatar: '', caption: 'Dia a dia no Pillbox Medical #Medicina #Pillbox', likes_count: 34100, comments_count: 2800, views_count: 98000, is_liked: 0 },
                { id: 6, youtube_id: '2MtOpB_S0IA', username: 'street.racing.ls', display_name: 'Street Racing LS', avatar: '', caption: 'DRIFT COMPILATION - Sandy Shores! #StreetRacing #Drift', likes_count: 198000, comments_count: 9200, views_count: 450000, is_liked: 0 },
                { id: 7, youtube_id: 'HEfHFsfGIhQ', username: 'marina.weazel', display_name: 'Marina Oliveira', avatar: '', caption: 'URGENTE: Perseguicao policial pela LS Freeway! #WeazelNews', likes_count: 312000, comments_count: 18000, views_count: 780000, is_liked: 0 },
                { id: 8, youtube_id: 'rfscVS0vtbw', username: 'tech.ls', display_name: 'LS Tutoriais', avatar: '', caption: 'Aprenda Python em 5 minutos! #Tech #Tutorial', likes_count: 67300, comments_count: 4100, views_count: 230000, is_liked: 0 },
            ]
        },
        tiktok_profile: {
            ok: true,
            myProfileId: 1,
            profile: { id: 1, username: 'carlos.silva', display_name: 'Carlos Silva', bio: 'Los Santos lifestyle | Maze Bank employee\nGaming & Cars', followers_count: 12800, following_count: 342, likes_count: 45200 },
            videos: [
                { id: 1, youtube_id: 'dQw4w9WgXcQ', caption: 'Meu primeiro video! #LosSantos', likes_count: 450, comments_count: 23, views_count: 1200 },
            ]
        },
        tiktok_like: { ok: true },
        tiktok_follow: { ok: true },
        tiktok_comment: { ok: true, id: Date.now() },
        tiktok_comments: { ok: true, comments: [
            { id: 1, username: 'marina.weazel', display_name: 'Marina Oliveira', comment: 'Incrivel demais!!', created_at: new Date(Date.now() - 3600000).toISOString() },
            { id: 2, username: 'rafael.customs', display_name: 'Rafael Santos', comment: 'Manda mais desse conteudo!', created_at: new Date(Date.now() - 7200000).toISOString() },
        ]},
        tiktok_post: { ok: true, id: Date.now() },
        tiktok_delete: { ok: true },

        // ============================================
        // YOUTUBE — Mock Data (Fase 2 — vídeo real)
        // ============================================
        youtube_init: {
            ok: true,
            channels: [
                { id: 1, name: 'Weazel News LS', color: '#FF0000', initial: 'W', subscribers_count: 15000 },
                { id: 2, name: 'Memes de LS', color: '#FFD700', initial: 'M', subscribers_count: 28000 },
                { id: 3, name: 'LS Music', color: '#1DB954', initial: '♫', subscribers_count: 42000 },
                { id: 4, name: 'LS Tutoriais', color: '#0A66C2', initial: 'T', subscribers_count: 8500 },
                { id: 5, name: 'Street Racing LS', color: '#FF6B00', initial: 'R', subscribers_count: 19000 },
            ],
            videos: [
                { id: 1, channel_id: 3, youtube_id: 'dQw4w9WgXcQ', title: 'Never Gonna Give You Up - Rick Astley', category: 'musica', duration: '3:33', is_short: 0, views_count: 1500000, likes_count: 45000 },
                { id: 2, channel_id: 2, youtube_id: 'J---aiyznGQ', title: 'Keyboard Cat - O Classico dos Memes', category: 'memes', duration: '0:54', is_short: 1, views_count: 850000, likes_count: 32000 },
                { id: 3, channel_id: 3, youtube_id: 'kJQP7kiw5Fk', title: 'Despacito - Luis Fonsi ft. Daddy Yankee', category: 'musica', duration: '4:42', is_short: 0, views_count: 2800000, likes_count: 89000 },
                { id: 4, channel_id: 1, youtube_id: 'HEfHFsfGIhQ', title: 'URGENTE: Tiroteio em Vinewood Boulevard', category: 'noticias', duration: '2:15', is_short: 0, views_count: 120000, likes_count: 8700 },
                { id: 5, channel_id: 4, youtube_id: 'rfscVS0vtbw', title: 'Python para Iniciantes - Curso Completo', category: 'tutorial', duration: '10:24', is_short: 0, views_count: 340000, likes_count: 21000 },
                { id: 6, channel_id: 5, youtube_id: '2MtOpB_S0IA', title: 'DRIFT INSANO - Compilacao Street Racing LS', category: 'carros', duration: '5:17', is_short: 0, views_count: 560000, likes_count: 34000 },
                { id: 7, channel_id: 3, youtube_id: 'fJ9rUzIMcZQ', title: 'Bohemian Rhapsody - Queen (Classico)', category: 'musica', duration: '5:55', is_short: 0, views_count: 3200000, likes_count: 120000 },
                { id: 8, channel_id: 2, youtube_id: 'QH2-TGUlwu4', title: 'Nyan Cat mas em Los Santos', category: 'memes', duration: '0:30', is_short: 1, views_count: 1200000, likes_count: 56000 },
            ]
        },
        youtube_toggle_favorite: { ok: true, action: 'added' },
        youtube_add_history: { ok: true },

        // ============================================
        // LINKEDIN — Mock Data (Fase 2)
        // ============================================
        linkedin_get_profile: {
            ok: true,
            profile: { id: 1, name: 'Carlos Silva', headline: 'Gerente Operacional na Maze Bank | Los Santos', location: 'Los Santos, San Andreas', connections: 487, followers: 1230, avatarColor: '#0A66C2', initial: 'C' }
        },
        linkedin_get_feed: {
            ok: true,
            posts: [
                { id: 1, profile_id: 2, name: 'Marina Oliveira', headline: 'CEO na Weazel News', avatar: '#FF0000', content: 'Estamos contratando! A Weazel News esta com vagas abertas.', likes_count: 145, comments_count: 32, reposts_count: 8, timeAgo: '2h', liked: 0 },
                { id: 2, profile_id: 3, name: 'Ana Costa', headline: 'Medica na Pillbox Medical', avatar: '#1DB954', content: 'Dia de treinamento na Pillbox Medical!', likes_count: 287, comments_count: 45, reposts_count: 12, timeAgo: '4h', liked: 0 },
            ]
        },
        linkedin_toggle_like: { ok: true },
        linkedin_create_post: { ok: true, postId: Date.now() },
        linkedin_get_jobs: {
            ok: true,
            jobs: [
                { id: 1, title: 'Reporter de Campo', company: 'Weazel News', location: 'Los Santos, SA', salary_range: '$3.500 - $5.000', poster_name: 'Marina Oliveira', applied: 0 },
                { id: 2, title: 'Enfermeiro(a)', company: 'Pillbox Medical Center', location: 'Los Santos, SA', salary_range: '$4.000 - $6.000', poster_name: 'Ana Costa', applied: 0 },
            ]
        },
        linkedin_apply_job: { ok: true },
        linkedin_get_connections: { ok: true, connections: [] },
        linkedin_send_connection: { ok: true },
        linkedin_accept_connection: { ok: true },
        linkedin_reject_connection: { ok: true },
        linkedin_get_professionals: {
            ok: true,
            profiles: [
                { id: 2, name: 'Marina Oliveira', headline: 'CEO na Weazel News', avatar: '#FF0000', connections_count: 487 },
                { id: 3, name: 'Rafael Santos', headline: 'Mecanico Chefe na LS Customs', avatar: '#FF6B00', connections_count: 312 },
                { id: 4, name: 'Ana Costa', headline: 'Medica na Pillbox Medical', avatar: '#1DB954', connections_count: 523 },
                { id: 5, name: 'Pedro Almeida', headline: 'Advogado na Freeman & Associates', avatar: '#9B59B6', connections_count: 198 },
                { id: 6, name: 'Julia Ferreira', headline: 'Corretora na Dynasty 8', avatar: '#E67E22', connections_count: 445 },
                { id: 7, name: 'Lucas Martins', headline: 'Piloto na LS Airlines', avatar: '#3498DB', connections_count: 276 },
                { id: 8, name: 'Fernanda Lima', headline: 'Chef no Bahama Mamas', avatar: '#E74C3C', connections_count: 189 },
            ]
        },

        // ============================================
        // SPOTIFY — Mock Data (Fase 3)
        // ============================================
        spotify_playlists: {
            playlists: [
                { id: 7, name: "Daily Mix 1", desc: "Maria Santos, Joao Grau e mais", gradient: "linear-gradient(135deg, #1DB954, #1ed760)" },
                { id: 8, name: "Descubra", desc: "Baseado no que voce ouve", gradient: "linear-gradient(135deg, #7B1FA2, #E040FB)" },
                { id: 9, name: "Radar", desc: "Novidades pra voce", gradient: "linear-gradient(135deg, #0D47A1, #42A5F5)" },
                { id: 10, name: "Top Brasil", desc: "As mais tocadas em LS", gradient: "linear-gradient(135deg, #E65100, #FF6D00)" },
                { id: 11, name: "Chill Mix", desc: "Relaxe com essas", gradient: "linear-gradient(135deg, #004D40, #00BFA5)" },
            ]
        },
        spotify_quick_access: {
            items: [
                { id: 1, name: "Curtidas", color: "linear-gradient(135deg, #4527A0, #7C4DFF)" },
                { id: 2, name: "Funk 2025", color: "linear-gradient(135deg, #E65100, #FF9800)" },
                { id: 3, name: "Trap BR", color: "linear-gradient(135deg, #B71C1C, #F44336)" },
                { id: 4, name: "Chill Vibes", color: "linear-gradient(135deg, #00695C, #26A69A)" },
                { id: 5, name: "Rock Classico", color: "linear-gradient(135deg, #37474F, #78909C)" },
                { id: 6, name: "Rap Nacional", color: "linear-gradient(135deg, #1B5E20, #4CAF50)" },
            ]
        },
        spotify_library: {
            items: [
                { id: 1, name: "Curtidas", type: "Playlist", count: 10, gradient: "linear-gradient(135deg, #4527A0, #7C4DFF)" },
                { id: 2, name: "Funk 2025", type: "Playlist", count: 8, gradient: "linear-gradient(135deg, #E65100, #FF9800)" },
                { id: 3, name: "Trap BR", type: "Playlist", count: 7, gradient: "linear-gradient(135deg, #B71C1C, #F44336)" },
                { id: 4, name: "Chill Vibes", type: "Playlist", count: 6, gradient: "linear-gradient(135deg, #00695C, #26A69A)" },
                { id: 12, name: "MC Tuner", type: "Artista", count: 0, gradient: "linear-gradient(135deg, #F77737, #E1306C)" },
                { id: 13, name: "Los Santos FM", type: "Podcast", count: 23, gradient: "linear-gradient(135deg, #1E88E5, #42A5F5)" },
            ]
        },
        spotify_playlist_tracks: {
            tracks: [
                { id: 1, name: "Vida Loka Pt. 1", artist: "Racionais MCs", youtube_id: "uOFfQhT4lGU", duration: 287, liked: true },
                { id: 2, name: "Diario de um Detento", artist: "Racionais MCs", youtube_id: "iaysvEvBjas", duration: 502, liked: false },
                { id: 3, name: "Isso Aqui e uma Guerra", artist: "Facção Central", youtube_id: "fBFmDDdp-qE", duration: 312, liked: true },
                { id: 4, name: "Ainda Ta Tempo", artist: "Projota", youtube_id: "QF0j2gYNj8s", duration: 225, liked: false },
                { id: 5, name: "Voce Vai Entender", artist: "Emicida", youtube_id: "SKBWM4cZ1-c", duration: 246, liked: true },
                { id: 6, name: "Boa Noite", artist: "Rincon Sapiencia", youtube_id: "UGAbVBbfeSY", duration: 198, liked: false },
                { id: 7, name: "Mandume", artist: "Emicida ft. Drik Barbosa", youtube_id: "mC_vrzqYfQc", duration: 267, liked: true },
                { id: 8, name: "Papel de Trouxa", artist: "MV Bill", youtube_id: "xmkw1Q-KWn4", duration: 234, liked: false },
                { id: 9, name: "A Vida e Desafio", artist: "Racionais MCs", youtube_id: "FBNW9dGNEp0", duration: 356, liked: true },
                { id: 10, name: "Levanta e Anda", artist: "Emicida", youtube_id: "ZdGDsxBCnQs", duration: 212, liked: false },
            ]
        },
        spotify_search: {
            tracks: [
                { id: 1, name: "Vida Loka Pt. 1", artist: "Racionais MCs", youtube_id: "uOFfQhT4lGU", duration: 287, liked: false },
                { id: 2, name: "Baile de Favela", artist: "MC Joao", youtube_id: "hsXx73VTMKo", duration: 213, liked: false },
                { id: 3, name: "Pais e Filhos", artist: "Legiao Urbana", youtube_id: "G2tMOPdwIQs", duration: 310, liked: true },
            ]
        },
        spotify_like: { liked: true },
        spotify_play: { ok: true },
        spotify_toggle: { ok: true },
        spotify_stop: { ok: true },
    };

    return mocks[member] || { ok: true, mock: true, member };
}
