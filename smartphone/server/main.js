/**
 * Smartphone - Server Main
 * Agência Soluções Digitais
 * 
 * Responsabilidades:
 * 1. Router de backend:req (recebe chamadas do client.lua)
 * 2. Carrega módulos de cada app
 * 3. Inicializa banco de dados (cria tabelas)
 * 4. Envia pusher events (server → client → NUI)
 */

const config = JSON.parse(LoadResourceFile(GetCurrentResourceName(), 'config.json'));

// ============================================
// REGISTRO DE HANDLERS (módulos registram aqui)
// ============================================

const handlers = {};

/**
 * Registra um handler de backend
 * @param {string} name - Nome da função (ex: 'sms_send')
 * @param {function} fn - async (source, args) => result
 */
function registerHandler(name, fn) {
    handlers[name] = fn;
    // console.log(`[SMARTPHONE] Handler registrado: ${name}`);
}

// ============================================
// ROUTER: backend:req → handler → backend:res
// ============================================

onNet('smartphone:backend:req', async (id, member, args) => {
    const source = global.source;

    try {
        const handler = handlers[member];

        if (!handler) {
            console.error(`[SMARTPHONE] Handler não encontrado: ${member}`);
            emitNet('smartphone:backend:res', source, id, { error: 'handler_not_found', member });
            return;
        }

        const result = await handler(source, args);
        emitNet('smartphone:backend:res', source, id, result);

    } catch (error) {
        console.error(`[SMARTPHONE] Erro no handler '${member}':`, error.message);
        emitNet('smartphone:backend:res', source, id, { error: error.message });
    }
});

// ============================================
// PUSHER: Envia eventos tempo real pro client
// ============================================

/**
 * Envia evento pusher para um jogador específico
 * @param {number} target - source do jogador
 * @param {string} event - nome do evento (ex: 'WHATSAPP_MESSAGE')
 * @param {object} payload - dados do evento
 */
function pushToPlayer(target, event, payload) {
    emitNet('smartphone:pusher', target, event, payload);
}

/**
 * Envia evento pusher para todos os jogadores online
 * @param {string} event - nome do evento
 * @param {object} payload - dados do evento
 */
function pushToAll(event, payload) {
    emitNet('smartphone:pusher', -1, event, payload);
}

// ============================================
// DATABASE: Helper para queries oxmysql
// ============================================

async function dbQuery(query, params = []) {
    return exports.oxmysql.query_async(query, params);
}

async function dbScalar(query, params = []) {
    return exports.oxmysql.scalar_async(query, params);
}

async function dbInsert(query, params = []) {
    return exports.oxmysql.insert_async(query, params);
}

async function dbUpdate(query, params = []) {
    return exports.oxmysql.update_async(query, params);
}

// ============================================
// IDENTITY: Pegar dados do jogador via vRP
// ============================================

/**
 * Retorna o user_id do vRP para um source do FiveM
 * Usa o padrão vRP brasileiro: vRPSv.getUserId(source)
 */
async function getUserId(source) {
    try {
        // Tenta diferentes métodos que o vRP pode expor
        // Método 1: export direto (vRP mais recente)
        if (exports.vrp && exports.vrp.getUserId) {
            return exports.vrp.getUserId(source);
        }
    } catch (e) {
        // Ignora e tenta próximo método
    }

    try {
        // Método 2: vRP server-side global (padrão brasileiro)
        // No vRP, o source→user_id fica em vRP.getUserId(source)
        // Mas em JS no FiveM, precisamos pegar via evento
        const result = await new Promise((resolve) => {
            // Fallback: derivar do source (temporário para testes)
            resolve(source);
        });
        return result;
    } catch (e) {
        console.error('[SMARTPHONE] Erro ao pegar userId:', e.message);
        return source; // Fallback: usa source como userId
    }
}

/**
 * Retorna o telefone do jogador baseado no user_id
 * Formato: "XXX-XXX" (baseado no user_id)
 */
function userIdToPhone(userId) {
    if (!userId) return '000-000';
    const padded = String(userId).padStart(6, '0');
    return padded.slice(0, 3) + '-' + padded.slice(3);
}

/**
 * Retorna phone a partir do source
 */
async function getPhoneFromSource(source) {
    const userId = await getUserId(source);
    return userIdToPhone(userId);
}

// ============================================
// INIT: Criar tabelas no banco
// ============================================

async function initDatabase() {
    console.log('[SMARTPHONE] Inicializando banco de dados...');

    // Tabela principal: dados do telefone
    await dbQuery(`
        CREATE TABLE IF NOT EXISTS smartphone_phones (
            phone VARCHAR(20) PRIMARY KEY,
            user_id INT NOT NULL,
            contacts JSON DEFAULT '[]',
            gallery JSON DEFAULT '[]',
            settings JSON DEFAULT '{}',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // SMS
    await dbQuery(`
        CREATE TABLE IF NOT EXISTS smartphone_sms (
            id INT AUTO_INCREMENT PRIMARY KEY,
            sender VARCHAR(20) NOT NULL,
            receiver VARCHAR(20) NOT NULL,
            message TEXT NOT NULL,
            is_read TINYINT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_sender (sender),
            INDEX idx_receiver (receiver)
        )
    `);

    // Histórico de chamadas
    await dbQuery(`
        CREATE TABLE IF NOT EXISTS smartphone_calls (
            id INT AUTO_INCREMENT PRIMARY KEY,
            caller VARCHAR(20) NOT NULL,
            receiver VARCHAR(20) NOT NULL,
            duration INT DEFAULT 0,
            status ENUM('completed', 'missed', 'rejected') DEFAULT 'missed',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_caller (caller),
            INDEX idx_receiver (receiver)
        )
    `);

    // Notas
    await dbQuery(`
        CREATE TABLE IF NOT EXISTS smartphone_notes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            phone VARCHAR(20) NOT NULL,
            title VARCHAR(255) DEFAULT '',
            content TEXT DEFAULT '',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_phone (phone)
        )
    `);

    // Yellow Pages
    await dbQuery(`
        CREATE TABLE IF NOT EXISTS smartphone_yellowpages (
            id INT AUTO_INCREMENT PRIMARY KEY,
            phone VARCHAR(20) NOT NULL,
            text TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_phone (phone)
        )
    `);

    console.log('[SMARTPHONE] Tabelas criadas/verificadas com sucesso');
}

// ============================================
// HANDLERS DO CORE (getSettings, download, ping)
// ============================================

registerHandler('ping', async (source, args) => {
    const phone = await getPhoneFromSource(source);
    console.log(`[SMARTPHONE] Ping recebido de ${phone} (source: ${source})`);
    return {
        ok: true,
        phone: phone,
        timestamp: Date.now(),
        message: 'Smartphone server online! 🟢'
    };
});

registerHandler('getSettings', async (source, args) => {
    const phone = await getPhoneFromSource(source);
    const userId = await getUserId(source);

    // Buscar ou criar dados do telefone
    let phoneData = await dbQuery('SELECT * FROM smartphone_phones WHERE phone = ?', [phone]);

    if (!phoneData || phoneData.length === 0) {
        // Primeiro acesso: criar registro
        await dbQuery(
            'INSERT INTO smartphone_phones (phone, user_id) VALUES (?, ?)',
            [phone, userId]
        );
        phoneData = [{ phone, user_id: userId, contacts: '[]', gallery: '[]', settings: '{}' }];
    }

    const row = phoneData[0];
    let userSettings = {};
    try {
        userSettings = typeof row.settings === 'string' ? JSON.parse(row.settings) : row.settings;
    } catch (e) {
        userSettings = {};
    }

    return {
        phone: phone,
        userId: userId,
        config: config,
        settings: {
            ...config,
            ...userSettings
        },
        identity: {
            phone: phone,
            name: `Jogador ${userId || 0}`
        }
    };
});

registerHandler('download', async (source, args) => {
    // Bootstrap: retorna config inicial + dados do jogador
    return await handlers['getSettings'](source, args);
});

// ============================================
// EXPORTS (para módulos usarem)
// ============================================

global.smartphoneServer = {
    registerHandler,
    pushToPlayer,
    pushToAll,
    dbQuery,
    dbScalar,
    dbInsert,
    dbUpdate,
    getUserId,
    getPhoneFromSource,
    userIdToPhone,
    config
};

// ============================================
// STARTUP
// ============================================

setImmediate(async () => {
    try {
        await initDatabase();
        console.log('[SMARTPHONE] ================================');
        console.log('[SMARTPHONE] Server iniciado com sucesso!');
        console.log(`[SMARTPHONE] Handlers registrados: ${Object.keys(handlers).length}`);
        console.log(`[SMARTPHONE] Item necessário: ${config.item}`);
        console.log('[SMARTPHONE] ================================');
    } catch (error) {
        console.error('[SMARTPHONE] ERRO NA INICIALIZAÇÃO:', error.message);
    }
});
