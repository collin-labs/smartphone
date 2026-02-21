/**
 * Smartphone - Server Main v2.0
 * Agência Soluções Digitais
 * 
 * Fase 2: Rate limiting, player cache, schema completo, contacts
 */

const config = JSON.parse(LoadResourceFile(GetCurrentResourceName(), 'config.json'));

// ============================================
// RATE LIMITER (inspirado no NPWD)
// ============================================

const rateLimits = {};
const RATE_LIMIT_MS = 250;

function isRateLimited(source, handler) {
    const key = `${source}:${handler}`;
    const now = Date.now();
    if (now - (rateLimits[key] || 0) < RATE_LIMIT_MS) return true;
    rateLimits[key] = now;
    return false;
}

setInterval(() => {
    const now = Date.now();
    for (const key in rateLimits) {
        if (now - rateLimits[key] > 30000) delete rateLimits[key];
    }
}, 60000);

// ============================================
// PLAYER CACHE (inspirado no NPWD PlayerService)
// ============================================

const playerCache = {};

function cachePlayer(source, userId, phone) {
    playerCache[source] = { userId, phone, cachedAt: Date.now() };
}

function getCachedPlayer(source) {
    return playerCache[source] || null;
}

function getSourceByPhone(phone) {
    for (const [src, data] of Object.entries(playerCache)) {
        if (data.phone === phone) return parseInt(src);
    }
    return null;
}

function findPlayerSource(userId) {
    for (const [src, data] of Object.entries(playerCache)) {
        if (String(data.userId) === String(userId)) return parseInt(src);
    }
    return null;
}

on('playerDropped', () => { delete playerCache[global.source]; });

// ============================================
// IDENTITY: vRP integration
// ============================================

async function getUserId(source) {
    try {
        if (exports.vrp && exports.vrp.getUserId) {
            return exports.vrp.getUserId(source);
        }
    } catch (e) {}
    return source; // Fallback para testes
}

function userIdToPhone(userId) {
    if (!userId) return '000-000';
    const p = String(userId).padStart(6, '0');
    return p.slice(0, 3) + '-' + p.slice(3);
}

function phoneToUserId(phone) {
    return parseInt((phone || '').replace(/[^0-9]/g, '')) || 0;
}

async function getPhoneFromSource(source) {
    const cached = getCachedPlayer(source);
    if (cached) return cached.phone;
    const userId = await getUserId(source);
    const phone = userIdToPhone(userId);
    cachePlayer(source, userId, phone);
    return phone;
}

async function getUserIdCached(source) {
    const cached = getCachedPlayer(source);
    if (cached) return cached.userId;
    const userId = await getUserId(source);
    const phone = userIdToPhone(userId);
    cachePlayer(source, userId, phone);
    return userId;
}

// ============================================
// DATABASE HELPERS
// ============================================

function dbPromise(method, query, params = []) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            reject(new Error(`DB timeout: ${query.slice(0, 60)}`));
        }, 8000);
        try {
            exports['oxmysql'][method](query, params, (result) => {
                clearTimeout(timer);
                resolve(result);
            });
        } catch (e) {
            clearTimeout(timer);
            reject(e);
        }
    });
}

function dbQuery(query, params = []) {
    return dbPromise('query', query, params).then(r => r || []);
}
function dbScalar(query, params = []) {
    return dbPromise('scalar', query, params);
}
function dbInsert(query, params = []) {
    return dbPromise('insert', query, params);
}
function dbUpdate(query, params = []) {
    return dbPromise('update', query, params);
}
async function dbSingle(query, params = []) {
    const rows = await dbQuery(query, params);
    return rows && rows.length > 0 ? rows[0] : null;
}

// ============================================
// HANDLER REGISTRY + ROUTER
// ============================================

const handlers = {};

function registerHandler(name, fn) {
    handlers[name] = fn;
}

onNet('smartphone:backend:req', async (id, member, args) => {
    const source = global.source;

    if (isRateLimited(source, member)) {
        emitNet('smartphone:backend:res', source, id, { error: 'rate_limited' });
        return;
    }

    try {
        const handler = handlers[member];
        if (!handler) {
            emitNet('smartphone:backend:res', source, id, { error: 'handler_not_found', member });
            return;
        }
        const result = await handler(source, args);
        emitNet('smartphone:backend:res', source, id, result);
    } catch (error) {
        console.error(`[SMARTPHONE] Erro '${member}':`, error.message);
        emitNet('smartphone:backend:res', source, id, { error: error.message });
    }
});

// ============================================
// PUSHER
// ============================================

function pushToPlayer(target, event, payload) {
    emitNet('smartphone:pusher', target, event, payload);
}

function pushToAll(event, payload) {
    emitNet('smartphone:pusher', -1, event, payload);
}

// ============================================
// PROFILE: Criar/buscar perfil automaticamente
// ============================================

async function ensureProfile(source) {
    const phone = await getPhoneFromSource(source);
    const userId = await getUserIdCached(source);

    let profile = await dbSingle(
        'SELECT * FROM smartphone_profiles WHERE phone_number = ?', [phone]
    );

    if (!profile) {
        await dbQuery(
            'INSERT INTO smartphone_profiles (user_id, phone_number) VALUES (?, ?)',
            [userId, phone]
        );
        profile = { user_id: userId, phone_number: phone, avatar: 'user.jpg', wallpaper: 'default', settings: '{}' };
    }

    return profile;
}

// ============================================
// INIT DATABASE
// ============================================

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForOxmysql(maxRetries = 15) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            // Primeiro verifica se o export existe
            if (!exports['oxmysql'] || !exports['oxmysql']['query']) {
                throw new Error('oxmysql not ready');
            }
            await dbQuery('SELECT 1');
            return true;
        } catch (e) {
            console.log(`[SMARTPHONE] Aguardando oxmysql... (${i + 1}/${maxRetries})`);
            await sleep(2000);
        }
    }
    return false;
}

async function initDatabase() {
    console.log('[SMARTPHONE] Inicializando banco de dados...');

    // Esperar oxmysql estar pronto
    const ready = await waitForOxmysql();
    if (!ready) {
        console.error('[SMARTPHONE] ERRO: oxmysql não respondeu após 30s!');
        return;
    }
    console.log('[SMARTPHONE] oxmysql conectado!');

    const schema = LoadResourceFile(GetCurrentResourceName(), 'smartphone.sql');
    if (schema) {
        const statements = schema
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('SET'));

        let created = 0;
        for (const stmt of statements) {
            try {
                await dbQuery(stmt);
                created++;
            } catch (e) {
                const msg = e?.message || String(e);
                if (!msg.includes('already exists')) {
                    console.error(`[SMARTPHONE] SQL: ${msg.slice(0, 120)}`);
                }
            }
        }
        console.log(`[SMARTPHONE] Schema carregado (${created} statements executados)`);
    } else {
        console.warn('[SMARTPHONE] smartphone.sql não encontrado!');
    }
}

// ============================================
// HANDLERS: Core
// ============================================

registerHandler('ping', async (source) => {
    const phone = await getPhoneFromSource(source);
    return { ok: true, phone, timestamp: Date.now() };
});

registerHandler('download', async (source) => {
    const profile = await ensureProfile(source);
    const userId = profile.user_id;
    const phone = profile.phone_number;

    let settings = {};
    try {
        settings = typeof profile.settings === 'string' ? JSON.parse(profile.settings) : (profile.settings || {});
    } catch (e) { settings = {}; }

    const contacts = await dbQuery(
        'SELECT id, contact_phone, contact_name FROM smartphone_contacts WHERE user_id = ? ORDER BY contact_name ASC',
        [userId]
    );

    const blocked = await dbQuery(
        'SELECT blocked_phone FROM smartphone_blocked WHERE user_id = ?', [userId]
    );

    return {
        phone, userId, config,
        settings: { ...config, ...settings },
        identity: { phone, name: `Jogador ${userId}` },
        contacts: contacts || [],
        blocked: (blocked || []).map(b => b.blocked_phone),
    };
});

registerHandler('getSettings', async (source) => {
    return await handlers['download'](source);
});

// ============================================
// HANDLERS: Contacts
// ============================================

registerHandler('contacts_list', async (source) => {
    const userId = await getUserIdCached(source);
    const contacts = await dbQuery(
        'SELECT id, contact_phone, contact_name, created_at FROM smartphone_contacts WHERE user_id = ? ORDER BY contact_name ASC',
        [userId]
    );
    return { ok: true, contacts: contacts || [] };
});

registerHandler('contacts_add', async (source, args) => {
    const userId = await getUserIdCached(source);
    const { phone: contactPhone, name: contactName } = args;

    if (!contactPhone || !contactName) return { error: 'Número e nome são obrigatórios' };

    try {
        const id = await dbInsert(
            'INSERT INTO smartphone_contacts (user_id, contact_phone, contact_name) VALUES (?, ?, ?)',
            [userId, contactPhone, contactName]
        );
        return { ok: true, contact: { id, contact_phone: contactPhone, contact_name: contactName } };
    } catch (e) {
        if (e.message?.includes('Duplicate')) return { error: 'Contato já existe' };
        throw e;
    }
});

registerHandler('contacts_update', async (source, args) => {
    const userId = await getUserIdCached(source);
    const { id, name, phone } = args;
    if (!id) return { error: 'ID obrigatório' };

    const updates = [];
    const params = [];
    if (name) { updates.push('contact_name = ?'); params.push(name); }
    if (phone) { updates.push('contact_phone = ?'); params.push(phone); }

    if (updates.length > 0) {
        params.push(id, userId);
        await dbUpdate(`UPDATE smartphone_contacts SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`, params);
    }
    return { ok: true };
});

registerHandler('contacts_delete', async (source, args) => {
    const userId = await getUserIdCached(source);
    await dbUpdate('DELETE FROM smartphone_contacts WHERE id = ? AND user_id = ?', [args.id, userId]);
    return { ok: true };
});

registerHandler('contacts_block', async (source, args) => {
    const userId = await getUserIdCached(source);
    await dbQuery('INSERT IGNORE INTO smartphone_blocked (user_id, blocked_phone) VALUES (?, ?)', [userId, args.phone]);
    return { ok: true };
});

registerHandler('contacts_unblock', async (source, args) => {
    const userId = await getUserIdCached(source);
    await dbUpdate('DELETE FROM smartphone_blocked WHERE user_id = ? AND blocked_phone = ?', [userId, args.phone]);
    return { ok: true };
});

registerHandler('contacts_blocked_list', async (source) => {
    const userId = await getUserIdCached(source);
    const blocked = await dbQuery('SELECT blocked_phone FROM smartphone_blocked WHERE user_id = ?', [userId]);
    return { ok: true, blocked: (blocked || []).map(b => b.blocked_phone) };
});

registerHandler('resolve_phone', async (source, args) => {
    const userId = await getUserIdCached(source);
    const contact = await dbSingle(
        'SELECT contact_name FROM smartphone_contacts WHERE user_id = ? AND contact_phone = ?',
        [userId, args.phone]
    );
    return { ok: true, phone: args.phone, name: contact?.contact_name || null, isContact: !!contact };
});

// ============================================
// HANDLERS: Profile / Settings
// ============================================

registerHandler('profile_update', async (source, args) => {
    const phone = await getPhoneFromSource(source);
    const updates = [];
    const params = [];
    if (args.avatar !== undefined) { updates.push('avatar = ?'); params.push(args.avatar); }
    if (args.wallpaper !== undefined) { updates.push('wallpaper = ?'); params.push(args.wallpaper); }
    if (updates.length > 0) {
        params.push(phone);
        await dbUpdate(`UPDATE smartphone_profiles SET ${updates.join(', ')} WHERE phone_number = ?`, params);
    }
    return { ok: true };
});

registerHandler('settings_save', async (source, args) => {
    const phone = await getPhoneFromSource(source);
    await dbUpdate('UPDATE smartphone_profiles SET settings = ? WHERE phone_number = ?', [JSON.stringify(args), phone]);
    return { ok: true };
});

// ============================================
// HANDLERS: Service calls (190, 192, 193)
// ============================================

registerHandler('service_call', async (source, args) => {
    const phone = await getPhoneFromSource(source);
    const { number, message, location } = args;
    const { x, y, z } = location || { x: 0, y: 0, z: 0 };

    const id = await dbInsert(
        'INSERT INTO smartphone_service_calls (caller_phone, service_number, message, location_x, location_y, location_z) VALUES (?, ?, ?, ?, ?, ?)',
        [phone, number, message || '', x, y, z]
    );

    pushToAll('SERVICE_CALL', { id, caller: phone, service: number, message, location: { x, y, z } });
    return { ok: true };
});

// ============================================
// HANDLERS: Bank (Nubank)
// ============================================

registerHandler('bank_balance', async (source) => {
    const userId = await getUserIdCached(source);
    
    // Buscar saldo via vRP
    let balance = 0;
    try {
        if (typeof exports.vrp?.getMoney === 'function') {
            balance = exports.vrp.getMoney(parseInt(userId)) || 0;
        }
    } catch (e) {
        // Fallback: tentar getBankMoney
        try {
            if (typeof exports.vrp?.getBankMoney === 'function') {
                balance = exports.vrp.getBankMoney(parseInt(userId)) || 0;
            }
        } catch (e2) {
            balance = 0;
        }
    }

    return { ok: true, balance };
});

registerHandler('bank_statement', async (source, args) => {
    const myPhone = await getPhoneFromSource(source);
    const { limit } = args || {};

    const transactions = await dbQuery(`
        SELECT t.*, 
            CASE 
                WHEN t.from_phone = ? THEN 'sent'
                ELSE 'received'
            END AS direction
        FROM smartphone_bank_transactions t
        WHERE t.from_phone = ? OR t.to_phone = ?
        ORDER BY t.created_at DESC
        LIMIT ?
    `, [myPhone, myPhone, myPhone, limit || 50]);

    // Resolver nomes dos contatos
    const userId = await getUserIdCached(source);
    const resolved = [];
    for (const tx of (transactions || [])) {
        const otherPhone = tx.direction === 'sent' ? tx.to_phone : tx.from_phone;
        const contact = await dbSingle(
            'SELECT contact_name FROM smartphone_contacts WHERE user_id = ? AND contact_phone = ?',
            [userId, otherPhone]
        );
        resolved.push({
            ...tx,
            other_phone: otherPhone,
            other_name: contact?.contact_name || null,
        });
    }

    return { ok: true, transactions: resolved };
});

registerHandler('bank_pix', async (source, args) => {
    const senderPhone = await getPhoneFromSource(source);
    const senderId = await getUserIdCached(source);
    const { to, amount, description } = args;

    if (!to) return { error: 'Chave PIX obrigatória' };
    if (!amount || amount <= 0) return { error: 'Valor inválido' };
    if (to === senderPhone) return { error: 'Não pode transferir pra si mesmo' };

    // Verificar se destinatário existe
    const receiverProfile = await dbSingle(
        'SELECT phone_number FROM smartphone_profiles WHERE phone_number = ?', [to]
    );
    if (!receiverProfile) return { error: 'Chave PIX não encontrada' };

    // Verificar saldo
    let balance = 0;
    try {
        if (typeof exports.vrp?.getMoney === 'function') {
            balance = exports.vrp.getMoney(parseInt(senderId)) || 0;
        } else if (typeof exports.vrp?.getBankMoney === 'function') {
            balance = exports.vrp.getBankMoney(parseInt(senderId)) || 0;
        }
    } catch (e) { balance = 0; }

    if (balance < amount) return { error: 'Saldo insuficiente' };

    // Executar transferência via vRP
    const receiverUserId = phoneToUserId(to);
    try {
        if (typeof exports.vrp?.removeMoney === 'function') {
            exports.vrp.removeMoney(parseInt(senderId), amount);
        } else if (typeof exports.vrp?.removeBankMoney === 'function') {
            exports.vrp.removeBankMoney(parseInt(senderId), amount);
        }

        if (typeof exports.vrp?.addMoney === 'function') {
            exports.vrp.addMoney(parseInt(receiverUserId), amount);
        } else if (typeof exports.vrp?.addBankMoney === 'function') {
            exports.vrp.addBankMoney(parseInt(receiverUserId), amount);
        }
    } catch (e) {
        return { error: 'Erro ao processar transferência' };
    }

    // Registrar transação
    const txId = await dbInsert(
        'INSERT INTO smartphone_bank_transactions (from_phone, to_phone, amount, type, description) VALUES (?, ?, ?, ?, ?)',
        [senderPhone, to, amount, 'pix', description || 'PIX']
    );

    const txData = {
        id: txId,
        from_phone: senderPhone,
        to_phone: to,
        amount,
        type: 'pix',
        description: description || 'PIX',
        created_at: new Date().toISOString(),
    };

    // Push pro destinatário
    const receiverSource = getSourceByPhone(to);
    if (receiverSource) {
        const senderContact = await dbSingle(
            'SELECT contact_name FROM smartphone_contacts WHERE user_id = ? AND contact_phone = ?',
            [receiverUserId, senderPhone]
        );
        pushToPlayer(receiverSource, 'BANK_RECEIVED', {
            ...txData,
            senderName: senderContact?.contact_name || senderPhone,
        });
    }

    return {
        ok: true,
        transaction: txData,
        newBalance: balance - amount,
    };
});

registerHandler('bank_init', async (source) => {
    const userId = await getUserIdCached(source);
    const myPhone = await getPhoneFromSource(source);

    // Saldo
    let balance = 0;
    try {
        if (typeof exports.vrp?.getMoney === 'function') {
            balance = exports.vrp.getMoney(parseInt(userId)) || 0;
        } else if (typeof exports.vrp?.getBankMoney === 'function') {
            balance = exports.vrp.getBankMoney(parseInt(userId)) || 0;
        }
    } catch (e) { balance = 0; }

    // Transações recentes
    const transactions = await dbQuery(`
        SELECT t.*, 
            CASE WHEN t.from_phone = ? THEN 'sent' ELSE 'received' END AS direction
        FROM smartphone_bank_transactions t
        WHERE t.from_phone = ? OR t.to_phone = ?
        ORDER BY t.created_at DESC LIMIT 20
    `, [myPhone, myPhone, myPhone]);

    return { ok: true, balance, transactions: transactions || [], phone: myPhone };
});

registerHandler('bank_transfer', async (source, args) => {
    // Alias para bank_pix — FleecaBank usa bank_transfer, Nubank usa bank_pix
    return await handlers['bank_pix'](source, args);
});

registerHandler('bank_receipt', async (source, args) => {
    const myPhone = await getPhoneFromSource(source);
    const { transactionId } = args;

    const tx = await dbSingle(
        'SELECT * FROM smartphone_bank_transactions WHERE id = ? AND (from_phone = ? OR to_phone = ?)',
        [transactionId, myPhone, myPhone]
    );
    if (!tx) return { error: 'Transação não encontrada' };

    return { ok: true, transaction: tx };
});

// ============================================
// HANDLERS: Notes
// ============================================

registerHandler('notes_list', async (source) => {
    const phone = await getPhoneFromSource(source);
    const notes = await dbQuery(
        'SELECT id, title, content, updated_at FROM smartphone_notes WHERE phone = ? ORDER BY updated_at DESC',
        [phone]
    );
    return { ok: true, notes: notes || [] };
});

registerHandler('notes_save', async (source, args) => {
    const phone = await getPhoneFromSource(source);
    const { id, title, content } = args;

    if (id) {
        // Atualizar existente
        await dbUpdate(
            'UPDATE smartphone_notes SET title = ?, content = ? WHERE id = ? AND phone = ?',
            [title || '', content || '', id, phone]
        );
        return { ok: true, id };
    } else {
        // Criar nova
        const newId = await dbInsert(
            'INSERT INTO smartphone_notes (phone, title, content) VALUES (?, ?, ?)',
            [phone, title || '', content || '']
        );
        return { ok: true, id: newId };
    }
});

registerHandler('notes_delete', async (source, args) => {
    const phone = await getPhoneFromSource(source);
    await dbUpdate('DELETE FROM smartphone_notes WHERE id = ? AND phone = ?', [args.id, phone]);
    return { ok: true };
});

// ============================================
// HANDLERS: SMS (Conversations model)
// ============================================

registerHandler('sms_conversations', async (source) => {
    const myPhone = await getPhoneFromSource(source);
    const userId = await getUserIdCached(source);

    // Buscar conversas onde sou participante, com última mensagem
    const conversations = await dbQuery(`
        SELECT 
            c.id,
            c.is_group,
            c.name AS group_name,
            p.unread_count,
            (SELECT m.message FROM smartphone_sms_messages m 
             WHERE m.conversation_id = c.id AND m.is_deleted = 0 
             ORDER BY m.id DESC LIMIT 1) AS last_message,
            (SELECT m.created_at FROM smartphone_sms_messages m 
             WHERE m.conversation_id = c.id AND m.is_deleted = 0 
             ORDER BY m.id DESC LIMIT 1) AS last_message_at,
            (SELECT m.sender_phone FROM smartphone_sms_messages m 
             WHERE m.conversation_id = c.id AND m.is_deleted = 0 
             ORDER BY m.id DESC LIMIT 1) AS last_sender
        FROM smartphone_sms_conversations c
        JOIN smartphone_sms_participants p ON p.conversation_id = c.id AND p.phone = ?
        ORDER BY last_message_at DESC
    `, [myPhone]);

    // Resolver nomes e outros participantes
    const resolved = [];
    for (const conv of (conversations || [])) {
        // Buscar outros participantes
        const participants = await dbQuery(
            'SELECT phone FROM smartphone_sms_participants WHERE conversation_id = ? AND phone != ?',
            [conv.id, myPhone]
        );
        const otherPhones = (participants || []).map(p => p.phone);

        // Resolver nome do contato (pra chat 1:1)
        let displayName = conv.group_name;
        if (!displayName && otherPhones.length === 1) {
            const contact = await dbSingle(
                'SELECT contact_name FROM smartphone_contacts WHERE user_id = ? AND contact_phone = ?',
                [userId, otherPhones[0]]
            );
            displayName = contact?.contact_name || otherPhones[0];
        } else if (!displayName) {
            displayName = otherPhones.join(', ');
        }

        resolved.push({
            id: conv.id,
            name: displayName,
            otherPhones,
            isGroup: !!conv.is_group,
            unreadCount: conv.unread_count || 0,
            lastMessage: conv.last_message,
            lastMessageAt: conv.last_message_at,
            lastSender: conv.last_sender,
        });
    }

    return { ok: true, conversations: resolved };
});

registerHandler('sms_messages', async (source, args) => {
    const myPhone = await getPhoneFromSource(source);
    const { conversationId, limit } = args;

    if (!conversationId) return { error: 'conversationId obrigatório' };

    // Verificar se sou participante
    const participant = await dbSingle(
        'SELECT 1 FROM smartphone_sms_participants WHERE conversation_id = ? AND phone = ?',
        [conversationId, myPhone]
    );
    if (!participant) return { error: 'Sem acesso' };

    const messages = await dbQuery(`
        SELECT id, sender_phone, message, media, created_at
        FROM smartphone_sms_messages
        WHERE conversation_id = ? AND is_deleted = 0
        ORDER BY id DESC
        LIMIT ?
    `, [conversationId, limit || 50]);

    // Marcar como lido
    await dbUpdate(
        'UPDATE smartphone_sms_participants SET unread_count = 0 WHERE conversation_id = ? AND phone = ?',
        [conversationId, myPhone]
    );

    return { ok: true, messages: (messages || []).reverse() };
});

registerHandler('sms_send', async (source, args) => {
    const senderPhone = await getPhoneFromSource(source);
    const { conversationId, to, message } = args;

    if (!message || !message.trim()) return { error: 'Mensagem vazia' };

    let convId = conversationId;

    // Se não tem conversationId, criar ou encontrar conversa existente
    if (!convId && to) {
        // Buscar conversa existente entre os dois
        const existing = await dbSingle(`
            SELECT p1.conversation_id 
            FROM smartphone_sms_participants p1
            JOIN smartphone_sms_participants p2 ON p1.conversation_id = p2.conversation_id
            JOIN smartphone_sms_conversations c ON c.id = p1.conversation_id
            WHERE p1.phone = ? AND p2.phone = ? AND c.is_group = 0
        `, [senderPhone, to]);

        if (existing) {
            convId = existing.conversation_id;
        } else {
            // Criar nova conversa
            convId = await dbInsert(
                'INSERT INTO smartphone_sms_conversations (is_group) VALUES (0)'
            );
            await dbQuery(
                'INSERT INTO smartphone_sms_participants (conversation_id, phone) VALUES (?, ?), (?, ?)',
                [convId, senderPhone, convId, to]
            );
        }
    }

    if (!convId) return { error: 'Destino obrigatório' };

    // Inserir mensagem
    const msgId = await dbInsert(
        'INSERT INTO smartphone_sms_messages (conversation_id, sender_phone, message) VALUES (?, ?, ?)',
        [convId, senderPhone, message.trim()]
    );

    // Atualizar timestamp da conversa
    await dbUpdate(
        'UPDATE smartphone_sms_conversations SET updated_at = NOW() WHERE id = ?',
        [convId]
    );

    // Incrementar unread para outros participantes
    await dbUpdate(
        'UPDATE smartphone_sms_participants SET unread_count = unread_count + 1 WHERE conversation_id = ? AND phone != ?',
        [convId, senderPhone]
    );

    const msgData = {
        id: msgId,
        conversationId: convId,
        sender_phone: senderPhone,
        message: message.trim(),
        created_at: new Date().toISOString(),
    };

    // Push para outros participantes online
    const participants = await dbQuery(
        'SELECT phone FROM smartphone_sms_participants WHERE conversation_id = ? AND phone != ?',
        [convId, senderPhone]
    );

    const senderUserId = await getUserIdCached(source);
    for (const p of (participants || [])) {
        const targetSource = getSourceByPhone(p.phone);
        if (targetSource) {
            // Resolver nome do sender nos contatos do receiver
            const targetUserId = phoneToUserId(p.phone);
            const senderContact = await dbSingle(
                'SELECT contact_name FROM smartphone_contacts WHERE user_id = ? AND contact_phone = ?',
                [targetUserId, senderPhone]
            );

            pushToPlayer(targetSource, 'SMS_MESSAGE', {
                ...msgData,
                senderName: senderContact?.contact_name || senderPhone,
            });
        }
    }

    return { ok: true, message: msgData };
});

registerHandler('sms_mark_read', async (source, args) => {
    const myPhone = await getPhoneFromSource(source);
    const { conversationId } = args;
    await dbUpdate(
        'UPDATE smartphone_sms_participants SET unread_count = 0 WHERE conversation_id = ? AND phone = ?',
        [conversationId, myPhone]
    );
    return { ok: true };
});

registerHandler('sms_delete_conversation', async (source, args) => {
    const myPhone = await getPhoneFromSource(source);
    const { conversationId } = args;

    // Remover participação (não apaga a conversa inteira)
    await dbUpdate(
        'DELETE FROM smartphone_sms_participants WHERE conversation_id = ? AND phone = ?',
        [conversationId, myPhone]
    );

    // Se ninguém mais participa, apagar conversa e mensagens
    const remaining = await dbScalar(
        'SELECT COUNT(*) FROM smartphone_sms_participants WHERE conversation_id = ?',
        [conversationId]
    );
    if (remaining === 0) {
        await dbUpdate('DELETE FROM smartphone_sms_messages WHERE conversation_id = ?', [conversationId]);
        await dbUpdate('DELETE FROM smartphone_sms_conversations WHERE id = ?', [conversationId]);
    }

    return { ok: true };
});

// ============================================
// HANDLERS: WhatsApp
// ============================================

registerHandler('whatsapp_chats', async (source) => {
    const myPhone = await getPhoneFromSource(source);
    const userId = await getUserIdCached(source);

    const chats = await dbQuery(`
        SELECT 
            c.id, c.type, c.name AS group_name, c.icon,
            p.unread_count,
            (SELECT m.message FROM smartphone_whatsapp_messages m 
             WHERE m.chat_id = c.id ORDER BY m.id DESC LIMIT 1) AS last_message,
            (SELECT m.created_at FROM smartphone_whatsapp_messages m 
             WHERE m.chat_id = c.id ORDER BY m.id DESC LIMIT 1) AS last_message_at,
            (SELECT m.sender_phone FROM smartphone_whatsapp_messages m 
             WHERE m.chat_id = c.id ORDER BY m.id DESC LIMIT 1) AS last_sender,
            (SELECT m.is_read FROM smartphone_whatsapp_messages m 
             WHERE m.chat_id = c.id ORDER BY m.id DESC LIMIT 1) AS last_is_read
        FROM smartphone_whatsapp_chats c
        JOIN smartphone_whatsapp_participants p ON p.chat_id = c.id AND p.phone = ?
        ORDER BY last_message_at DESC
    `, [myPhone]);

    const resolved = [];
    for (const chat of (chats || [])) {
        const participants = await dbQuery(
            'SELECT phone FROM smartphone_whatsapp_participants WHERE chat_id = ? AND phone != ?',
            [chat.id, myPhone]
        );
        const otherPhones = (participants || []).map(p => p.phone);

        let displayName = chat.group_name;
        if (!displayName && otherPhones.length === 1) {
            const contact = await dbSingle(
                'SELECT contact_name FROM smartphone_contacts WHERE user_id = ? AND contact_phone = ?',
                [userId, otherPhones[0]]
            );
            displayName = contact?.contact_name || otherPhones[0];
        } else if (!displayName) {
            displayName = otherPhones.join(', ');
        }

        resolved.push({
            id: chat.id,
            type: chat.type,
            is_group: chat.type === 'group' ? 1 : 0,
            name: displayName,
            icon: chat.icon,
            otherPhones,
            memberCount: otherPhones.length + 1,
            unreadCount: chat.unread_count || 0,
            lastMessage: chat.last_message,
            lastMessageAt: chat.last_message_at,
            lastSender: chat.last_sender,
            lastIsRead: chat.last_is_read,
        });
    }

    return { ok: true, chats: resolved };
});

registerHandler('whatsapp_messages', async (source, args) => {
    const myPhone = await getPhoneFromSource(source);
    const { chatId, limit } = args;
    if (!chatId) return { error: 'chatId obrigatório' };

    const participant = await dbSingle(
        'SELECT 1 FROM smartphone_whatsapp_participants WHERE chat_id = ? AND phone = ?',
        [chatId, myPhone]
    );
    if (!participant) return { error: 'Sem acesso' };

    const messages = await dbQuery(`
        SELECT id, sender_phone, message, type, media, is_read, created_at
        FROM smartphone_whatsapp_messages
        WHERE chat_id = ?
        ORDER BY id DESC
        LIMIT ?
    `, [chatId, limit || 50]);

    // Marcar como lido
    await dbUpdate(
        'UPDATE smartphone_whatsapp_participants SET unread_count = 0 WHERE chat_id = ? AND phone = ?',
        [chatId, myPhone]
    );
    // Marcar mensagens como lidas (tick azul)
    await dbUpdate(
        'UPDATE smartphone_whatsapp_messages SET is_read = 1 WHERE chat_id = ? AND sender_phone != ?',
        [chatId, myPhone]
    );

    // Push tick azul pro sender
    const otherParticipants = await dbQuery(
        'SELECT phone FROM smartphone_whatsapp_participants WHERE chat_id = ? AND phone != ?',
        [chatId, myPhone]
    );
    for (const p of (otherParticipants || [])) {
        const targetSource = getSourceByPhone(p.phone);
        if (targetSource) {
            pushToPlayer(targetSource, 'WHATSAPP_READ', { chatId });
        }
    }

    return { ok: true, messages: (messages || []).reverse() };
});

registerHandler('whatsapp_send', async (source, args) => {
    const senderPhone = await getPhoneFromSource(source);
    const { chatId, to, message, type } = args;

    if (!message || !message.trim()) return { error: 'Mensagem vazia' };

    let targetChatId = chatId;

    // Criar ou encontrar chat privado
    if (!targetChatId && to) {
        const existing = await dbSingle(`
            SELECT p1.chat_id 
            FROM smartphone_whatsapp_participants p1
            JOIN smartphone_whatsapp_participants p2 ON p1.chat_id = p2.chat_id
            JOIN smartphone_whatsapp_chats c ON c.id = p1.chat_id
            WHERE p1.phone = ? AND p2.phone = ? AND c.type = 'private'
        `, [senderPhone, to]);

        if (existing) {
            targetChatId = existing.chat_id;
        } else {
            targetChatId = await dbInsert(
                "INSERT INTO smartphone_whatsapp_chats (type) VALUES ('private')"
            );
            await dbQuery(
                'INSERT INTO smartphone_whatsapp_participants (chat_id, phone) VALUES (?, ?), (?, ?)',
                [targetChatId, senderPhone, targetChatId, to]
            );
        }
    }

    if (!targetChatId) return { error: 'Destino obrigatório' };

    const msgId = await dbInsert(
        'INSERT INTO smartphone_whatsapp_messages (chat_id, sender_phone, message, type) VALUES (?, ?, ?, ?)',
        [targetChatId, senderPhone, message.trim(), type || 'text']
    );

    // Incrementar unread
    await dbUpdate(
        'UPDATE smartphone_whatsapp_participants SET unread_count = unread_count + 1 WHERE chat_id = ? AND phone != ?',
        [targetChatId, senderPhone]
    );

    const msgData = {
        id: msgId,
        chatId: targetChatId,
        sender_phone: senderPhone,
        message: message.trim(),
        type: type || 'text',
        is_read: 0,
        created_at: new Date().toISOString(),
    };

    // Push
    const participants = await dbQuery(
        'SELECT phone FROM smartphone_whatsapp_participants WHERE chat_id = ? AND phone != ?',
        [targetChatId, senderPhone]
    );

    for (const p of (participants || [])) {
        const targetSource = getSourceByPhone(p.phone);
        if (targetSource) {
            const targetUserId = phoneToUserId(p.phone);
            const senderContact = await dbSingle(
                'SELECT contact_name FROM smartphone_contacts WHERE user_id = ? AND contact_phone = ?',
                [targetUserId, senderPhone]
            );
            pushToPlayer(targetSource, 'WHATSAPP_MESSAGE', {
                ...msgData,
                senderName: senderContact?.contact_name || senderPhone,
            });
        }
    }

    return { ok: true, message: msgData };
});

registerHandler('whatsapp_mark_read', async (source, args) => {
    const myPhone = await getPhoneFromSource(source);
    const { chatId } = args;
    await dbUpdate(
        'UPDATE smartphone_whatsapp_participants SET unread_count = 0 WHERE chat_id = ? AND phone = ?',
        [chatId, myPhone]
    );
    await dbUpdate(
        'UPDATE smartphone_whatsapp_messages SET is_read = 1 WHERE chat_id = ? AND sender_phone != ?',
        [chatId, myPhone]
    );
    return { ok: true };
});

registerHandler('whatsapp_delete_chat', async (source, args) => {
    const myPhone = await getPhoneFromSource(source);
    const { chatId } = args;
    await dbUpdate(
        'DELETE FROM smartphone_whatsapp_participants WHERE chat_id = ? AND phone = ?',
        [chatId, myPhone]
    );
    const remaining = await dbScalar(
        'SELECT COUNT(*) FROM smartphone_whatsapp_participants WHERE chat_id = ?', [chatId]
    );
    if (remaining === 0) {
        await dbUpdate('DELETE FROM smartphone_whatsapp_messages WHERE chat_id = ?', [chatId]);
        await dbUpdate('DELETE FROM smartphone_whatsapp_chats WHERE id = ?', [chatId]);
    }
    return { ok: true };
});
// ============================================
// ============================================
// HANDLERS: Instagram
// ============================================

// Helper: get or create instagram profile
async function getIgProfile(source) {
    const userId = await getUserIdCached(source);
    const phone = await getPhoneFromSource(source);
    let profile = await dbSingle('SELECT * FROM smartphone_instagram_profiles WHERE user_id = ?', [userId]);
    if (!profile) {
        const name = 'Jogador ' + (phone || '').replace(/[^0-9]/g, '').slice(-4);
        const username = phone.replace(/[^0-9]/g, '');
        const id = await dbInsert(
            'INSERT INTO smartphone_instagram_profiles (user_id, username, name) VALUES (?, ?, ?)',
            [userId, username, name]
        );
        profile = { id, user_id: parseInt(userId), username, name, bio: '', avatar: null };
    }
    return profile;
}

registerHandler('ig_profile', async (source, args) => {
    if (args?.profileId) {
        const profile = await dbSingle('SELECT * FROM smartphone_instagram_profiles WHERE id = ?', [args.profileId]);
        if (!profile) return { error: 'Perfil não encontrado' };
        const posts = await dbQuery(
            'SELECT id, image, caption, created_at, (SELECT COUNT(*) FROM smartphone_instagram_likes WHERE post_id = p.id) AS likes_count, (SELECT COUNT(*) FROM smartphone_instagram_comments WHERE post_id = p.id) AS comments_count FROM smartphone_instagram_posts p WHERE profile_id = ? ORDER BY id DESC',
            [args.profileId]
        );
        const followers = await dbScalar('SELECT COUNT(*) FROM smartphone_instagram_follows WHERE following_id = ?', [args.profileId]);
        const following = await dbScalar('SELECT COUNT(*) FROM smartphone_instagram_follows WHERE follower_id = ?', [args.profileId]);
        const myProfile = await getIgProfile(source);
        const isFollowing = await dbScalar('SELECT COUNT(*) FROM smartphone_instagram_follows WHERE follower_id = ? AND following_id = ?', [myProfile.id, args.profileId]);
        return { ok: true, profile: { ...profile, followers, following, posts: posts || [] }, isFollowing: isFollowing > 0, myProfileId: myProfile.id };
    }
    const profile = await getIgProfile(source);
    const posts = await dbQuery(
        'SELECT id, image, caption, created_at, (SELECT COUNT(*) FROM smartphone_instagram_likes WHERE post_id = p.id) AS likes_count, (SELECT COUNT(*) FROM smartphone_instagram_comments WHERE post_id = p.id) AS comments_count FROM smartphone_instagram_posts p WHERE profile_id = ? ORDER BY id DESC',
        [profile.id]
    );
    const followers = await dbScalar('SELECT COUNT(*) FROM smartphone_instagram_follows WHERE following_id = ?', [profile.id]);
    const following = await dbScalar('SELECT COUNT(*) FROM smartphone_instagram_follows WHERE follower_id = ?', [profile.id]);
    return { ok: true, profile: { ...profile, followers, following, posts: posts || [] }, myProfileId: profile.id };
});

registerHandler('ig_profile_update', async (source, args) => {
    const profile = await getIgProfile(source);
    const { bio, display_name } = args;
    const updates = [];
    const params = [];
    if (bio !== undefined) { updates.push('bio = ?'); params.push(bio); }
    if (display_name !== undefined) { updates.push('name = ?'); params.push(display_name); }
    if (updates.length > 0) {
        params.push(profile.id);
        await dbUpdate(`UPDATE smartphone_instagram_profiles SET ${updates.join(', ')} WHERE id = ?`, params);
    }
    return { ok: true };
});

registerHandler('ig_feed', async (source) => {
    const profile = await getIgProfile(source);
    const posts = await dbQuery(`
        SELECT p.id, p.image, p.caption, p.created_at, p.profile_id,
            pr.username, pr.name, pr.avatar,
            (SELECT COUNT(*) FROM smartphone_instagram_likes WHERE post_id = p.id) AS likes_count,
            (SELECT COUNT(*) FROM smartphone_instagram_comments WHERE post_id = p.id) AS comments_count,
            (SELECT COUNT(*) FROM smartphone_instagram_likes WHERE post_id = p.id AND profile_id = ?) AS is_liked
        FROM smartphone_instagram_posts p
        JOIN smartphone_instagram_profiles pr ON pr.id = p.profile_id
        WHERE p.profile_id IN (
            SELECT following_id FROM smartphone_instagram_follows WHERE follower_id = ?
        ) OR p.profile_id = ?
        ORDER BY p.id DESC LIMIT 50
    `, [profile.id, profile.id, profile.id]);
    return { ok: true, posts: posts || [], myProfileId: profile.id };
});

registerHandler('ig_explore', async (source) => {
    const profile = await getIgProfile(source);
    const posts = await dbQuery(`
        SELECT p.id, p.image, p.caption, p.created_at, p.profile_id,
            pr.username, pr.name, pr.avatar,
            (SELECT COUNT(*) FROM smartphone_instagram_likes WHERE post_id = p.id) AS likes_count,
            (SELECT COUNT(*) FROM smartphone_instagram_comments WHERE post_id = p.id) AS comments_count,
            (SELECT COUNT(*) FROM smartphone_instagram_likes WHERE post_id = p.id AND profile_id = ?) AS is_liked
        FROM smartphone_instagram_posts p
        JOIN smartphone_instagram_profiles pr ON pr.id = p.profile_id
        ORDER BY p.id DESC LIMIT 50
    `, [profile.id]);
    return { ok: true, posts: posts || [], myProfileId: profile.id };
});

registerHandler('ig_post', async (source, args) => {
    const profile = await getIgProfile(source);
    const { caption, image } = args;
    if (!caption && !image) return { error: 'Post vazio' };
    const postId = await dbInsert(
        'INSERT INTO smartphone_instagram_posts (profile_id, image, caption) VALUES (?, ?, ?)',
        [profile.id, image || '', caption || '']
    );
    return { ok: true, postId };
});

registerHandler('ig_like', async (source, args) => {
    const profile = await getIgProfile(source);
    const { postId } = args;
    const existing = await dbSingle('SELECT 1 FROM smartphone_instagram_likes WHERE profile_id = ? AND post_id = ?', [profile.id, postId]);
    if (existing) {
        await dbUpdate('DELETE FROM smartphone_instagram_likes WHERE profile_id = ? AND post_id = ?', [profile.id, postId]);
        return { ok: true, liked: false };
    }
    await dbInsert('INSERT INTO smartphone_instagram_likes (profile_id, post_id) VALUES (?, ?)', [profile.id, postId]);

    // Push notification
    const post = await dbSingle('SELECT profile_id FROM smartphone_instagram_posts WHERE id = ?', [postId]);
    if (post && post.profile_id !== profile.id) {
        const ownerPhone = await dbScalar('SELECT p.phone_number FROM smartphone_profiles p JOIN smartphone_instagram_profiles ip ON ip.user_id = CAST(p.phone_number AS UNSIGNED) WHERE ip.id = ?', [post.profile_id]);
        // Simplified: try to notify
        const ownerProfile = await dbSingle('SELECT user_id FROM smartphone_instagram_profiles WHERE id = ?', [post.profile_id]);
        if (ownerProfile) {
            const ownerSource = findPlayerSource(ownerProfile.user_id);
            if (ownerSource) {
                pushToPlayer(ownerSource, 'IG_NOTIFICATION', { type: 'like', from: profile.username, postId });
            }
        }
    }
    return { ok: true, liked: true };
});

registerHandler('ig_comment', async (source, args) => {
    const profile = await getIgProfile(source);
    const { postId, text } = args;
    if (!text?.trim()) return { error: 'Comentário vazio' };
    const commentId = await dbInsert(
        'INSERT INTO smartphone_instagram_comments (post_id, profile_id, text) VALUES (?, ?, ?)',
        [postId, profile.id, text.trim()]
    );
    return { ok: true, comment: { id: commentId, text: text.trim(), username: profile.username, name: profile.name, created_at: new Date().toISOString() } };
});

registerHandler('ig_comments', async (source, args) => {
    const { postId } = args;
    const comments = await dbQuery(`
        SELECT c.id, c.text, c.created_at, pr.username, pr.name, pr.avatar, pr.id AS profile_id
        FROM smartphone_instagram_comments c
        JOIN smartphone_instagram_profiles pr ON pr.id = c.profile_id
        WHERE c.post_id = ? ORDER BY c.id ASC
    `, [postId]);
    return { ok: true, comments: comments || [] };
});

registerHandler('ig_follow', async (source, args) => {
    const profile = await getIgProfile(source);
    const { profileId } = args;
    if (profileId === profile.id) return { error: 'Não pode seguir a si mesmo' };
    const existing = await dbSingle('SELECT 1 FROM smartphone_instagram_follows WHERE follower_id = ? AND following_id = ?', [profile.id, profileId]);
    if (existing) {
        await dbUpdate('DELETE FROM smartphone_instagram_follows WHERE follower_id = ? AND following_id = ?', [profile.id, profileId]);
        return { ok: true, following: false };
    }
    await dbInsert('INSERT INTO smartphone_instagram_follows (follower_id, following_id) VALUES (?, ?)', [profile.id, profileId]);
    return { ok: true, following: true };
});

registerHandler('ig_stories', async (source) => {
    const profile = await getIgProfile(source);
    const stories = await dbQuery(`
        SELECT s.id, s.image, s.created_at, s.expires_at, pr.username, pr.avatar, pr.id AS profile_id
        FROM smartphone_instagram_stories s
        JOIN smartphone_instagram_profiles pr ON pr.id = s.profile_id
        WHERE s.expires_at > NOW() AND (
            s.profile_id IN (SELECT following_id FROM smartphone_instagram_follows WHERE follower_id = ?)
            OR s.profile_id = ?
        )
        ORDER BY s.created_at DESC
    `, [profile.id, profile.id]);
    return { ok: true, stories: stories || [] };
});

registerHandler('ig_story_post', async (source, args) => {
    const profile = await getIgProfile(source);
    const { image } = args;
    if (!image) return { error: 'Imagem obrigatória' };
    const id = await dbInsert(
        'INSERT INTO smartphone_instagram_stories (profile_id, image, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 24 HOUR))',
        [profile.id, image]
    );
    return { ok: true, storyId: id };
});

registerHandler('ig_delete_post', async (source, args) => {
    const profile = await getIgProfile(source);
    await dbUpdate('DELETE FROM smartphone_instagram_posts WHERE id = ? AND profile_id = ?', [args.postId, profile.id]);
    return { ok: true };
});

registerHandler('ig_search', async (source, args) => {
    const { query } = args;
    if (!query?.trim()) return { ok: true, results: [] };
    const results = await dbQuery(
        "SELECT id, username, name, avatar FROM smartphone_instagram_profiles WHERE username LIKE ? OR name LIKE ? LIMIT 20",
        [`%${query}%`, `%${query}%`]
    );
    return { ok: true, results: results || [] };
});

// ============================================
// HANDLERS: Twitter
// ============================================

async function getTwitterProfile(source) {
    const userId = await getUserIdCached(source);
    const phone = await getPhoneFromSource(source);
    let profile = await dbSingle('SELECT * FROM smartphone_twitter_profiles WHERE user_id = ?', [userId]);
    if (!profile) {
        const name = 'Jogador ' + (phone || '').replace(/[^0-9]/g, '').slice(-4);
        const username = phone.replace(/[^0-9]/g, '');
        const id = await dbInsert(
            'INSERT INTO smartphone_twitter_profiles (user_id, username, display_name) VALUES (?, ?, ?)',
            [userId, username, name]
        );
        profile = { id, user_id: parseInt(userId), username, display_name: name, bio: '', avatar: null, verified: 0 };
    }
    return profile;
}

registerHandler('tw_profile', async (source, args) => {
    if (args?.profileId) {
        const profile = await dbSingle('SELECT * FROM smartphone_twitter_profiles WHERE id = ?', [args.profileId]);
        if (!profile) return { error: 'Perfil não encontrado' };
        const tweets = await dbQuery(
            'SELECT t.*, (SELECT COUNT(*) FROM smartphone_twitter_likes WHERE tweet_id = t.id) AS likes_count FROM smartphone_twitter_tweets t WHERE profile_id = ? ORDER BY id DESC LIMIT 50',
            [args.profileId]
        );
        const myProfile = await getTwitterProfile(source);
        return { ok: true, profile, tweets: tweets || [], myProfileId: myProfile.id };
    }
    const profile = await getTwitterProfile(source);
    const tweets = await dbQuery(
        'SELECT t.*, (SELECT COUNT(*) FROM smartphone_twitter_likes WHERE tweet_id = t.id) AS likes_count FROM smartphone_twitter_tweets t WHERE profile_id = ? ORDER BY id DESC LIMIT 50',
        [profile.id]
    );
    return { ok: true, profile, tweets: tweets || [], myProfileId: profile.id };
});

registerHandler('tw_profile_update', async (source, args) => {
    const profile = await getTwitterProfile(source);
    const { bio, display_name } = args;
    const updates = [];
    const params = [];
    if (bio !== undefined) { updates.push('bio = ?'); params.push(bio); }
    if (display_name !== undefined) { updates.push('display_name = ?'); params.push(display_name); }
    if (updates.length > 0) {
        params.push(profile.id);
        await dbUpdate(`UPDATE smartphone_twitter_profiles SET ${updates.join(', ')} WHERE id = ?`, params);
    }
    return { ok: true };
});

registerHandler('tw_feed', async (source) => {
    const profile = await getTwitterProfile(source);
    const tweets = await dbQuery(`
        SELECT t.id, t.content, t.image, t.created_at, t.profile_id,
            pr.username, pr.display_name, pr.avatar, pr.verified,
            (SELECT COUNT(*) FROM smartphone_twitter_likes WHERE tweet_id = t.id) AS likes_count,
            (SELECT COUNT(*) FROM smartphone_twitter_likes WHERE tweet_id = t.id AND profile_id = ?) AS is_liked
        FROM smartphone_twitter_tweets t
        JOIN smartphone_twitter_profiles pr ON pr.id = t.profile_id
        ORDER BY t.id DESC LIMIT 50
    `, [profile.id]);
    return { ok: true, tweets: tweets || [], myProfileId: profile.id };
});

registerHandler('tw_tweet', async (source, args) => {
    const profile = await getTwitterProfile(source);
    const { content, image } = args;
    if (!content?.trim()) return { error: 'Tweet vazio' };
    if (content.length > 280) return { error: 'Máximo 280 caracteres' };
    const tweetId = await dbInsert(
        'INSERT INTO smartphone_twitter_tweets (profile_id, content, image) VALUES (?, ?, ?)',
        [profile.id, content.trim(), image || null]
    );
    return { ok: true, tweet: { id: tweetId, content: content.trim(), image, profile_id: profile.id, username: profile.username, display_name: profile.display_name, avatar: profile.avatar, verified: profile.verified, likes_count: 0, is_liked: 0, created_at: new Date().toISOString() } };
});

registerHandler('tw_like', async (source, args) => {
    const profile = await getTwitterProfile(source);
    const { tweetId } = args;
    const existing = await dbSingle('SELECT 1 FROM smartphone_twitter_likes WHERE profile_id = ? AND tweet_id = ?', [profile.id, tweetId]);
    if (existing) {
        await dbUpdate('DELETE FROM smartphone_twitter_likes WHERE profile_id = ? AND tweet_id = ?', [profile.id, tweetId]);
        return { ok: true, liked: false };
    }
    await dbInsert('INSERT INTO smartphone_twitter_likes (profile_id, tweet_id) VALUES (?, ?)', [profile.id, tweetId]);
    return { ok: true, liked: true };
});

registerHandler('tw_delete', async (source, args) => {
    const profile = await getTwitterProfile(source);
    await dbUpdate('DELETE FROM smartphone_twitter_tweets WHERE id = ? AND profile_id = ?', [args.tweetId, profile.id]);
    return { ok: true };
});

registerHandler('tw_search', async (source, args) => {
    const profile = await getTwitterProfile(source);
    const { query } = args;
    if (!query?.trim()) return { ok: true, tweets: [] };
    const tweets = await dbQuery(`
        SELECT t.id, t.content, t.image, t.created_at, t.profile_id,
            pr.username, pr.display_name, pr.avatar, pr.verified,
            (SELECT COUNT(*) FROM smartphone_twitter_likes WHERE tweet_id = t.id) AS likes_count,
            (SELECT COUNT(*) FROM smartphone_twitter_likes WHERE tweet_id = t.id AND profile_id = ?) AS is_liked
        FROM smartphone_twitter_tweets t
        JOIN smartphone_twitter_profiles pr ON pr.id = t.profile_id
        WHERE t.content LIKE ?
        ORDER BY t.id DESC LIMIT 30
    `, [profile.id, `%${query}%`]);
    return { ok: true, tweets: tweets || [] };
});

// ============================================
// HANDLERS: TikTok
// ============================================

async function getTikTokProfile(source) {
    const phone = await getPhoneFromSource(source);
    let profile = await dbSingle('SELECT * FROM smartphone_tiktok_profiles WHERE phone = ?', [phone]);
    if (!profile) {
        const name = 'Jogador ' + (phone || '').replace(/[^0-9]/g, '').slice(-4);
        const username = phone.replace(/[^0-9]/g, '');
        const id = await dbInsert(
            'INSERT INTO smartphone_tiktok_profiles (phone, username, display_name) VALUES (?, ?, ?)',
            [phone, username, name]
        );
        profile = { id, phone, username, display_name: name, bio: '', avatar: null, followers_count: 0, following_count: 0, likes_count: 0 };
    }
    return profile;
}

registerHandler('tiktok_profile', async (source, args) => {
    if (args?.profileId) {
        const profile = await dbSingle('SELECT * FROM smartphone_tiktok_profiles WHERE id = ?', [args.profileId]);
        if (!profile) return { error: 'Perfil não encontrado' };
        const videos = await dbQuery('SELECT * FROM smartphone_tiktok_videos WHERE profile_id = ? ORDER BY id DESC', [args.profileId]);
        const myProfile = await getTikTokProfile(source);
        const isFollowing = await dbScalar('SELECT COUNT(*) FROM smartphone_tiktok_follows WHERE follower_id = ? AND following_id = ?', [myProfile.id, args.profileId]);
        return { ok: true, profile, videos: videos || [], isFollowing: isFollowing > 0, myProfileId: myProfile.id };
    }
    const profile = await getTikTokProfile(source);
    const videos = await dbQuery('SELECT * FROM smartphone_tiktok_videos WHERE profile_id = ? ORDER BY id DESC', [profile.id]);
    return { ok: true, profile, videos: videos || [], myProfileId: profile.id };
});

registerHandler('tiktok_feed', async (source) => {
    const profile = await getTikTokProfile(source);
    const videos = await dbQuery(`
        SELECT v.id, v.caption, v.thumbnail, v.likes_count, v.comments_count, v.views_count, v.created_at, v.profile_id,
            pr.username, pr.display_name, pr.avatar,
            (SELECT COUNT(*) FROM smartphone_tiktok_likes WHERE video_id = v.id AND profile_id = ?) AS is_liked
        FROM smartphone_tiktok_videos v
        JOIN smartphone_tiktok_profiles pr ON pr.id = v.profile_id
        ORDER BY v.id DESC LIMIT 30
    `, [profile.id]);
    return { ok: true, videos: videos || [], myProfileId: profile.id };
});

registerHandler('tiktok_post', async (source, args) => {
    const profile = await getTikTokProfile(source);
    const { caption } = args;
    if (!caption?.trim()) return { error: 'Legenda obrigatória' };
    const videoId = await dbInsert(
        'INSERT INTO smartphone_tiktok_videos (profile_id, caption) VALUES (?, ?)',
        [profile.id, caption.trim()]
    );
    return { ok: true, video: { id: videoId, caption: caption.trim(), profile_id: profile.id, username: profile.username, display_name: profile.display_name, likes_count: 0, comments_count: 0, views_count: 0, created_at: new Date().toISOString() } };
});

registerHandler('tiktok_like', async (source, args) => {
    const profile = await getTikTokProfile(source);
    const { videoId } = args;
    const existing = await dbSingle('SELECT 1 FROM smartphone_tiktok_likes WHERE profile_id = ? AND video_id = ?', [profile.id, videoId]);
    if (existing) {
        await dbUpdate('DELETE FROM smartphone_tiktok_likes WHERE profile_id = ? AND video_id = ?', [profile.id, videoId]);
        await dbUpdate('UPDATE smartphone_tiktok_videos SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = ?', [videoId]);
        return { ok: true, liked: false };
    }
    await dbInsert('INSERT INTO smartphone_tiktok_likes (profile_id, video_id) VALUES (?, ?)', [profile.id, videoId]);
    await dbUpdate('UPDATE smartphone_tiktok_videos SET likes_count = likes_count + 1 WHERE id = ?', [videoId]);
    return { ok: true, liked: true };
});

registerHandler('tiktok_comments', async (source, args) => {
    const { videoId } = args;
    const comments = await dbQuery(`
        SELECT c.id, c.comment, c.created_at, pr.username, pr.display_name, pr.avatar, pr.id AS profile_id
        FROM smartphone_tiktok_comments c
        JOIN smartphone_tiktok_profiles pr ON pr.id = c.profile_id
        WHERE c.video_id = ? ORDER BY c.id DESC LIMIT 50
    `, [videoId]);
    return { ok: true, comments: comments || [] };
});

registerHandler('tiktok_comment', async (source, args) => {
    const profile = await getTikTokProfile(source);
    const { videoId, comment } = args;
    if (!comment?.trim()) return { error: 'Comentário vazio' };
    const id = await dbInsert(
        'INSERT INTO smartphone_tiktok_comments (video_id, profile_id, comment) VALUES (?, ?, ?)',
        [videoId, profile.id, comment.trim()]
    );
    await dbUpdate('UPDATE smartphone_tiktok_videos SET comments_count = comments_count + 1 WHERE id = ?', [videoId]);
    return { ok: true, comment: { id, comment: comment.trim(), username: profile.username, display_name: profile.display_name, created_at: new Date().toISOString() } };
});

registerHandler('tiktok_follow', async (source, args) => {
    const profile = await getTikTokProfile(source);
    const { profileId } = args;
    if (profileId === profile.id) return { error: 'Não pode seguir a si mesmo' };
    const existing = await dbSingle('SELECT 1 FROM smartphone_tiktok_follows WHERE follower_id = ? AND following_id = ?', [profile.id, profileId]);
    if (existing) {
        await dbUpdate('DELETE FROM smartphone_tiktok_follows WHERE follower_id = ? AND following_id = ?', [profile.id, profileId]);
        await dbUpdate('UPDATE smartphone_tiktok_profiles SET followers_count = GREATEST(followers_count - 1, 0) WHERE id = ?', [profileId]);
        await dbUpdate('UPDATE smartphone_tiktok_profiles SET following_count = GREATEST(following_count - 1, 0) WHERE id = ?', [profile.id]);
        return { ok: true, following: false };
    }
    await dbInsert('INSERT INTO smartphone_tiktok_follows (follower_id, following_id) VALUES (?, ?)', [profile.id, profileId]);
    await dbUpdate('UPDATE smartphone_tiktok_profiles SET followers_count = followers_count + 1 WHERE id = ?', [profileId]);
    await dbUpdate('UPDATE smartphone_tiktok_profiles SET following_count = following_count + 1 WHERE id = ?', [profile.id]);
    return { ok: true, following: true };
});

registerHandler('tiktok_delete', async (source, args) => {
    const profile = await getTikTokProfile(source);
    await dbUpdate('DELETE FROM smartphone_tiktok_videos WHERE id = ? AND profile_id = ?', [args.videoId, profile.id]);
    return { ok: true };
});

// ============================================
// HANDLERS: Tinder
// ============================================

async function getTinderProfile(source) {
    const phone = await getPhoneFromSource(source);
    let profile = await dbSingle('SELECT * FROM smartphone_tinder_profiles WHERE phone = ?', [phone]);
    return profile;
}

registerHandler('tinder_profile', async (source) => {
    const profile = await getTinderProfile(source);
    return { ok: true, profile };
});

registerHandler('tinder_setup', async (source, args) => {
    const phone = await getPhoneFromSource(source);
    const { name, age, bio, photos, gender, interest } = args;
    if (!name || !age) return { error: 'Nome e idade obrigatórios' };

    const existing = await dbSingle('SELECT id FROM smartphone_tinder_profiles WHERE phone = ?', [phone]);
    if (existing) {
        await dbUpdate(
            'UPDATE smartphone_tinder_profiles SET name = ?, age = ?, bio = ?, photos = ?, gender = ?, interest = ? WHERE id = ?',
            [name, age, bio || '', photos || '[]', gender || 'male', interest || 'female', existing.id]
        );
        return { ok: true, profileId: existing.id };
    }
    const id = await dbInsert(
        'INSERT INTO smartphone_tinder_profiles (phone, name, age, bio, photos, gender, interest) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [phone, name, age, bio || '', photos || '[]', gender || 'male', interest || 'female']
    );
    return { ok: true, profileId: id };
});

registerHandler('tinder_discover', async (source) => {
    const profile = await getTinderProfile(source);
    if (!profile) return { error: 'Configure seu perfil primeiro' };

    const profiles = await dbQuery(`
        SELECT * FROM smartphone_tinder_profiles
        WHERE id != ?
        AND gender = ?
        AND id NOT IN (SELECT swiped_id FROM smartphone_tinder_swipes WHERE swiper_id = ?)
        ORDER BY RAND() LIMIT 10
    `, [profile.id, profile.interest, profile.id]);
    return { ok: true, profiles: profiles || [] };
});

registerHandler('tinder_swipe', async (source, args) => {
    const profile = await getTinderProfile(source);
    if (!profile) return { error: 'Configure seu perfil primeiro' };
    const { targetId, direction } = args;

    await dbInsert(
        'INSERT INTO smartphone_tinder_swipes (swiper_id, swiped_id, direction) VALUES (?, ?, ?)',
        [profile.id, targetId, direction]
    );

    // Check match
    if (direction === 'right') {
        const mutual = await dbSingle(
            "SELECT 1 FROM smartphone_tinder_swipes WHERE swiper_id = ? AND swiped_id = ? AND direction = 'right'",
            [targetId, profile.id]
        );
        if (mutual) {
            const matchId = await dbInsert(
                'INSERT INTO smartphone_tinder_matches (profile1_id, profile2_id) VALUES (?, ?)',
                [Math.min(profile.id, targetId), Math.max(profile.id, targetId)]
            );
            const matchedProfile = await dbSingle('SELECT * FROM smartphone_tinder_profiles WHERE id = ?', [targetId]);

            // Push notification
            const matchedPhone = matchedProfile?.phone;
            if (matchedPhone) {
                const targetSource = getSourceByPhone(matchedPhone);
                if (targetSource) {
                    pushToPlayer(targetSource, 'TINDER_MATCH', { matchId, profile: { id: profile.id, name: profile.name, photos: profile.photos } });
                }
            }
            return { ok: true, match: true, matchId, matchedProfile };
        }
    }
    return { ok: true, match: false };
});

registerHandler('tinder_matches', async (source) => {
    const profile = await getTinderProfile(source);
    if (!profile) return { ok: true, matches: [] };

    const matches = await dbQuery(`
        SELECT m.id AS match_id, m.created_at,
            CASE WHEN m.profile1_id = ? THEN m.profile2_id ELSE m.profile1_id END AS other_id
        FROM smartphone_tinder_matches m
        WHERE m.profile1_id = ? OR m.profile2_id = ?
        ORDER BY m.created_at DESC
    `, [profile.id, profile.id, profile.id]);

    const resolved = [];
    for (const m of (matches || [])) {
        const other = await dbSingle('SELECT id, name, age, photos FROM smartphone_tinder_profiles WHERE id = ?', [m.other_id]);
        const lastMsg = await dbSingle(
            'SELECT message, created_at FROM smartphone_tinder_messages WHERE match_id = ? ORDER BY id DESC LIMIT 1',
            [m.match_id]
        );
        resolved.push({ ...m, other, lastMessage: lastMsg?.message, lastMessageAt: lastMsg?.created_at });
    }
    return { ok: true, matches: resolved };
});

registerHandler('tinder_messages', async (source, args) => {
    const profile = await getTinderProfile(source);
    const { matchId } = args;
    const messages = await dbQuery(`
        SELECT m.id, m.sender_id, m.message, m.created_at
        FROM smartphone_tinder_messages m
        WHERE m.match_id = ? ORDER BY m.id ASC LIMIT 100
    `, [matchId]);
    return { ok: true, messages: messages || [], myProfileId: profile?.id };
});

registerHandler('tinder_send', async (source, args) => {
    const profile = await getTinderProfile(source);
    if (!profile) return { error: 'Configure seu perfil' };
    const { matchId, message } = args;
    if (!message?.trim()) return { error: 'Mensagem vazia' };

    const msgId = await dbInsert(
        'INSERT INTO smartphone_tinder_messages (match_id, sender_id, message) VALUES (?, ?, ?)',
        [matchId, profile.id, message.trim()]
    );

    // Push
    const match = await dbSingle('SELECT profile1_id, profile2_id FROM smartphone_tinder_matches WHERE id = ?', [matchId]);
    if (match) {
        const otherId = match.profile1_id === profile.id ? match.profile2_id : match.profile1_id;
        const otherProfile = await dbSingle('SELECT phone FROM smartphone_tinder_profiles WHERE id = ?', [otherId]);
        if (otherProfile?.phone) {
            const targetSource = getSourceByPhone(otherProfile.phone);
            if (targetSource) {
                pushToPlayer(targetSource, 'TINDER_MESSAGE', { matchId, message: { id: msgId, sender_id: profile.id, message: message.trim(), created_at: new Date().toISOString() }, senderName: profile.name });
            }
        }
    }

    return { ok: true, message: { id: msgId, sender_id: profile.id, message: message.trim(), created_at: new Date().toISOString() } };
});

// ============================================
// HANDLERS: Marketplace
// ============================================

registerHandler('market_listings', async (source, args) => {
    const { category, search } = args || {};
    let sql = `
        SELECT m.*, m.seller_phone AS seller_name
        FROM smartphone_marketplace m
        WHERE m.status = 'active'
    `;
    const params = [];
    if (category) { sql += ' AND m.category = ?'; params.push(category); }
    if (search) { sql += ' AND (m.title LIKE ? OR m.description LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
    sql += ' ORDER BY m.id DESC LIMIT 50';
    const listings = await dbQuery(sql, params);
    return { ok: true, listings: listings || [] };
});

registerHandler('market_my_listings', async (source) => {
    const phone = await getPhoneFromSource(source);
    const listings = await dbQuery(
        "SELECT * FROM smartphone_marketplace WHERE seller_phone = ? ORDER BY id DESC",
        [phone]
    );
    return { ok: true, listings: listings || [] };
});

registerHandler('market_create', async (source, args) => {
    const phone = await getPhoneFromSource(source);
    const { title, description, price, category, image } = args;
    if (!title?.trim()) return { error: 'Título obrigatório' };
    if (!price || price <= 0) return { error: 'Preço inválido' };

    const id = await dbInsert(
        "INSERT INTO smartphone_marketplace (seller_phone, title, description, price, category, image, status) VALUES (?, ?, ?, ?, ?, ?, 'active')",
        [phone, title.trim(), description || '', price, category || 'geral', image || null]
    );
    return { ok: true, listingId: id };
});

registerHandler('market_buy', async (source, args) => {
    const buyerPhone = await getPhoneFromSource(source);
    const buyerId = await getUserIdCached(source);
    const { listingId } = args;

    const listing = await dbSingle("SELECT * FROM smartphone_marketplace WHERE id = ? AND status = 'active'", [listingId]);
    if (!listing) return { error: 'Anúncio indisponível' };
    if (listing.seller_phone === buyerPhone) return { error: 'Não pode comprar próprio anúncio' };

    // Verificar saldo
    let balance = 0;
    try {
        if (typeof exports.vrp?.getMoney === 'function') balance = exports.vrp.getMoney(parseInt(buyerId)) || 0;
        else if (typeof exports.vrp?.getBankMoney === 'function') balance = exports.vrp.getBankMoney(parseInt(buyerId)) || 0;
    } catch (e) { balance = 0; }

    if (balance < listing.price) return { error: 'Saldo insuficiente' };

    // Transferir dinheiro
    const sellerId = phoneToUserId(listing.seller_phone);
    try {
        if (typeof exports.vrp?.removeMoney === 'function') exports.vrp.removeMoney(parseInt(buyerId), listing.price);
        else if (typeof exports.vrp?.removeBankMoney === 'function') exports.vrp.removeBankMoney(parseInt(buyerId), listing.price);
        if (typeof exports.vrp?.addMoney === 'function') exports.vrp.addMoney(parseInt(sellerId), listing.price);
        else if (typeof exports.vrp?.addBankMoney === 'function') exports.vrp.addBankMoney(parseInt(sellerId), listing.price);
    } catch (e) { return { error: 'Erro ao processar pagamento' }; }

    // Marcar como vendido
    await dbUpdate("UPDATE smartphone_marketplace SET status = 'sold', buyer_phone = ? WHERE id = ?", [buyerPhone, listingId]);

    // Registrar transação
    await dbInsert(
        "INSERT INTO smartphone_bank_transactions (from_phone, to_phone, amount, type, description) VALUES (?, ?, ?, 'transfer', ?)",
        [buyerPhone, listing.seller_phone, listing.price, `Marketplace: ${listing.title}`]
    );

    // Push pro vendedor
    const sellerSource = getSourceByPhone(listing.seller_phone);
    if (sellerSource) {
        pushToPlayer(sellerSource, 'MARKET_SOLD', { listingId, title: listing.title, price: listing.price, buyerPhone });
    }

    return { ok: true };
});

registerHandler('market_delete', async (source, args) => {
    const phone = await getPhoneFromSource(source);
    await dbUpdate("DELETE FROM smartphone_marketplace WHERE id = ? AND seller_phone = ?", [args.listingId, phone]);
    return { ok: true };
});

registerHandler('market_contact', async (source, args) => {
    // Retornar telefone do vendedor pra iniciar SMS/WhatsApp
    const listing = await dbSingle('SELECT seller_phone FROM smartphone_marketplace WHERE id = ?', [args.listingId]);
    if (!listing) return { error: 'Anúncio não encontrado' };
    return { ok: true, phone: listing.seller_phone };
});

// CALLS: InCalls map (inspirado no Z-Phone)
// ============================================

const activeCalls = {}; // callId → { callerPhone, callerSource, receiverPhone, receiverSource, accepted, startTime }
let callIdCounter = 0;

function generateCallId() {
    return ++callIdCounter;
}

function getActiveCallByPhone(phone) {
    for (const [id, call] of Object.entries(activeCalls)) {
        if (call.callerPhone === phone || call.receiverPhone === phone) {
            return { id: parseInt(id), ...call };
        }
    }
    return null;
}

function isPhoneInCall(phone) {
    return !!getActiveCallByPhone(phone);
}

// ============================================
// HANDLERS: Calls
// ============================================

registerHandler('call_init', async (source, args) => {
    const callerPhone = await getPhoneFromSource(source);
    const { phone: receiverPhone, anonymous } = args;

    if (!receiverPhone) return { error: 'Número obrigatório' };
    if (receiverPhone === callerPhone) return { error: 'Não pode ligar pra si mesmo' };

    // Verifica se caller já está em chamada
    if (isPhoneInCall(callerPhone)) return { error: 'Você já está em uma chamada' };

    // Verifica se receiver existe
    const receiverProfile = await dbSingle(
        'SELECT phone_number FROM smartphone_profiles WHERE phone_number = ?',
        [receiverPhone]
    );
    if (!receiverProfile) return { error: 'Número não encontrado', unavailable: true };

    // Verifica se receiver está online
    const receiverSource = getSourceByPhone(receiverPhone);
    if (!receiverSource) return { error: 'Pessoa indisponível', unavailable: true };

    // Verifica se receiver já está em chamada
    if (isPhoneInCall(receiverPhone)) return { error: 'Pessoa está em outra chamada', busy: true };

    // Verifica se está bloqueado
    const receiverUserId = phoneToUserId(receiverPhone);
    const callerUserId = phoneToUserId(callerPhone);
    const isBlocked = await dbSingle(
        'SELECT 1 FROM smartphone_blocked WHERE user_id = ? AND blocked_phone = ?',
        [receiverUserId, callerPhone]
    );
    if (isBlocked) return { error: 'Pessoa indisponível', unavailable: true };

    // Criar chamada
    const callId = generateCallId();
    activeCalls[callId] = {
        callerPhone,
        callerSource: source,
        receiverPhone,
        receiverSource,
        accepted: false,
        anonymous: !!anonymous,
        startTime: Date.now(),
    };

    // Salvar no DB
    await dbInsert(
        'INSERT INTO smartphone_calls (caller_phone, receiver_phone, status, is_anonymous) VALUES (?, ?, ?, ?)',
        [callerPhone, receiverPhone, 'missed', anonymous ? 1 : 0]
    );

    // Resolver nome do contato pra quem recebe
    const callerContact = await dbSingle(
        'SELECT contact_name FROM smartphone_contacts WHERE user_id = ? AND contact_phone = ?',
        [receiverUserId, callerPhone]
    );

    // Push pro receiver: chamada recebida
    pushToPlayer(receiverSource, 'CALL_INCOMING', {
        callId,
        callerPhone: anonymous ? 'Anônimo' : callerPhone,
        callerName: anonymous ? 'Número Oculto' : (callerContact?.contact_name || callerPhone),
    });

    return {
        ok: true,
        callId,
        receiverPhone,
        status: 'ringing',
    };
});

registerHandler('call_accept', async (source, args) => {
    const myPhone = await getPhoneFromSource(source);
    const { callId } = args;

    const call = activeCalls[callId];
    if (!call) return { error: 'Chamada não encontrada' };
    if (call.receiverPhone !== myPhone) return { error: 'Chamada não é para você' };

    call.accepted = true;
    call.acceptedAt = Date.now();

    // Atualizar DB
    await dbUpdate(
        'UPDATE smartphone_calls SET status = ? WHERE caller_phone = ? AND receiver_phone = ? ORDER BY id DESC LIMIT 1',
        ['answered', call.callerPhone, call.receiverPhone]
    );

    // Push pro caller: chamada aceita
    pushToPlayer(call.callerSource, 'CALL_ACCEPTED', {
        callId,
        receiverPhone: call.receiverPhone,
    });

    // Push pro receiver: confirmar
    pushToPlayer(call.receiverSource, 'CALL_ACCEPTED', {
        callId,
        callerPhone: call.callerPhone,
    });

    return { ok: true, callId };
});

registerHandler('call_reject', async (source, args) => {
    const myPhone = await getPhoneFromSource(source);
    const { callId } = args;

    const call = activeCalls[callId];
    if (!call) return { error: 'Chamada não encontrada' };

    // Atualizar DB
    await dbUpdate(
        'UPDATE smartphone_calls SET status = ? WHERE caller_phone = ? AND receiver_phone = ? ORDER BY id DESC LIMIT 1',
        ['rejected', call.callerPhone, call.receiverPhone]
    );

    // Push pro caller
    pushToPlayer(call.callerSource, 'CALL_REJECTED', { callId });

    // Limpar
    delete activeCalls[callId];

    return { ok: true };
});

registerHandler('call_end', async (source, args) => {
    const myPhone = await getPhoneFromSource(source);
    const { callId } = args;

    const call = activeCalls[callId];
    if (!call) return { error: 'Chamada não encontrada' };

    // Calcular duração
    const duration = call.acceptedAt ? Math.floor((Date.now() - call.acceptedAt) / 1000) : 0;

    // Atualizar DB com duração
    if (duration > 0) {
        await dbUpdate(
            'UPDATE smartphone_calls SET duration = ? WHERE caller_phone = ? AND receiver_phone = ? ORDER BY id DESC LIMIT 1',
            [duration, call.callerPhone, call.receiverPhone]
        );
    }

    // Push pra ambos
    const otherSource = myPhone === call.callerPhone ? call.receiverSource : call.callerSource;
    pushToPlayer(otherSource, 'CALL_ENDED', { callId, duration });

    // Limpar
    delete activeCalls[callId];

    return { ok: true, duration };
});

registerHandler('call_cancel', async (source, args) => {
    // Caller cancela antes de atender (ring ring... desistiu)
    const myPhone = await getPhoneFromSource(source);
    const { callId } = args;

    const call = activeCalls[callId];
    if (!call) return { ok: true }; // Já cancelada

    // Push pro receiver
    if (call.receiverSource) {
        pushToPlayer(call.receiverSource, 'CALL_CANCELLED', { callId });
    }

    delete activeCalls[callId];
    return { ok: true };
});

registerHandler('call_history', async (source) => {
    const myPhone = await getPhoneFromSource(source);
    const userId = await getUserIdCached(source);

    const calls = await dbQuery(`
        SELECT c.*, 
            CASE 
                WHEN c.caller_phone = ? THEN c.receiver_phone
                ELSE c.caller_phone
            END AS other_phone,
            CASE 
                WHEN c.caller_phone = ? THEN 'outgoing'
                ELSE 'incoming'
            END AS direction
        FROM smartphone_calls c
        WHERE c.caller_phone = ? OR c.receiver_phone = ?
        ORDER BY c.created_at DESC
        LIMIT 50
    `, [myPhone, myPhone, myPhone, myPhone]);

    // Resolver nomes dos contatos
    const resolved = [];
    for (const call of (calls || [])) {
        const contact = await dbSingle(
            'SELECT contact_name FROM smartphone_contacts WHERE user_id = ? AND contact_phone = ?',
            [userId, call.other_phone]
        );
        resolved.push({
            ...call,
            other_name: (call.is_anonymous && call.direction === 'incoming') ? 'Número Oculto' : (contact?.contact_name || null),
        });
    }

    return { ok: true, calls: resolved };
});

// Limpar chamadas de jogadores que desconectam
on('playerDropped', () => {
    const src = global.source;
    for (const [id, call] of Object.entries(activeCalls)) {
        if (call.callerSource === src || call.receiverSource === src) {
            const otherSource = call.callerSource === src ? call.receiverSource : call.callerSource;
            if (otherSource) {
                pushToPlayer(otherSource, 'CALL_ENDED', { callId: parseInt(id), duration: 0, disconnected: true });
            }
            delete activeCalls[id];
        }
    }
});

// ============================================
// EXPORTS
// ============================================

global.smartphoneServer = {
    registerHandler, pushToPlayer, pushToAll,
    dbQuery, dbScalar, dbInsert, dbUpdate, dbSingle,
    getUserId, getUserIdCached, getPhoneFromSource, getSourceByPhone,
    userIdToPhone, phoneToUserId, ensureProfile, config
};

// ============================================
// UBER
// ============================================

const uberDrivers = {}; // { source: { online, userId, name } }

registerHandler('uber_init', async (source) => {
    const userId = await getUserIdCached(source);
    const phone = await getPhoneFromSource(source);
    const recentDests = await dbQuery(
        'SELECT DISTINCT destination FROM smartphone_uber_rides WHERE passenger_id = ? ORDER BY id DESC LIMIT 5',
        [userId]
    ).then(r => r.map(x => x.destination));
    const activeRide = await dbQuery(
        `SELECT * FROM smartphone_uber_rides WHERE (passenger_id = ? OR driver_id = ?) AND status IN ('waiting','accepted') ORDER BY id DESC LIMIT 1`,
        [userId, userId]
    ).then(r => r[0] || null);
    const isDriver = uberDrivers[source]?.online || false;
    const mode = activeRide ? (activeRide.passenger_id == userId ? 'passenger' : 'driver') : null;
    return { ok: true, recentDests, activeRide, driverOnline: isDriver, mode };
});

registerHandler('uber_set_mode', async (source, args) => {
    return { ok: true };
});

registerHandler('uber_request', async (source, args) => {
    const userId = await getUserIdCached(source);
    const phone = await getPhoneFromSource(source);
    const { destination, rideType } = args || {};
    if (!destination?.trim()) return { error: 'Informe o destino' };

    const multipliers = { uberx: 1.0, comfort: 1.4, black: 2.2 };
    const basePrice = 100 + Math.floor(Math.random() * 200);
    const price = Math.round(basePrice * (multipliers[rideType] || 1.0));

    const id = await dbInsert(
        `INSERT INTO smartphone_uber_rides (passenger_id, passenger_phone, destination, ride_type, estimated_price, status)
         VALUES (?, ?, ?, ?, ?, 'waiting')`,
        [userId, phone, destination, rideType || 'uberx', price]
    );

    const rideData = { id, passenger_id: userId, passenger_name: 'Jogador ' + String(phone||'').slice(-4), passenger_phone: phone, destination, ride_type: rideType || 'uberx', estimated_price: price, status: 'waiting' };

    // Push to all online drivers
    for (const [driverSrc, driver] of Object.entries(uberDrivers)) {
        if (driver.online && parseInt(driverSrc) !== source) {
            pushToPlayer(parseInt(driverSrc), 'UBER_RIDE_REQUEST', rideData);
        }
    }

    return { ok: true, ride: rideData };
});

registerHandler('uber_accept', async (source, args) => {
    const userId = await getUserIdCached(source);
    const phone = await getPhoneFromSource(source);
    const { rideId } = args || {};
    if (!rideId) return { error: 'Corrida inválida' };

    const ride = await dbQuery('SELECT * FROM smartphone_uber_rides WHERE id = ? AND status = "waiting"', [rideId]).then(r => r[0]);
    if (!ride) return { error: 'Corrida não disponível' };

    await dbUpdate(
        'UPDATE smartphone_uber_rides SET driver_id = ?, driver_phone = ?, status = "accepted" WHERE id = ?',
        [userId, phone, rideId]
    );

    const acceptData = { rideId, driver_id: userId, driver_name: 'Motorista ' + String(phone||'').slice(-4), driver_phone: phone, driver_rating: '4.9' };

    // Push to passenger
    const passengerSource = findPlayerSource(ride.passenger_id);
    if (passengerSource) pushToPlayer(passengerSource, 'UBER_RIDE_ACCEPTED', acceptData);

    // Set blip on passenger map
    if (passengerSource) emitNet('smartphone:blip', passengerSource, { type: 'uber_driver', label: 'Seu Motorista' });
    emitNet('smartphone:blip', source, { type: 'uber_passenger', label: 'Passageiro' });

    return { ok: true, ride: { ...ride, ...acceptData, status: 'accepted' } };
});

registerHandler('uber_complete', async (source, args) => {
    const userId = await getUserIdCached(source);
    const { rideId } = args || {};
    if (!rideId) return { error: 'Corrida inválida' };

    const ride = await dbQuery('SELECT * FROM smartphone_uber_rides WHERE id = ? AND status = "accepted"', [rideId]).then(r => r[0]);
    if (!ride) return { error: 'Corrida não encontrada' };

    const price = ride.estimated_price || 200;

    // Charge passenger, pay driver
    try {
        const passUserId = parseInt(ride.passenger_id);
        const drivUserId = parseInt(ride.driver_id);
        const vRP = exports['vrp'];
        if (vRP && vRP.getMoney) {
            const passMoney = vRP.getMoney(passUserId) || 0;
            if (passMoney >= price) {
                vRP.removeMoney(passUserId, price);
                vRP.addMoney(drivUserId, Math.round(price * 0.85)); // 15% taxa Uber
            }
        }
    } catch(e) { console.log('[UBER] vRP payment error:', e.message); }

    await dbUpdate('UPDATE smartphone_uber_rides SET status = "completed", price = ? WHERE id = ?', [price, rideId]);

    const completeData = { rideId, price, status: 'completed' };

    // Push to both
    const passengerSource = findPlayerSource(ride.passenger_id);
    if (passengerSource) {
        pushToPlayer(passengerSource, 'UBER_RIDE_COMPLETED', completeData);
        emitNet('smartphone:removeBlip', passengerSource, 'uber_driver');
    }
    emitNet('smartphone:removeBlip', source, 'uber_passenger');

    // Push to driver
    const driverSource = findPlayerSource(ride.driver_id);
    if (driverSource && driverSource !== source) pushToPlayer(driverSource, 'UBER_RIDE_COMPLETED', completeData);

    return { ok: true, ...completeData };
});

registerHandler('uber_cancel', async (source, args) => {
    const { rideId } = args || {};
    if (!rideId) return { error: 'Corrida inválida' };

    const ride = await dbQuery('SELECT * FROM smartphone_uber_rides WHERE id = ? AND status IN ("waiting","accepted")', [rideId]).then(r => r[0]);
    if (!ride) return { error: 'Corrida não encontrada' };

    await dbUpdate('UPDATE smartphone_uber_rides SET status = "cancelled" WHERE id = ?', [rideId]);

    // Push to other party
    const passengerSource = findPlayerSource(ride.passenger_id);
    const driverSource = ride.driver_id ? findPlayerSource(ride.driver_id) : null;

    if (passengerSource) { pushToPlayer(passengerSource, 'UBER_RIDE_CANCELLED', { rideId }); emitNet('smartphone:removeBlip', passengerSource, 'uber_driver'); }
    if (driverSource) { pushToPlayer(driverSource, 'UBER_RIDE_CANCELLED', { rideId }); emitNet('smartphone:removeBlip', driverSource, 'uber_passenger'); }

    return { ok: true };
});

registerHandler('uber_driver_toggle', async (source) => {
    const userId = await getUserIdCached(source);
    const phone = await getPhoneFromSource(source);
    const isOnline = uberDrivers[source]?.online || false;
    if (isOnline) {
        delete uberDrivers[source];
    } else {
        uberDrivers[source] = { online: true, userId, name: 'Motorista ' + String(phone||'').slice(-4) };
    }
    return { ok: true, online: !isOnline };
});

registerHandler('uber_rate', async (source, args) => {
    const { rideId, rating } = args || {};
    if (!rideId || !rating) return { error: 'Avaliação inválida' };
    await dbUpdate('UPDATE smartphone_uber_rides SET rating = ? WHERE id = ?', [rating, rideId]);
    return { ok: true };
});

registerHandler('uber_history', async (source) => {
    const userId = await getUserIdCached(source);
    const rides = await dbQuery(
        'SELECT * FROM smartphone_uber_rides WHERE passenger_id = ? OR driver_id = ? ORDER BY id DESC LIMIT 20',
        [userId, userId]
    );
    return { ok: true, rides };
});

// ============================================
// WAZE / GPS
// ============================================

registerHandler('waze_init', async (source) => {
    const userId = await getUserIdCached(source);
    const reports = await dbQuery(
        'SELECT * FROM smartphone_waze_reports WHERE created_at > DATE_SUB(NOW(), INTERVAL 30 MINUTE) ORDER BY id DESC LIMIT 10'
    );
    const recent = await dbQuery(
        'SELECT DISTINCT destination FROM smartphone_waze_history WHERE user_id = ? ORDER BY id DESC LIMIT 5',
        [userId]
    ).then(r => r.map(x => x.destination));
    return { ok: true, reports, recent, saved: [] };
});

registerHandler('waze_navigate', async (source, args) => {
    const userId = await getUserIdCached(source);
    const { destination } = args || {};
    if (!destination?.trim()) return { error: 'Informe o destino' };
    const eta = `${2 + Math.floor(Math.random() * 8)} min`;
    await dbInsert('INSERT INTO smartphone_waze_history (user_id, destination) VALUES (?, ?)', [userId, destination]);
    // FiveM: create blip on client
    emitNet('smartphone:setWaypoint', source, { destination });
    return { ok: true, eta };
});

registerHandler('waze_stop', async (source) => {
    emitNet('smartphone:removeWaypoint', source);
    return { ok: true };
});

registerHandler('waze_report', async (source, args) => {
    const userId = await getUserIdCached(source);
    const { type } = args || {};
    if (!type) return { error: 'Tipo inválido' };
    const id = await dbInsert('INSERT INTO smartphone_waze_reports (user_id, type) VALUES (?, ?)', [userId, type]);
    return { ok: true, report: { id, type, user_id: userId, created_at: new Date().toISOString() } };
});

// ============================================
// WEAZEL NEWS
// ============================================

registerHandler('weazel_init', async (source) => {
    const userId = await getUserIdCached(source);
    const articles = await dbQuery('SELECT * FROM smartphone_weazel_articles ORDER BY is_breaking DESC, id DESC LIMIT 30');
    // Check if journalist (simple: everyone can read, job-based can write)
    // For now, allow everyone to write — server admins can restrict later
    return { ok: true, articles, isJournalist: true };
});

registerHandler('weazel_publish', async (source, args) => {
    const userId = await getUserIdCached(source);
    const phone = await getPhoneFromSource(source);
    const { title, body, category, isBreaking } = args || {};
    if (!title?.trim() || !body?.trim()) return { error: 'Preencha título e texto' };

    const id = await dbInsert(
        'INSERT INTO smartphone_weazel_articles (author_id, author_name, title, body, category, is_breaking) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, 'Jornalista ' + String(phone||'').slice(-4), title.trim(), body.trim(), category || 'Cidade', isBreaking ? 1 : 0]
    );

    const article = { id, author_id: userId, author_name: 'Jornalista ' + String(phone||'').slice(-4), title: title.trim(), body: body.trim(), category, is_breaking: isBreaking ? 1 : 0, created_at: new Date().toISOString() };

    // If breaking, push to ALL players
    if (isBreaking) {
        for (const [src] of Object.entries(playerCache)) {
            if (parseInt(src) !== source) {
                pushToPlayer(parseInt(src), 'WEAZEL_BREAKING', { article });
            }
        }
    }

    return { ok: true, article };
});

// ============================================
// YELLOW PAGES (PÁGINAS AMARELAS)
// ============================================

registerHandler('yp_list', async (source) => {
    const ads = await dbQuery('SELECT * FROM smartphone_yellowpages ORDER BY id DESC LIMIT 50');
    return { ok: true, ads };
});

registerHandler('yp_create', async (source, args) => {
    const userId = await getUserIdCached(source);
    const { name, description, category, phone } = args || {};
    if (!name?.trim() || !phone?.trim()) return { error: 'Preencha nome e telefone' };
    const id = await dbInsert(
        'INSERT INTO smartphone_yellowpages (user_id, name, description, category, phone) VALUES (?, ?, ?, ?, ?)',
        [userId, name.trim(), (description||'').trim(), category || 'outro', phone.trim()]
    );
    return { ok: true, ad: { id, user_id: userId, name: name.trim(), description: (description||'').trim(), category, phone: phone.trim(), created_at: new Date().toISOString() } };
});

// ============================================
// PAYPAL
// ============================================

registerHandler('paypal_init', async (source) => {
    const userId = await getUserIdCached(source);
    let balance = 0;
    try { if (exports.vrp && exports.vrp.getMoney) balance = exports.vrp.getMoney(parseInt(userId)) || 0; } catch(e) {}
    const transactions = await dbQuery(
        'SELECT * FROM smartphone_paypal_transactions WHERE sender_id = ? OR receiver_id = ? ORDER BY id DESC LIMIT 20',
        [userId, userId]
    ).then(rows => rows.map(t => ({
        ...t,
        type: String(t.sender_id) === String(userId) ? 'sent' : 'received',
        other_phone: String(t.sender_id) === String(userId) ? t.receiver_phone : t.sender_phone,
    })));
    return { ok: true, balance, transactions };
});

registerHandler('paypal_send', async (source, args) => {
    const userId = await getUserIdCached(source);
    const phone = await getPhoneFromSource(source);
    const { to, amount, note } = args || {};
    if (!to?.trim() || !amount || amount <= 0) return { error: 'Dados inválidos' };
    const intAmount = Math.round(Number(amount));

    // Check balance
    let balance = 0;
    try { if (exports.vrp && exports.vrp.getMoney) balance = exports.vrp.getMoney(parseInt(userId)) || 0; } catch(e) {}
    if (balance < intAmount) return { error: 'Saldo insuficiente' };

    // Find receiver
    const receiverUserId = phoneToUserId(to);
    if (!receiverUserId || receiverUserId === parseInt(userId)) return { error: 'Destinatário inválido' };

    // Transfer
    try {
        exports.vrp.removeMoney(parseInt(userId), intAmount);
        exports.vrp.addMoney(receiverUserId, intAmount);
    } catch(e) { return { error: 'Erro na transferência' }; }

    const newBalance = balance - intAmount;

    // Save transaction
    await dbInsert(
        'INSERT INTO smartphone_paypal_transactions (sender_id, sender_phone, receiver_id, receiver_phone, amount, note) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, phone, receiverUserId, to, intAmount, (note||'').trim()]
    );

    // Push notification to receiver
    const receiverSource = getSourceByPhone(to);
    if (receiverSource) {
        pushToPlayer(receiverSource, 'PAYPAL_RECEIVED', { from: phone, amount: intAmount, note });
        fetchClient('playSound', { sound: 'notification' });
    }

    return { ok: true, newBalance };
});

// ============================================
// BLAZE / CASINO
// ============================================

const minesGames = {}; // { gameId: { grid, mines, revealed, betAmount, userId } }

registerHandler('blaze_init', async (source) => {
    const userId = await getUserIdCached(source);
    let balance = 0;
    try { if (exports.vrp && exports.vrp.getMoney) balance = exports.vrp.getMoney(parseInt(userId)) || 0; } catch(e) {}
    return { ok: true, balance };
});

registerHandler('blaze_crash_bet', async (source, args) => {
    const userId = await getUserIdCached(source);
    const { amount } = args || {};
    if (!amount || amount <= 0) return { error: 'Aposta inválida' };
    let balance = 0;
    try { balance = exports.vrp.getMoney(parseInt(userId)) || 0; } catch(e) {}
    if (balance < amount) return { error: 'Saldo insuficiente' };
    try { exports.vrp.removeMoney(parseInt(userId), amount); } catch(e) {}
    // Generate crash point server-side (house edge ~4%)
    const crashAt = parseFloat((1 + Math.random() * Math.random() * 10).toFixed(2));
    const newBal = balance - amount;
    // Store for cashout
    const gameId = Date.now();
    minesGames['crash_' + source] = { crashAt, betAmount: amount, userId, gameId };
    return { ok: true, crashAt, balance: newBal, gameId };
});

registerHandler('blaze_crash_cashout', async (source, args) => {
    const game = minesGames['crash_' + source];
    if (!game) return { error: 'Jogo não encontrado' };
    const { multiplier } = args || {};
    const payout = Math.round(game.betAmount * (multiplier || 1));
    try { exports.vrp.addMoney(parseInt(game.userId), payout); } catch(e) {}
    delete minesGames['crash_' + source];
    let balance = 0;
    try { balance = exports.vrp.getMoney(parseInt(game.userId)) || 0; } catch(e) {}
    return { ok: true, payout, balance };
});

registerHandler('blaze_crash_history', async () => {
    const history = [];
    for (let i = 0; i < 15; i++) history.push(parseFloat((1 + Math.random() * Math.random() * 10).toFixed(2)));
    return { ok: true, history };
});

registerHandler('blaze_double_bet', async (source, args) => {
    const userId = await getUserIdCached(source);
    const { amount, choice } = args || {};
    if (!amount || amount <= 0 || !choice) return { error: 'Aposta inválida' };
    let balance = 0;
    try { balance = exports.vrp.getMoney(parseInt(userId)) || 0; } catch(e) {}
    if (balance < amount) return { error: 'Saldo insuficiente' };
    try { exports.vrp.removeMoney(parseInt(userId), amount); } catch(e) {}
    // Server-side result (house edge via white = ~7% chance, not 1/3)
    const roll = Math.random();
    const color = roll < 0.07 ? 'white' : roll < 0.535 ? 'red' : 'black';
    const won = color === choice;
    const payout = won ? (color === 'white' ? amount * 14 : amount * 2) : 0;
    if (payout > 0) try { exports.vrp.addMoney(parseInt(userId), payout); } catch(e) {}
    let newBal = 0;
    try { newBal = exports.vrp.getMoney(parseInt(userId)) || 0; } catch(e) {}
    return { ok: true, color, won, payout, balance: newBal };
});

registerHandler('blaze_double_history', async () => {
    const h = [];
    for (let i = 0; i < 20; i++) { const r = Math.random(); h.push(r < 0.07 ? 'white' : r < 0.535 ? 'red' : 'black'); }
    return { ok: true, history: h };
});

registerHandler('blaze_mines_start', async (source, args) => {
    const userId = await getUserIdCached(source);
    const { amount, mines } = args || {};
    if (!amount || amount <= 0) return { error: 'Aposta inválida' };
    const mineCount = Math.min(Math.max(parseInt(mines)||3, 1), 24);
    let balance = 0;
    try { balance = exports.vrp.getMoney(parseInt(userId)) || 0; } catch(e) {}
    if (balance < amount) return { error: 'Saldo insuficiente' };
    try { exports.vrp.removeMoney(parseInt(userId), amount); } catch(e) {}
    // Generate mine positions
    const positions = [];
    while (positions.length < mineCount) { const p = Math.floor(Math.random() * 25); if (!positions.includes(p)) positions.push(p); }
    const grid = Array(25).fill('gem');
    positions.forEach(p => grid[p] = 'mine');
    const gameId = 'mines_' + Date.now();
    minesGames[gameId] = { grid, mines: positions, revealed: [], betAmount: amount, userId, mineCount };
    let newBal = 0;
    try { newBal = exports.vrp.getMoney(parseInt(userId)) || 0; } catch(e) {}
    return { ok: true, gameId, grid: Array(25).fill('hidden'), balance: newBal };
});

registerHandler('blaze_mines_reveal', async (source, args) => {
    const { gameId, tile } = args || {};
    const game = minesGames[gameId];
    if (!game) return { error: 'Jogo não encontrado' };
    if (game.revealed.includes(tile)) return { error: 'Já revelado' };
    const isMine = game.grid[tile] === 'mine';
    game.revealed.push(tile);
    if (isMine) {
        delete minesGames[gameId];
        return { ok: true, mine: true, fullGrid: game.grid, allRevealed: Array.from({length:25},(_,i)=>i) };
    }
    const mult = 1 + game.revealed.length * (game.mineCount * 0.15);
    const currentPayout = Math.round(game.betAmount * mult);
    return { ok: true, mine: false, currentPayout, multiplier: mult };
});

registerHandler('blaze_mines_cashout', async (source, args) => {
    const { gameId } = args || {};
    const game = minesGames[gameId];
    if (!game) return { error: 'Jogo não encontrado' };
    const mult = 1 + game.revealed.length * (game.mineCount * 0.15);
    const payout = Math.round(game.betAmount * mult);
    try { exports.vrp.addMoney(parseInt(game.userId), payout); } catch(e) {}
    let balance = 0;
    try { balance = exports.vrp.getMoney(parseInt(game.userId)) || 0; } catch(e) {}
    const fullGrid = game.grid;
    delete minesGames[gameId];
    return { ok: true, payout, balance, fullGrid };
});

registerHandler('blaze_coinflip_bet', async (source, args) => {
    const userId = await getUserIdCached(source);
    const { amount, choice } = args || {};
    if (!amount || amount <= 0 || !choice) return { error: 'Aposta inválida' };
    let balance = 0;
    try { balance = exports.vrp.getMoney(parseInt(userId)) || 0; } catch(e) {}
    if (balance < amount) return { error: 'Saldo insuficiente' };
    try { exports.vrp.removeMoney(parseInt(userId), amount); } catch(e) {}
    const result = Math.random() < 0.48 ? choice : (choice === 'cara' ? 'coroa' : 'cara');
    const won = result === choice;
    const payout = won ? amount * 2 : 0;
    if (payout > 0) try { exports.vrp.addMoney(parseInt(userId), payout); } catch(e) {}
    let newBal = 0;
    try { newBal = exports.vrp.getMoney(parseInt(userId)) || 0; } catch(e) {}
    return { ok: true, result, won, payout, balance: newBal };
});

// ============================================
// IFOOD
// ============================================

registerHandler('ifood_init', async (source) => {
    const userId = await getUserIdCached(source);
    const orders = await dbQuery(
        'SELECT * FROM smartphone_ifood_orders WHERE user_id = ? ORDER BY id DESC LIMIT 10', [userId]
    );
    // Load restaurants and menus
    const restaurants = await dbQuery('SELECT * FROM smartphone_ifood_restaurants ORDER BY rating DESC');
    for (const r of (restaurants || [])) {
        const items = await dbQuery('SELECT * FROM smartphone_ifood_menu_items WHERE restaurant_id = ? ORDER BY id', [r.id]);
        r.menu = items || [];
    }
    return { ok: true, orders, restaurants: restaurants || [] };
});

registerHandler('ifood_order', async (source, args) => {
    const userId = await getUserIdCached(source);
    const { restaurant, items, total, fee } = args || {};
    if (!restaurant || !items?.length || !total) return { error: 'Pedido inválido' };
    // Check balance
    let balance = 0;
    try { balance = exports.vrp.getMoney(parseInt(userId)) || 0; } catch(e) {}
    if (balance < total) return { error: 'Saldo insuficiente' };
    try { exports.vrp.removeMoney(parseInt(userId), total); } catch(e) {}
    const orderId = await dbInsert(
        'INSERT INTO smartphone_ifood_orders (user_id, restaurant, items, total, fee, status) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, restaurant, JSON.stringify(items), total, fee || 0, 'confirmed']
    );
    // Auto-progress order status
    setTimeout(() => { dbUpdate('UPDATE smartphone_ifood_orders SET status = "preparing" WHERE id = ?', [orderId]); pushToPlayer(source, 'IFOOD_STATUS', { orderId, status: 'preparing' }); }, 5000);
    setTimeout(() => { dbUpdate('UPDATE smartphone_ifood_orders SET status = "delivering" WHERE id = ?', [orderId]); pushToPlayer(source, 'IFOOD_STATUS', { orderId, status: 'delivering' }); }, 15000);
    setTimeout(() => { dbUpdate('UPDATE smartphone_ifood_orders SET status = "delivered" WHERE id = ?', [orderId]); pushToPlayer(source, 'IFOOD_STATUS', { orderId, status: 'delivered' }); }, 30000);
    return { ok: true, orderId };
});

// ============================================
// TOR (DEEP WEB)
// ============================================

registerHandler('tor_messages', async (source, args) => {
    const { channel } = args || {};
    if (!channel) return { messages: [] };
    const messages = await dbQuery(
        'SELECT * FROM smartphone_tor_messages WHERE channel = ? ORDER BY id DESC LIMIT 30', [channel]
    ).then(r => r.reverse());
    return { ok: true, messages };
});

registerHandler('tor_send', async (source, args) => {
    const userId = await getUserIdCached(source);
    const { channel, message, alias } = args || {};
    if (!channel || !message?.trim()) return { error: 'Mensagem inválida' };
    const id = await dbInsert(
        'INSERT INTO smartphone_tor_messages (channel, user_id, alias, message) VALUES (?, ?, ?, ?)',
        [channel, userId, alias || 'Anon', message.trim()]
    );
    const msgData = { id, channel, alias: alias || 'Anon', message: message.trim(), created_at: new Date().toISOString() };
    // Push to all online players
    for (const [src] of Object.entries(playerCache)) {
        if (parseInt(src) !== source) {
            pushToPlayer(parseInt(src), 'TOR_MESSAGE', { channel, message: msgData });
        }
    }
    return { ok: true };
});

registerHandler('tor_store', async () => {
    const items = await dbQuery('SELECT * FROM smartphone_tor_store WHERE available = 1 ORDER BY id');
    if (items.length === 0) {
        // Seed default items
        const defaults = [
            { name: 'Lockpick Set', price: 500 },
            { name: 'Documento Falso', price: 2000 },
            { name: 'Escuta Telefônica', price: 1500 },
            { name: 'Placa Clonada', price: 3000 },
            { name: 'Radio Freq. Policial', price: 5000 },
        ];
        return { ok: true, items: defaults.map((d,i) => ({ id: i+1, ...d })) };
    }
    return { ok: true, items };
});

registerHandler('tor_buy', async (source, args) => {
    const userId = await getUserIdCached(source);
    const { itemId } = args || {};
    if (!itemId) return { error: 'Item inválido' };
    // Simple buy logic — deduct money, give item via vRP
    // In production, this would integrate with vRP inventory
    return { ok: true, message: 'Item disponível para coleta no ponto de drop' };
});

// ============================================
// WHATSAPP GROUPS
// ============================================

registerHandler('whatsapp_create_group', async (source, args) => {
    const userId = await getUserIdCached(source);
    const phone = await getPhoneFromSource(source);
    const { name, members } = args || {};
    if (!name?.trim() || !members?.length) return { error: 'Nome e membros obrigatórios' };
    const chatId = await dbInsert('INSERT INTO smartphone_whatsapp_chats (is_group, group_name, created_by) VALUES (1, ?, ?)', [name.trim(), userId]);
    await dbInsert('INSERT INTO smartphone_whatsapp_group_members (chat_id, user_phone) VALUES (?, ?)', [chatId, phone]);
    for (const mp of members) await dbInsert('INSERT INTO smartphone_whatsapp_group_members (chat_id, user_phone) VALUES (?, ?)', [chatId, mp]);
    await dbInsert('INSERT INTO smartphone_whatsapp_messages (chat_id, sender_phone, sender_name, message, type) VALUES (?, ?, ?, ?, ?)', [chatId, phone, 'Sistema', `Grupo "${name.trim()}" criado`, 'system']);
    const chat = { id: chatId, name: name.trim(), is_group: 1, memberCount: members.length + 1, lastMessage: `Grupo "${name.trim()}" criado`, lastMessageAt: new Date().toISOString() };
    for (const mp of members) { const ms = getSourceByPhone(mp); if (ms) pushToPlayer(ms, 'WHATSAPP_MESSAGE', { chatId, message: `Grupo "${name.trim()}" criado`, sender_phone: phone, created_at: new Date().toISOString() }); }
    return { ok: true, chat };
});

// ============================================
// GRINDR
// ============================================

registerHandler('grindr_init', async (source) => {
    const userId = await getUserIdCached(source);
    const myProfile = await dbQuery('SELECT * FROM smartphone_grindr_profiles WHERE user_id = ?', [userId]).then(r => r[0] || null);
    const profiles = await dbQuery('SELECT * FROM smartphone_grindr_profiles WHERE user_id != ? ORDER BY id DESC LIMIT 20', [userId]);
    const taps = await dbQuery('SELECT * FROM smartphone_grindr_taps WHERE target_id = ? ORDER BY id DESC LIMIT 10', [userId]);
    const chats = await dbQuery(
        `SELECT c.*, CASE WHEN c.user1_id = ? THEN c.user2_name ELSE c.user1_name END as other_name,
         CASE WHEN c.user1_id = ? THEN c.user2_avatar ELSE c.user1_avatar END as other_avatar,
         CASE WHEN c.user1_id = ? THEN c.user2_id ELSE c.user1_id END as other_id
         FROM smartphone_grindr_chats c WHERE c.user1_id = ? OR c.user2_id = ? ORDER BY c.updated_at DESC`,
        [userId, userId, userId, userId, userId]
    );
    return { ok: true, myProfile, profiles, taps, chats };
});

registerHandler('grindr_save_profile', async (source, args) => {
    const userId = await getUserIdCached(source);
    const { name, bio, avatar } = args || {};
    if (!name?.trim()) return { error: 'Nome obrigatório' };
    const existing = await dbQuery('SELECT id FROM smartphone_grindr_profiles WHERE user_id = ?', [userId]).then(r => r[0]);
    if (existing) await dbUpdate('UPDATE smartphone_grindr_profiles SET name = ?, bio = ?, avatar = ? WHERE user_id = ?', [name.trim(), (bio||'').trim(), avatar||'😎', userId]);
    else await dbInsert('INSERT INTO smartphone_grindr_profiles (user_id, name, bio, avatar) VALUES (?, ?, ?, ?)', [userId, name.trim(), (bio||'').trim(), avatar||'😎']);
    const profile = await dbQuery('SELECT * FROM smartphone_grindr_profiles WHERE user_id = ?', [userId]).then(r => r[0]);
    return { ok: true, profile };
});

registerHandler('grindr_tap', async (source, args) => {
    const userId = await getUserIdCached(source);
    const { targetId } = args || {};
    if (!targetId) return { error: 'Perfil inválido' };
    await dbInsert('INSERT INTO smartphone_grindr_taps (sender_id, target_id) VALUES (?, ?)', [userId, targetId]);
    const targetSource = findPlayerSource(targetId);
    if (targetSource) { const p = await dbQuery('SELECT * FROM smartphone_grindr_profiles WHERE user_id = ?', [userId]).then(r => r[0]); pushToPlayer(targetSource, 'GRINDR_TAP', { from: p?.name || 'Alguém', avatar: p?.avatar || '😎' }); }
    return { ok: true };
});

registerHandler('grindr_open_chat', async (source, args) => {
    const userId = await getUserIdCached(source);
    const { targetId } = args || {};
    if (!targetId) return { error: 'Perfil inválido' };
    let chat = await dbQuery('SELECT * FROM smartphone_grindr_chats WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)', [userId, targetId, targetId, userId]).then(r => r[0]);
    if (!chat) {
        const my = await dbQuery('SELECT * FROM smartphone_grindr_profiles WHERE user_id = ?', [userId]).then(r => r[0]);
        const other = await dbQuery('SELECT * FROM smartphone_grindr_profiles WHERE user_id = ?', [targetId]).then(r => r[0]);
        const chatId = await dbInsert('INSERT INTO smartphone_grindr_chats (user1_id, user1_name, user1_avatar, user2_id, user2_name, user2_avatar) VALUES (?, ?, ?, ?, ?, ?)', [userId, my?.name||'Anon', my?.avatar||'😎', targetId, other?.name||'Anon', other?.avatar||'😎']);
        chat = { id: chatId };
    }
    const messages = await dbQuery('SELECT * FROM smartphone_grindr_messages WHERE chat_id = ? ORDER BY id', [chat.id]);
    return { ok: true, chatId: chat.id, messages };
});

registerHandler('grindr_send', async (source, args) => {
    const userId = await getUserIdCached(source);
    const { chatId, message } = args || {};
    if (!chatId || !message?.trim()) return { error: 'Mensagem inválida' };
    const id = await dbInsert('INSERT INTO smartphone_grindr_messages (chat_id, sender_id, message) VALUES (?, ?, ?)', [chatId, userId, message.trim()]);
    await dbUpdate('UPDATE smartphone_grindr_chats SET last_message = ?, updated_at = NOW() WHERE id = ?', [message.trim(), chatId]);
    const chat = await dbQuery('SELECT * FROM smartphone_grindr_chats WHERE id = ?', [chatId]).then(r => r[0]);
    if (chat) { const otherId = chat.user1_id === userId ? chat.user2_id : chat.user1_id; const os = findPlayerSource(otherId); if(os) pushToPlayer(os, 'GRINDR_MESSAGE', { chatId, message: { id, sender_id: userId, message: message.trim(), created_at: new Date().toISOString() } }); }
    return { ok: true };
});

// ============================================
// GALLERY / PHOTOS
// ============================================

// ============================================
// HANDLERS: Discord
// ============================================

// Load all servers the user is a member of
registerHandler('discord_init', async (source) => {
    const userId = await getUserIdCached(source);
    const myPhone = await getPhoneFromSource(source);
    const profile = await dbSingle('SELECT username FROM smartphone_profiles WHERE phone_number = ?', [myPhone]);
    const servers = await dbQuery(`
        SELECT s.*, m.role, m.role_color,
            (SELECT COUNT(*) FROM smartphone_discord_members WHERE server_id = s.id) AS member_count
        FROM smartphone_discord_servers s
        JOIN smartphone_discord_members m ON m.server_id = s.id AND m.user_id = ?
        ORDER BY s.name
    `, [userId]);
    return { ok: true, servers: servers || [], username: profile?.username || myPhone, userId: parseInt(userId) };
});

// Load a single server: channels + members
registerHandler('discord_server', async (source, args) => {
    const userId = await getUserIdCached(source);
    const { serverId } = args || {};
    if (!serverId) return { error: 'Server inválido' };
    const member = await dbSingle('SELECT * FROM smartphone_discord_members WHERE server_id = ? AND user_id = ?', [serverId, userId]);
    if (!member) return { error: 'Você não é membro deste servidor' };
    const channels = await dbQuery('SELECT * FROM smartphone_discord_channels WHERE server_id = ? ORDER BY position, id', [serverId]);
    const members = await dbQuery(`
        SELECT m.*, p.username, p.phone_number
        FROM smartphone_discord_members m
        LEFT JOIN smartphone_profiles p ON p.user_id = m.user_id
        WHERE m.server_id = ?
        ORDER BY FIELD(m.role, 'owner', 'admin', 'mod', 'membro'), p.username
    `, [serverId]);
    const server = await dbSingle('SELECT * FROM smartphone_discord_servers WHERE id = ?', [serverId]);
    return { ok: true, server, channels: channels || [], members: members || [], myRole: member.role };
});

// Load messages for a channel
registerHandler('discord_messages', async (source, args) => {
    const userId = await getUserIdCached(source);
    const { channelId, limit } = args || {};
    if (!channelId) return { error: 'Channel inválido' };
    const messages = await dbQuery(`
        SELECT * FROM smartphone_discord_messages
        WHERE channel_id = ? ORDER BY created_at DESC LIMIT ?
    `, [channelId, limit || 50]);
    return { ok: true, messages: (messages || []).reverse() };
});

// Send a message in a channel
registerHandler('discord_send', async (source, args) => {
    const userId = await getUserIdCached(source);
    const myPhone = await getPhoneFromSource(source);
    const { channelId, message } = args || {};
    if (!channelId || !message?.trim()) return { error: 'Mensagem vazia' };
    // Get channel's server and check membership
    const channel = await dbSingle('SELECT * FROM smartphone_discord_channels WHERE id = ?', [channelId]);
    if (!channel) return { error: 'Canal não encontrado' };
    const member = await dbSingle('SELECT * FROM smartphone_discord_members WHERE server_id = ? AND user_id = ?', [channel.server_id, userId]);
    if (!member) return { error: 'Não é membro' };
    const profile = await dbSingle('SELECT username FROM smartphone_profiles WHERE phone_number = ?', [myPhone]);
    const username = profile?.username || myPhone;
    const msgId = await dbInsert(
        'INSERT INTO smartphone_discord_messages (channel_id, user_id, username, role_color, message) VALUES (?, ?, ?, ?, ?)',
        [channelId, userId, username, member.role_color, message.trim()]
    );
    const msgData = { id: msgId, channel_id: channelId, user_id: parseInt(userId), username, role_color: member.role_color, message: message.trim(), created_at: new Date().toISOString() };
    // Push to all online members of this server
    const serverMembers = await dbQuery('SELECT user_id FROM smartphone_discord_members WHERE server_id = ?', [channel.server_id]);
    for (const sm of (serverMembers || [])) {
        if (sm.user_id != userId) {
            const memberSource = findPlayerSource(sm.user_id);
            if (memberSource) pushToPlayer(memberSource, 'DISCORD_MESSAGE', { ...msgData, serverId: channel.server_id });
        }
    }
    return { ok: true, message: msgData };
});

// Create a new server
registerHandler('discord_create_server', async (source, args) => {
    const userId = await getUserIdCached(source);
    const { name, icon } = args || {};
    if (!name?.trim()) return { error: 'Nome obrigatório' };
    const serverId = await dbInsert(
        'INSERT INTO smartphone_discord_servers (name, icon, owner_id) VALUES (?, ?, ?)',
        [name.trim(), icon || '🎮', userId]
    );
    // Add owner as member
    await dbInsert(
        'INSERT INTO smartphone_discord_members (server_id, user_id, role, role_color) VALUES (?, ?, ?, ?)',
        [serverId, userId, 'owner', '#F1C40F']
    );
    // Create default channels
    await dbInsert('INSERT INTO smartphone_discord_channels (server_id, name, type, position) VALUES (?, ?, ?, ?)', [serverId, 'geral', 'text', 0]);
    await dbInsert('INSERT INTO smartphone_discord_channels (server_id, name, type, position) VALUES (?, ?, ?, ?)', [serverId, 'avisos', 'announcements', 1]);
    return { ok: true, serverId };
});

// Join a server by invite
registerHandler('discord_join', async (source, args) => {
    const userId = await getUserIdCached(source);
    const { serverId } = args || {};
    if (!serverId) return { error: 'Server inválido' };
    const server = await dbSingle('SELECT * FROM smartphone_discord_servers WHERE id = ?', [serverId]);
    if (!server) return { error: 'Servidor não encontrado' };
    const existing = await dbSingle('SELECT id FROM smartphone_discord_members WHERE server_id = ? AND user_id = ?', [serverId, userId]);
    if (existing) return { error: 'Já é membro' };
    await dbInsert('INSERT INTO smartphone_discord_members (server_id, user_id, role, role_color) VALUES (?, ?, ?, ?)', [serverId, userId, 'membro', '#99AAB5']);
    return { ok: true, server };
});

// Leave a server
registerHandler('discord_leave', async (source, args) => {
    const userId = await getUserIdCached(source);
    const { serverId } = args || {};
    if (!serverId) return { error: 'Server inválido' };
    const server = await dbSingle('SELECT * FROM smartphone_discord_servers WHERE id = ?', [serverId]);
    if (server && server.owner_id == userId) return { error: 'Owner não pode sair. Delete o servidor.' };
    await dbUpdate('DELETE FROM smartphone_discord_members WHERE server_id = ? AND user_id = ?', [serverId, userId]);
    return { ok: true };
});

// Invite a player to a server (by phone number)
registerHandler('discord_invite', async (source, args) => {
    const userId = await getUserIdCached(source);
    const { serverId, phone } = args || {};
    if (!serverId || !phone) return { error: 'Dados inválidos' };
    const member = await dbSingle('SELECT * FROM smartphone_discord_members WHERE server_id = ? AND user_id = ?', [serverId, userId]);
    if (!member) return { error: 'Você não é membro deste servidor' };
    // Find target user
    const targetProfile = await dbSingle('SELECT user_id FROM smartphone_profiles WHERE phone_number = ?', [phone]);
    if (!targetProfile) return { error: 'Jogador não encontrado' };
    const existing = await dbSingle('SELECT id FROM smartphone_discord_members WHERE server_id = ? AND user_id = ?', [serverId, targetProfile.user_id]);
    if (existing) return { error: 'Já é membro' };
    await dbInsert('INSERT INTO smartphone_discord_members (server_id, user_id, role, role_color) VALUES (?, ?, ?, ?)', [serverId, targetProfile.user_id, 'membro', '#99AAB5']);
    // Push notification
    const targetSource = findPlayerSource(targetProfile.user_id);
    if (targetSource) {
        const server = await dbSingle('SELECT name, icon FROM smartphone_discord_servers WHERE id = ?', [serverId]);
        pushToPlayer(targetSource, 'DISCORD_INVITE', { serverId, serverName: server?.name, serverIcon: server?.icon });
    }
    return { ok: true };
});

// Set role for a member (admin+ only)
registerHandler('discord_set_role', async (source, args) => {
    const userId = await getUserIdCached(source);
    const { serverId, targetUserId, role, roleColor } = args || {};
    if (!serverId || !targetUserId || !role) return { error: 'Dados inválidos' };
    const myMember = await dbSingle('SELECT role FROM smartphone_discord_members WHERE server_id = ? AND user_id = ?', [serverId, userId]);
    if (!myMember || (myMember.role !== 'owner' && myMember.role !== 'admin')) return { error: 'Sem permissão' };
    if (role === 'owner') return { error: 'Não pode promover a owner' };
    await dbUpdate('UPDATE smartphone_discord_members SET role = ?, role_color = ? WHERE server_id = ? AND user_id = ?', [role, roleColor || '#99AAB5', serverId, targetUserId]);
    return { ok: true };
});

// ============================================
// HANDLERS: Discord
// ============================================

registerHandler('discord_init', async (source) => {
    const userId = await getUserIdCached(source);
    const servers = await dbQuery(`
        SELECT s.* FROM smartphone_discord_servers s
        INNER JOIN smartphone_discord_members m ON m.server_id = s.id
        WHERE m.user_id = ? ORDER BY s.id
    `, [userId]);
    const profile = await dbSingle('SELECT phone_number FROM smartphone_profiles WHERE user_id = ?', [userId]);
    return { ok: true, servers: servers || [], profile: { username: profile?.phone_number || userId, role_color: '#fff', id: userId } };
});

registerHandler('discord_server', async (source, args) => {
    const userId = await getUserIdCached(source);
    const { serverId } = args || {};
    if (!serverId) return { error: 'Server ID obrigatório' };
    const channels = await dbQuery('SELECT * FROM smartphone_discord_channels WHERE server_id = ? ORDER BY position, id', [serverId]);
    const members = await dbQuery(`
        SELECT m.*, p.phone_number as username FROM smartphone_discord_members m
        LEFT JOIN smartphone_profiles p ON p.user_id = m.user_id
        WHERE m.server_id = ? ORDER BY FIELD(m.role, 'dono','admin','moderador','membro'), m.id
    `, [serverId]);
    return { ok: true, channels: channels || [], members: (members || []).map(m => ({...m, username: m.username || m.user_id, online: !!findPlayerSource(m.user_id)})) };
});

registerHandler('discord_messages', async (source, args) => {
    const { channelId } = args || {};
    if (!channelId) return { error: 'Channel ID obrigatório' };
    const messages = await dbQuery('SELECT * FROM smartphone_discord_messages WHERE channel_id = ? ORDER BY id DESC LIMIT 50', [channelId]);
    return { ok: true, messages: (messages || []).reverse() };
});

registerHandler('discord_send', async (source, args) => {
    const userId = await getUserIdCached(source);
    const { channelId, message } = args || {};
    if (!channelId || !message?.trim()) return { error: 'Mensagem inválida' };

    // Get channel's server to check membership
    const channel = await dbSingle('SELECT * FROM smartphone_discord_channels WHERE id = ?', [channelId]);
    if (!channel) return { error: 'Canal não encontrado' };
    const member = await dbSingle('SELECT * FROM smartphone_discord_members WHERE server_id = ? AND user_id = ?', [channel.server_id, userId]);
    if (!member) return { error: 'Você não é membro deste servidor' };

    const profile = await dbSingle('SELECT phone_number FROM smartphone_profiles WHERE user_id = ?', [userId]);
    const username = profile?.phone_number || userId;

    const id = await dbInsert(
        'INSERT INTO smartphone_discord_messages (channel_id, user_id, username, role_color, message) VALUES (?, ?, ?, ?, ?)',
        [channelId, userId, username, member.role_color || '#99AAB5', message.trim()]
    );

    const msg = { id, channel_id: channelId, user_id: userId, username, role_color: member.role_color || '#99AAB5', message: message.trim(), created_at: new Date().toISOString() };

    // Push to all online members of this server
    const members = await dbQuery('SELECT user_id FROM smartphone_discord_members WHERE server_id = ?', [channel.server_id]);
    for (const m of (members || [])) {
        if (m.user_id !== userId) {
            const memberSource = findPlayerSource(m.user_id);
            if (memberSource) pushToPlayer(memberSource, 'DISCORD_MESSAGE', { ...msg, channelId });
        }
    }

    return { ok: true, message: msg };
});

registerHandler('discord_create_server', async (source, args) => {
    const userId = await getUserIdCached(source);
    const { name, icon } = args || {};
    if (!name?.trim()) return { error: 'Nome obrigatório' };

    const serverId = await dbInsert('INSERT INTO smartphone_discord_servers (name, icon, owner_id) VALUES (?, ?, ?)', [name.trim(), icon || '🎮', userId]);
    // Add owner as member
    await dbInsert('INSERT INTO smartphone_discord_members (server_id, user_id, role, role_color) VALUES (?, ?, ?, ?)', [serverId, userId, 'dono', '#F0B232']);
    // Create default channels
    await dbInsert('INSERT INTO smartphone_discord_channels (server_id, name, type, position) VALUES (?, ?, ?, ?)', [serverId, 'geral', 'text', 0]);
    await dbInsert('INSERT INTO smartphone_discord_channels (server_id, name, type, position) VALUES (?, ?, ?, ?)', [serverId, 'avisos', 'announcements', 1]);

    return { ok: true, server: { id: serverId, name: name.trim(), icon: icon || '🎮', owner_id: userId } };
});

registerHandler('discord_join', async (source, args) => {
    const userId = await getUserIdCached(source);
    const { invite, serverId } = args || {};
    let targetId = serverId;

    // invite can be server ID or name
    if (invite && !targetId) {
        const server = await dbSingle('SELECT id FROM smartphone_discord_servers WHERE id = ? OR name LIKE ?', [invite, `%${invite}%`]);
        if (!server) return { error: 'Servidor não encontrado' };
        targetId = server.id;
    }
    if (!targetId) return { error: 'Convite inválido' };

    // Check if already member
    const existing = await dbSingle('SELECT id FROM smartphone_discord_members WHERE server_id = ? AND user_id = ?', [targetId, userId]);
    if (existing) return { error: 'Você já é membro deste servidor' };

    await dbInsert('INSERT INTO smartphone_discord_members (server_id, user_id, role, role_color) VALUES (?, ?, ?, ?)', [targetId, userId, 'membro', '#99AAB5']);
    const server = await dbSingle('SELECT * FROM smartphone_discord_servers WHERE id = ?', [targetId]);
    return { ok: true, server };
});

registerHandler('discord_leave', async (source, args) => {
    const userId = await getUserIdCached(source);
    const { serverId } = args || {};
    if (!serverId) return { error: 'Server ID obrigatório' };

    // Can't leave if owner
    const server = await dbSingle('SELECT owner_id FROM smartphone_discord_servers WHERE id = ?', [serverId]);
    if (server?.owner_id === userId) return { error: 'O dono não pode sair. Delete o servidor.' };

    await dbUpdate('DELETE FROM smartphone_discord_members WHERE server_id = ? AND user_id = ?', [serverId, userId]);
    return { ok: true };
});

registerHandler('discord_invite', async (source, args) => {
    const { serverId } = args || {};
    if (!serverId) return { error: 'Server ID obrigatório' };
    // Return the server ID as invite code (simple)
    return { ok: true, invite: String(serverId) };
});

registerHandler('discord_set_role', async (source, args) => {
    const userId = await getUserIdCached(source);
    const { serverId, targetUserId, role, roleColor } = args || {};
    if (!serverId || !targetUserId) return { error: 'Dados inválidos' };

    // Check if caller is owner or admin
    const callerMember = await dbSingle('SELECT role FROM smartphone_discord_members WHERE server_id = ? AND user_id = ?', [serverId, userId]);
    if (!callerMember || (callerMember.role !== 'dono' && callerMember.role !== 'admin')) return { error: 'Sem permissão' };

    await dbUpdate('UPDATE smartphone_discord_members SET role = ?, role_color = ? WHERE server_id = ? AND user_id = ?',
        [role || 'membro', roleColor || '#99AAB5', serverId, targetUserId]);
    return { ok: true };
});


// ============================================
// HANDLERS: Spotify (Fase 3B — áudio real + xSound 3D)
// ADICIONAR ANTES da seção "// STARTUP" no main.js
// ============================================

registerHandler('spotify_playlists', async (source) => {
    let playlists = await dbQuery('SELECT id, name, cover, description, gradient FROM smartphone_spotify_playlists ORDER BY id');
    if (!playlists || playlists.length === 0) return { playlists: [] };
    return { playlists: playlists.map(p => ({
        id: p.id,
        name: p.name,
        cover: p.cover || '🎵',
        desc: p.description || '',
        gradient: p.gradient || 'linear-gradient(135deg, #1DB954, #1ed760)',
    }))};
});

registerHandler('spotify_quick_access', async (source) => {
    // Retorna as primeiras 6 playlists como "acesso rápido"
    let playlists = await dbQuery('SELECT id, name, gradient FROM smartphone_spotify_playlists ORDER BY id LIMIT 6');
    if (!playlists || playlists.length === 0) return { items: [] };
    return { items: playlists.map(p => ({
        id: p.id,
        name: p.name,
        color: p.gradient || 'linear-gradient(135deg, #1DB954, #1ed760)',
    }))};
});

registerHandler('spotify_library', async (source) => {
    const userId = await getUserIdCached(source);
    let playlists = await dbQuery('SELECT p.id, p.name, p.gradient, COUNT(s.id) as count FROM smartphone_spotify_playlists p LEFT JOIN smartphone_spotify_songs s ON s.playlist_id = p.id GROUP BY p.id ORDER BY p.id');
    if (!playlists || playlists.length === 0) return { items: [] };
    // Adicionar "Curtidas" como primeira entry
    const likeCount = await dbQuery('SELECT COUNT(*) as cnt FROM smartphone_spotify_likes WHERE user_id = ?', [userId]);
    const items = [
        { id: 0, name: 'Curtidas', type: 'Playlist', count: likeCount?.[0]?.cnt || 0, gradient: 'linear-gradient(135deg, #4527A0, #7C4DFF)' },
        ...playlists.map(p => ({
            id: p.id,
            name: p.name,
            type: 'Playlist',
            count: p.count || 0,
            gradient: p.gradient || 'linear-gradient(135deg, #1DB954, #1ed760)',
        }))
    ];
    return { items };
});

registerHandler('spotify_playlist_tracks', async (source, args) => {
    const userId = await getUserIdCached(source);
    const playlistId = args?.playlist_id;
    if (!playlistId && playlistId !== 0) return { tracks: [] };

    let tracks;
    if (playlistId === 0) {
        // "Curtidas" playlist — tracks liked pelo jogador
        tracks = await dbQuery(
            'SELECT s.*, 1 as liked FROM smartphone_spotify_songs s INNER JOIN smartphone_spotify_likes l ON l.track_id = s.id WHERE l.user_id = ? ORDER BY l.created_at DESC',
            [userId]
        );
    } else {
        tracks = await dbQuery(
            'SELECT s.*, IF(l.id IS NOT NULL, 1, 0) as liked FROM smartphone_spotify_songs s LEFT JOIN smartphone_spotify_likes l ON l.track_id = s.id AND l.user_id = ? WHERE s.playlist_id = ? ORDER BY s.track_order',
            [userId, playlistId]
        );
    }
    if (!tracks) return { tracks: [] };
    return { tracks: tracks.map(t => ({
        id: t.id,
        name: t.name,
        artist: t.artist,
        youtube_id: t.youtube_id || '',
        duration: t.duration || 240,
        liked: !!t.liked,
    }))};
});

registerHandler('spotify_search', async (source, args) => {
    const userId = await getUserIdCached(source);
    const query = args?.query || '';
    if (query.length < 2) return { tracks: [] };
    const tracks = await dbQuery(
        'SELECT s.*, IF(l.id IS NOT NULL, 1, 0) as liked FROM smartphone_spotify_songs s LEFT JOIN smartphone_spotify_likes l ON l.track_id = s.id AND l.user_id = ? WHERE s.name LIKE ? OR s.artist LIKE ? LIMIT 20',
        [userId, `%${query}%`, `%${query}%`]
    );
    if (!tracks) return { tracks: [] };
    return { tracks: tracks.map(t => ({
        id: t.id,
        name: t.name,
        artist: t.artist,
        youtube_id: t.youtube_id || '',
        duration: t.duration || 240,
        liked: !!t.liked,
    }))};
});

registerHandler('spotify_like', async (source, args) => {
    const userId = await getUserIdCached(source);
    const trackId = args?.track_id;
    if (!trackId) return { ok: false };
    // Toggle like
    const exists = await dbQuery('SELECT id FROM smartphone_spotify_likes WHERE user_id = ? AND track_id = ?', [userId, trackId]);
    if (exists && exists.length > 0) {
        await dbUpdate('DELETE FROM smartphone_spotify_likes WHERE user_id = ? AND track_id = ?', [userId, trackId]);
    } else {
        await dbInsert('INSERT IGNORE INTO smartphone_spotify_likes (user_id, track_id) VALUES (?, ?)', [userId, trackId]);
    }
    return { ok: true };
});

registerHandler('spotify_play', async (source, args) => {
    // Notifica client.lua pra tocar via xSound 3D
    const youtubeId = args?.youtube_id || '';
    if (youtubeId) {
        emitNet('smartphone:spotify:play', source, youtubeId);
    }
    return { ok: true };
});

registerHandler('spotify_toggle', async (source, args) => {
    const playing = args?.playing;
    emitNet('smartphone:spotify:toggle', source, !!playing);
    return { ok: true };
});

registerHandler('spotify_stop', async (source) => {
    emitNet('smartphone:spotify:stop', source);
    return { ok: true };
});

// ============================================
// SPOTIFY 3D: Server-side sync para jogadores próximos
// ============================================

// Armazena quem está tocando música { playerId: { youtubeId, volume } }
const spotifyPlayers = {};

onNet('smartphone:spotify:sync', (youtubeId, volume) => {
    const src = source;
    if (youtubeId) {
        spotifyPlayers[src] = { youtubeId, volume: volume || 0.3 };
    } else {
        delete spotifyPlayers[src];
    }
    // Broadcast pra todos os jogadores (client.lua filtra por distância)
    emitNet('smartphone:spotify:nearby', -1, src, youtubeId || null, volume || 0);
});

on('playerDropped', () => {
    const src = source;
    if (spotifyPlayers[src]) {
        delete spotifyPlayers[src];
        emitNet('smartphone:spotify:nearby', -1, src, null, 0);
    }
});
// ============================================
// HANDLERS: Gallery
// ============================================

registerHandler('gallery_init', async (source) => {
    const userId = await getUserIdCached(source);
    const photos = await dbQuery('SELECT * FROM smartphone_gallery WHERE user_id = ? ORDER BY id DESC LIMIT 50', [userId]);
    return { ok: true, photos };
});

registerHandler('gallery_capture', async (source, args) => {
    const userId = await getUserIdCached(source);
    const { url, caption } = args || {};
    const photoUrl = url || '';
    const photoCaption = caption || 'Screenshot';
    const id = await dbInsert('INSERT INTO smartphone_gallery (user_id, url, caption) VALUES (?, ?, ?)', [userId, photoUrl, photoCaption]);
    return { ok: true, photo: { id, url: photoUrl, caption: photoCaption } };
});

registerHandler('gallery_delete', async (source, args) => {
    const userId = await getUserIdCached(source);
    const id = args?.id || args?.photoId;
    if (id) await dbUpdate('DELETE FROM smartphone_gallery WHERE id = ? AND user_id = ?', [id, userId]);
    return { ok: true };
});

// ============================================
// APP STORE
// ============================================

registerHandler('appstore_init', async (source) => {
    const userId = await getUserIdCached(source);
    const row = await dbQuery('SELECT installed_apps FROM smartphone_appstore WHERE user_id = ?', [userId]).then(r => r[0]);
    if (row?.installed_apps) return { ok: true, installed: JSON.parse(row.installed_apps) };
    return { ok: true, installed: null };
});

const appstoreToggle = async (source, appId, action) => {
    const userId = await getUserIdCached(source);
    if (!appId) return { error: 'App inválido' };
    let row = await dbQuery('SELECT installed_apps FROM smartphone_appstore WHERE user_id = ?', [userId]).then(r => r[0]);
    let installed = row?.installed_apps ? JSON.parse(row.installed_apps) : [];
    if (action === 'install' && !installed.includes(appId)) installed.push(appId);
    if (action === 'uninstall') installed = installed.filter(id => id !== appId);
    if (row) await dbUpdate('UPDATE smartphone_appstore SET installed_apps = ? WHERE user_id = ?', [JSON.stringify(installed), userId]);
    else await dbInsert('INSERT INTO smartphone_appstore (user_id, installed_apps) VALUES (?, ?)', [userId, JSON.stringify(installed)]);
    return { ok: true };
};

registerHandler('appstore_install', async (source, args) => appstoreToggle(source, args?.appId, 'install'));
registerHandler('appstore_uninstall', async (source, args) => appstoreToggle(source, args?.appId, 'uninstall'));
registerHandler('appstore_toggle', async (source, args) => appstoreToggle(source, args?.appId, args?.action));

// ============================================
// FASE 4: Screenshot Upload (FiveManage / Fivemerr)
// ============================================

const https = require('https');

function uploadImage(dataUri) {
    return new Promise((resolve, reject) => {
        const fivemanageKey = GetConvar('smartphone_fivemanage_key', '');
        const fivemerrKey = GetConvar('smartphone_fivemerr_key', '');

        let hostname, path, apiKey;

        if (fivemanageKey) {
            hostname = 'api.fivemanage.com';
            path = '/api/image';
            apiKey = fivemanageKey;
        } else if (fivemerrKey) {
            hostname = 'api.fivemerr.com';
            path = '/v1/media/images';
            apiKey = fivemerrKey;
        } else {
            console.error('[SMARTPHONE] ⚠️  Nenhuma API key configurada!');
            console.error('[SMARTPHONE]    Adicione no server.cfg:');
            console.error('[SMARTPHONE]    set smartphone_fivemanage_key "SUA_KEY"');
            console.error('[SMARTPHONE]    Crie grátis em https://fivemanage.com');
            return reject(new Error('No image API key'));
        }

        const postData = JSON.stringify({ file: dataUri });
        const options = {
            hostname,
            port: 443,
            path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': apiKey,
                'Content-Length': Buffer.byteLength(postData),
            },
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(body);
                    const url = json.url || json.image_url || '';
                    if (url) {
                        resolve(url);
                    } else {
                        console.error('[SMARTPHONE] CDN response sem URL:', body.substring(0, 200));
                        reject(new Error('No URL in response'));
                    }
                } catch (e) {
                    console.error('[SMARTPHONE] CDN parse error:', body.substring(0, 200));
                    reject(e);
                }
            });
        });

        req.on('error', (e) => {
            console.error('[SMARTPHONE] Upload error:', e.message);
            reject(e);
        });

        req.setTimeout(15000, () => {
            req.destroy();
            reject(new Error('Upload timeout'));
        });

        req.write(postData);
        req.end();
    });
}

// Client envia screenshot base64 → server faz upload → retorna URL
onNet('smartphone:screenshot:upload', async (dataUri) => {
    const src = source;
    if (!dataUri || typeof dataUri !== 'string' || dataUri.length > 10 * 1024 * 1024) {
        emitNet('smartphone:screenshot:result', src, '');
        return;
    }

    try {
        const url = await uploadImage(dataUri);
        console.log('[SMARTPHONE] 📸 Foto uploaded:', url.substring(0, 80));
        emitNet('smartphone:screenshot:result', src, url);
    } catch (error) {
        console.error('[SMARTPHONE] Upload falhou:', error.message);
        emitNet('smartphone:screenshot:result', src, '');
    }
});

// ============================================
// STARTUP
// ============================================

setImmediate(async () => {
    try {
        await initDatabase();
        console.log('[SMARTPHONE] ================================');
        console.log('[SMARTPHONE] Server v2.0 iniciado!');
        console.log(`[SMARTPHONE] Handlers: ${Object.keys(handlers).length}`);
        console.log('[SMARTPHONE] Rate limit: 250ms | Cache: ativo');
        console.log('[SMARTPHONE] ================================');
    } catch (error) {
        console.error('[SMARTPHONE] ERRO:', error.message);
    }
});
